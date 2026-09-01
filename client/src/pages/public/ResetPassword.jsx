import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X, Lock, ShieldCheck, AlertCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ResetPassword({ token, setActiveLink }) {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });

  // --- Live validation rules ---
  const rules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }), [password]);

  const strengthScore = Object.values(rules).filter(Boolean).length; // 0-3
  const strengthLabel = ["Too weak", "Weak", "Good", "Strong"][strengthScore];
  const strengthColor = [
    "bg-red-400",
    "bg-amber-400",
    "bg-yellow-500",
    "bg-emerald-500",
  ][strengthScore];

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = rules.length && passwordsMatch && status !== "loading";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setTouched({ password: true, confirm: true });

    if (!rules.length) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      if (resetPassword && token) {
        await resetPassword(token, password);
      } else {
        const res = await fetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Reset failed. The link may have expired.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Reset failed. The link may have expired.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#FBF9F5] relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#A3704C]/12 to-[#8C5A35]/8 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#E8DFD1] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(163,112,76,0.08)] relative z-10">
        
        {/* Studio Top Accent */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#A3704C]/40" />
          <Sparkles size={16} className="text-[#A3704C]" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#A3704C]/40" />
        </div>

        {status === "success" ? (
          /* ================= SUCCESS CELEBRATION ================= */
          <div className="text-center py-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShieldCheck size={32} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-700">
              Account Secured
            </span>
            <h2 className="font-serif text-3xl text-[#2C221E] mt-2 mb-2 font-normal">
              Password updated
            </h2>
            <p className="text-xs text-[#7A6B63] leading-relaxed mb-8 max-w-xs mx-auto">
              Your new password has been successfully saved. You can now sign in to your Yuhum Studios client account.
            </p>

            <button
              type="button"
              onClick={() => setActiveLink("register")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#A3704C] to-[#8C5A35] hover:from-[#8C5A35] hover:to-[#754829] text-white text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_6px_20px_rgba(163,112,76,0.25)] hover:shadow-[0_8px_25px_rgba(163,112,76,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          /* ================= RESET PASSWORD FORM ================= */
          <div>
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A3704C]">
                Client Portal • Security
              </span>
              <h1 className="font-serif text-3xl text-[#2C221E] mt-2 mb-2 font-normal">
                Set a new password
              </h1>
              <p className="text-xs text-[#7A6B63] leading-relaxed max-w-xs mx-auto">
                Create a strong, memorable password to protect your studio sessions and bookings.
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-6 p-4 text-xs text-red-700 bg-red-50/90 border border-red-200 rounded-2xl flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="client-new-pw"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B63] mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="client-new-pw"
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Enter at least 8 characters"
                    className="w-full bg-white border border-[#E8DFD1] rounded-2xl pl-4 pr-12 py-3.5 text-sm text-[#2C221E] placeholder-[#7A6B63]/40 focus:outline-none focus:border-[#A3704C] focus:ring-2 focus:ring-[#A3704C]/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6B63] hover:text-[#A3704C] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Live Password Strength Visualizer */}
                {password.length > 0 && (
                  <div className="mt-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD1]/80">
                    <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                      <span className="text-[#7A6B63]">Strength:</span>
                      <span className="text-[#2C221E] font-semibold">{strengthLabel}</span>
                    </div>
                    <div className="flex gap-1.5 mb-2.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < strengthScore ? strengthColor : "bg-[#E8DFD1]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <RuleHint met={rules.length} label="8+ characters" />
                      <RuleHint met={rules.upper} label="Uppercase letter" />
                      <RuleHint met={rules.number} label="A number" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="client-confirm-pw"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B63] mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="client-confirm-pw"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                    placeholder="Re-enter your password"
                    className="w-full bg-white border border-[#E8DFD1] rounded-2xl pl-4 pr-12 py-3.5 text-sm text-[#2C221E] placeholder-[#7A6B63]/40 focus:outline-none focus:border-[#A3704C] focus:ring-2 focus:ring-[#A3704C]/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A6B63] hover:text-[#A3704C] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {touched.confirm && confirmPassword.length > 0 && (
                  <p
                    className={`mt-2 text-xs flex items-center gap-1.5 ${
                      passwordsMatch ? "text-emerald-600 font-medium" : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                    <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3704C] to-[#8C5A35] hover:from-[#8C5A35] hover:to-[#754829] text-white font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-2xl shadow-[0_6px_20px_rgba(163,112,76,0.25)] hover:shadow-[0_8px_25px_rgba(163,112,76,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving New Password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-[#E8DFD1]/60 pt-6">
              <button
                type="button"
                onClick={() => setActiveLink("register")}
                className="text-xs text-[#7A6B63] hover:text-[#A3704C] font-semibold transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function RuleHint({ met, label }) {
  return (
    <span
      className={`text-[11px] flex items-center gap-1 transition-colors ${
        met ? "text-emerald-600 font-semibold" : "text-[#9E9189]"
      }`}
    >
      {met ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
      {label}
    </span>
  );
}