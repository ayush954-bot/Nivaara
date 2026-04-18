/**
 * External REST API for Nivaara Realty
 *
 * Allows trusted external applications (e.g. Facebook Messaging App, CRMs)
 * to submit properties including images and video links directly to the website.
 *
 * Authentication: Bearer token (API key) in Authorization header
 *   Authorization: Bearer niv_<random>
 *
 * Endpoints:
 *   POST   /api/ext/properties          - Create a new property listing
 *   GET    /api/ext/properties          - List all properties (brief)
 *   GET    /api/ext/properties/:id      - Get a single property
 *   DELETE /api/ext/properties/:id      - Delete a property
 *
 *   POST   /api/ext/keys               - Generate a new API key  (admin-only via master key)
 *   GET    /api/ext/keys               - List all API keys       (admin-only via master key)
 *   DELETE /api/ext/keys/:id           - Revoke an API key       (admin-only via master key)
 */

import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { apiKeys, properties, propertyImages, propertyVideos } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import multer from "multer";
import https from "https";
import http from "http";

const router = Router();

// ─── Multer (multipart image upload, memory storage) ─────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    nanoid(6)
  );
}

/** Fetch a remote image URL and return a Buffer */
function fetchRemoteImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchRemoteImage(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} fetching image`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/** Upload a buffer to S3 and return the public URL */
async function uploadImageBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const key = `external-api/property-images/${Date.now()}-${nanoid(10)}.${ext}`;
  const { url } = await storagePut(key, buffer, mimeType);
  return url;
}

// ─── Master key (env var) for key management ─────────────────────────────────

function getMasterKey(): string {
  return ENV.externalApiMasterKey || process.env.EXTERNAL_API_MASTER_KEY || "";
}

// ─── Middleware: validate API key ─────────────────────────────────────────────

async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    res.status(401).json({ error: "Missing Authorization header. Use: Authorization: Bearer <api_key>" });
    return;
  }

  // Check master key first (for key management endpoints)
  const masterKey = getMasterKey();
  if (masterKey && token === masterKey) {
    (req as any).isMaster = true;
    next();
    return;
  }

  // Check database keys
  const hash = sha256(token);
  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [key] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash)).limit(1);

  if (!key || !key.isActive) {
    res.status(401).json({ error: "Invalid or revoked API key" });
    return;
  }

  // Update lastUsedAt (fire-and-forget)
  db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id)).catch(() => {});

  (req as any).apiKey = key;
  next();
}

/** Middleware: only master key can manage keys */
function requireMaster(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).isMaster) {
    res.status(403).json({ error: "This endpoint requires the master API key" });
    return;
  }
  next();
}

// ─── Key Management ───────────────────────────────────────────────────────────

/** POST /api/ext/keys — Generate a new API key */
router.post("/api/ext/keys", requireApiKey, requireMaster, async (req: Request, res: Response) => {
  const { label } = req.body as { label?: string };
  if (!label?.trim()) {
    res.status(400).json({ error: "label is required" });
    return;
  }

  const rawKey = "niv_" + nanoid(32);
  const hash = sha256(rawKey);
  const prefix = rawKey.slice(0, 12);

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  await db.insert(apiKeys).values({ keyHash: hash, keyPrefix: prefix, label: label.trim() });

  res.status(201).json({
    message: "API key created. Store this key securely — it will not be shown again.",
    key: rawKey,
    prefix,
    label: label.trim(),
  });
});

/** GET /api/ext/keys — List all API keys (hashes hidden) */
router.get("/api/ext/keys", requireApiKey, requireMaster, async (_req: Request, res: Response) => {
  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      prefix: apiKeys.keyPrefix,
      label: apiKeys.label,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .orderBy(apiKeys.createdAt);

  res.json({ keys });
});

/** DELETE /api/ext/keys/:id — Revoke an API key */
router.delete("/api/ext/keys/:id", requireApiKey, requireMaster, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid key id" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id));
  res.json({ message: "API key revoked" });
});

// ─── Property Endpoints ───────────────────────────────────────────────────────

/**
 * POST /api/ext/properties
 *
 * Content-Type: application/json  OR  multipart/form-data
 *
 * JSON body fields:
 *   title*          string
 *   description*    string
 *   propertyType*   "Flat"|"Shop"|"Office"|"Land"|"Rental"|"Bank Auction"
 *   status*         "Under-Construction"|"Ready"|"Sold"
 *   location*       string  (e.g. "Kharadi, Pune")
 *   price*          number  (in INR)
 *   priceLabel      string  (e.g. "₹45L")
 *   bedrooms        number
 *   bathrooms       number
 *   area_sqft       number
 *   area            string  (locality name)
 *   builder         string
 *   badge           string
 *   featured        boolean
 *   listingStatus   "published"|"pending_review"  (default: "pending_review")
 *
 *   // Images (choose one approach per request):
 *   imageUrls       string[]  — array of public image URLs to download & re-upload
 *   coverImageUrl   string    — single cover image URL
 *
 *   // Videos:
 *   videoLinks      Array<{ url: string, type?: "youtube"|"vimeo"|"virtual_tour"|"other" }>
 *
 * Multipart:
 *   All JSON fields as form fields + files[] as image files (up to 10)
 */
router.post(
  "/api/ext/properties",
  requireApiKey,
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      let body: Record<string, any>;

      // Support both JSON and multipart
      if (req.is("multipart/form-data")) {
        body = { ...req.body };
        // Parse JSON-encoded fields that may come as strings in multipart
        for (const field of ["imageUrls", "videoLinks"]) {
          if (typeof body[field] === "string") {
            try { body[field] = JSON.parse(body[field]); } catch { /* ignore */ }
          }
        }
      } else {
        body = req.body;
      }

      // ── Validate required fields ──────────────────────────────────────────
      const required = ["title", "description", "propertyType", "status", "location", "price"];
      for (const f of required) {
        if (!body[f]) {
          res.status(400).json({ error: `Missing required field: ${f}` });
          return;
        }
      }

      const validTypes = ["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"];
      if (!validTypes.includes(body.propertyType)) {
        res.status(400).json({ error: `propertyType must be one of: ${validTypes.join(", ")}` });
        return;
      }

      const validStatuses = ["Under-Construction", "Ready", "Sold"];
      if (!validStatuses.includes(body.status)) {
        res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      // ── Build property record ─────────────────────────────────────────────
      const slug = generateSlug(body.title);
      const listingStatus = body.listingStatus === "published" ? "published" : "pending_review";

      const propertyData = {
        slug,
        title: String(body.title),
        description: String(body.description),
        propertyType: body.propertyType as any,
        status: body.status as any,
        location: String(body.location),
        price: String(parseFloat(body.price)),
        priceLabel: body.priceLabel ? String(body.priceLabel) : null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms, 10) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms, 10) : null,
        area_sqft: body.area_sqft ? parseInt(body.area_sqft, 10) : null,
        area: body.area ? String(body.area) : null,
        builder: body.builder ? String(body.builder) : null,
        badge: body.badge ? String(body.badge) : null,
        featured: body.featured === true || body.featured === "true",
        listingSource: "staff" as const,
        listingStatus: listingStatus as any,
      };

      const [insertResult] = await db.insert(properties).values(propertyData);
      const propertyId = Number((insertResult as any).insertId);

      // ── Handle images ─────────────────────────────────────────────────────
      const uploadedImageUrls: string[] = [];

      // 1. Multipart file uploads
      const files = (req.files as Express.Multer.File[]) ?? [];
      for (const file of files) {
        const url = await uploadImageBuffer(file.buffer, file.mimetype);
        uploadedImageUrls.push(url);
      }

      // 2. Remote image URLs (download + re-upload to S3)
      const remoteUrls: string[] = Array.isArray(body.imageUrls)
        ? body.imageUrls
        : body.coverImageUrl
        ? [body.coverImageUrl]
        : [];

      for (const remoteUrl of remoteUrls) {
        try {
          const buf = await fetchRemoteImage(remoteUrl);
          // Detect mime type from URL extension
          const ext = remoteUrl.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
          const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
          const url = await uploadImageBuffer(buf, mime);
          uploadedImageUrls.push(url);
        } catch (err) {
          console.warn(`[ExtAPI] Failed to fetch image ${remoteUrl}:`, (err as Error).message);
        }
      }

      // Insert image records
      for (let i = 0; i < uploadedImageUrls.length; i++) {
        await db.insert(propertyImages).values({
          propertyId,
          imageUrl: uploadedImageUrls[i],
          isCover: i === 0,
          displayOrder: i,
        });
      }

      // Also set imageUrl on the property itself (legacy cover field)
      if (uploadedImageUrls.length > 0) {
        await db.update(properties).set({ imageUrl: uploadedImageUrls[0] }).where(eq(properties.id, propertyId));
      }

      // ── Handle video links ────────────────────────────────────────────────
      const videoLinks: Array<{ url: string; type?: string }> = Array.isArray(body.videoLinks)
        ? body.videoLinks
        : body.videoUrl
        ? [{ url: body.videoUrl }]
        : [];

      for (let i = 0; i < videoLinks.length; i++) {
        const v = videoLinks[i];
        if (!v?.url) continue;
        const validVideoTypes = ["youtube", "vimeo", "virtual_tour", "other"];
        const videoType = validVideoTypes.includes(v.type ?? "") ? (v.type as any) : "youtube";
        await db.insert(propertyVideos).values({
          propertyId,
          videoUrl: v.url,
          videoType,
          displayOrder: i,
        });
      }

      res.status(201).json({
        message: "Property created successfully",
        propertyId,
        slug,
        url: `https://nivaararealty.com/properties/${slug}`,
        listingStatus,
        imagesUploaded: uploadedImageUrls.length,
        videosAdded: videoLinks.filter((v) => v?.url).length,
      });
    } catch (err) {
      console.error("[ExtAPI] Create property error:", err);
      res.status(500).json({ error: "Internal server error", detail: (err as Error).message });
    }
  }
);

/** GET /api/ext/properties — List all properties */
router.get("/api/ext/properties", requireApiKey, async (_req: Request, res: Response) => {
  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const rows = await db
    .select({
      id: properties.id,
      slug: properties.slug,
      title: properties.title,
      propertyType: properties.propertyType,
      status: properties.status,
      location: properties.location,
      price: properties.price,
      listingStatus: properties.listingStatus,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .orderBy(properties.createdAt);

  res.json({ count: rows.length, properties: rows });
});

/** GET /api/ext/properties/:id — Get a single property */
router.get("/api/ext/properties/:id", requireApiKey, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid property id" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [prop] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, id));
  const videos = await db.select().from(propertyVideos).where(eq(propertyVideos.propertyId, id));

  res.json({ property: prop, images, videos });
});

/** DELETE /api/ext/properties/:id — Delete a property */
router.delete("/api/ext/properties/:id", requireApiKey, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid property id" });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [prop] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, id)).limit(1);
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
  await db.delete(propertyVideos).where(eq(propertyVideos.propertyId, id));
  await db.delete(properties).where(eq(properties.id, id));

  res.json({ message: "Property deleted" });
});

export { router as externalApiRouter };
