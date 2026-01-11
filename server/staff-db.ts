import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { staff, InsertStaff, Staff } from "../drizzle/schema";
import bcrypt from "bcryptjs";

/**
 * Staff Database Operations
 * Handles employee authentication and management
 */

// Create new staff member
export async function createStaff(data: {
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
}): Promise<Staff> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  const staffData: InsertStaff = {
    username: data.username,
    passwordHash,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: "property_manager",
    isActive: true,
  };

  const result = await db.insert(staff).values(staffData);
  
  // Get the created staff member
  const created = await db
    .select()
    .from(staff)
    .where(eq(staff.username, data.username))
    .limit(1);

  return created[0];
}

// Authenticate staff member
export async function authenticateStaff(
  username: string,
  password: string
): Promise<Staff | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(staff)
    .where(eq(staff.username, username))
    .limit(1);

  if (result.length === 0) return null;

  const staffMember = result[0];

  // Check if account is active
  if (!staffMember.isActive) return null;

  // Verify password
  const isValid = await bcrypt.compare(password, staffMember.passwordHash);
  if (!isValid) return null;

  // Update last signed in
  await db
    .update(staff)
    .set({ lastSignedIn: new Date() })
    .where(eq(staff.id, staffMember.id));

  return staffMember;
}

// Get staff member by ID
export async function getStaffById(id: number): Promise<Staff | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Get staff member by username
export async function getStaffByUsername(username: string): Promise<Staff | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(staff)
    .where(eq(staff.username, username))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Get all staff members
export async function getAllStaff(): Promise<Staff[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(staff);
}

// Update staff member
export async function updateStaff(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    password: string;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Hash new password if provided
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  await db.update(staff).set(updateData).where(eq(staff.id, id));
}

// Delete staff member
export async function deleteStaff(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(staff).where(eq(staff.id, id));
}

// Deactivate staff member (soft delete)
export async function deactivateStaff(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(staff).set({ isActive: false }).where(eq(staff.id, id));
}

// Activate staff member
export async function activateStaff(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(staff).set({ isActive: true }).where(eq(staff.id, id));
}
