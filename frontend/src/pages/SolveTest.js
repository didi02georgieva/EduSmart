import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SolveTest = ({ user }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/solve/${testId}?user_id=${user.id}`
        );
        const data = await res.json();

        if (!res.ok || !data.test) {
          setError(data.error || "Нямате достъп до този тест.");
          return;
        }

        setTest(data.test);
        setQuestions(data.questions);
        setTimeLeft(data.test.time_limit * 60);
      } catch (err) {
        setError("Неуспешно зареждане на теста.");
      }
    };

    fetchTest();
  }, [testId, user.id]);

  useEffect(() => {
    if (!timeLeft || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("test_id", testId);
    formData.append("user_id", user.id);

    questions.forEach((q) => {
      const val = answers[q.id];
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(`q${q.id}`, v));
      } else {
        formData.append(`q${q.id}`, val);
      }
    });

    const res = await fetch("http://127.0.0.1:8000/submit-answers", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setSubmitted(true);
  };

  if (error) {
    return (
      <div style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#fff0f0",
        border: "2px solid #ff4d4d",
        borderRadius: "12px",
        textAlign: "center",
        color: "#c0392b",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "22px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>
        🚫 <strong>{error}</strong>
        <br />
        <button
          onClick={() => navigate("/tests")}
          style={{
            marginTop: "20px",
            backgroundColor: "#2c357d",
            color: "white",
            border: "none",
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          ⬅ Назад към тестовете
        </button>
      </div>
    );
  }

  if (!test) return <div style={{ textAlign: "center" }}>Зареждане...</div>;

  return (
    <div className="form-container">
      <h2>{test.title}</h2>
      {!submitted && timeLeft !== null && (
        <div>
          <span role="img" aria-label="timer">
            ⏳
          </span>{" "}
          Оставащо време: <strong>{formatTime(timeLeft)}</strong>
        </div>
      )}

      {!submitted && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {questions.map((q) => (
            <div key={q.id}>
              <p><strong>{q.text}</strong></p>
              {q.question_type === "open_ended" && (
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}
              {q.question_type === "single" &&
                q.options.map((opt) => (
                  <div key={opt.id}>
                    <label>
                      <input
                        type="radio"
                        name={`q${q.id}`}
                        value={opt.id}
                        checked={answers[q.id] === String(opt.id)}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      />
                      {opt.text}
                    </label>
                  </div>
                ))}
              {q.question_type === "multiple_choice" &&
                q.options.map((opt) => (
                  <div key={opt.id}>
                    <label>
                      <input
                        type="checkbox"
                        value={opt.id}
                        checked={answers[q.id]?.includes(opt.id)}
                        onChange={(e) => {
                          const prev = answers[q.id] || [];
                          if (e.target.checked) {
                            handleChange(q.id, [...prev, opt.id]);
                          } else {
                            handleChange(q.id, prev.filter((v) => v !== opt.id));
                          }
                        }}
                      />
                      {opt.text}
                    </label>
                  </div>
                ))}
            </div>
          ))}
          <button type="submit">Изпрати отговорите</button>
        </form>
      )}

      {submitted && result && (
        <div className="results">
          <h3>Резултат: {result.score} / {result.total}</h3>
          {result.details.map((d, index) => (
            <div key={index}>
              <p><strong>Въпрос:</strong> {d.question_text}</p>
              <p><strong>Ваш отговор:</strong> {d.student_answer}</p>
              <p><strong>Очакван отговор:</strong> {d.correct_answer}</p>
              <p><strong>{d.isCorrect ? "✅ Верен" : "❌ Грешен"}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolveTest;
