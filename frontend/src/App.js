import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tests from "./pages/Tests";
import CreateTest from "./pages/CreateTest";
import MyResults from "./pages/MyResults";
import ViewResult from "./pages/ViewResult";
import SolveTest from "./pages/SolveTest";
import PreviewTest from "./pages/PreviewTest";
import AddQuestion from "./pages/AddQuestion";
import GrantAccess from "./pages/GrantAccess";
import About from "./pages/About";
import Statistics from "./pages/Statistics";
import CategoryTest from "./pages/CategoryTest";
import EditQuestion from "./pages/EditQuestion";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import UpdateProfile from "./pages/UpdateProfile";
import AllStudentResults from "./pages/AllStudentResults";
import StudentResults from "./pages/StudentResults";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  localStorage.removeItem("user");
  }, []);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}

function AppContent({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Сигурни ли сте, че искате да изтриете акаунта си?")) {
      const res = await fetch("http://127.0.0.1:8000/delete-account", {
        method: "POST",
        body: new URLSearchParams({ user_id: user.id }),
      });
      if (res.ok) {
        alert("Акаунтът е изтрит успешно.");
        handleLogout();
      } else {
        alert("Грешка при изтриване на акаунта.");
      }
    }
  };

  return (
    <>
      <nav
        style={{
          backgroundColor: "#2c357d",
          padding: "10px 20px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/" style={navLinkStyle}>Начало</Link>

          {user?.role === "student" && (
            <>
              <Link to="/tests" style={navLinkStyle}>Тестове</Link>
              <Link to="/results" style={navLinkStyle}>Виж резултати</Link>
              <Link to="/about" style={navLinkStyle}>За нас</Link>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              <Link to="/create-test" style={navLinkStyle}>Създай тест</Link>
              <Link to="/tests" style={navLinkStyle}>Тестове</Link>
              <Link to="/all-results" style={navLinkStyle}>Резултати</Link>
              <Link to="/about" style={navLinkStyle}>За нас</Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/tests" style={navLinkStyle}>Тестове</Link>
              <Link to="/create-test" style={navLinkStyle}>Създай тест</Link>
              <Link to="/about" style={navLinkStyle}>За нас</Link>
            </>
          )}
        </div>

        <div style={{ position: "relative" }}>
          {user ? (
            <div style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
              <div style={{
                backgroundColor: "#1e2961",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "bold"
              }}>
                {user.name} <span style={{ fontSize: "16px" }}>▾</span>
              </div>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "8px",
                    backgroundColor: "white",
                    color: "#2c357d",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    width: "220px",
                    textAlign: "left",
                    overflow: "hidden",
                  }}
                >
                  <div style={menuItemStyle} onClick={() => {
                    setMenuOpen(false);
                    navigate("/change-password");
                  }}>🔐 Смени парола</div>

                  <div style={menuItemStyle} onClick={() => {
                    setMenuOpen(false);
                    navigate("/update-profile");
                  }}>✏️ Обнови профил</div>

                  <div style={menuItemStyle} onClick={handleDeleteAccount}>
                    🗑️ Изтрий акаунт
                  </div>

                  <div style={menuItemStyle} onClick={handleLogout}>
                    🚪 Изход
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}> Вход </Link>
              <Link to="/register" style={navLinkStyle}> Регистрация </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/tests" element={user ? <Tests user={user} /> : <Navigate to="/login" />} />
        <Route path="/create-test" element={user?.role === "teacher" ? <CreateTest /> : <Navigate to="/login" />} />
        <Route path="/results" element={user?.role === "student" ? <MyResults user={user} /> : <Navigate to="/login" />} />
        <Route path="/result/:resultId" element={user ? <ViewResult /> : <Navigate to="/login" />} />
        <Route path="/solve/:testId" element={user?.role === "student" ? <SolveTest user={user} /> : <Navigate to="/login" />} />
        <Route path="/preview-test/:testId" element={user?.role === "teacher" ? <PreviewTest /> : <Navigate to="/login" />} />
        <Route path="/add-question/:testId" element={user?.role === "teacher" ? <AddQuestion /> : <Navigate to="/login" />} />
        <Route path="/grant-access/:testId" element={user?.role === "teacher" ? <GrantAccess /> : <Navigate to="/login" />} />
        <Route path="/statistics/:testId" element={user?.role === "teacher" ? <Statistics /> : <Navigate to="/login" />} />
        <Route path="/category/:category" element={<CategoryTest user={user} />} />
        <Route path="/edit-question/:questionId" element={<EditQuestion />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={user ? <ChangePassword user={user} /> : <Navigate to="/login" />} />
        <Route path="/update-profile" element={user ? <UpdateProfile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/all-results" element={user?.role === "teacher" ? <AllStudentResults /> : <Navigate to="/login" />} />
        <Route path="/student-results/:studentId" element={user?.role === "teacher" ? <StudentResults /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

const navLinkStyle = {
  color: "white",
  textDecoration: "none",
};

const menuItemStyle = {
  padding: "14px 18px",
  fontSize: "16px",
  borderBottom: "1px solid #eee",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background 0.2s ease",
};

export default App;
