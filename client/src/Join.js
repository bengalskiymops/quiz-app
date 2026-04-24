import { useState } from "react";
import api from "./api";

function Join({ setRoom, setPage }) {
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");

  const joinRoom = async () => {
    try {
      setError("");

      if (!roomInput.trim()) {
        setError("Введи код комнаты");
        return;
      }

      await api.get(`/room/${roomInput}`);

      setRoom(roomInput);
      setPage("room");
    } catch (err) {
      setError(err.response?.data?.error || "Комната не найдена");
    }
  };

  return (
    <div className="container">
      <button
        className="secondary small-btn"
        onClick={() => setPage("dashboard")}
      >
        ⬅ Назад
      </button>

      <h2>Войти в комнату</h2>

      <input
        placeholder="Код комнаты"
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
      />

      <button onClick={joinRoom}>
        Войти
      </button>

      {error && <p className="error">❌ {error}</p>}
    </div>
  );
}

export default Join;