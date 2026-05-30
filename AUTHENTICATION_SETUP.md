# Vortix Authentication & Database Setup Guide

This guide will help you set up authentication with Clerk and database with
PostgreSQL for Vortix.

---

## 📋 Prerequisites

- Node.js 14+ installed
- npm or yarn
- A Clerk account (free tier available)
- PostgreSQL database (local or cloud)

---

## 🔐 Part 1: Clerk Authentication Setup

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Next.js" as your framework

### Step 2: Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Configure Dashboard Environment Variables

Update `dashboard/.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs (optional - defaults work for most cases)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend WebSocket URL
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
```

### Step 4: Configure Backend Environment Variables

Update `backend/.env`:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_key_here
```

### Step 5: Test Authentication

1. Start the dashboard: `cd dashboard && npm run dev`
2. Visit `http://localhost:3000/auth`
3. Try signing up with a test account
4. You should be redirected to `/dashboard` after successful sign-up

---

## 🗄️ Part 2: Database Setup

### Option A: Local PostgreSQL (Development)

#### Install PostgreSQL

**Windows:**

```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux:**

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vortix;

# Create user (optional)
CREATE USER vortix_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vortix TO vortix_user;

# Exit
\q
```

#### Update Backend .env

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/vortix?schema=public"
```

---

### Option B: Prisma Postgres (Easiest - Recommended)

Prisma Postgres is a managed PostgreSQL database that's perfect for development
and small projects.

#### Step 1: Start Prisma Postgres

```bash
cd backend
npx prisma dev
```

This will:

- Start a local PostgreSQL instance
- Generate a connection string
- Automatically update your `.env` file

#### Step 2: Verify Connection

The `DATABASE_URL` in your `.env` should look like:

```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

---

### Option C: Cloud Database (Production)

#### Neon (Recommended for Production)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Update `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. Update `backend/.env`

#### Railway

1. Go to [https://railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string
5. Update `backend/.env`

---

## 🚀 Part 3: Initialize Database

### Step 1: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 2: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create all database tables
- Set up relationships
- Create indexes

### Step 3: Verify Database

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view and
edit your data.

---

## 🧪 Part 4: Testing

### Test Database Connection

Create `backend/test-db.js`:

```javascript
const prisma = require("./lib/prisma");

async function testConnection() {
	try {
		// Test connection
		await prisma.$connect();
		console.log("✅ Database connected successfully!");

		// Create a test user
		const user = await prisma.user.create({
			data: {
				clerkId: "test_" + Date.now(),
				email: "test@example.com",
				username: "testuser",
			},
		});
		console.log("✅ Created test user:", user);

		// Clean up
		await prisma.user.delete({
			where: { id: user.id },
		});
		console.log("✅ Cleaned up test user");

		await prisma.$disconnect();
	} catch (error) {
		console.error("❌ Database error:", error);
		process.exit(1);
	}
}

testConnection();
```

Run the test:

```bash
node test-db.js
```

### Test Authentication

1. Start the dashboard: `cd dashboard && npm run dev`
2. Visit `http://localhost:3000/auth`
3. Sign up with a test account
4. Check Prisma Studio to see if the user was created

---

## 📝 Part 5: Update Backend Server

The backend server needs to be updated to:

1. Save commands to database
2. Serve command history API
3. Handle user authentication

### Update server.js

Add at the top of `backend/server.js`:

```javascript
require("dotenv").config();
const express = require("express");
const historyRouter = require("./routes/history");
const statsRouter = require("./routes/stats");
const { saveCommandHistory, updateDeviceStatus } = require("./lib/db-helpers");

// Create Express app for API routes
const app = express();
app.use(express.json());

// API routes
app.use("/api/history", historyRouter);
app.use("/api/stats", statsRouter);

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		devices: devices.size,
		dashboards: dashboardClients.size,
		uptime: process.uptime(),
	});
});
```

### Save Commands to Database

In the WebSocket message handler, add:

```javascript
// After command execution
if (data.type === "EXECUTE_RESULT") {
	// ... existing code ...

	// Save to database
	try {
		const device = devices.get(deviceId);
		if (device && device.userId) {
			await saveCommandHistory({
				userId: device.userId,
				deviceId: device.id,
				command: data.command,
				output: data.output,
				exitCode: data.code,
				status: data.code === 0 ? "success" : "error",
				duration: data.duration,
			});
		}
	} catch (error) {
		console.error("Error saving command history:", error);
	}
}
```

---

## 🔧 Part 6: Environment Variables Summary

### Dashboard (.env.local)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Backend
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
```

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx

# Server
PORT=8080
NODE_ENV=development

# AI (Optional)
GROQ_API_KEY=your_key_here
```

---

## 📊 Part 7: Database Schema

The database includes these tables:

### Users

- Stores user information from Clerk
- Links to devices and command history

### Devices

- Stores registered devices
- Links to users
- Tracks device status and platform

### CommandHistory

- Stores all executed commands
- Includes output, exit code, duration
- Searchable and filterable

### Sessions

- Tracks active connections
- Useful for analytics

---

## 🎯 Part 8: Using Command History

### In Dashboard

The command history is automatically available in the dashboard:

1. Go to `/dashboard`
2. Click on "History" tab
3. Search commands
4. Filter by device
5. View command details

### API Endpoints

**Get History:**

```
GET /api/history?userId=xxx&deviceId=xxx&search=xxx&limit=50&offset=0
```

**Search:**

```
GET /api/history/search?userId=xxx&q=search_term&limit=20
```

**Get Stats:**

```
GET /api/stats?userId=xxx
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**

- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: "Authentication failed"**

- Verify username and password
- Check if user has database permissions

### Clerk Authentication Issues

**Error: "Clerk: Missing publishable key"**

- Make sure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set
- Restart the dev server after adding env variables

**Error: "Clerk: Invalid secret key"**

- Verify CLERK_SECRET_KEY is correct
- Make sure you're using the right key for your environment (test vs live)

### Prisma Issues

**Error: "Prisma Client not generated"**

```bash
npx prisma generate
```

**Error: "Migration failed"**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

---

## 🚀 Deployment

### Deploy Database

**Neon (Recommended):**

1. Create production database on Neon
2. Copy connection string
3. Add to production environment variables

### Deploy Backend

Update production environment variables:

```env
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY="sk_live_..."
NODE_ENV="production"
```

### Deploy Dashboard

Update Vercel environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_BACKEND_WS="wss://your-backend.com"
```

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs)

---

## ✅ Checklist

- [ ] Created Clerk account
- [ ] Got API keys from Clerk
- [ ] Updated dashboard .env.local
- [ ] Updated backend .env
- [ ] Set up PostgreSQL database
- [ ] Ran Prisma migrations
- [ ] Tested database connection
- [ ] Tested authentication
- [ ] Updated backend server
- [ ] Tested command history
- [ ] Deployed to production

---

**Need Help?**

- Check the troubleshooting section
- Open an issue on GitHub
- Email: vaibhavrajpoot2626@gmail.com

---

**Congratulations! 🎉**

You now have a fully functional authentication and database system for Vortix!
