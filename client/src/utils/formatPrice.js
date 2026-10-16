// Formats a number as Nigerian Naira, e.g. 185000000 -> "₦185,000,000"
export function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}// Converts a property from the API into the shape our components expect
export function normalizeProperty(property) {
  return {
    ...property,
    id: property._id,
    image: property.images?.[0] || "",
    listedAt: property.createdAt,
  };
}