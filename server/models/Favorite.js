
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same customer from saving a property more than once.
favoriteSchema.index(
  { customer: 1, property: 1 },
  { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
