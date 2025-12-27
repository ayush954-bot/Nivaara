import { drizzle } from "drizzle-orm/mysql2";
import { properties, testimonials } from "./drizzle/schema.js";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const sampleProperties = [
  {
    title: "Luxury 3BHK Apartment in Kharadi",
    description: "Spacious 3BHK apartment with modern amenities, close to IT parks and shopping centers. Perfect for families.",
    propertyType: "Flat",
    status: "Ready",
    location: "Pune - East Zone",
    area: "Kharadi",
    price: "5500000",
    priceLabel: "₹55L",
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1450,
    builder: "Kolte Patil",
    imageUrl: "/images/property-1.jpg",
    featured: true,
  },
  {
    title: "Premium Office Space in Hinjewadi",
    description: "Grade A office space in Hinjewadi IT Park with excellent connectivity and modern infrastructure.",
    propertyType: "Office",
    status: "Ready",
    location: "Pune - West Zone",
    area: "Hinjewadi",
    price: "12000000",
    priceLabel: "₹1.2Cr",
    bedrooms: null,
    bathrooms: null,
    area_sqft: 2500,
    builder: "Panchshil Realty",
    imageUrl: "/images/property-2.jpg",
    featured: true,
  },
  {
    title: "Under Construction 2BHK in Wagholi",
    description: "Affordable 2BHK apartments in upcoming locality with great investment potential.",
    propertyType: "Flat",
    status: "Under-Construction",
    location: "Pune - East Zone",
    area: "Wagholi",
    price: "3500000",
    priceLabel: "₹35L",
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1050,
    builder: "Gera Developments",
    imageUrl: "/images/property-3.jpg",
    featured: false,
  },
  {
    title: "Commercial Shop in Viman Nagar",
    description: "Prime location shop perfect for retail business with high footfall area.",
    propertyType: "Shop",
    status: "Ready",
    location: "Pune - East Zone",
    area: "Viman Nagar",
    price: "8500000",
    priceLabel: "₹85L",
    bedrooms: null,
    bathrooms: 1,
    area_sqft: 800,
    builder: "Kumar Properties",
    imageUrl: "/images/property-4.jpg",
    featured: false,
  },
  {
    title: "Residential Plot in Baner",
    description: "Spacious residential plot in prime Baner location, ready for construction with all approvals.",
    propertyType: "Land",
    status: "Ready",
    location: "Pune - West Zone",
    area: "Baner",
    price: "15000000",
    priceLabel: "₹1.5Cr",
    bedrooms: null,
    bathrooms: null,
    area_sqft: 3000,
    builder: null,
    imageUrl: "/images/property-5.jpg",
    featured: true,
  },
  {
    title: "Luxury Villa in Mumbai Suburbs",
    description: "Exclusive 4BHK villa with private garden and premium amenities in Mumbai's prime location.",
    propertyType: "Flat",
    status: "Ready",
    location: "Mumbai",
    area: "Powai",
    price: "35000000",
    priceLabel: "₹3.5Cr",
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3500,
    builder: "Lodha Group",
    imageUrl: "/images/property-6.jpg",
    featured: true,
  },
  {
    title: "Modern Apartment in Dubai Marina",
    description: "Stunning 2BR apartment with sea view in Dubai Marina, fully furnished with world-class amenities.",
    propertyType: "Flat",
    status: "Ready",
    location: "Dubai, UAE",
    area: "Dubai Marina",
    price: "45000000",
    priceLabel: "$550K",
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    builder: "Emaar Properties",
    imageUrl: "/images/property-7.jpg",
    featured: true,
  },
  {
    title: "Commercial Space in Bangalore",
    description: "Premium office space in Bangalore's tech corridor with excellent connectivity.",
    propertyType: "Office",
    status: "Ready",
    location: "Bangalore",
    area: "Whitefield",
    price: "18000000",
    priceLabel: "₹1.8Cr",
    bedrooms: null,
    bathrooms: 2,
    area_sqft: 3000,
    builder: "Brigade Group",
    imageUrl: "/images/property-8.jpg",
    featured: false,
  },
];

const sampleTestimonials = [
  {
    name: "Rajesh Kumar",
    location: "Kharadi, Pune",
    text: "Nivaara helped us find our dream home in Kharadi. Their transparency and professionalism made the entire process smooth and stress-free.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "Priya Sharma",
    location: "Viman Nagar, Pune",
    text: "Excellent service for commercial property rental. The team understood our requirements perfectly and delivered beyond expectations.",
    rating: 5,
    isPublished: true,
  },
  {
    name: "Amit Patel",
    location: "Hinjewadi, Pune",
    text: "Best real estate consultancy in Pune. Their market knowledge and investment advisory helped us make the right property decision.",
    rating: 5,
    isPublished: true,
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Insert properties
    console.log("📦 Inserting properties...");
    for (const property of sampleProperties) {
      await db.insert(properties).values(property);
    }
    console.log(`✅ Inserted ${sampleProperties.length} properties`);

    // Insert testimonials
    console.log("💬 Inserting testimonials...");
    for (const testimonial of sampleTestimonials) {
      await db.insert(testimonials).values(testimonial);
    }
    console.log(`✅ Inserted ${sampleTestimonials.length} testimonials`);

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
