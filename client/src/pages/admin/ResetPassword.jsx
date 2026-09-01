import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, Lock, Eye, EyeOff, Check, X, AlertCircle, ArrowRight, Loader2, KeyRound } from "lucide-react";

export default function AdminResetPassword({ token: propToken, setActiveLink }) {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(propToken || null);
  const [checkingToken, setCheckingToken] = useState(!propToken);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordRef = useRef(null);

  useEffect(() => {
    if (propToken) {
      setToken(propToken);
      setCheckingToken(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
    setCheckingToken(false);
  }, [propToken]);

  useEffect(() => {
    if (!checkingToken && token) passwordRef.current?.focus();
  }, [checkingToken, token]);

  // Strict Admin Validation Criteria
  const rules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }), [password]);

  const strengthScore = Object.values(rules).filter(Boolean).length;
  const strengthLabel = ["Insecure", "Weak", "Acceptable", "Strong"][strengthScore];
  const strengthColor = [
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-400",
  ][strengthScore];

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = rules.length && passwordsMatch && confirmPassword.length > 0 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!rules.length || !passwordsMatch) return;

    setError("");
    setLoading(true);
    try {
      if (resetPassword && token) {
        await resetPassword(token, password);
      } else {
        const res = await fetch("/api/auth/admin/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || "Couldn't reset admin password.");
      }
      setDone(true);
    } catch (err) {
      setError(err.message || "Reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Grid Pattern & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-amber-600/10 to-orange-600/5 blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10">
        
        {/* Security Header Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Shield size={12} className="text-amber-400" />
            <span>Admin Credential Reset</span>
          </div>
        </div>

        {done ? (
          /* ================= SUCCESS STATE ================= */
          <div className="text-center py-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Check size={32} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
              Credentials Updated
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-2">
              Admin Password Set
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
              Your administrator credentials have been securely updated. You may now authenticate into the management portal.
            </p>

            <button
              type="button"
              onClick={() => setActiveLink("admin-login")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-[0.18em] uppercase shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : !token ? (
          /* ================= MISSING TOKEN STATE ================= */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-800 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invalid or Missing Token</h2>
            <p className="text-xs text-slate-400 mb-6">
              This security reset link appears to be invalid or expired. Please initiate a new password reset request.
            </p>
            <button
              type="button"
              onClick={() => setActiveLink("admin-forgot-password")}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold uppercase tracking-[0.15em] transition-all"
            >
              Request New Admin Reset Link
            </button>
          </div>
        ) : (
          /* ================= ADMIN RESET FORM ================= */
          <div>
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Set Admin Password
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Configure a secure new password for your administrative profile.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2"
              >
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* New Password */}
              <div>
                <label
                  htmlFor="admin-new-pw"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2"
                >
                  New Admin Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="admin-new-pw"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-400">Security rating:</span>
                      <span className="text-white font-semibold">{strengthLabel}</span>
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < strengthScore ? strengthColor : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <AdminRuleHint met={rules.length} label="8+ chars" />
                      <AdminRuleHint met={rules.upper} label="Uppercase" />
                      <AdminRuleHint met={rules.number} label="Number" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="admin-confirm-pw"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2"
                >
                  Confirm Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-confirm-pw"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {touched.confirm && confirmPassword.length > 0 && (
                  <p
                    className={`mt-2 text-xs flex items-center gap-1.5 ${
                      passwordsMatch ? "text-emerald-400 font-medium" : "text-red-400"
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
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-2xl shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Admin Password…</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Save Admin Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center border-t border-slate-800/80 pt-5">
              <button
                type="button"
                onClick={() => setActiveLink("admin-login")}
                className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors"
              >
                ← Back to Admin Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function AdminRuleHint({ met, label }) {
  return (
    <span
      className={`text-[10px] flex items-center gap-1 transition-colors ${
        met ? "text-emerald-400 font-semibold" : "text-slate-500"
      }`}
    >
      {met ? <Check size={11} strokeWidth={3} /> : <X size={11} />}
      {label}
    </span>
  );
}