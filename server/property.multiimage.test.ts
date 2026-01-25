import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Multi-Image Upload System", () => {
  // Mock context for admin user
  const mockAdminContext = {
    user: {
      id: 1,
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin" as const,
      createdAt: new Date(),
    },
  };

  it("should create property and return property ID", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.properties.create({
      title: "Test Property with Images",
      description: "Property for testing multi-image upload",
      propertyType: "Flat",
      status: "Ready",
      location: "Test Location, Pune",
      price: "5000000",
      bedrooms: 3,
      imageUrl: "https://example.com/cover.jpg",
      latitude: 18.5204,
      longitude: 73.8567,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("number");
  });

  it("should add multiple images to a property", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    // First create a property
    const property = await caller.admin.properties.create({
      title: "Property for Image Test",
      description: "Testing image addition",
      propertyType: "Flat",
      status: "Ready",
      location: "Mumbai",
      price: "8000000",
      bedrooms: 2,
      imageUrl: "https://example.com/main.jpg",
      latitude: 19.076,
      longitude: 72.8777,
    });

    expect(property.id).toBeDefined();

    // Add first image (cover)
    const image1 = await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/image1.jpg",
      isCover: true,
      displayOrder: 0,
    });

    expect(image1).toEqual({ success: true });

    // Add second image
    const image2 = await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/image2.jpg",
      isCover: false,
      displayOrder: 1,
    });

    expect(image2).toEqual({ success: true });

    // List images
    const images = await caller.admin.properties.images.list({
      propertyId: property.id,
    });

    expect(images).toHaveLength(2);
    expect(images[0].isCover).toBe(true);
    expect(images[0].imageUrl).toBe("https://example.com/image1.jpg");
    expect(images[1].isCover).toBe(false);
  });

  it("should delete property image", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    // Create property
    const property = await caller.admin.properties.create({
      title: "Property for Delete Test",
      description: "Testing image deletion",
      propertyType: "Office",
      status: "Under-Construction",
      location: "Bangalore",
      price: "12000000",
      bedrooms: 4,
      imageUrl: "https://example.com/villa.jpg",
      latitude: 12.9716,
      longitude: 77.5946,
    });

    // Add image
    await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/to-delete.jpg",
      isCover: false,
      displayOrder: 0,
    });

    // Get images
    const imagesBefore = await caller.admin.properties.images.list({
      propertyId: property.id,
    });

    expect(imagesBefore).toHaveLength(1);
    const imageId = imagesBefore[0].id;

    // Delete image
    const deleteResult = await caller.admin.properties.images.delete({
      id: imageId,
    });

    expect(deleteResult).toEqual({ success: true });

    // Verify deletion
    const imagesAfter = await caller.admin.properties.images.list({
      propertyId: property.id,
    });

    expect(imagesAfter).toHaveLength(0);
  });

  it("should handle multiple images with cover selection", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    // Create property
    const property = await caller.admin.properties.create({
      title: "Multi-Image Property",
      description: "Property with multiple images and cover",
      propertyType: "Flat",
      status: "Ready",
      location: "Delhi",
      price: "7500000",
      bedrooms: 3,
      imageUrl: "https://example.com/cover.jpg",
      latitude: 28.7041,
      longitude: 77.1025,
    });

    // Add 3 images
    await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/img1.jpg",
      isCover: false,
      displayOrder: 0,
    });

    await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/img2.jpg",
      isCover: true, // This is the cover
      displayOrder: 1,
    });

    await caller.admin.properties.images.add({
      propertyId: property.id,
      imageUrl: "https://example.com/img3.jpg",
      isCover: false,
      displayOrder: 2,
    });

    // Get images
    const images = await caller.admin.properties.images.list({
      propertyId: property.id,
    });

    expect(images).toHaveLength(3);
    
    // Find cover image
    const coverImage = images.find((img) => img.isCover);
    expect(coverImage).toBeDefined();
    expect(coverImage?.imageUrl).toBe("https://example.com/img2.jpg");
    
    // Verify display order
    expect(images[0].displayOrder).toBe(0);
    expect(images[1].displayOrder).toBe(1);
    expect(images[2].displayOrder).toBe(2);
  });
});
