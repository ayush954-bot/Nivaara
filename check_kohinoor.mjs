import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import { eq, like } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const projects = await db.select().from(schema.projects).where(like(schema.projects.name, '%kohinoor%'));

console.log(JSON.stringify(projects, null, 2));

await connection.end();
