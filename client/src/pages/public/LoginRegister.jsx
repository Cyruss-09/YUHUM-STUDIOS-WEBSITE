import { useState } from "react";
import Navbar from "../../components/Navbar"
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import "./LoginRegister.css";

export default function LoginRegister() {
  const [isFlipped, setIsFlipped] = useState(false); // false = Login face, true = Register face
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(loginData);
      navigate(data.user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      setIsFlipped(false);
      setLoginData({ email: registerData.email, password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchFace = () => {
    setError("");
    setIsFlipped((f) => !f);
  };

  return (
    <div className="auth-page">
      {/* Include the Navbar here so it renders on the page */}
      <Navbar />

      <div className="auth-stage">
        <div className={`auth-card ${isFlipped ? "is-flipped" : ""}`}>
          {/* FRONT — Login */}
          <div className="auth-face auth-face--front">
            <span className="auth-eyebrow">Returning Guest</span>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to manage your stay</p>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="you@example.com"
                />
              </label>
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                />
              </label>

              {!isFlipped && error && <p className="auth-error">{error}</p>}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="auth-switch">
              New here?{" "}
              <button type="button" onClick={switchFace} className="auth-link">
                Create an account
              </button>
            </p>
          </div>

          {/* BACK — Register */}
          <div className="auth-face auth-face--back">
            <span className="auth-eyebrow">New Guest</span>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-sub">Just a few details to get you checked in</p>

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <label className="auth-field">
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  required
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="janedoe"
                />
              </label>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="you@example.com"
                />
              </label>
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="auth-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                />
              </label>

              {isFlipped && error && <p className="auth-error">{error}</p>}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              Already registered?{" "}
              <button type="button" onClick={switchFace} className="auth-link">
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}