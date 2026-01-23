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
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("API running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* 🔐 SOCKET AUTH */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Auth error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      id: decoded.id,
      username: decoded.username, // ✅ MUST EXIST
    };

    next();
  } catch {
    next(new Error("Auth error"));
  }
});

/* 🟢 ONLINE USERS */
const onlineUsers = new Set();

io.on("connection", async (socket) => {
  console.log("Connected:", socket.user.username);

  onlineUsers.add(socket.user.username);
  io.emit("onlineUsers", Array.from(onlineUsers));

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

  socket.on("typing", () => {
    socket.broadcast.emit("userTyping", socket.user.username);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.user.username);
    io.emit("onlineUsers", Array.from(onlineUsers));
    console.log("Disconnected:", socket.user.username);
  });
});

server.listen(5000, () => {
  console.log("Server started on port 5000");
});
