import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin({ setActiveLink }) {
  const { loginAdmin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password);
      setActiveLink("admin-dashboard");
    } catch (err) {
      setError(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-[#fdfbf7]">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-200/80 transition-all">

        {/* Brand / Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2C1810] text-[#fdfbf7] font-bold text-lg tracking-wider mb-3 shadow-md">
            YS
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2C1810] tracking-tight">
            Yuhum Studios
          </h1>
          <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">
            Admin Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@yuhumstudios.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:border-[#2C1810] focus:ring-1 focus:ring-[#2C1810] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2C1810] text-[#fdfbf7] font-medium py-3 px-4 text-sm tracking-wide shadow-lg shadow-stone-900/10 hover:bg-[#1a0e09] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {loading ? (
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

        <div className="mt-8 text-center text-xs text-stone-400">
          Restricted access. Authorized personnel only.
        </div>
      </div>
    </div>
  );
}