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
    title: "2 BHK Flat in Vishal Leela, Kharadi",
    description: "Premium 2 BHK apartment in Vishal Leela with modern amenities, excellent connectivity to IT parks and EON IT Park.",
    propertyType: "Flat",
    status: "Ready",
    location: "Pune - East Zone",
    area: "Kharadi",
    price: "11500000",
    priceLabel: "₹1.15Cr",
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1100,
    builder: "Vishal Developers",
    imageUrl: "/images/property-kharadi-1.jpg",
    featured: true,
  },
  {
    title: "4 BHK Flat in Mahindra Ivy Lush, Kharadi",
    description: "Spacious 4 BHK luxury apartment by Mahindra Lifespaces with world-class amenities and prime location near IT hubs.",
    propertyType: "Flat",
    status: "Ready",
    location: "Pune - East Zone",
    area: "Kharadi",
    price: "20600000",
    priceLabel: "₹2.06Cr",
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2200,
    builder: "Mahindra Lifespaces",
    imageUrl: "/images/property-kharadi-2.jpg",
    featured: true,
  },
  {
    title: "5 Acre Premium Land in Purandar",
    description: "Exclusive 5-acre land parcel near the upcoming Pune International Airport in Purandar. Perfect for resort, farmhouse, or investment with excellent appreciation potential.",
    propertyType: "Land",
    status: "Ready",
    location: "Pune - South Zone",
    area: "Purandar",
    price: "25000000",
    priceLabel: "₹2.5Cr",
    bedrooms: null,
    bathrooms: null,
    area_sqft: 217800,
    builder: null,
    imageUrl: "/images/property-purandar-land.jpg",
    featured: true,
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
