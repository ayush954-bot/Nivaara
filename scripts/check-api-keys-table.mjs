import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SHOW TABLES LIKE 'api_keys'");
if (rows.length > 0) {
  console.log("api_keys table already exists");
} else {
  await conn.execute(`
    CREATE TABLE api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      keyHash VARCHAR(64) NOT NULL UNIQUE,
      keyPrefix VARCHAR(12) NOT NULL,
      label VARCHAR(255) NOT NULL,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      lastUsedAt TIMESTAMP NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("api_keys table created successfully");
}
await conn.end();
