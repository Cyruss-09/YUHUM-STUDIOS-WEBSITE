import { useState } from "react";

export default function ResetPassword({ token, setActiveLink }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (password.length < 8) {
            setErrorMsg("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
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
                <h1 className="text-2xl font-semibold text-[#2C221E] mb-2">
                    Reset your password
                </h1>

                {status === "success" ? (
                    <div className="mt-4">
                        <p className="text-[#7A6B63] text-sm mb-4">
                            Your password has been reset successfully.
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
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#A3704C] text-[#2C221E]"
                        />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#A3704C] text-[#2C221E]"
                        />

                        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-2.5 rounded-lg bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium transition disabled:opacity-60"
                        >
                            {status === "loading" ? "Resetting..." : "Reset password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}