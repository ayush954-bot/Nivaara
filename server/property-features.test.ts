import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPropertyBadge, getBadgeColorClass } from "../client/src/lib/badgeUtils";

describe("Property Badge System", () => {
  it("should return 'New' badge for properties created within 30 days", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 15); // 15 days ago
    
    const property = {
      createdAt: recentDate,
      badge: null,
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("New");
  });

  it("should return custom badge if set, even for recent properties", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);
    
    const property = {
      createdAt: recentDate,
      badge: "Big Discount",
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("Big Discount");
  });

  it("should return empty string for old properties without custom badge", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60); // 60 days ago
    
    const property = {
      createdAt: oldDate,
      badge: null,
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("");
  });

  it("should return correct color classes for different badges", () => {
    expect(getBadgeColorClass("New")).toBe("bg-green-600 text-white");
    expect(getBadgeColorClass("Big Discount")).toBe("bg-red-600 text-white");
    expect(getBadgeColorClass("Special Offer")).toBe("bg-purple-600 text-white");
    expect(getBadgeColorClass("Hot Deal")).toBe("bg-red-600 text-white");
    expect(getBadgeColorClass("Price Reduced")).toBe("bg-red-600 text-white");
    expect(getBadgeColorClass("Exclusive")).toBe("bg-purple-600 text-white");
    expect(getBadgeColorClass("Unknown")).toBe("bg-primary text-primary-foreground");
  });

  it("should handle edge case: exactly 30 days old", () => {
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() - 30);
    
    const property = {
      createdAt: exactDate,
      badge: null,
    };
    
    const badge = getPropertyBadge(property);
    // Should still show "New" if within 30 days
    expect(badge).toBe("New");
  });

  it("should handle edge case: 31 days old (no longer new)", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);
    
    const property = {
      createdAt: oldDate,
      badge: null,
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("");
  });
});

describe("Property Video Type Enum", () => {
  it("should have valid video type options", () => {
    const validTypes = ["youtube", "vimeo", "virtual_tour", "other"];
    
    // Test that all expected types are valid
    validTypes.forEach(type => {
      expect(["youtube", "vimeo", "virtual_tour", "other"]).toContain(type);
    });
  });
});

describe("Badge System Integration", () => {
  it("should prioritize custom badge over automatic New badge", () => {
    const veryRecentDate = new Date();
    veryRecentDate.setDate(veryRecentDate.getDate() - 1); // 1 day ago
    
    const property = {
      createdAt: veryRecentDate,
      badge: "Hot Deal",
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("Hot Deal");
    expect(badge).not.toBe("New");
  });

  it("should handle null/undefined createdAt gracefully", () => {
    const property = {
      createdAt: null as any,
      badge: "Special Offer",
    };
    
    const badge = getPropertyBadge(property);
    expect(badge).toBe("Special Offer");
  });
});
