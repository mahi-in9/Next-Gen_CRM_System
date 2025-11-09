import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded payload
    if (!decoded?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    // ✅ Fetch user from DB to ensure it still exists and role is current
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Attach user object to request for controllers
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized or token expired" });
  }
};

/* ===========================================================
   🧾 Role-based Authorization Middleware
   =========================================================== */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Missing user" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access denied" });
    }

    next();
  };
};
