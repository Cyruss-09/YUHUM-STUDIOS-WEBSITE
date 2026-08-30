import { useState } from "react";

export default function ForgotPassword({ setActiveLink }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | sent | error
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error("Something went wrong. Please try again.");

            setStatus("sent");
        } catch (err) {
            setStatus("error");
            setErrorMsg(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 bg-[#FBF9F5]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8DFD1] p-8">
                <h1 className="text-2xl font-semibold text-[#2C221E] mb-2">
                    Forgot your password?
                </h1>

                {status === "sent" ? (
                    <div className="text-[#7A6B63] text-sm mt-4">
                        If an account exists for <span className="font-medium">{email}</span>,
                        we've sent a password reset link to that email address. Check your inbox
                        (and spam folder).
                    </div>
                ) : (
                    <>
                        <p className="text-[#7A6B63] text-sm mb-6">
                            Enter the email associated with your account and we'll send you a link
                            to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#A3704C] text-[#2C221E]"
                            />

                            {status === "error" && (
                                <p className="text-red-600 text-sm">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-2.5 rounded-lg bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium transition disabled:opacity-60"
                            >
                                {status === "loading" ? "Sending..." : "Send reset link"}
                            </button>
                        </form>
                    </>
                )}

                <button
                    type="button"
                    onClick={() => setActiveLink("register")}
                    className="mt-6 text-sm text-[#8C5A35] hover:underline"
                >
                    ← Back to login
                </button>
            </div>
        </div>
    );
}