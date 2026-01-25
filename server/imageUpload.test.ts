import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User, Staff } from "../drizzle/schema";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/test-image.jpg" }),
}));

describe("Image Upload Authentication", () => {
  const mockImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  const mockFileName = "test-image.jpg";
  const mockMimeType = "image/jpeg";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow OAuth admin to upload images", async () => {
    const mockUser: User = {
      id: 1,
      openId: "admin-123",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "google",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: mockUser,
      staff: null,
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.imageUpload.uploadImage({
      imageData: mockImageData,
      fileName: mockFileName,
      mimeType: mockMimeType,
    });

    expect(result.success).toBe(true);
    expect(result.url).toBe("https://s3.example.com/test-image.jpg");
  });

  it("should allow staff property manager to upload images", async () => {
    const mockStaff: Staff = {
      id: 1,
      username: "staff-user",
      name: "Staff User",
      email: "staff@example.com",
      phone: null,
      role: "property_manager",
      passwordHash: "hashed-password",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: null,
      staff: mockStaff,
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.imageUpload.uploadImage({
      imageData: mockImageData,
      fileName: mockFileName,
      mimeType: mockMimeType,
    });

    expect(result.success).toBe(true);
    expect(result.url).toBe("https://s3.example.com/test-image.jpg");
  });

  it("should reject unauthenticated users", async () => {
    const ctx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: null,
      staff: null,
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.imageUpload.uploadImage({
        imageData: mockImageData,
        fileName: mockFileName,
        mimeType: mockMimeType,
      })
    ).rejects.toThrow();
  });

  it("should reject OAuth users with non-admin role", async () => {
    const mockUser: User = {
      id: 2,
      openId: "user-456",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "google",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: mockUser,
      staff: null,
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.imageUpload.uploadImage({
        imageData: mockImageData,
        fileName: mockFileName,
        mimeType: mockMimeType,
      })
    ).rejects.toThrow("Only admins or property managers can upload images");
  });
});
