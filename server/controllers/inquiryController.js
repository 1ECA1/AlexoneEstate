
import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";

const populateInquiry = (query) =>
  query
    .populate("property", "title location price status images approvalStatus")
    .populate("customer", "name email phone")
    .populate("agent", "name phone");

const sendNotFound = (res) =>
  res.status(404).json({
    success: false,
    message: "Inquiry not found.",
  });

// POST /api/inquiries/property/:propertyId
// Customers can inquire about approved properties only.
export const createInquiry = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { subject, message } = req.body;

    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message of at least 10 characters.",
      });
    }

    if (message.trim().length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Your message cannot exceed 3000 characters.",
      });
    }

    if (
      subject !== undefined &&
      (typeof subject !== "string" || subject.trim().length > 150)
    ) {
      return res.status(400).json({
        success: false,
        message: "The subject must be text of at most 150 characters.",
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      approvalStatus: "approved",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "This property is unavailable for inquiries.",
      });
    }

    if (!property.agent) {
      return res.status(400).json({
        success: false,
        message: "This property does not have an assigned agent.",
      });
    }

    const inquiry = await Inquiry.create({
      customer: req.user._id,
      property: property._id,
      agent: property.agent,
      subject: subject?.trim() || "Property inquiry",
      message: message.trim(),
    });

    const populatedInquiry = await populateInquiry(
      Inquiry.findById(inquiry._id)
    );

    return res.status(201).json({
      success: true,
      message: "Your inquiry has been sent successfully.",
      data: populatedInquiry,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/inquiries/customer
// Customers can see only their own inquiries.
export const getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await populateInquiry(
      Inquiry.find({ customer: req.user._id }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/inquiries/agent
// Agents can see inquiries assigned to them only.
export const getAgentInquiries = async (req, res, next) => {
  try {
    const inquiries = await populateInquiry(
      Inquiry.find({ agent: req.user._id }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/inquiries/agent/:id
// The assigned agent can respond and update inquiry status.
export const respondToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentResponse, status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return sendNotFound(res);
    }

    const allowedStatuses = [
      "new",
      "contacted",
      "viewing_scheduled",
      "resolved",
      "closed",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid inquiry status.",
      });
    }

    if (
      agentResponse !== undefined &&
      (typeof agentResponse !== "string" ||
        agentResponse.trim().length > 3000)
    ) {
      return res.status(400).json({
        success: false,
        message: "The response must be text of at most 3000 characters.",
      });
    }

    const inquiry = await Inquiry.findOne({
      _id: id,
      agent: req.user._id,
    });

    if (!inquiry) {
      // Does not reveal inquiries assigned to other agents.
      return sendNotFound(res);
    }

    if (agentResponse !== undefined) {
      inquiry.agentResponse = agentResponse.trim();
      inquiry.respondedAt = agentResponse.trim()
        ? new Date()
        : null;
    }

    if (status !== undefined) {
      inquiry.status = status;
    }

    await inquiry.save();

    const populatedInquiry = await populateInquiry(
      Inquiry.findById(inquiry._id)
    );

    return res.json({
      success: true,
      message: "Inquiry updated successfully.",
      data: populatedInquiry,
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/inquiries/admin
// Administrators can view all property inquiries.
export const getAdminInquiries = async (req, res, next) => {
  try {
    const inquiries = await populateInquiry(
      Inquiry.find({}).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/inquiries/admin/:id
// Administrators can respond to inquiries and update their status.
export const adminRespondToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return sendNotFound(res);
    }

    const allowedStatuses = [
      "new",
      "contacted",
      "viewing_scheduled",
      "resolved",
      "closed",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid inquiry status.",
      });
    }

    if (
      adminResponse !== undefined &&
      (typeof adminResponse !== "string" ||
        adminResponse.trim().length > 3000)
    ) {
      return res.status(400).json({
        success: false,
        message: "The admin response must be text of at most 3000 characters.",
      });
    }

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return sendNotFound(res);
    }

    if (adminResponse !== undefined) {
      inquiry.adminResponse = adminResponse.trim();
      inquiry.adminRespondedAt = adminResponse.trim() ? new Date() : null;
    }

    if (status !== undefined) {
      inquiry.status = status;
    }

    await inquiry.save();

    const populatedInquiry = await populateInquiry(
      Inquiry.findById(inquiry._id)
    );

    return res.json({
      success: true,
      message: "Inquiry updated successfully.",
      data: populatedInquiry,
    });
  } catch (error) {
    next(error);
  }
};
