from fastapi import FastAPI, Request, Form, Query, Body, Depends, HTTPException
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from database import SessionLocal, engine, get_db
import models, schemas, crud
import json
import os
import pytz
from fpdf import FPDF
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from datetime import datetime

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from models import Result, User, Test, Question, Answer

models.Base.metadata.create_all(bind=engine)
from datetime import timezone
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    secret_question: str = Form(...),
    secret_answer: str = Form(...)
):
    db = SessionLocal()
    existing = crud.get_user_by_email(db, email=email)
    if existing:
        db.close()
        return JSONResponse(status_code=400, content={"error": "Имейлът вече съществува."})

    user = models.User(
        name=name.strip(),
        email=email.strip(),
        password=hash_password(password.strip()),
        role=role,
        secret_question=secret_question.strip(),
        secret_answer=secret_answer.strip()
    )
    db.add(user)
    db.commit()
    db.close()
    return {"message": "Регистрацията е успешна."}



@app.post("/login")
async def login_user(email: str = Form(...), password: str = Form(...)):
    db = SessionLocal()
    user = crud.get_user_by_email(db, email=email.strip())
    db.close()
    if not user or not verify_password(password.strip(), user.password):
        return JSONResponse(content={"error": "Невалиден имейл или парола"}, status_code=401)
    return {
        "message": "Успешен вход",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role
        }
    }


@app.post("/create-test")
async def create_test(
    title: str = Form(...),
    description: str = Form(""),
    creator_id: int = Form(...),
    time_limit: int = Form(5),
    category: str = Form("Общи")  
):
    db = SessionLocal()

    test_data = schemas.TestCreate(
        title=title,
        description=description,
        creator_id=creator_id,
        time_limit=time_limit,
        category=category  
    )

    new_test = crud.create_test(db, test_data)
    db.close()

    return {
        "message": "Тестът е създаден успешно.",
        "test_id": new_test.id
    }


@app.get("/tests", response_model=List[schemas.TestOut])
def get_tests(category: str = Query(None)):
    db = SessionLocal()
    if category:
        tests = db.query(models.Test).filter(models.Test.category == category).all()
    else:
        tests = db.query(models.Test).all()
    db.close()
    return tests

@app.get("/api/students")
def get_all_students():
    db = SessionLocal()
    students = db.query(models.User).filter(models.User.role == "student").all()
    result = [{"id": s.id, "name": s.name, "email": s.email} for s in students]
    db.close()
    return result

@app.delete("/delete-test/{test_id}")
def delete_test(test_id: int):
    db = SessionLocal()

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        db.close()
        return {"error": "Тестът не е намерен."}

    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    for q in questions:
        db.query(models.Answer).filter(models.Answer.question_id == q.id).delete()

    db.query(models.Question).filter(models.Question.test_id == test_id).delete()

    db.query(models.Result).filter(models.Result.test_id == test_id).delete()

    db.query(models.TestAccess).filter(models.TestAccess.test_id == test_id).delete()

    db.delete(test)

    db.commit()
    db.close()

    return {"message": "Тестът и всички свързани данни бяха изтрити успешно."}


@app.post("/add-questions/{test_id}")
async def add_question(request: Request, test_id: int):
    form = await request.form()
    question_text = form.get("question_text")
    question_type = form.get("question_type")
    correct_answers = form.getlist("correct_answers")
    expected_answer = form.get("expected_answer")  
    answers = [form.get("answer1"), form.get("answer2"), form.get("answer3")]

    db = SessionLocal()

    question = models.Question(
        text=question_text,
        question_type=question_type,
        expected_answer=expected_answer if question_type == "open_ended" else None,
        correct_answer=",".join(correct_answers) if question_type in ["single", "multiple_choice"] else None,
        test_id=test_id
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    if question_type in ["single", "multiple_choice"]:
        for answer in answers:
            if answer:
                is_correct = answer.strip() in correct_answers
                db.add(models.Answer(
                    answer_text=answer.strip(),
                    question_id=question.id,
                    score=1.0 if is_correct else 0.0
                ))

    db.commit()
    db.close()
    return {"message": "Въпросът е добавен успешно!"}



@app.post("/submit-answers")
async def submit_answers(request: Request):
    form = await request.form()
    test_id = int(form.get("test_id"))
    user_id = int(form.get("user_id"))

    db = SessionLocal()
    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    answers = db.query(models.Answer).filter(models.Answer.question_id.in_([q.id for q in questions])).all()

    correct = 0
    total = 0  
    selected_dict = {}
    detailed_result = []

    for q in questions:
        q_key = f"q{q.id}"
        selected = form.getlist(q_key)
        selected_dict[str(q.id)] = selected

        student_answer = ""
        question_score = 0
        max_score = 1  

        if q.question_type == "multiple_choice":
            correct_ids = {str(a.id) for a in answers if a.question_id == q.id and a.score == 1.0}
            matched = set(selected).intersection(correct_ids)
            question_score = len(matched)
            max_score = len(correct_ids)   
            student_answer = ", ".join([
                a.answer_text for a in answers if str(a.id) in selected
            ])
        elif q.question_type == "single":
            correct_ids = {str(a.id) for a in answers if a.question_id == q.id and a.score == 1.0}
            if selected and selected[0] in correct_ids:
                question_score = 1
            student_answer = next(
                (a.answer_text for a in answers if str(a.id) == selected[0]), ""
            ) if selected else ""
        elif q.question_type == "open_ended":
            student_answer = selected[0] if selected else ""
            correct_answer_text = q.expected_answer or ""
            if student_answer.strip().lower() == correct_answer_text.strip().lower():
                question_score = 1

        correct += question_score
        total += max_score

        detailed_result.append({
            "question_text": q.text,
            "student_answer": student_answer,
            "correct_answer": (
                q.expected_answer if q.question_type == "open_ended" else
            ", ".join([a.answer_text for a in answers if a.question_id == q.id and a.score == 1.0])
        ),
            "isCorrect": question_score > 0
        })


    result = models.Result(
        user_id=user_id,
        test_id=test_id,
        score=correct,
        selected_answers=json.dumps(selected_dict)
    )
    db.add(result)
    db.commit()
    db.close()

    return {
        "score": correct,
        "total": total,
        "details": detailed_result
    }


@app.get("/api/solve/{test_id}")
def api_solve_test(test_id: int, user_id: int = Query(...)):
    db = SessionLocal()
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:    
        db.close()
        return JSONResponse(status_code=404, content={"error": "Тестът не е намерен."})

    access = db.query(models.TestAccess).filter_by(test_id=test_id, user_id=user_id).first()
    if not access:
        db.close()
        return JSONResponse(status_code=403, content={"error": "Нямате достъп до този тест."})

    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    db.close()

    question_data = []
    for q in questions:
        q_data = {
            "id": q.id,
            "text": q.text,
            "question_type": q.question_type
        }

        if q.question_type in ["single", "multiple_choice"]:
            options = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
            q_data["options"] = [{"id": a.id, "text": a.answer_text} for a in options]

        question_data.append(q_data)

    return {
        "test": {
            "id": test.id,
            "title": test.title,
            "description": test.description,
            "time_limit": test.time_limit
        },
        "questions": question_data
    }


@app.post("/api/grant-access")
async def grant_access(request: Request):
    form = await request.form()
    test_id = int(form.get("test_id"))
    student_ids = form.getlist("student_ids")

    db = SessionLocal()
    try:
        db.query(models.TestAccess).filter(models.TestAccess.test_id == test_id).delete()
        for sid in student_ids:
            db.add(models.TestAccess(test_id=test_id, user_id=int(sid)))
        db.commit()
        return {"message": "Достъпът е обновен успешно!"}
    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"error": f"Грешка при запазване: {str(e)}"})
    finally:
        db.close()

@app.get("/api/my-results")
def get_user_results(user_id: int):
    db = SessionLocal()
    results = db.query(models.Result).filter(models.Result.user_id == user_id).all()
    data = []

    for r in results:
        test = db.query(models.Test).filter(models.Test.id == r.test_id).first()
        if test:  
            data.append({
                "result_id": r.id,
                "test_title": test.title,
                "score": r.score,
                "test_id": r.test_id
            })

    db.close()
    return data


@app.get("/api/result-details/{result_id}")
def get_result_details(result_id: int):
    db = SessionLocal()
    result = db.query(models.Result).filter(models.Result.id == result_id).first()

    if not result:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Резултатът не е намерен или е изтрит."})

    test = db.query(models.Test).filter(models.Test.id == result.test_id).first()
    if not test:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Тестът не е намерен."})

    questions = db.query(models.Question).filter(models.Question.test_id == test.id).all()
    answers = db.query(models.Answer).all()

    result_data = {
        "test": {"id": test.id, "title": test.title},
        "score": result.score,
        "questions": [],
    }

    selected_answers = json.loads(result.selected_answers or "{}")

    for q in questions:
        q_data = {
            "id": q.id,
            "text": q.text,
            "type": q.question_type,
            "user_answer": "Не е въведен",
            "expected_answer": None,
            "isCorrect": False,
            "answers": [],
        }

        selected_ids = selected_answers.get(str(q.id), [])
        if isinstance(selected_ids, str):
            selected_ids = [selected_ids]

        if q.question_type == "open_ended":
            student_ans = selected_ids[0] if selected_ids else ""
            q_data["user_answer"] = student_ans
            q_data["expected_answer"] = q.expected_answer if q.expected_answer else "няма зададен"
            q_data["isCorrect"] = student_ans.strip().lower() == (q.expected_answer or "").strip().lower()

        elif q.question_type in ["single", "multiple_choice"]:
            q_opts = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()

            correct_ids = {str(a.id) for a in q_opts if a.score == 1.0}
            selected_set = set(selected_ids)
            q_data["isCorrect"] = selected_set == correct_ids

            q_data["user_answer"] = ", ".join(
                a.answer_text for a in q_opts if str(a.id) in selected_ids
            ) or "Не е избран отговор"

            q_data["expected_answer"] = ", ".join(
                a.answer_text for a in q_opts if a.score == 1.0
            ) or "-"

            for a in q_opts:
                q_data["answers"].append({
                    "id": a.id,
                    "text": a.answer_text,
                    "is_correct": a.score == 1.0,
                    "is_selected": str(a.id) in selected_ids
                })

        result_data["questions"].append(q_data)

    db.close()
    return result_data



@app.get("/api/statistics/{test_id}")
def get_test_statistics(test_id: int):
    def to_grade(score: float):
        if score < 2.5:
            return "Слаб 2"
        elif score < 3.5:
            return "Среден 3"
        elif score < 4.5:
            return "Добър 4"
        elif score < 5.5:
            return "Много добър 5"
        else:
            return "Отличен 6"

    db = SessionLocal()
    results = db.query(models.Result).filter(models.Result.test_id == test_id).all()
    users = db.query(models.User).all()
    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()

    if not results or not questions:
        db.close()
        return {"error": "Няма резултати или въпроси за този тест."}

    max_total_points = 0
    for q in questions:
        if q.question_type == "multiple_choice":
            correct_count = db.query(models.Answer).filter(
                models.Answer.question_id == q.id, models.Answer.score == 1.0
            ).count()
            max_total_points += correct_count
        else:
            max_total_points += 1

    scores_by_user = {}
    user_names = {}
    total_raw_scores = []

    for r in results:
        scores_by_user.setdefault(r.user_id, []).append(r.score)
        total_raw_scores.append(r.score)

    for u in users:
        user_names[u.id] = u.name

    participant_stats = []
    evaluated_scores = []

    for uid, raw_scores in scores_by_user.items():
        raw_avg = sum(raw_scores) / len(raw_scores)
        grade = 2 + (raw_avg / max_total_points) * 4
        participant_stats.append({
            "user_id": uid,
            "name": user_names.get(uid, f"Потребител {uid}"),
            "average_score": round(raw_avg, 2),
            "grade": to_grade(grade)
        })
        evaluated_scores.append(grade)

    total_attempts = len(results)
    total_score_avg = sum(total_raw_scores) / total_attempts if total_attempts else 0
    avg_grade = sum(evaluated_scores) / len(evaluated_scores)

    success_rate = (total_score_avg / max_total_points) * 100

    db.close()

    return {
        "test_id": test_id,
        "total_attempts": total_attempts,
        "success_rate": round(success_rate, 2),
        "average_score": round(total_score_avg, 2),
        "average_grade": to_grade(avg_grade),
        "participant_stats": participant_stats
    }


@app.get("/api/test-questions/{test_id}")
def get_test_questions(test_id: int):
    db = SessionLocal()
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Тестът не е намерен."})

    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    result = []

    for q in questions:
        q_data = {
            "id": q.id,
            "text": q.text,
            "question_type": q.question_type
        }

        if q.question_type in ["single", "multiple_choice"]:
            answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
            q_data["options"] = [{"id": a.id, "text": a.answer_text} for a in answers]

        result.append(q_data)

    db.close()
    return result

@app.get("/api/question/{question_id}")
def get_question(question_id: int):
    db = SessionLocal()
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Въпросът не е намерен."})

    result = {
        "id": question.id,
        "text": question.text,
        "question_type": question.question_type,
        "expected_answer": question.expected_answer,
    }

    if question.question_type in ["single", "multiple_choice"]:
        answers = db.query(models.Answer).filter(models.Answer.question_id == question.id).all()
        result["options"] = [{"id": a.id, "text": a.answer_text} for a in answers]
        result["correct_ids"] = [a.id for a in answers if a.score == 1.0]

    db.close()
    return result



@app.put("/api/update-question/{question_id}")
async def update_question(question_id: int, payload: dict = Body(...)):
    db = SessionLocal()
    question = db.query(models.Question).filter(models.Question.id == question_id).first()

    if not question:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Въпросът не е намерен."})

    question.text = payload.get("text", question.text)

    if question.question_type == "open_ended":
        question.expected_answer = payload.get("expected_answer", question.expected_answer)

    if question.question_type in ["single", "multiple_choice"]:
        answers_data = payload.get("answers", [])
        correct_ids = payload.get("correct_ids", [])

        for a in answers_data:
            db_answer = db.query(models.Answer).filter(models.Answer.id == a["id"]).first()
            if db_answer:
                db_answer.answer_text = a["text"]
                db_answer.score = 1.0 if db_answer.id in correct_ids else 0.0

    db.commit()
    db.close()
    return {"message": "Въпросът е обновен успешно!"}

@app.delete("/api/delete-question/{question_id}")
def delete_question(question_id: int):
    db = SessionLocal()
    question = db.query(models.Question).filter(models.Question.id == question_id).first()

    if not question:
        db.close()
        return JSONResponse(status_code=404, content={"error": "Въпросът не е намерен."})

    db.query(models.Answer).filter(models.Answer.question_id == question_id).delete()

    db.delete(question)
    db.commit()
    db.close()
    return {"message": "Въпросът е изтрит успешно."}


class PDF(FPDF):
    def header(self):
        self.set_font("ArialUnicode", "", 14)
        self.cell(0, 10, "Отчет за резултат от тест", 0, 1, "C")

class PDF(FPDF):
    def header(self):
        self.set_font("DejaVu", "", 14)
        self.cell(0, 10, "Отчет за резултат от тест", 0, 1, "C")


@app.get("/api/generate-pdf/{result_id}")
def generate_pdf(result_id: int, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Резултатът не е намерен")

    user = db.query(User).filter(User.id == result.user_id).first()
    test = db.query(Test).filter(Test.id == result.test_id).first()
    questions = db.query(Question).filter(Question.test_id == test.id).all()
    all_answers = db.query(Answer).all()

    font_dir = os.path.join(os.path.dirname(__file__), "fonts")
    font_path = os.path.join(font_dir, "DejaVuSans.ttf")
    if not os.path.exists(font_path):
        raise HTTPException(status_code=500, detail="Шрифтът не е намерен. Увери се, че DejaVuSans.ttf е в папка /fonts")

    pdfmetrics.registerFont(TTFont("DejaVu", font_path))

    file_path = f"report_{result.id}.pdf"
    c = canvas.Canvas(file_path, pagesize=A4)
    c.setFont("DejaVu", 14)

    c.drawString(50, 800, "Отчет за резултат от тест")
    c.setFont("DejaVu", 12)
    c.drawString(50, 770, f"Име на студент: {user.name}")
    c.drawString(50, 750, f"Тест: {test.title}")
    c.drawString(50, 730, f"Резултат: {result.score}")
    sofia_tz = pytz.timezone("Europe/Sofia")
    utc_time = result.timestamp.replace(tzinfo=timezone.utc)
    localized_timestamp = utc_time.astimezone(sofia_tz)

    c.drawString(50, 710, f"Дата: {localized_timestamp.strftime('%d.%m.%Y %H:%M')}")        

    y = 680
    selected_data = json.loads(result.selected_answers or "{}")

    for i, q in enumerate(questions, 1):
        c.setFont("DejaVu", 12)
        c.drawString(50, y, f"Въпрос {i}: {q.text}")
        y -= 20

        selected = selected_data.get(str(q.id), [])
        if isinstance(selected, str):
            selected = [selected]

        if q.question_type in ["single", "multiple_choice"]:
            ids = [int(s) for s in selected if str(s).isdigit()]
            student_answers = [a.answer_text for a in all_answers if a.id in ids]
            student_answer = ", ".join(student_answers) or "Не е избран отговор"

            correct_answers = [a.answer_text for a in all_answers if a.question_id == q.id and a.score == 1.0]
            expected_answer = ", ".join(correct_answers) or "няма зададен"

        elif q.question_type == "open_ended":
            student_answer = selected[0] if selected else "Не е въведен"
            expected_answer = q.expected_answer or "няма зададен"
        else:
            student_answer = "?"
            expected_answer = "?"

        c.drawString(70, y, f"Ваш отговор: {student_answer}")
        y -= 20
        c.drawString(70, y, f"Очакван отговор: {expected_answer}")
        y -= 30

        if y < 100:
            c.showPage()
            c.setFont("DejaVu", 12)
            y = 800

    c.save()
    return FileResponse(path=file_path, filename=file_path, media_type="application/pdf")


from pydantic import BaseModel

class PasswordReset(BaseModel):
    email: str
    new_password: str


@app.post("/get-secret-question")
def get_secret_question(email: str = Form(...)):
    db = SessionLocal()
    user = crud.get_user_by_email(db, email=email)
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="Няма такъв потребител.")
    return {"question": user.secret_question}

@app.post("/reset-password")
def reset_password(
    email: str = Form(...),
    answer: str = Form(...),
    new_password: str = Form(...)
):
    db = SessionLocal()
    user = crud.get_user_by_email(db, email=email)

    if not user or user.secret_answer.strip().lower() != answer.strip().lower():
        db.close()
        raise HTTPException(status_code=400, detail="Грешен отговор на тайния въпрос.")

    user.password = hash_password(new_password.strip())
    db.commit()
    db.close()
    return {"message": "Паролата е успешно променена."}


@app.post("/change-password")
def change_password(
    user_id: int = Form(...),
    current_password: str = Form(...),
    new_password: str = Form(...)
):
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="Потребителят не е намерен.")

    if not verify_password(current_password.strip(), user.password):
        db.close()
        raise HTTPException(status_code=400, detail="Невалидна текуща парола.")

    user.password = hash_password(new_password.strip())
    db.commit()
    db.close()

    return {"message": "Паролата беше успешно променена."}



@app.post("/delete-account")
def delete_account(user_id: int = Form(...)):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="Потребителят не е намерен.")

    db.query(models.Result).filter(models.Result.user_id == user_id).delete()
    db.query(models.TestAccess).filter(models.TestAccess.user_id == user_id).delete()
    db.query(models.Answer).filter(models.Answer.student_id == user_id).delete()

    db.delete(user)
    db.commit()
    db.close()

    return {"message": "Акаунтът е изтрит успешно."}


@app.post("/update-profile")
def update_profile(
    user_id: int = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Потребителят не е намерен.")

    existing_user = db.query(User).filter(User.email == email, User.id != user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Имейлът вече се използва.")

    user.name = name
    user.email = email
    db.commit()
    return {"message": "Профилът беше обновен успешно."}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@app.get("/api/test/{test_id}")
def get_test(test_id: int):
    db = SessionLocal()
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    db.close()
    if not test:
        raise HTTPException(status_code=404, detail="Тестът не е намерен.")
    return {"id": test.id, "title": test.title}
