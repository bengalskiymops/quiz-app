require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

/* =========================
   STATE (ПО КОМНАТАМ)
========================= */
const roomsState = {};

/* =========================
   AUTH
========================= */
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, "secretkey");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/* =========================
   API
========================= */

app.get("/", (req, res) => res.send("API работает"));

app.get("/quiz/:id", authMiddleware, async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!quiz) {
    return res.status(404).json({ error: "Квиз не найден" });
  }

  if (quiz.creatorId !== req.user.userId) {
    return res.status(403).json({ error: "Не твой квиз" });
  }

  const questions = await prisma.question.findMany({
    where: { quizId: quiz.id },
    orderBy: { id: "asc" },
  });

  res.json({ quiz, questions });
});

app.get("/my-results", authMiddleware, async (req, res) => {
  const results = await prisma.result.findMany({
    where: { userId: req.user.userId },
    orderBy: { id: "desc" },
  });

  res.json(results);
});

app.get("/room/:code", authMiddleware, async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { code: req.params.code },
  });

  if (!room) {
    return res.status(404).json({ error: "Комната не существует" });
  }

  res.json(room);
});

app.delete("/question/:id", authMiddleware, async (req, res) => {
  try {
    const q = await prisma.question.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!q) {
      return res.status(404).json({ error: "Вопрос не найден" });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: q.quizId },
    });

    if (quiz.creatorId !== req.user.userId) {
      return res.status(403).json({ error: "Не твой квиз" });
    }

    await prisma.question.delete({
      where: { id: q.id },
    });

    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Ошибка удаления" });
  }
});

app.put("/question/:id", authMiddleware, async (req, res) => {
  try {
    const { text, options, correct, imageUrl, type } = req.body;

    const q = await prisma.question.findUnique({
      where: { id: Number(req.params.id) },
    });

    const quiz = await prisma.quiz.findUnique({
      where: { id: q.quizId },
    });

    if (quiz.creatorId !== req.user.userId) {
      return res.status(403).json({ error: "Не твой квиз" });
    }

    await prisma.question.update({
      where: { id: q.id },
      data: {
        text,
        type,
        options: JSON.stringify(options),
        correct,
        imageUrl,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Ошибка обновления" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Заполни все поля" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email уже используется" });
    }

    const existingName = await prisma.user.findFirst({
      where: { name },
    });

    if (existingName) {
      return res.status(400).json({ error: "Имя пользователя занято" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role: "participant",
      },
    });

    res.json(user);
  } catch (e) {
    console.log("REGISTER ERROR:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Неверный логин или пароль" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      userName: user.name,
    },
    "secretkey"
  );

  res.json({ token, user });
});

app.post("/quiz", authMiddleware, async (req, res) => {
  const quiz = await prisma.quiz.create({
    data: {
      title: req.body.title,
      creatorId: req.user.userId,
    },
  });

  res.json(quiz);
});

app.post("/question", authMiddleware, async (req, res) => {
  const { text, type, options, correct, imageUrl, quizId } = req.body;

  await prisma.question.create({
    data: {
      text,
      type,
      options: JSON.stringify(options),
      correct,
      imageUrl,
      quizId,
    },
  });

  res.json({ ok: true });
});

app.post("/room", authMiddleware, async (req, res) => {
  const quizId = Number(req.body.quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    return res.status(400).json({ error: "Квиз не найден" });
  }

  const code = Math.random().toString(36).substring(2, 7);

  const room = await prisma.room.create({
    data: {
      code,
      quizId,
      organizerId: req.user.userId,
    },
  });

  res.json(room);
});

/* =========================
   SOCKET AUTH
========================= */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next();

  try {
    socket.user = jwt.verify(token, "secretkey");
    next();
  } catch {
    next();
  }
});

/* =========================
   SOCKET LOGIC
========================= */
io.on("connection", (socket) => {
  if (!socket.user) return;

  console.log("User:", socket.user.userId);

  socket.on("join_room", async ({ roomCode }) => {
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) {
      socket.emit("error_message", "Комната не найдена");
      return;
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;

    const role =
      room.organizerId === socket.user.userId
        ? "organizer"
        : "participant";

    socket.role = role;
    socket.emit("role", role);

    if (!roomsState[roomCode]) {
      roomsState[roomCode] = {
        scores: {},
      };
    }

    const state = roomsState[roomCode];

    if (socket.role !== "organizer") {
      if (!state.scores[socket.user.userId]) {
        state.scores[socket.user.userId] = {
          name: socket.user.userName,
          score: 0,
        };
      }
    }

    io.to(roomCode).emit("update_scores", state.scores);
  });

  /* =========================
     START QUIZ
  ========================= */
  socket.on("start_quiz", async ({ roomCode, timerEnabled, timeLimit }) => {
    if (socket.role !== "organizer") return;

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    const questions = await prisma.question.findMany({
      where: { quizId: room.quizId },
    });

    roomsState[roomCode] = {
      questions,
      currentIndex: 0,
      scores: {},
      timer: null,
      timerEnabled,
      timeLimit,
      answered: {},
    };

    sendQuestion(roomCode);
  });

  function sendQuestion(roomCode) {
    const state = roomsState[roomCode];
    if (!state) return;

    const q = state.questions[state.currentIndex];
    if (!q) return;

    state.answered = {};

    io.to(roomCode).emit("receive_question", {
      text: q.text,
      options: JSON.parse(q.options || "[]"),
      imageUrl: q.imageUrl,
      type: q.type,
    });

    if (state.timerEnabled) {
      startTimer(roomCode);
    }
  }

  function startTimer(roomCode) {
    const state = roomsState[roomCode];
    if (!state) return;

    let time = state.timeLimit;

    clearInterval(state.timer);

    state.timer = setInterval(() => {
      time--;
      io.to(roomCode).emit("timer_update", time);

      if (time <= 0) {
        clearInterval(state.timer);
        nextQuestion(roomCode);
      }
    }, 1000);
  }

  function nextQuestion(roomCode) {
    const state = roomsState[roomCode];
    if (!state) return;

    state.currentIndex++;

    if (state.currentIndex >= state.questions.length) {
      finishQuiz(roomCode);
      return;
    }

    sendQuestion(roomCode);
  }

  async function finishQuiz(roomCode) {
    const state = roomsState[roomCode];
    if (!state || state.finished) return;

    state.finished = true;

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) return;

    const quiz = await prisma.quiz.findUnique({
      where: { id: room.quizId },
    });

    const sorted = Object.entries(state.scores).sort(
      (a, b) => b[1].score - a[1].score
    );

    for (let i = 0; i < sorted.length; i++) {
      const [userId, data] = sorted[i];

      await prisma.result.create({
        data: {
          userId: Number(userId),
          score: data.score,
          place: i + 1,
          room: roomCode,
          quizId: room.quizId,
          quizTitle: quiz.title,
          isOrganizer: false,
        },
      });
    }

    await prisma.result.create({
      data: {
        userId: room.organizerId,
        score: 0,
        place: 0,
        room: roomCode,
        quizId: room.quizId,
        quizTitle: quiz.title,
        isOrganizer: true,
      },
    });

    io.to(roomCode).emit("quiz_finished", state.scores);
  }

  /* =========================
     ANSWERS
  ========================= */
  socket.on("submit_answer", ({ answer, roomCode }) => {
    const state = roomsState[roomCode];
    if (!state) return;

    const userId = socket.user.userId;

    if (socket.role === "organizer") return;

    if (state.answered[userId]) return;
    state.answered[userId] = true;

    if (!state.scores[userId]) {
      state.scores[userId] = {
        name: socket.user.userName,
        score: 0,
      };
    }

    const q = state.questions[state.currentIndex];

    const correct = q.correct
      .split(",")
      .map(a => a.trim().toLowerCase());

    let userAnswer;

    if (Array.isArray(answer)) {
      userAnswer = answer.map(a => a.trim().toLowerCase());
    } else {
      userAnswer = answer.trim().toLowerCase();
    }

    let isCorrect = false;

    if (Array.isArray(userAnswer)) {
      isCorrect =
        userAnswer.length === correct.length &&
        userAnswer.every(a => correct.includes(a));
    } else {
      isCorrect = correct.includes(userAnswer);
    }

    if (isCorrect) {
      state.scores[userId].score++;
    }

    io.to(roomCode).emit("update_scores", state.scores);
  });

  socket.on("next_question", ({ roomCode }) => {
    if (socket.role !== "organizer") return;
    nextQuestion(roomCode);
  });

  socket.on("disconnect", () => {
    const roomCode = socket.roomCode;
    if (!roomCode) return;

    const state = roomsState[roomCode];
    if (!state) return;

    if (socket.role === "organizer") {
      finishQuiz(roomCode);
    }
  });
});

server.listen(5000, () => {
  console.log("Server running http://localhost:5000");
});