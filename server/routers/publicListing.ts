import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  properties,
  projects,
  propertyImages,
  projectImages,
  projectAmenities,
  projectFloorPlans,
  projectVideos,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { nanoid } from "nanoid";

// Helper: verify Firebase ID token server-side via Firebase REST API
async function verifyFirebaseToken(token: string): Promise<string> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase not configured");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    }
  );
  if (!res.ok) throw new Error("Invalid or expired OTP session. Please verify again.");
  const data = await res.json() as { users?: { phoneNumber?: string }[] };
  const phoneNumber = data?.users?.[0]?.phoneNumber;
  if (!phoneNumber) throw new Error("Could not extract phone number from token.");
  return phoneNumber;
}

// Helper: check admin access
function requireAdmin(ctx: { user?: { role?: string } | null; staff?: { role?: string } | null }) {
  const isOAuthAdmin = ctx.user?.role === "admin";
  const isStaffPropertyManager = ctx.staff?.role === "property_manager";
  if (!isOAuthAdmin && !isStaffPropertyManager) {
    throw new Error("Admin access is required.");
  }
}

export const publicListingRouter = router({
  // Upload a file for a public listing (base64 → S3)
  uploadFile: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        base64Data: z.string().max(15_000_000), // ~10MB base64
        firebaseToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await verifyFirebaseToken(input.firebaseToken);

      const buffer = Buffer.from(input.base64Data, "base64");
      if (buffer.byteLength > 10 * 1024 * 1024) {
        throw new Error("File exceeds the 10 MB limit.");
      }

      const ext = input.fileName.split(".").pop() || "jpg";
      const key = `public-listings/${nanoid(12)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url };
    }),

  // Submit a public property listing (mirrors admin PropertyForm exactly)
  submitProperty: publicProcedure
    .input(
      z.object({
        // Basic
        title: z.string().min(1),
        description: z.string().min(1),
        propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]),
        status: z.enum(["Under-Construction", "Ready"]),
        // Location
        location: z.string().min(1),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        area: z.string().optional(),
        // Pricing
        price: z.number().positive(),
        priceLabel: z.string().optional(),
        // Details
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        area_sqft: z.number().optional(),
        builder: z.string().optional(),
        // Media
        imageUrls: z.array(z.string()).max(20),
        videoUrls: z.array(z.object({
          videoUrl: z.string(),
          videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]),
          displayOrder: z.number(),
        })).optional(),
        brochureUrl: z.string().optional(),
        // Badge
        badge: z.string().optional(),
        customBadgeText: z.string().optional(),
        // Submitter
        submitterPhone: z.string().min(1),
        submitterName: z.string().min(1),
        firebaseToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await verifyFirebaseToken(input.firebaseToken);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { imageUrls, videoUrls, firebaseToken, ...rest } = input;

      const [result] = await db
        .insert(properties)
        .values({
          title: rest.title,
          description: rest.description,
          propertyType: rest.propertyType,
          status: rest.status,
          location: rest.location,
          latitude: rest.latitude?.toString() ?? null,
          longitude: rest.longitude?.toString() ?? null,
          area: rest.area ?? null,
          price: rest.price.toString(),
          priceLabel: rest.priceLabel ?? null,
          bedrooms: rest.bedrooms ?? null,
          bathrooms: rest.bathrooms ?? null,
          area_sqft: rest.area_sqft ?? null,
          builder: rest.builder ?? null,
          imageUrl: imageUrls[0] || null,
          brochureUrl: rest.brochureUrl ?? null,
          badge: rest.badge ?? null,
          customBadgeText: rest.customBadgeText ?? null,
          submitterPhone: rest.submitterPhone,
          submitterName: rest.submitterName,
          listingSource: "public",
          listingStatus: "pending_review",
          featured: false,
        });

      const propertyId = (result as { insertId: number }).insertId;

      // Insert all images into property_images table
      if (imageUrls.length > 0) {
        await db.insert(propertyImages).values(
          imageUrls.map((url, i) => ({
            propertyId,
            imageUrl: url,
            isCover: i === 0,
            displayOrder: i,
          }))
        );
      }

      try {
        await notifyOwner({
          title: "New Public Property Listing",
          content: `${rest.submitterName} (${rest.submitterPhone}) submitted:\n"${rest.title}" in ${rest.location}\nPrice: ₹${rest.price}`,
        });
      } catch {}

      return { success: true, propertyId };
    }),

  // Submit a public project listing (mirrors admin ProjectForm exactly)
  submitProject: publicProcedure
    .input(
      z.object({
        // Basic
        name: z.string().min(1),
        builderName: z.string().min(1),
        description: z.string().min(1),
        // Location
        location: z.string().min(1),
        city: z.string().min(1),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        // Status & Pricing
        status: z.enum(["Upcoming", "Under Construction", "Ready to Move"]),
        priceRange: z.string().min(1),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        // Details
        configurations: z.string().optional(),
        reraNumber: z.string().optional(),
        possessionDate: z.string().optional(),
        totalUnits: z.number().optional(),
        towers: z.number().optional(),
        floors: z.number().optional(),
        // Media
        imageUrls: z.array(z.string()).max(20),
        videoUrl: z.string().optional(),
        brochureUrl: z.string().optional(),
        masterPlanUrl: z.string().optional(),
        videos: z.array(z.object({
          videoUrl: z.string(),
          videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]),
          title: z.string(),
          displayOrder: z.number(),
        })).optional(),
        // Builder info
        builderDescription: z.string().optional(),
        builderLogo: z.string().optional(),
        builderEstablished: z.number().optional(),
        builderProjects: z.number().optional(),
        // Badge
        badge: z.string().optional(),
        customBadgeText: z.string().optional(),
        // Amenities
        amenities: z.array(z.object({
          name: z.string(),
          icon: z.string(),
          imageUrl: z.string().optional(),
          displayOrder: z.number(),
        })).optional(),
        // Floor plans
        floorPlans: z.array(z.object({
          name: z.string(),
          bedrooms: z.number(),
          bathrooms: z.number(),
          area: z.number(),
          price: z.number(),
          imageUrl: z.string().optional(),
          displayOrder: z.number(),
        })).optional(),
        // Submitter
        submitterPhone: z.string().min(1),
        submitterName: z.string().min(1),
        firebaseToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await verifyFirebaseToken(input.firebaseToken);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { imageUrls, videos, amenities, floorPlans, firebaseToken, ...rest } = input;

      // Generate a URL-friendly slug from project name
      const slug = rest.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + nanoid(6);

      const [result] = await db
        .insert(projects)
        .values({
          name: rest.name,
          builderName: rest.builderName,
          description: rest.description,
          location: rest.location,
          city: rest.city,
          latitude: rest.latitude?.toString() ?? null,
          longitude: rest.longitude?.toString() ?? null,
          status: rest.status,
          priceRange: rest.priceRange,
          minPrice: rest.minPrice?.toString() ?? null,
          maxPrice: rest.maxPrice?.toString() ?? null,
          configurations: rest.configurations ?? null,
          reraNumber: rest.reraNumber ?? null,
          possessionDate: rest.possessionDate ? new Date(rest.possessionDate) : null,
          totalUnits: rest.totalUnits ?? null,
          towers: rest.towers ?? null,
          floors: rest.floors ?? null,
          coverImage: imageUrls[0] || null,
          videoUrl: rest.videoUrl ?? null,
          brochureUrl: rest.brochureUrl ?? null,
          masterPlanUrl: rest.masterPlanUrl ?? null,
          builderDescription: rest.builderDescription ?? null,
          builderLogo: rest.builderLogo ?? null,
          builderEstablished: rest.builderEstablished ?? null,
          builderProjects: rest.builderProjects ?? null,
          badge: rest.badge ?? null,
          customBadgeText: rest.customBadgeText ?? null,
          submitterPhone: rest.submitterPhone,
          submitterName: rest.submitterName,
          slug,
          listingSource: "public",
          listingStatus: "pending_review",
          featured: false,
        });

      const projectId = (result as { insertId: number }).insertId;

      // Insert gallery images
      if (imageUrls.length > 0) {
        await db.insert(projectImages).values(
          imageUrls.map((url, i) => ({
            projectId,
            imageUrl: url,
            caption: "",
            displayOrder: i,
          }))
        );
      }

      // Insert videos
      if (videos && videos.length > 0) {
        await db.insert(projectVideos).values(
          videos.map((v) => ({
            projectId,
            videoUrl: v.videoUrl,
            videoType: v.videoType,
            title: v.title,
            displayOrder: v.displayOrder,
          }))
        );
      }

      // Insert amenities
      if (amenities && amenities.length > 0) {
        await db.insert(projectAmenities).values(
          amenities.map((a) => ({
            projectId,
            name: a.name,
            icon: a.icon,
            imageUrl: a.imageUrl ?? null,
            displayOrder: a.displayOrder,
          }))
        );
      }

      // Insert floor plans
      if (floorPlans && floorPlans.length > 0) {
        await db.insert(projectFloorPlans).values(
          floorPlans.map((fp) => ({
            projectId,
            name: fp.name,
            bedrooms: fp.bedrooms,
            bathrooms: fp.bathrooms,
            area: fp.area,
            price: fp.price.toString(),
            imageUrl: fp.imageUrl ?? null,
            displayOrder: fp.displayOrder,
          }))
        );
      }

      try {
        await notifyOwner({
          title: "New Public Project Listing",
          content: `${rest.submitterName} (${rest.submitterPhone}) submitted:\n"${rest.name}" by ${rest.builderName} in ${rest.location}, ${rest.city}`,
        });
      } catch {}

      return { success: true, projectId };
    }),

  // Admin: list all pending submissions
  adminListPending: publicProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const db = await getDb();
    if (!db) return { properties: [], projects: [] };

    const [pendingProperties, pendingProjects] = await Promise.all([
      db.select().from(properties).where(eq(properties.listingStatus, "pending_review")),
      db.select().from(projects).where(eq(projects.listingStatus, "pending_review")),
    ]);
    return { properties: pendingProperties, projects: pendingProjects };
  }),

  // Admin: approve a property
  approveProperty: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(properties).set({ listingStatus: "published" }).where(eq(properties.id, input.id));
      return { success: true };
    }),

  // Admin: reject a property
  rejectProperty: publicProcedure
    .input(z.object({ id: z.number(), reason: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(properties)
        .set({ listingStatus: "rejected", rejectionReason: input.reason })
        .where(eq(properties.id, input.id));
      return { success: true };
    }),

  // Admin: approve a project
  approveProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(projects).set({ listingStatus: "published" }).where(eq(projects.id, input.id));
      return { success: true };
    }),

  // Admin: reject a project
  rejectProject: publicProcedure
    .input(z.object({ id: z.number(), reason: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(projects)
        .set({ listingStatus: "rejected", rejectionReason: input.reason })
        .where(eq(projects.id, input.id));
      return { success: true };
    }),

  // Public: get my listings by phone number (verified via Firebase token)
  getMyListings: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);

      const db = await getDb();
      if (!db) return { properties: [], projects: [] };

      const [myProperties, myProjects] = await Promise.all([
        db
          .select({
            id: properties.id,
            slug: properties.slug,
            title: properties.title,
            propertyType: properties.propertyType,
            status: properties.status,
            location: properties.location,
            price: properties.price,
            imageUrl: properties.imageUrl,
            listingStatus: properties.listingStatus,
            rejectionReason: properties.rejectionReason,
            createdAt: properties.createdAt,
          })
          .from(properties)
          .where(eq(properties.submitterPhone, phone)),
        db
          .select({
            id: projects.id,
            slug: projects.slug,
            name: projects.name,
            builderName: projects.builderName,
            location: projects.location,
            city: projects.city,
            status: projects.status,
            priceRange: projects.priceRange,
            coverImage: projects.coverImage,
            listingStatus: projects.listingStatus,
            rejectionReason: projects.rejectionReason,
            createdAt: projects.createdAt,
          })
          .from(projects)
          .where(eq(projects.submitterPhone, phone)),
      ]);

      return { properties: myProperties, projects: myProjects };
    }),
});
