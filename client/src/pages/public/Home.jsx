import { useEffect, useMemo, useState } from "react";
import { fetchProperties } from "../../services/propertyService";
// import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MapPin,
  ShieldCheck,
  KeyRound,
  Headphones,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import PropertyCard from "../../components/properties/PropertyCard";
import Footer from "../../components/layout/Footer";

// const properties = [
//   {
//     id: "1",
//     title: "Contemporary Luxury Duplex",
//     location: "Lekki Phase 1, Lagos",
//     price: 185000000,
//     status: "For Sale",
//     type: "Detached Duplex",
//     bedrooms: 4,
//     bathrooms: 5,
//     area: 320,
//     image:
//       "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
//   },
//   {
//     id: "2",
//     title: "Modern Minimalist Residence",
//     location: "Maitama, Abuja",
//     price: 12000000,
//     status: "For Rent",
//     type: "Luxury Apartment",
//     bedrooms: 3,
//     bathrooms: 3,
//     area: 210,
//     image:
//       "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
//   },
//   {
//     id: "3",
//     title: "Elegant Family Home",
//     location: "GRA, Port Harcourt",
//     price: 95000000,
//     status: "For Sale",
//     type: "Semi-Detached Duplex",
//     bedrooms: 5,
//     bathrooms: 5,
//     area: 400,
//     image:
//       "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
//   },
// ];

const locations = [
  {
    name: "Lagos",
    detail: "Coastal living & city energy",
    count: "Explore Lagos",
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Abuja",
    detail: "Space, comfort & prestige",
    count: "Explore Abuja",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Port Harcourt",
    detail: "A place to grow",
    count: "Explore Port Harcourt",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any property");
  const [budget, setBudget] = useState("Any budget");

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();

    if (location.trim()) params.set("location", location.trim());
    if (category === "Buy") params.set("status", "For Sale");
    if (category === "Rent") params.set("status", "For Rent");
    if (category === "Land") params.set("type", "Land");
    if (propertyType !== "Any property" && category !== "Land") {
      params.set("type", propertyType);
    }
    if (budget !== "Any budget") params.set("budget", budget);

    return params.toString();
  }, [category, location, propertyType, budget]);

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const [properties, setProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Load the newest properties from the API for the featured carousel
  useEffect(() => {
    let ignore = false;

    async function loadFeatured() {
      try {
        const data = await fetchProperties();
        if (!ignore) setProperties(data.slice(0, 6));
      } catch {
        // The featured section shows a friendly message if loading fails
      } finally {
        if (!ignore) setLoadingFeatured(false);
      }
    }

    loadFeatured();

    return () => {
      ignore = true;
    };
  }, []);

  // Display 1 card on mobile, 2 on tablet, and 3 on desktop.
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  // Automatically change the featured properties every 4 seconds.
  useEffect(() => {
    if (properties.length <= visibleCount) return;

    const interval = window.setInterval(() => {
      setFeaturedIndex(
        (current) => (current + visibleCount) % properties.length,
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [visibleCount, properties.length]);

  const visibleProperties = Array.from(
    { length: Math.min(visibleCount, properties.length) },
    (_, index) => properties[(featuredIndex + index) % properties.length],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      {/* Hero */}

      <section className="relative isolate flex min-h-[650px] w-full items-center overflow-hidden bg-[#20251f] sm:min-h-[720px] lg:min-h-[790px]">
        {/* Full-width background photograph */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90')",
          }}
        />

        {/* Dark overlay keeps the headline readable */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-black/15" />

        <div className="mx-auto w-full max-w-[1600px] px-5 py-24 sm:px-10 lg:px-16">
          <div className="max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e1c58a] backdrop-blur-sm sm:text-sm">
              <MapPin size={15} />
              Find your place in Nigeria
            </p>

            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Discover a place
              <br />
              you'll love to
              <span className="text-[#e1c58a]"> call home.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              Explore exceptional homes, apartments, land and commercial
              properties. Your next chapter starts with the right address.
            </p>

            {/* Property search */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const params = new URLSearchParams();

                const location = form.get("location");
                const status = form.get("status");
                const type = form.get("type");

                if (location) params.set("location", location.toString());
                if (status) params.set("status", status.toString());
                if (type) params.set("type", type.toString());

                navigate(`/properties?${params.toString()}`);
              }}
              className="mt-10 grid w-full max-w-5xl gap-3 rounded-2xl border border-white/20 bg-white p-3 shadow-2xl sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center"
            >
              <label className="flex min-w-0 flex-col gap-1 px-3 py-2">
                <span className="text-xs font-semibold text-[#8a8d85]">
                  Location
                </span>
                <input
                  name="location"
                  placeholder="City, area or neighbourhood"
                  className="w-full min-w-0 bg-transparent text-sm text-[#20251f] outline-none placeholder:text-gray-400"
                />
              </label>

              <label className="flex flex-col gap-1 border-t border-gray-100 px-3 py-3 sm:border-t-0 sm:border-l">
                <span className="text-xs font-semibold text-[#8a8d85]">
                  I'm looking to
                </span>
                <select
                  name="status"
                  defaultValue="For Sale"
                  className="w-full bg-transparent text-sm text-[#20251f] outline-none"
                >
                  <option value="For Sale">Buy a property</option>
                  <option value="For Rent">Rent a property</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 border-t border-gray-100 px-3 py-3 sm:border-t-0 sm:border-l">
                <span className="text-xs font-semibold text-[#8a8d85]">
                  Property type
                </span>
                <select
                  name="type"
                  defaultValue=""
                  className="w-full bg-transparent text-sm text-[#20251f] outline-none"
                >
                  <option value="">All properties</option>
                  <option value="Apartment">Flat / Apartment / Duplex</option>
                  <option value="House">House</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial property</option>
                </select>
              </label>

              <button
                type="submit"
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#20251f] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#8d692d]"
              >
                <Search size={18} />
                Search
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <span>Homes for sale</span>
              <span>•</span>
              <span>Properties for rent</span>
              <span>•</span>
              <span>Shortlet apartments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto w-full overflow-hidden px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
              Curated for you
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured properties
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-stone-500">
              Explore distinctive spaces selected for comfort, location, and
              lifestyle.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold transition duration-300 hover:gap-3 hover:text-[#a17b38]"
          >
            View all properties <ArrowRight size={17} />
          </Link>
        </div>

        {/* Animated property carousel */}
        {properties.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone-500">
            {loadingFeatured
              ? "Loading featured properties..."
              : "No featured properties to show right now."}
          </p>
        ) : (
          <div
            key={`${featuredIndex}-${visibleCount}`}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 featured-properties-animation"
          >
            {visibleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Carousel indicators */}
        {properties.length > visibleCount && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({
              length: Math.ceil(properties.length / visibleCount),
            }).map((_, index) => {
              const isActive =
                Math.floor(featuredIndex / visibleCount) === index;

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show featured properties group ${index + 1}`}
                  onClick={() =>
                    setFeaturedIndex((index * visibleCount) % properties.length)
                  }
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-[#a17b38]"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Property search */}
      <section className="relative z-20 mx-auto -mt-2 w-full px-5 pb-16 sm:px-8 lg:px-12">
        <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-xl shadow-stone-900/[0.04] sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Find your perfect property
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Start with what matters to you.
              </p>
            </div>

            <div className="flex rounded-full bg-stone-100 p-1">
              {["Buy", "Rent", "Land"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    setPropertyType("Any property");
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    category === item
                      ? "bg-[#20251f] text-white shadow-sm"
                      : "text-stone-500 hover:text-[#20251f]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/properties?${searchParams}`);
            }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_auto]"
          >
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3.5 focus-within:border-[#a17b38]">
              <MapPin size={20} className="shrink-0 text-[#a17b38]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Location
                </span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, area or neighbourhood"
                  className="mt-1 w-full min-w-0 bg-transparent text-sm text-[#20251f] outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            <label className="rounded-2xl border border-stone-200 px-4 py-3.5 focus-within:border-[#a17b38]">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Property type
              </span>
              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm text-[#20251f] outline-none"
              >
                <option>Any property</option>
                <option>House</option>
                <option>Apartment</option>
                <option>Duplex</option>
                <option>Land</option>
                <option>Commercial</option>
              </select>
            </label>

            <label className="rounded-2xl border border-stone-200 px-4 py-3.5 focus-within:border-[#a17b38]">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Budget
              </span>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm text-[#20251f] outline-none"
              >
                <option>Any budget</option>
                <option>Under 20 million</option>
                <option>20 to 50 million</option>
                <option>50 to 100 million</option>
                <option>Above 100 million</option>
              </select>
            </label>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#20251f] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#394338]"
            >
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-[#f0eee7] py-16 sm:py-20">
        <div className="mx-auto w-full px-5 sm:px-8 lg:px-12">
          <div className="mb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
              Discover your neighbourhood
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Explore popular locations
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-500">
              From vibrant city living to peaceful residential communities.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {locations.map((place) => (
              <Link
                key={place.name}
                to={`/properties?location=${encodeURIComponent(place.name)}`}
                className="group relative h-[330px] overflow-hidden rounded-[28px] bg-stone-300 sm:h-[380px]"
              >
                <img
                  src={place.image}
                  alt={`Properties in ${place.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
                  <p className="text-xs font-medium text-white/75">
                    {place.detail}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold">{place.name}</h3>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-white group-hover:text-[#20251f]">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">{place.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto w-full px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
              The HavenEstate difference
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Property searching, made more personal.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-stone-500">
              Finding a property is about more than the building. It is about
              the people, possibilities, and everyday life that come with it.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#a17b38] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#394338]"
            >
              Start exploring <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Trusted listings",
                text: "Build towards a marketplace with verified agents and reviewed property submissions.",
              },
              {
                icon: Search,
                title: "Smarter discovery",
                text: "Find relevant properties using location, price, and property-type filters.",
              },
              {
                icon: KeyRound,
                title: "Your own shortlist",
                text: "Keep your favourite homes together for easier comparison.",
              },
              {
                icon: Headphones,
                title: "Direct agent contact",
                text: "Make it easier to enquire about properties and arrange viewings.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0eee7] text-[#a17b38]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent call to action */}
      <section className="mx-auto w-full px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative overflow-hidden rounded-[32px] bg-[#20251f] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-20 h-60 w-60 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e1c58a]">
                For property professionals
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Have a property worth sharing?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                Create your agent account and prepare to showcase your listings
                to people searching for their next property.
              </p>
            </div>

            <Link
              to="/signup?role=agent"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#e1c58a] px-7 py-4 text-sm font-bold text-[#20251f] transition hover:bg-white"
            >
              List your property <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
