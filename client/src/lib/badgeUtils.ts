/**
 * Badge utility functions for property badges
 */

export interface PropertyBadge {
  text: string;
  colorClass: string;
}

/**
 * Get all badges for a property (supports multiple stacked badges)
 * Returns array of badges: [Auto "New" badge, Predefined badge, Custom badge text]
 * 
 * @param property Property object with badge, customBadgeText, and createdAt fields
 * @returns Array of badge objects to display
 */
export function getPropertyBadges(property: {
  badge?: string | null;
  customBadgeText?: string | null;
  createdAt?: string | Date | null;
  status?: string;
}): PropertyBadge[] {
  const badges: PropertyBadge[] = [];

  // 1. Auto-detect "New" badge for properties added in last 30 days
  if (property.createdAt) {
    const createdDate = typeof property.createdAt === 'string' 
      ? new Date(property.createdAt) 
      : property.createdAt;
    
    const daysSinceCreated = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated <= 30) {
      badges.push({
        text: "New",
        colorClass: "bg-green-600 text-white"
      });
    }
  }

  // 2. Add predefined badge if set
  if (property.badge) {
    badges.push({
      text: property.badge,
      colorClass: getBadgeColorClass(property.badge)
    });
  }

  // 3. Add custom badge text if set
  if (property.customBadgeText && property.customBadgeText.trim()) {
    badges.push({
      text: property.customBadgeText.trim(),
      colorClass: "bg-orange-600 text-white" // Custom badges use orange
    });
  }

  return badges;
}

/**
 * Get badge color classes based on badge text
 */
export function getBadgeColorClass(badgeText: string): string {
  const badge = badgeText.toLowerCase();
  
  if (badge.includes("new")) {
    return "bg-green-600 text-white";
  }
  if (badge.includes("discount") || badge.includes("reduced") || badge.includes("hot")) {
    return "bg-red-600 text-white";
  }
  if (badge.includes("special") || badge.includes("exclusive")) {
    return "bg-purple-600 text-white";
  }
  
  // Default: blue for predefined badges
  return "bg-blue-600 text-white";
}

/**
 * Legacy function for backward compatibility
 * Returns first badge text or empty string
 */
export function getPropertyBadge(property: {
  badge?: string | null;
  customBadgeText?: string | null;
  createdAt?: string | Date | null;
  status?: string;
}): string {
  const badges = getPropertyBadges(property);
  return badges.length > 0 ? badges[0].text : "";
}
