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
