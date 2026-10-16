
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  RefreshCw,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { fetchPublicAgents } from "../../services/agentService";

const SLIDE_INTERVAL = 4000;

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function AgentAvatar({ agent }) {
  const [imageFailed, setImageFailed] = useState(false);

  const photoUrl = agent.profilePhotoUrl || agent.profilePhoto;

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <div className="flex h-50 w-65 max-w-full items-center justify-center overflow-hidden border-1 border-white bg-[#20251f] text-3xl font-semibold text-[#e1c58a] shadow-sm">
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt={`${agent.name || "Agent"}'s profile`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getInitials(agent.name)
      )}
    </div>
  );
}

function AgentCard({ agent }) {
  const experience = Number(agent.yearsOfExperience);

  const hasExperience =
    agent.yearsOfExperience !== undefined &&
    agent.yearsOfExperience !== null &&
    agent.yearsOfExperience !== "" &&
    Number.isFinite(experience) &&
    experience >= 0;

  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-[#eeebe4] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      {/* Profile photo */}
      <div className="flex justify-center bg-[#f3f0e8] px-1 pb-3 pt-4">
        <AgentAvatar agent={agent} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="break-words text-lg font-semibold">
            {agent.name || "HavenEstate Agent"}
          </h3>

          <span
            className="shrink-0 rounded-full bg-[#edf5e9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3d6b36]"
            title="Active agent account"
          >
            Active
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Registered Real Estate Agent
        </p>

        {/* Specialty */}
        {agent.specialty && (
          <div className="mt-3">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f5f0e6] px-3 py-1.5 text-xs font-medium text-[#82632e]">
              <BriefcaseBusiness size={13} className="shrink-0" />
              <span className="break-words">{agent.specialty}</span>
            </span>
          </div>
        )}

        {/* Location */}
        {agent.location && (
          <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-[#a17b38]"
            />
            <span className="break-words">{agent.location}</span>
          </p>
        )}

        {/* Experience */}
        {hasExperience && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-[#20251f]">
              {experience}
            </span>{" "}
            {experience === 1 ? "year" : "years"} of experience
          </p>
        )}

        {/* Biography */}
        {agent.bio && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
            {agent.bio}
          </p>
        )}

        {/* Contact information */}
        <div className="mt-5 space-y-3">
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="flex min-w-0 items-start gap-2 text-sm text-gray-600 transition hover:text-[#a17b38]"
            >
              <Mail
                size={16}
                className="mt-0.5 shrink-0 text-[#a17b38]"
              />
              <span className="break-all">{agent.email}</span>
            </a>
          )}

          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="flex min-w-0 items-start gap-2 text-sm text-gray-600 transition hover:text-[#a17b38]"
            >
              <Phone
                size={16}
                className="mt-0.5 shrink-0 text-[#a17b38]"
              />
              <span className="break-words">{agent.phone}</span>
            </a>
          )}

          {!agent.phone && !agent.email && (
            <p className="text-sm text-gray-500">
              Contact information has not been provided.
            </p>
          )}
        </div>

        {/* Property link */}
        <div className="mt-5 border-t border-[#eeebe4] pt-4">
          <Link
            to="/properties"
            className="flex items-center justify-between gap-2 text-sm font-medium transition hover:text-[#a17b38]"
          >
            Explore properties
            <ArrowUpRight
              size={18}
              className="shrink-0 transition group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  });

  async function loadAgents() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchPublicAgents();
      setAgents(Array.isArray(data) ? data : []);
      setCurrentIndex(0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not load our agents. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  // Adjust the number of visible cards to the screen size.
  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    }

    updateVisibleCount();

    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return agents;

    return agents.filter((agent) =>
      [
        agent.name,
        agent.email,
        agent.phone,
        agent.location,
        agent.specialty,
        agent.bio,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [agents, search]);

  const maxIndex = Math.max(0, filteredAgents.length - visibleCount);

  // Keep the current position valid when filtering or resizing.
  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  // Automatically advance every four seconds.
  useEffect(() => {
    if (loading || error || filteredAgents.length <= visibleCount) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [loading, error, filteredAgents.length, visibleCount, maxIndex]);

  function showPrevious() {
    setCurrentIndex((index) => (index <= 0 ? maxIndex : index - 1));
  }

  function showNext() {
    setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="px-5 pb-12 pt-16 sm:px-8 sm:pt-20 lg:pb-16 lg:pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e8dfcd] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#82632e]">
                  <Users size={15} />
                  Meet our team
                </span>

                <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Meet the people behind your{" "}
                  <span className="text-[#a17b38]">next move.</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                  Connect with our registered real estate agents and explore
                  property opportunities with HavenEstate.
                </p>

                <a
                  href="#agent-directory"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#20251f] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#343b32]"
                >
                  Explore our agents
                  <ArrowUpRight size={17} />
                </a>

                <div className="mt-10 flex flex-wrap gap-6 border-t border-[#e8e5de] pt-6">
                  <div>
                    <p className="text-2xl font-semibold">
                      {loading ? "..." : String(agents.length).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Registered active agents
                    </p>
                  </div>

                  <div className="h-12 w-px bg-[#e8e5de]" />

                  <div>
                    <p className="text-2xl font-semibold">HavenEstate</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Your property journey
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -right-3 -top-3 h-28 w-28 rounded-full bg-[#e1c58a]/30 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] bg-[#e9e6df]">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85"
                    alt="Professionals discussing property opportunities"
                    className="h-[340px] w-full object-cover sm:h-[430px]"
                  />

                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/30 bg-white/90 p-5 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#f5f0e6] p-3 text-[#82632e]">
                        <ShieldCheck size={22} />
                      </div>

                      <div>
                        <h2 className="font-semibold">
                          Meet our registered agents
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          Browse active agent accounts and contact them about
                          your property needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent directory */}
        <section
          id="agent-directory"
          className="border-t border-[#eeebe4] bg-white px-5 py-16 sm:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                  Our professionals
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Find your property expert
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Search real agents by name, contact information, location, or
                  professional specialty.
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {loading
                  ? "Loading agents..."
                  : `${filteredAgents.length} ${
                      filteredAgents.length === 1 ? "agent" : "agents"
                    }`}
              </span>
            </div>

            {/* Search and refresh */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#e9e6df] bg-[#faf9f6] px-4 py-3.5">
                <Search size={19} className="shrink-0 text-gray-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentIndex(0);
                  }}
                  placeholder="Search by name, email, phone, location..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  aria-label="Search registered agents"
                />
              </div>

              <button
                type="button"
                onClick={loadAgents}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e9e6df] bg-white px-5 py-3.5 text-sm font-medium transition hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* Error state */}
            {error && (
              <div
                role="alert"
                className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
              >
                <p className="font-medium text-red-800">
                  Unable to load agents
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={loadAgents}
                  className="mt-4 rounded-full bg-[#20251f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#343b32]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && !error && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-3xl border border-[#eeebe4] bg-white p-5"
                  >
                    <div className="mx-auto h-28 w-28 rounded-full bg-[#eeeae1]" />
                    <div className="mx-auto mt-5 h-4 w-2/3 rounded bg-[#eeeae1]" />
                    <div className="mx-auto mt-3 h-3 w-1/2 rounded bg-[#eeeae1]" />
                    <div className="mt-6 h-3 rounded bg-[#eeeae1]" />
                    <div className="mt-3 h-3 w-4/5 rounded bg-[#eeeae1]" />
                  </div>
                ))}
              </div>
            )}

            {/* Agent carousel */}
            {!loading && !error && filteredAgents.length > 0 && (
              <div className="mt-8">
                <div className="overflow-hidden">
                  <div
                    className="flex items-stretch transition-transform duration-700 ease-in-out motion-reduce:transition-none"
                    style={{
                      transform: `translateX(-${
                        currentIndex * (100 / visibleCount)
                      }%)`,
                    }}
                  >
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/4"
                        style={{ width: `${100 / visibleCount}%` }}
                      >
                        <AgentCard agent={agent} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel controls */}
                {filteredAgents.length > visibleCount && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label="Show previous agents"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e6df] bg-white text-[#20251f] transition hover:border-[#a17b38] hover:text-[#a17b38]"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Show agent position ${index + 1}`}
                          aria-current={
                            currentIndex === index ? "true" : undefined
                          }
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            currentIndex === index
                              ? "w-8 bg-[#a17b38]"
                              : "w-2.5 bg-[#dcd6c9] hover:bg-[#b6a98e]"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Show next agents"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e6df] bg-white text-[#20251f] transition hover:border-[#a17b38] hover:text-[#a17b38]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredAgents.length === 0 && (
              <div className="mt-8 rounded-3xl border border-dashed border-[#dcd6c9] px-6 py-16 text-center">
                <Building2 size={32} className="mx-auto text-[#a17b38]" />

                <h3 className="mt-4 text-lg font-semibold">
                  {agents.length === 0
                    ? "No registered agents yet"
                    : "No agents found"}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {agents.length === 0
                    ? "Active agent accounts will appear here when they are registered."
                    : "Try searching with a different name, email, phone, location, or specialty."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentIndex(0);
                    }}
                    className="mt-5 rounded-full bg-[#20251f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#343b32]"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Call to action */}
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#20251f] px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#e1c58a]">
                  Your next chapter
                </p>

                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Ready to find a place of your own?
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
                  Explore available listings and discover the possibilities
                  with HavenEstate.
                </p>
              </div>

              <Link
                to="/properties"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#e1c58a] px-6 py-3.5 text-sm font-semibold text-[#20251f] transition hover:bg-[#f0d9a7] md:self-center"
              >
                Browse properties
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
