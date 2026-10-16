// Converts a property from the API into the shape our components expect
export function normalizeProperty(property) {
  return {
    ...property,
    id: property._id,
    image: property.images?.[0] || "",
    listedAt: property.createdAt,
  };
}