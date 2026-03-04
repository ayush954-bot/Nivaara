import { Router } from "express";
import fs from "fs";
import path from "path";
import {
  isSocialMediaCrawler,
  getPropertyOGMeta,
  getProjectOGMeta,
  buildOGHtmlPage,
} from "./og-meta";

const router = Router();

/**
 * Read the base index.html template.
 * In development the Vite-processed file isn't available, so we read the
 * source file from client/index.html. In production we use dist/public/index.html.
 */
function getBaseHtml(): string {
  const candidates = [
    // Production build
    path.resolve(import.meta.dirname, "..", "public", "index.html"),
    // Development fallback — source template
    path.resolve(import.meta.dirname, "..", "client", "index.html"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf-8");
    }
  }

  // Minimal fallback if neither file exists
  return `<!doctype html><html><head><title>Nivaara Realty Solutions</title></head><body></body></html>`;
}

// Handle property pages for social media crawlers
router.get("/properties/:slug", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  if (!isSocialMediaCrawler(userAgent)) return next();

  const slug = req.params.slug;
  console.log(
    "[OG Routes] Crawler for property:",
    slug,
    "UA:",
    userAgent.substring(0, 60)
  );

  try {
    const meta = await getPropertyOGMeta(slug);
    if (!meta) {
      console.log("[OG Routes] Property not found:", slug);
      return next();
    }

    const baseHtml = getBaseHtml();
    const html = buildOGHtmlPage(meta, baseHtml);

    res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
  } catch (error) {
    console.error("[OG Routes] Error for property:", slug, error);
    next();
  }
});

// Handle project pages for social media crawlers
router.get("/projects/:slug", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  if (!isSocialMediaCrawler(userAgent)) return next();

  const slug = req.params.slug;
  console.log(
    "[OG Routes] Crawler for project:",
    slug,
    "UA:",
    userAgent.substring(0, 60)
  );

  try {
    const meta = await getProjectOGMeta(slug);
    if (!meta) {
      console.log("[OG Routes] Project not found:", slug);
      return next();
    }

    const baseHtml = getBaseHtml();
    const html = buildOGHtmlPage(meta, baseHtml);

    res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
  } catch (error) {
    console.error("[OG Routes] Error for project:", slug, error);
    next();
  }
});

export { router as ogRoutes };
