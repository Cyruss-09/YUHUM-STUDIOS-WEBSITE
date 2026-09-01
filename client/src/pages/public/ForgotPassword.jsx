import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, Clock, RefreshCw } from "lucide-react";

export default function ForgotPassword({ setActiveLink }) {
  const { forgotPassword } = useAuth();
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
      if (forgotPassword) {
        await forgotPassword(email);
      } else {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Something went wrong. Please try again.");
      }

      setSent(true);
      setCooldown(60); // 60s cooldown for resend
    } catch (err) {
      setErrorMsg(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      if (forgotPassword) {
        await forgotPassword(email);
      }
      setCooldown(60);
    } catch (err) {
      setErrorMsg("Failed to resend. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[#FBF9F5] relative overflow-hidden">
      {/* Ambient Boutique Studio Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#A3704C]/12 to-[#8C5A35]/8 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#E8DFD1] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(163,112,76,0.08)] relative z-10">
        
        {/* Studio Top Accent */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#A3704C]/40" />
          <Sparkles size={16} className="text-[#A3704C]" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#A3704C]/40" />
        </div>

        {!sent ? (
          /* ================= REQUEST FORM ================= */
          <div>
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A3704C]">
                Client Portal • Account Recovery
              </span>
              <h1 className="font-serif text-3xl text-[#2C221E] mt-2 mb-2 font-normal">
                Forgot your password?
              </h1>
              <p className="text-xs text-[#7A6B63] leading-relaxed max-w-xs mx-auto">
                No worries! Enter your registered client email and we'll send you an instant link to reset it.
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
              <div>
                <label
                  htmlFor="client-forgot-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B63] mb-2"
                >
                  Your Email Address
                </label>
                <div className="relative">
                  <input
                    id="client-forgot-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[#E8DFD1] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#2C221E] placeholder-[#7A6B63]/40 focus:outline-none focus:border-[#A3704C] focus:ring-2 focus:ring-[#A3704C]/20 transition-all duration-300"
                  />
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6B63]/60 pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3704C] to-[#8C5A35] hover:from-[#8C5A35] hover:to-[#754829] text-white font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-2xl shadow-[0_6px_20px_rgba(163,112,76,0.25)] hover:shadow-[0_8px_25px_rgba(163,112,76,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Reset Link…</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-[#E8DFD1]/60 pt-6">
              <button
                type="button"
                onClick={() => setActiveLink("register")}
                className="inline-flex items-center gap-1.5 text-xs text-[#7A6B63] hover:text-[#A3704C] font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= SUCCESS CONFIRMATION ================= */
          <div className="text-center py-2 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 size={32} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-700">
              Reset Link Dispatched
            </span>
            <h2 className="font-serif text-2xl text-[#2C221E] mt-2 mb-2">
              Check your inbox
            </h2>
            <p className="text-xs text-[#7A6B63] leading-relaxed mb-6">
              If an account is associated with <strong className="text-[#2C221E] font-semibold">{email}</strong>, we've sent instructions to reset your password.
            </p>

            <div className="bg-[#FAF7F2] border border-[#E8DFD1] rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#7A6B63]">
                <Clock size={14} className="text-[#A3704C] shrink-0" />
                <span>Link remains active for <strong>30 minutes</strong>.</span>
              </div>
              <p className="text-[11px] text-[#9E9189] leading-normal pl-6">
                Be sure to check your spam/junk folder if the email does not appear in your primary inbox.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveLink("register")}
                className="w-full py-3.5 rounded-2xl bg-[#2C221E] hover:bg-[#1A1412] text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all shadow-sm"
              >
                Return to Sign In
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#A3704C] hover:text-[#8C5A35] font-semibold py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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