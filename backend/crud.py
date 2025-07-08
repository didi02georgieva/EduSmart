from sqlalchemy.orm import Session
import models, schemas

# Вземане на потребител по имейл
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# Създаване на потребител
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password,
        is_admin=user.is_admin,
        role=user.role,
        secret_question=user.secret_question,
        secret_answer=user.secret_answer
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Създаване на тест
def create_test(db: Session, test: schemas.TestCreate):
    db_test = models.Test(
        title=test.title,
        description=test.description,
        creator_id=test.creator_id,
        time_limit=test.time_limit,
        category=test.category  # 🟢 Това липсва!
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test


# Вземане на всички тестове
def get_tests(db: Session):
    return db.query(models.Test).all()
