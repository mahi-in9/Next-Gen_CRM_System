// src/routes/dashboard.routes.js
import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

// Protected route
router.get("/", auth, getDashboardData);

export default router;
