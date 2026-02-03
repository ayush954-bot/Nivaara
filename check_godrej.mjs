import { getDb } from "./server/db.ts";
import { projects } from "./drizzle/schema.ts";
import { like } from "drizzle-orm";

const db = await getDb();
const godrej = await db.select().from(projects).where(like(projects.name, '%Godrej%'));

console.log("Godrej projects:");
console.log(JSON.stringify(godrej, null, 2));
