
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Home, LoaderCircle } from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import PropertyCard from "../../components/properties/PropertyCard";
import { useFavorites } from "../../context/FavoritesContext";

export default function Favorites() {
  const navigate = useNavigate();

  const {
    favorites,
    loadingFavorites,
    toggleFavorite,
  } = useFavorites();

  async function handleRemove(propertyId) {
    try {
      await toggleFavorite(propertyId);
    } catch (error) {
      console.error("Could not remove favorite:", error);
      alert(
        error.response?.data?.message ||
          "Could not remove this property. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e9e8] text-rose-600">
            <Heart size={27} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b38]">
            Your personal collection
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            My Favorite Properties
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Keep the properties you love in one place. Revisit a listing
            whenever you're ready to take the next step.
          </p>
        </div>

        {loadingFavorites ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <LoaderCircle
              size={32}
              className="animate-spin text-[#a17b38]"
            />
            <p className="text-sm text-gray-500">
              Loading your saved properties...
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faf9f6] text-[#a17b38]">
              <Home size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No favorites yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              When you find a property you like, tap its heart icon to
              save it here for later.
            </p>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#20251f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#343b32]"
            >
              Explore properties
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#20251f]">
                  {favorites.length}
                </span>{" "}
                saved {favorites.length === 1 ? "property" : "properties"}
              </p>

              <button
                type="button"
                onClick={() => navigate("/properties")}
                className="text-sm font-semibold text-[#82632e] transition hover:underline"
              >
                Browse more
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />

                  <button
                    type="button"
                    onClick={() => handleRemove(property.id)}
                    aria-label={`Remove ${property.title} from favorites`}
                    title="Remove from favorites"
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100"
                  >
                    <Heart size={19} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
