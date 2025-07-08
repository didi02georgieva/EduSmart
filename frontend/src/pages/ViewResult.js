import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/result-details/${resultId}`);
        const data = await res.json();
        if (res.ok) {
          setResult(data);
        } else {
          setError(data.error || "Грешка при зареждане на резултата.");
        }
      } catch (err) {
        setError("Грешка при свързване със сървъра.");
      }
    };

    fetchResult();
  }, [resultId]);

  const downloadPdf = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/generate-pdf/${resultId}`);
      if (!response.ok) throw new Error("Грешка при сваляне на PDF файла.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${resultId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Възникна грешка при свалянето на PDF файла.");
    }
  };

  if (error) {
    return <div style={styles.container}><p style={styles.error}>{error}</p></div>;
  }

  if (!result) {
    return <div style={styles.container}><p style={styles.info}>Зареждане...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{result.test.title}</h2>
      <p style={styles.score}>
        ✅ Получен резултат: <strong>{result.score}</strong>
      </p>

      <button onClick={downloadPdf} style={styles.button}>
        📄 Свали PDF отчет
      </button>

      {result.questions.map((q, index) => (
        <div
          key={q.id}
          style={{
            ...styles.card,
            borderLeft: q.isCorrect ? "6px solid green" : "6px solid red",
          }}
        >
          <p style={styles.question}>Въпрос {index + 1}: {q.text}</p>

          <p><strong>Ваш отговор:</strong> {Array.isArray(q.user_answer) ? q.user_answer.join(", ") : q.user_answer}</p>

          {q.type === "open_ended" && (
            <p><strong>Очакван отговор:</strong> {q.expected_answer || "няма зададен"}</p>
          )}

          {q.type !== "open_ended" && (
            <p>
              <strong>Верни отговори:</strong>{" "}
              {q.expected_answer || "няма зададени"}
            </p>
          )}

          {q.answers.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong>Опции:</strong>
              <ul style={styles.optionList}>
                {q.answers.map((a) => (
                  <li
                    key={a.id}
                    style={{
                      color: a.is_correct ? "green" : "#333",
                      fontWeight: a.is_selected ? "bold" : "normal",
                    }}
                  >
                    {a.text}
                    {a.is_correct ? " ✔" : ""}
                    {a.is_selected ? " (избран)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
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
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.07)",
  },
  question: {
    fontWeight: "bold",
    marginBottom: "10px",
  },
  optionList: {
    paddingLeft: "20px",
  },
  score: {
    fontSize: "18px",
    color: "#1e90ff",
    marginBottom: "25px",
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
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "30px",
  },
};

export default ViewResult;
