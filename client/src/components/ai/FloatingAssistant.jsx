
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  X,
  Send,
  Sparkles,
  LoaderCircle,
  ArrowUpRight,
  Building2,
  BedDouble,
  MapPin,
  RotateCcw,
} from "lucide-react";
import api from "../../services/api";

const suggestions = [
  "Find an apartment for rent in Abuja",
  "Show me a duplex for sale",
  "Find a 3-bedroom house",
];

function extractFilters(message) {
  const text = message.toLowerCase();
  const filters = {};

  if (/\b(shortlet|short-let|short let)\b/.test(text)) {
    filters.status = "Shortlet";
  } else if (/\b(for rent|rent|rental|to rent|renting)\b/.test(text)) {
    filters.status = "For Rent";
  } else if (/\b(for sale|buy|buying|purchase|to buy)\b/.test(text)) {
    filters.status = "For Sale";
  }

  const propertyTypes = [
    ["apartment", "Apartment"],
    ["flat", "Flat"],
    ["duplex", "Duplex"],
    ["bungalow", "Bungalow"],
    ["land", "Land"],
    ["house", "House"],
    ["mansion", "Mansion"],
    ["commercial", "Commercial"],
  ];

  for (const [keyword, type] of propertyTypes) {
    if (text.includes(keyword)) {
      filters.type = type;
      break;
    }
  }

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

  const bedroomMatch = text.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[ -]?(?:bed(?:room)?s?|br)\b/i,
  );

  if (bedroomMatch) {
    const value = bedroomMatch[1].toLowerCase();
    filters.minBedrooms = Number(value) || numberWords[value];
  }

  const budgetMatch = text.match(
    /(?:under|below|less than|maximum|max|budget of|up to|within)\s*(?:₦|ngn|n)?\s*([\d,.]+)\s*(million|m|billion|bn|thousand|k)?/i,
  );

  if (budgetMatch) {
    const amount = Number(budgetMatch[1].replace(/,/g, ""));
    const unit = (budgetMatch[2] || "").toLowerCase();

    if (Number.isFinite(amount)) {
      const multiplier =
        unit === "million" || unit === "m"
          ? 1_000_000
          : unit === "billion" || unit === "bn"
            ? 1_000_000_000
            : unit === "thousand" || unit === "k"
              ? 1_000
              : 1;

      filters.maxPrice = amount * multiplier;
    }
  }

  const locations = [
    "Abuja",
    "Wuse 2",
    "Wuse",
    "Maitama",
    "Asokoro",
    "Gwarinpa",
    "Jabi",
    "Utako",
    "Lugbe",
    "Guzape",
    "Garki",
    "Kubwa",
    "Lagos",
    "Lekki",
    "Victoria Island",
    "Ikeja",
    "Port Harcourt",
    "Enugu",
    "Ibadan",
    "Kano",
  ];

  const location = locations.find((place) =>
    text.includes(place.toLowerCase()),
  );

  if (location) {
    filters.location = location;
  }

  return filters;
}

function formatPrice(property) {
  if (property.formattedPrice) return property.formattedPrice;

  const price = Number(property.price);

  if (!Number.isFinite(price)) return "Price on request";

  return `₦${price.toLocaleString("en-NG")}`;
}

function getPropertyImage(property) {
  const image = property.images?.[0];

  if (typeof image === "string") return image;
  if (image && typeof image === "object") {
    return image.url || image.secure_url || "";
  }

  return "";
}

function PropertyResult({ property }) {
  const image = getPropertyImage(property);

  return (
    <Link
      to={`/properties/${property.id || property._id}`}
      className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-[#c8a96e] hover:shadow-sm"
    >
      {image ? (
        <img
          src={image}
          alt={property.title || "Property"}
          className="h-[78px] w-[92px] shrink-0 rounded-lg object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-[78px] w-[92px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <Building2 size={26} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-[#20251f] group-hover:text-[#8c6a30]">
          {property.title || "Available property"}
        </p>

        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} className="shrink-0" />
          <span className="line-clamp-1">
            {property.location || "Location available on request"}
          </span>
        </p>

        <p className="mt-1.5 font-bold text-[#8c6a30]">
          {formatPrice(property)}
        </p>

        {property.bedrooms != null && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <BedDouble size={13} />
            {property.bedrooms} bedroom
            {Number(property.bedrooms) === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function FloatingAssistant() {
  const { pathname } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your property assistant. Tell me what kind of property you're looking for, and I'll help you find matching listings.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/properties" ||
    pathname.startsWith("/properties/") ||
    pathname === "/agents" ||
    pathname === "/about";

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, isOpen]);

  if (!isPublicPage) return null;

  async function sendMessage(textOverride) {
    const question = (textOverride ?? message).trim();

    if (!question || loading) return;

    setMessage("");
    setError("");
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
    ]);
    setLoading(true);

    try {
      const filters = extractFilters(question);
      const response = await api.post("/ai/chat", {
        message: question,
        filters,
      });

      const data = response.data;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data.reply ||
            (data.count
              ? `I found ${data.count} matching properties.`
              : "I couldn't find matching properties for that search."),
          properties: Array.isArray(data.properties) ? data.properties : [],
          count: data.count ?? 0,
        },
      ]);
    } catch (requestError) {
      const detail =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        "I couldn't reach the property service. Please try again.";

      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setMessage("");
    setError("");
    setMessages([
      {
        role: "assistant",
        text: "Hi! I'm your property assistant. Tell me what kind of property you're looking for, and I'll help you find matching listings.",
      },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-4 z-[100] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="Property assistant chat"
          className="mb-3 flex h-[min(620px,calc(100dvh-115px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-[390px]"
        >
          {/* Chat header */}
          <div className="flex items-center justify-between bg-[#20251f] px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e1c58a] text-[#20251f]">
                <Bot size={23} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold">Property Assistant</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Here to help you find a property
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={startNewChat}
                aria-label="Start a new chat"
                title="Start a new chat"
                disabled={loading}
                className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={17} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div
            ref={conversationRef}
            className="flex-1 space-y-4 overflow-y-auto bg-[#faf9f6] p-3.5 sm:p-4"
            aria-live="polite"
          >
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={
                  item.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    item.role === "user"
                      ? "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-[#20251f] px-3.5 py-3 text-sm leading-relaxed text-white"
                      : "max-w-[96%] min-w-0 space-y-3"
                  }
                >
                  {item.role === "assistant" && (
                    <div className="whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-700 shadow-sm">
                      {item.text}
                    </div>
                  )}

                  {item.role === "assistant" &&
                    item.properties?.length > 0 && (
                      <div className="space-y-2">
                        <p className="px-1 text-xs font-semibold text-gray-500">
                          Matching properties
                        </p>

                        {item.properties.slice(0, 3).map((property, i) => (
                          <PropertyResult
                            key={property.id || property._id || i}
                            property={property}
                          />
                        ))}

                        {item.properties.length > 3 && (
                          <Link
                            to="/assistant"
                            className="flex items-center justify-center gap-1 rounded-lg border border-[#c8a96e]/50 bg-white px-3 py-2.5 text-xs font-semibold text-[#765722] transition hover:bg-[#f6f0e5]"
                          >
                            View more properties
                            <ArrowUpRight size={14} />
                          </Link>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  <LoaderCircle size={16} className="animate-spin" />
                  Searching properties...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => sendMessage(messages.at(-1)?.text || "")}
                  disabled={loading}
                  className="ml-2 font-semibold underline disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-xs font-medium text-gray-500">
                  Try asking
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs leading-relaxed text-gray-700 transition hover:border-[#c8a96e] hover:bg-[#fcfaf6] disabled:opacity-50"
                  >
                    <Sparkles
                      size={13}
                      className="mr-1.5 inline text-[#a17b38]"
                    />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Full assistant link */}
          <div className="border-t border-gray-100 bg-white px-3.5 pt-3">
            <Link
              to="/assistant"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#c8a96e]/50 px-3 py-2.5 text-sm font-semibold text-[#765722] transition hover:bg-[#fcfaf6]"
            >
              Open Full Assistant
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Message form */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 bg-white p-3.5 pt-3"
          >
            <input
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about properties..."
              aria-label="Your property question"
              maxLength={1000}
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#c8a96e] focus:bg-white focus:ring-2 focus:ring-[#c8a96e]/20"
            />

            <button
              type="submit"
              aria-label="Send message"
              disabled={!message.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#20251f] text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </form>
        </section>
      )}

      {/* Floating launcher */}
      <div className="flex justify-end">
        {!isOpen && (
          <span className="mr-3 hidden self-center rounded-full border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-[#20251f] shadow-lg sm:block">
            Ask our AI assistant
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
          aria-expanded={isOpen}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[#20251f] text-[#e1c58a] shadow-xl transition duration-200 hover:scale-105 hover:bg-[#343b32] focus:outline-none focus:ring-4 focus:ring-[#c8a96e]/40 sm:h-16 sm:w-16"
        >
          {isOpen ? <X size={25} /> : <Bot size={29} />}

          {!isOpen && (
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
          )}
        </button>
      </div>
    </div>
  );
}
