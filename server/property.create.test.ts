import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Property Creation with Location", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Create a caller with mock admin context
    caller = appRouter.createCaller({
      user: {
        id: "test-admin-id",
        openId: "test-admin-openid",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  it("should create property with valid location coordinates", async () => {
    const propertyData = {
      title: "Test Property - Kharadi 3 BHK",
      description: "Beautiful apartment in Kharadi with all modern amenities",
      propertyType: "Flat" as const,
      status: "Ready" as const,
      location: "Kharadi, Pune, Maharashtra, India",
      latitude: 18.5511694,
      longitude: 73.9250974,
      zone: "east_pune" as const,
      price: "11500000",
      priceLabel: "₹1.15 Crores",
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1450,
      builder: "Test Builder",
      imageUrl: "https://example.com/test-image.jpg",
      featured: false,
    };

    const result = await caller.admin.properties.create(propertyData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe(propertyData.title);
    expect(result.location).toBe(propertyData.location);
    // Database stores decimals as strings with fixed precision
    expect(parseFloat(String(result.latitude))).toBeCloseTo(propertyData.latitude, 5);
    expect(parseFloat(String(result.longitude))).toBeCloseTo(propertyData.longitude, 5);
    expect(result.zone).toBe(propertyData.zone);
  });

  it("should create property with null coordinates (optional)", async () => {
    const propertyData = {
      title: "Test Property - Manual Location",
      description: "Property with manual location entry",
      propertyType: "Flat" as const,
      status: "Ready" as const,
      location: "Some Custom Location",
      latitude: null,
      longitude: null,
      zone: null,
      price: "8500000",
      priceLabel: "₹85 Lakhs",
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1200,
      builder: "Test Builder",
      imageUrl: "https://example.com/test-image2.jpg",
      featured: false,
    };

    const result = await caller.admin.properties.create(propertyData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe(propertyData.title);
    expect(result.location).toBe(propertyData.location);
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
    expect(result.zone).toBeNull();
  });

  it("should accept zone parameter when provided", async () => {
    const propertyData = {
      title: "Test Property - With Zone",
      description: "Test property with explicit zone",
      propertyType: "Flat" as const,
      status: "Ready" as const,
      location: "Kharadi, Pune",
      latitude: 18.5,
      longitude: 73.9,
      zone: "east_pune" as const,
      price: "10000000",
      priceLabel: "₹1 Crore",
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1000,
      builder: "Test Builder",
      imageUrl: "https://example.com/test.jpg",
      featured: false,
    };

    const result = await caller.admin.properties.create(propertyData);

    expect(result.zone).toBe("east_pune");
  });
});
