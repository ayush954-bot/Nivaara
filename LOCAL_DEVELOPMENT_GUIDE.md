# Nivaara Real Estate - Local Development Guide

This guide provides complete instructions for setting up the Nivaara Real Estate application on your local machine with a local MySQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MySQL Database Setup](#mysql-database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Application Setup](#application-setup)
5. [Database Migration & Seeding](#database-migration--seeding)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install the following software before proceeding:

### 1. Node.js (v18 or higher)
```bash
# Download from: https://nodejs.org/
# Verify installation
node --version
npm --version
```

### 2. pnpm (Package Manager)
```bash
# Install globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### 3. MySQL Server (v8.0 or higher)

**Windows:**
- Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
- Choose "MySQL Server" and "MySQL Workbench" during installation
- Set root password during installation (remember this!)

**macOS:**
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

### 4. Git
```bash
# Download from: https://git-scm.com/
# Verify installation
git --version
```

---

## MySQL Database Setup

### Step 1: Access MySQL

```bash
# Login to MySQL as root
mysql -u root -p
# Enter your root password when prompted
```

### Step 2: Create Database

```sql
-- Create a new database for Nivaara
CREATE DATABASE nivaara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify database creation
SHOW DATABASES;
```

### Step 3: Create Database User (Recommended)

```sql
-- Create a dedicated user for the application
CREATE USER 'nivaara_user'@'localhost' IDENTIFIED BY 'nivaara_password_123';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON nivaara_db.* TO 'nivaara_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 4: Test Connection

```bash
# Test login with new user
mysql -u nivaara_user -p nivaara_db
# Enter password: nivaara_password_123

# If successful, you'll see MySQL prompt
# Exit with: EXIT;
```

---

## Environment Configuration

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/ayush954-bot/Nivaara.git
cd Nivaara
```

### Step 2: Create .env File

Create a file named `.env` in the project root directory:

```bash
# Create .env file
touch .env
```

### Step 3: Configure Environment Variables

Copy the following content into your `.env` file:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Format: mysql://username:password@host:port/database
DATABASE_URL=mysql://nivaara_user:nivaara_password_123@localhost:3306/nivaara_db

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Node environment
NODE_ENV=development

# Server port
PORT=3000

# ============================================
# AUTHENTICATION (Manus OAuth - Optional for local dev)
# ============================================
# These are used by Manus hosting platform
# For local development, you can leave these as placeholders
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your_owner_id_here
OWNER_NAME=Your Name

# ============================================
# JWT SECRET (for session management)
# ============================================
# Generate a random secret: openssl rand -base64 32
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# ============================================
# FRONTEND CONFIGURATION
# ============================================
VITE_APP_ID=nivaara-real-estate
VITE_APP_TITLE=Nivaara Real Estate
VITE_APP_LOGO=/logo.png

# Analytics (Optional - for Manus hosting)
VITE_ANALYTICS_WEBSITE_ID=
VITE_ANALYTICS_ENDPOINT=

# Forge API (Optional - for Manus features)
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
BUILT_IN_FORGE_API_URL=

# OAuth Portal (Optional - for Manus hosting)
VITE_OAUTH_PORTAL_URL=https://api.manus.im
```

### Important Notes:

1. **DATABASE_URL**: Update with your MySQL credentials
   - Format: `mysql://username:password@host:port/database`
   - Example: `mysql://nivaara_user:nivaara_password_123@localhost:3306/nivaara_db`

2. **JWT_SECRET**: Generate a secure random string
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   ```

3. **Optional Variables**: Variables marked as "Optional" are for Manus hosting features. You can leave them empty for local development.

---

## Application Setup

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd Nivaara

# Install all dependencies
pnpm install
```

This will install:
- Frontend dependencies (React, Tailwind CSS, etc.)
- Backend dependencies (Express, tRPC, Drizzle ORM, etc.)
- Development tools (TypeScript, Vite, Vitest, etc.)

### Step 2: Verify Installation

```bash
# Check if installation was successful
pnpm list --depth=0
```

---

## Database Migration & Seeding

### Step 1: Generate and Run Migrations

```bash
# This command will:
# 1. Generate migration files from schema
# 2. Apply migrations to create tables
pnpm db:push
```

Expected output:
```
✓ Your SQL migration file ➜ drizzle/0001_perpetual_stature.sql 🚀
✓ migrations applied successfully!
```

### Step 2: Verify Tables Created

```bash
# Login to MySQL
mysql -u nivaara_user -p nivaara_db

# Show all tables
SHOW TABLES;
```

You should see:
```
+----------------------+
| Tables_in_nivaara_db |
+----------------------+
| inquiries            |
| properties           |
| testimonials         |
| users                |
+----------------------+
```

### Step 3: Seed Sample Data

```bash
# Run the seed script to populate sample data
npx tsx seed-db.mjs
```

Expected output:
```
🌱 Seeding database...
📦 Inserting properties...
✅ Inserted 8 properties
💬 Inserting testimonials...
✅ Inserted 3 testimonials
🎉 Database seeded successfully!
```

### Step 4: Verify Data

```bash
# Check properties
mysql -u nivaara_user -p nivaara_db -e "SELECT id, title, location, price FROM properties;"

# Check testimonials
mysql -u nivaara_user -p nivaara_db -e "SELECT id, name, location FROM testimonials;"
```

---

## Running the Application

### Step 1: Start Development Server

```bash
# Start the development server
pnpm dev
```

Expected output:
```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

### Step 2: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Nivaara Real Estate homepage with:
- Hero section with "We Build Trust" tagline
- Property listings
- Testimonials
- All navigation working

### Step 3: Test Features

1. **Browse Properties**: Click "Properties" in navigation
   - Should see 8 sample properties
   - Test filters (Location, Type, Status)

2. **Contact Form**: Click "Contact" in navigation
   - Fill out the form
   - Submit and check database:
   ```bash
   mysql -u nivaara_user -p nivaara_db -e "SELECT * FROM inquiries ORDER BY createdAt DESC LIMIT 1;"
   ```

3. **View Locations**: Click "Locations" in navigation
   - Should see interactive map with Pune zones

### Step 4: Run Tests

```bash
# Run all unit tests
pnpm test
```

Expected output:
```
✓ server/auth.logout.test.ts (1 test)
✓ server/routers.test.ts (19 tests)
Test Files  2 passed (2)
Tests  20 passed (20)
```

---

## Project Structure

```
Nivaara/
├── client/                      # Frontend React application
│   ├── public/                 # Static assets (images, favicon)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   ├── Footer.tsx     # Footer component
│   │   │   └── Map.tsx        # Google Maps integration
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx       # Homepage
│   │   │   ├── Properties.tsx # Property listings
│   │   │   ├── Contact.tsx    # Contact form
│   │   │   └── ...            # Other pages
│   │   ├── lib/               # Utility functions
│   │   │   └── trpc.ts        # tRPC client setup
│   │   ├── App.tsx            # Main app with routes
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles
│   └── index.html             # HTML template
│
├── server/                     # Backend Express + tRPC
│   ├── _core/                 # Core server functionality
│   │   ├── index.ts          # Express server setup
│   │   ├── trpc.ts           # tRPC configuration
│   │   └── ...               # Auth, cookies, etc.
│   ├── routers.ts            # API route definitions
│   ├── routers.test.ts       # API unit tests
│   └── db.ts                 # Database helper functions
│
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Table definitions
│   └── 0001_*.sql            # Migration files
│
├── shared/                    # Shared types and constants
│   └── const.ts              # Shared constants
│
├── seed-db.mjs               # Database seeding script
├── package.json              # Dependencies and scripts
├── drizzle.config.ts         # Drizzle ORM configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── .env                      # Environment variables (create this)
├── .env.example              # Example environment file
└── README.md                 # Project documentation
```

---

## Available Scripts

```bash
# Development
pnpm dev              # Start development server (frontend + backend)
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Generate and apply database migrations
npx tsx seed-db.mjs   # Seed sample data

# Testing
pnpm test             # Run all unit tests
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier

# Utilities
npx kill-port 3000    # Kill process on port 3000
```

---

## Database Schema Reference

### Properties Table

| Column      | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | int     | Primary key (auto-increment)         |
| title       | varchar | Property title                       |
| description | text    | Detailed description                 |
| propertyType| enum    | Flat, Shop, Office, Land, Rental     |
| status      | enum    | Ready, Under-Construction            |
| location    | varchar | City/Zone (e.g., "Pune - East Zone") |
| area        | varchar | Specific area (e.g., "Kharadi")      |
| price       | decimal | Price in rupees                      |
| priceLabel  | varchar | Display price (e.g., "₹55L")         |
| bedrooms    | int     | Number of bedrooms (nullable)        |
| bathrooms   | int     | Number of bathrooms (nullable)       |
| area_sqft   | int     | Area in square feet (nullable)       |
| builder     | varchar | Builder/Developer name (nullable)    |
| imageUrl    | text    | Property image URL                   |
| featured    | boolean | Featured property flag               |
| createdAt   | timestamp | Creation timestamp                  |
| updatedAt   | timestamp | Last update timestamp               |

### Inquiries Table

| Column      | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | int     | Primary key (auto-increment)         |
| name        | varchar | Inquirer name                        |
| email       | varchar | Email address                        |
| phone       | varchar | Phone number                         |
| message     | text    | Inquiry message                      |
| propertyId  | int     | Related property ID (nullable)       |
| inquiryType | enum    | general, property, consultation      |
| status      | enum    | new, contacted, closed               |
| createdAt   | timestamp | Creation timestamp                  |
| updatedAt   | timestamp | Last update timestamp               |

### Testimonials Table

| Column      | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | int     | Primary key (auto-increment)         |
| name        | varchar | Client name                          |
| location    | varchar | Client location                      |
| text        | text    | Testimonial text                     |
| rating      | int     | Rating (1-5)                         |
| isPublished | boolean | Published status                     |
| createdAt   | timestamp | Creation timestamp                  |
| updatedAt   | timestamp | Last update timestamp               |

---

## Troubleshooting

### Issue: Cannot connect to MySQL

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Check if MySQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   
   # Windows
   # Check Services app for "MySQL80" service
   ```

2. Verify MySQL port:
   ```bash
   mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"
   ```

3. Check DATABASE_URL in `.env` file

### Issue: Access denied for user

**Error:** `Error: Access denied for user 'nivaara_user'@'localhost'`

**Solutions:**
1. Verify username and password in `.env`
2. Recreate user:
   ```sql
   DROP USER 'nivaara_user'@'localhost';
   CREATE USER 'nivaara_user'@'localhost' IDENTIFIED BY 'nivaara_password_123';
   GRANT ALL PRIVILEGES ON nivaara_db.* TO 'nivaara_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Issue: Port 3000 already in use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 pnpm dev
```

### Issue: Module not found

**Error:** `Cannot find module '...'`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Database tables not created

**Solution:**
```bash
# Manually run migrations
pnpm db:push

# If that fails, check MySQL connection
mysql -u nivaara_user -p nivaara_db
```

### Issue: Seed script fails

**Error:** `Failed to insert properties`

**Solution:**
1. Ensure tables exist: `pnpm db:push`
2. Check if data already exists:
   ```sql
   SELECT COUNT(*) FROM properties;
   ```
3. Clear existing data if needed:
   ```sql
   TRUNCATE TABLE properties;
   TRUNCATE TABLE testimonials;
   ```
4. Run seed again: `npx tsx seed-db.mjs`

---

## Additional Resources

### MySQL GUI Tools

- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

### Useful MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use database
USE nivaara_db;

-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE properties;

-- Count records
SELECT COUNT(*) FROM properties;

-- View recent inquiries
SELECT * FROM inquiries ORDER BY createdAt DESC LIMIT 10;

-- Clear all data from a table
TRUNCATE TABLE inquiries;

-- Drop and recreate database (careful!)
DROP DATABASE nivaara_db;
CREATE DATABASE nivaara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Production Deployment

This application is designed for deployment on **Manus hosting platform**, which provides:

- Automatic MySQL database provisioning
- Built-in authentication with OAuth
- Environment variable management
- Free SSL certificates
- Custom domain support
- Zero-config deployment

For production deployment:
1. Push code to Manus platform
2. Create checkpoint
3. Click "Publish" button
4. Your site goes live at `*.manus.space`

---

## Support & Documentation

- **Project Repository**: https://github.com/ayush954-bot/Nivaara
- **Manus Documentation**: https://docs.manus.im
- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **tRPC Documentation**: https://trpc.io/

---

## License

MIT License - Free to use and modify for your projects.
