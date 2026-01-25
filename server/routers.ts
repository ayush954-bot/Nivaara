import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { sendInquiryNotification, sendInquiryConfirmation } from "./email";
import { imageUploadRouter } from "./imageUpload";
import { createDatabaseBackup } from "./backup";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  imageUpload: imageUploadRouter,
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
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        // Try slug first, then fall back to ID for backward compatibility
        let property = await db.getPropertyBySlug(input.slug);
        if (!property) {
          const id = parseInt(input.slug, 10);
          if (!isNaN(id)) {
            property = await db.getPropertyById(id);
          }
        }
        return property;
      }),
    
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProperties();
    }),
    
    getLocations: publicProcedure.query(async () => {
      return await db.getUniqueLocations();
    }),
    
    search: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          zone: z.string().optional(),
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
            propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]),
            status: z.enum(["Under-Construction", "Ready"]),
            location: z.string().min(1),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
            zone: z.enum(["east_pune", "west_pune", "north_pune", "south_pune", "other"]).nullable().optional(),
            area: z.string().optional(),
            price: z.string(), // Will be converted to decimal
            priceLabel: z.string().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            area_sqft: z.number().optional(),
            builder: z.string().optional(),
            imageUrl: z.string().optional(),
            videoUrl: z.string().optional(),
            featured: z.boolean().default(false),
            brochureUrl: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          // Allow OAuth admin users OR staff with property_manager role
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required to manage properties.");
          }
          return await db.createProperty(input as any);
        }),

      update: publicProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]).optional(),
            status: z.enum(["Under-Construction", "Ready"]).optional(),
            location: z.string().min(1).optional(),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
            zone: z.enum(["east_pune", "west_pune", "north_pune", "south_pune", "other"]).nullable().optional(),
            area: z.string().optional(),
            price: z.string().optional(),
            priceLabel: z.string().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            area_sqft: z.number().optional(),
            builder: z.string().optional(),
            imageUrl: z.string().optional(),
            videoUrl: z.string().optional(),
            badge: z.string().optional(),
            customBadgeText: z.string().max(25).optional(),
            featured: z.boolean().optional(),
            brochureUrl: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          // Allow OAuth admin users OR staff with property_manager role
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required to manage properties.");
          }
          const { id, ...updates } = input;
          return await db.updateProperty(id, updates as any);
        }),

      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          // Allow OAuth admin users OR staff with property_manager role
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required to manage properties.");
          }
          return await db.deleteProperty(input.id);
        }),

      list: publicProcedure.query(async ({ ctx }) => {
        // Allow OAuth admin users OR staff with property_manager role
        const isOAuthAdmin = ctx.user?.role === "admin";
        const isStaffPropertyManager = ctx.staff?.role === "property_manager";
        
        if (!isOAuthAdmin && !isStaffPropertyManager) {
          throw new Error("Admin access is required to manage properties.");
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
                propertyType: z.enum(["Flat", "Shop", "Office", "Land", "Rental", "Bank Auction"]),
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
          // Allow OAuth admin users OR staff with property_manager role
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required to manage properties.");
          }
          return await db.bulkImportProperties(input.properties);
        }),

      // Property Images Management
      images: router({
        list: publicProcedure
          .input(z.object({ propertyId: z.number() }))
          .query(async ({ input }) => {
            // Public endpoint - anyone can view property images
            return await db.getPropertyImages(input.propertyId);
          }),

        add: publicProcedure
          .input(
            z.object({
              propertyId: z.number(),
              imageUrl: z.string(),
              isCover: z.boolean().default(false),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addPropertyImage(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deletePropertyImage(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ propertyId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllPropertyImages(input.propertyId);
          }),

        setCover: publicProcedure
          .input(z.object({ propertyId: z.number(), imageId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.setCoverImage(input.propertyId, input.imageId);
          }),
      }),

      // Property Videos Management
      videos: router({
        list: publicProcedure
          .input(z.object({ propertyId: z.number() }))
          .query(async ({ input }) => {
            // Public endpoint - anyone can view property videos
            return await db.listPropertyVideos(input.propertyId);
          }),

        add: publicProcedure
          .input(
            z.object({
              propertyId: z.number(),
              videoUrl: z.string(),
              videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]).default("youtube"),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addPropertyVideo(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deletePropertyVideo(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ propertyId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllPropertyVideos(input.propertyId);
          }),
      }),
    }),

    // Inquiry Management
    inquiries: router({
      list: publicProcedure.query(async ({ ctx }) => {
        // Allow OAuth admin users OR staff with property_manager role
        const isOAuthAdmin = ctx.user?.role === "admin";
        const isStaffPropertyManager = ctx.staff?.role === "property_manager";
        
        if (!isOAuthAdmin && !isStaffPropertyManager) {
          throw new Error("Admin access is required to manage properties.");
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
          // Allow OAuth admin users OR staff with property_manager role
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required to manage properties.");
          }
          return await db.updateInquiryStatus(input.id, input.status);
        }),
    }),

    // Projects Management
    projects: router({
      list: publicProcedure.query(async ({ ctx }) => {
        const isOAuthAdmin = ctx.user?.role === "admin";
        const isStaffPropertyManager = ctx.staff?.role === "property_manager";
        if (!isOAuthAdmin && !isStaffPropertyManager) {
          throw new Error("Admin access is required");
        }
        return await db.getAllProjects();
      }),

      create: publicProcedure
        .input(
          z.object({
            name: z.string().min(1),
            builderName: z.string().min(1),
            description: z.string().min(1),
            location: z.string().min(1),
            city: z.string().min(1),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
            status: z.enum(["Upcoming", "Under Construction", "Ready to Move"]),
            priceRange: z.string().min(1),
            minPrice: z.number().nullable().optional(),
            maxPrice: z.number().nullable().optional(),
            configurations: z.string().optional(),
            reraNumber: z.string().optional(),
            possessionDate: z.string().optional(),
            totalUnits: z.number().optional(),
            towers: z.number().optional(),
            floors: z.number().optional(),
            coverImage: z.string().optional(),
            videoUrl: z.string().optional(),
            brochureUrl: z.string().optional(),
            masterPlanUrl: z.string().optional(),
            builderDescription: z.string().optional(),
            builderLogo: z.string().optional(),
            builderEstablished: z.number().optional(),
            builderProjects: z.number().optional(),
            featured: z.boolean().default(false),
            badge: z.string().optional(),
            customBadgeText: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required");
          }
          return await db.createProject(input);
        }),

      update: publicProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).optional(),
            builderName: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            location: z.string().min(1).optional(),
            city: z.string().min(1).optional(),
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
            status: z.enum(["Upcoming", "Under Construction", "Ready to Move"]).optional(),
            priceRange: z.string().min(1).optional(),
            minPrice: z.number().nullable().optional(),
            maxPrice: z.number().nullable().optional(),
            configurations: z.string().optional(),
            reraNumber: z.string().optional(),
            possessionDate: z.string().optional(),
            totalUnits: z.number().optional(),
            towers: z.number().optional(),
            floors: z.number().optional(),
            coverImage: z.string().optional(),
            videoUrl: z.string().optional(),
            brochureUrl: z.string().optional(),
            masterPlanUrl: z.string().optional(),
            builderDescription: z.string().optional(),
            builderLogo: z.string().optional(),
            builderEstablished: z.number().optional(),
            builderProjects: z.number().optional(),
            featured: z.boolean().optional(),
            badge: z.string().optional(),
            customBadgeText: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required");
          }
          const { id, ...data } = input;
          return await db.updateProject(id, data);
        }),

      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const isOAuthAdmin = ctx.user?.role === "admin";
          const isStaffPropertyManager = ctx.staff?.role === "property_manager";
          if (!isOAuthAdmin && !isStaffPropertyManager) {
            throw new Error("Admin access is required");
          }
          return await db.deleteProject(input.id);
        }),

      // Amenities management
      amenities: router({
        list: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .query(async ({ input }) => {
            return await db.getProjectAmenities(input.projectId);
          }),

        add: publicProcedure
          .input(
            z.object({
              projectId: z.number(),
              name: z.string().min(1),
              icon: z.string().optional(),
              imageUrl: z.string().optional(),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addProjectAmenity(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteProjectAmenity(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllProjectAmenities(input.projectId);
          }),
      }),

      // Floor plans management
      floorPlans: router({
        list: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .query(async ({ input }) => {
            return await db.getProjectFloorPlans(input.projectId);
          }),

        add: publicProcedure
          .input(
            z.object({
              projectId: z.number(),
              name: z.string().min(1),
              bedrooms: z.number(),
              bathrooms: z.number(),
              area: z.number(),
              price: z.number(),
              imageUrl: z.string().optional(),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addProjectFloorPlan(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteProjectFloorPlan(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllProjectFloorPlans(input.projectId);
          }),
      }),

      // Images management
      images: router({
        list: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .query(async ({ input }) => {
            return await db.getProjectImages(input.projectId);
          }),

        add: publicProcedure
          .input(
            z.object({
              projectId: z.number(),
              imageUrl: z.string().min(1),
              caption: z.string().optional(),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addProjectImage(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteProjectImage(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllProjectImages(input.projectId);
          }),
      }),

      // Videos management
      videos: router({
        list: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .query(async ({ input }) => {
            return await db.getProjectVideos(input.projectId);
          }),

        add: publicProcedure
          .input(
            z.object({
              projectId: z.number(),
              videoUrl: z.string().min(1),
              videoType: z.enum(["youtube", "vimeo", "virtual_tour", "other"]).default("youtube"),
              title: z.string().optional(),
              displayOrder: z.number().default(0),
            })
          )
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.addProjectVideo(input);
          }),

        delete: publicProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteProjectVideo(input.id);
          }),

        deleteAll: publicProcedure
          .input(z.object({ projectId: z.number() }))
          .mutation(async ({ input, ctx }) => {
            const isOAuthAdmin = ctx.user?.role === "admin";
            const isStaffPropertyManager = ctx.staff?.role === "property_manager";
            if (!isOAuthAdmin && !isStaffPropertyManager) {
              throw new Error("Admin access is required");
            }
            return await db.deleteAllProjectVideos(input.projectId);
          }),
      }),
    }),
  }),

  // Projects router - Builder project listings
  projects: router({
    // Public queries
    list: publicProcedure.query(async () => {
      return await db.getAllProjects();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProjectBySlug(input.slug);
      }),
    
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProjects();
    }),
    
    search: publicProcedure
      .input(
        z.object({
          location: z.string().optional(),
          status: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          bedrooms: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.searchProjects(input);
      }),
  }),

  // Backup router - Database backup management (admin only)
  backup: router({
    create: publicProcedure.mutation(async ({ ctx }) => {
      // Only allow admin users to create backups
      const isOAuthAdmin = ctx.user?.role === "admin";
      if (!isOAuthAdmin) {
        throw new Error("Admin access is required to create backups");
      }
      return await createDatabaseBackup();
    }),
  }),
});

export type AppRouter = typeof appRouter;
