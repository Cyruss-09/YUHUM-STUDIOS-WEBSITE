import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, ShieldAlert, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Clock, RefreshCw, KeyRound } from "lucide-react";

export default function AdminForgotPassword({ setActiveLink }) {
  const { adminForgotPassword, forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading || cooldown > 0) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (adminForgotPassword) {
        await adminForgotPassword(email);
      } else if (forgotPassword) {
        await forgotPassword(email);
      } else {
        const response = await fetch("/api/auth/admin/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to process admin reset request.");
      }

      setSent(true);
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err.message || "Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      if (adminForgotPassword) {
        await adminForgotPassword(email);
      }
      setCooldown(60);
    } catch (err) {
      setErrorMsg("Failed to resend. Please wait a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Dark Ambient Grid & Security Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-amber-600/10 to-orange-600/5 blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10">
        
        {/* Security Header Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Shield size={12} className="text-amber-400" />
            <span>Admin Security Portal</span>
          </div>
        </div>

        {!sent ? (
          /* ================= ADMIN REQUEST FORM ================= */
          <div>
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Reset Admin Credentials
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Authorized administrators only. Enter your registered administrative email to receive a secure recovery token.
              </p>
            </div>

            {/* Elevated Security Notice */}
            <div className="bg-slate-950/70 border border-slate-800 border-l-4 border-l-amber-500 rounded-2xl p-3.5 mb-6 text-left">
              <p className="text-[11px] text-slate-300 leading-normal flex items-start gap-2">
                <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Password resets for administrative accounts are strictly logged and monitored.</span>
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2"
              >
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-forgot-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2"
                >
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    id="admin-forgot-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yuhumstudios.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-2xl shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmitting Security Link…</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Send Admin Reset Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center border-t border-slate-800/80 pt-5">
              <button
                type="button"
                onClick={() => setActiveLink("admin-login")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Return to Admin Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= ADMIN CONFIRMATION STATE ================= */
          <div className="text-center py-2 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShieldCheck size={32} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Admin Link Dispatched
            </span>
            <h2 className="text-2xl font-bold text-white mt-2 mb-2">
              Check Admin Mailbox
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              If an authorized administrator account exists for <strong className="text-slate-200 font-semibold">{email}</strong>, a secure reset link has been dispatched.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock size={14} className="text-amber-400 shrink-0" />
                <span>Token expires in <strong>30 minutes</strong>.</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal pl-6">
                For security reasons, this token can only be redeemed once. If you did not request this, please secure your administrative access.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveLink("admin-login")}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold uppercase tracking-[0.15em] transition-all"
              >
                Return to Admin Sign In
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>
                  {cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : "Didn't receive email? Resend"}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ShieldCheck({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}