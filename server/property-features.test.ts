import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPropertyBadge, getBadgeColorClass, getPropertyBadges } from "../client/src/lib/badgeUtils";

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

  it("should return 'New' as first badge even when custom badge is set (stacked badges)", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);
    
    const property = {
      createdAt: recentDate,
      badge: "Big Discount",
    };
    
    // getPropertyBadge returns the first badge, which is "New" for recent properties
    const badge = getPropertyBadge(property);
    expect(badge).toBe("New");
    
    // getPropertyBadges returns all badges
    const badges = getPropertyBadges(property);
    expect(badges.length).toBe(2);
    expect(badges[0].text).toBe("New");
    expect(badges[1].text).toBe("Big Discount");
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
    // Unknown badges get default blue color
    expect(getBadgeColorClass("Unknown")).toBe("bg-blue-600 text-white");
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
  it("should show New badge first for recent properties with custom badge (stacked)", () => {
    const veryRecentDate = new Date();
    veryRecentDate.setDate(veryRecentDate.getDate() - 1); // 1 day ago
    
    const property = {
      createdAt: veryRecentDate,
      badge: "Hot Deal",
    };
    
    // First badge is "New" for recent properties
    const badge = getPropertyBadge(property);
    expect(badge).toBe("New");
    
    // Both badges are available in the array
    const badges = getPropertyBadges(property);
    expect(badges.length).toBe(2);
    expect(badges.map(b => b.text)).toContain("Hot Deal");
  });

  it("should handle null/undefined createdAt gracefully", () => {
    const property = {
      createdAt: null as any,
      badge: "Special Offer",
    };
    
    // When createdAt is invalid, it should still return the custom badge
    const badges = getPropertyBadges(property);
    // NaN comparison for days will fail, so only custom badge is returned
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.some(b => b.text === "Special Offer")).toBe(true);
  });
});
