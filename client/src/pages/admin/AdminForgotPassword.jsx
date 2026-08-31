// src/pages/admin/AdminForgotPassword.jsx
import { useState } from "react";

export default function AdminForgotPassword({ setActiveLink }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/admin/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Admin password reset link has been sent to your email.");
                setEmail("");
            } else {
                setError(data.message || "Failed to send reset email.");
            }
        } catch (err) {
            console.error(err);
            setError("Server connection failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-stone-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2C1810]">Admin Portal</h2>
                    <p className="text-sm text-stone-600 mt-1">
                        Forgot your administrator password? Enter your email to receive a reset link.
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                            Admin Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@yuhumstudios.com"
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C1810]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#2C1810] text-[#fdfbf7] font-semibold rounded-lg hover:bg-stone-800 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? "Sending Link..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setActiveLink("admin-login")}
                        className="text-sm text-stone-600 hover:text-[#2C1810] underline"
                    >
                        Back to Admin Login
                    </button>
                </div>
            </div>
        </div>
    );
}