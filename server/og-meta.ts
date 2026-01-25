import { getProjectBySlug, getPropertyById, getPropertyBySlug } from "./db";

/**
 * Generate dynamic Open Graph meta tags for projects and properties
 * This enables proper social media previews when sharing links
 */

interface OGMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
}

const DEFAULT_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/DzCZsHdZxYzvZkgo.png";
const SITE_NAME = "Nivaara Realty Solutions";
const BASE_URL = "https://nivaararealty.com";

/**
 * Convert relative image URLs to absolute URLs for social media crawlers
 * Social media platforms require absolute URLs to fetch images
 */
function toAbsoluteImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return DEFAULT_IMAGE;
  
  // Clean up the URL - remove any leading/trailing whitespace
  const cleanUrl = imageUrl.trim();
  
  // Already an absolute URL (check for various protocols)
  if (cleanUrl.match(/^https?:\/\//i)) {
    return cleanUrl;
  }
  
  // Handle URLs that start with "https:" but missing slashes (malformed)
  if (cleanUrl.startsWith("https:") || cleanUrl.startsWith("http:")) {
    // Fix malformed URLs like "https:/images/..." -> "https://images/..."
    return cleanUrl.replace(/^(https?:)\/([^/])/, '$1//$2');
  }
  
  // Relative URL - prepend base URL
  if (cleanUrl.startsWith("/")) {
    return `${BASE_URL}${cleanUrl}`;
  }
  
  // No leading slash - add one
  return `${BASE_URL}/${cleanUrl}`;
}

export async function getProjectOGMeta(slug: string): Promise<OGMeta | null> {
  try {
    const project = await getProjectBySlug(slug);
    if (!project) return null;

    return {
      title: `${project.name} by ${project.builderName} | ${SITE_NAME}`,
      description: project.description?.substring(0, 200) || 
        `Explore ${project.name} - ${project.configurations || ""} apartments in ${project.location}, ${project.city}. Price starting from ${project.priceRange || "Contact for price"}.`,
      image: toAbsoluteImageUrl(project.coverImage),
      url: `${BASE_URL}/projects/${slug}`,
      type: "article",
    };
  } catch (error) {
    console.error("[OG Meta] Error fetching project:", error);
    return null;
  }
}

export async function getPropertyOGMeta(idOrSlug: string): Promise<OGMeta | null> {
  try {
    // Try to find by slug first, then by ID
    let property = await getPropertyBySlug(idOrSlug);
    
    // If not found by slug, try by ID (for backward compatibility)
    if (!property) {
      const id = parseInt(idOrSlug, 10);
      if (!isNaN(id)) {
        property = await getPropertyById(id);
      }
    }
    
    if (!property) return null;

    const slug = property.slug || property.id.toString();
    
    return {
      title: `${property.title} | ${SITE_NAME}`,
      description: property.description?.substring(0, 200) || 
        `${property.bedrooms} BHK ${property.propertyType} in ${property.location}. Price: ₹${property.price}`,
      image: toAbsoluteImageUrl(property.imageUrl),
      url: `${BASE_URL}/properties/${slug}`,
      type: "article",
    };
  } catch (error) {
    console.error("[OG Meta] Error fetching property:", error);
    return null;
  }
}

export function generateOGMetaTags(meta: OGMeta): string {
  return `
    <!-- Dynamic Open Graph / Facebook -->
    <meta property="og:type" content="${meta.type}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:url" content="${meta.url}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(meta.title)}">
    <meta name="twitter:description" content="${escapeHtml(meta.description)}">
    <meta name="twitter:image" content="${meta.image}">
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Check if request is from a social media crawler
 */
export function isSocialMediaCrawler(userAgent: string): boolean {
  const crawlers = [
    "facebookexternalhit",
    "Facebot",
    "Twitterbot",
    "WhatsApp",
    "LinkedInBot",
    "Pinterest",
    "Slackbot",
    "TelegramBot",
    "Discordbot",
    "Googlebot",
    "bingbot",
  ];
  
  return crawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}
