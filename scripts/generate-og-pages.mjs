/**
 * Generate static HTML pages with correct OG meta tags for each project and property
 * This runs after the Vite build to create pre-rendered pages for social media crawlers
 */

import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist", "public");

// Database connection
async function getConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set");
  }
  return mysql.createConnection(url);
}

// Generate OG meta tags HTML
function generateOGTags(meta) {
  return `
    <!-- Dynamic OG Tags for ${meta.title} -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Nivaara Realty Solutions">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:image" content="${escapeHtml(meta.image)}">
    <meta property="og:url" content="${escapeHtml(meta.url)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(meta.title)}">
    <meta name="twitter:description" content="${escapeHtml(meta.description)}">
    <meta name="twitter:image" content="${escapeHtml(meta.image)}">
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Replace OG tags in HTML
function replaceOGTags(html, newTags, pageTitle) {
  let result = html;
  
  // Replace title
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  
  // Remove existing og: meta tags
  result = result.replace(/<meta property="og:[^"]*"[^>]*>\s*/g, "");
  
  // Remove twitter: meta tags
  result = result.replace(/<meta name="twitter:[^"]*"[^>]*>\s*/g, "");
  
  // Remove the comment markers
  result = result.replace(/<!-- Open Graph \/ Facebook -->\s*/g, "");
  result = result.replace(/<!-- Twitter -->\s*/g, "");
  result = result.replace(/<!-- Dynamic OG Tags[^>]*-->\s*/g, "");
  
  // Insert new tags before </head>
  result = result.replace("</head>", `${newTags}\n  </head>`);
  
  return result;
}

// Convert relative image URL to absolute
function toAbsoluteImageUrl(imageUrl, baseUrl = "https://nivaararealty.com") {
  if (!imageUrl) return `${baseUrl}/og-default.jpg`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return `${baseUrl}${imageUrl}`;
  }
  return `${baseUrl}/${imageUrl}`;
}

async function generateProjectPages(conn, baseHtml) {
  console.log("Generating project pages...");
  
  const [projects] = await conn.execute(
    "SELECT id, name, slug, builderName, description, coverImage, status FROM projects WHERE slug IS NOT NULL"
  );
  
  const projectsDir = path.join(distDir, "projects");
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }
  
  for (const project of projects) {
    const meta = {
      title: `${project.name} by ${project.builderName} | Nivaara Realty Solutions`,
      description: project.description || `Explore ${project.name} - ${project.status} project by ${project.builderName}. Contact Nivaara Realty for best deals.`,
      image: toAbsoluteImageUrl(project.coverImage),
      url: `https://nivaararealty.com/projects/${project.slug}`,
    };
    
    const ogTags = generateOGTags(meta);
    const html = replaceOGTags(baseHtml, ogTags, meta.title);
    
    // Create directory for this project
    const projectDir = path.join(projectsDir, project.slug);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    // Write index.html for this project
    fs.writeFileSync(path.join(projectDir, "index.html"), html);
    console.log(`  ✓ Generated: /projects/${project.slug}/index.html`);
  }
  
  console.log(`Generated ${projects.length} project pages`);
}

async function generatePropertyPages(conn, baseHtml) {
  console.log("Generating property pages...");
  
  const [properties] = await conn.execute(
    "SELECT id, title, slug, location, propertyType, bedrooms, imageUrl, description FROM properties WHERE slug IS NOT NULL"
  );
  
  const propertiesDir = path.join(distDir, "properties");
  if (!fs.existsSync(propertiesDir)) {
    fs.mkdirSync(propertiesDir, { recursive: true });
  }
  
  for (const property of properties) {
    const meta = {
      title: `${property.title} | Nivaara Realty Solutions`,
      description: property.description || `${property.bedrooms} BHK ${property.propertyType} in ${property.location}. Contact Nivaara Realty for best deals.`,
      image: toAbsoluteImageUrl(property.imageUrl),
      url: `https://nivaararealty.com/properties/${property.slug}`,
    };
    
    const ogTags = generateOGTags(meta);
    const html = replaceOGTags(baseHtml, ogTags, meta.title);
    
    // Create directory for this property
    const propertyDir = path.join(propertiesDir, property.slug);
    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true });
    }
    
    // Write index.html for this property
    fs.writeFileSync(path.join(propertyDir, "index.html"), html);
    console.log(`  ✓ Generated: /properties/${property.slug}/index.html`);
  }
  
  console.log(`Generated ${properties.length} property pages`);
}

async function main() {
  console.log("=== Generating OG Meta Pages ===\n");
  
  // Read the base index.html
  const baseHtmlPath = path.join(distDir, "index.html");
  if (!fs.existsSync(baseHtmlPath)) {
    console.error("Error: dist/public/index.html not found. Run 'pnpm build' first.");
    process.exit(1);
  }
  
  const baseHtml = fs.readFileSync(baseHtmlPath, "utf-8");
  console.log("Loaded base index.html\n");
  
  let conn;
  try {
    conn = await getConnection();
    console.log("Connected to database\n");
    
    await generateProjectPages(conn, baseHtml);
    console.log("");
    await generatePropertyPages(conn, baseHtml);
    
    console.log("\n=== OG Meta Pages Generated Successfully ===");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
