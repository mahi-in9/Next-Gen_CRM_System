// src/controllers/history.controller.js
import prisma from "../models/prismaClient.js";

/* =======================================================
   📜 Lead History Controller
======================================================= */

// ✅ Create a history record (called automatically when lead updates)
export const createLeadHistory = async (req, res) => {
  try {
    const { leadId, changedBy, field, oldValue, newValue } = req.body;

    if (!leadId || !changedBy || !field)
      return res.status(400).json({ message: "Missing required fields" });

    const history = await prisma.leadHistory.create({
      data: {
        leadId,
        changedBy,
        field,
        oldValue: oldValue ?? "",
        newValue: newValue ?? "",
      },
    });

    res.status(201).json(history);
  } catch (error) {
    console.error("Error creating lead history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all lead histories (admin)
export const getAllHistories = async (req, res) => {
  try {
    const histories = await prisma.leadHistory.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timeStamp: "desc" },
    });

    res.status(200).json(histories);
  } catch (error) {
    console.error("Error fetching histories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get history by Lead ID
export const getHistoryByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const histories = await prisma.leadHistory.findMany({
      where: { leadId: Number(leadId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timeStamp: "desc" },
    });

    res.status(200).json(histories);
  } catch (error) {
    console.error("Error fetching lead history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a history record (admin-only)
export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.leadHistory.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "History record deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
