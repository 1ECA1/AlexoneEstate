
import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Property from "../models/Property.js";

// GET /api/favorites
// Get the logged-in customer's saved properties
export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customer: req.user._id,
    })
      .populate({
        path: "property",
        match: { approvalStatus: "approved" },
      })
      .sort({ createdAt: -1 });

    const properties = favorites
      .filter((favorite) => favorite.property)
      .map((favorite) => ({
        ...favorite.property.toObject(),
        favoriteId: favorite._id,
      }));

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorite properties",
    });
  }
};

// POST /api/favorites/:propertyId
// Save a property
export const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      approvalStatus: "approved",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Approved property not found",
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      {
        customer: req.user._id,
        property: propertyId,
      },
      {
        $setOnInsert: {
          customer: req.user._id,
          property: propertyId,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Property saved to favorites",
      data: favorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Property is already in favorites",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save favorite property",
    });
  }
};

// DELETE /api/favorites/:propertyId
// Remove a saved property
export const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      customer: req.user._id,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite property",
    });
  }
};
