// src/routes/lead.routes.js
import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Base route: /api/leads
 * All routes require authentication.
 */
router.use(auth);

// Create new lead
router.post("/", createLead);

// Get all leads owned by current user
router.get("/", getLeads);

// Update lead by ID
router.put("/:id", updateLead);

// Delete lead by ID
router.delete("/:id", deleteLead);

export default router;
