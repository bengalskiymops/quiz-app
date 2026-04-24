import { useState } from "react";
import axios from "axios";

function CreateRoom({ setRoom, setPage }) {
  const [quizId, setQuizId] = useState("");

  const create = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/room",
        { quizId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setRoom(res.data.code);
      setPage("room");
    } catch (e) {
      alert(e.response?.data?.error || "Ошибка создания комнаты");
    }
  };

  return (
    <div className="container">
      <button className="secondary small-btn" onClick={() => setPage("dashboard")}>⬅ Назад</button>

      <h2>Создать комнату</h2>

      <input
        onKeyDown={(e) => e.key === "Enter" && create()}
        placeholder="ID квиза"
        onChange={(e) => setQuizId(e.target.value)}
      />

      <button onClick={create}>Создать</button>
    </div>
  );
}

export default CreateRoom;