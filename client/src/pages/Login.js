import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import chatpanda from "../assets/chatpanda.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
  "http://13.232.126.113:5000/api/auth/login",
  { username, password }
);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username); // ✅ IMPORTANT

      navigate("/chat");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={chatpanda} alt="ChatPanda" />
        <h2>Login to ChatPanda</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
