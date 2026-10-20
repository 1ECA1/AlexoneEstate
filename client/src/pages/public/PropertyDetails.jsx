
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  Heart,
  Share2,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  Images,
  Expand,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { fetchPropertyById } from "../../services/propertyService";
import { useAuth } from "../../hooks/useAuth";
import { createPropertyInquiry } from "../../services/inquiryService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const periodLabels = {
  night: "/ night",
  month: "/ month",
  year: "/ year",
};

function StatusPage({ title, text, showBrowseLink = true }) {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Home size={30} />
        </div>

        <h1 className="text-3xl font-semibold">{title}</h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
          {text}
        </p>

        {showBrowseLink && (
          <Link
            to="/properties"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#20251f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#343b32]"
          >
            <ArrowLeft size={16} />
            Browse properties
          </Link>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();

  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("loading");
  const [isFavourite, setIsFavourite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Property inquiry state
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryFeedback, setInquiryFeedback] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadProperty() {
      setStatus("loading");
      setProperty(null);
      setActiveImage(0);
      setLightboxOpen(false);

      try {
        const data = await fetchPropertyById(id);

        if (!ignore) {
          setProperty(data);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load property:", err);

        if (!ignore) {
          setStatus(
            err.response?.status === 404 ? "notfound" : "error"
          );
        }
      }
    }

    loadProperty();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Support properties with multiple images and older listings with one image.
  const galleryImages = [
    ...new Set(
      [
        ...(Array.isArray(property?.images)
          ? property.images.map((image) =>
              typeof image === "string" ? image : image?.url
            )
          : []),
        property?.image,
      ].filter(
        (image) =>
          typeof image === "string" && image.trim().length > 0
      )
    ),
  ];

  const hasMultipleImages = galleryImages.length > 1;

  function showPreviousImage() {
    setActiveImage((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  }

  function showNextImage() {
    setActiveImage((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  }

  // Keyboard controls for the full-screen gallery.
  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        setActiveImage((current) =>
          current === 0 ? galleryImages.length - 1 : current - 1
        );
      }

      if (event.key === "ArrowRight" && galleryImages.length > 1) {
        setActiveImage((current) =>
          current === galleryImages.length - 1 ? 0 : current + 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, galleryImages.length]);

  // Submit a property inquiry.
  async function handleInquirySubmit(event) {
    event.preventDefault();
    setInquiryFeedback(null);

    if (!isLoggedIn) {
      setInquiryFeedback({
        type: "error",
        message: "Please log in with a customer account to send an inquiry.",
        loginRequired: true,
      });
      return;
    }

    if (user?.role !== "customer") {
      setInquiryFeedback({
        type: "error",
        message: "Only customer accounts can send property inquiries.",
      });
      return;
    }

    if (
      inquirySubject.trim().length > 150 ||
      inquiryMessage.trim().length < 10 ||
      inquiryMessage.trim().length > 3000
    ) {
      setInquiryFeedback({
        type: "error",
        message:
          "Enter an optional subject of up to 150 characters and a message between 10 and 3000 characters.",
      });
      return;
    }

    setInquiryLoading(true);

    try {
      await createPropertyInquiry(id, {
        subject: inquirySubject.trim() || "Property inquiry",
        message: inquiryMessage.trim(),
      });

      setInquiryMessage("");
      setInquirySubject("");

      setInquiryFeedback({
        type: "success",
        message:
          "Your inquiry has been sent successfully. You can track it from your customer dashboard.",
      });
    } catch (error) {
      console.error("Failed to submit property inquiry:", error);

      setInquiryFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not send your inquiry. Please try again.",
        loginRequired: error.response?.status === 401,
      });
    } finally {
      setInquiryLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <StatusPage
        title="Loading property..."
        text="Please wait while we fetch the details."
        showBrowseLink={false}
      />
    );
  }

  if (status === "notfound") {
    return (
      <StatusPage
        title="Property not found"
        text="This listing may have been removed or the link may be incorrect."
      />
    );
  }

  if (status === "error" || !property) {
    return (
      <StatusPage
        title="Something went wrong"
        text="We could not load this property. Please check that the server is running and try again."
      />
    );
  }

  const features = property.features?.length
    ? property.features
    : [
        "Well-designed living spaces",
        "Convenient location",
        "Quality finishes",
        "Suitable for modern living",
      ];

  const description =
    property.description ||
    `${property.title} is a ${String(
      property.type || "property"
    ).toLowerCase()} located in ${property.location}. ${
      property.status === "For Sale"
        ? "Explore this property as a potential real estate investment or new home."
        : "This property is available for rent."
    } Contact the RealEstateConsultDesign team for further information and viewing arrangements.`;

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `${property.title} — ${property.location}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-8xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Back navigation and actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#20251f]"
          >
            <ArrowLeft size={17} />
            Back to properties
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavourite((value) => !value)}
              aria-label={
                isFavourite
                  ? "Remove from favourites"
                  : "Add to favourites"
              }
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                isFavourite
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white text-[#20251f] hover:border-[#a17b38]"
              }`}
            >
              <Heart
                size={18}
                fill={isFavourite ? "currentColor" : "none"}
              />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium transition hover:border-[#a17b38]"
            >
              <Share2 size={16} />
              <span>{copied ? "Link copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Property heading */}
        <section className="mb-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#20251f] px-3 py-1.5 text-xs font-medium text-white">
              {property.status || "Property"}
            </span>

            <span className="rounded-full border border-[#e8dfcd] bg-[#f5f0e6] px-3 py-1.5 text-xs font-medium text-[#82632e]">
              {property.type || "Real Estate"}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {property.title}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-gray-500 sm:text-base">
                <MapPin
                  size={18}
                  className="shrink-0 text-[#a17b38]"
                />
                {property.location}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                {property.status === "For Sale"
                  ? "Asking price"
                  : "Rental price"}
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                {formatPrice(property.price)}

                {periodLabels[property.pricePeriod] && (
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    {periodLabels[property.pricePeriod]}
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Multi-image gallery */}
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <div className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
            {galleryImages.length > 0 ? (
              <>
                <div className="group relative h-[300px] overflow-hidden rounded-2xl bg-[#e9e6df] sm:h-[440px] lg:h-[600px]">
                  <img
                    key={galleryImages[activeImage]}
                    src={galleryImages[activeImage]}
                    alt={`${property.title} — photo ${activeImage + 1}`}
                    className="h-full w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-[1.01]"
                    onClick={() => setLightboxOpen(true)}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-md sm:left-6 sm:top-6">
                    <Images size={16} />
                    {activeImage + 1} / {galleryImages.length}
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="View image full screen"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75 sm:right-6 sm:top-6"
                  >
                    <Expand size={17} />
                  </button>

                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Previous property image"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#20251f] shadow-lg transition hover:bg-white sm:left-6 sm:h-12 sm:w-12"
                      >
                        <ChevronLeft size={25} />
                      </button>

                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Next property image"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#20251f] shadow-lg transition hover:bg-white sm:right-6 sm:h-12 sm:w-12"
                      >
                        <ChevronRight size={25} />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-8 sm:left-8">
                    <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md">
                      {property.status || "Property"}
                    </span>

                    <h2 className="mt-3 max-w-3xl text-2xl font-semibold sm:text-4xl">
                      {property.title}
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-sm text-white/90 sm:text-base">
                      <MapPin size={18} />
                      {property.location}
                    </p>
                  </div>
                </div>

                {hasMultipleImages && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#20251f]">
                        Property gallery
                      </p>

                      <p className="text-xs text-gray-500">
                        Select a photo to view it
                      </p>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-3">
                      {galleryImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          aria-label={`View property photo ${index + 1}`}
                          aria-pressed={activeImage === index}
                          className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                            activeImage === index
                              ? "border-[#a17b38] ring-2 ring-[#a17b38]/20"
                              : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Property thumbnail ${index + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />

                          {activeImage === index && (
                            <span className="absolute inset-x-0 bottom-0 bg-[#20251f]/75 py-1 text-[10px] font-semibold text-white">
                              Viewing
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-2xl bg-[#e9e6df] text-center text-[#77756e] sm:h-[440px] lg:h-[600px]">
                <Home size={42} />
                <p className="text-sm font-medium">
                  No property photos available
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Full-screen image viewer */}
        {lightboxOpen && galleryImages.length > 0 && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Property image gallery"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
            >
              <X size={24} />
            </button>

            <p className="absolute left-4 top-5 text-sm text-white/80 sm:left-8 sm:top-8">
              {property.title} · {activeImage + 1} of {galleryImages.length}
            </p>

            <img
              src={galleryImages[activeImage]}
              alt={`${property.title} — photo ${activeImage + 1}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPreviousImage();
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8 sm:h-14 sm:w-14"
                >
                  <ChevronLeft size={30} />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8 sm:h-14 sm:w-14"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Property details and side panel */}
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            {/* Quick facts */}
            <section className="grid grid-cols-3 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <BedDouble size={22} className="mb-4 text-[#a17b38]" />
                <p className="text-2xl font-semibold">
                  {property.bedrooms ?? "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">Bedrooms</p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <Bath size={22} className="mb-4 text-[#a17b38]" />
                <p className="text-2xl font-semibold">
                  {property.bathrooms ?? "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">Bathrooms</p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5">
                <Maximize2 size={22} className="mb-4 text-[#a17b38]" />
                <p className="text-2xl font-semibold">
                  {property.area
                    ? Number(property.area).toLocaleString()
                    : "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Area {property.area ? "(m²)" : ""}
                </p>
              </div>
            </section>

            {/* Description */}
            <section className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">About this property</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {description}
              </p>
            </section>

            {/* Features */}
            <section className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Property highlights</h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#a17b38]"
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location */}
            <section className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Location</h2>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#faf9f6] p-4">
                <MapPin
                  size={21}
                  className="mt-0.5 shrink-0 text-[#a17b38]"
                />

                <div>
                  <p className="font-medium">{property.location}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Contact our team for more details about this property's
                    exact location and viewing arrangements.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Property overview and inquiry form */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                Property overview
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {formatPrice(property.price)}

                {periodLabels[property.pricePeriod] && (
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    {periodLabels[property.pricePeriod]}
                  </span>
                )}
              </h2>

              <div className="my-6 h-px bg-gray-100" />

              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Listing type</dt>
                  <dd className="text-right font-medium">
                    {property.status || "—"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Property type</dt>
                  <dd className="text-right font-medium">
                    {property.type || "—"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Bedrooms</dt>
                  <dd className="font-medium">
                    {property.bedrooms ?? "—"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Bathrooms</dt>
                  <dd className="font-medium">
                    {property.bathrooms ?? "—"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Floor area</dt>
                  <dd className="font-medium">
                    {property.area
                      ? `${Number(property.area).toLocaleString()} m²`
                      : "Not specified"}
                  </dd>
                </div>
              </dl>

              {/* Inquiry form */}
              <div className="mt-7 rounded-2xl bg-[#f5f0e6] p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={19} className="text-[#82632e]" />
                  <p className="text-sm font-semibold text-[#20251f]">
                    Interested in this property?
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-600">
                  Send the listing agent a message to ask questions or arrange
                  a property viewing.
                </p>
              </div>

              <form onSubmit={handleInquirySubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="inquirySubject"
                    className="mb-2 block text-sm font-medium"
                  >
                    Subject
                    <span className="ml-1 font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="inquirySubject"
                    name="subject"
                    type="text"
                    maxLength={150}
                    value={inquirySubject}
                    onChange={(event) =>
                      setInquirySubject(event.target.value)
                    }
                    placeholder="e.g. Property viewing"
                    className="w-full rounded-xl border border-gray-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inquiryMessage"
                    className="mb-2 block text-sm font-medium"
                  >
                    Your message
                  </label>

                  <textarea
                    id="inquiryMessage"
                    name="message"
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={5}
                    value={inquiryMessage}
                    onChange={(event) =>
                      setInquiryMessage(event.target.value)
                    }
                    placeholder="Hello, I am interested in this property. Please provide more details..."
                    className="w-full resize-y rounded-xl border border-gray-200 bg-[#faf9f6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#a17b38] focus:ring-2 focus:ring-[#a17b38]/10"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {inquiryMessage.length}/3000 characters
                  </p>
                </div>

                {inquiryFeedback && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl p-3 text-sm leading-5 ${
                      inquiryFeedback.type === "success"
                        ? "border border-green-200 bg-green-50 text-green-800"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {inquiryFeedback.type === "success" ? (
                        <CheckCircle
                          size={17}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={17}
                          className="mt-0.5 shrink-0"
                        />
                      )}

                      <p>{inquiryFeedback.message}</p>
                    </div>

                    {inquiryFeedback.type === "success" && (
                      <Link
                        to="/customer/inquiries"
                        className="mt-3 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                      >
                        View my inquiries
                        <ArrowUpRight size={14} />
                      </Link>
                    )}

                    {inquiryFeedback.loginRequired && (
                      <Link
                        to="/login"
                        className="mt-3 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                      >
                        Log in to continue
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inquiryLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending inquiry...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send inquiry
                    </>
                  )}
                </button>
              </form>

              <Link
                to="/properties"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-medium transition hover:border-[#a17b38]"
              >
                Explore properties
                <ArrowUpRight size={17} />
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                Your inquiry will be linked to this property and its assigned
                agent.
              </p>
            </div>
          </aside>
        </div>

        {/* Agent details */}
        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#a17b38]">
              Your property contact
            </p>

            <h2 className="mt-2 text-xl font-semibold">Agent Details</h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Contact the listing agent to ask questions or arrange a property
              viewing.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src={
                property.agent?.image ||
                "https://ui-avatars.com/api/?name=HavenEstate+Agent&background=20251f&color=ffffff&size=160"
              }
              alt={property.agent?.name || "RealEstateConsultDesign Agent"}
              className="h-20 w-20 rounded-2xl object-cover"
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold">
                {property.agent?.name || "RealEstateConsultDesign Property Team"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {property.agent?.title || "Property Consultant"}
              </p>

              {property.agent?.phone && (
                <a
                  href={`tel:${property.agent.phone}`}
                  className="mt-3 inline-block text-sm font-medium text-[#82632e] hover:underline"
                >
                  {property.agent.phone}
                </a>
              )}

              {property.agent?.email && (
                <p className="mt-1 break-all text-sm text-gray-500">
                  {property.agent.email}
                </p>
              )}
            </div>

            {property.agent?.phone && (
              <a
                href={`https://wa.me/${property.agent.phone.replace(
                  /\D/g,
                  ""
                )}?text=${encodeURIComponent(
                  `Hello, I am interested in ${property.title} in ${property.location}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#343b32]"
              >
                Contact Agent
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
