import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowUp, Mail, MapPin } from "lucide-react";
import Logo from "../common/Logo";

/* Link with an animated underline that grows on hover */
function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative inline-block pb-1 transition-all duration-300 hover:translate-x-1 hover:text-white"
    >
      {children}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-[#e1c58a] to-[#f4e3b8] transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

/* Column heading: gold label + fading line across the column */
function FooterHeading({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 rounded-full bg-[#e1c58a] shadow-[0_0_10px_#e1c58a]" />
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1c58a]">
        {children}
      </h3>
      <span className="h-px flex-1 bg-gradient-to-r from-[#e1c58a]/50 to-transparent" />
    </div>
  );
}

const socials = [
  { label: "Instagram", short: "IG", href: "https://instagram.com/" },
  { label: "LinkedIn", short: "in", href: "https://linkedin.com/" },
  { label: "Facebook", short: "f", href: "https://facebook.com/" },
];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#20251f] text-white">
      {/* Top gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#e1c58a] to-transparent" />

      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#e1c58a]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#e1c58a]/5 blur-3xl" />

      {/* Full-width content */}
      <div className="relative w-full px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
           <Logo />

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">
              Find a place to call home. Discover exceptional properties and
              make your next move with confidence.
            </p>

            {/* Social links — replace placeholder URLs with your real profiles */}
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:border-[#e1c58a] hover:bg-[#e1c58a] hover:text-[#20251f]"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <FooterHeading>Explore</FooterHeading>
            <ul className="mt-6 space-y-3 text-sm text-white/60">
              <li>
                <FooterLink to="/">Home</FooterLink>
              </li>
              <li>
                <FooterLink to="/properties">All Properties</FooterLink>
              </li>
              <li>
                <FooterLink to="/agents">Find an Agent</FooterLink>
              </li>
              <li>
                <FooterLink to="/about">About Us</FooterLink>
              </li>
            </ul>
          </div>

          {/* Property types */}
          <div>
            <FooterHeading>Property Types</FooterHeading>
            <ul className="mt-6 space-y-3 text-sm text-white/60">
              <li>
                <FooterLink to="/properties?type=House">Houses</FooterLink>
              </li>
              <li>
                <FooterLink to="/properties?type=Apartment">
                  Apartments
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/properties?type=Land">Land</FooterLink>
              </li>
              <li>
                <FooterLink to="/properties?status=For%20Rent">
                  Properties for Rent
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <FooterHeading>Get in Touch</FooterHeading>
            <ul className="mt-6 space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#e1c58a]">
                  <Mail size={16} />
                </span>
                <a
                  href="realestateconsultdesign@gmail.com"
                  className="group relative inline-block self-center pb-1 transition hover:text-white"
                >
                  realestateconsultdesign@gmail.com
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-[#e1c58a] to-[#f4e3b8] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#e1c58a]">
                  <MapPin size={16} />
                </span>
                <span className="self-center">Abuja, Nigeria</span>
              </li>
            </ul>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e1c58a]/40 px-5 py-2.5 text-sm font-semibold text-[#e1c58a] transition-all duration-300 hover:gap-3 hover:bg-[#e1c58a] hover:text-[#20251f]"
            >
              Explore properties <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RealEstateConsultDesign. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="group relative pb-1 transition hover:text-white"
            >
              Privacy Policy
              <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-[#e1c58a] transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link
              to="/terms"
              className="group relative pb-1 transition hover:text-white"
            >
              Terms of Service
              <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-[#e1c58a] transition-all duration-300 group-hover:w-full" />
            </Link>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#e1c58a] hover:bg-[#e1c58a] hover:text-[#20251f]"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}