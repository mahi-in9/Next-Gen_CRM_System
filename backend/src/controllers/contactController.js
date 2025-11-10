import prisma from "../models/prismaClient.js";

/* =======================================================
   📘 CONTACT CONTROLLER — Production Ready
   CRUD + Contact History + Linked Activity Support
======================================================= */

/* ----------------------------------------
   ✅ GET /api/contacts
   Fetch all contacts belonging to logged-in user
---------------------------------------- */
export const getContacts = async (req, res) => {
  try {
    const user = req.user;
    const contacts = await prisma.contact.findMany({
      where: { ownerid: user.id },
      orderBy: { createdat: "desc" },
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

/* ----------------------------------------
   ✅ POST /api/contacts
   Create new contact + record creation history
---------------------------------------- */
export const createContact = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, phone, company, position, notes } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        notes,
        ownerid: user.id,
      },
    });

    // Log creation in ContactHistory
    await prisma.contactHistory.create({
      data: {
        contactid: newContact.id,
        changedby: user.id,
        field: "Created",
        oldvalue: null,
        newvalue: `Contact created by ${user.name}`,
      },
    });

    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Failed to create contact" });
  }
};

/* ----------------------------------------
   ✅ PATCH /api/contacts/:id
   Update contact + auto-log changes in ContactHistory
---------------------------------------- */
export const updateContact = async (req, res) => {
  try {
    const user = req.user;
    const contactId = req.params.id;
    const updates = req.body;

    const existing = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existing || existing.ownerid !== user.id) {
      return res
        .status(404)
        .json({ message: "Contact not found or unauthorized" });
    }

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...updates,
        updatedat: new Date(),
      },
    });

    // Create contact history for each changed field
    const changedFields = Object.keys(updates).filter(
      (field) => updates[field] !== existing[field]
    );

    if (changedFields.length > 0) {
      const historyData = changedFields.map((field) => ({
        contactid: contactId,
        changedby: user.id,
        field,
        oldvalue: existing[field]?.toString() || null,
        newvalue: updates[field]?.toString() || null,
      }));

      await prisma.contactHistory.createMany({ data: historyData });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

/* ----------------------------------------
   ✅ DELETE /api/contacts/:id
   Delete contact + record deletion in ContactHistory
---------------------------------------- */
export const deleteContact = async (req, res) => {
  try {
    const user = req.user;
    const contactId = req.params.id;

    const existing = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existing || existing.ownerid !== user.id) {
      return res
        .status(404)
        .json({ message: "Contact not found or unauthorized" });
    }

    await prisma.contact.delete({ where: { id: contactId } });

    await prisma.contactHistory.create({
      data: {
        contactid: contactId,
        changedby: user.id,
        field: "Deleted",
        oldvalue: existing.name,
        newvalue: "Contact deleted",
      },
    });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};

/* ----------------------------------------
   ✅ GET /api/contacts/:id/activities
   Fetch recent activities linked to contact
---------------------------------------- */
export const getContactActivities = async (req, res) => {
  try {
    const contactId = req.params.id;

    const activities = await prisma.activity.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching contact activities:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

/* ----------------------------------------
   ✅ POST /api/activities
   Create a note-type activity linked to a contact
---------------------------------------- */
export const createActivity = async (req, res) => {
  try {
    const user = req.user;
    const { contactId, type, content } = req.body;

    if (!contactId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Contact ID and content are required" });
    }

    const newActivity = await prisma.activity.create({
      data: {
        details: content,
        type: type || "Note",
        userId: user.id,
        leadId: 1, // Placeholder, adjust based on actual lead linking logic
      },
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Failed to create activity" });
  }
};
