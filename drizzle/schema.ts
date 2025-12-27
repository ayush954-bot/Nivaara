import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
  propertyType: mysqlEnum("propertyType", ["Flat", "Shop", "Office", "Land", "Rental"]).notNull(),
  status: mysqlEnum("status", ["Under-Construction", "Ready"]).notNull(),
  location: varchar("location", { length: 255 }).notNull(), // e.g., "Pune - East Zone", "Mumbai", "Dubai"
  area: varchar("area", { length: 255 }), // Specific area like "Kharadi", "Viman Nagar"
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  priceLabel: varchar("priceLabel", { length: 100 }), // e.g., "₹45L - ₹65L", "$500K+"
  bedrooms: int("bedrooms"), // For residential properties
  bathrooms: int("bathrooms"), // For residential properties
  area_sqft: int("area_sqft"), // Property size in square feet
  builder: varchar("builder", { length: 255 }), // Builder/Developer name
  imageUrl: text("imageUrl"), // Primary image URL
  featured: boolean("featured").default(false).notNull(), // Featured properties
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

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