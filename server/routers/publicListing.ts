import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { properties, projects, propertyImages, projectImages } from "../../drizzle/schema";
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

  // Submit a public property listing
  submitProperty: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]),
        status: z.enum(["Under-Construction", "Ready"]),
        location: z.string().min(1),
        price: z.number().positive(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        area_sqft: z.number().optional(),
        builder: z.string().optional(),
        imageUrls: z.array(z.string()).max(10),
        submitterPhone: z.string().min(1),
        submitterName: z.string().min(1),
        firebaseToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await verifyFirebaseToken(input.firebaseToken);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { imageUrls, firebaseToken, ...rest } = input;

      const [result] = await db
        .insert(properties)
        .values({
          ...rest,
          price: rest.price.toString(),
          imageUrl: imageUrls[0] || null,
          listingSource: "public",
          listingStatus: "pending_review",
          featured: false,
        });

      const propertyId = (result as { insertId: number }).insertId;

      if (imageUrls.length > 1) {
        await db.insert(propertyImages).values(
          imageUrls.slice(1).map((url, i) => ({
            propertyId,
            imageUrl: url,
            displayOrder: i + 1,
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

  // Submit a public project listing
  submitProject: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        builderName: z.string().min(1),
        description: z.string().min(1),
        location: z.string().min(1),
        city: z.string().min(1),
        status: z.enum(["Upcoming", "Under Construction", "Ready to Move"]),
        priceRange: z.string().min(1),
        configurations: z.string().optional(),
        reraNumber: z.string().optional(),
        totalUnits: z.number().optional(),
        imageUrls: z.array(z.string()).max(10),
        submitterPhone: z.string().min(1),
        submitterName: z.string().min(1),
        firebaseToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await verifyFirebaseToken(input.firebaseToken);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { imageUrls, firebaseToken, ...rest } = input;

      // Generate a URL-friendly slug from project name
      const slug = rest.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + nanoid(6);

      const [result] = await db
        .insert(projects)
        .values({
          ...rest,
          slug,
          coverImage: imageUrls[0] || null,
          listingSource: "public",
          listingStatus: "pending_review",
          featured: false,
        });

      const projectId = (result as { insertId: number }).insertId;

      if (imageUrls.length > 1) {
        await db.insert(projectImages).values(
          imageUrls.slice(1).map((url, i) => ({
            projectId,
            imageUrl: url,
            displayOrder: i + 1,
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
