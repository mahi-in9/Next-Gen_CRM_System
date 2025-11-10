import prisma from "../models/prismaClient.js";

/* =========================================================
   🎯 TASK CONTROLLER — Production Ready
========================================================= */

/**
 * ✅ GET /api/v1/tasks
 * Fetch all tasks belonging to the logged-in user.
 * Supports optional query filters: status, priority, dueDate.
 */
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        ownerid: userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      include: {
        contacts: {
          select: { id: true, name: true, email: true },
        },
        deals: {
          select: { id: true, title: true, stage: true },
        },
      },
      orderBy: { createdat: "desc" },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("❌ [getTasks]", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

/**
 * ✅ POST /api/v1/tasks
 * Create a new task assigned to a user, contact, or deal.
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, status, dueDate, contactId, dealId } =
      req.body;

    if (!title || !priority || !status) {
      return res
        .status(400)
        .json({ error: "Title, priority, and status are required" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority,
        status,
        duedate: dueDate ? new Date(dueDate) : null,
        contactid: contactId || null,
        dealid: dealId || null,
        ownerid: userId,
      },
      include: {
        contacts: { select: { id: true, name: true } },
        deals: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("❌ [createTask]", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

/**
 * ✅ PATCH /api/v1/tasks/:id
 * Update a task (title, status, priority, etc.)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [k, v === "" ? null : v])
    );

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { ownerid: true },
    });

    if (!existing) return res.status(404).json({ error: "Task not found" });
    if (existing.ownerid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        duedate: data.duedate ? new Date(data.duedate) : null,
        contactid: data.contactid,
        dealid: data.dealid,
        updatedat: new Date(),
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("❌ [updateTask]", error);
    res.status(500).json({ error: error.message || "Failed to update task" });
  }
};

/**
 * ✅ PATCH /api/v1/tasks/:id/status
 * Update only task status.
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.ownerid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.task.update({
      where: { id },
      data: { status, updatedat: new Date() },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ [updateTaskStatus]", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
};

/**
 * ✅ DELETE /api/v1/tasks/:id
 * Delete a task by ID.
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { ownerid: true },
    });

    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.ownerid !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ [deleteTask]", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
