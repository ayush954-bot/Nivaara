import { createProperty } from "./server/db.js";

const kharadiProperties = [
  {
    title: "2 BHK Flat in Vishal Leela, Kharadi",
    description: "Spacious 2 BHK apartment in Vishal Leela, located near Reliance Mall in Kharadi. This ready-to-move property features east-facing orientation, ensuring ample natural light throughout the day. The apartment comes with dedicated parking for both bike and car. Conveniently located near B T Kawade Road, Kharadi Bypass, Fitness Club Kumar Presidency, Manipal Hospital Kharadi, and Bollywood Multiplex. Perfect for families looking for a well-connected residential property in one of Pune's most sought-after IT hubs.",
    price: 11500000,
    location: "Kharadi",
    city: "Pune",
    state: "Maharashtra",
    propertyType: "Flat",
    bhk: "2 BHK",
    area: 1001,
    status: "Ready",
    features: JSON.stringify([
      "East Facing",
      "2 Bathrooms",
      "Bike Parking",
      "Car Parking",
      "Near Reliance Mall",
      "Near Manipal Hospital",
      "Ready to Move",
      "Not under loan"
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
    ]),
    builder: "Vishal Leela",
    zone: "East"
  },
  {
    title: "4 BHK Luxury Apartment in Mahindra IvyLush, Kharadi",
    description: "Premium 4 BHK apartment in the prestigious Mahindra IvyLush project, located near KALPATARU Organic Farm in Manjarim, Kharadi. This spacious 2,540 sqft property offers luxurious living with north-east facing orientation, ensuring positive energy flow and excellent ventilation. The apartment features 4 modern bathrooms, dedicated parking for both bike and car, and is part of an exclusive deal. Mahindra IvyLush is known for its world-class amenities, green spaces, and strategic location in Pune's prime IT corridor. Ideal for families seeking a premium lifestyle with excellent connectivity to major IT parks, schools, hospitals, and shopping centers.",
    price: 20600000,
    location: "Kharadi",
    city: "Pune",
    state: "Maharashtra",
    propertyType: "Flat",
    bhk: "4 BHK",
    area: 2540,
    status: "Ready",
    features: JSON.stringify([
      "North-East Facing",
      "4 Bathrooms",
      "Bike Parking",
      "Car Parking",
      "Luxury Amenities",
      "Near Organic Farm",
      "Gated Community",
      "Premium Project",
      "Exclusive Deal"
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ]),
    builder: "Mahindra Lifespaces",
    zone: "East"
  }
];

async function addProperties() {
  console.log("Adding real Kharadi properties to database...");
  
  for (const property of kharadiProperties) {
    try {
      const result = await createProperty(property);
      console.log(`✓ Added: ${property.title} (ID: ${result.id})`);
    } catch (error) {
      console.error(`✗ Failed to add ${property.title}:`, error.message);
    }
  }
  
  console.log("\n✓ Successfully added all Kharadi properties!");
  process.exit(0);
}

addProperties().catch((error) => {
  console.error("Error adding properties:", error);
  process.exit(1);
});
