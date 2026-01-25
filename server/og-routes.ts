import { Router } from "express";
import fs from "fs";
import path from "path";
import { getProjectOGMeta, getPropertyOGMeta, generateOGMetaTags, isSocialMediaCrawler } from "./og-meta";

const router = Router();

/**
 * Middleware to handle social media crawlers for project and property pages
 * This runs BEFORE static file serving to intercept crawler requests
 */

// Get the index.html path based on environment
function getIndexHtmlPath(): string {
  if (process.env.NODE_ENV === "development") {
    // In development, og-routes.ts is in server/, so go up one level to project root, then into client/
    return path.resolve(import.meta.dirname, "..", "client", "index.html");
  }
  // In production, the built file is in dist/, and public/ is at dist/public/
  return path.resolve(import.meta.dirname, "..", "public", "index.html");
}

// Replace OG tags in HTML
function replaceOGTags(html: string, newTags: string): string {
  let result = html;
  
  // Remove existing og: meta tags
  result = result.replace(/<meta property="og:[^"]*"[^>]*>\s*/g, "");
  
  // Remove twitter: meta tags
  result = result.replace(/<meta name="twitter:[^"]*"[^>]*>\s*/g, "");
  
  // Remove the comment markers
  result = result.replace(/<!-- Open Graph \/ Facebook -->\s*/g, "");
  result = result.replace(/<!-- Twitter -->\s*/g, "");
  
  // Insert new tags before </head>
  result = result.replace("</head>", `${newTags}\n  </head>`);
  
  return result;
}

// Handle project pages for social media crawlers
router.get("/projects/:slug", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  
  // Only intercept for social media crawlers
  if (!isSocialMediaCrawler(userAgent)) {
    return next();
  }
  
  console.log("[OG Routes] Social crawler detected for project:", req.params.slug);
  
  try {
    const meta = await getProjectOGMeta(req.params.slug);
    if (!meta) {
      console.log("[OG Routes] Project not found:", req.params.slug);
      return next();
    }
    
    const indexPath = getIndexHtmlPath();
    let html = await fs.promises.readFile(indexPath, "utf-8");
    
    const ogTags = generateOGMetaTags(meta);
    html = replaceOGTags(html, ogTags);
    
    console.log("[OG Routes] Serving dynamic OG for project:", meta.title);
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (error) {
    console.error("[OG Routes] Error:", error);
    next();
  }
});

// Handle property pages for social media crawlers
router.get("/properties/:slug", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  
  // Only intercept for social media crawlers
  if (!isSocialMediaCrawler(userAgent)) {
    return next();
  }
  
  console.log("[OG Routes] Social crawler detected for property:", req.params.slug);
  
  try {
    const meta = await getPropertyOGMeta(req.params.slug);
    if (!meta) {
      console.log("[OG Routes] Property not found:", req.params.slug);
      return next();
    }
    
    const indexPath = getIndexHtmlPath();
    let html = await fs.promises.readFile(indexPath, "utf-8");
    
    const ogTags = generateOGMetaTags(meta);
    html = replaceOGTags(html, ogTags);
    
    console.log("[OG Routes] Serving dynamic OG for property:", meta.title);
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (error) {
    console.error("[OG Routes] Error:", error);
    next();
  }
});

export { router as ogRoutes };
