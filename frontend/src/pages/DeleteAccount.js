import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeleteAccount = ({ user, setUser }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const form = new FormData();
    form.append("user_id", user.id);
    form.append("password", password);

    try {
      const res = await fetch("http://127.0.0.1:8000/delete-account", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Акаунтът беше успешно изтрит.");
        setTimeout(() => {
          localStorage.removeItem("user");
          setUser(null);
          navigate("/");
        }, 2000);
      } else {
        setError(data.detail || "Грешка при изтриване на акаунта.");
      }
    } catch (err) {
      setError("Проблем със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗑️ Изтриване на акаунт</h2>
      <p style={{ color: "#333", marginBottom: "15px" }}>
        Потвърдете паролата си, за да изтриете акаунта си. Това действие е необратимо.
      </p>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleDelete} style={styles.form}>
        <input
          type="password"
          placeholder="Въведете паролата си"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Изтрий акаунта</button>
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
  success: {
    color: "green",
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
    backgroundColor: "#c0392b",
    color: "white",
    padding: "10px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default DeleteAccount;
