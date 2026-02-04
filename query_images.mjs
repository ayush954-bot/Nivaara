import { drizzle } from "drizzle-orm/mysql2";
import { projects, properties } from "./drizzle/schema.ts";
import dotenv from 'dotenv';

dotenv.config();

async function queryImages() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('\n=== PROJECTS ===\n');
  const allProjects = await db.select({
    id: projects.id,
    name: projects.name,
    slug: projects.slug,
    coverImage: projects.coverImage
  }).from(projects);
  
  allProjects.forEach(p => {
    const isCDN = p.coverImage && (p.coverImage.includes('cloudfront') || p.coverImage.includes('d3'));
    const prefix = isCDN ? '❌ CDN' : '✅ LOCAL';
    console.log(`${prefix} | ${p.name} (${p.slug})`);
    console.log(`         ${p.coverImage}`);
    console.log('');
  });
  
  console.log(`\nTotal projects: ${allProjects.length}`);
  console.log(`CDN URLs: ${allProjects.filter(p => p.coverImage && (p.coverImage.includes('cloudfront') || p.coverImage.includes('d3'))).length}`);
  
  console.log('\n=== PROPERTIES (first 20) ===\n');
  const allProperties = await db.select({
    id: properties.id,
    name: properties.name,
    slug: properties.slug,
    coverImage: properties.coverImage
  }).from(properties).limit(20);
  
  allProperties.forEach(p => {
    const isCDN = p.coverImage && (p.coverImage.includes('cloudfront') || p.coverImage.includes('d3'));
    const prefix = isCDN ? '❌ CDN' : '✅ LOCAL';
    console.log(`${prefix} | ${p.name} (${p.slug})`);
    console.log(`         ${p.coverImage}`);
    console.log('');
  });
  
  console.log(`\nShowing first 20 properties`);
  console.log(`CDN URLs: ${allProperties.filter(p => p.coverImage && (p.coverImage.includes('cloudfront') || p.coverImage.includes('d3'))).length}`);
  
  process.exit(0);
}

queryImages().catch(console.error);
