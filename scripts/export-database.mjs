/**
 * Database Export Script
 * Exports all database tables to SQL format for backup and version control
 * 
 * Usage: node scripts/export-database.mjs
 * Output: database/backup/data-export-YYYY-MM-DD.sql
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Tables to export (in order to handle foreign key dependencies)
const TABLES = [
  "users",
  "projects",
  "project_amenities",
  "project_floor_plans",
  "project_images",
  "project_videos",
  "properties",
  "property_images",
  "property_videos",
  "inquiries",
  "staff_users",
];

function escapeValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  }
  // Escape string values
  const escaped = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return `'${escaped}'`;
}

async function exportTable(connection, tableName) {
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      return `-- Table ${tableName}: No data\n\n`;
    }
    
    const columns = Object.keys(rows[0]);
    let sql = `-- Table: ${tableName}\n`;
    sql += `-- Records: ${rows.length}\n`;
    sql += `DELETE FROM \`${tableName}\`;\n`;
    
    for (const row of rows) {
      const values = columns.map(col => escapeValue(row[col]));
      sql += `INSERT INTO \`${tableName}\` (\`${columns.join("`, `")}\`) VALUES (${values.join(", ")});\n`;
    }
    
    sql += "\n";
    return sql;
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error.message);
    return `-- Table ${tableName}: Error - ${error.message}\n\n`;
  }
}

async function main() {
  console.log("Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);
  
  const timestamp = new Date().toISOString().split("T")[0];
  const backupDir = path.resolve(__dirname, "..", "database", "backup");
  const outputFile = path.join(backupDir, `data-export-${timestamp}.sql`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  let sql = `-- Nivaara Real Estate Database Export\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Database: ${DATABASE_URL.split("/").pop().split("?")[0]}\n\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
  
  console.log("Exporting tables...");
  for (const table of TABLES) {
    console.log(`  Exporting ${table}...`);
    sql += await exportTable(connection, table);
  }
  
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  
  // Write to file
  fs.writeFileSync(outputFile, sql);
  console.log(`\nExport complete: ${outputFile}`);
  
  // Also create a latest symlink/copy
  const latestFile = path.join(backupDir, "data-export-latest.sql");
  fs.copyFileSync(outputFile, latestFile);
  console.log(`Latest backup: ${latestFile}`);
  
  await connection.end();
}

main().catch(console.error);
