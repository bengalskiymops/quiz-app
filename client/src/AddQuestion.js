import { useState } from "react";
import api from "./api";

function AddQuestion({ setPage }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("");
  const [correct, setCorrect] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [quizId, setQuizId] = useState("");

  const add = async () => {
    try {
      await api.post("/question", {
        text,
        type,
        options: options.split(",").map(o => o.trim()),
        correct: correct.split(",").map(o => o.trim()).join(","),
        imageUrl,
        quizId: Number(quizId),
      });

      alert("Вопрос добавлен");
    } catch (e) {
      alert("Ошибка добавления");
    }
  };

  return (
    <div className="container">
      <button className="secondary small-btn" onClick={() => setPage("dashboard")}>⬅ Назад</button>

      <h2>Добавить вопрос</h2>

      <input placeholder="Текст" onChange={(e) => setText(e.target.value)} />

      <input
        placeholder="Ссылка на изображение (опционально)"
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="single">Один ответ</option>
        <option value="multiple">Несколько ответов</option>
        <option value="text">Текстовый ответ</option>
      </select>

      <input
        placeholder="Варианты (через запятую)"
        onChange={(e) => setOptions(e.target.value)}
      />

      <input
        placeholder="Правильный ответ (несколько через запятую)"
        onChange={(e) => setCorrect(e.target.value)}
      />

      <input
        placeholder="ID квиза"
        onChange={(e) => setQuizId(e.target.value)}
      />

      <button onClick={add}>Добавить</button>
    </div>
  );
}

export default AddQuestion;