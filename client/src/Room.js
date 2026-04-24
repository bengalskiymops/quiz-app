import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Room({ room, setPage }) {
  const [socket, setSocket] = useState(null);

  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState([]);
  const [question, setQuestion] = useState(null);
  const [scores, setScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [role, setRole] = useState("participant");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(10);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    setSocket(newSocket);

    newSocket.on("role", setRole);

    newSocket.emit("join_room", { roomCode: room });

    newSocket.on("receive_question", (q) => {
      setQuestion(q);
      setSelected([]);
      setAnswer("");
    });

    newSocket.on("timer_update", setTimeLeft);
    newSocket.on("update_scores", setScores);

    newSocket.on("quiz_finished", (s) => {
      setFinished(true);
      setScores(s);
    });

    return () => newSocket.disconnect();
  }, [room]);

  const sendTextAnswer = () => {
    socket?.emit("submit_answer", {
      answer,
      roomCode: room,
    });
  };

  return (
    <div className="container">
      <button
        className="secondary small-btn"
        onClick={() => setConfirmExit(true)}
      >
        Выйти
      </button>

      <h2>Комната: {room}</h2>

      {!finished && question && (
        <div style={{ marginBottom: "20px" }}>
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              style={{ width: "100%", borderRadius: "10px" }}
            />
          )}

          <h3 style={{ textAlign: "center" }}>{question.text}</h3>

          <div style={{ display: "grid", gap: "10px" }}>
            {question.type !== "text" &&
              question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (question.type === "multiple") {
                      setSelected((prev) =>
                        prev.includes(opt)
                          ? prev.filter((o) => o !== opt)
                          : [...prev, opt]
                      );
                    } else {
                      socket?.emit("submit_answer", {
                        answer: opt,
                        roomCode: room,
                      });
                    }
                  }}
                  style={{
                    background: selected.includes(opt)
                      ? "#22c55e"
                      : "#3b82f6",
                  }}
                >
                  {opt}
                </button>
              ))}
          </div>

          {question.type === "multiple" && (
            <button
              style={{ marginTop: "10px" }}
              onClick={() =>
                socket?.emit("submit_answer", {
                  answer: selected,
                  roomCode: room,
                })
              }
            >
              Ответить
            </button>
          )}

          {question.type === "text" && (
            <>
              <input
                placeholder="Ваш ответ..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendTextAnswer()}
              />
              <button onClick={sendTextAnswer}>Ответить</button>
            </>
          )}
        </div>
      )}

      {!finished && timeLeft > 0 && (
        <h2 style={{ textAlign: "center" }}>⏱ {timeLeft}</h2>
      )}

      <h3>🏆 Таблица лидеров</h3>

      <div style={{ marginBottom: "20px" }}>
        {Object.entries(scores)
          .sort((a, b) => b[1].score - a[1].score)
          .map(([id, data], index) => (
            <div
              key={id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#334155",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "5px",
              }}
            >
              <span>
                {index + 1}. {data.name}
              </span>
              <span>{data.score}</span>
            </div>
          ))}
      </div>

      {!started && role === "organizer" && (
        <div
          style={{
            background: "#334155",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h3>⚙ Настройки</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Таймер</span>
            <button
              className={timerEnabled ? "" : "secondary"}
              onClick={() => setTimerEnabled(!timerEnabled)}
            >
              {timerEnabled ? "Включен" : "Выключен"}
            </button>
          </div>

          {timerEnabled && (
            <input
              type="number"
              placeholder="секунды"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          )}

          <button
            style={{ marginTop: "10px" }}
            onClick={() => {
              socket?.emit("start_quiz", {
                roomCode: room,
                timerEnabled,
                timeLimit,
              });
              setStarted(true);
            }}
          >
            🚀 Старт
          </button>
        </div>
      )}

      {!finished && role === "organizer" && started && (
        <button
          onClick={() =>
            socket?.emit("next_question", { roomCode: room })
          }
        >
          ➡ Следующий вопрос
        </button>
      )}

      {confirmExit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              minWidth: "250px",
            }}
          >
            <h3>Выйти из комнаты?</h3>

            <button
              onClick={() => {
                setConfirmExit(false);
                setPage("dashboard");
              }}
              style={{ marginRight: "10px" }}
            >
              Да
            </button>

            <button onClick={() => setConfirmExit(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Room;