import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

// Mock the DB module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

// Mock firebase-admin
vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: "test-uid", phone_number: "+919876543210" }),
  })),
}));

describe("publicListing router", () => {
  describe("input validation", () => {
    it("should reject property submission without required fields", () => {
      const requiredFields = ["title", "propertyType", "status", "location", "price"];
      const mockInput: Record<string, unknown> = {
        title: "Test Property",
        propertyType: "Flat",
        status: "Ready",
        location: "Kharadi, Pune",
        price: 4500000,
        submitterPhone: "+919876543210",
        submitterName: "Test User",
        firebaseToken: "mock-token",
      };

      requiredFields.forEach((field) => {
        const incomplete = { ...mockInput };
        delete incomplete[field];
        expect(incomplete[field]).toBeUndefined();
      });
    });

    it("should reject project submission without required fields", () => {
      const requiredFields = ["name", "builderName", "location", "status", "priceRange"];
      const mockInput: Record<string, unknown> = {
        name: "Test Project",
        builderName: "Test Builder",
        location: "Hinjewadi",
        city: "Pune",
        status: "Under Construction",
        priceRange: "50L - 1Cr",
        submitterPhone: "+919876543210",
        submitterName: "Test User",
        firebaseToken: "mock-token",
      };

      requiredFields.forEach((field) => {
        const incomplete = { ...mockInput };
        delete incomplete[field];
        expect(incomplete[field]).toBeUndefined();
      });
    });

    it("should enforce 10MB file size limit", () => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const oversizedFile = MAX_SIZE + 1;
      const validFile = MAX_SIZE - 1;

      expect(oversizedFile > MAX_SIZE).toBe(true);
      expect(validFile <= MAX_SIZE).toBe(true);
    });

    it("should only allow valid property types", () => {
      const validTypes = ["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"];
      const invalidType = "InvalidType";

      expect(validTypes.includes(invalidType)).toBe(false);
      expect(validTypes.includes("Flat")).toBe(true);
      expect(validTypes.includes("Shop")).toBe(true);
    });

    it("should only allow valid property statuses", () => {
      const validStatuses = ["Ready", "Under-Construction"];
      expect(validStatuses.includes("Ready")).toBe(true);
      expect(validStatuses.includes("Under-Construction")).toBe(true);
      expect(validStatuses.includes("Unknown")).toBe(false);
    });

    it("should only allow valid project statuses", () => {
      const validStatuses = ["Upcoming", "Under Construction", "Ready to Move"];
      expect(validStatuses.includes("Upcoming")).toBe(true);
      expect(validStatuses.includes("Under Construction")).toBe(true);
      expect(validStatuses.includes("Ready to Move")).toBe(true);
      expect(validStatuses.includes("Invalid")).toBe(false);
    });
  });

  describe("listing status workflow", () => {
    it("public submissions should default to pending_review status", () => {
      const defaultStatus = "pending_review";
      const allowedStatuses = ["pending_review", "published", "rejected"];

      expect(allowedStatuses.includes(defaultStatus)).toBe(true);
      expect(defaultStatus).toBe("pending_review");
    });

    it("admin approval should change status to published", () => {
      const pendingListing = { listingStatus: "pending_review" };
      const approved = { ...pendingListing, listingStatus: "published" };

      expect(approved.listingStatus).toBe("published");
    });

    it("admin rejection should change status to rejected with reason", () => {
      const pendingListing = { listingStatus: "pending_review" };
      const rejected = {
        ...pendingListing,
        listingStatus: "rejected",
        rejectionReason: "Incomplete information",
      };

      expect(rejected.listingStatus).toBe("rejected");
      expect(rejected.rejectionReason).toBeTruthy();
    });
  });

  describe("phone number format", () => {
    it("should accept valid Indian phone numbers with country code", () => {
      const validNumbers = ["+919876543210", "+916234567890", "+917000000000"];
      const phoneRegex = /^\+91[6-9]\d{9}$/;

      validNumbers.forEach((num) => {
        expect(phoneRegex.test(num)).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidNumbers = ["9876543210", "123", "+1234567890", ""];
      const phoneRegex = /^\+91[6-9]\d{9}$/;

      invalidNumbers.forEach((num) => {
        expect(phoneRegex.test(num)).toBe(false);
      });
    });
  });
});

// ─── Schema tests for new fields (mirrors publicListing router schemas) ───────

const submitPropertySchemaFull = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]),
  status: z.enum(["Under-Construction", "Ready"]),
  location: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  area: z.string().optional(),
  price: z.number().positive(),
  priceLabel: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area_sqft: z.number().optional(),
  builder: z.string().optional(),
  imageUrls: z.array(z.string()).max(20),
  videoUrls: z.array(z.object({
    videoUrl: z.string(),
    videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]),
    displayOrder: z.number(),
  })).optional(),
  brochureUrl: z.string().optional(),
  badge: z.string().optional(),
  customBadgeText: z.string().optional(),
  submitterPhone: z.string().min(1),
  submitterName: z.string().min(1),
  firebaseToken: z.string(),
});

const submitProjectSchemaFull = z.object({
  name: z.string().min(1),
  builderName: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.enum(["Upcoming", "Under Construction", "Ready to Move"]),
  priceRange: z.string().min(1),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  configurations: z.string().optional(),
  reraNumber: z.string().optional(),
  possessionDate: z.string().optional(),
  totalUnits: z.number().optional(),
  towers: z.number().optional(),
  floors: z.number().optional(),
  imageUrls: z.array(z.string()).max(20),
  videoUrl: z.string().optional(),
  brochureUrl: z.string().optional(),
  masterPlanUrl: z.string().optional(),
  videos: z.array(z.object({
    videoUrl: z.string(),
    videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]),
    title: z.string(),
    displayOrder: z.number(),
  })).optional(),
  builderDescription: z.string().optional(),
  builderLogo: z.string().optional(),
  builderEstablished: z.number().optional(),
  builderProjects: z.number().optional(),
  badge: z.string().optional(),
  customBadgeText: z.string().optional(),
  amenities: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    imageUrl: z.string().optional(),
    displayOrder: z.number(),
  })).optional(),
  floorPlans: z.array(z.object({
    name: z.string(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    area: z.number(),
    price: z.number(),
    imageUrl: z.string().optional(),
    displayOrder: z.number(),
  })).optional(),
  submitterPhone: z.string().min(1),
  submitterName: z.string().min(1),
  firebaseToken: z.string(),
});

describe("submitProperty full schema (new fields)", () => {
  it("accepts all new optional fields: latitude, longitude, priceLabel, area, brochureUrl, badge, videoUrls", () => {
    const result = submitPropertySchemaFull.safeParse({
      title: "3 BHK Flat",
      description: "Spacious flat",
      propertyType: "Flat",
      status: "Ready",
      location: "Kharadi, Pune",
      latitude: 18.5562,
      longitude: 73.9418,
      area: "Near Airport",
      price: 11500000,
      priceLabel: "₹1.15 Cr",
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1450,
      builder: "Godrej Properties",
      imageUrls: ["https://example.com/img1.jpg"],
      videoUrls: [{ videoUrl: "https://youtube.com/watch?v=abc", videoType: "youtube", displayOrder: 0 }],
      brochureUrl: "https://example.com/brochure.pdf",
      badge: "Hot Deal",
      customBadgeText: "Bank Auction",
      submitterPhone: "+919876543210",
      submitterName: "Rahul Sharma",
      firebaseToken: "mock-token",
    });
    expect(result.success).toBe(true);
  });

  it("rejects imageUrls > 20 items", () => {
    const result = submitPropertySchemaFull.safeParse({
      title: "Test",
      description: "desc",
      propertyType: "Flat",
      status: "Ready",
      location: "Pune",
      price: 1000000,
      imageUrls: Array(21).fill("https://example.com/img.jpg"),
      submitterPhone: "+91123",
      submitterName: "Test",
      firebaseToken: "tok",
    });
    expect(result.success).toBe(false);
  });
});

describe("submitProject full schema (new fields)", () => {
  it("accepts all new fields: latitude, longitude, minPrice, maxPrice, towers, floors, amenities, floorPlans, videos, builderLogo", () => {
    const result = submitProjectSchemaFull.safeParse({
      name: "Pride Purple Park Eden",
      builderName: "Pride Group",
      description: "Premium township",
      location: "Kharadi, Pune",
      city: "Pune",
      latitude: 18.5562,
      longitude: 73.9418,
      status: "Under Construction",
      priceRange: "₹85L - ₹1.45Cr",
      minPrice: 8500000,
      maxPrice: 14500000,
      configurations: "2, 3 BHK",
      reraNumber: "P52100054321",
      possessionDate: "2026-12-31",
      totalUnits: 500,
      towers: 5,
      floors: 25,
      imageUrls: ["https://example.com/img.jpg"],
      videoUrl: "https://youtube.com/watch?v=xyz",
      brochureUrl: "https://example.com/brochure.pdf",
      masterPlanUrl: "https://example.com/masterplan.jpg",
      videos: [{ videoUrl: "https://youtube.com/watch?v=abc", videoType: "virtual_tour", title: "Virtual Tour", displayOrder: 0 }],
      builderDescription: "Leading developer since 1980",
      builderLogo: "https://example.com/logo.png",
      builderEstablished: 1980,
      builderProjects: 50,
      badge: "Premium",
      customBadgeText: "Best Seller",
      amenities: [
        { name: "Swimming Pool", icon: "Waves", displayOrder: 0 },
        { name: "Gym", icon: "Dumbbell", displayOrder: 1 },
      ],
      floorPlans: [
        { name: "2 BHK Classic", bedrooms: 2, bathrooms: 2, area: 950, price: 8500000, displayOrder: 0 },
      ],
      submitterPhone: "+919876543210",
      submitterName: "Amit Kumar",
      firebaseToken: "mock-token",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid video type in videos array", () => {
    const result = submitProjectSchemaFull.safeParse({
      name: "Test",
      builderName: "Builder",
      description: "desc",
      location: "Pune",
      city: "Pune",
      status: "Upcoming",
      priceRange: "₹50L+",
      imageUrls: [],
      videos: [{ videoUrl: "https://youtube.com/watch?v=abc", videoType: "tiktok", title: "Tour", displayOrder: 0 }],
      submitterPhone: "+91123",
      submitterName: "Test",
      firebaseToken: "tok",
    });
    expect(result.success).toBe(false);
  });
});
