import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties table - stores all property listings
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).unique(), // URL-friendly slug for SEO
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  propertyType: mysqlEnum("propertyType", ["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]).notNull(),
  status: mysqlEnum("status", ["Under-Construction", "Ready"]).notNull(),
  location: varchar("location", { length: 255 }).notNull(), // e.g., "Pune - East Zone", "Mumbai", "Dubai"
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // Latitude coordinate
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // Longitude coordinate
  zone: mysqlEnum("zone", ["east_pune", "west_pune", "north_pune", "south_pune", "other"]), // Auto-assigned Pune zone
  area: varchar("area", { length: 255 }), // Specific area like "Kharadi", "Viman Nagar"
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  priceLabel: varchar("priceLabel", { length: 100 }), // e.g., "₹45L - ₹65L", "$500K+"
  bedrooms: int("bedrooms"), // For residential properties
  bathrooms: int("bathrooms"), // For residential properties
  area_sqft: int("area_sqft"), // Property size in square feet
  builder: varchar("builder", { length: 255 }), // Builder/Developer name
  imageUrl: text("imageUrl"), // Primary image URL
  videoUrl: text("videoUrl"), // YouTube video URL for property tour
  badge: varchar("badge", { length: 100 }), // Predefined badge (e.g., "Big Discount", "Special Offer", "Price Reduced")
  customBadgeText: varchar("customBadgeText", { length: 25 }), // Free-text custom badge (max 25 chars)
  featured: boolean("featured").default(false).notNull(), // Featured properties
  brochureUrl: text("brochureUrl"), // Brochure PDF URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Property Images table - stores multiple images per property
 */
export const propertyImages = mysqlTable("property_images", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(), // Foreign key to properties table
  imageUrl: text("imageUrl").notNull(), // S3 URL of the image
  isCover: boolean("isCover").default(false).notNull(), // True if this is the cover/primary image
  displayOrder: int("displayOrder").default(0).notNull(), // Order for displaying images (0 = first)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

/**
 * Property Videos table - stores multiple video links per property
 */
export const propertyVideos = mysqlTable("property_videos", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(), // Foreign key to properties table
  videoUrl: text("videoUrl").notNull(), // YouTube, Vimeo, or other video URL
  videoType: mysqlEnum("videoType", ["youtube", "vimeo", "virtual_tour", "other"]).default("youtube").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(), // Order for displaying videos (0 = first)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyVideo = typeof propertyVideos.$inferSelect;
export type InsertPropertyVideo = typeof propertyVideos.$inferInsert;

/**
 * Inquiries table - stores contact form submissions and property inquiries
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  propertyId: int("propertyId"), // Optional - if inquiry is about specific property
  inquiryType: mysqlEnum("inquiryType", ["general", "property", "consultation"]).default("general").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Testimonials table - stores client testimonials and reviews
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  text: text("text").notNull(),
  rating: int("rating").default(5).notNull(), // 1-5 star rating
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Staff table - stores employee accounts for property management
 * Separate from users table to avoid Manus OAuth requirement
 */
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(), // bcrypt hash
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["property_manager"]).default("property_manager").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

/**
 * Projects table - stores builder project listings (apartments, townships, etc.)
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Pride Purple Park Eden"
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly slug e.g., "pride-purple-park-eden"
  builderName: varchar("builderName", { length: 255 }).notNull(), // e.g., "Pride Group"
  description: text("description").notNull(), // Full project description
  location: varchar("location", { length: 255 }).notNull(), // e.g., "Kharadi"
  city: varchar("city", { length: 100 }).notNull(), // e.g., "Pune"
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // Latitude coordinate
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // Longitude coordinate
  status: mysqlEnum("status", ["Upcoming", "Under Construction", "Ready to Move"]).notNull(),
  priceRange: varchar("priceRange", { length: 100 }).notNull(), // e.g., "₹85L - ₹1.45Cr"
  minPrice: decimal("minPrice", { precision: 15, scale: 2 }), // For filtering
  maxPrice: decimal("maxPrice", { precision: 15, scale: 2 }), // For filtering
  configurations: varchar("configurations", { length: 255 }), // e.g., "2, 3 BHK"
  reraNumber: varchar("reraNumber", { length: 100 }), // RERA registration number
  possessionDate: date("possessionDate"), // Expected possession date
  totalUnits: int("totalUnits"), // Total number of units
  towers: int("towers"), // Number of towers/buildings
  floors: int("floors"), // Number of floors per tower
  coverImage: text("coverImage"), // Main project image URL
  videoUrl: text("videoUrl"), // YouTube video URL
  brochureUrl: text("brochureUrl"), // PDF brochure URL
  masterPlanUrl: text("masterPlanUrl"), // Master plan image URL
  builderDescription: text("builderDescription"), // Builder/Developer history and background
  builderLogo: text("builderLogo"), // Builder logo URL
  builderEstablished: int("builderEstablished"), // Year builder was established
  builderProjects: int("builderProjects"), // Number of projects by builder
  featured: boolean("featured").default(false).notNull(), // Featured projects
  badge: varchar("badge", { length: 50 }), // Predefined badge like "New", "Hot Deal"
  customBadgeText: varchar("customBadgeText", { length: 50 }), // Custom badge text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Amenities table - stores amenities for each project
 */
export const projectAmenities = mysqlTable("project_amenities", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Swimming Pool", "Gym"
  icon: varchar("icon", { length: 50 }), // Lucide icon name (e.g., "Dumbbell", "Waves")
  imageUrl: text("imageUrl"), // Optional image URL for the amenity
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectAmenity = typeof projectAmenities.$inferSelect;
export type InsertProjectAmenity = typeof projectAmenities.$inferInsert;

/**
 * Project Floor Plans table - stores different floor plan configurations
 */
export const projectFloorPlans = mysqlTable("project_floor_plans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  name: varchar("name", { length: 255 }).notNull(), // e.g., "2 BHK - Type A"
  bedrooms: int("bedrooms").notNull(),
  bathrooms: int("bathrooms").notNull(),
  area: int("area").notNull(), // Area in sq ft
  price: decimal("price", { precision: 15, scale: 2 }).notNull(), // Starting price
  imageUrl: text("imageUrl"), // Floor plan image URL
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectFloorPlan = typeof projectFloorPlans.$inferSelect;
export type InsertProjectFloorPlan = typeof projectFloorPlans.$inferInsert;

/**
 * Project Images table - stores multiple images per project
 */
export const projectImages = mysqlTable("project_images", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  imageUrl: text("imageUrl").notNull(), // S3 URL of the image
  caption: varchar("caption", { length: 255 }), // Optional image caption
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectImage = typeof projectImages.$inferSelect;
export type InsertProjectImage = typeof projectImages.$inferInsert;

/**
 * Project Videos table - stores multiple video links per project
 */
export const projectVideos = mysqlTable("project_videos", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  videoUrl: text("videoUrl").notNull(), // YouTube, Vimeo, or other video URL
  videoType: mysqlEnum("videoType", ["youtube", "vimeo", "virtual_tour", "other"]).default("youtube").notNull(),
  title: varchar("title", { length: 255 }), // Optional video title
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectVideo = typeof projectVideos.$inferSelect;
export type InsertProjectVideo = typeof projectVideos.$inferInsert;
