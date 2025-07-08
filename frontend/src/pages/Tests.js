import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tests = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/tests");
        if (!res.ok) throw new Error("Неуспешно зареждане.");
        const data = await res.json();
        setTests(data);
      } catch (err) {
        setError("Грешка при зареждането на тестовете.");
      }
    };
    fetchTests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете теста?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/delete-test/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setTests(tests.filter((t) => t.id !== id));
      } else {
        alert(data.error || "Грешка при изтриване.");
      }
    } catch (err) {
      alert("Грешка при връзката със сървъра.");
    }
  };

  if (error) {
    return <div style={styles.container}><p style={styles.error}>{error}</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📘 Всички тестове</h2>
      {tests.length === 0 ? (
        <p style={styles.info}>Няма налични тестове.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tests.map((t) => (
            <li key={t.id} style={styles.card}>
              <h3 style={styles.testTitle}>{t.title}</h3>
              <p style={{ margin: "4px 0", fontSize: "15px" }}>
                🕒 Време: <strong>{t.time_limit}</strong> минути
              </p>
              <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
                  <button style={styles.button} onClick={() => navigate(`/solve/${t.id}`)}>
                    Реши теста
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 🎨 Стиловете
const styles = {
  container: {
    maxWidth: "880px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "30px",
    color: "#2c3e50",
    marginBottom: "25px",
  },
  card: {
    backgroundColor: "#f0f7ff",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.07)",
    borderLeft: "6px solid #2c357d",
  },
  testTitle: {
    fontSize: "20px",
    color: "#1e90ff",
    marginBottom: "8px",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
  info: {
    fontSize: "16px",
    textAlign: "center",
  },
};

export default Tests;
