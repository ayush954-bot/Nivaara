import { drizzle } from "drizzle-orm/mysql2";
import { projects, projectAmenities, projectFloorPlans } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const kharadiProjects = [
  {
    project: {
      name: "Pride Purple Park Eden",
      builderName: "Pride Group",
      description: "Pride Purple Park Eden offers premium 2 & 3 BHK apartments in the heart of Kharadi. With world-class amenities and excellent connectivity to IT hubs, this project is perfect for modern families.",
      location: "Kharadi",
      city: "Pune",
      status: "Under Construction",
      priceRange: "₹85L - ₹1.45Cr",
      minPrice: 8500000,
      maxPrice: 14500000,
      configurations: "2, 3 BHK",
      reraNumber: "P52100017620",
      possessionDate: "2025-12-01",
      totalUnits: 450,
      towers: 3,
      floors: 18,
      coverImage: "/images/placeholder-project.jpg",
      featured: true,
    },
    amenities: [
      { name: "Swimming Pool", icon: "Waves" },
      { name: "Gymnasium", icon: "Dumbbell" },
      { name: "Clubhouse", icon: "Home" },
      { name: "Children's Play Area", icon: "Baby" },
      { name: "Landscaped Gardens", icon: "Trees" },
      { name: "24/7 Security", icon: "Shield" },
      { name: "Power Backup", icon: "Zap" },
      { name: "Covered Parking", icon: "Car" },
      { name: "Jogging Track", icon: "Activity" },
      { name: "Indoor Games Room", icon: "Gamepad2" },
    ],
    floorPlans: [
      { name: "2 BHK - Type A", bedrooms: 2, bathrooms: 2, area: 950, price: 8500000 },
      { name: "2 BHK - Type B", bedrooms: 2, bathrooms: 2, area: 1050, price: 9500000 },
      { name: "3 BHK - Type A", bedrooms: 3, bathrooms: 3, area: 1350, price: 12500000 },
      { name: "3 BHK - Type B", bedrooms: 3, bathrooms: 3, area: 1550, price: 14500000 },
    ],
  },
];

async function seedProjects() {
  console.log("Starting to seed Kharadi projects...");
  
  for (const { project, amenities, floorPlans } of kharadiProjects) {
    try {
      const [result] = await db.insert(projects).values(project);
      const projectId = result.insertId;
      console.log(`Created project: ${project.name} (ID: ${projectId})`);
      
      const amenitiesWithProjectId = amenities.map((amenity, index) => ({
        ...amenity,
        projectId,
        displayOrder: index,
      }));
      await db.insert(projectAmenities).values(amenitiesWithProjectId);
      
      const floorPlansWithProjectId = floorPlans.map((plan, index) => ({
        ...plan,
        projectId,
        displayOrder: index,
      }));
      await db.insert(projectFloorPlans).values(floorPlansWithProjectId);
      
    } catch (error) {
      console.error(`Error creating project ${project.name}:`, error);
    }
  }
  
  console.log("All projects seeded!");
  process.exit(0);
}

seedProjects().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
