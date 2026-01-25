import { eq, desc, and, like, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, properties, InsertProperty, inquiries, InsertInquiry, testimonials, InsertTestimonial, propertyImages, InsertPropertyImage, propertyVideos, InsertPropertyVideo, projects, projectAmenities, projectFloorPlans, projectImages, projectVideos } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Properties queries
export async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedProperties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.featured, true)).orderBy(desc(properties.createdAt));
}

export async function getUniqueLocations() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all distinct locations from properties
  const result = await db.selectDistinct({ location: properties.location }).from(properties);
  
  // Extract and sort locations
  const locations = result
    .map(r => r.location)
    .filter(loc => loc && loc.trim() !== '')
    .sort();
  
  return locations;
}

export async function searchProperties(filters: {
  location?: string;
  zone?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.location && filters.location !== "all") {
    conditions.push(like(properties.location, `%${filters.location}%`));
  }
  if (filters.zone) {
    conditions.push(eq(properties.zone, filters.zone as any));
  }
  if (filters.propertyType && filters.propertyType !== "all") {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(properties.status, filters.status as any));
  }
  if (filters.minPrice) {
    conditions.push(sql`${properties.price} >= ${filters.minPrice}`);
  }
  if (filters.maxPrice) {
    conditions.push(sql`${properties.price} <= ${filters.maxPrice}`);
  }
  if (filters.bedrooms) {
    conditions.push(eq(properties.bedrooms, filters.bedrooms));
  }

  if (conditions.length === 0) {
    return db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  return db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt));
}

export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(properties).values(property);
  // Get the inserted ID from the result
  const insertId = Number(result[0].insertId);
  // Fetch and return the newly created property
  const newProperty = await getPropertyById(insertId);
  return newProperty;
}

export async function updateProperty(id: number, property: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set(property).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(properties).where(eq(properties.id, id));
}

export async function bulkImportProperties(propertiesToImport: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = {
    success: 0,
    failed: 0,
    errors: [] as { row: number; error: string }[],
  };

  for (let i = 0; i < propertiesToImport.length; i++) {
    try {
      const property = propertiesToImport[i];
      
      // Images can be added later through edit function

      // Prepare property data
      const propertyData: InsertProperty = {
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        status: property.status,
        location: property.location,
        price: property.price.toString(),
        area: property.area?.toString(),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area,
        builder: property.builder,
        imageUrl: undefined, // Images can be added later via edit
        featured: property.featured || false,
      };

      await db.insert(properties).values(propertyData);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

// Inquiries queries
export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function getInquiryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInquiry(inquiry: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inquiries).values(inquiry);
  return result;
}

export async function updateInquiryStatus(id: number, status: "new" | "contacted" | "closed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
}

// Testimonials queries
export async function getPublishedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(desc(testimonials.createdAt));
}

export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(testimonial: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(testimonials).values(testimonial);
  return result;
}

// Property Images queries
export async function getPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(propertyImages.displayOrder);
}

export async function getCoverImage(propertyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(propertyImages)
    .where(and(eq(propertyImages.propertyId, propertyId), eq(propertyImages.isCover, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addPropertyImage(image: InsertPropertyImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If this is marked as cover, unset other cover images for this property
  if (image.isCover) {
    await db
      .update(propertyImages)
      .set({ isCover: false })
      .where(eq(propertyImages.propertyId, image.propertyId));
  }
  
  await db.insert(propertyImages).values(image);
  return { success: true };
}

export async function deletePropertyImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(propertyImages).where(eq(propertyImages.id, id));
  return { success: true };
}

export async function deleteAllPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  return { success: true };
}

export async function setCoverImage(propertyId: number, imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Unset all cover images for this property
  await db
    .update(propertyImages)
    .set({ isCover: false })
    .where(eq(propertyImages.propertyId, propertyId));
  
  // Set the specified image as cover
  await db
    .update(propertyImages)
    .set({ isCover: true })
    .where(eq(propertyImages.id, imageId));
}

export async function updateImageOrder(imageId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(propertyImages)
    .set({ displayOrder })
    .where(eq(propertyImages.id, imageId));
}

/**
 * Property Videos functions
 */
export async function listPropertyVideos(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(propertyVideos)
    .where(eq(propertyVideos.propertyId, propertyId))
    .orderBy(propertyVideos.displayOrder);
}

export async function addPropertyVideo(video: InsertPropertyVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(propertyVideos).values(video);
  return { success: true };
}

export async function deletePropertyVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(propertyVideos).where(eq(propertyVideos.id, id));
  return { success: true };
}

export async function deleteAllPropertyVideos(propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(propertyVideos).where(eq(propertyVideos.propertyId, propertyId));
  return { success: true };
}

export async function updateVideoOrder(videoId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(propertyVideos)
    .set({ displayOrder })
    .where(eq(propertyVideos.id, videoId));
}


// ===== PROJECTS FUNCTIONS =====

/**
 * Get all projects with their related data
 */
export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  
  const projectsList = await db.select().from(projects).orderBy(desc(projects.createdAt));
  
  // Fetch related data for each project
  const projectsWithData = await Promise.all(
    projectsList.map(async (project) => {
      const [amenitiesList, floorPlansList, imagesList] = await Promise.all([
        getProjectAmenities(project.id),
        getProjectFloorPlans(project.id),
        getProjectImages(project.id),
      ]);
      
      return {
        ...project,
        amenities: amenitiesList,
        floorPlans: floorPlansList,
        images: imagesList,
      };
    })
  );
  
  return projectsWithData;
}

/**
 * Get a single project by ID with all related data
 */
export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (result.length === 0) return null;
  
  const project = result[0];
  
  // Fetch all related data
  const [amenitiesList, floorPlansList, imagesList, videosList] = await Promise.all([
    getProjectAmenities(id),
    getProjectFloorPlans(id),
    getProjectImages(id),
    getProjectVideos(id),
  ]);
  
  return {
    ...project,
    amenities: amenitiesList,
    floorPlans: floorPlansList,
    images: imagesList,
    videos: videosList,
  };
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects() {
  const db = await getDb();
  if (!db) return [];
  
  const projectsList = await db
    .select()
    .from(projects)
    .where(eq(projects.featured, true))
    .orderBy(desc(projects.createdAt))
    .limit(6);
  
  // Fetch related data for each project
  const projectsWithData = await Promise.all(
    projectsList.map(async (project) => {
      const [amenitiesList, floorPlansList] = await Promise.all([
        getProjectAmenities(project.id),
        getProjectFloorPlans(project.id),
      ]);
      
      return {
        ...project,
        amenities: amenitiesList,
        floorPlans: floorPlansList,
      };
    })
  );
  
  return projectsWithData;
}

/**
 * Search projects with filters
 */
export async function searchProjects(filters: {
  location?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(projects);
  const conditions = [];
  
  if (filters.location) {
    conditions.push(eq(projects.location, filters.location));
  }
  
  if (filters.status) {
    conditions.push(eq(projects.status, filters.status as any));
  }
  
  if (filters.minPrice) {
    conditions.push(sql`${projects.minPrice} >= ${filters.minPrice}`);
  }
  
  if (filters.maxPrice) {
    conditions.push(sql`${projects.maxPrice} <= ${filters.maxPrice}`);
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const projectsList = await query.orderBy(desc(projects.createdAt));
  
  // Fetch related data for each project
  const projectsWithData = await Promise.all(
    projectsList.map(async (project) => {
      const [amenitiesList, floorPlansList] = await Promise.all([
        getProjectAmenities(project.id),
        getProjectFloorPlans(project.id),
      ]);
      
      return {
        ...project,
        amenities: amenitiesList,
        floorPlans: floorPlansList,
      };
    })
  );
  
  return projectsWithData;
}

/**
 * Get project amenities
 */
export async function getProjectAmenities(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectAmenities)
    .where(eq(projectAmenities.projectId, projectId))
    .orderBy(projectAmenities.displayOrder);
}

/**
 * Get project floor plans
 */
export async function getProjectFloorPlans(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectFloorPlans)
    .where(eq(projectFloorPlans.projectId, projectId))
    .orderBy(projectFloorPlans.displayOrder);
}

/**
 * Get project images
 */
export async function getProjectImages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectImages)
    .where(eq(projectImages.projectId, projectId))
    .orderBy(projectImages.displayOrder);
}

/**
 * Get project videos
 */
export async function getProjectVideos(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectVideos)
    .where(eq(projectVideos.projectId, projectId))
    .orderBy(projectVideos.displayOrder);
}
