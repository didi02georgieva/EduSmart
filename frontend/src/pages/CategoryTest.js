// 📁 pages/CategoryTest.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CategoryTest = ({ user }) => {
  const { category } = useParams();
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/tests?category=${category}`);
        const data = await res.json();
        setTests(data);
      } catch {
        setError("Грешка при зареждане на тестовете.");
      }
    };
    fetchTests();
  }, [category]);

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете теста?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/delete-test/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTests(tests.filter((t) => t.id !== id));
      } else {
        alert("Грешка при изтриване.");
      }
    } catch {
      alert("Възникна грешка при връзката със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🗂️ Тестове по категория: {category}</h2>
      {error && <p style={styles.error}>{error}</p>}
      {tests.length === 0 ? (
        <p style={styles.info}>Няма тестове в тази категория.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tests.map((t) => (
            <li key={t.id} style={styles.card}>
              <h3 style={styles.testTitle}>{t.title}</h3>
              <p>{t.description}</p>
              <p>⏱ {t.time_limit} минути</p>

              <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {user?.role === "teacher" ? (
                  <>
                    <button style={styles.button} onClick={() => navigate(`/preview-test/${t.id}`)}>Виж теста</button>
                    <button style={styles.button} onClick={() => navigate(`/add-question/${t.id}`)}>Добави въпрос</button>
                    <button style={styles.button} onClick={() => navigate(`/grant-access/${t.id}`)}>Дай достъп</button>
                    <button style={styles.button} onClick={() => navigate(`/statistics/${t.id}`)}>Статистика</button>
                    <button
                      style={{ ...styles.button, backgroundColor: "#e74c3c" }}
                      onClick={() => handleDelete(t.id)}
                    >
                      Изтрий тест
                    </button>
                  </>
                ) : (
                  <button style={styles.button} onClick={() => navigate(`/solve/${t.id}`)}>Реши теста</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "860px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "26px",
    marginBottom: "20px",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#f0f7ff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "16px",
    borderLeft: "6px solid #2c357d",
  },
  testTitle: {
    fontSize: "20px",
    color: "#1e90ff",
    marginBottom: "4px",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  info: {
    fontStyle: "italic",
    color: "#555",
  },
};

export default CategoryTest;
