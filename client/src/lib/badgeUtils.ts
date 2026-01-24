/**
 * Badge utility functions for property badges
 */

/**
 * Get the display badge for a property
 * Priority: Custom badge > Auto "New" badge > No badge
 * 
 * @param property Property object with badge and createdAt fields
 * @returns Badge text to display, or empty string if no badge
 */
export function getPropertyBadge(property: {
  badge?: string | null;
  createdAt: string | Date;
  status?: string;
}): string {
  // If custom badge is set, use it
  if (property.badge) {
    return property.badge;
  }

  // Auto-detect "New" badge for properties added in last 30 days
  const createdDate = typeof property.createdAt === 'string' 
    ? new Date(property.createdAt) 
    : property.createdAt;
  
  const daysSinceCreated = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCreated <= 30) {
    return "New";
  }

  // For under-construction properties, show "New Launch" if no other badge
  if (property.status === "Under-Construction") {
    return "New Launch";
  }

  return "";
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
  
  // Default: primary color
  return "bg-primary text-primary-foreground";
}
