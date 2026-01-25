/**
 * Script to generate slugs for existing properties
 * Run with: node scripts/generate-property-slugs.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function main() {
  console.log("Connecting to database...");
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  console.log("Fetching properties without slugs...");
  
  // Get all properties
  const [rows] = await connection.execute("SELECT id, title, slug FROM properties");
  
  console.log(`Found ${rows.length} properties`);
  
  let updated = 0;
  const slugCounts = {};
  
  for (const property of rows) {
    // Skip if already has a slug
    if (property.slug) {
      console.log(`Property ${property.id} already has slug: ${property.slug}`);
      slugCounts[property.slug] = (slugCounts[property.slug] || 0) + 1;
      continue;
    }
    
    // Generate base slug from title
    let baseSlug = generateSlug(property.title);
    let slug = baseSlug;
    
    // Handle duplicates by adding a number suffix
    let counter = 1;
    while (slugCounts[slug]) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    slugCounts[slug] = 1;
    
    // Update the property with the new slug
    await connection.execute(
      "UPDATE properties SET slug = ? WHERE id = ?",
      [slug, property.id]
    );
    
    console.log(`Updated property ${property.id}: "${property.title}" -> "${slug}"`);
    updated++;
  }
  
  console.log(`\nDone! Updated ${updated} properties with slugs.`);
  
  // Show final results
  const [finalRows] = await connection.execute("SELECT id, title, slug FROM properties ORDER BY id");
  console.log("\nFinal property slugs:");
  for (const row of finalRows) {
    console.log(`  ${row.id}: ${row.slug} (${row.title})`);
  }
  
  await connection.end();
}

main().catch(console.error);
