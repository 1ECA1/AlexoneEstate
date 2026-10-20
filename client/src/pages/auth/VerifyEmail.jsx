
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  getErrorMessage,
  resendVerification,
  verifyEmail,
} from "../../services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let active = true;

    verifyEmail(token)
      .then((result) => {
        if (active) setMessage(result.message);
      })
      .catch((err) => {
        if (active) {
          setError(
            getErrorMessage(err, "This verification link is invalid or expired.")
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleResend(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResending(true);

    try {
      const result = await resendVerification(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to request another verification email."));
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#20251f]">
      <Navbar />
      <section className="mx-auto my-16 max-w-lg rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b38]">
          RealEstateConsultDesign account
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {token ? "Verify your email" : "Resend verification"}
        </h1>

        {loading && <p className="mt-5 text-sm text-gray-600">Verifying your email…</p>}

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

        {!loading && !message && (
          <form onSubmit={handleResend} className="mt-6 space-y-4">
            <p className="text-sm leading-6 text-gray-600">
              Enter the email address you used to register. If your account needs verification, we'll send a new link.
            </p>
            <label htmlFor="verification-email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="verification-email"
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
              disabled={resending}
              className="w-full rounded-full bg-[#20251f] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#343b32] disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          </form>
        )}

        <p className="mt-7 text-sm text-gray-600">
          Ready to sign in?{" "}
          <Link to="/login" className="font-semibold text-[#82632e] hover:underline">
            Go to login
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
