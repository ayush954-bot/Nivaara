import { createProperty } from "./server/db.js";

const purandarLand = {
  title: "5 Acre Premium Land in Purandar - Near New Pune International Airport",
  description: "Exceptional investment opportunity! Prime 5-acre land parcel strategically located in Purandar, just minutes from the upcoming Pune International Airport at Purandar. This is a once-in-a-lifetime opportunity to invest in one of Pune's most promising growth corridors. The new greenfield airport, being developed by the Airports Authority of India (AAI), is set to transform Purandar into a major commercial and residential hub. This land offers tremendous appreciation potential as infrastructure development accelerates in the region. Perfect for residential township development, commercial projects, warehousing, logistics centers, or long-term investment. Clear title, excellent road connectivity, and surrounded by upcoming infrastructure projects. The area is witnessing rapid development with multiple real estate projects, improved road networks, and enhanced connectivity to Pune city. Early investors stand to benefit from exponential growth as the airport project progresses. Ideal for developers, investors, and businesses looking to establish a presence near the new aviation gateway of Pune.",
  price: 25000000, // 2.5 Crores (₹50 Lakhs per acre)
  location: "Purandar",
  city: "Pune",
  state: "Maharashtra",
  propertyType: "Land",
  bhk: "NA",
  area: 217800, // 5 acres = 217,800 sq ft
  status: "Ready",
  features: JSON.stringify([
    "5 Acres (217,800 sq ft)",
    "Near New Pune International Airport",
    "Clear Title & Documentation",
    "Excellent Road Connectivity",
    "High Appreciation Potential",
    "Suitable for Township Development",
    "Ideal for Commercial Projects",
    "Perfect for Warehousing/Logistics",
    "Surrounded by Infrastructure Development",
    "Strategic Investment Opportunity",
    "20 km from Pune City",
    "Rapid Development Zone"
  ]),
  images: JSON.stringify([
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop", // Open land
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop", // Agricultural land
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop", // Aerial view of land
    "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop"  // Scenic land view
  ]),
  builder: "Direct Owner",
  zone: "South"
};

async function addProperty() {
  console.log("Adding Purandar land listing to database...");
  
  try {
    const result = await createProperty(purandarLand);
    console.log(`✓ Added: ${purandarLand.title}`);
    console.log(`  Price: ₹${(purandarLand.price / 10000000).toFixed(2)} Crores`);
    console.log(`  Area: 5 Acres (${purandarLand.area.toLocaleString()} sq ft)`);
    console.log(`  Location: ${purandarLand.location}, ${purandarLand.city}`);
    console.log(`  Zone: ${purandarLand.zone}`);
    console.log("\n✓ Successfully added Purandar land listing!");
  } catch (error) {
    console.error(`✗ Failed to add property:`, error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

addProperty().catch((error) => {
  console.error("Error adding property:", error);
  process.exit(1);
});
