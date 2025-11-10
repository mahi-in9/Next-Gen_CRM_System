import express from "express";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getContactActivities,
  createActivity,
} from "../controllers/contactController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth);

router.route("/").get(getContacts).post(createContact);

router.route("/:id").patch(updateContact).delete(deleteContact);

router.route("/:id/activities").get(getContactActivities);
router.route("/activities").post(createActivity);

export default router;
