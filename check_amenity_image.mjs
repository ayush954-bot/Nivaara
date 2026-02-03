import { getDb } from "./server/db.ts";
import { projectAmenities } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = await getDb();
const amenities = await db.select().from(projectAmenities).where(eq(projectAmenities.projectId, 30001));

console.log("Amenities for Caladium project (ID 30001):");
console.log(JSON.stringify(amenities, null, 2));
