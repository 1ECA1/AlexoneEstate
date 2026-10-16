
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, LoaderCircle } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import PropertyCard from "../../components/properties/PropertyCard";

export default function Favorites() {
  const { favorites, loadingFavorites } = useFavorites();

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="text-xl font-bold">
            Haven<span className="text-[#a17b38]">Estate</span>
          </Link>

          <Link
            to="/customer"
            className="text-sm font-semibold hover:text-[#a17b38]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/customer"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-[#20251f]"
        >
          <ArrowLeft size={17} /> Back to dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="mt-1 text-sm text-stone-500">
              Properties you have saved for later.
            </p>
          </div>
        </div>

        {loadingFavorites ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-stone-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading your saved properties...
          </div>
        ) : favorites.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <Heart size={38} className="mx-auto text-stone-300" />

            <h2 className="mt-5 text-xl font-bold">
              No saved properties yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Browse our property listings and tap the heart icon on any
              property you want to keep.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32]"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-stone-500">
              {favorites.length} saved{" "}
              {favorites.length === 1 ? "property" : "properties"}
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((property) => (
                <PropertyCard
                  key={property.id ?? property._id}
                  property={property}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
