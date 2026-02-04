/**
 * Location utilities for coordinate-based search and area extraction
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Extract area/locality name from full address
 * Examples:
 * "Upper Kharadi Main Rd, Wagholi, Pune, Maharashtra 412207, India, Pune" → "Wagholi"
 * "Kharadi, Pune" → "Kharadi"
 * "14/2, Solacia Internal Road, RMC Garden, Wagholi, Wagholi, Pune..." → "Wagholi"
 */
export function extractAreaFromAddress(address: string): string {
  if (!address) return "";

  // Remove common suffixes and prefixes
  const cleaned = address
    .replace(/\s*(Main\s+Rd|Road|Street|St|Avenue|Ave)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split by comma and filter out common non-area parts
  const parts = cleaned.split(",").map((p) => p.trim());

  // Filter out parts that are likely not area names
  const filtered = parts.filter((part) => {
    const lower = part.toLowerCase();
    // Skip if it's a state, country, or postal code
    if (
      lower.includes("maharashtra") ||
      lower.includes("india") ||
      lower.includes("pune") ||
      /^\d{6}$/.test(part) || // Postal code
      /^\d+\/\d+/.test(part) || // Address numbers like "14/2"
      lower.includes("internal") ||
      lower.includes("garden")
    ) {
      return false;
    }
    // Skip very short parts (likely abbreviations)
    if (part.length < 3) return false;
    return true;
  });

  // Return the first meaningful part (usually the locality/area)
  return filtered[0] || parts[0] || address;
}

/**
 * Get unique areas from a list of addresses
 */
export function getUniqueAreas(addresses: string[]): string[] {
  const areas = new Set<string>();

  addresses.forEach((address) => {
    const area = extractAreaFromAddress(address);
    if (area && area.length > 2) {
      areas.add(area);
    }
  });

  return Array.from(areas).sort();
}

/**
 * Check if a point is within a radius of another point
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}
