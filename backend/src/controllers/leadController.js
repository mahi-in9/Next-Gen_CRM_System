// src/controllers/lead.controller.js
import prisma from "../models/prismaClient.js";
import { io } from "../server.js";

/* -------------------- CREATE LEAD -------------------- */
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, stage } = req.body;
    const userId = req.user.id;

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        stage: stage || "new",
        ownerId: userId,
      },
      include: { activities: true },
    });

    // Log activity for audit trail
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        userId,
        details: `Created new lead: ${lead.name}`,
        type: "CREATE",
      },
    });

    // Emit real-time socket event
    io.emit("lead:created", lead);

    res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error("❌ Create Lead Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* -------------------- GET LEADS -------------------- */
export const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { ownerId: req.user.id },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 5 },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { id: "desc" },
    });

    res.json({ success: true, leads });
  } catch (error) {
    console.error("❌ Get Leads Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* -------------------- UPDATE LEAD -------------------- */
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const existing = await prisma.lead.findUnique({ where: { id: +id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });

    // Save change history
    for (const field in updates) {
      if (existing[field] !== updates[field]) {
        await prisma.leadHistory.create({
          data: {
            leadId: +id,
            changedBy: userId,
            field,
            oldValue: existing[field]?.toString() || "",
            newValue: updates[field]?.toString() || "",
          },
        });
      }
    }

    const updated = await prisma.lead.update({
      where: { id: +id },
      data: updates,
      include: { activities: true },
    });

    await prisma.activity.create({
      data: {
        leadId: updated.id,
        userId,
        details: `Updated lead: ${updated.name}`,
        type: "UPDATE",
      },
    });

    io.emit("lead:updated", updated);

    res.json({ success: true, lead: updated });
  } catch (error) {
    console.error("❌ Update Lead Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/* -------------------- DELETE LEAD -------------------- */
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedLead = await prisma.lead.delete({
      where: { id: +id },
    });

    await prisma.activity.create({
      data: {
        leadId: deletedLead.id,
        userId,
        details: `Deleted lead: ${deletedLead.name}`,
        type: "DELETE",
      },
    });

    io.emit("lead:deleted", {
      id: +id,
      message: `Lead deleted: ${deletedLead.name}`,
    });

    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Lead Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
