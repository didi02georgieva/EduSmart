import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Statistics = () => {
  const { testId } = useParams();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");
  const [testTitle, setTestTitle] = useState(""); // 🆕

  useEffect(() => {
    // вземи заглавието на теста
    const fetchTitle = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/test/${testId}`);
        const data = await res.json();
        if (res.ok) {
          setTestTitle(data.title);
        } else {
          setTestTitle(`№${testId}`);
        }
      } catch {
        setTestTitle(`№${testId}`);
      }
    };

    fetchTitle();

    // вземи статистика
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/statistics/${testId}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Грешка при зареждане на статистиката.");
        }

        setStats(data);

        const labels = data.participant_stats.map(p => p.name);
        const scores = data.participant_stats.map(p => p.average_score);

        setChartData({
          labels,
          datasets: [
            {
              label: "Среден резултат (точки)",
              data: scores,
              backgroundColor: "#2c357d",
            },
          ],
        });
      } catch (err) {
        setError("Неуспешно зареждане на статистиката.");
      }
    };

    fetchStats();
  }, [testId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (error) {
    return <div style={styles.container}><p style={styles.error}>{error}</p></div>;
  }

  if (!stats || !chartData) {
    return <div style={styles.container}><p>Зареждане...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Статистика за тест: {testTitle}</h2>
      <p><strong>Общо решавания:</strong> {stats.total_attempts}</p>
      <p><strong>Успеваемост:</strong> {stats.success_rate.toFixed(2)}%</p>
      <p><strong>Обща средна оценка:</strong> {stats.average_grade} ({stats.average_score.toFixed(2)} точки)</p>

      <div style={{ marginTop: "25px" }}>
        <strong>Средна оценка на участниците:</strong>
        <ul>
          {stats.participant_stats.map((p) => (
            <li key={p.user_id}>
              {p.name}: {p.grade} ({p.average_score.toFixed(2)} точки)
            </li>
          ))}
        </ul>
      </div>

      <div style={{ height: "400px", marginTop: "30px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "26px",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
};

export default Statistics;
