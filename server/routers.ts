import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { sendInquiryNotification, sendInquiryConfirmation } from "./email";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProperties();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPropertyById(input.id);
      }),
    
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProperties();
    }),
    
    search: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          propertyType: z.string().optional(),
          status: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          bedrooms: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.searchProperties(input);
      }),
  }),

  inquiries: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          message: z.string().min(1),
          propertyId: z.number().optional(),
          inquiryType: z.enum(["general", "property", "consultation"]).default("general"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.createInquiry(input);
        
        // Send email notification to info@nivaararealty.com
        try {
          await sendInquiryNotification(input);
        } catch (error) {
          console.error("Failed to send email notification:", error);
        }
        
        // Send confirmation email to the user
        try {
          await sendInquiryConfirmation(input);
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
        
        // Notify owner via Manus notification system
        try {
          await notifyOwner({
            title: "New Inquiry Received",
            content: `From: ${input.name} (${input.email})\nPhone: ${input.phone}\nType: ${input.inquiryType}\nMessage: ${input.message}`,
          });
        } catch (error) {
          console.error("Failed to send Manus notification:", error);
        }
        
        return { success: true };
      }),
  }),

  testimonials: router({
    list: publicProcedure.query(async () => {
      return await db.getPublishedTestimonials();
    }),
  }),

  admin: router({
    // Property Management
    properties: router({
      create: publicProcedure
        .input(
          z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental"]),
            status: z.enum(["Under-Construction", "Ready"]),
            location: z.string().min(1),
            area: z.string().optional(),
            price: z.string(), // Will be converted to decimal
            priceLabel: z.string().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            area_sqft: z.number().optional(),
            builder: z.string().optional(),
            imageUrl: z.string().optional(),
            featured: z.boolean().default(false),
          })
        )
        .mutation(async ({ input, ctx }) => {
          // Check if user is admin
          if (!ctx.user || ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }
          return await db.createProperty(input as any);
        }),

      update: publicProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental"]).optional(),
            status: z.enum(["Under-Construction", "Ready"]).optional(),
            location: z.string().min(1).optional(),
            area: z.string().optional(),
            price: z.string().optional(),
            priceLabel: z.string().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            area_sqft: z.number().optional(),
            builder: z.string().optional(),
            imageUrl: z.string().optional(),
            featured: z.boolean().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user || ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }
          const { id, ...updates } = input;
          return await db.updateProperty(id, updates as any);
        }),

      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user || ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }
          return await db.deleteProperty(input.id);
        }),

      list: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return await db.getAllProperties();
      }),

      bulkImport: publicProcedure
        .input(
          z.object({
            properties: z.array(
              z.object({
                title: z.string().min(1),
                description: z.string().min(1),
                propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental"]),
                status: z.enum(["Under-Construction", "Ready"]),
                location: z.string().min(1),
                price: z.number(),
                area: z.number().optional(),
                bedrooms: z.number().optional(),
                bathrooms: z.number().optional(),
                builder: z.string().optional(),
                featured: z.boolean().default(false),
              })
            ),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user || ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }
          return await db.bulkImportProperties(input.properties);
        }),
    }),

    // Inquiry Management
    inquiries: router({
      list: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.user || ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return await db.getAllInquiries();
      }),

      updateStatus: publicProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["new", "contacted", "closed"]),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user || ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }
          return await db.updateInquiryStatus(input.id, input.status);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
