import express from "express";
import { getPublicAgents } from "../controllers/agentController.js";

const router = express.Router();

router.get("/", getPublicAgents);

export default router;