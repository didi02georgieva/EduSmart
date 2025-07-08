import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyResults = ({ user }) => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/my-results?user_id=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setResults(data);
        } else {
          setError("Грешка при зареждане на резултатите.");
        }
      } catch (err) {
        setError("Неуспешно свързване със сървъра.");
      }
    };

    fetchResults();
  }, [user]);

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Моите резултати</h2>
      {results.length === 0 ? (
        <p style={styles.info}>Все още нямате решени тестове.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {results.map((r) => (
            <li key={r.result_id} style={styles.card}>
              <h3 style={styles.testTitle}>{r.test_title}</h3>
              <p style={styles.score}>🔢 Резултат: <strong>{r.score}</strong> точки</p>
              <button
                style={styles.button}
                onClick={() => navigate(`/result/${r.result_id}`)}
              >
                Детайли
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
    borderLeft: "6px solid #3498db",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.07)",
  },
  testTitle: {
    fontSize: "20px",
    color: "#1e90ff",
    marginBottom: "8px",
  },
  score: {
    fontSize: "16px",
    marginBottom: "12px",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    fontSize: "15px",
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

export default MyResults;
