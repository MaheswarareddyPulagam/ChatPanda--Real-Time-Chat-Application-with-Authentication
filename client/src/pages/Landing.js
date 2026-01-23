import { useNavigate } from "react-router-dom";
import "./Landing.css";
import chatpanda from "../assets/chatpanda.png";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-card">
        <img src={chatpanda} alt="ChatPanda" />
        <h1>ChatPanda</h1>
        <p>Real-time chat made simple and friendly 🐼</p>

        <div className="landing-buttons">
          <button onClick={() => navigate("/login")}>Login</button>
          <button
            className="signup-btn"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
