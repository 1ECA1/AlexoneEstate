import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Real Estate Consult & Development LTD, home"
      className="group flex shrink-0 items-center gap-3"
    >
      {/* White badge keeps the navy part of the logo visible on a dark bar */}
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-black/25 transition-transform duration-300 group-hover:-rotate-6">
        <img
          src={logo}
          alt=""
          className="h-full w-full object-contain"
        />
      </span>

      <span className="text-xl font-black uppercase leading-none tracking-tight text-white sm:text-2xl">
        Real{" "}
        <span className="text-[#e1c58a]">Estate</span>
        <span className="mt-1.5 block text-[8px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:text-[9px] sm:tracking-[0.25em]">
          Consult &amp; Development LTD
        </span>
      </span>
    </Link>
  );
}