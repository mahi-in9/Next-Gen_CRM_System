import express from "express";
import {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
} from "../controllers/authControllers.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", auth, getCurrentUser);

export default router;
