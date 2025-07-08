import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateTest = ({ user: userProp }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(userProp || null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(5);
  const [category, setCategory] = useState("Общи");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (err) {
          console.error("Грешка при зареждане на потребителя:", err);
        }
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      setMessage("Грешка: липсва идентификатор на потребителя.");
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("creator_id", user.id);
    form.append("time_limit", Number(timeLimit));
    form.append("category", category);

    try {
      const res = await fetch("http://127.0.0.1:8000/create-test", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate("/tests"), 1000);
      } else {
        setMessage(data.error || "Възникна грешка при създаването.");
      }
    } catch (err) {
      console.error("Fetch грешка:", err);
      setMessage("Грешка при свързване със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📘 Създай нов тест</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          placeholder="Заглавие на теста"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          style={styles.input}
          placeholder="Описание (незадължително)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label style={styles.label}>Категория на теста:</label>
        <select
          style={styles.input}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="Общи">Общи</option>
          <option value="География">География</option>
          <option value="История">История</option>
          <option value="Биология">Биология</option>
          <option value="Химия">Химия</option>
          <option value="Физика">Физика</option>
          <option value="Български език">Български език</option>
          <option value="Математика">Математика</option>
        </select>

        <label style={styles.label}>Времетраене на теста (в минути):</label>
        <input
          style={styles.input}
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          min="1"
          required
        />

        <button style={styles.button} type="submit">
          Създай тест
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#fefefe",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  label: {
    fontSize: "15px",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default CreateTest;
