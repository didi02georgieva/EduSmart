// 📄 EditQuestion.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditQuestion = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [correctAnswerIds, setCorrectAnswerIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/question/${questionId}`);
        const data = await res.json();
        setQuestion(data);
        setAnswers(data.options || []);
        setCorrectAnswerIds(data.correct_ids || []);
      } catch {
        setError("Грешка при зареждане на въпроса.");
      }
    };
    fetchData();
  }, [questionId]);

  const handleAnswerChange = (index, newText) => {
    const updated = [...answers];
    updated[index].text = newText;
    setAnswers(updated);
  };

  const toggleCorrect = (id) => {
    if (question.question_type === "single") {
      setCorrectAnswerIds([id]);
    } else {
      setCorrectAnswerIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      text: question.text,
      expected_answer: question.expected_answer || "",
      answers: answers.map((a) => ({ id: a.id, text: a.text })),
      correct_ids: correctAnswerIds
    };

    const res = await fetch(`http://127.0.0.1:8000/api/update-question/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Успешно запазено!");
      setTimeout(() => navigate(-1), 1000);
    } else {
      setError(data.error || "Грешка при запазване.");
    }
  };

  if (error) return <div style={styles.container}><p style={{ color: "red" }}>{error}</p></div>;
  if (!question) return <div style={styles.container}><p>Зареждане...</p></div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Редактирай въпроса</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          style={styles.input}
          value={question.text}
          onChange={(e) => setQuestion({ ...question, text: e.target.value })}
        />
        {answers.map((a, i) => (
          <div key={a.id} style={styles.optionRow}>
            <input
              type="checkbox"
              checked={correctAnswerIds.includes(a.id)}
              onChange={() => toggleCorrect(a.id)}
              style={{ marginRight: "10px" }}
            />
            <input
              style={styles.optionInput}
              value={a.text}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
            />
          </div>
        ))}
        {question.question_type === "open_ended" && (
          <textarea
            style={styles.input}
            value={question.expected_answer || ""}
            onChange={(e) => setQuestion({ ...question, expected_answer: e.target.value })}
            placeholder="Очакван отговор"
          />
        )}
        <button type="submit" style={styles.button}>Запази промените</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  optionInput: {
    flexGrow: 1,
    padding: "8px",
    fontSize: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default EditQuestion;
