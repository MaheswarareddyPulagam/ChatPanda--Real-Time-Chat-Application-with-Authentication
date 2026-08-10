import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import chatpanda from "../assets/chatpanda.png";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    socketRef.current = io("https://15-252-129-3.sslip.io", {
  auth: { token },
});

    const socket = socketRef.current;

    socket.on("onlineUsers", setOnlineUsers);
    socket.on("previousMessages", setMessages);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTypingUser("");
    });

    socket.on("userTyping", (user) => {
      if (user !== username) {
        setTypingUser(user);
      }
    });

    socket.on("stopTyping", () => {
      setTypingUser("");
    });

    return () => socket.disconnect();
  }, [navigate, username]);

  // ✅ AUTO SCROLL TO LATEST MESSAGE
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socketRef.current.emit("typing");

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping");
    }, 800);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.emit("sendMessage", { text: message });
    socketRef.current.emit("stopTyping");
    setMessage("");
  };

  const logout = () => {
    localStorage.clear();
    socketRef.current.disconnect();
    navigate("/");
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>Online Users</h3>
        {onlineUsers.map((u, i) => (
          <div key={i} className="online-user">🟢 {u}</div>
        ))}
      </div>

      {/* CHAT MAIN */}
      <div className="chat-main">
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-left">
            <img src={chatpanda} alt="ChatPanda" className="logo" />
            <div className="brand">
              <span className="brand-name">ChatPanda</span>
              <span className="brand-tagline">
                Connect • Chat • Panda 🐼
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="user-box">
              <div className="avatar">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span>{username}</span>
            </div>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.user === username ? "own" : ""}`}
            >
              <div className="msg-user">{m.user}</div>
              <div className="msg-text">{m.text}</div>
              <div className="msg-time">{formatTime(m.createdAt)}</div>
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {typingUser && (
            <div className="typing-indicator">
              <span>{typingUser} is typing</span>
              <span className="dots">
                <i></i><i></i><i></i>
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="chat-input">
          <input
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
