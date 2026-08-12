import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Check, X, Loader2, Sparkles } from "lucide-react";

export default function LoginRegister({ setActiveLink }) {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false); // false = Login, true = Register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [touched, setTouched] = useState({});

  const firstFieldRef = useRef(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [isRegistering]);

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(loginData.email, loginData.password);
      if (setActiveLink) {
        setActiveLink(user?.role === "admin" ? "admin-dashboard" : "book");
      }
    } catch (err) {
      // Check if backend error indicates user not found / doesn't exist
      const errMessage = err?.message?.toLowerCase() || "";
      if (
        errMessage.includes("not found") ||
        errMessage.includes("no account") ||
        errMessage.includes("does not exist") ||
        errMessage.includes("user not registered")
      ) {
        setError(
          "No account found with this email. Please check or create an account.",
        );
      } else {
        setError("The email or password you entered is incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordsMismatched =
    registerData.confirmPassword.length > 0 &&
    registerData.password !== registerData.confirmPassword;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match.");
      setTouched((t) => ({ ...t, confirmPassword: true }));
      return;
    }
    setLoading(true);
    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      if (setActiveLink) setActiveLink("home");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchTo = (registering) => {
    if (registering === isRegistering) return;
    setError("");
    setTouched({});
    setIsRegistering(registering);
  };

  const inputClass = (invalid) =>
    `w-full bg-white border rounded-xl px-4 py-3.5 text-sm text-[#2C221E] placeholder-[#7A6B63]/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
      invalid
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : "border-[#E8DFD1] focus:border-[#A3704C] focus:ring-[#A3704C]/20"
    }`;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#FBF9F5] relative overflow-hidden">
      {/* Ambient Backdrop Glows */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isRegistering ? "bg-[#A3704C]/10" : "bg-[#8C5A35]/10"
        }`}
      />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-[#E8DFD1] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(163,112,76,0.08)] relative z-10">
        {/* Decorative Top Accent */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#A3704C]/40" />
          <Sparkles size={16} className="text-[#A3704C]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#A3704C]/40" />
        </div>

        {/* Segmented Pill Toggle */}
        <div
          role="tablist"
          aria-label="Choose sign in or create account"
          className="relative grid grid-cols-2 mb-8 bg-[#F4EFEA] border border-[#E8DFD1] rounded-xl p-1.5 text-xs font-semibold uppercase tracking-wider"
        >
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-lg bg-gradient-to-r from-[#A3704C] to-[#8C5A35] shadow-sm transition-transform duration-300 ease-out ${
              isRegistering ? "translate-x-[calc(100%+6px)]" : "translate-x-0"
            }`}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={!isRegistering}
            onClick={() => switchTo(false)}
            className={`relative z-10 py-3 rounded-lg transition-colors ${
              !isRegistering
                ? "text-white font-bold"
                : "text-[#7A6B63] hover:text-[#2C221E]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegistering}
            onClick={() => switchTo(true)}
            className={`relative z-10 py-3 rounded-lg transition-colors ${
              isRegistering
                ? "text-white font-bold"
                : "text-[#7A6B63] hover:text-[#2C221E]"
            }`}
          >
            Create account
          </button>
        </div>

        <div
          key={isRegistering ? "register" : "login"}
          className="animate-[fadeSlideIn_0.3s_ease-out]"
        >
          {!isRegistering ? (
            /* ==================== LOGIN FORM ==================== */
            <div>
              <div className="text-center mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A3704C]">
                  Welcome Back
                </span>
                <h1 className="font-serif text-3xl text-[#2C221E] mt-2 mb-1.5">
                  Sign in to your account
                </h1>
                <p className="text-xs text-[#7A6B63]">
                  Access your bookings, saved sessions, and studio preferences
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-5"
                noValidate
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B63] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="you@example.com"
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B63] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className={`${inputClass(false)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((s) => !s)}
                      aria-label={
                        showLoginPw ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6B63] hover:text-[#A3704C] transition-colors"
                    >
                      {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3704C] to-[#8C5A35] hover:from-[#8C5A35] hover:to-[#754829] text-white font-medium text-xs tracking-[0.2em] uppercase py-3.5 rounded-xl shadow-[0_4px_16px_rgba(163,112,76,0.25)] hover:shadow-[0_6px_20px_rgba(163,112,76,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-[#E8DFD1] pt-6">
                <p className="text-xs text-[#7A6B63]">
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => switchTo(true)}
                    className="text-[#A3704C] hover:text-[#8C5A35] font-semibold underline underline-offset-4 transition-colors"
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
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A3704C]">
                  Get Started
                </span>
                <h1 className="font-serif text-2xl text-[#2C221E] mt-1.5 mb-1">
                  Create your account
                </h1>
                <p className="text-xs text-[#7A6B63]">
                  Join Yuhum Studios for seamless booking and management
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A6B63] mb-1.5"
                  >
                    Username
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="reg-username"
                    type="text"
                    name="username"
                    required
                    autoComplete="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="janedoe"
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A6B63] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="you@example.com"
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A6B63] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showRegPw ? "text" : "password"}
                      name="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      onBlur={() => markTouched("password")}
                      placeholder="At least 8 characters"
                      className={`${inputClass(
                        touched.password &&
                          registerData.password.length > 0 &&
                          registerData.password.length < 8,
                      )} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((s) => !s)}
                      aria-label={showRegPw ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6B63] hover:text-[#A3704C] transition-colors"
                    >
                      {showRegPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.password &&
                    registerData.password.length > 0 &&
                    registerData.password.length < 8 && (
                      <p className="mt-1.5 text-[11px] text-red-500">
                        Password must be at least 8 characters long.
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A6B63] mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      type={showRegConfirm ? "text" : "password"}
                      name="confirmPassword"
                      required
                      autoComplete="new-password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      onBlur={() => markTouched("confirmPassword")}
                      placeholder="••••••••"
                      className={`${inputClass(
                        touched.confirmPassword && passwordsMismatched,
                      )} pr-16`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {registerData.confirmPassword.length > 0 &&
                        (passwordsMismatched ? (
                          <X
                            size={16}
                            className="text-red-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check
                            size={16}
                            className="text-emerald-600"
                            aria-hidden="true"
                          />
                        ))}
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm((s) => !s)}
                        aria-label={
                          showRegConfirm ? "Hide password" : "Show password"
                        }
                        className="text-[#7A6B63] hover:text-[#A3704C] transition-colors"
                      >
                        {showRegConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  {touched.confirmPassword && passwordsMismatched && (
                    <p className="mt-1.5 text-[11px] text-red-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3704C] to-[#8C5A35] hover:from-[#8C5A35] hover:to-[#754829] text-white font-medium text-xs tracking-[0.2em] uppercase py-3 rounded-xl shadow-[0_4px_16px_rgba(163,112,76,0.25)] hover:shadow-[0_6px_20px_rgba(163,112,76,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-[#E8DFD1] pt-4">
                <p className="text-xs text-[#7A6B63]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTo(false)}
                    className="text-[#A3704C] hover:text-[#8C5A35] font-semibold underline underline-offset-4 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
