import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  House,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/authService";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  // /signup?role=agent preselects the Agent option.
  const [role, setRole] = useState(
    searchParams.get("role") === "agent" ? "agent" : "customer"
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Your name must contain between 2 and 80 characters.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 128) {
      setError("Your password must contain between 8 and 128 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: form.password,
        role,
      });

      // The backend should return a token and user after registration.
      // Whether this automatically logs the user in depends on useAuth.
      setSuccess(
        result?.message ||
          "Your account has been created successfully. You can now sign in."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        getErrorMessage(err, "Registration failed. Please try again.")
      );
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
          Back to HavenEstate
        </Link>

        <div className="my-auto grid overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm lg:grid-cols-2">
          {/* Left promotional section */}
          <section className="flex flex-col justify-between bg-[#20251f] p-7 text-white sm:p-12 lg:min-h-[760px]">
            <Link to="/" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e1c58a] text-[#20251f]">
                <House size={23} />
              </span>

              <span className="text-xl font-semibold tracking-tight">
                Haven<span className="text-[#e1c58a]">Estate</span>
              </span>
            </Link>

            <div className="my-12">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#e1c58a]">
                Create your account
              </p>

              <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Find a place for your next chapter.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                Create your account to start exploring property opportunities
                with HavenEstate.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85"
                alt="Contemporary residential property"
                className="h-48 w-full object-cover sm:h-56"
              />
            </div>

            <p className="mt-6 text-xs text-white/45">
              A thoughtful start to your property journey.
            </p>
          </section>

          {/* Registration form */}
          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                Get started
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Create an account
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your details to get started with HavenEstate.
              </p>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div
                  role="status"
                  className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
                >
                  <p>{success}</p>

                  <p className="mt-3">
                    Ready to continue?{" "}
                    <Link
                      to="/login"
                      className="font-semibold underline underline-offset-2"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              )}

              {/* Account type selection */}
              <div className="mt-7">
                <p className="mb-2 text-sm font-medium">I want to</p>

                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
                  {[
                    { value: "customer", label: "Find a property" },
                    { value: "agent", label: "List properties" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={role === option.value}
                      onClick={() => {
                        setRole(option.value);
                        setError("");
                        setSuccess("");
                      }}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        role === option.value
                          ? "bg-[#20251f] text-white shadow-sm"
                          : "text-stone-500 hover:text-[#20251f]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 focus-within:border-[#a17b38]">
                    <UserRound
                      size={18}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={form.name}
                      onChange={updateField}
                      placeholder="Your full name"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email address
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 focus-within:border-[#a17b38]">
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

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    Phone number
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 focus-within:border-[#a17b38]">
                    <Phone size={18} className="shrink-0 text-gray-400" />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={form.phone}
                      onChange={updateField}
                      placeholder="+234..."
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 focus-within:border-[#a17b38]">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      value={form.password}
                      onChange={updateField}
                      placeholder="At least 8 characters"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
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

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm password
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 focus-within:border-[#a17b38]">
                    <LockKeyhole
                      size={18}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      value={form.confirmPassword}
                      onChange={updateField}
                      placeholder="Re-enter your password"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="shrink-0 text-gray-400 hover:text-[#20251f]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}

                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#82632e] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}