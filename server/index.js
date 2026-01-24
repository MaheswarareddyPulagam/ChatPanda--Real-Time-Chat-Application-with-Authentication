const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();

/* =======================
   ✅ GLOBAL CORS (FIXED)
   ======================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://unrivaled-sable-7dae14.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

/* ROUTES */
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("ChatPanda API running 🐼");
});

/* =======================
   SOCKET.IO
   ======================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* SOCKET AUTH */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, username }
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

const onlineUsers = {};

io.on("connection", async (socket) => {
  console.log("Connected:", socket.user.username);

  onlineUsers[socket.id] = socket.user.username;
  io.emit("onlineUsers", Object.values(onlineUsers));

  const messages = await Message.find().sort({ createdAt: 1 });
  socket.emit("previousMessages", messages);

  socket.on("sendMessage", async ({ text }) => {
    if (!text || !text.trim()) return;

    const newMessage = new Message({
      user: socket.user.username,
      text,
    });

    await newMessage.save();
    io.emit("receiveMessage", newMessage);
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("onlineUsers", Object.values(onlineUsers));
    console.log("Disconnected:", socket.user.username);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
