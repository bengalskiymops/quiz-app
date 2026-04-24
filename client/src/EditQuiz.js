import { useState } from "react";
import api from "./api";

function EditQuiz({ setPage }) {
  const [quizId, setQuizId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [text, setText] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("");
  const [correct, setCorrect] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/quiz/${quizId}`);
      setQuestions(res.data.questions);
      setLoaded(true);
    } catch (err) {
      alert(err.response?.data?.error || "Ошибка загрузки");
    }
  };

  const addQuestion = async () => {
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

      setText("");
      setOptions("");
      setCorrect("");
      setImageUrl("");

      load();
    } catch {
      alert("Ошибка добавления");
    }
  };

  const updateQuestion = async (q) => {
    try {
      await api.put(`/question/${q.id}`, {
        text: q.text,
        type: q.type,
        options: Array.isArray(q.options)
          ? q.options
          : JSON.parse(q.options || "[]"),
        correct: q.correct,
        imageUrl: q.imageUrl,
      });

      alert("Сохранено");
    } catch {
      alert("Ошибка сохранения");
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await api.delete(`/question/${id}`);
      load();
    } catch {
      alert("Ошибка удаления");
    }
  };

  return (
    <div className="container">
      <button className="secondary small-btn" onClick={() => setPage("dashboard")}>
        ⬅ Назад
      </button>

      <h2>Редактировать квиз</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          placeholder="ID квиза"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
        />
        <button onClick={load}>Загрузить</button>
      </div>

      {loaded && <p className="success">✅ Квиз загружен</p>}

      <hr />

      <h3>➕ Добавить вопрос</h3>

      <div style={{ display: "grid", gap: "10px" }}>
        <input
          placeholder="Текст вопроса"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          placeholder="Ссылка на изображение"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="single">Один ответ</option>
          <option value="multiple">Несколько ответов</option>
          <option value="text">Текст</option>
        </select>

        <input
          placeholder="Варианты (через запятую) (для текстовых не писать!)"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
        />

        <input
          placeholder="Правильный ответ (несколько через запятую)"
          value={correct}
          onChange={(e) => setCorrect(e.target.value)}
        />

        <button onClick={addQuestion}>Добавить</button>
      </div>

      <hr />

      <h3>📋 Вопросы</h3>

      {questions.length === 0 ? (
        <p>Нет вопросов</p>
      ) : (
        questions.map((q, index) => {
          let opts = [];
          try {
            opts = Array.isArray(q.options)
              ? q.options
              : JSON.parse(q.options || "[]");
          } catch {}

          return (
            <div
              key={q.id}
              style={{
                background: "#334155",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
              }}
            >
              <p style={{ marginBottom: "5px" }}>Вопрос #{index + 1}</p>

              <input
                value={q.text}
                placeholder="Текст вопроса"
                onChange={(e) => {
                  const copy = [...questions];
                  copy[index].text = e.target.value;
                  setQuestions(copy);
                }}
              />

              <input
                value={q.imageUrl || ""}
                placeholder="Картинка"
                onChange={(e) => {
                  const copy = [...questions];
                  copy[index].imageUrl = e.target.value;
                  setQuestions(copy);
                }}
              />

              <select
                value={q.type}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[index].type = e.target.value;
                  setQuestions(copy);
                }}
              >
                <option value="single">Один</option>
                <option value="multiple">Несколько</option>
                <option value="text">Текст</option>
              </select>

              <input
                value={opts.join(",")}
                placeholder="Варианты"
                onChange={(e) => {
                  const copy = [...questions];
                  copy[index].options = e.target.value
                    .split(",")
                    .map(o => o.trim());
                  setQuestions(copy);
                }}
              />

              <input
                value={q.correct}
                placeholder="Правильный ответ"
                onChange={(e) => {
                  const copy = [...questions];
                  copy[index].correct = e.target.value;
                  setQuestions(copy);
                }}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => updateQuestion(q)}>
                  💾 Сохранить
                </button>

                <button
                  className="secondary"
                  onClick={() => deleteQuestion(q.id)}
                >
                  ❌ Удалить
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default EditQuiz;