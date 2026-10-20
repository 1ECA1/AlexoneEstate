
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import Logo from "../../components/common/Logo";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  House,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isLoggedIn } = useAuth();

  const redirectTo = location.state?.from || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!shouldRedirect || !isLoggedIn || !user) return;

    const role = String(user.role || "").toLowerCase();

    const defaultRoutes = {
      customer: "/customer",
      agent: "/agent",
      admin: "/admin",
    };

    const requestedPath =
      typeof redirectTo === "string"
        ? redirectTo
        : redirectTo?.pathname || "/";

    const destination =
      requestedPath !== "/"
        ? requestedPath
        : defaultRoutes[role] || "/";

    navigate(destination, { replace: true });
  }, [shouldRedirect, isLoggedIn, user, redirectTo, navigate]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      setShouldRedirect(true);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] p-4 text-[#20251f] sm:p-8">
      <Navbar />

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#a17b38]"
        >
          <ArrowLeft size={17} />
          Back to RealEstateConsultDesign
        </Link>

        <div className="my-auto grid overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm lg:grid-cols-2">
          <section className="flex flex-col justify-between bg-[#20251f] p-7 text-white sm:p-12 lg:min-h-[680px]">
                    {/* Logo */}
          <Logo />

            <div className="my-12">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#e1c58a]">
                Welcome back
              </p>

              <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Your next chapter starts at home.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                Sign in to continue your property journey and keep everything
                you need in one place.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85"
                alt="Modern home with a warm and welcoming interior"
                className="h-48 w-full object-cover sm:h-56"
              />
            </div>

            <p className="mt-6 text-xs text-white/45">
              Find your place. Make it yours.
            </p>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-12 lg:p-14">
            <div className="w-full max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                Your account
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your account details to access RealEstateConsultDesign.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email address
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 transition focus-within:border-[#a17b38]">
                    <Mail size={18} className="shrink-0 text-gray-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={updateField}
                      placeholder="you@example.com"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#82632e] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 transition focus-within:border-[#a17b38]">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={updateField}
                      placeholder="Enter your password"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="shrink-0 text-gray-400 hover:text-[#20251f]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in to your account"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                New to RealEstateConsultDesign?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#82632e] hover:underline"
                >
                  Create an account
                </Link>
              </p>

              <p className="mt-8 text-center text-xs leading-5 text-gray-400">
                By signing in, you agree to use RealEstateConsultDesign in accordance with
                its applicable terms and privacy policy.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
