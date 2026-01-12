import bcrypt from 'bcryptjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const db = new Database('./sqlite.db');

const username = 'nivaara';
const password = 'Nivaara@123';
const name = 'Nivaara Staff';
const role = 'property_manager';

// Hash password
const hashedPassword = bcrypt.hashSync(password, 10);

// Check if username already exists
const existing = db.prepare('SELECT id FROM staff WHERE username = ?').get(username);

if (existing) {
  console.log('Username already exists. Updating password...');
  db.prepare('UPDATE staff SET password_hash = ?, name = ?, role = ? WHERE username = ?')
    .run(hashedPassword, name, role, username);
  console.log('✅ Staff account updated successfully!');
} else {
  console.log('Creating new staff account...');
  db.prepare('INSERT INTO staff (username, password_hash, name, role) VALUES (?, ?, ?, ?)')
    .run(username, hashedPassword, name, role);
  console.log('✅ Staff account created successfully!');
}

console.log('\n📋 Staff Credentials:');
console.log('Username:', username);
console.log('Password:', password);
console.log('Name:', name);
console.log('Role:', role);

db.close();
