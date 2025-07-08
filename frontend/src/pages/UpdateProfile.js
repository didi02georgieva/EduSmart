import React, { useState } from "react";

const UpdateProfile = ({ user, setUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("user_id", user.id);
    form.append("name", name);
    form.append("email", email);

    try {
      const res = await fetch("http://127.0.0.1:8000/update-profile", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Данните са обновени.");
        const updatedUser = { ...user, name, email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setError(data.detail || "⚠️ Възникна грешка.");
      }
    } catch {
      setError("⚠️ Грешка при връзка със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 Обнови профила</h2>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}
      <form onSubmit={handleUpdate} style={styles.form}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.button}>Запази промените</button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", padding: "30px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontFamily: "'Segoe UI', sans-serif" },
  title: { textAlign: "center", fontSize: "24px", color: "#2c3e50", marginBottom: "20px" },
  error: { color: "red", textAlign: "center", marginBottom: "15px" },
  success: { color: "green", textAlign: "center", marginBottom: "15px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc" },
  button: { backgroundColor: "#2c357d", color: "white", padding: "10px", fontSize: "16px", border: "none", borderRadius: "6px", cursor: "pointer" }
};

export default UpdateProfile;
