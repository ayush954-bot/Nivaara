/**
 * Favicon routes — serve favicon files directly from disk or CDN redirect.
 *
 * The Manus platform intercepts /favicon.ico at the infrastructure level and
 * redirects it to the CDN logo PNG. Google's favicon crawler does NOT follow
 * redirects, so it sees a 302 and falls back to the globe icon.
 *
 * This Express router is registered BEFORE any static middleware so it wins
 * the race and returns the file with a direct 200 response.
 */
import { Router } from "express";
import fs from "fs";
import path from "path";

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

/**
 * Try to read the favicon from disk (works in development where client/public is accessible).
 * Falls back to a CDN proxy if the file is not on disk (production build).
 */
function serveFaviconFromDisk(
  filePath: string,
  contentType: string,
  res: import("express").Response,
  cdnFallback: string
) {
  // Try local file first
  const candidates = [
    filePath,
    path.resolve(import.meta.dirname, "..", "client", "public", path.basename(filePath)),
    path.resolve(import.meta.dirname, "public", path.basename(filePath)),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const data = fs.readFileSync(candidate);
      res
        .status(200)
        .set({
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
          "X-Favicon-Source": "disk",
        })
        .send(data);
      return;
    }
  }

  // File not on disk — proxy from CDN so we still return a 200 (not a redirect)
  import("node:https").then(({ get }) => {
    get(cdnFallback, (upstream) => {
      res.status(200).set({
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Favicon-Source": "cdn-proxy",
      });
      upstream.pipe(res);
    }).on("error", () => {
      res.status(404).end();
    });
  });
}

// /favicon.ico — highest priority, must return 200 directly
router.get("/favicon.ico", (req, res) => {
  serveFaviconFromDisk(
    "favicon.ico",
    "image/x-icon",
    res,
    CDN_FAVICON_ICO
  );
});

// /apple-touch-icon.png
router.get("/apple-touch-icon.png", (req, res) => {
  serveFaviconFromDisk(
    "apple-touch-icon.png",
    "image/png",
    res,
    CDN_APPLE_TOUCH
  );
});

// /android-chrome-192x192.png
router.get("/android-chrome-192x192.png", (req, res) => {
  serveFaviconFromDisk(
    "android-chrome-192x192.png",
    "image/png",
    res,
    CDN_FAVICON_192
  );
});

// /android-chrome-512x512.png
router.get("/android-chrome-512x512.png", (req, res) => {
  serveFaviconFromDisk(
    "android-chrome-512x512.png",
    "image/png",
    res,
    CDN_FAVICON_512
  );
});

export { router as faviconRouter };
