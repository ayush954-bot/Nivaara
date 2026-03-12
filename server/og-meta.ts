import {
  getProjectBySlug,
  getPropertyById,
  getPropertyBySlug,
  getCoverImage,
  getPropertyImages,
  getProjectImages,
} from "./db";

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

/** Pick best image for a property: cover > first gallery image > legacy imageUrl > default */
async function getBestPropertyImage(
  propertyId: number,
  legacyImageUrl?: string | null
): Promise<string> {
  try {
    const cover = await getCoverImage(propertyId);
    if (cover?.imageUrl) return toAbsoluteImageUrl(cover.imageUrl);
    const images = await getPropertyImages(propertyId);
    if (images.length > 0 && images[0].imageUrl)
      return toAbsoluteImageUrl(images[0].imageUrl);
  } catch { /* ignore */ }
  return toAbsoluteImageUrl(legacyImageUrl);
}

/** Pick best image for a project: coverImage column > first gallery image > default */
async function getBestProjectImage(
  projectId: number,
  coverImage?: string | null
): Promise<string> {
  if (coverImage) return toAbsoluteImageUrl(coverImage);
  try {
    const images = await getProjectImages(projectId);
    if (images.length > 0 && images[0].imageUrl)
      return toAbsoluteImageUrl(images[0].imageUrl);
  } catch { /* ignore */ }
  return DEFAULT_IMAGE;
}

export async function getProjectOGMeta(slug: string): Promise<OGMeta | null> {
  try {
    const project = await getProjectBySlug(slug);
    if (!project) return null;

    const image = await getBestProjectImage(project.id, project.coverImage);

    return {
      title: `${project.name} by ${project.builderName} | ${SITE_NAME}`,
      description: project.description?.substring(0, 200) ||
        `Explore ${project.name} — ${project.configurations || ""} in ${project.location}, ${project.city}. Starting from ${project.priceRange || "Contact for price"}.`,
      image,
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
    let property = await getPropertyBySlug(idOrSlug);
    if (!property) {
      const id = parseInt(idOrSlug, 10);
      if (!isNaN(id)) property = await getPropertyById(id);
    }
    if (!property) return null;

    const slug = property.slug || property.id.toString();
    const image = await getBestPropertyImage(property.id, property.imageUrl);

    const bedroomStr =
      property.bedrooms && property.bedrooms > 0
        ? `${property.bedrooms} BHK `
        : "";
    const priceStr = property.price
      ? `₹${Number(property.price).toLocaleString("en-IN")}`
      : "Contact for price";

    return {
      title: `${property.title} | ${SITE_NAME}`,
      description:
        property.description?.substring(0, 200) ||
        `${bedroomStr}${property.propertyType} in ${property.location}. Price: ${priceStr}. Listed on Nivaara Realty Solutions.`,
      image,
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
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${meta.url}">

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(meta.title)}">
    <meta name="twitter:description" content="${escapeHtml(meta.description)}">
    <meta name="twitter:image" content="${meta.image}">
  `;
}

/**
 * Build a minimal HTML page that social crawlers will read for OG tags.
 * Injects dynamic meta tags into the base index.html template.
 */
export function buildOGHtmlPage(meta: OGMeta, baseHtml: string): string {
  const ogTags = generateOGMetaTags(meta);

  // Replace static OG block (from <!-- Open Graph --> to last twitter:image tag)
  let html = baseHtml.replace(
    /<!-- Open Graph \/ Facebook -->[\s\S]*?<meta name="twitter:image"[^>]*>/,
    ogTags.trim()
  );

  // Replace static <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Replace static <meta name="description">
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeHtml(meta.description)}">`
  );

  // Replace or inject canonical URL for this specific page
  // This tells Google the authoritative URL for this property/project page
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${meta.url}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${meta.url}" />\n</head>`
    );
  }

  return html;
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
