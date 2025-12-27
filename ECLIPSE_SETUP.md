# Nivaara Real Estate - Eclipse Setup Guide

This guide will help you clone and set up the Nivaara Real Estate application in Eclipse IDE.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Eclipse IDE** (Latest version recommended)
   - Download from: https://www.eclipse.org/downloads/

2. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

3. **pnpm** (Package manager)
   - Install: `npm install -g pnpm`
   - Verify: `pnpm --version`

4. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

## Step 1: Clone the Repository

### Option A: Using Eclipse Git Integration

1. Open Eclipse IDE
2. Go to **File → Import → Git → Projects from Git → Clone URI**
3. Enter the repository URL: `https://github.com/ayush954-bot/Nivaara.git`
4. Click **Next** and select the `main` branch
5. Choose a local directory for the project
6. Click **Finish**

### Option B: Using Command Line

```bash
# Navigate to your workspace directory
cd /path/to/your/workspace

# Clone the repository
git clone https://github.com/ayush954-bot/Nivaara.git

# Navigate into the project
cd Nivaara
```

Then import into Eclipse:
1. **File → Open Projects from File System**
2. Select the `Nivaara` directory
3. Click **Finish**

## Step 2: Install Dependencies

Open a terminal in Eclipse (or external terminal) and run:

```bash
# Navigate to project directory
cd /path/to/Nivaara

# Install all dependencies
pnpm install
```

This will install all required packages for both frontend and backend.

## Step 3: Configure Environment Variables

The project uses environment variables for database and authentication. These are automatically configured when deployed on Manus hosting, but for local development:

1. The `.env` file is already configured with Manus-provided credentials
2. **Do not commit** `.env` to Git (it's in `.gitignore`)
3. For local MySQL setup, you would need to update `DATABASE_URL` in `.env`

## Step 4: Database Setup

The project uses MySQL database with Drizzle ORM.

### View Database Schema

Database schema is defined in: `drizzle/schema.ts`

Tables:
- **users** - User authentication
- **properties** - Property listings
- **inquiries** - Contact form submissions
- **testimonials** - Client testimonials

### Run Migrations (if needed)

```bash
pnpm db:push
```

### Seed Sample Data

```bash
npx tsx seed-db.mjs
```

This will populate the database with 8 sample properties and 3 testimonials.

## Step 5: Run the Development Server

```bash
# Start the development server
pnpm dev
```

The application will start on: `http://localhost:3000`

## Step 6: Run Tests

```bash
# Run all unit tests
pnpm test
```

All 20 tests should pass successfully.

## Project Structure

```
nivaara-real-estate/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main app component
├── server/                # Backend Express + tRPC
│   ├── _core/            # Core server functionality
│   ├── routers.ts        # API route definitions
│   ├── db.ts             # Database helper functions
│   └── routers.test.ts   # API tests
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database table definitions
├── shared/               # Shared types and constants
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run unit tests
- `pnpm db:push` - Push database schema changes
- `pnpm check` - TypeScript type checking
- `pnpm format` - Format code with Prettier

## Key Features

1. **Full-Stack Application** - React frontend + Express backend
2. **Database Integration** - MySQL with Drizzle ORM
3. **tRPC API** - Type-safe API endpoints
4. **Property Management** - Dynamic property listings with filtering
5. **Contact Form** - Saves inquiries to database
6. **Google Maps Integration** - Interactive location maps
7. **Responsive Design** - Mobile-friendly UI with Tailwind CSS
8. **Unit Tests** - Comprehensive test coverage

## Development Tips

### Working with Eclipse

1. **Install Node.js Plugin**
   - Go to **Help → Eclipse Marketplace**
   - Search for "Wild Web Developer"
   - Install for better JavaScript/TypeScript support

2. **Format on Save**
   - The project uses Prettier for code formatting
   - Configure Eclipse to run Prettier on save

3. **Terminal Access**
   - Use **Window → Show View → Terminal** for integrated terminal
   - Or use external terminal for better experience

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Database Connection Error**
- Ensure `DATABASE_URL` is correctly set in `.env`
- Check if MySQL server is running

**Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Deployment

The application is designed to be deployed on Manus hosting platform, which provides:
- Automatic database provisioning
- Built-in authentication
- Free SSL certificates
- Custom domain support

To deploy:
1. Create a checkpoint in Manus UI
2. Click **Publish** button
3. Your site will be live at `*.manus.space`

## Support

For issues or questions:
- Check `todo.md` for project status
- Review test files for API usage examples
- Consult Manus documentation: https://docs.manus.im

## License

MIT License - Feel free to modify and use for your projects.
