import express from "express";
import { getAnalyticsOverview } from "../controllers/analyticsController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getAnalyticsOverview);

export default router;
