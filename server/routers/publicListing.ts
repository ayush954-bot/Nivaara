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
  listingEdits,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { sendNewPropertySubmissionNotification, sendNewProjectSubmissionNotification, sendPropertyReEditNotification, sendProjectReEditNotification } from "../email";
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
        status: z.enum(["Under-Construction", "Ready", "Sold"]),
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

      // Fire-and-forget: Manus owner notification + email to info@nivaararealty.com
      Promise.allSettled([
        notifyOwner({
          title: "New Public Property Listing",
          content: `${rest.submitterName} (${rest.submitterPhone}) submitted:\n"${rest.title}" in ${rest.location}\nPrice: ₹${rest.price}`,
        }),
        sendNewPropertySubmissionNotification({
          title: rest.title,
          location: rest.location,
          price: rest.price ?? null,
          priceLabel: rest.priceLabel ?? null,
          propertyType: rest.propertyType,
          bedrooms: rest.bedrooms ?? null,
          submitterName: rest.submitterName,
          submitterPhone: rest.submitterPhone,
        }),
      ]).catch(() => {});

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
        status: z.enum(["Upcoming", "Under Construction", "Ready to Move", "Sold Out"]),
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

      // Fire-and-forget: Manus owner notification + email to info@nivaararealty.com
      Promise.allSettled([
        notifyOwner({
          title: "New Public Project Listing",
          content: `${rest.submitterName} (${rest.submitterPhone}) submitted:\n"${rest.name}" by ${rest.builderName} in ${rest.location}, ${rest.city}`,
        }),
        sendNewProjectSubmissionNotification({
          name: rest.name,
          builderName: rest.builderName,
          city: rest.city,
          location: rest.location,
          minPrice: rest.minPrice ?? null,
          maxPrice: rest.maxPrice ?? null,
          submitterName: rest.submitterName,
          submitterPhone: rest.submitterPhone,
        }),
      ]).catch(() => {});

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

  // Public: update my listing (owner can update their own property/project)
  updateMyProperty: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        priceLabel: z.string().optional(),
        status: z.string().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        area: z.string().optional(),
        builderName: z.string().optional(),
        // Extended fields matching admin form
        location: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        propertyType: z.string().optional(),
        furnishing: z.string().optional(),
        facing: z.string().optional(),
        floor: z.number().optional(),
        totalFloors: z.number().optional(),
        parking: z.number().optional(),
        ageOfProperty: z.string().optional(),
        reraNumber: z.string().optional(),
        badge: z.string().optional(),
        customBadgeText: z.string().optional(),
        brochureUrl: z.string().optional(),
        videoUrls: z.array(z.string()).optional(),
        imageUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      const [existing] = await db
        .select({ id: properties.id, submitterPhone: properties.submitterPhone })
        .from(properties)
        .where(eq(properties.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to update this listing.");
      }

      const { id, videoUrls, imageUrls } = input;
      // Track which fields were changed for the audit log
      const changedFieldsList: string[] = [];
      if (input.title !== undefined) changedFieldsList.push("title");
      if (input.description !== undefined) changedFieldsList.push("description");
      if (input.price !== undefined) changedFieldsList.push("price");
      if (input.priceLabel !== undefined) changedFieldsList.push("priceLabel");
      if (input.status !== undefined) changedFieldsList.push("status");
      if (input.propertyType !== undefined) changedFieldsList.push("propertyType");
      if (input.bedrooms !== undefined) changedFieldsList.push("bedrooms");
      if (input.bathrooms !== undefined) changedFieldsList.push("bathrooms");
      if (input.area !== undefined) changedFieldsList.push("area");
      if (input.builderName !== undefined) changedFieldsList.push("builder");
      if (input.location !== undefined) changedFieldsList.push("location");
      if (input.badge !== undefined) changedFieldsList.push("badge");
      if (input.brochureUrl !== undefined) changedFieldsList.push("brochureUrl");
      if (imageUrls !== undefined) changedFieldsList.push("images");
      if (videoUrls !== undefined) changedFieldsList.push("videos");

      // Only update columns that actually exist in the properties table
      const validUpdates: Record<string, unknown> = {};
      // Always reset listing status to pending_review when a public user edits their listing
      validUpdates.listingStatus = "pending_review";
      if (input.title !== undefined) validUpdates.title = input.title;
      if (input.description !== undefined) validUpdates.description = input.description;
      if (input.price !== undefined) validUpdates.price = input.price;
      if (input.priceLabel !== undefined) validUpdates.priceLabel = input.priceLabel;
      if (input.status !== undefined) validUpdates.status = input.status;
      if (input.propertyType !== undefined) validUpdates.propertyType = input.propertyType;
      if (input.bedrooms !== undefined) validUpdates.bedrooms = input.bedrooms;
      if (input.bathrooms !== undefined) validUpdates.bathrooms = input.bathrooms;
      if (input.area !== undefined) validUpdates.area = input.area; // area varchar (location area like Kharadi)
      if (input.builderName !== undefined) validUpdates.builder = input.builderName; // map builderName → builder
      if (input.location !== undefined) validUpdates.location = input.location;
      if (input.latitude !== undefined) validUpdates.latitude = String(input.latitude);
      if (input.longitude !== undefined) validUpdates.longitude = String(input.longitude);
      if (input.badge !== undefined) validUpdates.badge = input.badge;
      if (input.customBadgeText !== undefined) validUpdates.customBadgeText = input.customBadgeText;
      if (input.brochureUrl !== undefined) validUpdates.brochureUrl = input.brochureUrl;
      if (Object.keys(validUpdates).length > 0) {
        await db.update(properties).set(validUpdates).where(eq(properties.id, id));
      }

      // Replace images if provided
      if (imageUrls !== undefined) {
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, id));
        if (imageUrls.length > 0) {
          await db.insert(propertyImages).values(
            imageUrls.map((url, idx) => ({ propertyId: id, imageUrl: url, displayOrder: idx }))
          );
        }
      }

      // Replace videos if provided (store in videoUrl field as JSON array)
      if (videoUrls !== undefined) {
        await db.update(properties)
          .set({ videoUrl: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null })
          .where(eq(properties.id, id));
      }

      // Fetch updated property to get current values for email notification
      const [updatedProp] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id));

      // Insert audit log entry
      await db.insert(listingEdits).values({
        listingType: "property",
        listingId: id,
        listingTitle: updatedProp?.title ?? input.title ?? null,
        submitterPhone: phone,
        changedFields: JSON.stringify(changedFieldsList),
      });

      // Send re-review notification email to admin
      if (updatedProp) {
        sendPropertyReEditNotification({
          title: updatedProp.title,
          location: updatedProp.location,
          price: updatedProp.price,
          priceLabel: updatedProp.priceLabel,
          propertyType: updatedProp.propertyType,
          bedrooms: updatedProp.bedrooms,
          submitterName: updatedProp.submitterName ?? "Unknown",
          submitterPhone: updatedProp.submitterPhone ?? phone,
        }).catch(console.error);
      }

      return { success: true };
    }),

  // Public: mark my property as sold
  markPropertyAsSold: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select({ id: properties.id, submitterPhone: properties.submitterPhone })
        .from(properties)
        .where(eq(properties.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to update this listing.");
      }

      await db.update(properties).set({ status: "Sold" }).where(eq(properties.id, input.id));
      return { success: true };
    }),

  // Public: delete my property listing
  deleteMyProperty: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select({ id: properties.id, submitterPhone: properties.submitterPhone })
        .from(properties)
        .where(eq(properties.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to delete this listing.");
      }

      // Delete related images first
      await db.delete(propertyImages).where(eq(propertyImages.propertyId, input.id));
      await db.delete(properties).where(eq(properties.id, input.id));
      return { success: true };
    }),

  // Public: update my project listing
  updateMyProject: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        status: z.string().optional(),
        builderName: z.string().optional(),
        configurations: z.string().optional(),
        possessionDate: z.string().optional(),
        // Extended fields matching admin form
        city: z.string().optional(),
        location: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        reraNumber: z.string().optional(),
        towers: z.number().optional(),
        floors: z.number().optional(),
        totalUnits: z.number().optional(),
        builderDescription: z.string().optional(),
        builderEstablished: z.number().optional(),
        builderLogo: z.string().optional(),
        masterPlanUrl: z.string().optional(),
        brochureUrl: z.string().optional(),
        badge: z.string().optional(),
        customBadgeText: z.string().optional(),
        videoUrls: z.array(z.object({ url: z.string(), type: z.string() })).optional(),
        imageUrls: z.array(z.string()).optional(),
        amenities: z.array(z.object({ name: z.string(), icon: z.string().optional() })).optional(),
        floorPlans: z.array(z.object({
          name: z.string(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          area: z.string().optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select({ id: projects.id, submitterPhone: projects.submitterPhone })
        .from(projects)
        .where(eq(projects.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to update this listing.");
      }

      const { firebaseToken, id, videoUrls, imageUrls, amenities, floorPlans, ...updates } = input;
      // Track which fields were changed for the audit log
      const changedFieldsList: string[] = [];
      if (updates.name !== undefined) changedFieldsList.push("name");
      if (updates.description !== undefined) changedFieldsList.push("description");
      if (updates.minPrice !== undefined || updates.maxPrice !== undefined) changedFieldsList.push("price");
      if (updates.status !== undefined) changedFieldsList.push("status");
      if (updates.builderName !== undefined) changedFieldsList.push("builderName");
      if (updates.configurations !== undefined) changedFieldsList.push("configurations");
      if (updates.possessionDate !== undefined) changedFieldsList.push("possessionDate");
      if (updates.city !== undefined || updates.location !== undefined) changedFieldsList.push("location");
      if (updates.reraNumber !== undefined) changedFieldsList.push("reraNumber");
      if (updates.towers !== undefined || updates.floors !== undefined || updates.totalUnits !== undefined) changedFieldsList.push("projectDetails");
      if (updates.builderDescription !== undefined || updates.builderEstablished !== undefined || updates.builderLogo !== undefined) changedFieldsList.push("builderInfo");
      if (updates.masterPlanUrl !== undefined) changedFieldsList.push("masterPlan");
      if (updates.brochureUrl !== undefined) changedFieldsList.push("brochure");
      if (imageUrls !== undefined) changedFieldsList.push("images");
      if (videoUrls !== undefined) changedFieldsList.push("videos");
      if (amenities !== undefined) changedFieldsList.push("amenities");
      if (floorPlans !== undefined) changedFieldsList.push("floorPlans");

      // Only keep fields that exist in the projects table
      const validProjectUpdates: Record<string, unknown> = {};
      // Always reset listing status to pending_review when a public user edits their listing
      validProjectUpdates.listingStatus = "pending_review";
      if (updates.name !== undefined) validProjectUpdates.name = updates.name;
      if (updates.description !== undefined) validProjectUpdates.description = updates.description;
      if (updates.minPrice !== undefined) validProjectUpdates.minPrice = updates.minPrice;
      if (updates.maxPrice !== undefined) validProjectUpdates.maxPrice = updates.maxPrice;
      if (updates.status !== undefined) validProjectUpdates.status = updates.status;
      if (updates.builderName !== undefined) validProjectUpdates.builderName = updates.builderName;
      if (updates.configurations !== undefined) validProjectUpdates.configurations = updates.configurations;
      if (updates.possessionDate !== undefined) validProjectUpdates.possessionDate = new Date(updates.possessionDate);
      if (updates.city !== undefined) validProjectUpdates.city = updates.city;
      if (updates.location !== undefined) validProjectUpdates.location = updates.location;
      if (updates.latitude !== undefined) validProjectUpdates.latitude = String(updates.latitude);
      if (updates.longitude !== undefined) validProjectUpdates.longitude = String(updates.longitude);
      if (updates.reraNumber !== undefined) validProjectUpdates.reraNumber = updates.reraNumber;
      if (updates.towers !== undefined) validProjectUpdates.towers = updates.towers;
      if (updates.floors !== undefined) validProjectUpdates.floors = updates.floors;
      if (updates.totalUnits !== undefined) validProjectUpdates.totalUnits = updates.totalUnits;
      if (updates.builderDescription !== undefined) validProjectUpdates.builderDescription = updates.builderDescription;
      if (updates.builderEstablished !== undefined) validProjectUpdates.builderEstablished = updates.builderEstablished;
      if (updates.builderLogo !== undefined) validProjectUpdates.builderLogo = updates.builderLogo;
      if (updates.masterPlanUrl !== undefined) validProjectUpdates.masterPlanUrl = updates.masterPlanUrl;
      if (updates.brochureUrl !== undefined) validProjectUpdates.brochureUrl = updates.brochureUrl;
      if (updates.badge !== undefined) validProjectUpdates.badge = updates.badge;
      if (updates.customBadgeText !== undefined) validProjectUpdates.customBadgeText = updates.customBadgeText;
      if (Object.keys(validProjectUpdates).length > 0) {
        await db.update(projects).set(validProjectUpdates).where(eq(projects.id, id));
      }

      // Replace images if provided
      if (imageUrls !== undefined) {
        await db.delete(projectImages).where(eq(projectImages.projectId, id));
        if (imageUrls.length > 0) {
          await db.insert(projectImages).values(
            imageUrls.map((url, idx) => ({ projectId: id, imageUrl: url, displayOrder: idx }))
          );
        }
      }

      // Replace videos if provided
      if (videoUrls !== undefined) {
        await db.delete(projectVideos).where(eq(projectVideos.projectId, id));
        if (videoUrls.length > 0) {
          await db.insert(projectVideos).values(
            videoUrls.map((v, idx) => ({ projectId: id, videoUrl: v.url, videoType: v.type as any, displayOrder: idx }))
          );
        }
      }

      // Replace amenities if provided
      if (amenities !== undefined) {
        await db.delete(projectAmenities).where(eq(projectAmenities.projectId, id));
        if (amenities.length > 0) {
          await db.insert(projectAmenities).values(
            amenities.map((a, idx) => ({ projectId: id, name: a.name, icon: a.icon ?? null, displayOrder: idx }))
          );
        }
      }

      // Replace floor plans if provided
      if (floorPlans !== undefined) {
        await db.delete(projectFloorPlans).where(eq(projectFloorPlans.projectId, id));
        if (floorPlans.length > 0) {
          await db.insert(projectFloorPlans).values(
            floorPlans.map((fp, idx) => ({
              projectId: id,
              name: fp.name,
              bedrooms: fp.bedrooms ?? 0,
              bathrooms: fp.bathrooms ?? 0,
              area: fp.area ? parseInt(fp.area) || 0 : 0,
              price: fp.price ?? "0",
              imageUrl: fp.imageUrl ?? null,
              displayOrder: idx,
            }))
          );
        }
      }

      // Fetch updated project to get current values for email notification
      const [updatedProj] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));

      // Insert audit log entry
      await db.insert(listingEdits).values({
        listingType: "project",
        listingId: id,
        listingTitle: updatedProj?.name ?? updates.name ?? null,
        submitterPhone: phone,
        changedFields: JSON.stringify(changedFieldsList),
      });

      // Send re-review notification email to admin
      if (updatedProj) {
        sendProjectReEditNotification({
          name: updatedProj.name,
          builderName: updatedProj.builderName,
          city: updatedProj.city,
          location: updatedProj.location,
          minPrice: updatedProj.minPrice ? Number(updatedProj.minPrice) : null,
          maxPrice: updatedProj.maxPrice ? Number(updatedProj.maxPrice) : null,
          submitterName: updatedProj.submitterName ?? "Unknown",
          submitterPhone: updatedProj.submitterPhone ?? phone,
        }).catch(console.error);
      }

      return { success: true };
    }),

  // Public: mark my project as sold/completed
  markProjectAsSold: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select({ id: projects.id, submitterPhone: projects.submitterPhone })
        .from(projects)
        .where(eq(projects.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to update this listing.");
      }

      await db.update(projects).set({ status: "Sold Out" }).where(eq(projects.id, input.id));
      return { success: true };
    }),

  // Public: delete my project listing
  deleteMyProject: publicProcedure
    .input(
      z.object({
        firebaseToken: z.string(),
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [existing] = await db
        .select({ id: projects.id, submitterPhone: projects.submitterPhone })
        .from(projects)
        .where(eq(projects.id, input.id));
      if (!existing || existing.submitterPhone !== phone) {
        throw new Error("Not authorized to delete this listing.");
      }

      // Delete related data first
      await db.delete(projectImages).where(eq(projectImages.projectId, input.id));
      await db.delete(projectAmenities).where(eq(projectAmenities.projectId, input.id));
      await db.delete(projectFloorPlans).where(eq(projectFloorPlans.projectId, input.id));
      await db.delete(projectVideos).where(eq(projectVideos.projectId, input.id));
      await db.delete(projects).where(eq(projects.id, input.id));
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

  // Public: get full property details for editing (owner only)
  getMyPropertyById: publicProcedure
    .input(z.object({ firebaseToken: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [prop] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, input.id));
      if (!prop || prop.submitterPhone !== phone) {
        throw new Error("Not found or not authorized.");
      }

      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, input.id));

      return { ...prop, images };
    }),

  // Public: get full project details for editing (owner only)
  getMyProjectById: publicProcedure
    .input(z.object({ firebaseToken: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [proj] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id));
      if (!proj || proj.submitterPhone !== phone) {
        throw new Error("Not found or not authorized.");
      }

      const [images, videos, amenitiesList, floorPlansList] = await Promise.all([
        db.select().from(projectImages).where(eq(projectImages.projectId, input.id)),
        db.select().from(projectVideos).where(eq(projectVideos.projectId, input.id)),
        db.select().from(projectAmenities).where(eq(projectAmenities.projectId, input.id)),
        db.select().from(projectFloorPlans).where(eq(projectFloorPlans.projectId, input.id)),
      ]);

      return { ...proj, images, videos, amenities: amenitiesList, floorPlans: floorPlansList };
    }),

  // Public: get edit history for a specific listing
  getMyListingEdits: publicProcedure
    .input(z.object({
      firebaseToken: z.string(),
      listingType: z.enum(["property", "project"]),
      listingId: z.number(),
    }))
    .query(async ({ input }) => {
      const phone = await verifyFirebaseToken(input.firebaseToken);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      if (input.listingType === "property") {
        const [prop] = await db
          .select({ submitterPhone: properties.submitterPhone })
          .from(properties)
          .where(eq(properties.id, input.listingId));
        if (!prop || prop.submitterPhone !== phone) {
          throw new Error("Not found or not authorized.");
        }
      } else {
        const [proj] = await db
          .select({ submitterPhone: projects.submitterPhone })
          .from(projects)
          .where(eq(projects.id, input.listingId));
        if (!proj || proj.submitterPhone !== phone) {
          throw new Error("Not found or not authorized.");
        }
      }

      const edits = await db
        .select()
        .from(listingEdits)
        .where(
          eq(listingEdits.listingId, input.listingId)
        )
        .orderBy(listingEdits.editedAt);

      // Filter by listingType in JS since we can't easily use AND with eq in this setup
      return edits.filter(e => e.listingType === input.listingType);
    }),
});
