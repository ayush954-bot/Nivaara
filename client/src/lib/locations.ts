// Predefined locations for property management
// This ensures consistency and prevents spelling errors

export const INDIAN_CITIES = [
  // Maharashtra
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Thane",
  "Navi Mumbai",
  
  // Karnataka
  "Bangalore",
  "Mysore",
  "Mangalore",
  "Hubli",
  
  // Delhi NCR
  "Delhi",
  "Gurgaon",
  "Noida",
  "Ghaziabad",
  "Faridabad",
  
  // Tamil Nadu
  "Chennai",
  "Coimbatore",
  "Madurai",
  
  // Telangana & Andhra Pradesh
  "Hyderabad",
  "Visakhapatnam",
  "Vijayawada",
  
  // Gujarat
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  
  // West Bengal
  "Kolkata",
  
  // Rajasthan
  "Jaipur",
  "Udaipur",
  "Jodhpur",
  
  // Kerala
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  
  // Punjab & Haryana
  "Chandigarh",
  "Mohali",
  "Ludhiana",
  
  // Uttar Pradesh
  "Lucknow",
  "Kanpur",
  "Agra",
  "Varanasi",
  
  // Other major cities
  "Bhopal",
  "Indore",
  "Patna",
  "Bhubaneswar",
  "Guwahati",
];

export const PUNE_AREAS = [
  // East Pune
  "Kharadi",
  "Viman Nagar",
  "Wagholi",
  "Hadapsar",
  "Magarpatta",
  "Kalyani Nagar",
  "Koregaon Park",
  "Mundhwa",
  
  // West Pune
  "Hinjewadi",
  "Wakad",
  "Baner",
  "Aundh",
  "Pimple Saudagar",
  "Pimple Nilakh",
  "Balewadi",
  
  // North Pune
  "Pimpri",
  "Chinchwad",
  "Akurdi",
  "Nigdi",
  
  // South Pune
  "Katraj",
  "Undri",
  "Kondhwa",
  "NIBM",
  "Wanowrie",
  "Salisbury Park",
  
  // Central Pune
  "Shivajinagar",
  "Deccan",
  "Camp",
  "Kothrud",
  "Karve Nagar",
  "Erandwane",
];

export const INTERNATIONAL_LOCATIONS = [
  "Dubai - UAE",
  "Abu Dhabi - UAE",
  "Singapore",
  "London - UK",
  "New York - USA",
  "Toronto - Canada",
];

// Combined list for dropdown
export const ALL_LOCATIONS = [
  ...INDIAN_CITIES.sort(),
  ...INTERNATIONAL_LOCATIONS.sort(),
];

// Pune-specific locations (city + area)
export const PUNE_LOCATIONS = PUNE_AREAS.map(area => `Pune - ${area}`).sort();

// Helper function to get all locations including Pune areas
export function getAllLocationsWithAreas(): string[] {
  return [
    ...INDIAN_CITIES.filter(city => city !== "Pune").sort(),
    ...PUNE_LOCATIONS,
    ...INTERNATIONAL_LOCATIONS.sort(),
  ];
}

// International location patterns
const INTERNATIONAL_PATTERNS = [
  "UAE",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "USA",
  "UK",
  "Singapore",
  "Canada",
  "Australia",
  "Europe",
  "London",
  "New York",
  "Toronto",
];

export interface GroupedLocations {
  puneZones: string[];
  india: string[];
  international: string[];
}

/**
 * Intelligently categorizes a location into Pune Zones, India, or International
 * Handles full addresses like "Kharadi, Pune" or "Kharadi, Pune, Maharashtra"
 */
export function categorizeLocation(location: string): "pune" | "india" | "international" {
  const locationLower = location.toLowerCase();
  
  // Check if it's an international location
  if (INTERNATIONAL_PATTERNS.some(pattern => locationLower.includes(pattern.toLowerCase()))) {
    return "international";
  }
  
  // Check if location contains "pune" anywhere (e.g., "Kharadi, Pune" or "Pune - East Zone")
  if (locationLower.includes("pune") || locationLower === "purandar") {
    return "pune";
  }
  
  // Check if it's a known Pune area (even without "Pune" in the name)
  const isPuneArea = PUNE_AREAS.some(area => {
    const areaLower = area.toLowerCase();
    return locationLower === areaLower || 
           locationLower.includes(areaLower) || 
           areaLower.includes(locationLower);
  });
  
  if (isPuneArea) {
    return "pune";
  }
  
  // Default to India for other Indian cities
  return "india";
}

/**
 * Groups an array of locations into Pune Zones, India, and International
 */
export function groupLocations(locations: string[]): GroupedLocations {
  const grouped: GroupedLocations = {
    puneZones: [],
    india: [],
    international: [],
  };

  locations.forEach((location) => {
    const category = categorizeLocation(location);
    
    switch (category) {
      case "pune":
        grouped.puneZones.push(location);
        break;
      case "international":
        grouped.international.push(location);
        break;
      case "india":
        grouped.india.push(location);
        break;
    }
  });

  // Sort each group alphabetically
  grouped.puneZones.sort();
  grouped.india.sort();
  grouped.international.sort();

  return grouped;
}
