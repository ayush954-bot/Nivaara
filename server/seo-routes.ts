/**
 * SEO Routes
 *
 * 1. /api/google-favicon — Serves the Nivaara logo PNG with Content-Disposition: inline
 *    so Google's favicon crawler (which follows redirects) gets a proper image response.
 *    Referenced in JSON-LD Organization schema and HTML <link rel="icon">.
 *
 * 2. /sitemap.xml — Dynamic sitemap including all static pages + individual property/project URLs.
 *
 * 3. /robots.txt — Overrides the static robots.txt to explicitly allow Googlebot on all paths.
 */
import { Router } from "express";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { getDb } from "./db";
import { properties, projects } from "../drizzle/schema";
import { ne } from "drizzle-orm";

const router = Router();

// ─── Google Favicon ──────────────────────────────────────────────────────────

// The platform's /favicon.ico redirects to a CDN file with Content-Disposition: attachment.
// Google's favicon crawler follows redirects and rejects files with attachment disposition.
// This route serves the same logo with Content-Disposition: inline so Google accepts it.

let faviconCache: Buffer | null = null;

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function getFaviconBuffer(): Promise<Buffer> {
  if (faviconCache) return faviconCache;

  // Try reading from disk first (available in both dev and prod)
  const candidates = [
    path.resolve(import.meta.dirname, "..", "client", "public", "android-chrome-512x512.png"),
    path.resolve(import.meta.dirname, "public", "android-chrome-512x512.png"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      faviconCache = fs.readFileSync(p);
      return faviconCache;
    }
  }

  // Fallback: fetch from S3 (uploaded via storagePut with correct headers)
  const s3Url = "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/favicon/nivaara-logo-512x512.png";
  faviconCache = await fetchBuffer(s3Url);
  return faviconCache;
}

router.get("/api/google-favicon", async (_req, res) => {
  try {
    const data = await getFaviconBuffer();
    res
      .status(200)
      .set({
        "Content-Type": "image/png",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": String(data.length),
      })
      .send(data);
  } catch {
    res.status(404).end();
  }
});

// ─── Dynamic Sitemap ─────────────────────────────────────────────────────────

const STATIC_PAGES = [
  "/",
  "/about",
  "/services",
  "/properties",
  "/projects",
  "/team",
  "/contact",
  "/faq",
  "/locations",
  "/privacy-policy",
];

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const now = new Date().toISOString();
    const baseUrl = "https://nivaararealty.com";

    // Fetch all published properties and projects
    const db = await getDb();
    const [approvedProperties, approvedProjects] = db
      ? await Promise.all([
          db.select({ slug: properties.slug }).from(properties).where(ne(properties.listingStatus, "rejected")),
          db.select({ slug: projects.slug }).from(projects).where(ne(projects.status, "Sold Out")),
        ])
      : [[], []];

    const staticUrls = STATIC_PAGES.map(
      (p) => `
  <url>
    <loc>${baseUrl}${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${p === "/" ? "1.0" : "0.8"}</priority>
  </url>`
    ).join("");

    const propertyUrls = approvedProperties
      .filter((p: { slug: string | null }) => p.slug)
      .map(
        (p: { slug: string | null }) => `
  <url>
    <loc>${baseUrl}/properties/${p.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join("");

    const projectUrls = approvedProjects
      .filter((p: { slug: string | null }) => p.slug)
      .map(
        (p: { slug: string | null }) => `
  <url>
    <loc>${baseUrl}/projects/${p.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${propertyUrls}${projectUrls}
</urlset>`;

    res
      .status(200)
      .set({
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      })
      .send(xml);
  } catch (err) {
    console.error("[SEO] Sitemap error:", err);
    res.status(500).end();
  }
});

// ─── Robots.txt ──────────────────────────────────────────────────────────────

router.get("/robots.txt", (req, res) => {
  const host = req.hostname || "";
  // On manus.space staging domain, block all crawlers
  if (host.includes("manus.space") || host.includes("manus.computer")) {
    const txt = `User-Agent: *\nDisallow: /\n`;
    return res.status(200).set({ "Content-Type": "text/plain" }).send(txt);
  }
  const txt = `User-Agent: *
Allow: /
Allow: /favicon.ico
Allow: /api/google-favicon
Disallow: /api/trpc/
Disallow: /api/oauth/
Disallow: /staff/
Disallow: /admin/

Sitemap: https://nivaararealty.com/sitemap.xml
`;
  res.status(200).set({ "Content-Type": "text/plain", "Cache-Control": "public, max-age=86400" }).send(txt);
});

export { router as seoRoutes };
