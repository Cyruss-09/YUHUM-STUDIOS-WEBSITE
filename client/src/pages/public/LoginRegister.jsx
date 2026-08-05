import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";

export default function LoginRegister() {
  const [isRegistering, setIsRegistering] = useState(false); // false = Login, true = Register
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
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      setIsRegistering(false);
      setLoginData({ email: registerData.email, password: "" });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setError("");
    setIsRegistering((prev) => !prev);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#150E09] relative overflow-hidden">
      {/* Background ambient lighting/glow element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C08A3E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container card */}
      <div className="w-full max-w-md bg-[#1c1410] border border-[#C08A3E]/20 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        {!isRegistering ? (
          /* ==================== LOGIN FORM ==================== */
          <div>
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8B368]">
                Returning Guest
              </span>
              <h1 className="font-serif text-3xl text-[#F3EDE3] mt-2 mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-[#B8AA98]">
                Sign in to manage your bookings and sessions
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 text-xs text-red-200 bg-red-950/60 border border-red-800/50 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#B8AA98] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="you@example.com"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-4 py-3 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#B8AA98] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-4 py-3 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] font-semibold text-xs tracking-[0.15em] uppercase py-3.5 rounded-lg shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_20px_rgba(192,138,62,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-[#C08A3E]/15 pt-6">
              <p className="text-xs text-[#B8AA98]">
                New to Yuhum Studios?{" "}
                <button
                  type="button"
                  onClick={toggleView}
                  className="text-[#E8B368] hover:text-[#F0C07E] font-medium underline underline-offset-4 transition-colors"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ==================== REGISTER FORM ==================== */
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8B368]">
                New Guest
              </span>
              <h1 className="font-serif text-2xl text-[#F3EDE3] mt-1 mb-1">
                Create Account
              </h1>
              <p className="text-xs text-[#B8AA98]">
                Join us to book your sessions seamlessly
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 text-xs text-red-200 bg-red-950/60 border border-red-800/50 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="janedoe"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="you@example.com"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                  className="w-full bg-[#150E09] border border-[#C08A3E]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:border-[#E8B368] focus:ring-1 focus:ring-[#E8B368] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] font-semibold text-xs tracking-[0.15em] uppercase py-3 rounded-lg shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_20px_rgba(192,138,62,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-[#C08A3E]/15 pt-4">
              <p className="text-xs text-[#B8AA98]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleView}
                  className="text-[#E8B368] hover:text-[#F0C07E] font-medium underline underline-offset-4 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
