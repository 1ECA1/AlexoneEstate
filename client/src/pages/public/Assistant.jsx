import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowRight,
  Search,
  LoaderCircle,
  House,
  RotateCcw,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import api from "../../services/api";

const suggestions = [
  "Find an apartment for rent in Abuja under 15 million naira",
  "Show me a duplex for sale",
  "Find properties in Wuse 2 with at least 3 bedrooms",
  "Show me shortlet properties in Abuja",
];

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function extractFilters(message) {
  const text = message.toLowerCase();
  const filters = {};

  // Listing status.
  if (/\b(shortlet|short-let|short let|daily rental)\b/.test(text)) {
    filters.status = "Shortlet";
  } else if (/\b(for rent|to rent|renting|rental|rent)\b/.test(text)) {
    filters.status = "For Rent";
  } else if (/\b(for sale|to buy|buy|purchase|selling|sale)\b/.test(text)) {
    filters.status = "For Sale";
  }

  // Property type.
  const propertyTypes = [
    ["Apartment", /\b(apartment|apartments)\b/],
    ["Duplex", /\b(duplex|duplexes)\b/],
    ["Flat", /\b(flat|flats)\b/],
    ["House", /\b(house|houses|bungalow|bungalows)\b/],
    ["Land", /\b(land|plot|plots)\b/],
    ["Commercial", /\b(commercial|office space|shop|shops)\b/],
  ];

  const matchingType = propertyTypes.find(([, pattern]) =>
    pattern.test(text),
  );

  if (matchingType) {
    filters.type = matchingType[0];
  }

  // Minimum bedrooms: digits or words.
  const bedroomMatch = text.match(
    /\b(?:at least\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:\+\s*)?(?:bedrooms?|beds?)\b/,
  );

  if (bedroomMatch) {
    const bedroomValue = bedroomMatch[1];
    const bedrooms = numberWords[bedroomValue] ?? Number(bedroomValue);

    if (Number.isInteger(bedrooms) && bedrooms >= 0) {
      filters.minBedrooms = bedrooms;
    }
  }

  // Budget: 15 million, 15m, 500 thousand, 500k, or a plain amount.
  const budgetMatch = text.match(
    /\b(?:under|below|less than|up to|maximum|max|budget(?:\s+of)?|within)\s*(?:₦\s*|ngn\s*)?(\d+(?:\.\d+)?)\s*(million|millions|m|thousand|thousands|k)?\b/i,
  );

  if (budgetMatch) {
    const amount = Number(budgetMatch[1]);
    const unit = (budgetMatch[2] || "").toLowerCase();

    const multiplier = ["million", "millions", "m"].includes(unit)
      ? 1_000_000
      : ["thousand", "thousands", "k"].includes(unit)
        ? 1_000
        : 1;

    const maxPrice = amount * multiplier;

    if (Number.isFinite(maxPrice) && maxPrice >= 0) {
      filters.maxPrice = maxPrice;
    }
  }

  // Location phrases, e.g. "in Abuja", "near Wuse 2", "at Gwarinpa".
  const locationMatch = text.match(
    /\b(?:in|at|near|around|within)\s+([a-z][a-z0-9\s-]*?)(?=\s+(?:with|under|below|less|for|and|budget|up to|maximum|max|at least|having|that|which)\b|[,!?;.]|$)/i,
  );

  if (locationMatch) {
    const location = locationMatch[1].trim().replace(/\s+/g, " ");

    const excludedPhrases = [
      "the market",
      "my budget",
      "a budget",
      "at least",
    ];

    if (
      location &&
      !excludedPhrases.some((phrase) => location.includes(phrase))
    ) {
      filters.location = location;
    }
  }

  return filters;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function AssistantPropertyCard({ property }) {
  const propertyId = property.id || property._id;
  const image =
    property.images?.[0] ||
    "https://placehold.co/800x600/f5f0e6/20251f?text=Property";

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/properties/${propertyId}`}
        className="block"
        aria-label={`View ${property.title || "property"}`}
      >
        <div className="relative h-48 overflow-hidden bg-stone-100">
          <img
            src={image}
            alt={property.title || "Property"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "https://placehold.co/800x600/f5f0e6/20251f?text=Property";
            }}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />

          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#20251f]">
            {property.status || "Property"}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-lg font-bold text-[#20251f]">
          {property.formattedPrice || formatPrice(property.price)}
          {property.pricePeriod && property.pricePeriod !== "none" && (
            <span className="ml-1 text-xs font-medium text-stone-500">
              / {property.pricePeriod}
            </span>
          )}
        </p>

        <h3 className="mt-2 font-semibold text-[#20251f]">
          {property.title || "Property listing"}
        </h3>

        <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[#a17b38]" />
          <span>{property.location || "Location not specified"}</span>
        </p>

        <div className="my-4 flex flex-wrap gap-4 border-y border-stone-100 py-3 text-xs text-stone-600">
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
            {property.area
              ? `${Number(property.area).toLocaleString()} m²`
              : "Area N/A"}
          </span>
        </div>

        <Link
          to={`/properties/${propertyId}`}
          className="flex items-center justify-center gap-2 rounded-full bg-[#20251f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32]"
        >
          View property <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [properties, setProperties] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(searchText = message) {
    const trimmedMessage = searchText.trim();

    if (!trimmedMessage || loading) return;

    setMessage(trimmedMessage);
    setLoading(true);
    setError("");
    setReply("");
    setProperties([]);
    setHasSearched(true);

    // Combine previous preferences with the new criteria.
    // New criteria override previous values for the same filter.
    const newFilters = extractFilters(trimmedMessage);
    const filters = {
      ...activeFilters,
      ...newFilters,
    };

    setActiveFilters(filters);

    try {
      const { data } = await api.post("/ai/chat", {
        message: trimmedMessage,
        filters,
      });

      setReply(data.reply || "Here are your matching properties.");
      setProperties(
        Array.isArray(data.properties) ? data.properties : [],
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't search properties right now. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSearch();
  }

  function handleNewSearch() {
    setMessage("");
    setReply("");
    setProperties([]);
    setActiveFilters({});
    setHasSearched(false);
    setError("");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf9f6]">
        <section className="relative overflow-hidden bg-[#20251f] px-5 py-14 text-white sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#e1c58a]/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e1c58a]/30 bg-white/5 text-[#e1c58a]">
              <Bot size={32} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#e1c58a]">
              HavenEstate Property Assistant
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
              Find a property that
              <span className="block text-[#e1c58a]">feels like home.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Tell us your preferred location, budget, property type, or
              number of bedrooms. We’ll search our available approved
              listings for you.
            </p>

            <div className="mx-auto mt-8 flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white p-2 pl-4 shadow-2xl sm:rounded-full">
              <Search className="shrink-0 text-stone-400" size={21} />

              <form
                onSubmit={handleSubmit}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="e.g. Apartment for rent in Abuja under ₦15 million"
                  aria-label="Describe the property you are looking for"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#20251f] outline-none placeholder:text-stone-400 sm:text-base"
                  maxLength={500}
                />

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#20251f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full sm:px-6"
                >
                  {loading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}

                  <span className="hidden sm:inline">
                    {loading ? "Searching" : "Search"}
                  </span>
                </button>
              </form>
            </div>

            <p className="mt-3 text-xs text-white/45">
              Search results are based on current approved listings.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          {!hasSearched && (
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={19} className="text-[#a17b38]" />
                <h2 className="text-lg font-semibold text-[#20251f]">
                  Try asking
                </h2>
              </div>

              <p className="mt-2 text-sm text-stone-500">
                Choose an example to start your property search.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSearch(suggestion)}
                    disabled={loading}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left text-sm text-stone-700 transition hover:border-[#c4a15b] hover:shadow-sm disabled:opacity-50"
                  >
                    <span>{suggestion}</span>
                    <ArrowRight
                      size={17}
                      className="shrink-0 text-[#a17b38]"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LoaderCircle
                size={36}
                className="animate-spin text-[#a17b38]"
              />
              <p className="mt-4 font-semibold text-[#20251f]">
                Searching approved listings...
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Checking properties against your preferences.
              </p>
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
            >
              <p className="font-semibold">Search unsuccessful</p>
              <p className="mt-1">{error}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleSearch(message)}
                  className="rounded-full bg-red-800 px-4 py-2 font-semibold text-white transition hover:bg-red-900"
                >
                  Try again
                </button>

                <button
                  type="button"
                  onClick={handleNewSearch}
                  className="rounded-full border border-red-300 px-4 py-2 font-semibold text-red-800 transition hover:bg-red-100"
                >
                  Start new search
                </button>
              </div>
            </div>
          )}

          {!loading && !error && hasSearched && (
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a17b38]">
                    <House size={15} />
                    Search results
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-[#20251f]">
                    Properties for you
                  </h2>

                  {reply && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                      {reply}
                    </p>
                  )}

                  {Object.keys(activeFilters).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeFilters.location && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
                          Location: {activeFilters.location}
                        </span>
                      )}

                      {activeFilters.status && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
                          {activeFilters.status}
                        </span>
                      )}

                      {activeFilters.type && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
                          {activeFilters.type}
                        </span>
                      )}

                      {activeFilters.minBedrooms !== undefined && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
                          {activeFilters.minBedrooms}+ bedrooms
                        </span>
                      )}

                      {activeFilters.maxPrice !== undefined && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
                          Up to {formatPrice(activeFilters.maxPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-600 ring-1 ring-stone-200">
                    {properties.length}{" "}
                    {properties.length === 1 ? "property" : "properties"}
                  </span>

                  <button
                    type="button"
                    onClick={handleNewSearch}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#a17b38] hover:bg-white disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    Start new search
                  </button>
                </div>
              </div>

              {properties.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <AssistantPropertyCard
                      key={property.id || property._id}
                      property={property}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center">
                  <Search size={32} className="mx-auto text-stone-400" />

                  <h3 className="mt-4 text-lg font-semibold text-[#20251f]">
                    No matching properties found
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-500">
                    Try a different location, budget, or property type.
                    You can also browse all available listings.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleNewSearch}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      Start new search
                    </button>

                    <Link
                      to="/properties"
                      className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32]"
                    >
                      Browse properties <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
