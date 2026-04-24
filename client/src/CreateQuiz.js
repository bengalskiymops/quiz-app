import { useState } from "react";
import api from "./api";

function CreateQuiz({ setPage }) {
  const [title, setTitle] = useState("");

  const create = async () => {
    const res = await api.post("/quiz", { title });

    alert(`Квиз создан! ID: ${res.data.id}`);
  };

  return (
    <div className="container">
      <button className="secondary small-btn" onClick={() => setPage("dashboard")}>
        ⬅ Назад
      </button>

      <h2>Создать квиз</h2>

      <input
        placeholder="Название квиза"
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={create}>Создать</button>
    </div>
  );
}

export default CreateQuiz;