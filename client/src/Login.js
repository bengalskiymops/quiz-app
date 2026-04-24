import { useState } from "react";
import axios from "axios";

function Login({ setPage, setUser }) {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submit = async () => {
    setError("");

    try {
      if (isRegister) {
        if (!validateEmail(email)) {
          setError("Введите корректный email");
          return;
        }

        await axios.post("http://localhost:5000/register", {
          email,
          password,
          name,
        });

        alert("Регистрация успешна!");
        setIsRegister(false);
      } else {
        const res = await axios.post("http://localhost:5000/login", {
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);

        setUser(res.data.user);
        setPage("dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка");
    }
  };

  return (
    <div className="container">
      {isRegister && (
        <button className="secondary small-btn" onClick={() => setIsRegister(false)}>
          ⬅ Назад
        </button>
      )}

      <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

      {isRegister && (
        <input
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button
        onClick={submit}
        style={{
          padding: "10px",
          width: "100%",
          background: "#2196F3",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isRegister ? "Зарегистрироваться" : "Войти"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}

      <br />

      {!isRegister && (
        <button
          onClick={() => setIsRegister(true)}
          style={{
            padding: "10px",
            width: "100%",
            background: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Зарегистрироваться
        </button>
      )}
    </div>
  );
}

export default Login;