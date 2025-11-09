import express from "express";
import {
  createLeadHistory,
  getAllHistories,
  getHistoryByLead,
  deleteHistory,
} from "../controllers/historyController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, createLeadHistory);
router.get("/", auth, authorize(["ADMIN"]), getAllHistories);
router.get("/:leadId", auth, getHistoryByLead);
router.delete("/:id", auth, authorize(["ADMIN"]), deleteHistory);

export default router;
