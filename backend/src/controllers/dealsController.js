import prisma from "../models/prismaClient.js";

/* =========================================================
   🎯 Deals Controller — Production Ready
========================================================= */

/**
 * ✅ Get all deals belonging to logged-in user
 * Supports optional query filtering by stage.
 */
export const getDeals = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { stage } = req.query;

    const deals = await prisma.deal.findMany({
      where: {
        ownerid: userId,
        ...(stage ? { stage } : {}),
      },
      include: {
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
      },
      orderBy: { createdat: "desc" },
    });

    res.status(200).json(deals);
  } catch (error) {
    console.error("❌ [getDeals]", error);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
};

/**
 * ✅ Create a new deal
 */
export const createDeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, value, stage, contactId, description } = req.body;

    if (!title || value == null) {
      return res.status(400).json({ error: "Title and value are required" });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        value: Number(value),
        stage: stage || "Lead",
        description: description || null,
        contactid: contactId || null,
        ownerid: userId,
      },
      include: {
        contacts: {
          select: { id: true, name: true, company: true },
        },
      },
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error("❌ [createDeal]", error);
    res.status(500).json({ error: "Failed to create deal" });
  }
};

/**
 * ✅ Update an existing deal
 * Supports partial updates (title, value, stage, etc.)
 */
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    // Ensure deal belongs to this user
    const existing = await prisma.deal.findUnique({
      where: { id },
      select: { ownerid: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Deal not found" });
    }

    if (existing.ownerid !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this deal" });
    }

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: {
        ...data,
        value: data.value ? Number(data.value) : undefined,
        updatedat: new Date(),
      },
      include: {
        contacts: {
          select: { id: true, name: true, company: true },
        },
      },
    });

    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error("❌ [updateDeal]", error);
    res.status(500).json({ error: "Failed to update deal" });
  }
};

/**
 * ✅ Update only the deal stage
 * Example: PATCH /api/deals/:id/stage
 */
export const updateDealStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const userId = req.user.id;

    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    if (deal.ownerid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.deal.update({
      where: { id },
      data: { stage, updatedat: new Date() },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ [updateDealStage]", error);
    res.status(500).json({ error: "Failed to update stage" });
  }
};

/**
 * ✅ Delete a deal by ID
 */
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { ownerid: true },
    });

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    if (deal.ownerid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.deal.delete({ where: { id } });

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.error("❌ [deleteDeal]", error);
    res.status(500).json({ error: "Failed to delete deal" });
  }
};
