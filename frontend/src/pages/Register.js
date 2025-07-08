import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("password", password);
    form.append("role", role);
    form.append("secret_question", secretQuestion);
    form.append("secret_answer", secretAnswer);

    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Регистрацията беше успешна!");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage(data.error || "⚠️ Възникна грешка.");
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f9f9ff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "25px", fontSize: "28px" }}>
        Създаване на акаунт
      </h2>
      {message && <p style={{ textAlign: "center", color: "#2980b9" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Име"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Имейл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Парола"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Таен въпрос (напр. Любим учител?)"
          value={secretQuestion}
          onChange={(e) => setSecretQuestion(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Отговор на тайния въпрос"
          value={secretAnswer}
          onChange={(e) => setSecretAnswer(e.target.value)}
          required
          style={inputStyle}
        />

        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label style={{ fontWeight: "bold", color: "#34495e" }}>Роля:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              ...inputStyle,
              height: "40px",
              marginTop: "6px",
              backgroundColor: "white",
            }}
          >
            <option value="student">Ученик</option>
            <option value="teacher">Преподавател</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2980b9",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Регистрирай се
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

export default Register;
