import React from "react";
import { useNavigate } from "react-router-dom";
import './Form.css';


const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return <p style={{ textAlign: "center", color: "#c0392b" }}>Моля, влезте в профила си.</p>;
  }

  return (
    <div
      className="dashboard-container"
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "30px",
        borderRadius: "10px",
        backgroundColor: "#f4f7fb",
        fontFamily: "'Segoe UI', sans-serif",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#2c3e50", fontSize: "28px", marginBottom: "15px" }}>
        Здравей, {user.name}!
      </h2>
      <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
        Роля: <strong>{user.role === "student" ? "Ученик" : "Преподавател"}</strong>
      </p>

      {user.role === "teacher" && (
        <>
          <button style={btnStyle} onClick={() => navigate("/create-test")}>
            Създай тест
          </button>
          <button style={btnStyle} onClick={() => navigate("/tests")}>
            Виж всички тестове
          </button>
        </>
      )}

      {user.role === "student" && (
        <>
          <button style={btnStyle} onClick={() => navigate("/tests")}>
            Виж тестове
          </button>
          <button style={btnStyle} onClick={() => navigate("/results")}>
            Виж резултати
          </button>
        </>
      )}
    </div>
  );
};

const btnStyle = {
  display: "block",
  width: "100%",
  maxWidth: "300px",
  padding: "14px",
  margin: "10px auto",
  fontSize: "16px",
  fontWeight: "bold",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Dashboard;
