import express from "express";
import {
  getAllHistory,
  createHistory,
  deleteHistory,
  cleanupOldHistory,
} from "../controllers/historyController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin-only routes
router.use(auth, authorize(["ADMIN"]));

router.get("/", getAllHistory);
router.post("/", createHistory);
router.delete("/", deleteHistory);
router.delete("/cleanup", cleanupOldHistory);

export default router;
