// src/middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Prisma known errors
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      success: false,
      message: prismaErrorMessage(err.code),
      details: err.meta || null,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Validation or Bad Request errors
  if (err.status === 400) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Default - internal server error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// Helper function for Prisma-specific error messages
const prismaErrorMessage = (code) => {
  switch (code) {
    case "P2002":
      return "Duplicate entry - this record already exists.";
    case "P2025":
      return "Record not found.";
    case "P2003":
      return "Foreign key constraint failed.";
    case "P2014":
      return "Invalid relation reference.";
    default:
      return "Database error.";
  }
};
