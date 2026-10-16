
import { Link } from "react-router-dom";
import {
  Heart,
  UserRound,
  MessageSquare,
  Search,
  ArrowUpRight,
  House,
} from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";

const actions = [
  {
    title: "Browse Properties",
    description: "Discover your next home or investment.",
    path: "/properties",
    icon: Search,
  },
  {
    title: "My Profile",
    description: "View your customer account.",
    path: "/customer/profile",
    icon: UserRound,
  },
  {
    title: "My Inquiries",
    description: "View your property inquiries.",
    path: "/customer/inquiries",
    icon: MessageSquare,
  },
];

export default function CustomerDashboard() {
  const { favorites, loadingFavorites } = useFavorites();

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Haven<span className="text-[#a17b38]">Estate</span>
          </Link>

          <Link
            to="/properties"
            className="rounded-full bg-[#a17b38] px-5 py-3 text-sm font-semibold text-white hover:bg-[#343b32]"
          >
            Explore Properties
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-3xl bg-[#20251f] p-7 text-white sm:p-10">
          <p className="text-sm font-medium text-[#d7bd85]">
            CUSTOMER PORTAL
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome to your dashboard
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300 sm:text-base">
            Manage your saved properties, explore real estate opportunities,
            and keep your property search organized.
          </p>

          <Link
            to="/properties"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#a17b38] px-6 py-3 text-sm font-semibold text-white hover:bg-[#89682f]"
          >
            Find a Property <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Heart size={23} />
            </div>

            <p className="mt-5 text-sm text-stone-500">Saved properties</p>

            <p className="mt-1 text-3xl font-bold">
              {loadingFavorites ? "…" : favorites.length}
            </p>

            <Link
              to="/customer/favorites"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a17b38]"
            >
              View favorites <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-[#20251f]">
              <House size={23} />
            </div>

            <p className="mt-5 text-sm text-stone-500">Property discovery</p>

            <p className="mt-1 text-xl font-bold">Find your next property</p>

            <Link
              to="/properties"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a17b38]"
            >
              Browse listings <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#a17b38]">
              <MessageSquare size={23} />
            </div>

            <p className="mt-5 text-sm text-stone-500">Communication</p>

            <p className="mt-1 text-xl font-bold">Property inquiries</p>

            <Link
              to="/customer/inquiries"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a17b38]"
            >
              View inquiries <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Quick access</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {actions.map(({ title, description, path, icon: Icon }) => (
              <Link
                key={title}
                to={path}
                className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <Icon size={22} className="text-[#a17b38]" />
                  <ArrowUpRight
                    size={18}
                    className="text-stone-400 transition group-hover:text-[#a17b38]"
                  />
                </div>

                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
