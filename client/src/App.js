import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Join from "./Join";
import Room from "./Room";
import Results from "./Results";
import CreateRoom from "./CreateRoom";
import CreateQuiz from "./CreateQuiz";
import AddQuestion from "./AddQuestion";
import EditQuiz from "./EditQuiz";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");

  return (
    <div>
      {page === "login" && (
        <Login setPage={setPage} setUser={setUser} />
      )}

      {page === "dashboard" && (
        <Dashboard setPage={setPage} />
      )}

      {page === "join" && (
        <Join setRoom={setRoom} setPage={setPage} />
      )}

      {page === "createRoom" && <CreateRoom setPage={setPage} setRoom={setRoom} />}

      {page === "room" && (
        <Room
          room={room}
          userName={user?.name}
          role={user?.role}
          setPage={setPage}
        />
      )}

      {page === "results" && (
        <Results userId={user?.id} setPage={setPage} />
      )}

      {page === "createQuiz" && <CreateQuiz setPage={setPage} />}

      {page === "addQuestion" && <AddQuestion setPage={setPage} />}

      {page === "editQuiz" && <EditQuiz setPage={setPage} />}
    </div>
  );
}

export default App;