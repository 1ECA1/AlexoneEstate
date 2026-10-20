
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowUpRight,
  LayoutDashboard,
  MessageSquare,
  Send,
  Mail,
  Phone,
  UserRound,
  ChevronDown,
  ChevronUp,
  Camera,
  Save,
  BriefcaseBusiness,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import {
  fetchMyProperties,
  deleteProperty,
} from "../../services/propertyService";

const statusStyles = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-rose-50 text-rose-700",
};

const inquiryStatusStyles = {
  new: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  "in progress": "bg-blue-50 text-blue-700",
  viewing_scheduled: "bg-violet-50 text-violet-700",
  "viewing scheduled": "bg-violet-50 text-violet-700",
  responded: "bg-emerald-50 text-emerald-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-stone-100 text-stone-600",
  rejected: "bg-rose-50 text-rose-700",
};

const inputStyles =
  "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#20251f] outline-none transition placeholder:text-stone-400 focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/10 disabled:cursor-not-allowed disabled:bg-stone-50";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f2e9] text-[#8c6b2e]">
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#20251f]">
        {value}
      </p>

      <p className="mt-2 text-xs text-stone-500">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = status || "pending";

  const Icon =
    value === "approved"
      ? CheckCircle2
      : value === "rejected"
        ? XCircle
        : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        statusStyles[value] || statusStyles.pending
      }`}
    >
      <Icon size={14} />
      {value}
    </span>
  );
}

function InquiryStatusBadge({ status }) {
  const normalized = String(status || "pending")
    .toLowerCase()
    .replaceAll("_", " ");

  const safeStatus = inquiryStatusStyles[normalized]
    ? normalized
    : "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
        inquiryStatusStyles[safeStatus]
      }`}
    >
      {normalized}
    </span>
  );
}

function getCustomer(inquiry) {
  return inquiry.customer || inquiry.user || {};
}

function getInquiryProperty(inquiry) {
  return inquiry.property || inquiry.propertyId || {};
}

function getInquiryId(inquiry) {
  return inquiry._id || inquiry.id;
}

function getAgentResponse(inquiry) {
  return (
    inquiry.agentResponse ||
    inquiry.response ||
    inquiry.responseMessage ||
    ""
  );
}

function getInquiryImage(property) {
  if (property.image) return property.image;

  if (Array.isArray(property.images)) {
    const firstImage = property.images[0];

    if (typeof firstImage === "string") return firstImage;
    if (firstImage?.url) return firstImage.url;
  }

  return "";
}

function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;

  return fallback;
}

export default function AgentDashboard() {
  const { user } = useAuth();

  // Agent profile
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    specialty: "",
    yearsOfExperience: 0,
    bio: "",
    profilePhotoUrl: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState(null);

  // Property management
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Customer inquiry management
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [inquiryError, setInquiryError] = useState("");
  const [refreshingInquiries, setRefreshingInquiries] = useState(false);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [responses, setResponses] = useState({});
  const [respondingId, setRespondingId] = useState(null);
  const [inquiryFeedback, setInquiryFeedback] = useState(null);

  // Load the authenticated agent's profile from the backend.
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const { data } = await api.get("/auth/me");
        const savedUser = data.user || data.data?.user || data.data || {};

        if (!active) return;

        setProfile({
          name: savedUser.name || user?.name || "",
          email: savedUser.email || user?.email || "",
          phone: savedUser.phone || user?.phone || "",
          location: savedUser.location || "",
          specialty: savedUser.specialty || "",
          yearsOfExperience: savedUser.yearsOfExperience ?? 0,
          bio: savedUser.bio || "",
          profilePhotoUrl: savedUser.profilePhotoUrl || "",
        });
      } catch (err) {
        if (!active) return;

        setProfileError(
          getErrorMessage(
            err,
            "Unable to load your profile. You can retry below."
          )
        );

        // Keep basic authentication details visible if loading fails.
        setProfile((current) => ({
          ...current,
          name: current.name || user?.name || "",
          email: current.email || user?.email || "",
          phone: current.phone || user?.phone || "",
        }));
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.name, user?.email, user?.phone]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: name === "yearsOfExperience" ? value : value,
    }));

    setProfileMessage(null);
    setProfileError("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const location = profile.location.trim();
    const specialty = profile.specialty.trim();
    const bio = profile.bio.trim();
    const years = Number(profile.yearsOfExperience);

    if (name.length < 2) {
      setProfileError("Your name must contain at least 2 characters.");
      return;
    }

    if (name.length > 80) {
      setProfileError("Your name cannot exceed 80 characters.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    if (
      profile.yearsOfExperience === "" ||
      !Number.isFinite(years) ||
      years < 0 ||
      years > 70
    ) {
      setProfileError(
        "Years of experience must be between 0 and 70."
      );
      return;
    }

    if (location.length > 120) {
      setProfileError("Location cannot exceed 120 characters.");
      return;
    }

    if (specialty.length > 100) {
      setProfileError("Specialty cannot exceed 100 characters.");
      return;
    }

    if (bio.length > 1000) {
      setProfileError("Your biography cannot exceed 1,000 characters.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");
    setProfileMessage(null);

    try {
      const { data } = await api.patch("/auth/me", {
        name,
        email,
        phone,
        location,
        specialty,
        yearsOfExperience: years,
        bio,
      });

      const savedUser = data.user || data.data?.user || data.data || {};

      setProfile((current) => ({
        ...current,
        name: savedUser.name ?? name,
        email: savedUser.email ?? email,
        phone: savedUser.phone ?? phone,
        location: savedUser.location ?? location,
        specialty: savedUser.specialty ?? specialty,
        yearsOfExperience: savedUser.yearsOfExperience ?? years,
        bio: savedUser.bio ?? bio,
        profilePhotoUrl:
          savedUser.profilePhotoUrl ?? current.profilePhotoUrl,
      }));

      setProfileMessage({
        type: "success",
        text: data.message || "Your profile has been updated successfully.",
      });
    } catch (err) {
      setProfileError(
        getErrorMessage(
          err,
          "Unable to save your profile. Please try again."
        )
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    // Let the agent select the same file again if needed.
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file.");
      setProfileMessage(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setProfileError("Your profile photo must be 5 MB or smaller.");
      setProfileMessage(null);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingPhoto(true);
    setProfileError("");
    setProfileMessage(null);

    try {
      const { data } = await api.post(
        "/uploads/agent-profile",
        formData
      );

      const savedUser =
        data.user || data.data?.user || data.data || {};

      const photoUrl =
        savedUser.profilePhotoUrl ||
        data.profilePhotoUrl ||
        data.data?.profilePhotoUrl ||
        data.image?.url ||
        data.url ||
        "";

      if (!photoUrl) {
        throw new Error(
          "The server did not return the uploaded profile photo URL."
        );
      }

      setProfile((current) => ({
        ...current,
        profilePhotoUrl: photoUrl,
      }));

      setProfileMessage({
        type: "success",
        text: data.message || "Your profile photo has been updated.",
      });
    } catch (err) {
      setProfileError(
        getErrorMessage(
          err,
          "Unable to upload your photo. Please try again."
        )
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchMyProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "We couldn't load your listings. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshingInquiries(true);
    } else {
      setLoadingInquiries(true);
    }

    setInquiryError("");
    setInquiryFeedback(null);

    try {
      const { data } = await api.get("/inquiries/agent");

      const result = Array.isArray(data)
        ? data
        : data.inquiries || data.data?.inquiries || data.data || [];

      setInquiries(Array.isArray(result) ? result : []);
    } catch (err) {
      setInquiryError(
        getErrorMessage(
          err,
          "We couldn't load customer inquiries. Please try again."
        )
      );
    } finally {
      setLoadingInquiries(false);
      setRefreshingInquiries(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadInquiries();
  }, [loadProperties, loadInquiries]);

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Delete "${property.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(property.id);

    try {
      await deleteProperty(property.id);

      setProperties((current) =>
        current.filter((item) => item.id !== property.id)
      );
    } catch (err) {
      window.alert(
        getErrorMessage(err, "Unable to delete this listing.")
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleResponseChange = (inquiryId, value) => {
    setResponses((current) => ({
      ...current,
      [inquiryId]: value,
    }));
  };

  const handleSendResponse = async (inquiry) => {
    const inquiryId = getInquiryId(inquiry);

    const response = (
      responses[inquiryId] !== undefined
        ? responses[inquiryId]
        : getAgentResponse(inquiry)
    ).trim();

    if (!response) {
      setInquiryFeedback({
        type: "error",
        inquiryId,
        message: "Please enter a response before sending.",
      });
      return;
    }

    if (response.length > 2000) {
      setInquiryFeedback({
        type: "error",
        inquiryId,
        message: "Your response cannot exceed 2,000 characters.",
      });
      return;
    }

    setRespondingId(inquiryId);
    setInquiryFeedback(null);

    try {
      const { data } = await api.patch(
        `/inquiries/agent/${inquiryId}`,
        {
          agentResponse: response,
          status: "contacted",
        }
      );

      const updatedInquiry = data.inquiry || data.data || data;

      setInquiries((current) =>
        current.map((item) =>
          String(getInquiryId(item)) === String(inquiryId)
            ? {
                ...item,
                ...updatedInquiry,
                agentResponse:
                  updatedInquiry.agentResponse ||
                  updatedInquiry.response ||
                  response,
                status: updatedInquiry.status || "responded",
              }
            : item
        )
      );

      setResponses((current) => ({
        ...current,
        [inquiryId]: "",
      }));

      setInquiryFeedback({
        type: "success",
        inquiryId,
        message: data.message || "Your response has been saved.",
      });
    } catch (err) {
      setInquiryFeedback({
        type: "error",
        inquiryId,
        message: getErrorMessage(
          err,
          "Unable to send your response. Please try again."
        ),
      });
    } finally {
      setRespondingId(null);
    }
  };

  const approved = properties.filter(
    (property) => property.approvalStatus === "approved"
  ).length;

  const pending = properties.filter(
    (property) => property.approvalStatus === "pending"
  ).length;

  const rejected = properties.filter(
    (property) => property.approvalStatus === "rejected"
  ).length;

  const unansweredInquiries = inquiries.filter((inquiry) => {
    const status = String(inquiry.status || "pending")
      .toLowerCase()
      .replaceAll("_", " ");

    return (
      !getAgentResponse(inquiry) &&
      status !== "closed" &&
      status !== "rejected"
    );
  }).length;

  const displayName =
    profile.name ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Agent";

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Dashboard heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
              Agent workspace
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {displayName}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Manage your property listings, monitor approvals, respond to
              customers, and keep your professional profile up to date.
            </p>
          </div>

          <Link
            to="/agent/properties/add"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#343a32]"
          >
            <Plus size={18} />
            Add New Property
          </Link>
        </div>

        {/* Agent profile management */}
        <section
          id="agent-profile"
          className="mt-9 overflow-hidden rounded-3xl border border-stone-200/80 bg-white"
        >
          <div className="border-b border-stone-100 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f2e9] text-[#8c6b2e]">
                <UserCircle size={23} />
              </span>

              <div>
                <h2 className="text-xl font-semibold">My Agent Profile</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Manage the professional details customers can use to learn
                  about you.
                </p>
              </div>
            </div>
          </div>

          {profileError && (
            <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:mx-7">
              <p>{profileError}</p>

              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setLoadingProfile(true);

                  api
                    .get("/auth/me")
                    .then(({ data }) => {
                      const savedUser =
                        data.user || data.data?.user || data.data || {};

                      setProfile((current) => ({
                        ...current,
                        name: savedUser.name || current.name,
                        email: savedUser.email || current.email,
                        phone: savedUser.phone || "",
                        location: savedUser.location || "",
                        specialty: savedUser.specialty || "",
                        yearsOfExperience:
                          savedUser.yearsOfExperience ?? 0,
                        bio: savedUser.bio || "",
                        profilePhotoUrl:
                          savedUser.profilePhotoUrl || "",
                      }));
                    })
                    .catch((err) => {
                      setProfileError(
                        getErrorMessage(
                          err,
                          "Unable to reload your profile."
                        )
                      );
                    })
                    .finally(() => setLoadingProfile(false));
                }}
                className="mt-2 font-semibold underline"
              >
                Retry loading profile
              </button>
            </div>
          )}

          {profileMessage && (
            <div
              className={`mx-5 mt-5 rounded-2xl border p-4 text-sm sm:mx-7 ${
                profileMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          {loadingProfile ? (
            <div className="px-6 py-14 text-center text-sm text-stone-500">
              <RefreshCw
                size={22}
                className="mx-auto animate-spin text-[#a17b38]"
              />
              <p className="mt-3">Loading your profile...</p>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="p-5 sm:p-7">
              {/* Profile photo */}
              <div className="flex flex-col gap-5 border-b border-stone-100 pb-7 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 text-[#8c6b2e]">
                  {profile.profilePhotoUrl ? (
                    <img
                      src={profile.profilePhotoUrl}
                      alt={`${profile.name || "Agent"} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={42} />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold">Profile photo</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Use a clear, professional image. JPG, PNG, or another
                    supported image format, up to 5 MB.
                  </p>

                  <label
                    className={`mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50 ${
                      uploadingPhoto
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    {uploadingPhoto ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}

                    {uploadingPhoto ? "Uploading photo..." : "Upload photo"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      disabled={uploadingPhoto}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Profile details */}
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="agent-name"
                    className="text-sm font-semibold"
                  >
                    Full name
                  </label>
                  <input
                    id="agent-name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label
                    htmlFor="agent-email"
                    className="text-sm font-semibold"
                  >
                    Email address
                  </label>
                  <input
                    id="agent-email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label
                    htmlFor="agent-phone"
                    className="text-sm font-semibold"
                  >
                    Phone number
                  </label>
                  <input
                    id="agent-phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label
                    htmlFor="agent-location"
                    className="text-sm font-semibold"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      id="agent-location"
                      name="location"
                      value={profile.location}
                      onChange={handleProfileChange}
                      maxLength={120}
                      placeholder="e.g. Abuja, Nigeria"
                      className={`${inputStyles} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="agent-specialty"
                    className="text-sm font-semibold"
                  >
                    Property specialty
                  </label>
                  <div className="relative">
                    <BriefcaseBusiness
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      id="agent-specialty"
                      name="specialty"
                      value={profile.specialty}
                      onChange={handleProfileChange}
                      maxLength={100}
                      placeholder="e.g. Residential and commercial"
                      className={`${inputStyles} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="agent-experience"
                    className="text-sm font-semibold"
                  >
                    Years of experience
                  </label>
                  <input
                    id="agent-experience"
                    name="yearsOfExperience"
                    type="number"
                    min="0"
                    max="70"
                    step="1"
                    value={profile.yearsOfExperience}
                    onChange={handleProfileChange}
                    className={inputStyles}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="agent-bio"
                    className="text-sm font-semibold"
                  >
                    Professional biography
                  </label>
                  <textarea
                    id="agent-bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    rows={5}
                    maxLength={1000}
                    placeholder="Tell customers about your experience, the areas you serve, and how you help people find the right property."
                    className={`${inputStyles} resize-y leading-7`}
                  />
                  <p className="mt-2 text-right text-xs text-stone-400">
                    {profile.bio.length}/1000 characters
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-6 text-stone-500">
                  Your profile details are saved to your RealEstateConsultDesign account.
                </p>

                <button
                  type="submit"
                  disabled={savingProfile || uploadingPhoto}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343a32] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {savingProfile ? "Saving profile..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Statistics */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Listings"
            value={properties.length}
            icon={Building2}
            description="Properties in your portfolio"
          />

          <StatCard
            title="Approved"
            value={approved}
            icon={CheckCircle2}
            description="Eligible for public display"
          />

          <StatCard
            title="Pending Review"
            value={pending}
            icon={Clock3}
            description="Waiting for admin approval"
          />

          <StatCard
            title="Rejected"
            value={rejected}
            icon={XCircle}
            description="Listings requiring attention"
          />
        </div>

        {/* Property management */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:px-7 sm:py-6">
            <div>
              <h2 className="text-xl font-semibold">My Properties</h2>
              <p className="mt-1 text-sm text-stone-500">
                Manage your listings and review their current status.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProperties}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-7">
              <p>{error}</p>
              <button
                type="button"
                onClick={loadProperties}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-20 text-center text-sm text-stone-500">
              Loading your properties...
            </div>
          ) : !error && properties.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5f2e9] text-[#8c6b2e]">
                <LayoutDashboard size={28} />
              </span>

              <h3 className="mt-5 text-lg font-semibold">
                No properties yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Your listings will appear here after you add your first
                property. You can then track its approval status and manage it.
              </p>

              <Link
                to="/agent/properties/add"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#343a32]"
              >
                <Plus size={17} />
                Add Your First Property
              </Link>
            </div>
          ) : !error ? (
            <div className="divide-y divide-stone-100">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7"
                >
                  <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:h-32 sm:w-44">
                    {property.image ? (
                      <img
                        src={property.image}
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
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {property.title}
                    </h3>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin size={15} />
                      {property.location}
                    </p>

                    <p className="mt-3 text-lg font-bold">
                      {formatPrice(property.price)}

                      {property.pricePeriod &&
                        property.pricePeriod !== "none" && (
                          <span className="ml-1 text-xs font-medium text-stone-500">
                            / {property.pricePeriod}
                          </span>
                        )}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <BedDouble size={15} />
                        {property.bedrooms ?? 0} beds
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Bath size={15} />
                        {property.bathrooms ?? 0} baths
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Maximize2 size={14} />
                        {property.area ?? 0} m²
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                    <Link
                      to={`/agent/properties/${property.id}/edit`}
                      className="rounded-full border border-stone-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-stone-50"
                    >
                      Edit
                    </Link>

                    {property.approvalStatus === "approved" && (
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50"
                      >
                        View <ArrowUpRight size={14} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(property)}
                      disabled={deletingId === property.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {deletingId === property.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <p className="mt-5 text-xs leading-6 text-stone-500">
          Note: editing a listing sends it back for approval. Only approved
          listings appear in public property searches.
        </p>

        {/* Customer inquiry management */}
        <section
          id="customer-inquiries"
          className="mt-12 overflow-hidden rounded-3xl border border-stone-200/80 bg-white"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:px-7 sm:py-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2e9] text-[#8c6b2e]">
                  <MessageSquare size={20} />
                </span>

                <h2 className="text-xl font-semibold">
                  Customer Inquiries
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                Review customer messages about your properties and send
                responses directly from your dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadInquiries(true)}
              disabled={loadingInquiries || refreshingInquiries}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={refreshingInquiries ? "animate-spin" : ""}
              />
              Refresh Inquiries
            </button>
          </div>

          {!loadingInquiries && !inquiryError && (
            <div className="grid gap-4 border-b border-stone-100 p-5 sm:grid-cols-3 sm:px-7">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-sm text-stone-500">Total inquiries</p>
                <p className="mt-2 text-2xl font-semibold">
                  {inquiries.length}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50/70 p-4">
                <p className="text-sm text-amber-800">
                  Awaiting response
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">
                  {unansweredInquiries}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 p-4">
                <p className="text-sm text-emerald-800">Responded</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">
                  {
                    inquiries.filter((item) =>
                      Boolean(getAgentResponse(item))
                    ).length
                  }
                </p>
              </div>
            </div>
          )}

          {inquiryError && (
            <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-7">
              <p>{inquiryError}</p>

              <button
                type="button"
                onClick={() => loadInquiries()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {inquiryFeedback && !inquiryFeedback.inquiryId && (
            <div
              className={`m-5 rounded-2xl p-4 text-sm sm:m-7 ${
                inquiryFeedback.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {inquiryFeedback.message}
            </div>
          )}

          {loadingInquiries ? (
            <div className="px-6 py-16 text-center text-sm text-stone-500">
              <RefreshCw
                size={22}
                className="mx-auto animate-spin text-[#a17b38]"
              />
              <p className="mt-3">Loading customer inquiries...</p>
            </div>
          ) : !inquiryError && inquiries.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f2e9] text-[#8c6b2e]">
                <MessageSquare size={25} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No customer inquiries yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
                When customers send inquiries about your properties, their
                messages will appear here for you to review and answer.
              </p>
            </div>
          ) : !inquiryError ? (
            <div className="divide-y divide-stone-100">
              {inquiries.map((inquiry) => {
                const inquiryId = getInquiryId(inquiry);
                const customer = getCustomer(inquiry);
                const property = getInquiryProperty(inquiry);
                const status = String(inquiry.status || "pending")
                  .toLowerCase()
                  .replaceAll("_", " ");
                const agentResponse = getAgentResponse(inquiry);
                const image = getInquiryImage(property);
                const isExpanded =
                  String(expandedInquiry) === String(inquiryId);
                const isResponding = respondingId === inquiryId;
                const currentResponse =
                  responses[inquiryId] !== undefined
                    ? responses[inquiryId]
                    : agentResponse;

                return (
                  <article key={inquiryId} className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:h-36 lg:w-48">
                        {image ? (
                          <img
                            src={image}
                            alt={property.title || "Property"}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-400">
                            <Building2 size={35} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <InquiryStatusBadge status={status} />

                          <span className="text-xs text-stone-400">
                            Received {formatDate(inquiry.createdAt)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold">
                          {inquiry.subject || "Property inquiry"}
                        </h3>

                        <p className="mt-1 font-medium text-stone-600">
                          {property.title || "Property details unavailable"}
                        </p>

                        {property.location && (
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                            <MapPin size={15} />
                            {property.location}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
                          <span className="flex items-center gap-1.5">
                            <UserRound size={15} />
                            {customer.name || customer.fullName || "Customer"}
                          </span>

                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="flex items-center gap-1.5 transition hover:text-[#8c6b2e]"
                            >
                              <Mail size={15} />
                              {customer.email}
                            </a>
                          )}

                          {customer.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="flex items-center gap-1.5 transition hover:text-[#8c6b2e]"
                            >
                              <Phone size={15} />
                              {customer.phone}
                            </a>
                          )}
                        </div>

                        {(property._id || property.id) && property.title && (
                          <Link
                            to={`/properties/${property._id || property.id}`}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#8c6b2e] hover:underline"
                          >
                            View property
                            <ArrowUpRight size={14} />
                          </Link>
                        )}
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedInquiry(
                              isExpanded ? null : inquiryId
                            )
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50 lg:w-auto"
                        >
                          {isExpanded ? "Hide Message" : "View Message"}
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-6">
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-semibold">
                            <MessageSquare
                              size={16}
                              className="text-[#a17b38]"
                            />
                            Customer message
                          </h4>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                            {inquiry.message || "No message provided."}
                          </p>
                        </div>

                        {agentResponse && (
                          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                              <CheckCircle2 size={16} />
                              Your previous response
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-emerald-950">
                              {agentResponse}
                            </p>

                            {inquiry.respondedAt && (
                              <p className="mt-3 text-xs text-emerald-700">
                                Sent {formatDate(inquiry.respondedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {inquiryFeedback?.inquiryId &&
                          String(inquiryFeedback.inquiryId) ===
                            String(inquiryId) && (
                            <div
                              className={`mt-4 rounded-xl p-3 text-sm ${
                                inquiryFeedback.type === "success"
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border border-rose-200 bg-rose-50 text-rose-700"
                              }`}
                            >
                              {inquiryFeedback.message}
                            </div>
                          )}

                        {status === "closed" || status === "rejected" ? (
                          <p className="mt-5 text-sm text-stone-500">
                            This inquiry is {status}. Response editing is
                            unavailable for this inquiry.
                          </p>
                        ) : (
                          <form
                            className="mt-6"
                            onSubmit={(event) => {
                              event.preventDefault();
                              handleSendResponse(inquiry);
                            }}
                          >
                            <label
                              htmlFor={`response-${inquiryId}`}
                              className="block text-sm font-semibold"
                            >
                              {agentResponse
                                ? "Update your response"
                                : "Write a response"}
                            </label>

                            <textarea
                              id={`response-${inquiryId}`}
                              value={currentResponse}
                              onChange={(event) =>
                                handleResponseChange(
                                  inquiryId,
                                  event.target.value
                                )
                              }
                              rows={4}
                              maxLength={2000}
                              placeholder="Write a helpful reply to the customer..."
                              required
                              className="mt-3 w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/10"
                            />

                            <div className="mt-2 flex justify-between gap-3 text-xs text-stone-400">
                              <span>
                                Your response will be saved to this inquiry.
                              </span>
                              <span>{currentResponse.length}/2000</span>
                            </div>

                            <button
                              type="submit"
                              disabled={
                                isResponding || !currentResponse.trim()
                              }
                              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#343a32] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Send size={16} />
                              {isResponding
                                ? "Sending..."
                                : agentResponse
                                  ? "Update Response"
                                  : "Send Response"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
