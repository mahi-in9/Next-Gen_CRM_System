// src/routes/activity.routes.js
import express from "express";
import {
  createActivity,
  getAllActivities,
  getLeadActivities,
  deleteActivity,
  updateActivity,
} from "../controllers/activityController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth);

router.post("/", createActivity);
router.get("/", getAllActivities);
router.get("/lead/:leadId", getLeadActivities);
router.delete("/:id", deleteActivity);
router.put("/:id", updateActivity);

export default router;
