import { useState, useEffect, useRef } from "react";

export default function AdminResetPassword({ setActiveLink }) {
    const [token, setToken] = useState(null);
    const [checkingToken, setCheckingToken] = useState(true);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [touched, setTouched] = useState({ password: false, confirm: false });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const passwordRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");
        setToken(t);
        setCheckingToken(false);
    }, []);

    useEffect(() => {
        if (!checkingToken && token) passwordRef.current?.focus();
    }, [checkingToken, token]);

    const passwordIsValid = password.length >= 6;
    const passwordsMatch = password === confirmPassword;
    const canSubmit = passwordIsValid && passwordsMatch && confirmPassword.length > 0 && !loading;

    const passwordError = touched.password && password.length > 0 && !passwordIsValid;
    const confirmError = touched.confirm && confirmPassword.length > 0 && !passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ password: true, confirm: true });
        if (!passwordIsValid || !passwordsMatch) return;

        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/admin/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Couldn't reset password.");
            setDone(true);
        } catch (err) {
            setError(err.message || "Reset link is invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    // --- No token in URL at all ---
    if (checkingToken) return null;

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-[#fdfbf7]">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-200/80 text-center">
                    <p className="text-sm text-stone-600 mb-6">
                        This reset link is missing or invalid. Request a new one from the admin login page.
                    </p>
                    <button
                        type="button"
                        onClick={() => setActiveLink("admin-login")}
                        className="text-xs font-medium text-[#2C1810] hover:underline underline-offset-2"
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-[#fdfbf7]">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-200/80 transition-all">

                {/* Brand / Header Section */}
                <div className="text-center mb-8">
                    <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2C1810] text-[#fdfbf7] font-bold text-lg tracking-wider mb-3 shadow-md transition-transform duration-500 ${done ? "scale-110" : ""}`}
                    >
                        YS
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-[#2C1810] tracking-tight">
                        Yuhum Studios
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">
                        Reset Admin Password
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium animate-shake"
                    >
                        {error}
                    </div>
                )}

                {done ? (
                    <div className="text-center">
                        <div className="mb-6 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center justify-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Password updated
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveLink("admin-login")}
                            className="w-full rounded-xl bg-[#2C1810] text-[#fdfbf7] font-medium py-3 px-4 text-sm tracking-wide shadow-lg shadow-stone-900/10 hover:bg-[#1a0e09] active:scale-[0.99] transition-all duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* New password */}
                        <div>
                            <label
                                htmlFor="new-password"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-stone-600"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    ref={passwordRef}
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                    aria-invalid={passwordError}
                                    aria-describedby={passwordError ? "password-error" : undefined}
                                    className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 pr-10 text-sm text-stone-800 placeholder-stone-400 focus:bg-white outline-none transition-all ${passwordError
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
                            {passwordError && (
                                <p id="password-error" className="mt-1.5 text-xs text-red-500">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label
                                htmlFor="confirm-password"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2 text-stone-600"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                                aria-invalid={confirmError}
                                aria-describedby={confirmError ? "confirm-error" : undefined}
                                className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:bg-white outline-none transition-all ${confirmError
                                    ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                    : "border-stone-300 focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810]"
                                    }`}
                                required
                            />
                            {confirmError && (
                                <p id="confirm-error" className="mt-1.5 text-xs text-red-500">
                                    Passwords don't match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full rounded-xl bg-[#2C1810] text-[#fdfbf7] font-medium py-3 px-4 text-sm tracking-wide shadow-lg shadow-stone-900/10 hover:bg-[#1a0e09] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 mt-2"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-xs text-stone-400">
                    Restricted access. Authorized personnel only.
                </div>
            </div>
        </div>
    );
}