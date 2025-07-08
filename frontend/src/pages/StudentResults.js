// 📁 pages/StudentResults.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentResults = () => {
  const { studentId } = useParams();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/my-results?user_id=${studentId}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Грешка при зареждане на резултатите");
      }
    };

    fetchResults();
  }, [studentId]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 Резултати на студент</h2>
      {results.length === 0 ? (
        <p>❗ Няма налични резултати.</p>
      ) : (
        <ul>
          {results.map((r) => (
            <li key={r.result_id} style={styles.item}>
              🧪 <strong>{r.test_title}</strong> – {r.score} точки
              <button
                style={styles.button}
                onClick={() => navigate(`/result/${r.result_id}`)}
              >
                Виж детайли
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
    maxWidth: "700px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#f9f9ff",
    borderRadius: "10px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "25px",
    color: "#2c357d",
  },
  item: {
    marginBottom: "12px",
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default StudentResults;
