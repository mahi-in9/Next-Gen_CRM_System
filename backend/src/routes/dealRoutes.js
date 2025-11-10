import express from "express";
import {
  getDeals,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
} from "../controllers/dealsController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =========================================================
   🛣️ Deals API Routes — Cleaner Paths
========================================================= */
router.get("/", auth, getDeals);
router.post("/", auth, createDeal);
router.patch("/:id", auth, updateDeal);
router.patch("/:id/stage", auth, updateDealStage);
router.delete("/:id", auth, deleteDeal);

export default router;
