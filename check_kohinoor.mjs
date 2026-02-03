import * as dbModule from './server/db.ts';
import { projects } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = dbModule.db || dbModule.default;
const result = await db.select().from(projects).where(eq(projects.slug, 'kohinoor-keleido-phase-2'));
console.log(JSON.stringify(result, null, 2));
process.exit(0);
