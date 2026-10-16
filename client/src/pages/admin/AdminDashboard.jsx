import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  Trash2,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchAdminProperties,
  fetchUsers,
  setPropertyApproval,
  setUserActive,
  fetchAdminInquiries,
  respondToInquiryAsAdmin,
} from "../../services/adminService";
import { deleteProperty } from "../../services/propertyService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const formatDate = (value) => {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-rose-50 text-rose-700",
};

const statusIcons = {
  approved: CheckCircle2,
  pending: Clock3,
  rejected: XCircle,
};

const roleStyles = {
  admin: "bg-[#20251f] text-white",
  agent: "bg-[#f5f2e9] text-[#8c6b2e]",
  customer: "bg-stone-100 text-stone-600",
};

function StatusBadge({ status }) {
  const Icon = statusIcons[status] || Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      <Icon size={14} />
      {status || "pending"}
    </span>
  );
}

/* -------------------------------------------------------
   PROPERTY LISTINGS
------------------------------------------------------- */

function ListingsPanel() {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't load the listings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      pending: properties.filter((p) => p.approvalStatus === "pending").length,
      approved: properties.filter((p) => p.approvalStatus === "approved").length,
      rejected: properties.filter((p) => p.approvalStatus === "rejected").length,
      all: properties.length,
    }),
    [properties]
  );

  const visible =
    filter === "all"
      ? properties
      : properties.filter((p) => p.approvalStatus === filter);

  async function review(property, approvalStatus) {
    setBusyId(property.id);

    try {
      const updated = await setPropertyApproval(
        property.id,
        approvalStatus
      );

      setProperties((current) =>
        current.map((item) =>
          item.id === property.id
            ? {
                ...item,
                approvalStatus: updated?.approvalStatus || approvalStatus,
              }
            : item
        )
      );
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to update this listing."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(property) {
    const confirmed = window.confirm(
      `Permanently delete "${property.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(property.id);

    try {
      await deleteProperty(property.id);

      setProperties((current) =>
        current.filter((item) => item.id !== property.id)
      );
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to delete this listing."
      );
    } finally {
      setBusyId(null);
    }
  }

  const filters = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:px-7 sm:py-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item.value
                  ? "bg-[#20251f] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {item.label} ({counts[item.value]})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-7">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="px-6 py-20 text-center text-sm text-stone-500">
          Loading listings...
        </div>
      ) : !error && visible.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-stone-500">
          {filter === "pending"
            ? "No listings are waiting for review. 🎉"
            : "No listings in this view."}
        </div>
      ) : !error ? (
        <div className="divide-y divide-stone-100">
          {visible.map((property) => (
            <article
              key={property.id}
              className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7"
            >
              <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:h-32 sm:w-44">
                {property.image || property.images?.[0] ? (
                  <img
                    src={property.image || property.images?.[0]}
                    alt={property.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    <Building2 size={34} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={property.approvalStatus} />

                  <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
                    {property.status}
                  </span>

                  <span className="text-xs text-stone-400">
                    {property.images?.length || (property.image ? 1 : 0)} photo
                    {(property.images?.length || (property.image ? 1 : 0)) ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold">{property.title}</h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                  <MapPin size={15} />
                  {property.location}
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatPrice(property.price)}
                  {property.pricePeriod && property.pricePeriod !== "none" && (
                    <span className="ml-1 text-xs font-medium text-stone-500">
                      / {property.pricePeriod}
                    </span>
                  )}
                </p>

                <p className="mt-2 text-xs text-stone-500">
                  {property.agent?.name ? (
                    <>
                      Listed by{" "}
                      <span className="font-semibold text-[#20251f]">
                        {property.agent.name}
                      </span>
                      {property.agent.email && ` · ${property.agent.email}`}
                    </>
                  ) : (
                    "No agent assigned (sample listing)"
                  )}

                  {property.createdAt && ` · ${formatDate(property.createdAt)}`}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 sm:w-36 sm:flex-col">
                {property.approvalStatus !== "approved" && (
                  <button
                    type="button"
                    onClick={() => review(property, "approved")}
                    disabled={busyId === property.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    Approve
                  </button>
                )}

                {property.approvalStatus !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => review(property, "rejected")}
                    disabled={busyId === property.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50 disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                )}

                {property.approvalStatus === "approved" && (
                  <Link
                    to={`/properties/${property.id}`}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50"
                  >
                    View <ArrowUpRight size={14} />
                  </Link>
                )}

                <Link
                  to={`/admin/properties/${property.id}/edit`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d9c59c] px-4 py-2.5 text-sm font-semibold text-[#8c6b2e] transition hover:bg-[#f5f2e9]"
                >
                  Edit Property
                </Link>

                <button
                  type="button"
                  onClick={() => remove(property)}
                  disabled={busyId === property.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------
   USER MANAGEMENT
------------------------------------------------------- */

function UsersPanel({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't load the users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(account) {
    const action = account.isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `${action === "deactivate" ? "Deactivate" : "Reactivate"} ${account.name}?`
    );

    if (!confirmed) return;

    setBusyId(account.id);

    try {
      const updated = await setUserActive(account.id, !account.isActive);

      setUsers((current) =>
        current.map((item) => (item.id === account.id ? updated : item))
      );
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to update this account."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-stone-100 p-5 sm:px-7 sm:py-6">
        <p className="text-sm text-stone-500">
          {loading ? "Loading..." : `${users.length} accounts`}
        </p>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-7">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="px-6 py-16 text-center text-sm text-stone-500">
          Loading accounts...
        </div>
      ) : !error && users.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-stone-500">
          No accounts found.
        </div>
      ) : !error ? (
        <div className="divide-y divide-stone-100">
          {users.map((account) => {
            const isSelf = account.id === currentUserId;
            const locked = isSelf || account.role === "admin";

            return (
              <article
                key={account.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{account.name}</h3>

                    {isSelf && (
                      <span className="text-xs text-stone-400">(you)</span>
                    )}

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                        roleStyles[account.role] || roleStyles.customer
                      }`}
                    >
                      {account.role}
                    </span>

                    {!account.isActive && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                        Deactivated
                      </span>
                    )}
                  </div>

                  <p className="mt-1 break-all text-sm text-stone-500">
                    {account.email}
                    {account.phone && ` · ${account.phone}`}
                  </p>

                  <p className="mt-1 text-xs text-stone-400">
                    Joined {formatDate(account.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive(account)}
                  disabled={locked || busyId === account.id}
                  title={
                    locked
                      ? "Admin accounts and your own account cannot be changed here"
                      : undefined
                  }
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    account.isActive
                      ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {account.isActive ? (
                    <>
                      <UserX size={15} />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} />
                      Reactivate
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------
   ADMIN INQUIRIES
------------------------------------------------------- */

const inquiryStatusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "viewing_scheduled", label: "Viewing scheduled" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const inquiryStatusStyles = {
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  viewing_scheduled: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-stone-100 text-stone-600",
};

function InquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [statuses, setStatuses] = useState({});
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await fetchAdminInquiries();
      const rows = Array.isArray(data) ? data : [];

      setInquiries(rows);

      setDrafts((current) => {
        const next = { ...current };

        rows.forEach((item) => {
          if (!(item._id in next)) {
            next[item._id] = item.adminResponse || "";
          }
        });

        return next;
      });

      setStatuses((current) => {
        const next = { ...current };

        rows.forEach((item) => {
          if (!(item._id in next)) {
            next[item._id] = item.status || "new";
          }
        });

        return next;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't load inquiries. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const result = { all: inquiries.length };

    inquiryStatusOptions.forEach(({ value }) => {
      result[value] = inquiries.filter((item) => item.status === value).length;
    });

    return result;
  }, [inquiries]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? inquiries
        : inquiries.filter((item) => item.status === filter),
    [inquiries, filter]
  );

  async function saveInquiry(inquiry) {
    const id = inquiry._id;
    const adminResponse = drafts[id] ?? "";
    const status = statuses[id] || inquiry.status || "new";

    if (adminResponse.trim().length > 3000) {
      setError("Your reply cannot exceed 3000 characters.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const updated = await respondToInquiryAsAdmin(id, {
        adminResponse,
        status,
      });

      setInquiries((current) =>
        current.map((item) => (item._id === id ? updated : item))
      );

      setDrafts((current) => ({
        ...current,
        [id]: updated.adminResponse || "",
      }));

      setStatuses((current) => ({
        ...current,
        [id]: updated.status || status,
      }));

      setNotice("Inquiry updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save this reply. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:px-7 sm:py-6">
        <div>
          <h2 className="text-lg font-semibold">Customer inquiries</h2>
          <p className="mt-1 text-sm text-stone-500">
            Review messages, agent responses, and send administrator replies.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-stone-100 p-5 sm:px-7">
        {[{ value: "all", label: "All" }, ...inquiryStatusOptions].map(
          (item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                filter === item.value
                  ? "bg-[#20251f] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {item.label} ({counts[item.value] || 0})
            </button>
          )
        )}
      </div>

      {error && (
        <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-7">
          {error}
          <button
            type="button"
            onClick={load}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {notice && (
        <p
          role="status"
          className="mx-5 mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 sm:mx-7"
        >
          {notice}
        </p>
      )}

      {loading ? (
        <div className="px-6 py-16 text-center text-sm text-stone-500">
          Loading inquiries...
        </div>
      ) : !error && visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <MessageSquare size={30} className="mx-auto text-stone-300" />
          <p className="mt-3 text-sm text-stone-500">
            {filter === "all"
              ? "No customer inquiries yet."
              : "No inquiries match this status."}
          </p>
        </div>
      ) : !error ? (
        <div className="divide-y divide-stone-100">
          {visible.map((inquiry) => {
            const property =
              inquiry.property && typeof inquiry.property === "object"
                ? inquiry.property
                : null;

            const customer =
              inquiry.customer && typeof inquiry.customer === "object"
                ? inquiry.customer
                : null;

            const agent =
              inquiry.agent && typeof inquiry.agent === "object"
                ? inquiry.agent
                : null;

            const firstImage = property?.images?.[0];
            const image =
              (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
              property?.image;

            return (
              <article key={inquiry._id} className="space-y-5 p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {image ? (
                    <img
                      src={image}
                      alt={property?.title || "Property"}
                      loading="lazy"
                      className="h-36 w-full shrink-0 rounded-2xl bg-stone-100 object-cover sm:w-44"
                    />
                  ) : (
                    <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 sm:w-44">
                      <Building2 size={30} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          inquiryStatusStyles[inquiry.status] ||
                          inquiryStatusStyles.new
                        }`}
                      >
                        {inquiryStatusOptions.find(
                          (item) => item.value === inquiry.status
                        )?.label || inquiry.status || "New"}
                      </span>

                      <span className="text-xs text-stone-400">
                        Received {formatDate(inquiry.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {property?.title || "Property inquiry"}
                    </h3>

                    {property?.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                        <MapPin size={14} />
                        {property.location}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-stone-600">
                      <span className="font-semibold text-[#20251f]">
                        Customer:
                      </span>{" "}
                      {customer?.name || "Unknown customer"}
                    </p>

                    {customer?.email && (
                      <p className="mt-1 break-all text-sm text-stone-500">
                        {customer.email}
                      </p>
                    )}

                    {customer?.phone && (
                      <p className="mt-1 text-sm text-stone-500">
                        {customer.phone}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-stone-500">
                      Assigned agent:{" "}
                      <span className="font-medium text-[#20251f]">
                        {agent?.name || "No agent details"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Customer message
                  </p>
                  <h4 className="mt-2 font-semibold">
                    {inquiry.subject || "Property inquiry"}
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                    {inquiry.message}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Agent response
                  </p>

                  {inquiry.agentResponse ? (
                    <>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                        {inquiry.agentResponse}
                      </p>
                      {inquiry.respondedAt && (
                        <p className="mt-2 text-xs text-stone-400">
                          Replied {formatDate(inquiry.respondedAt)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-stone-400">
                      The agent has not responded yet.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`inquiry-status-${inquiry._id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Inquiry status
                    </label>

                    <select
                      id={`inquiry-status-${inquiry._id}`}
                      value={
                        statuses[inquiry._id] || inquiry.status || "new"
                      }
                      onChange={(event) =>
                        setStatuses((current) => ({
                          ...current,
                          [inquiry._id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#a17b38] sm:max-w-xs"
                    >
                      {inquiryStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`admin-reply-${inquiry._id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Administrator reply
                    </label>

                    <textarea
                      id={`admin-reply-${inquiry._id}`}
                      value={drafts[inquiry._id] ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [inquiry._id]: event.target.value,
                        }))
                      }
                      maxLength={3000}
                      rows={4}
                      placeholder="Write a reply to the customer..."
                      className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#a17b38]"
                    />

                    <p className="mt-1 text-right text-xs text-stone-400">
                      {(drafts[inquiry._id] || "").length}/3000
                    </p>

                    {inquiry.adminRespondedAt && (
                      <p className="text-xs text-stone-400">
                        Last administrator reply:{" "}
                        {formatDate(inquiry.adminRespondedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-stone-400">
                      Replies are saved to the customer's inquiry history.
                    </p>

                    <button
                      type="button"
                      onClick={() => saveInquiry(inquiry)}
                      disabled={busyId === inquiry._id}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={15} />
                      {busyId === inquiry._id
                        ? "Saving..."
                        : "Save reply & status"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------
   ADMIN DASHBOARD
------------------------------------------------------- */

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("listings");

  const tabs = [
    { value: "listings", label: "Listings", icon: Building2 },
    { value: "users", label: "Users", icon: Users },
    {
      value: "inquiries",
      label: "Messages & Inquiries",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
          Administration
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {user?.name || "Admin"}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Review submitted listings, manage accounts, and respond to
              customer inquiries.
            </p>
          </div>

          <Link
            to="/admin/properties/add"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#a17b38] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32] sm:self-center"
          >
            <Building2 size={17} />
            Add Property
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-stone-200">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === value
                  ? "border-[#20251f] text-[#20251f]"
                  : "border-transparent text-stone-500 hover:text-[#20251f]"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "listings" ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Property Listings</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Review and manage properties on HavenEstate.
                </p>
              </div>

              <ListingsPanel />
            </>
          ) : tab === "users" ? (
            <UsersPanel currentUserId={user?.id} />
          ) : (
            <InquiriesPanel />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}