import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const caladium = await db.query.projects.findFirst({
  where: eq(schema.projects.slug, 'caladium')
});

console.log('Caladium project data:');
console.log(JSON.stringify(caladium, null, 2));

await connection.end();
