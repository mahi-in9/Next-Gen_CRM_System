import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

/* ---------------------------------- */
/* Helper: Generate Access + Refresh Tokens */
/* ---------------------------------- */
const generateTokens = (user) => {
  // ✅ Include all non-sensitive fields needed by frontend
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

/* ---------------------------------- */
/* REGISTER USER */
/* ---------------------------------- */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "SALES" },
    });

    // Generate tokens right after registration
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: expiry },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ---------------------------------- */
/* LOGIN USER */
/* ---------------------------------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in DB
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: expiry },
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ---------------------------------- */
/* REFRESH TOKEN */
/* ---------------------------------- */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Missing refresh token" });

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored)
      return res.status(401).json({ error: "Invalid refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { accessToken, refreshToken: newRefresh } = generateTokens(user);

    // Replace old refresh token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: {
        token: newRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(401).json({ error: "Token refresh failed" });
  }
};

/* ---------------------------------- */
/* LOGOUT USER */
/* ---------------------------------- */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "Missing refresh token" });

    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ---------------------------------- */
/* GET CURRENT USER */
/* ---------------------------------- */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
