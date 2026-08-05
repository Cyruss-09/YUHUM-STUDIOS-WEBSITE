import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

// Reusable email/password form. `onSuccess(user)` fires after a successful
// login so each page (customer vs admin) can decide where to redirect and
// whether the returned role is actually allowed in.
export const LoginForm = ({ onSuccess, submitLabel = "Log In" }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      onSuccess?.(user);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-amber-950 font-semibold text-sm py-2 rounded-md transition-colors"
      >
        {submitting ? "Logging in…" : submitLabel}
      </button>
    </form>
  );
};
