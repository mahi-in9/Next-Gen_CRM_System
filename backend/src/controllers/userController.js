// src/controllers/user.controller.js
import prisma from "../models/prismaClient.js";
import bcrypt from "bcrypt";

// ================================
// Get all users (admin only)
// ================================
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { id: "asc" },
    });

    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// ================================
// Get user by ID
// ================================
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ================================
// Update user
// ================================
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Only admins or self-update allowed
    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.user.role === "ADMIN") updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// ================================
// Delete user
// ================================
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ================================
// Get all leads of user
// ================================
export const getUserLeads = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leads = await prisma.lead.findMany({
      where: { ownerId: Number(id) },
      include: {
        activities: true,
        history: true,
      },
    });

    res.status(200).json({ success: true, leads });
  } catch (err) {
    next(err);
  }
};

// ================================
// Get user activities
// ================================
export const getUserActivities = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activities = await prisma.activity.findMany({
      where: { userId: Number(id) },
      include: { lead: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, activities });
  } catch (err) {
    next(err);
  }
};
