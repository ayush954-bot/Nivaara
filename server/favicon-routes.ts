/**
 * Favicon routes — serve favicon files directly from disk or CDN.
 *
 * The Manus platform intercepts /favicon.ico at the infrastructure level and
 * redirects it to the CDN logo PNG. Google's favicon crawler does NOT follow
 * redirects, so it sees a 302 and falls back to the globe icon.
 *
 * This Express router is registered BEFORE any static middleware so it wins
 * the race and returns the file with a direct 200 response.
 *
 * IMPORTANT: When proxying from CDN, we MUST buffer the body and set our own
 * Content-Type header. The CDN returns "application/octet-stream" for .ico
 * files, which causes browsers to download instead of display them.
 */
import { Router, type Response } from "express";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const router = Router();

// Permanent CDN URLs for favicon files (uploaded as webdev assets — same lifecycle as the app)
const CDN_FAVICON_ICO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/favicon_6089ebea.ico";
const CDN_FAVICON_192 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/favicon-192x192_841ee7c1.png";
const CDN_FAVICON_512 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/favicon-512x512_57b97aa1.png";
const CDN_APPLE_TOUCH =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663026719415/aSHZEBwUmWTuA7HAwuTg3z/apple-touch-icon_d2c3ebbe.png";

/** Fetch a URL and return its body as a Buffer */
function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Serve a favicon file.
 * 1. Try to read from disk (development — client/public is present).
 * 2. Fetch from CDN and buffer the body (production — no local files).
 *
 * In both cases we set our own Content-Type so the browser never downloads.
 */
async function serveFavicon(
  filename: string,
  contentType: string,
  res: Response,
  cdnUrl: string
) {
  // Candidate paths on disk
  const candidates = [
    path.resolve(import.meta.dirname, "..", "client", "public", filename),
    path.resolve(import.meta.dirname, "public", filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const data = fs.readFileSync(candidate);
      res
        .status(200)
        .set({
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=86400",
        })
        .send(data);
      return;
    }
  }

  // Not on disk — fetch from CDN and return with correct headers
  try {
    const data = await fetchBuffer(cdnUrl);
    res
      .status(200)
      .set({
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400",
      })
      .send(data);
  } catch {
    res.status(404).end();
  }
}

// /favicon.ico — highest priority, must return 200 with correct Content-Type
router.get("/favicon.ico", (req, res) => {
  serveFavicon("favicon.ico", "image/x-icon", res, CDN_FAVICON_ICO);
});

// /apple-touch-icon.png
router.get("/apple-touch-icon.png", (req, res) => {
  serveFavicon("apple-touch-icon.png", "image/png", res, CDN_APPLE_TOUCH);
});

// /android-chrome-192x192.png
router.get("/android-chrome-192x192.png", (req, res) => {
  serveFavicon("android-chrome-192x192.png", "image/png", res, CDN_FAVICON_192);
});

// /android-chrome-512x512.png
router.get("/android-chrome-512x512.png", (req, res) => {
  serveFavicon("android-chrome-512x512.png", "image/png", res, CDN_FAVICON_512);
});

export { router as faviconRouter };
