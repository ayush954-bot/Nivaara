import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "email",
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Property Video Embedding", () => {

  it("should create property with YouTube video URL", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.properties.create({
      title: "Test Property with Video",
      description: "A test property with video tour",
      propertyType: "Flat",
      status: "Ready",
      location: "Test Location, Pune",
      latitude: 18.5204,
      longitude: 73.8567,
      area: "Test Area",
      price: "5000000",
      bedrooms: 2,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Test Property with Video");
    expect(result.videoUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("should create property without video URL (optional field)", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.properties.create({
      title: "Test Property without Video",
      description: "A test property without video",
      propertyType: "Shop",
      status: "Under-Construction",
      location: "Test Location 2, Mumbai",
      price: "3000000",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Test Property without Video");
  });

  it("should accept various YouTube URL formats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const youtubeFormats = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ];

    for (const videoUrl of youtubeFormats) {
      const result = await caller.admin.properties.create({
        title: `Test Property - ${videoUrl}`,
        description: "Testing YouTube URL format",
        propertyType: "Office",
        status: "Ready",
        location: "Test Location, Bangalore",
        price: "10000000",
        videoUrl,
      });

      expect(result).toBeDefined();
      expect(result.videoUrl).toBe(videoUrl);
    }
  });
});
