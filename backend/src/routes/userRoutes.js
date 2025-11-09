import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserLeads,
  getUserActivities,
} from "../controllers/userController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth);

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id/leads", getUserLeads);
router.get("/:id/activities", getUserActivities);

router.get("/", getAllUsers);

export default router;
