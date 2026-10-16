import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
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
      index: true,
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "Property inquiry",
    },

    message: {
      type: String,
      required: [true, "Please enter your inquiry message."],
      trim: true,
      minlength: [10, "Your message must be at least 10 characters."],
      maxlength: [3000, "Your message cannot exceed 3000 characters."],
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "viewing_scheduled",
        "resolved",
        "closed",
      ],
      default: "new",
      index: true,
    },

    // Existing agent response
    agentResponse: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    // New administrator response
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    adminRespondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

inquirySchema.index({ customer: 1, createdAt: -1 });
inquirySchema.index({ agent: 1, createdAt: -1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;