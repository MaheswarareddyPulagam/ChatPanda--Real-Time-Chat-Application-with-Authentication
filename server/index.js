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

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://unrivaled-sable-7dae14.netlify.app/"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("ChatPanda API Running 🚀");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://unrivaled-sable-7dae14.netlify.app/"
    ],
    methods: ["GET", "POST"]
  }
});

// 🔐 SOCKET AUTH
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;   // store full user
    next();
  } catch (err) {
    next(new Error("Auth failed"));
  }
});

const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const username = socket.user.username;
  console.log("Connected:", username);

  onlineUsers.set(socket.id, username);
  io.emit("onlineUsers", [...new Set(onlineUsers.values())]);

  // Send previous messages
  const messages = await Message.find().sort({ createdAt: 1 }).limit(200);
  socket.emit("previousMessages", messages);

  socket.on("sendMessage", async ({ text }) => {
    if (!text || !text.trim()) return;

    const newMessage = new Message({
      user: username,
      text
    });

    await newMessage.save();
    io.emit("receiveMessage", newMessage);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("userTyping", username);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", username);
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", [...new Set(onlineUsers.values())]);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
