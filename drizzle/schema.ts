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
 * Builders table - stores information about real estate developers/builders
 */
export const builders = mysqlTable("builders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"), // Company background and history
  logo: text("logo"), // Builder logo URL
  foundedYear: int("foundedYear"), // Year the company was founded
  completedProjects: int("completedProjects").default(0), // Number of completed projects
  ongoingProjects: int("ongoingProjects").default(0), // Number of ongoing projects
  website: varchar("website", { length: 255 }), // Builder's official website
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Builder = typeof builders.$inferSelect;
export type InsertBuilder = typeof builders.$inferInsert;

/**
 * Projects table - stores builder project information
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  builderId: int("builderId"), // Foreign key to builders table
  builderName: varchar("builderName", { length: 255 }).notNull(), // Denormalized for quick access
  location: varchar("location", { length: 255 }).notNull(), // Full address
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  description: text("description").notNull(), // Project overview
  highlights: text("highlights"), // Key features as JSON array or comma-separated
  priceRange: varchar("priceRange", { length: 100 }).notNull(), // e.g., "₹1.75 Cr - ₹3.5 Cr"
  minPrice: decimal("minPrice", { precision: 15, scale: 2 }), // Minimum price for filtering
  maxPrice: decimal("maxPrice", { precision: 15, scale: 2 }), // Maximum price for filtering
  status: mysqlEnum("status", ["Upcoming", "Under Construction", "Ready to Move", "Completed"]).notNull(),
  reraNumber: varchar("reraNumber", { length: 100 }), // RERA registration number
  launchDate: date("launchDate"), // Project launch date
  possessionDate: date("possessionDate"), // Expected possession date
  totalUnits: int("totalUnits"), // Total number of units/apartments
  availableUnits: int("availableUnits"), // Currently available units
  landArea: varchar("landArea", { length: 50 }), // e.g., "8 Acres"
  towers: int("towers"), // Number of towers/buildings
  floors: int("floors"), // Number of floors per tower
  configurations: varchar("configurations", { length: 255 }), // e.g., "2 BHK, 3 BHK, 4 BHK"
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // Latitude coordinate
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // Longitude coordinate
  featured: boolean("featured").default(false).notNull(),
  badge: varchar("badge", { length: 100 }), // Predefined badge
  customBadgeText: varchar("customBadgeText", { length: 25 }), // Custom badge text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Images table - stores multiple images per project
 */
export const projectImages = mysqlTable("project_images", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  imageUrl: text("imageUrl").notNull(), // S3 URL of the image
  imageKey: varchar("imageKey", { length: 255 }), // S3 key for deletion
  isCover: boolean("isCover").default(false).notNull(), // True if this is the cover/primary image
  displayOrder: int("displayOrder").default(0).notNull(), // Order for displaying images (0 = first)
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
  displayOrder: int("displayOrder").default(0).notNull(), // Order for displaying videos (0 = first)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectVideo = typeof projectVideos.$inferSelect;
export type InsertProjectVideo = typeof projectVideos.$inferInsert;

/**
 * Project Amenities table - stores amenities/facilities for each project
 */
export const projectAmenities = mysqlTable("project_amenities", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Swimming Pool", "Gymnasium"
  icon: varchar("icon", { length: 50 }), // Lucide icon name (e.g., "Waves", "Dumbbell")
  category: varchar("category", { length: 100 }), // e.g., "Sports", "Lifestyle", "Security"
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectAmenity = typeof projectAmenities.$inferSelect;
export type InsertProjectAmenity = typeof projectAmenities.$inferInsert;

/**
 * Project Floor Plans table - stores floor plan details and images
 */
export const projectFloorPlans = mysqlTable("project_floor_plans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(), // Foreign key to projects table
  name: varchar("name", { length: 255 }).notNull(), // e.g., "2 BHK Type A", "3 BHK Premium"
  bhk: varchar("bhk", { length: 20 }).notNull(), // e.g., "2 BHK", "3 BHK", "4 BHK"
  carpetArea: int("carpetArea"), // Carpet area in sqft
  builtUpArea: int("builtUpArea"), // Built-up area in sqft
  price: decimal("price", { precision: 15, scale: 2 }), // Price for this configuration
  imageUrl: text("imageUrl"), // Floor plan image URL
  imageKey: varchar("imageKey", { length: 255 }), // S3 key for deletion
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectFloorPlan = typeof projectFloorPlans.$inferSelect;
export type InsertProjectFloorPlan = typeof projectFloorPlans.$inferInsert;
