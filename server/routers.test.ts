import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Nivaara Real Estate API Tests", () => {
  describe("Properties API", () => {
    it("should fetch all properties from database", async () => {
      const caller = appRouter.createCaller({} as any);
      const properties = await caller.properties.list();
      
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
    });

    it("should fetch featured properties", async () => {
      const caller = appRouter.createCaller({} as any);
      const featuredProperties = await caller.properties.featured();
      
      expect(featuredProperties).toBeDefined();
      expect(Array.isArray(featuredProperties)).toBe(true);
      
      // All returned properties should be featured
      featuredProperties.forEach(property => {
        expect(property.featured).toBe(true);
      });
    });

    it("should search properties by location", async () => {
      const caller = appRouter.createCaller({} as any);
      const properties = await caller.properties.search({
        location: "Pune",
      });
      
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // All returned properties should contain "Pune" in location
      properties.forEach(property => {
        expect(property.location.toLowerCase()).toContain("pune");
      });
    });

    it("should search properties by type", async () => {
      const caller = appRouter.createCaller({} as any);
      const properties = await caller.properties.search({
        propertyType: "Flat",
      });
      
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // All returned properties should be of type "Flat"
      properties.forEach(property => {
        expect(property.propertyType).toBe("Flat");
      });
    });

    it("should search properties by status", async () => {
      const caller = appRouter.createCaller({} as any);
      const properties = await caller.properties.search({
        status: "Ready",
      });
      
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // All returned properties should have status "Ready"
      properties.forEach(property => {
        expect(property.status).toBe("Ready");
      });
    });

    it("should get property by ID", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // First get all properties to get a valid ID
      const allProperties = await caller.properties.list();
      expect(allProperties.length).toBeGreaterThan(0);
      
      const firstProperty = allProperties[0];
      const property = await caller.properties.getById({ id: firstProperty.id });
      
      expect(property).toBeDefined();
      expect(property?.id).toBe(firstProperty.id);
      expect(property?.title).toBe(firstProperty.title);
    });
  });

  describe("Testimonials API", () => {
    it("should fetch published testimonials", async () => {
      const caller = appRouter.createCaller({} as any);
      const testimonials = await caller.testimonials.list();
      
      expect(testimonials).toBeDefined();
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
      
      // All returned testimonials should be published
      testimonials.forEach(testimonial => {
        expect(testimonial.isPublished).toBe(true);
      });
    });

    it("should have valid testimonial structure", async () => {
      const caller = appRouter.createCaller({} as any);
      const testimonials = await caller.testimonials.list();
      
      expect(testimonials.length).toBeGreaterThan(0);
      
      const testimonial = testimonials[0];
      expect(testimonial).toHaveProperty("id");
      expect(testimonial).toHaveProperty("name");
      expect(testimonial).toHaveProperty("location");
      expect(testimonial).toHaveProperty("text");
      expect(testimonial).toHaveProperty("rating");
      expect(typeof testimonial.name).toBe("string");
      expect(typeof testimonial.location).toBe("string");
      expect(typeof testimonial.text).toBe("string");
      expect(typeof testimonial.rating).toBe("number");
    });
  });

  describe("Inquiries API", () => {
    it("should create a new inquiry", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: null,
      });
      
      const inquiryData = {
        name: "Test User",
        email: "test@example.com",
        phone: "+91 9876543210",
        message: "I am interested in a 3BHK apartment in Kharadi",
        inquiryType: "property" as const,
      };
      
      const result = await caller.inquiries.create(inquiryData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      // Note: insertId might be BigInt, so we check for existence and convert if needed
      if (result.id) {
        expect(typeof result.id === "number" || typeof result.id === "bigint").toBe(true);
      }
    });

    it("should validate inquiry email format", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: null,
      });
      
      const invalidInquiry = {
        name: "Test User",
        email: "invalid-email", // Invalid email
        phone: "+91 9876543210",
        message: "Test message",
        inquiryType: "general" as const,
      };
      
      await expect(caller.inquiries.create(invalidInquiry)).rejects.toThrow();
    });

    it("should require all mandatory fields", async () => {
      const caller = appRouter.createCaller({
        req: {} as any,
        res: {} as any,
        user: null,
      });
      
      const incompleteInquiry = {
        name: "Test User",
        email: "test@example.com",
        // Missing phone and message
      } as any;
      
      await expect(caller.inquiries.create(incompleteInquiry)).rejects.toThrow();
    });
  });

  describe("Database Helper Functions", () => {
    it("should retrieve all properties", async () => {
      const properties = await db.getAllProperties();
      
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
    });

    it("should retrieve featured properties", async () => {
      const featuredProperties = await db.getFeaturedProperties();
      
      expect(featuredProperties).toBeDefined();
      expect(Array.isArray(featuredProperties)).toBe(true);
      
      featuredProperties.forEach(property => {
        expect(property.featured).toBe(true);
      });
    });

    it("should search properties with filters", async () => {
      const results = await db.searchProperties({
        location: "Pune",
        propertyType: "Flat",
      });
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it("should retrieve published testimonials", async () => {
      const testimonials = await db.getPublishedTestimonials();
      
      expect(testimonials).toBeDefined();
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
      
      testimonials.forEach(testimonial => {
        expect(testimonial.isPublished).toBe(true);
      });
    });
  });

  describe("Data Integrity", () => {
    it("should have properties with valid price data", async () => {
      const properties = await db.getAllProperties();
      
      properties.forEach(property => {
        expect(property.price).toBeDefined();
        expect(property.priceLabel).toBeDefined();
        // Price should be a valid decimal string
        expect(parseFloat(property.price)).toBeGreaterThan(0);
      });
    });

    it("should have properties with valid location data", async () => {
      const properties = await db.getAllProperties();
      
      properties.forEach(property => {
        expect(property.location).toBeDefined();
        expect(typeof property.location).toBe("string");
        expect(property.location.length).toBeGreaterThan(0);
      });
    });

    it("should have properties with valid property types", async () => {
      const properties = await db.getAllProperties();
      const validTypes = ["Flat", "Shop", "Office", "Land", "Rental"];
      
      properties.forEach(property => {
        expect(validTypes).toContain(property.propertyType);
      });
    });

    it("should have properties with valid status", async () => {
      const properties = await db.getAllProperties();
      const validStatuses = ["Ready", "Under-Construction"];
      
      properties.forEach(property => {
        expect(validStatuses).toContain(property.status);
      });
    });
  });
});
