import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  MapPin,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import PropertyCard from "../../components/properties/PropertyCard";
import { fetchProperties } from "../../services/propertyService";

const budgetRanges = {
  "Any budget": [0, Infinity],
  "Under 20 million": [0, 20000000],
  "20 to 50 million": [20000000, 50000000],
  "50 to 100 million": [50000000, 100000000],
  "Above 100 million": [100000000, Infinity],
};

const propertyTypes = [
  "Any property",
  "Residential",
  "House",
  "Apartment",
  "Duplex",
  "Land",
  "Commercial",
];

function matchesType(property, selectedType) {
  if (!selectedType || selectedType === "Any property") return true;

  // Guard: a property without a type should not crash the page
  const type = (property.type || "").toLowerCase();

  switch (selectedType.toLowerCase()) {
  case "residential":
    return /house|duplex|apartment|flat|terrace|studio/.test(type);
  case "house":
    return /house|duplex|terrace/.test(type);
  case "apartment":
    return /apartment|flat|studio/.test(type);
  case "duplex":
    return type.includes("duplex");
  case "land":
    return type.includes("land");
  case "commercial":
    return /commercial|office/.test(type);
  default:
    return type.includes(selectedType.toLowerCase());
}
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state, started from the URL so shared links open pre-filtered
  const [location, setLocation] = useState(
    () => searchParams.get("location") || "",
  );
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [type, setType] = useState(
    () => searchParams.get("type") || "Any property",
  );
  const [budget, setBudget] = useState(
    () => searchParams.get("budget") || "Any budget",
  );
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") || "",
  );
  const [bedrooms, setBedrooms] = useState(
    () => searchParams.get("bedrooms") || "",
  );
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");

  // Data from the API
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep the filter boxes in sync when the URL changes (Back button, links)
  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    setStatus(searchParams.get("status") || "");
    setType(searchParams.get("type") || "Any property");
    setBudget(searchParams.get("budget") || "Any budget");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  // Load properties from the backend once, when the page opens
  useEffect(() => {
    let ignore = false;

    async function loadProperties() {
      try {
        const data = await fetchProperties();
        if (!ignore) setProperties(data);
      } catch {
        if (!ignore) {
          setError(
            "Could not load properties. Please check that the server is running and try again.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProperties();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const [budgetMin, budgetMax] =
      budgetRanges[budget] || budgetRanges["Any budget"];

    const minimum = minPrice !== "" ? Number(minPrice) : budgetMin;
    const maximum = maxPrice !== "" ? Number(maxPrice) : budgetMax;
    const query = location.trim().toLowerCase();

    const results = properties.filter((property) => {
      const searchableLocation = (property.location || "").toLowerCase();
      const searchableTitle = (property.title || "").toLowerCase();

      const matchesLocation =
        !query ||
        searchableLocation.includes(query) ||
        searchableTitle.includes(query);

      const matchesStatus = !status || property.status === status;
      const matchesPropertyType = matchesType(property, type);
      const matchesMinPrice = property.price >= minimum;
      const matchesMaxPrice = property.price <= maximum;

      const matchesBedrooms =
        !bedrooms ||
        (bedrooms === "5+"
          ? property.bedrooms >= 5
          : property.bedrooms >= Number(bedrooms));

      return (
        matchesLocation &&
        matchesStatus &&
        matchesPropertyType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBedrooms
      );
    });

    return [...results].sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return (
            new Date(b.listedAt || 0).getTime() -
            new Date(a.listedAt || 0).getTime()
          );
      }
    });
  }, [
    properties,
    location,
    status,
    type,
    budget,
    minPrice,
    maxPrice,
    bedrooms,
    sort,
  ]);

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) params.set("location", location.trim());
    if (status) params.set("status", status);
    if (type !== "Any property") params.set("type", type);
    if (budget !== "Any budget") params.set("budget", budget);
    if (minPrice !== "") params.set("minPrice", minPrice);
    if (maxPrice !== "") params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (sort !== "newest") params.set("sort", sort);

    setSearchParams(params);
  }

  function resetFilters() {
    setLocation("");
    setStatus("");
    setType("Any property");
    setBudget("Any budget");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setSort("newest");
    setSearchParams({});
  }

  const invalidPriceRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-8xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#a17b38]"
        >
          <ArrowLeft size={16} />
          Back home
        </Link>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a17b38]">
            Find your next home
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Explore properties
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500">
            Discover homes, apartments, land, and commercial properties across
            Nigeria. Refine your search to find the right fit.
          </p>
        </header>

        <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0eee7] text-[#a17b38]">
                <SlidersHorizontal size={21} />
              </div>
              <div>
                <h2 className="font-bold">Filter properties</h2>
                <p className="mt-1 text-xs text-stone-500">
                  Combine filters to narrow your results.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-[#20251f] hover:text-[#20251f]"
            >
              <RotateCcw size={15} />
              Reset filters
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="rounded-2xl border border-stone-200 px-4 py-3 focus-within:border-[#a17b38]">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Location or keyword
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <MapPin size={16} className="shrink-0 text-[#a17b38]" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lekki, Abuja"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                </span>
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Listing type
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Buy or rent</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Shortlet">Shortlet</option>
                </select>
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Property type
                </span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  {propertyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Quick budget
                </span>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  {Object.keys(budgetRanges).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Minimum price (₦)
                </span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Maximum price (₦)
                </span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 100000000"
                  className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Bedrooms
                </span>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Any number</option>
                  <option value="1">1+ bedroom</option>
                  <option value="2">2+ bedrooms</option>
                  <option value="3">3+ bedrooms</option>
                  <option value="4">4+ bedrooms</option>
                  <option value="5+">5+ bedrooms</option>
                </select>
              </label>

              <label className="rounded-2xl border border-stone-200 px-4 py-3 sm:col-span-2 lg:col-span-1">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Sort results
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="title">Property name: A–Z</option>
                </select>
              </label>
            </div>

            {invalidPriceRange && (
              <p className="mt-3 text-sm text-rose-600">
                Minimum price cannot be greater than maximum price.
              </p>
            )}

            <button
              type="submit"
              disabled={invalidPriceRange}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#20251f] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#394338] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Search size={18} />
              Apply filters
            </button>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a17b38]">
                Your selection
              </p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Available properties
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {loading
                  ? "Loading..."
                  : `${filteredProperties.length} ${
                      filteredProperties.length === 1
                        ? "property"
                        : "properties"
                    } found`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Building2 size={17} />
              <span>HavenEstate listings</span>
            </div>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-stone-500">
              Loading properties...
            </p>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700">
              {error}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0eee7] text-[#a17b38]">
                <Search size={27} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                No matching properties
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
                Try another location, widen your price range, or remove some
                filters to see more properties.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#394338]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}