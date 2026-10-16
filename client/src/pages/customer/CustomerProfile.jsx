
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
};

export default function CustomerProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/auth/me");

        if (active) {
          setForm({
            name: data.user?.name || "",
            email: data.user?.email || "",
            phone: data.user?.phone || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your profile. Please sign in again and retry."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.patch("/auth/me", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      const updatedUser = data.user;

      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setMessage(
        data.message || "Your profile has been updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-200 bg-[#faf9f6] px-4 py-3 text-sm text-[#20251f] outline-none transition placeholder:text-stone-400 focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/15 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-10 text-[#20251f] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#20251f]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-6 py-8 sm:px-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#20251f] text-[#e1c58a]">
              <UserRound size={27} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a17b38]">
              Account settings
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              My Profile
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
              Manage your personal information so agents can reach you when
              you enquire about a property.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-stone-500">
                <LoaderCircle size={21} className="animate-spin" />
                Loading your profile...
              </div>
            ) : (
              <>
                {message && (
                  <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                  >
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold"
                    >
                      Full name
                    </label>

                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        minLength={2}
                        maxLength={80}
                        required
                        disabled={saving}
                        placeholder="Enter your full name"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="you@example.com"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      Your email must be unique to your account.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-semibold"
                    >
                      Phone number
                      <span className="ml-2 font-normal text-stone-400">
                        Optional
                      </span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Enter your phone number"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      {saving ? "Saving changes..." : "Save changes"}
                    </button>

                    <Link
                      to="/properties"
                      className="inline-flex items-center justify-center rounded-full border border-stone-200 px-7 py-3.5 text-sm font-semibold text-[#20251f] transition hover:bg-stone-50"
                    >
                      Browse properties
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
