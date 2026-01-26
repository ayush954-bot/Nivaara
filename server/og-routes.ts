import { Router } from "express";
import fs from "fs";
import path from "path";
import { isSocialMediaCrawler } from "./og-meta";

const router = Router();

/**
 * Middleware to serve pre-generated static HTML files with correct OG meta tags
 * for social media crawlers. These files are generated during the build process.
 */

// Get the dist/public path based on environment
function getPublicPath(): string {
  if (process.env.NODE_ENV === "development") {
    return path.resolve(import.meta.dirname, "..", "dist", "public");
  }
  // In production, the built file is at dist/public/
  return path.resolve(import.meta.dirname, "..", "public");
}

// Handle project pages for social media crawlers
router.get("/projects/:slug", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  
  // Only intercept for social media crawlers
  if (!isSocialMediaCrawler(userAgent)) {
    return next();
  }
  
  const slug = req.params.slug;
  console.log("[OG Routes] Social crawler detected for project:", slug, "UA:", userAgent.substring(0, 50));
  
  try {
    // Try to serve the pre-generated static HTML file
    const publicPath = getPublicPath();
    const staticFilePath = path.join(publicPath, "projects", slug, "index.html");
    
    console.log("[OG Routes] Looking for static file:", staticFilePath);
    
    if (fs.existsSync(staticFilePath)) {
      console.log("[OG Routes] Serving pre-generated static file for project:", slug);
      const html = await fs.promises.readFile(staticFilePath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
      return;
    }
    
    console.log("[OG Routes] Static file not found, falling through:", staticFilePath);
    next();
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
  
  const slug = req.params.slug;
  console.log("[OG Routes] Social crawler detected for property:", slug, "UA:", userAgent.substring(0, 50));
  
  try {
    // Try to serve the pre-generated static HTML file
    const publicPath = getPublicPath();
    const staticFilePath = path.join(publicPath, "properties", slug, "index.html");
    
    console.log("[OG Routes] Looking for static file:", staticFilePath);
    
    if (fs.existsSync(staticFilePath)) {
      console.log("[OG Routes] Serving pre-generated static file for property:", slug);
      const html = await fs.promises.readFile(staticFilePath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
      return;
    }
    
    console.log("[OG Routes] Static file not found, falling through:", staticFilePath);
    next();
  } catch (error) {
    console.error("[OG Routes] Error:", error);
    next();
  }
});

export { router as ogRoutes };
