/**
 * Database Backup Module
 * Provides automated database backup functionality with S3 storage
 */

import mysql from "mysql2/promise";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

// Tables to backup (in order to handle foreign key dependencies)
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
];

function escapeValue(value: unknown): string {
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

async function exportTable(connection: mysql.Connection, tableName: string): Promise<string> {
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`) as [Record<string, unknown>[], unknown];
    
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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Backup] Error exporting table ${tableName}:`, message);
    return `-- Table ${tableName}: Error - ${message}\n\n`;
  }
}

export interface BackupResult {
  success: boolean;
  filename: string;
  url?: string;
  size: number;
  tables: number;
  timestamp: string;
  error?: string;
}

/**
 * Create a full database backup and upload to S3
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup/nivaara-db-${timestamp}.sql`;
  
  console.log("[Backup] Starting database backup...");
  
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL not configured");
    }
    
    const connection = await mysql.createConnection(DATABASE_URL);
    
    let sql = `-- Nivaara Real Estate Database Backup\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Automated Daily Backup\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
    
    let tablesExported = 0;
    for (const table of TABLES) {
      console.log(`[Backup] Exporting ${table}...`);
      sql += await exportTable(connection, table);
      tablesExported++;
    }
    
    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    
    await connection.end();
    
    // Upload to S3
    console.log("[Backup] Uploading to S3...");
    const buffer = Buffer.from(sql, "utf-8");
    const { url } = await storagePut(filename, buffer, "application/sql");
    
    console.log(`[Backup] Backup complete: ${filename}`);
    
    // Notify owner of successful backup
    await notifyOwner({
      title: "Database Backup Complete",
      content: `Daily database backup completed successfully.\n\nFile: ${filename}\nSize: ${(buffer.length / 1024).toFixed(2)} KB\nTables: ${tablesExported}\nTime: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    });
    
    return {
      success: true,
      filename,
      url,
      size: buffer.length,
      tables: tablesExported,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Backup] Backup failed:", message);
    
    // Notify owner of failed backup
    await notifyOwner({
      title: "Database Backup Failed",
      content: `Daily database backup failed.\n\nError: ${message}\nTime: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\nPlease check the server logs for more details.`,
    });
    
    return {
      success: false,
      filename,
      size: 0,
      tables: 0,
      timestamp: new Date().toISOString(),
      error: message,
    };
  }
}

/**
 * List recent backups from S3
 */
export async function listBackups(): Promise<string[]> {
  // This would require listing S3 objects - for now return empty
  // In production, implement S3 listObjects
  return [];
}
