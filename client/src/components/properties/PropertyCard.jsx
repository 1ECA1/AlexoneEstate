import { Heart, MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";


export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const propertyId = property.id ?? property._id;
  const favourite = isFavorite(propertyId);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  async function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!propertyId) {
      console.error("Cannot save favorite: property ID is missing.");
      return;
    }

    try {
      const result = await toggleFavorite(propertyId);

      if (result?.requiresLogin) {
        navigate("/login", {
          state: {
            from: window.location.pathname,
          },
        });
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);

      if (error.response?.status === 401) {
        navigate("/login", {
          state: {
            from: window.location.pathname,
          },
        });
        return;
      }

      window.alert(
        error.response?.data?.message ||
          "Could not update favorites. Please try again."
      );
    }
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5">
      {/* Property image and actions */}
      <div className="relative h-60 overflow-hidden sm:h-64">
        <img
          src={
            property.image ||
            property.images?.[0] ||
            "https://placehold.co/800x600/f5f0e6/20251f?text=HavenEstate"
          }
          alt={property.title || "Property"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#20251f]">
          {property.status || "Property"}
        </span>

        <button
          type="button"
          aria-label={
            favourite
              ? "Remove from favourites"
              : "Add to favourites"
          }
          aria-pressed={favourite}
          onClick={handleFavoriteClick}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition ${
            favourite
              ? "bg-rose-50 text-rose-500"
              : "bg-white/95 text-stone-700 hover:bg-white"
          }`}
        >
          <Heart
            size={19}
            className={
              favourite
                ? "fill-rose-500 text-rose-500"
                : "text-stone-700"
            }
          />
        </button>

        <div className="absolute bottom-4 left-4 rounded-xl bg-[#20251f]/90 px-3 py-2 text-xs font-medium text-white">
          {property.type || "Real Estate"}
        </div>
      </div>

      {/* Property information */}
      <div className="p-5 sm:p-6">
        <p className="text-xl font-bold tracking-tight text-[#20251f]">
          {formatPrice(property.price)}

          {property.pricePeriod && property.pricePeriod !== "none" && (
            <span className="ml-1 text-xs font-medium text-stone-500">
              / {property.pricePeriod}
            </span>
          )}
        </p>

        <h3 className="mt-3 text-base font-semibold text-[#20251f]">
          {property.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
          <MapPin size={15} className="shrink-0 text-[#a17b38]" />
          {property.location || "Location not specified"}
        </p>

        {/* Property features */}
        <div className="my-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-stone-100 py-4 text-xs text-stone-600">
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} />
            {property.bedrooms ?? 0} Beds
          </span>

          <span className="flex items-center gap-1.5">
            <Bath size={16} />
            {property.bathrooms ?? 0} Baths
          </span>

          <span className="flex items-center gap-1.5">
            <Maximize2 size={15} />
            {property.area
              ? `${Number(property.area).toLocaleString()} m²`
              : "Area N/A"}
          </span>
        </div>

        {/* Property details link */}
        <Link
          to={`/properties/${propertyId}`}
          className="flex w-full items-center justify-center rounded-full border border-stone-300 py-3 text-sm font-semibold text-[#20251f] transition hover:border-[#20251f] hover:bg-[#20251f] hover:text-white"
        >
          View Property
        </Link>
      </div>
    </article>
  );
}
