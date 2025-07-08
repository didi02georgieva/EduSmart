import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const AddQuestion = () => {
  const { testId } = useParams();
  const [questionText, setQuestionText] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [questionType, setQuestionType] = useState("open_ended");
  const [answers, setAnswers] = useState(["", "", ""]);
  const [correct, setCorrect] = useState([]);
  const [message, setMessage] = useState("");
  const [testTitle, setTestTitle] = useState(""); // 🆕

  useEffect(() => {
    const fetchTestTitle = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/test/${testId}`);
        const data = await res.json();
        if (res.ok) {
          setTestTitle(data.title);
        } else {
          setTestTitle(`№${testId}`);
        }
      } catch {
        setTestTitle(`№${testId}`);
      }
    };
    fetchTestTitle();
  }, [testId]);

  const handleAnswerChange = (value, index) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);

    if (correct.includes(answers[index])) {
      const updatedCorrect = correct.map((c) =>
        c === answers[index] ? value : c
      );
      setCorrect(updatedCorrect);
    }
  };

  const handleCorrectChange = (checked, value) => {
    if (checked) {
      setCorrect([...correct, value]);
    } else {
      setCorrect(correct.filter((c) => c !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("question_text", questionText);
    form.append("question_type", questionType);

    if (questionType === "open_ended") {
      form.append("expected_answer", expectedAnswer);
    } else {
      correct.forEach((c) => form.append("correct_answers", c));
      answers.forEach((a, i) => form.append(`answer${i + 1}`, a));
    }

    const res = await fetch(`http://127.0.0.1:8000/add-questions/${testId}`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setMessage(data.message);
    setQuestionText("");
    setExpectedAnswer("");
    setAnswers(["", "", ""]);
    setCorrect([]);
    setQuestionType("open_ended");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        ➕ Добави въпрос към тест: {testTitle}
      </h2>
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Текст на въпроса"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={styles.input}
          required
        />

        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          style={styles.input}
        >
          <option value="open_ended">Отворен отговор</option>
          <option value="single">Един верен отговор</option>
          <option value="multiple_choice">Множествен избор</option>
        </select>

        {questionType === "open_ended" && (
          <textarea
            placeholder="Очакван отговор"
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            style={styles.input}
            required
          />
        )}

        {(questionType === "single" || questionType === "multiple_choice") &&
          answers.map((ans, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder={`Вариант ${index + 1}`}
                value={ans}
                onChange={(e) => handleAnswerChange(e.target.value, index)}
                style={styles.input}
              />
              <label style={{ marginLeft: "10px" }}>
                <input
                  type={questionType === "single" ? "radio" : "checkbox"}
                  name="correct"
                  value={ans}
                  checked={correct.includes(ans)}
                  onChange={(e) => handleCorrectChange(e.target.checked, ans)}
                />
                {" "}Правилен
              </label>
            </div>
          ))}

        <button type="submit" style={styles.button}>Добави въпрос</button>
      </form>
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
    marginBottom: "20px",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  success: {
    color: "green",
    marginBottom: "16px",
    fontWeight: "bold",
  },
};

export default AddQuestion;
