import mongoose from "mongoose";
import Property from "../models/Property.js";

const MAX_IMAGES = 10;

const editableFields = [
  "title",
  "description",
  "location",
  "price",
  "pricePeriod",
  "status",
  "type",
  "bedrooms",
  "bathrooms",
  "area",
  "images",
];

// Only photos uploaded to OUR Cloudinary account are accepted. When editing,
// photos already on the listing are also allowed, so older listings keep working.
const imagesAreValid = (images, existing = []) => {
  if (images === undefined) return true;
  if (!Array.isArray(images) || images.length > MAX_IMAGES) return false;

  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;

  return images.every(
    (url) =>
      typeof url === "string" &&
      (url.startsWith(prefix) || existing.includes(url))
  );
};

const sendInvalidImages = (res) =>
  res.status(400).json({
    success: false,
    message: `Photos must be uploaded through HavenEstate (up to ${MAX_IMAGES}).`,
  });

const sendNotFound = (res) =>
  res.status(404).json({ success: false, message: "Property not found" });

const isOwnerOf = (property, user) =>
  Boolean(property.agent) && property.agent.toString() === user._id.toString();

// POST /api/properties
export const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      price,
      pricePeriod,
      status,
      type,
      bedrooms,
      bathrooms,
      area,
      images,
    } = req.body;

    if (!imagesAreValid(images)) return sendInvalidImages(res);

    // Never trust role, approvalStatus, or agent from the request body.
    const isAdmin = req.user.role === "admin";

    const property = await Property.create({
      title,
      description,
      location,
      price,
      pricePeriod,
      status,
      type,
      bedrooms,
      bathrooms,
      area,
      images,
      // Every listing belongs to the account that created it
      agent: req.user._id,
      approvalStatus: isAdmin ? "approved" : "pending",
    });

    return res.status(201).json({ success: true, data: property });
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
    }
    next(error);
  }
};

// GET /api/properties
export const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      approvalStatus: "approved",
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/properties/:id
export const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return sendNotFound(res);

    // Only the agent's name and phone are public (never the email)
    const property = await Property.findOne({
      _id: id,
      approvalStatus: "approved",
    }).populate("agent", "name phone");

    if (!property) return sendNotFound(res);

    return res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// GET /api/properties/my-listings
export const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      agent: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/properties/:id
export const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return sendNotFound(res);

    const property = await Property.findById(id);

    if (!property) return sendNotFound(res);

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwnerOf(property, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own properties",
      });
    }

    if (!imagesAreValid(req.body.images, property.images)) {
      return sendInvalidImages(res);
    }

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        property.set(field, req.body[field]);
      }
    }

    // Any agent edit requires approval again.
    if (!isAdmin) {
      property.approvalStatus = "pending";
    }

    await property.save();

    return res.json({ success: true, data: property });
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
    }
    next(error);
  }
};

// DELETE /api/properties/:id
export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return sendNotFound(res);

    const property = await Property.findById(id);

    if (!property) return sendNotFound(res);

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwnerOf(property, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own properties",
      });
    }

    await property.deleteOne();

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/properties/:id/approval  (admin only, enforced in the route)
export const updatePropertyApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) return sendNotFound(res);

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "approvalStatus must be approved or rejected",
      });
    }

    const property = await Property.findById(id);

    if (!property) return sendNotFound(res);

    property.approvalStatus = approvalStatus;
    await property.save();

    return res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};