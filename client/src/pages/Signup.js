import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import chatpanda from "../assets/chatpanda.png";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!username || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        username,
        password,
      });
      navigate("/login");
    } catch {
      setError("Username already exists");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={chatpanda} alt="ChatPanda" />
        <h2>Create your ChatPanda account</h2>

        {error && <div className="error-text">{error}</div>}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}

export default Signup;
