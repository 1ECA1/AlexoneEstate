import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  MapPin,
  Clock3,
  CheckCircle2,
  XCircle,
  Building2,
  Send,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import api from "../../services/api";

const statusStyles = {
  new: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  "in progress": "bg-blue-50 text-blue-700",
  "viewing scheduled": "bg-violet-50 text-violet-700",
  responded: "bg-emerald-50 text-emerald-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-stone-100 text-stone-600",
  rejected: "bg-rose-50 text-rose-700",
};

function getStatus(inquiry) {
  return String(inquiry.status || "pending")
    .toLowerCase()
    .replaceAll("_", " ");
}

function StatusBadge({ status }) {
  const normalized = statusStyles[status] ? status : "pending";

  const Icon =
    normalized === "responded" || normalized === "resolved"
      ? CheckCircle2
      : normalized === "rejected" || normalized === "closed"
        ? XCircle
        : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        statusStyles[normalized]
      }`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getProperty(inquiry) {
  return inquiry.property || inquiry.propertyId || {};
}

function getPropertyId(inquiry) {
  const property = getProperty(inquiry);

  return typeof property === "object"
    ? property._id || property.id || inquiry.propertyId
    : property || inquiry.propertyId;
}

function getPropertyImage(property) {
  if (property.image) return property.image;

  if (Array.isArray(property.images)) {
    const firstImage = property.images[0];

    if (typeof firstImage === "string") return firstImage;

    return firstImage?.url || firstImage?.imageUrl || "";
  }

  return "";
}

export default function CustomerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadInquiries = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data } = await api.get("/inquiries/customer");

      const result = Array.isArray(data)
        ? data
        : data.inquiries || data.data || [];

      setInquiries(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't load your inquiries. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const awaitingResponseCount = inquiries.filter((item) =>
    ["new", "pending", "contacted", "in progress"].includes(getStatus(item))
  ).length;

  const respondedCount = inquiries.filter(
    (item) =>
      Boolean(item.agentResponse || item.adminResponse) ||
      ["responded", "resolved", "closed"].includes(getStatus(item))
  ).length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#20251f]"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
              Your conversations
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              My Inquiries
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Track your property questions, read agent responses, and view
              replies from the HavenEstate administration team.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadInquiries(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {!loading && !error && (
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Total inquiries</p>
              <p className="mt-2 text-3xl font-semibold">
                {inquiries.length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Awaiting response</p>
              <p className="mt-2 text-3xl font-semibold">
                {inquiries.filter(
                  (item) =>
                    !item.agentResponse &&
                    !item.adminResponse &&
                    ["new", "pending", "contacted", "in progress"].includes(
                      getStatus(item)
                    )
                ).length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">Responded</p>
              <p className="mt-2 text-3xl font-semibold">
                {respondedCount}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => loadInquiries()}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white px-6 py-20 text-center">
            <RefreshCw
              size={25}
              className="mx-auto animate-spin text-[#a17b38]"
            />

            <p className="mt-4 text-sm text-stone-500">
              Loading your inquiries...
            </p>
          </div>
        ) : !error && inquiries.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5f2e9] text-[#a17b38]">
              <MessageSquare size={29} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">No inquiries yet</h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-500">
              When you contact an agent about a property, your message and
              replies will appear here.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343a32]"
            >
              <Building2 size={17} />
              Find a Property
            </Link>
          </div>
        ) : !error ? (
          <div className="mt-8 space-y-5">
            {inquiries.map((inquiry) => {
              const property = getProperty(inquiry);
              const propertyId = getPropertyId(inquiry);
              const image = getPropertyImage(property);
              const status = getStatus(inquiry);

              const agentResponse =
                inquiry.agentResponse ||
                inquiry.response ||
                inquiry.responseMessage ||
                "";

              const adminResponse = inquiry.adminResponse || "";

              return (
                <article
                  key={inquiry._id || inquiry.id}
                  className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                    <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:h-36 sm:w-48">
                      {image ? (
                        <img
                          src={image}
                          alt={property.title || "Property"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-400">
                          <Building2 size={35} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={status} />

                        <span className="text-xs text-stone-400">
                          Sent {formatDate(inquiry.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold">
                        {inquiry.subject || "Property inquiry"}
                      </h2>

                      <p className="mt-1 font-medium text-stone-700">
                        {property.title || "Property details unavailable"}
                      </p>

                      {property.location && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                          <MapPin size={15} />
                          {property.location}
                        </p>
                      )}

                      {propertyId && property.title && (
                        <Link
                          to={`/properties/${propertyId}`}
                          className="mt-3 inline-flex items-center text-sm font-semibold text-[#8c6b2e] hover:underline"
                        >
                          View property
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 bg-stone-50/60 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MessageSquare size={16} className="text-[#a17b38]" />
                      Your message
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                      {inquiry.message || "No message was provided."}
                    </p>

                    {/* Agent response */}
                    <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#20251f]">
                        <Send size={16} className="text-[#a17b38]" />
                        Agent response
                      </div>

                      {agentResponse ? (
                        <>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                            {agentResponse}
                          </p>

                          {inquiry.respondedAt && (
                            <p className="mt-3 text-xs text-stone-400">
                              Responded {formatDate(inquiry.respondedAt)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-stone-500">
                          The agent has not responded yet.
                        </p>
                      )}
                    </div>

                    {/* Administrator response */}
                    <div className="mt-4 rounded-2xl border border-[#e4d6b7] bg-[#f8f5ed] p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#80602b]">
                        <ShieldCheck size={17} />
                        HavenEstate administrator
                      </div>

                      {adminResponse ? (
                        <>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#343b32]">
                            {adminResponse}
                          </p>

                          {inquiry.adminRespondedAt && (
                            <p className="mt-3 text-xs text-stone-500">
                              Replied {formatDate(inquiry.adminRespondedAt)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-stone-500">
                          No administrator reply yet. If the administration
                          responds to your inquiry, their message will appear
                          here.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}