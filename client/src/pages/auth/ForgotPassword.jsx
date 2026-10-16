
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  getErrorMessage,
  requestPasswordReset,
} from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await requestPasswordReset(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to request a password reset."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#20251f]">
      <Navbar />
      <section className="mx-auto my-16 max-w-lg rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b38]">
          Account recovery
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your account email. If an account exists, we'll send you a link to reset your password.
        </p>

        {message && (
          <p role="status" className="mt-5 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-800">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="reset-email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none focus:border-[#a17b38]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#20251f] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#343b32] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-7 text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-[#82632e] hover:underline">
            Sign in
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
