
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  getErrorMessage,
  resetPassword,
} from "../../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Your password must contain 8–128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset your password."));
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
        <h1 className="mt-3 text-3xl font-semibold">Create a new password</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Choose a new password with at least eight characters.
        </p>

        {message && (
          <p role="status" className="mt-5 rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-800">
            {message}{" "}
            <Link to="/login" className="font-semibold underline">
              Sign in
            </Link>
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none focus:border-[#a17b38]"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 py-3.5 text-sm outline-none focus:border-[#a17b38]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token || Boolean(message)}
            className="w-full rounded-full bg-[#20251f] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#343b32] disabled:opacity-60"
          >
            {loading ? "Updating…" : "Reset password"}
          </button>
        </form>

        <p className="mt-7 text-sm text-gray-600">
          <Link to="/forgot-password" className="font-semibold text-[#82632e] hover:underline">
            Request another reset link
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
