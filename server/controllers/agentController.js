
import User from "../models/User.js";

// GET /api/agents
// Return real, active agent accounts for the public directory.
export const getPublicAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      role: "agent",
      isActive: true,
    })
      .select(
        "name email phone profilePhotoUrl location specialty yearsOfExperience bio createdAt"
      )
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      count: agents.length,
      data: agents.map((agent) => ({
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        phone: agent.phone || "",
        profilePhotoUrl: agent.profilePhotoUrl || "",
        location: agent.location || "",
        specialty: agent.specialty || "",
        yearsOfExperience: agent.yearsOfExperience ?? 0,
        bio: agent.bio || "",
        createdAt: agent.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};
