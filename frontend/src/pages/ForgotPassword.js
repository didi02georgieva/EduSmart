import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchQuestion = async () => {
    const form = new FormData();
    form.append("email", email);
    const res = await fetch("http://127.0.0.1:8000/get-secret-question", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      setQuestion(data.question);
      setStage(2);
    } else {
      setError(data.detail || "Потребителят не е намерен.");
    }
  };

  const resetPassword = async () => {
    const form = new FormData();
    form.append("email", email);
    form.append("answer", answer);
    form.append("new_password", newPassword);

    const res = await fetch("http://127.0.0.1:8000/reset-password", { method: "POST", body: form });
    const data = await res.json();

    if (res.ok) {
      setMessage("Паролата е променена успешно.");
      setStage(3);
    } else {
      setError(data.detail || "Грешен отговор.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔑 Забравена парола</h2>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {stage === 1 && (
        <>
          <input type="email" placeholder="Имейл" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          <button onClick={fetchQuestion} style={styles.button}>Продължи</button>
        </>
      )}

      {stage === 2 && (
        <>
          <p style={styles.label}><strong>Въпрос:</strong> {question}</p>
          <input type="text" placeholder="Отговор" value={answer} onChange={(e) => setAnswer(e.target.value)} style={styles.input} />
          <input type="password" placeholder="Нова парола" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.input} />
          <button onClick={resetPassword} style={styles.button}>Промени паролата</button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", padding: "30px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontFamily: "'Segoe UI', sans-serif" },
  title: { textAlign: "center", fontSize: "24px", color: "#2c3e50", marginBottom: "20px" },
  error: { color: "red", textAlign: "center", marginBottom: "15px" },
  success: { color: "green", textAlign: "center", marginBottom: "15px" },
  label: { marginBottom: "10px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", width: "100%" },
  button: { backgroundColor: "#2c357d", color: "white", padding: "10px", fontSize: "16px", border: "none", borderRadius: "6px", cursor: "pointer" }
};

export default ForgotPassword;
