import { Router } from "express";
import jwt from "jsonwebtoken";
import * as staffDb from "./staff-db";
import { ENV } from "./_core/env";

export const staffRouter = Router();

const STAFF_COOKIE_NAME = "staff_token";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface StaffTokenPayload {
  staffId: number;
  username: string;
  name: string;
  role: string;
}

/**
 * Staff Authentication Routes
 * Uses JWT tokens stored in HTTP-only cookies
 */

// Staff login
staffRouter.post("/api/staff/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const staff = await staffDb.authenticateStaff(username, password);

    if (!staff) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create JWT token with 30-minute expiration
    const token = jwt.sign(
      {
        staffId: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
      } as StaffTokenPayload,
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Set HTTP-only cookie with 30-minute expiration
    res.cookie(STAFF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.json({
      success: true,
      staff: {
        id: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

// Staff logout
staffRouter.post("/api/staff/logout", (req, res) => {
  res.clearCookie(STAFF_COOKIE_NAME);
  res.json({ success: true });
});

// Get current staff session
staffRouter.get("/api/staff/me", async (req, res) => {
  try {
    const token = req.cookies[STAFF_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as StaffTokenPayload;

    // Verify staff still exists and is active
    const staff = await staffDb.getStaffById(decoded.staffId);

    if (!staff || !staff.isActive) {
      res.clearCookie(STAFF_COOKIE_NAME);
      return res.status(401).json({ error: "Session invalid" });
    }

    res.json({
      id: staff.id,
      username: staff.username,
      name: staff.name,
      role: staff.role,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie(STAFF_COOKIE_NAME);
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error("Staff session error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create new staff member (admin only)
staffRouter.post("/api/staff/create", async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: "Username, password, and name are required" });
    }

    // Check if username already exists
    const existing = await staffDb.getStaffByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const staff = await staffDb.createStaff({
      username,
      password,
      name,
      email,
      phone,
    });

    res.json({
      success: true,
      staff: {
        id: staff.id,
        username: staff.username,
        name: staff.name,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// List all staff members (admin only)
staffRouter.get("/api/staff/list", async (req, res) => {
  try {
    const staff = await staffDb.getAllStaff();
    res.json(staff);
  } catch (error) {
    console.error("List staff error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Deactivate staff member (admin only)
staffRouter.post("/api/staff/:id/deactivate", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await staffDb.deactivateStaff(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Deactivate staff error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Activate staff member (admin only)
staffRouter.post("/api/staff/:id/activate", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await staffDb.activateStaff(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Activate staff error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Middleware to verify staff authentication
export function requireStaffAuth(req: any, res: any, next: any) {
  const token = req.cookies[STAFF_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as StaffTokenPayload;
    req.staff = decoded;
    next();
  } catch (error) {
    res.clearCookie(STAFF_COOKIE_NAME);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
