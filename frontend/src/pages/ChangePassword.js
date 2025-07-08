import React, { useState } from "react";

const ChangePassword = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmNew) {
      setError("Новите пароли не съвпадат.");
      return;
    }

    const form = new FormData();
    form.append("user_id", user.id);
    form.append("current_password", currentPassword); // 🔁 това е важното име
    form.append("new_password", newPassword);

    try {
      const res = await fetch("http://127.0.0.1:8000/change-password", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "✅ Паролата е променена успешно.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNew("");
      } else {
        setError(data.detail || "⚠️ Грешка при промяна на паролата.");
      }
    } catch (err) {
      setError("⚠️ Проблем със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔒 Смени парола</h2>

      {error && (
        <p style={styles.error}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </p>
      )}
      {message && <p style={styles.success}>{message}</p>}

      <form onSubmit={handleChange} style={styles.form}>
        <input
          type="password"
          placeholder="Текуща парола"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Нова парола"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Потвърди новата парола"
          value={confirmNew}
          onChange={(e) => setConfirmNew(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Запази новата парола
        </button>
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
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  success: {
    color: "green",
    textAlign: "center",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    padding: "10px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ChangePassword;
