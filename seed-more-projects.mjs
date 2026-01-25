import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const projects = [
  {
    name: "Kolte Patil 24K Glitterati",
    builderName: "Kolte Patil Developers",
    description: "24K Glitterati is a premium residential project offering luxurious 3 & 4 BHK apartments with world-class amenities. Located in the heart of Kharadi, this project features Italian marble flooring, modular kitchens, and smart home automation. The project is surrounded by lush greenery and offers panoramic views of the city.",
    location: "Kharadi",
    city: "Pune",
    status: "Ready to Move",
    priceRange: "1.8 Cr - 3.2 Cr",
    minPrice: 18000000,
    maxPrice: 32000000,
    configurations: "3, 4 BHK",
    possessionDate: "2024-06-01",
    reraNumber: "P52100025678",
    totalUnits: 180,
    towers: 2,
    floors: 28,
    featured: true,
    amenities: [
      { name: "Infinity Pool", icon: "Waves" },
      { name: "Sky Lounge", icon: "Home" },
      { name: "Private Theater", icon: "Music" },
      { name: "Spa & Wellness", icon: "Heart" },
      { name: "Concierge Service", icon: "Users" },
      { name: "Wine Cellar", icon: "Home" },
      { name: "Rooftop Garden", icon: "Trees" },
      { name: "Smart Home", icon: "Smartphone" },
      { name: "Valet Parking", icon: "Car" },
      { name: "Business Center", icon: "BookOpen" }
    ],
    floorPlans: [
      { name: "3 BHK Luxury", bedrooms: 3, bathrooms: 3, area: 1850, price: 18000000 },
      { name: "3 BHK Premium", bedrooms: 3, bathrooms: 4, area: 2100, price: 21000000 },
      { name: "4 BHK Elite", bedrooms: 4, bathrooms: 4, area: 2650, price: 26500000 },
      { name: "4 BHK Penthouse", bedrooms: 4, bathrooms: 5, area: 3200, price: 32000000 }
    ]
  },
  {
    name: "Kumar Privé",
    builderName: "Kumar Properties",
    description: "Kumar Privé offers thoughtfully designed 2 & 3 BHK apartments in the rapidly developing Kharadi area. With excellent connectivity to IT parks and the airport, this project is ideal for working professionals. Features include Vastu-compliant designs, ample natural light, and modern amenities.",
    location: "Kharadi",
    city: "Pune",
    status: "Under Construction",
    priceRange: "95 L - 1.65 Cr",
    minPrice: 9500000,
    maxPrice: 16500000,
    configurations: "2, 3 BHK",
    possessionDate: "2026-03-01",
    reraNumber: "P52100034567",
    totalUnits: 320,
    towers: 4,
    floors: 22,
    featured: false,
    amenities: [
      { name: "Swimming Pool", icon: "Waves" },
      { name: "Gymnasium", icon: "Dumbbell" },
      { name: "Clubhouse", icon: "Home" },
      { name: "Children's Play Area", icon: "Baby" },
      { name: "Jogging Track", icon: "Activity" },
      { name: "Indoor Games", icon: "Gamepad2" },
      { name: "Multipurpose Hall", icon: "Users" },
      { name: "24/7 Security", icon: "Shield" },
      { name: "Power Backup", icon: "Zap" },
      { name: "Covered Parking", icon: "Car" }
    ],
    floorPlans: [
      { name: "2 BHK Compact", bedrooms: 2, bathrooms: 2, area: 980, price: 9500000 },
      { name: "2 BHK Spacious", bedrooms: 2, bathrooms: 2, area: 1150, price: 11500000 },
      { name: "3 BHK Standard", bedrooms: 3, bathrooms: 2, area: 1380, price: 13800000 },
      { name: "3 BHK Large", bedrooms: 3, bathrooms: 3, area: 1650, price: 16500000 }
    ]
  },
  {
    name: "Nyati Elysia II",
    builderName: "Nyati Group",
    description: "Nyati Elysia II is a continuation of the successful Elysia project, offering affordable luxury in Kharadi. The project features 1, 2 & 3 BHK apartments with modern architecture and sustainable design. Located near EON IT Park, it offers excellent investment potential.",
    location: "Kharadi",
    city: "Pune",
    status: "Under Construction",
    priceRange: "78 L - 1.25 Cr",
    minPrice: 7800000,
    maxPrice: 12500000,
    configurations: "1, 2, 3 BHK",
    possessionDate: "2026-09-01",
    reraNumber: "P52100045678",
    totalUnits: 450,
    towers: 5,
    floors: 18,
    featured: true,
    amenities: [
      { name: "Swimming Pool", icon: "Waves" },
      { name: "Fitness Center", icon: "Dumbbell" },
      { name: "Kids Zone", icon: "Baby" },
      { name: "Senior Citizen Area", icon: "Users" },
      { name: "Landscaped Gardens", icon: "Trees" },
      { name: "Amphitheater", icon: "Music" },
      { name: "Yoga Deck", icon: "Heart" },
      { name: "EV Charging", icon: "Zap" },
      { name: "Visitor Parking", icon: "Car" },
      { name: "CCTV Surveillance", icon: "Shield" }
    ],
    floorPlans: [
      { name: "1 BHK Studio", bedrooms: 1, bathrooms: 1, area: 650, price: 7800000 },
      { name: "2 BHK Comfort", bedrooms: 2, bathrooms: 2, area: 950, price: 9500000 },
      { name: "2 BHK Premium", bedrooms: 2, bathrooms: 2, area: 1100, price: 11000000 },
      { name: "3 BHK Family", bedrooms: 3, bathrooms: 2, area: 1250, price: 12500000 }
    ]
  },
  {
    name: "Paranjape Blue Ridge",
    builderName: "Paranjape Schemes",
    description: "Blue Ridge is an upcoming ultra-luxury township project spanning 50 acres in Kharadi. This integrated township will feature residential towers, a shopping complex, schools, and healthcare facilities. Pre-launch bookings are now open with attractive early bird offers.",
    location: "Kharadi",
    city: "Pune",
    status: "Upcoming",
    priceRange: "1.1 Cr - 2.8 Cr",
    minPrice: 11000000,
    maxPrice: 28000000,
    configurations: "2, 3, 4 BHK",
    possessionDate: "2028-12-01",
    reraNumber: "P52100056789",
    totalUnits: 800,
    towers: 8,
    floors: 32,
    featured: true,
    amenities: [
      { name: "Olympic Pool", icon: "Waves" },
      { name: "Sports Complex", icon: "Activity" },
      { name: "International School", icon: "BookOpen" },
      { name: "Healthcare Center", icon: "Heart" },
      { name: "Shopping Mall", icon: "Home" },
      { name: "Central Park", icon: "Trees" },
      { name: "Multi-level Parking", icon: "Car" },
      { name: "Smart Township", icon: "Smartphone" },
      { name: "24/7 Security", icon: "Shield" },
      { name: "Community Center", icon: "Users" }
    ],
    floorPlans: [
      { name: "2 BHK Classic", bedrooms: 2, bathrooms: 2, area: 1100, price: 11000000 },
      { name: "3 BHK Premium", bedrooms: 3, bathrooms: 3, area: 1550, price: 15500000 },
      { name: "3 BHK Luxury", bedrooms: 3, bathrooms: 3, area: 1850, price: 18500000 },
      { name: "4 BHK Villa", bedrooms: 4, bathrooms: 4, area: 2800, price: 28000000 }
    ]
  }
];

async function seedProjects() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const project of projects) {
      // Insert project with camelCase column names
      const [result] = await connection.execute(
        `INSERT INTO projects (name, builderName, description, location, city, status, priceRange, minPrice, maxPrice, configurations, possessionDate, reraNumber, totalUnits, towers, floors, featured, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          project.name,
          project.builderName,
          project.description,
          project.location,
          project.city,
          project.status,
          project.priceRange,
          project.minPrice,
          project.maxPrice,
          project.configurations,
          project.possessionDate,
          project.reraNumber,
          project.totalUnits,
          project.towers,
          project.floors,
          project.featured
        ]
      );
      
      const projectId = result.insertId;
      console.log(`Created project: ${project.name} (ID: ${projectId})`);
      
      // Insert amenities
      for (const amenity of project.amenities) {
        await connection.execute(
          `INSERT INTO project_amenities (projectId, name, icon, createdAt) VALUES (?, ?, ?, NOW())`,
          [projectId, amenity.name, amenity.icon]
        );
      }
      console.log(`  Added ${project.amenities.length} amenities`);
      
      // Insert floor plans
      for (const plan of project.floorPlans) {
        await connection.execute(
          `INSERT INTO project_floor_plans (projectId, name, bedrooms, bathrooms, area, price, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [projectId, plan.name, plan.bedrooms, plan.bathrooms, plan.area, plan.price]
        );
      }
      console.log(`  Added ${project.floorPlans.length} floor plans`);
    }
    
    console.log('\n✅ All projects seeded successfully!');
  } catch (error) {
    console.error('Error seeding projects:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedProjects();
