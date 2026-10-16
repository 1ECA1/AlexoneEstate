
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Home,
  Building2,
  Building,
  Warehouse,
  Tag,
  KeyRound,
  Clock,
  Users,
  Info,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const saleLinks = [
  {
    label: "Flat",
    href: "/properties?type=Flat&status=For%20Sale",
  },
  {
    label: "Duplex",
    href: "/properties?type=Duplex&status=For%20Sale",
  },
  {
    label: "Apartment",
    href: "/properties?type=Apartment&status=For%20Sale",
  },
  {
    label: "House for Sale",
    href: "/properties?type=House&status=For%20Sale",
  },
  {
    label: "Land for Sale",
    href: "/properties?type=Land&status=For%20Sale",
  },
  {
    label: "Commercial Property",
    href: "/properties?type=Commercial&status=For%20Sale",
  },
];

const rentLinks = [
  {
    label: "Flat",
    href: "/properties?type=Flat&status=For%20Rent",
  },
  {
    label: "Duplex",
    href: "/properties?type=Duplex&status=For%20Rent",
  },
  {
    label: "Apartment",
    href: "/properties?type=Apartment&status=For%20Rent",
  },
  {
    label: "House for Rent",
    href: "/properties?type=House&status=For%20Rent",
  },
  {
    label: "Land for Rent",
    href: "/properties?type=Land&status=For%20Rent",
  },
  {
    label: "Commercial Property",
    href: "/properties?type=Commercial&status=For%20Rent",
  },
];

const propertyLinks = [
  {
    label: "Flat",
    href: "/properties?type=Flat",
    Icon: Building,
  },
  {
    label: "Duplex",
    href: "/properties?type=Duplex",
    Icon: Home,
  },
  {
    label: "Apartment",
    href: "/properties?type=Apartment",
    Icon: Building2,
  },
  {
    label: "Commercial Property",
    href: "/properties?type=Commercial",
    Icon: Warehouse,
  },
];

function MobileDropdown({
  label,
  links,
  onNavigate,
  isOpen,
  onToggle,
}) {
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-3.5 text-left text-[15px] font-medium text-white/90 transition hover:text-[#e1c58a]"
      >
        <span className="flex items-center gap-3">
          {label === "Sale" ? (
            <Tag size={18} />
          ) : (
            <KeyRound size={18} />
          )}
          {label}
        </span>

        <span className="text-lg leading-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="mb-3 ml-2 border-l border-[#e1c58a]/40 pl-3">
          {links.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 py-2.5 text-[13px] leading-5 text-white/65 transition hover:text-[#e1c58a]"
            >
              <Building2 size={15} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState("");

  const navigate = useNavigate();
  const { user, isLoggedIn, logout: signOut } = useAuth();

  const role = String(user?.role || "").toLowerCase();

  const isCustomer = role === "customer";
  const isAgent = role === "agent";
  const isAdmin = role === "admin";

  const dashboardPath = isAdmin
    ? "/admin"
    : isAgent
      ? "/agent"
      : "/customer";

  // Replace these with your actual business contact details.
  const contactEmail = "info@havenestate.com";
  const contactPhone = "+234 800 000 0000";

  function closeMobile() {
    setMobileOpen(false);
    setMobileDropdown("");
  }

  function logout() {
    signOut();
    closeMobile();
    navigate("/");
  }

  const topLinkClass = ({ isActive }) =>
    `flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] font-semibold transition-colors duration-200 hover:text-[#e1c58a] 2xl:text-sm ${
      isActive ? "text-[#e1c58a]" : "text-white/85"
    }`;

  const mainLinkClass = ({ isActive }) =>
    `flex items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 hover:text-[#e1c58a] 2xl:text-[15px] ${
      isActive ? "text-[#e1c58a]" : "text-white/90"
    }`;

  return (
    <header className="relative z-[60] w-full text-white">

      {/* =====================================================
          FIRST NAVBAR — PROPERTY TYPES + EMAIL + PHONE
          Desktop only
      ====================================================== */}
      <div className="hidden border-b border-white/10 bg-[#171b16] xl:block">
        <div className="mx-auto flex min-h-[62px] w-full items-center justify-between gap-8 px-6 lg:px-10 2xl:px-14">

          {/* Property types */}
          <div className="flex min-w-0 items-center gap-5 2xl:gap-7">
            {propertyLinks.map(({ label, href, Icon }) => (
              <NavLink
                key={label}
                to={href}
                className={topLinkClass}
              >
                <Icon size={17} className="text-[#e1c58a]" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Contact information */}
          <div className="flex shrink-0 items-center gap-6 2xl:gap-8">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-[13px] text-white/75 transition hover:text-[#e1c58a] 2xl:text-sm"
            >
              <Mail size={17} className="text-[#e1c58a]" />
              <span>{contactEmail}</span>
            </a>

            <a
              href={`tel:${contactPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-[13px] text-white/75 transition hover:text-[#e1c58a] 2xl:text-sm"
            >
              <Phone size={17} className="text-[#e1c58a]" />
              <span>{contactPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* =====================================================
          SECOND NAVBAR — MAIN WEBSITE NAVIGATION
      ====================================================== */}
      <nav className="relative w-full bg-[#20251f] shadow-md">
        <div className="mx-auto flex min-h-[86px] w-full items-center justify-between gap-5 px-5 sm:px-8 lg:px-10 2xl:px-14">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e1c58a] text-xl font-bold text-[#20251f]">
              H
            </span>

            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              Haven<span className="text-[#e1c58a]">Estate</span>
            </span>
          </Link>

          {/* Desktop main links — every item has an icon */}
          <div className="hidden items-center gap-5 xl:flex 2xl:gap-7">

            <NavLink to="/" className={mainLinkClass}>
              <Home size={17} />
              Home
            </NavLink>

            <NavLink
              to="/properties?status=For%20Sale"
              className={mainLinkClass}
            >
              <Tag size={17} />
              For Sale
            </NavLink>

            <NavLink
              to="/properties?status=For%20Rent"
              className={mainLinkClass}
            >
              <KeyRound size={17} />
              For Rent
            </NavLink>

            <NavLink
              to="/properties?type=Shortlet"
              className={mainLinkClass}
            >
              <Clock size={17} />
              Shortlet
            </NavLink>

            <NavLink to="/agents" className={mainLinkClass}>
              <Users size={17} />
              Agent
            </NavLink>

            <NavLink to="/about" className={mainLinkClass}>
              <Info size={17} />
              About Us
            </NavLink>

            <NavLink
              to="/customer/favorites"
              aria-label="Favourites"
              title="Favourites"
              className={({ isActive }) =>
                `flex items-center gap-2 transition duration-200 hover:text-[#e1c58a] ${
                  isActive ? "text-[#e1c58a]" : "text-white/90"
                }`
              }
            >
              <Heart size={20} />
              <span className="text-sm font-semibold">Favourite</span>
            </NavLink>
          </div>

          {/* Desktop Login / Dashboard */}
          <div className="hidden shrink-0 items-center xl:flex">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80">
                  Hi, {user?.name?.trim()?.split(/\s+/)[0] || "there"}
                </span>

                {(isCustomer || isAgent || isAdmin) && (
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold transition hover:border-[#e1c58a] hover:text-[#e1c58a]"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold transition hover:border-[#e1c58a] hover:bg-white/5 hover:text-[#e1c58a]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full bg-[#e1c58a] px-5 py-3 text-sm font-bold text-[#20251f] transition duration-200 hover:bg-white hover:shadow-lg"
              >
                <LogIn size={17} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl border border-white/15 p-2.5 transition hover:border-[#e1c58a] hover:text-[#e1c58a] xl:hidden"
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          {/* =================================================
              MOBILE NAVIGATION — EXISTING DROPDOWN BEHAVIOUR
          ================================================== */}
          {mobileOpen && (
            <>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobile}
                className="fixed inset-0 z-[65] cursor-default bg-black/30 xl:hidden"
              />

              <div className="absolute right-0 top-full z-[70] max-h-[calc(100dvh-90px)] w-[40vw] min-w-[260px] max-w-[360px] overflow-y-auto rounded-bl-2xl border border-white/10 bg-[#20251f] p-4 shadow-2xl sm:p-5 xl:hidden">
                <div className="flex flex-col">

                  <Link
                    to="/"
                    onClick={closeMobile}
                    className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-medium transition hover:text-[#e1c58a]"
                  >
                    <Home size={18} />
                    Home
                  </Link>

                  <MobileDropdown
                    label="Sale"
                    links={saleLinks}
                    onNavigate={closeMobile}
                    isOpen={mobileDropdown === "Sale"}
                    onToggle={() =>
                      setMobileDropdown((current) =>
                        current === "Sale" ? "" : "Sale"
                      )
                    }
                  />

                  <MobileDropdown
                    label="Rent"
                    links={rentLinks}
                    onNavigate={closeMobile}
                    isOpen={mobileDropdown === "Rent"}
                    onToggle={() =>
                      setMobileDropdown((current) =>
                        current === "Rent" ? "" : "Rent"
                      )
                    }
                  />

                  <Link
                    to="/properties?type=Shortlet"
                    onClick={closeMobile}
                    className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-medium transition hover:text-[#e1c58a]"
                  >
                    <Clock size={18} />
                    Shortlet
                  </Link>

                  <Link
                    to="/agents"
                    onClick={closeMobile}
                    className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-medium transition hover:text-[#e1c58a]"
                  >
                    <Users size={18} />
                    Agent
                  </Link>

                  <Link
                    to="/about"
                    onClick={closeMobile}
                    className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-medium transition hover:text-[#e1c58a]"
                  >
                    <Info size={18} />
                    About Us
                  </Link>

                  <Link
                    to="/customer/favorites"
                    onClick={closeMobile}
                    className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-medium transition hover:text-[#e1c58a]"
                  >
                    <Heart size={18} />
                    Favourite
                  </Link>

                  {isLoggedIn && (isCustomer || isAgent || isAdmin) && (
                    <Link
                      to={dashboardPath}
                      onClick={closeMobile}
                      className="mt-4 flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold transition hover:border-[#e1c58a] hover:text-[#e1c58a]"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>
                  )}

                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-4 flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold transition hover:border-[#e1c58a] hover:text-[#e1c58a]"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#e1c58a] px-4 py-3 text-sm font-bold text-[#20251f] transition hover:bg-white"
                    >
                      <LogIn size={17} />
                      Login
                    </Link>
                  )}

                  {/* Contact information remains accessible on mobile */}
                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-2 break-all text-xs text-white/70 hover:text-[#e1c58a]"
                    >
                      <Mail size={15} className="shrink-0 text-[#e1c58a]" />
                      {contactEmail}
                    </a>

                    <a
                      href={`tel:${contactPhone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-xs text-white/70 hover:text-[#e1c58a]"
                    >
                      <Phone size={15} className="shrink-0 text-[#e1c58a]" />
                      {contactPhone}
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
