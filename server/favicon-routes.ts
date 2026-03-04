/**
 * Favicon routes — serve favicon files from /api/favicon/* paths.
 *
 * The Manus platform intercepts /favicon.ico at the Cloudflare edge and
 * returns a 302 redirect to a CDN PNG with Content-Type: application/octet-stream.
 * This causes browsers to download the file instead of displaying it as a favicon.
 *
 * WORKAROUND: We serve favicons from /api/favicon/* paths which Cloudflare does
 * NOT intercept. The HTML <link rel="icon"> tags point to these paths instead of
 * /favicon.ico. We also embed a base64 data URI as the primary favicon in the HTML
 * so the favicon loads instantly without any network request.
 *
 * Routes:
 *   /api/favicon/icon.ico   → ICO file (16/32/48 multi-size)
 *   /api/favicon/icon.png   → 32x32 PNG
 *   /api/favicon/192.png    → 192x192 PNG
 *   /api/favicon/512.png    → 512x512 PNG
 *   /api/favicon/apple.png  → 180x180 Apple Touch Icon
 */
import { Router, type Response } from "express";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const router = Router();

// CDN URLs (webdev assets — same lifecycle as the app)
const CDN_URLS: Record<string, string> = {
  "icon.ico":
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/nivaara-favicon_f6f77975.ico",
  "icon.png":
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/nivaara-favicon-32x32_00a228ec.png",
  "192.png":
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/nivaara-favicon-192x192_cdee1fbb.png",
  "512.png":
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/nivaara-favicon-512x512_c757d504.png",
  "apple.png":
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/nivaara-favicon-180x180_339a2146.png",
};

// Local file names mapping
const LOCAL_FILES: Record<string, string> = {
  "icon.ico": "nivaara-favicon.ico",
  "icon.png": "nivaara-favicon-32x32.png",
  "192.png": "nivaara-favicon-192x192.png",
  "512.png": "nivaara-favicon-512x512.png",
  "apple.png": "nivaara-favicon-180x180.png",
};

// Content types
const CONTENT_TYPES: Record<string, string> = {
  "icon.ico": "image/x-icon",
  "icon.png": "image/png",
  "192.png": "image/png",
  "512.png": "image/png",
  "apple.png": "image/png",
};

/** Fetch a URL and return its body as a Buffer */
function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        // Follow redirects
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

// In-memory cache to avoid repeated CDN fetches
const cache = new Map<string, Buffer>();

/**
 * Serve a favicon file.
 * 1. Check in-memory cache
 * 2. Try to read from disk (development — client/public is present)
 * 3. Fetch from CDN, buffer the body, cache it, and serve with correct headers
 */
async function serveFavicon(key: string, res: Response) {
  const contentType = CONTENT_TYPES[key];
  if (!contentType) {
    res.status(404).end();
    return;
  }

  // Check cache first
  const cached = cache.get(key);
  if (cached) {
    res
      .status(200)
      .set({
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": String(cached.length),
      })
      .send(cached);
    return;
  }

  // Try disk
  const localName = LOCAL_FILES[key];
  if (localName) {
    const candidates = [
      path.resolve(import.meta.dirname, "..", "client", "public", localName),
      path.resolve(import.meta.dirname, "public", localName),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const data = fs.readFileSync(candidate);
        cache.set(key, data);
        res
          .status(200)
          .set({
            "Content-Type": contentType,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=604800, immutable",
            "Content-Length": String(data.length),
          })
          .send(data);
        return;
      }
    }
  }

  // Fetch from CDN
  const cdnUrl = CDN_URLS[key];
  if (!cdnUrl) {
    res.status(404).end();
    return;
  }

  try {
    const data = await fetchBuffer(cdnUrl);
    cache.set(key, data);
    res
      .status(200)
      .set({
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": String(data.length),
      })
      .send(data);
  } catch {
    res.status(404).end();
  }
}

// Register routes under /api/favicon/*
router.get("/api/favicon/icon.ico", (_req, res) => serveFavicon("icon.ico", res));
router.get("/api/favicon/icon.png", (_req, res) => serveFavicon("icon.png", res));
router.get("/api/favicon/192.png", (_req, res) => serveFavicon("192.png", res));
router.get("/api/favicon/512.png", (_req, res) => serveFavicon("512.png", res));
router.get("/api/favicon/apple.png", (_req, res) => serveFavicon("apple.png", res));

// Also keep the /favicon.ico route for development (where Cloudflare doesn't interfere)
router.get("/favicon.ico", (_req, res) => serveFavicon("icon.ico", res));

export { router as faviconRouter };
