import Property from "../models/Property.js";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
};

const buildPropertySummary = (property) => ({
  id: property._id,
  title: property.title,
  location: property.location,
  price: property.price,
  formattedPrice: formatPrice(property.price),
  status: property.status,
  type: property.type,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  area: property.area,
  images: property.images,
});

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, filters = {} } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (
      typeof filters !== "object" ||
      filters === null ||
      Array.isArray(filters)
    ) {
      return res.status(400).json({
        success: false,
        message: "Filters must be a valid object.",
      });
    }

    const searchMessage = message.trim();

    const query = {
      approvalStatus: "approved",
    };

    // Optional location filter.
    if (
      typeof filters.location === "string" &&
      filters.location.trim()
    ) {
      query.location = {
        $regex: filters.location.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        $options: "i",
      };
    }

    // Optional property status filter.
    if (filters.status) {
      const allowedStatuses = [
        "For Sale",
        "For Rent",
        "Shortlet",
      ];

      const matchingStatus = allowedStatuses.find(
        (status) =>
          status.toLowerCase() ===
          String(filters.status).toLowerCase()
      );

      if (!matchingStatus) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be For Sale, For Rent, or Shortlet.",
        });
      }

      query.status = matchingStatus;
    }

    // Optional property type filter.
    if (
      typeof filters.type === "string" &&
      filters.type.trim()
    ) {
      query.type = {
        $regex: filters.type.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        $options: "i",
      };
    }

    // Optional maximum price.
    if (
      filters.maxPrice !== undefined &&
      filters.maxPrice !== ""
    ) {
      const maxPrice = Number(filters.maxPrice);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Maximum price must be a valid non-negative number.",
        });
      }

      query.price = {
        ...query.price,
        $lte: maxPrice,
      };
    }

    // Optional minimum price.
    if (
      filters.minPrice !== undefined &&
      filters.minPrice !== ""
    ) {
      const minPrice = Number(filters.minPrice);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum price must be a valid non-negative number.",
        });
      }

      query.price = {
        ...query.price,
        $gte: minPrice,
        ...(query.price || {}),
      };
    }

    // Optional minimum bedroom count.
    if (
      filters.minBedrooms !== undefined &&
      filters.minBedrooms !== ""
    ) {
      const minBedrooms = Number(filters.minBedrooms);

      if (
        !Number.isInteger(minBedrooms) ||
        minBedrooms < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimum bedrooms must be a non-negative integer.",
        });
      }

      query.bedrooms = {
        $gte: minBedrooms,
      };
    }

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title location price status type bedrooms bathrooms area images"
      )
      .lean();

    let reply;

    if (properties.length > 0) {
      reply =
        `I found ${properties.length} matching ` +
        `property listing${properties.length === 1 ? "" : "s"} ` +
        `for you. Here are the available options.`;
    } else {
      reply =
        "I couldn't find any approved properties matching " +
        "those filters. Try another location, property type, " +
        "or budget.";
    }

    return res.status(200).json({
      success: true,
      assistant: "HavenEstate Property Assistant",
      mode: "local-search",
      reply,
      count: properties.length,
      properties: properties.map(buildPropertySummary),
    });
  } catch (error) {
    next(error);
  }
};