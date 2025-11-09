// src/controllers/activity.controller.js
import prisma from "../models/prismaClient.js";
import { io } from "../server.js";

/* =======================================================
   🧩 CREATE ACTIVITY
======================================================= */
export const createActivity = async (req, res) => {
  try {
    const { leadId, details, type } = req.body;
    const userId = req.user?.id;

    if (!leadId || !details || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: leadId, details, and type are required.",
      });
    }

    // Verify lead existence
    const leadExists = await prisma.lead.findUnique({
      where: { id: Number(leadId) },
    });
    if (!leadExists) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found." });
    }

    const activity = await prisma.activity.create({
      data: {
        leadId: Number(leadId),
        userId,
        details,
        type,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true } },
      },
    });

    // Emit real-time socket event
    io.emit("activity:created", activity);

    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error("❌ Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while creating activity.",
    });
  }
};

/* =======================================================
   📋 GET ALL ACTIVITIES (Admin / Manager View)
======================================================= */
export const getAllActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, activities });
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching activities.",
    });
  }
};

/* =======================================================
   🧠 GET ACTIVITIES FOR SPECIFIC LEAD
======================================================= */
export const getLeadActivities = async (req, res) => {
  try {
    const leadId = parseInt(req.params.leadId, 10);
    if (isNaN(leadId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or missing leadId parameter.",
        });
    }

    const activities = await prisma.activity.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.error("❌ Error fetching lead activities:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching lead activities.",
    });
  }
};

/* =======================================================
   🗑️ DELETE ACTIVITY
======================================================= */
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activityId = parseInt(id, 10);

    if (isNaN(activityId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid activity ID." });
    }

    await prisma.activity.delete({ where: { id: activityId } });

    io.emit("activity:deleted", { id: activityId });

    res.json({ success: true, message: "Activity deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while deleting activity.",
    });
  }
};

/* =======================================================
   ✏️ UPDATE ACTIVITY DETAILS
======================================================= */
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { details } = req.body;
    const activityId = parseInt(id, 10);

    if (isNaN(activityId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid activity ID." });
    }

    if (!details || details.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Activity details cannot be empty.",
      });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: { details },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true } },
      },
    });

    io.emit("activity:updated", updatedActivity);

    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error("❌ Error updating activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while updating activity.",
    });
  }
};
