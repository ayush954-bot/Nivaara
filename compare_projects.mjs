import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, inArray } from 'drizzle-orm';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Get Caladium and working projects
const projects = await db.query.projects.findMany({
  where: inArray(schema.projects.slug, ['caladium', 'kumar-prive', 'pride-purple-park-eden'])
});

console.log('Project comparison:');
projects.forEach(p => {
  console.log(`\n=== ${p.name} (${p.slug}) ===`);
  console.log(`coverImage: ${p.coverImage}`);
  console.log(`badge: ${p.badge}`);
  console.log(`customBadgeText: ${p.customBadgeText}`);
  console.log(`status: ${p.status}`);
  console.log(`Image URL type: ${p.coverImage?.startsWith('http') ? 'External CDN' : 'Local'}`);
});

await connection.end();
