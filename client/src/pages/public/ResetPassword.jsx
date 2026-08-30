import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function ResetPassword({ token, setActiveLink }) {
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
        "bg-orange-400",
        "bg-yellow-500",
        "bg-green-500",
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
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed. The link may have expired.");

            setStatus("success");
        } catch (err) {
            setStatus("error");
            setErrorMsg(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 bg-[#FBF9F5]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8DFD1] p-8">

                {status !== "success" && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F3EBDF] mb-5 mx-auto">
                        <Lock size={20} className="text-[#A3704C]" />
                    </div>
                )}

                <h1 className="text-2xl font-semibold text-[#2C221E] mb-1 text-center">
                    {status === "success" ? "Password updated" : "Reset your password"}
                </h1>

                {status !== "success" && (
                    <p className="text-sm text-[#A0958A] text-center mb-6">
                        Choose a new password to secure your account.
                    </p>
                )}

                {status === "success" ? (
                    <div className="mt-2 text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4 mx-auto">
                            <ShieldCheck size={22} className="text-green-600" />
                        </div>
                        <p className="text-[#7A6B63] text-sm mb-6">
                            Your password has been reset successfully. You can now sign in with your new password.
                        </p>
                        <button
                            type="button"
                            onClick={() => setActiveLink("register")}
                            className="w-full py-2.5 rounded-lg bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium transition"
                        >
                            Go to login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 mt-4" noValidate>
                        {/* New password */}
                        <div>
                            <label className="block text-xs font-medium text-[#7A6B63] mb-1.5">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                    placeholder="Enter new password"
                                    aria-invalid={touched.password && !rules.length}
                                    className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-[#2C221E] transition focus:outline-none focus:ring-2 ${touched.password && !rules.length
                                        ? "border-red-300 focus:ring-red-300"
                                        : "border-[#E8DFD1] focus:ring-[#A3704C]"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0958A] hover:text-[#7A6B63] transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength meter — only shows once user starts typing */}
                            {password.length > 0 && (
                                <div className="mt-2.5">
                                    <div className="flex gap-1.5 mb-2">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${i < strengthScore ? strengthColor : "bg-[#E8DFD1]"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <RuleHint met={rules.length} label="8+ characters" />
                                        <RuleHint met={rules.upper} label="Uppercase letter" />
                                        <RuleHint met={rules.number} label="A number" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-medium text-[#7A6B63] mb-1.5">
                                Confirm new password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                                    placeholder="Re-enter new password"
                                    aria-invalid={touched.confirm && passwordsMismatch}
                                    className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-[#2C221E] transition focus:outline-none focus:ring-2 ${touched.confirm && passwordsMismatch
                                        ? "border-red-300 focus:ring-red-300"
                                        : passwordsMatch
                                            ? "border-green-300 focus:ring-green-300"
                                            : "border-[#E8DFD1] focus:ring-[#A3704C]"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0958A] hover:text-[#7A6B63] transition"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {touched.confirm && confirmPassword.length > 0 && (
                                <p className={`mt-1.5 text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"
                                    }`}>
                                    {passwordsMatch ? <Check size={13} /> : <X size={13} />}
                                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                </p>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                                <p className="text-red-600 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full py-2.5 rounded-lg bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Resetting...
                                </span>
                            ) : (
                                "Reset password"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

function RuleHint({ met, label }) {
    return (
        <span className={`text-xs flex items-center gap-1 transition-colors ${met ? "text-green-600" : "text-[#A0958A]"
            }`}>
            {met ? <Check size={12} /> : <X size={12} />}
            {label}
        </span>
    );
}