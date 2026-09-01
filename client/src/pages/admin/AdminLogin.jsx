import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin({ setActiveLink }) {
  const { loginAdmin, adminForgotPassword, forgotPassword } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // --- Forgot password state ---
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [resetEmail, setResetEmail] = useState("");
  const [resetTouched, setResetTouched] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const emailRef = useRef(null);
  const resetEmailRef = useRef(null);

  useEffect(() => {
    if (view === "login") emailRef.current?.focus();
    else resetEmailRef.current?.focus();
  }, [view]);

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passwordIsValid = form.password.length >= 6;
  const canSubmit = emailIsValid && passwordIsValid && !loading;

  const resetEmailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFocusedField(null);
  };

  const handlePasswordKeyUp = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!emailIsValid || !passwordIsValid) return;

    setError("");
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password);
      setSuccess(true);
      setTimeout(() => setActiveLink("admin-dashboard"), 600);
    } catch (err) {
      setError(err.message || "Invalid admin credentials");
      setLoading(false);
    }
  };

  // --- Enter "forgot password" mode, carrying over whatever email was typed ---
  const openForgotPassword = () => {
    setResetEmail(form.email); // pre-fill from the Admin Email field
    setResetError("");
    setResetSent(false);
    setResetTouched(false);
    setView("forgot");
  };

  const backToLogin = () => {
    setView("login");
    setResetError("");
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetTouched(true);
    if (!resetEmailIsValid) return;

    setResetError("");
    setResetLoading(true);
    try {
      if (adminForgotPassword) {
        await adminForgotPassword(resetEmail);
      } else if (forgotPassword) {
        await forgotPassword(resetEmail);
      } else {
        const res = await fetch("/api/auth/admin/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Something went wrong");
        }
      }
      setResetSent(true);
    } catch (err) {
      setResetError(err.message || "Couldn't send admin reset email. Try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const emailError = touched.email && form.email.length > 0 && !emailIsValid;
  const passwordError =
    touched.password && form.password.length > 0 && !passwordIsValid;
  const resetEmailError =
    resetTouched && resetEmail.length > 0 && !resetEmailIsValid;

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-[#fdfbf7]">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-200/80 transition-all">

        {/* Brand / Header Section */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2C1810] text-[#fdfbf7] font-bold text-lg tracking-wider mb-3 shadow-md transition-transform duration-500 ${success ? "scale-110" : ""
              }`}
          >
            YS
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2C1810] tracking-tight">
            Yuhum Studios
          </h1>
          <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">
            {view === "login" ? "Admin Portal" : "Reset Password"}
          </p>
        </div>

        {view === "login" ? (
          <>
            {/* Error Alert Box */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium animate-shake"
              >
                {error}
              </div>
            )}

            {/* Success Alert Box */}
            {success && (
              <div
                role="status"
                className="mb-6 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Signed in — redirecting...
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${focusedField === "email" ? "text-[#2C1810]" : "text-stone-600"
                    }`}
                >
                  Admin Email
                </label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    id="admin-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    placeholder="admin@yuhumstudios.com"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => handleBlur("email")}
                    disabled={success}
                    aria-invalid={emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 pr-9 text-sm text-stone-800 placeholder-stone-400 focus:bg-white outline-none transition-all disabled:opacity-60 ${emailError
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                      : "border-stone-300 focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810]"
                      }`}
                    required
                  />
                  {form.email.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailIsValid ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : touched.email ? (
                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : null}
                    </span>
                  )}
                </div>
                {emailError && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-500">
                    Enter a valid email address
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="admin-password"
                  className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${focusedField === "password" ? "text-[#2C1810]" : "text-stone-600"
                    }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => handleBlur("password")}
                    onKeyUp={handlePasswordKeyUp}
                    disabled={success}
                    aria-invalid={passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 pr-10 text-sm text-stone-800 placeholder-stone-400 focus:bg-white outline-none transition-all disabled:opacity-60 ${passwordError
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                      : "border-stone-300 focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810]"
                      }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#2C1810] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-1.5 min-h-[1rem]">
                  {capsLockOn && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.598c.75 1.336-.213 2.98-1.742 2.98H3.48c-1.53 0-2.492-1.644-1.743-2.98L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clipRule="evenodd" />
                      </svg>
                      Caps Lock is on
                    </p>
                  )}
                  {passwordError && (
                    <p id="password-error" className="text-xs text-red-500">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-[#2C1810] focus:ring-[#2C1810] focus:ring-offset-0"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="font-medium text-[#2C1810] hover:underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || success}
                className="w-full rounded-xl bg-[#2C1810] text-[#fdfbf7] font-medium py-3 px-4 text-sm tracking-wide shadow-lg shadow-stone-900/10 hover:bg-[#1a0e09] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 mt-2"
              >
                {success ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Welcome back
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* --- Forgot Password view --- */}
            {resetError && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium animate-shake"
              >
                {resetError}
              </div>
            )}

            {resetSent ? (
              <div className="text-center">
                <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reset link sent
                </div>
                <p className="text-sm text-stone-500 mb-6">
                  If an admin account exists for <span className="font-medium text-stone-700">{resetEmail}</span>,
                  a password reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={backToLogin}
                  className="text-xs font-medium text-[#2C1810] hover:underline underline-offset-2"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
                <p className="text-sm text-stone-500 -mt-2 mb-1">
                  Enter your admin email and we'll send you a link to reset your password.
                </p>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold uppercase tracking-wider mb-2 text-stone-600"
                  >
                    Admin Email
                  </label>
                  <input
                    ref={resetEmailRef}
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@yuhumstudios.com"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (resetError) setResetError("");
                    }}
                    onBlur={() => setResetTouched(true)}
                    aria-invalid={resetEmailError}
                    aria-describedby={resetEmailError ? "reset-email-error" : undefined}
                    className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:bg-white outline-none transition-all ${resetEmailError
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                      : "border-stone-300 focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810]"
                      }`}
                    required
                  />
                  {resetEmailError && (
                    <p id="reset-email-error" className="mt-1.5 text-xs text-red-500">
                      Enter a valid email address
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!resetEmailIsValid || resetLoading}
                  className="w-full rounded-xl bg-[#2C1810] text-[#fdfbf7] font-medium py-3 px-4 text-sm tracking-wide shadow-lg shadow-stone-900/10 hover:bg-[#1a0e09] active:scale-[0.99] disabled:opacity-50 transition-all duration-200"
                >
                  {resetLoading ? "Sending..." : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-center text-xs font-medium text-stone-500 hover:text-[#2C1810] hover:underline underline-offset-2"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </>
        )}

        <div className="mt-8 text-center text-xs text-stone-400">
          Restricted access. Authorized personnel only.
        </div>
      </div>
    </div>
  );
}