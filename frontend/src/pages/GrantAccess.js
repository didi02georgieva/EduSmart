import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GrantAccess = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/students");
        const data = await res.json();
        setStudents(data);
      } catch {
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("test_id", testId);
    selected.forEach((id) => form.append("student_ids", String(id)));

    try {
      const res = await fetch("http://127.0.0.1:8000/api/grant-access", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setIsSuccess(res.ok);
      setMessage(data.message || data.error);
    } catch {
      setIsSuccess(false);
      setMessage("Грешка при връзка със сървъра.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📨 Дай достъп до тест №{testId}</h2>
      {students.length === 0 ? (
        <p>Няма налични ученици.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {students.map((s) => (
            <label key={s.id} style={styles.checkbox}>
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => handleToggle(s.id)}
              />
              {s.name} ({s.email})
            </label>
          ))}
          <button type="submit" style={styles.button}>Запази достъпа</button>
        </form>
      )}
      {message && <p style={{ color: isSuccess ? "green" : "red", marginTop: "15px" }}>{message}</p>}
      <button onClick={() => navigate("/tests")} style={{ ...styles.button, marginTop: "20px" }}>
        ⬅ Назад
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  checkbox: {
    display: "block",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "#fff",
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default GrantAccess;
