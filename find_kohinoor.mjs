import * as dbModule from './server/db.ts';
import { properties } from './drizzle/schema.ts';
import { like } from 'drizzle-orm';

const db = dbModule.db || dbModule.default;
const results = await db.select().from(properties).where(like(properties.title, '%Kohinoor%'));
console.log(JSON.stringify(results, null, 2));
process.exit(0);
