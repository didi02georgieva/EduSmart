import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PreviewTest = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/tests");
        const data = await res.json();
        const found = data.find((t) => t.id === parseInt(testId));
        setTest(found);
      } catch {
        setError("Грешка при зареждане на теста.");
      }
    };

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/test-questions/${testId}`);
        const data = await res.json();
        setQuestions(data || []);
      } catch {
        setError("Грешка при зареждане на въпросите.");
      }
    };

    fetchTest();
    fetchQuestions();
  }, [testId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете този въпрос?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/delete-question/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert(data.error || "Грешка при изтриване.");
      }
    } catch {
      alert("Грешка при връзката със сървъра.");
    }
  };

  if (error) return <div style={styles.container}><p style={{ color: "red" }}>{error}</p></div>;
  if (!test) return <div style={styles.container}><p>Зареждане...</p></div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{test.title}</h2>
      <p style={{ fontStyle: "italic", color: "#666" }}>{test.description}</p>
      <p>🕒 Време за решаване: {test.time_limit} минути</p>

      <h3 style={{ marginTop: "20px", color: "#2c3e50" }}>Добавени въпроси:</h3>
      {questions.length === 0 ? (
        <p>Няма добавени въпроси.</p>
      ) : (
        <ul>
          {questions.map((q, i) => (
            <li key={q.id} style={styles.card}>
              <strong>Въпрос {i + 1}:</strong> {q.text}
              <div>Тип: {q.question_type === "open_ended" ? "Отворен" : "Затворен"}</div>
              {q.options && (
                <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                  {q.options.map((opt) => (
                    <li key={opt.id}>– {opt.text}</li>
                  ))}
                </ul>
              )}

              <button
                style={styles.editBtn}
                onClick={() => navigate(`/edit-question/${q.id}`)}
              >
                ✏️ Редактирай въпроса
              </button>

              <button
                style={{ ...styles.editBtn, backgroundColor: "#e74c3c", marginLeft: "10px" }}
                onClick={() => handleDelete(q.id)}
              >
                🗑️ Изтрий въпроса
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "850px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "26px",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  card: {
    backgroundColor: "#f4f9ff",
    padding: "14px",
    marginTop: "12px",
    borderRadius: "8px",
    borderLeft: "5px solid #3498db",
  },
  editBtn: {
    marginTop: "10px",
    padding: "6px 12px",
    backgroundColor: "#1e90ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default PreviewTest;
