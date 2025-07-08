import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">За платформата EduSmart</h1>
      <p style={{ fontSize: "1.1rem", marginBottom: "40px", lineHeight: "1.7" }}>
        <strong>EduSmart</strong> е създадена с цел да улесни учебния процес, като предоставя възможност за
        създаване, провеждане и оценяване на тестове. Платформата е подходяща за ученици, учители и обучителни
        организации, които търсят ефективно и удобно решение за проверка на знания и проследяване на резултати.
      </p>

      <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "1.8rem" }}>
        Какви са ползите от <span style={{ color: "#2c357d" }}>EduSmart</span>?
      </h2>

      <div className="about-section">
        <div className="about-box">
          <h3>👩‍🏫 Учители</h3>
          <ul>
            <li>Бързо и лесно създавай необходимите тестове</li>
            <li>Оцени индивидуално всеки ученик</li>
            <li>Спести време и улесни учебния процес</li>
          </ul>
        </div>
        <div className="about-box">
          <h3>👩‍🎓 Ученици</h3>
          <ul>
            <li>Провери знанията и уменията си по всяко време</li>
            <li>Повиши успеха си с лекота</li>
            <li>Сподели резултатите си с приятели</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
