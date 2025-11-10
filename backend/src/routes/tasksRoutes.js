import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/tasksContorller.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getTasks);
router.post("/", auth, createTask);
router.patch("/:id", auth, updateTask);
router.patch("/:id/status", auth, updateTaskStatus);
router.delete("/:id", auth, deleteTask);

export default router;
