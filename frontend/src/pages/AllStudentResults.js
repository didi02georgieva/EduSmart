import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AllStudentResults = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Грешка при зареждане на студентите.");
      }
    };

    fetchStudents();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👨‍🎓 Всички ученици</h2>
      {students.length === 0 ? (
        <p>Няма налични ученици.</p>
      ) : (
        <ul style={styles.list}>
          {students.map((s) => (
            <li key={s.id} style={styles.item}>
              <div>
                <strong>{s.name}</strong> <br />
                <span style={styles.email}>{s.email}</span>
              </div>
              <button
                style={styles.button}
                onClick={() => navigate(`/student-results/${s.id}`)}
              >
                📊 Виж резултати
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#f9f9ff",
    borderRadius: "12px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "26px",
    color: "#2c357d",
    textAlign: "center",
    marginBottom: "30px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "14px 20px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
  },
  email: {
    fontSize: "14px",
    color: "#555",
  },
  button: {
    backgroundColor: "#2c357d",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default AllStudentResults;
