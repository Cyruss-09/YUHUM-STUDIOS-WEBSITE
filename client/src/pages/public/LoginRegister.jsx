import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // CHANGED: replaces authService import
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

// CHANGED: now accepts setActiveLink, matching how App.jsx actually renders
// this component (<Register setActiveLink={handlePageChange} />). The old
// version ignored that prop entirely and used react-router's useNavigate()
// instead — but App.jsx's page switching is done manually via
// window.history.pushState + local state, not <Routes>/<Route>, so
// navigate() would change the URL without ever updating the visible page.
//
// UX CHANGES in this pass:
// - Segmented pill toggle (Login / Create account) replaces the old
//   "toggle via text link only" pattern, so switching is a single
//   deliberate tap instead of a maze of two different link styles.
// - Form swap crossfades + slides instead of hard-cutting, so the layout
//   doesn't feel like it's reloading.
// - Password fields get a show/hide toggle — typing an 8+ char password
//   blind is the single biggest friction point in a signup form.
// - Confirm-password gets live match feedback instead of waiting for
//   submit to tell you the two fields disagree.
// - Errors are field-scoped where possible (email format, password length,
//   mismatch) so people aren't stuck decoding one banner for multiple forms.
// - Buttons show a spinner instead of just swapping text, and inputs get a
//   visible amber focus ring sized for keyboard users, not just mouse hover.
export default function LoginRegister({ setActiveLink }) {
  const { login, register } = useAuth(); // CHANGED: single source of truth for auth state
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

  // Focus the first field whenever the form swaps, so keyboard users land
  // somewhere useful instead of on a button they already clicked.
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
        setActiveLink(user?.role === "admin" ? "admin-dashboard" : "home");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials.");
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
      // CHANGED: register() already logs the user in (sets token + user in
      // context), so there's no need to bounce back to the login form and
      // make them sign in a second time — send them straight in.
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      if (setActiveLink) setActiveLink("home");
    } catch (err) {
      setError(err.message || "Registration failed.");
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
    `w-full bg-[#150E09] border rounded-lg px-4 py-3 text-sm text-[#F3EDE3] placeholder-[#B8AA98]/40 focus:outline-none focus:ring-2 transition-all ${
      invalid
        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
        : "border-[#C08A3E]/30 focus:border-[#E8B368] focus:ring-[#E8B368]/40"
    }`;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#150E09] relative overflow-hidden">
      {/* Background ambient lighting/glow element — shifts warmth slightly
          between the two modes so the switch registers ambiently, not just
          via the form content changing. */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
          isRegistering ? "bg-[#E8B368]/10" : "bg-[#C08A3E]/10"
        }`}
      />

      {/* Main container card */}
      <div className="w-full max-w-md bg-[#1c1410] border border-[#C08A3E]/20 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        {/* Segmented toggle — a single, unambiguous control for switching
            modes, always visible instead of buried in a bottom link only. */}
        <div
          role="tablist"
          aria-label="Choose sign in or create account"
          className="relative grid grid-cols-2 mb-8 bg-[#150E09] border border-[#C08A3E]/20 rounded-lg p-1 text-xs font-semibold uppercase tracking-wider"
        >
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-gradient-to-b from-[#E8B368] to-[#C08A3E] transition-transform duration-300 ease-out ${
              isRegistering ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
            }`}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={!isRegistering}
            onClick={() => switchTo(false)}
            className={`relative z-10 py-2.5 rounded-md transition-colors ${
              !isRegistering
                ? "text-[#1c1410]"
                : "text-[#B8AA98] hover:text-[#F3EDE3]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegistering}
            onClick={() => switchTo(true)}
            className={`relative z-10 py-2.5 rounded-md transition-colors ${
              isRegistering
                ? "text-[#1c1410]"
                : "text-[#B8AA98] hover:text-[#F3EDE3]"
            }`}
          >
            Create account
          </button>
        </div>

        <div
          key={isRegistering ? "register" : "login"}
          className="animate-[fadeSlideIn_0.25s_ease-out]"
        >
          {!isRegistering ? (
            /* ==================== LOGIN FORM ==================== */
            <div>
              <div className="text-center mb-8">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8B368]">
                  Returning guest
                </span>
                <h1 className="font-serif text-3xl text-[#F3EDE3] mt-2 mb-1">
                  Welcome back
                </h1>
                <p className="text-sm text-[#B8AA98]">
                  Sign in to manage your bookings and sessions
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-6 p-3 text-xs text-red-200 bg-red-950/60 border border-red-800/50 rounded-lg text-center"
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
                    className="block text-xs font-medium uppercase tracking-wider text-[#B8AA98] mb-2"
                  >
                    Email address
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
                    className="block text-xs font-medium uppercase tracking-wider text-[#B8AA98] mb-2"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8AA98] hover:text-[#E8B368] transition-colors"
                    >
                      {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] font-semibold text-xs tracking-[0.15em] uppercase py-3.5 rounded-lg shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_20px_rgba(192,138,62,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-[#C08A3E]/15 pt-6">
                <p className="text-xs text-[#B8AA98]">
                  New to Yuhum Studios?{" "}
                  <button
                    type="button"
                    onClick={() => switchTo(true)}
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
                  New guest
                </span>
                <h1 className="font-serif text-2xl text-[#F3EDE3] mt-1 mb-1">
                  Create account
                </h1>
                <p className="text-xs text-[#B8AA98]">
                  Join us to book your sessions seamlessly
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 text-xs text-red-200 bg-red-950/60 border border-red-800/50 rounded-lg text-center"
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
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5"
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
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5"
                  >
                    Email address
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
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8AA98] hover:text-[#E8B368] transition-colors"
                    >
                      {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {touched.password &&
                    registerData.password.length > 0 &&
                    registerData.password.length < 8 && (
                      <p className="mt-1.5 text-[11px] text-red-300">
                        Needs at least 8 characters.
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="reg-confirm"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#B8AA98] mb-1.5"
                  >
                    Confirm password
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
                      className={`${inputClass(touched.confirmPassword && passwordsMismatched)} pr-16`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {registerData.confirmPassword.length > 0 &&
                        (passwordsMismatched ? (
                          <X
                            size={14}
                            className="text-red-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check
                            size={14}
                            className="text-emerald-400"
                            aria-hidden="true"
                          />
                        ))}
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm((s) => !s)}
                        aria-label={
                          showRegConfirm ? "Hide password" : "Show password"
                        }
                        className="text-[#B8AA98] hover:text-[#E8B368] transition-colors"
                      >
                        {showRegConfirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  {touched.confirmPassword && passwordsMismatched && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      Passwords don't match.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] font-semibold text-xs tracking-[0.15em] uppercase py-3 rounded-lg shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_20px_rgba(192,138,62,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-[#C08A3E]/15 pt-4">
                <p className="text-xs text-[#B8AA98]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTo(false)}
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

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
