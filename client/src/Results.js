import { useEffect, useState } from "react";
import api from "./api";

function Results({ userId, setPage }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/my-results");
      setResults(res.data);
    } catch (err) {
      console.log(err);
      alert("Ошибка загрузки результатов");
    }
  };

  return (
    <div className="container">
      <button className="secondary small-btn" onClick={() => setPage("dashboard")}>
        ⬅ Назад
      </button>

      <h2>Мои результаты</h2>

      {results.length === 0 ? (
        <p>Нет игр</p>
      ) : (
        results.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid gray",
              margin: "10px",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>🎮 {r.quizTitle}</h3>

            <p>Комната: <b>{r.room}</b></p>

            {r.isOrganizer ? (
              <p>👑 Вы были организатором</p>
            ) : (
              <p>
                🏆 {r.place} место — {r.score} очков
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Results;