import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, Staff } from "../../drizzle/schema";
import { sdk } from "./sdk";
import jwt from "jsonwebtoken";

interface StaffTokenPayload {
  staffId: number;
  username: string;
  name: string;
  role: string;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  staff: Staff | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let staff: Staff | null = null;

  // Check OAuth authentication
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Check staff JWT authentication
  try {
    const staffToken = opts.req.cookies?.staff_token;
    if (staffToken) {
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
      const decoded = jwt.verify(staffToken, JWT_SECRET) as StaffTokenPayload;
      // Create a staff object that matches the Staff type
      staff = {
        id: decoded.staffId,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role as any,
        email: null,
        phone: null,
        passwordHash: "", // Not needed in context
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Staff;
    }
  } catch (error) {
    // Staff authentication is optional
    staff = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    staff,
  };
}
