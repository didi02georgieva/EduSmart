// 📁 Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        const pendingCategory = localStorage.getItem("pendingCategory");
        if (pendingCategory) {
          localStorage.removeItem("pendingCategory");
          navigate(`/category/${pendingCategory}`);
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.error || "Грешка при вход.");
      }
    } catch (err) {
      setError("Грешка при свързване със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Вход</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Имейл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Парола"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Вход</button>

        <div style={styles.forgotContainer}>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={styles.forgotButton}
          >
            Забравена парола?
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif"
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    padding: "10px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  forgotContainer: {
    textAlign: "center",
    marginTop: "10px"
  },
  forgotButton: {
    background: "none",
    border: "none",
    color: "#1e90ff",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px"
  }
};

export default Login;
