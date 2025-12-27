# Environment Variables Guide

This document explains all environment variables used in the Nivaara Real Estate application.

## Overview

The application uses environment variables for configuration. These are stored in a `.env` file that is **NOT** committed to Git for security reasons.

## Creating Your .env File

1. Create a new file named `.env` in the project root directory
2. Copy the configuration below
3. Update values according to your setup

## Environment Variables Configuration

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# MySQL connection string
# Format: mysql://username:password@host:port/database

# For local development with MySQL installed on your machine:
DATABASE_URL=mysql://nivaara_user:nivaara_password_123@localhost:3306/nivaara_db

# For production (Manus hosting provides this automatically):
# DATABASE_URL=mysql://user:pass@host:port/db

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000

# ============================================
# AUTHENTICATION (Manus OAuth)
# ============================================
# These are automatically provided by Manus hosting
# For local development, you can use placeholder values
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your_owner_id_here
OWNER_NAME=Your Name

# ============================================
# JWT SECRET (Session Management)
# ============================================
# Generate a secure random secret:
# Run in terminal: openssl rand -base64 32
# Then paste the output here
JWT_SECRET=your_generated_jwt_secret_here

# ============================================
# FRONTEND CONFIGURATION
# ============================================
VITE_APP_ID=nivaara-real-estate
VITE_APP_TITLE=Nivaara Real Estate
VITE_APP_LOGO=/logo.png

# ============================================
# OPTIONAL - Manus Hosting Features
# ============================================
# Leave these empty for local development
VITE_ANALYTICS_WEBSITE_ID=
VITE_ANALYTICS_ENDPOINT=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
BUILT_IN_FORGE_API_URL=
VITE_OAUTH_PORTAL_URL=https://api.manus.im
```

## Variable Descriptions

### DATABASE_URL (Required)

**Purpose**: MySQL database connection string

**Format**: `mysql://username:password@host:port/database`

**Examples**:
- Local: `mysql://nivaara_user:nivaara_password_123@localhost:3306/nivaara_db`
- Remote: `mysql://user:pass@db.example.com:3306/production_db`

**Setup Instructions**:
1. Install MySQL on your machine
2. Create database: `CREATE DATABASE nivaara_db;`
3. Create user: `CREATE USER 'nivaara_user'@'localhost' IDENTIFIED BY 'nivaara_password_123';`
4. Grant permissions: `GRANT ALL PRIVILEGES ON nivaara_db.* TO 'nivaara_user'@'localhost';`
5. Update DATABASE_URL with your credentials

### NODE_ENV (Required)

**Purpose**: Application environment mode

**Values**:
- `development` - For local development (enables debugging, hot reload)
- `production` - For production deployment (optimized builds)
- `test` - For running tests

**Default**: `development`

### PORT (Optional)

**Purpose**: Server port number

**Default**: `3000`

**Example**: Change to `3001` if port 3000 is already in use

### JWT_SECRET (Required)

**Purpose**: Secret key for signing JWT tokens (session management)

**How to Generate**:
```bash
# Run this command in terminal
openssl rand -base64 32
```

**Example Output**: `xK7mP9qR2sT4uV6wX8yZ0aB1cD3eF5gH7iJ9kL1mN3oP5qR7sT9uV1wX3yZ5aB7c=`

**Security**: 
- Use a different secret for each environment
- Never share or commit this value
- Minimum 32 characters recommended

### VITE_APP_* Variables (Frontend Configuration)

**VITE_APP_ID**: Unique application identifier
- Example: `nivaara-real-estate`

**VITE_APP_TITLE**: Website title (appears in browser tab)
- Example: `Nivaara Real Estate`

**VITE_APP_LOGO**: Logo file path (relative to public folder)
- Example: `/logo.png`

### OAuth Variables (Optional for Local Dev)

These are automatically provided by Manus hosting platform:

**OAUTH_SERVER_URL**: OAuth server endpoint
- Default: `https://api.manus.im`

**OWNER_OPEN_ID**: Owner's unique identifier
- Provided by Manus platform

**OWNER_NAME**: Owner's display name
- Example: `Your Name`

### Analytics Variables (Optional)

Used for website analytics on Manus hosting:

**VITE_ANALYTICS_WEBSITE_ID**: Analytics tracking ID
**VITE_ANALYTICS_ENDPOINT**: Analytics API endpoint

Leave empty for local development.

### Forge API Variables (Optional)

Used for Manus platform features:

**VITE_FRONTEND_FORGE_API_KEY**: Frontend API key
**VITE_FRONTEND_FORGE_API_URL**: Frontend API URL
**BUILT_IN_FORGE_API_KEY**: Backend API key
**BUILT_IN_FORGE_API_URL**: Backend API URL

Leave empty for local development.

## Example .env File for Local Development

Here's a complete example for local MySQL setup:

```env
# Database (update with your MySQL credentials)
DATABASE_URL=mysql://nivaara_user:nivaara_password_123@localhost:3306/nivaara_db

# Application
NODE_ENV=development
PORT=3000

# Authentication (placeholders for local dev)
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=local_dev_user
OWNER_NAME=Local Developer

# JWT Secret (generate your own!)
JWT_SECRET=xK7mP9qR2sT4uV6wX8yZ0aB1cD3eF5gH7iJ9kL1mN3oP5qR7sT9uV1wX3yZ5aB7c

# Frontend
VITE_APP_ID=nivaara-real-estate
VITE_APP_TITLE=Nivaara Real Estate
VITE_APP_LOGO=/logo.png

# Optional (leave empty)
VITE_ANALYTICS_WEBSITE_ID=
VITE_ANALYTICS_ENDPOINT=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
BUILT_IN_FORGE_API_URL=
VITE_OAUTH_PORTAL_URL=https://api.manus.im
```

## Security Best Practices

1. **Never Commit .env**: The `.env` file is in `.gitignore` - keep it that way
2. **Use Strong Secrets**: Generate cryptographically secure random strings
3. **Different Secrets Per Environment**: Use different JWT_SECRET for dev/prod
4. **Rotate Secrets**: Change secrets periodically, especially after team changes
5. **Limit Access**: Only share credentials with team members who need them

## Troubleshooting

### Error: "DATABASE_URL is not defined"

**Solution**: Ensure `.env` file exists in project root with DATABASE_URL set

### Error: "Cannot connect to database"

**Solutions**:
1. Verify MySQL is running: `mysql -u root -p`
2. Check DATABASE_URL format is correct
3. Test connection: `mysql -u nivaara_user -p nivaara_db`
4. Ensure user has permissions

### Error: "JWT_SECRET is not defined"

**Solution**: Add JWT_SECRET to `.env` file (generate with `openssl rand -base64 32`)

### Environment Variables Not Loading

**Solutions**:
1. Ensure `.env` file is in project root (same level as `package.json`)
2. Restart development server: `pnpm dev`
3. Check for syntax errors in `.env` (no spaces around `=`)
4. Verify file is named exactly `.env` (not `.env.txt`)

## Production Deployment (Manus Hosting)

When deploying to Manus hosting:

1. **Database**: Automatically provisioned and DATABASE_URL is set
2. **OAuth**: Automatically configured
3. **Secrets**: Managed through Manus UI (Settings → Secrets)
4. **No .env File Needed**: All variables are injected by platform

## Additional Resources

- **Local Development Guide**: See `LOCAL_DEVELOPMENT_GUIDE.md`
- **MySQL Setup**: See database setup section in local guide
- **Manus Documentation**: https://docs.manus.im

## Support

For issues with environment configuration:
1. Check this guide for variable descriptions
2. Review `LOCAL_DEVELOPMENT_GUIDE.md` for setup steps
3. Verify MySQL connection independently
4. Check application logs for specific error messages
