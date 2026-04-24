function Dashboard({ setPage }) {
  return (
    <div className="container">
        <button className="secondary small-btn"
            onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
            }}
        >
          Выйти из аккаунта
        </button>

      <h2>Главное меню</h2>

      <button onClick={() => setPage("createRoom")}>
        Создать комнату
      </button>

      <button onClick={() => setPage("join")}>
        Войти в комнату
      </button>

      <button onClick={() => setPage("results")}>
        История
      </button>

      <h3>Управление квизами</h3>

      <button onClick={() => setPage("createQuiz")}>
        Создать квиз
      </button>

      <button onClick={() => setPage("editQuiz")}>
        Редактировать квиз
      </button>
    </div>
  );
}

export default Dashboard;