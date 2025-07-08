// 📁 Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ user }) => {
  const navigate = useNavigate();

  const categories = [
    "География",
    "История",
    "Биология",
    "Химия",
    "Физика",
    "Български език"
  ];

  const handleCategoryClick = (cat) => {
    if (user) {
      navigate(`/category/${cat}`);
    } else {
      localStorage.setItem("pendingCategory", cat);
      navigate("/login");
    }
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Добре дошли в <span style={styles.brand}>EduSmart</span></h1>
      <p style={styles.subtitle}>Твоята интелигентна платформа за тестове 📘</p>

      <p style={styles.intro}>
        Създавай, решавай и анализирай тестове бързо и лесно. Подходяща за ученици от 1. до 12. клас, преподаватели и образователни организации.
      </p>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📚 Категории тестове</h2>
        <div style={styles.categories}>
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={styles.categoryCard}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🎓 Подходящо за:</h2>
        <p style={styles.audience}>
          Ученици от 1. до 12. клас, преподаватели, школи и образователни организации.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 Защо да използваш EduSmart?</h2>
        <ul style={styles.benefits}>
          <li>Автоматично оценяване на тестове</li>
          <li>Визуализация на резултати и статистики</li>
          <li>Поддръжка на различни типове въпроси</li>
          <li>Лесен интерфейс за създаване и решаване</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "40px 20px",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  },
  title: {
    fontSize: "36px",
    color: "#2c357d",
    textAlign: "center",
    marginBottom: "10px",
  },
  brand: {
    color: "#1e90ff",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "18px",
    marginBottom: "30px",
    color: "#555",
  },
  intro: {
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "40px",
    color: "#333",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "16px",
  },
  categories: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "center",
  },
  categoryCard: {
    backgroundColor: "#2c357d",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "transform 0.2s ease",
  },
  audience: {
    fontSize: "16px",
    color: "#444",
    textAlign: "center",
  },
  benefits: {
    listStyleType: "square",
    paddingLeft: "20px",
    fontSize: "16px",
    color: "#333",
  },
};

export default Home;
