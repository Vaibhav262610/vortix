# 🚀 Complete Setup Guide - Authentication & Database

**Time Required:** 20-30 minutes  
**Difficulty:** Beginner-friendly

---

## 📋 What You're Setting Up

1. **Clerk Authentication** - User sign up/sign in
2. **PostgreSQL Database** - Store command history
3. **API Endpoints** - Access history and stats
4. **Command History UI** - Search and view past commands

---

## 🎯 Step-by-Step Instructions

### Step 1: Clerk Authentication (5 minutes)

#### 1.1 Create Clerk Account

1. Go to **https://clerk.com**
2. Click "Start building for free"
3. Sign up with your email or GitHub
4. Create a new application
5. Choose "Next.js" as framework

#### 1.2 Get Your Keys

1. In Clerk dashboard, click **"API Keys"** in sidebar
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
3. Keep this tab open - you'll need these keys

#### 1.3 Update Dashboard Environment

Open `dashboard/.env.local` and update:

```env
# Replace with YOUR keys from Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE

# Keep these as is
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_BACKEND_WS=wss://vortix.onrender.com
```

#### 1.4 Update Backend Environment

Open `backend/.env` and add:

```env
# Add this line with YOUR Clerk secret key
CLERK_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE
```

✅ **Checkpoint:** You should have both .env files updated with your Clerk keys

---

### Step 2: Database Setup (10 minutes)

You have 3 options. Choose ONE:

#### Option A: Prisma Postgres (Easiest - Recommended for Testing)

```bash
# Open terminal in backend folder
cd backend

# This single command does everything!
npx prisma dev
```

**What this does:**

- Starts a local PostgreSQL database
- Automatically updates your .env file
- No manual configuration needed!

**You'll see:**

```
✔ Prisma Postgres is ready
✔ DATABASE_URL updated in .env
```

✅ **Done!** Skip to Step 3.

---

#### Option B: Neon (Recommended for Production)

1. **Create Account:**
   - Go to **https://neon.tech**
   - Sign up for free (no credit card needed)
   - Click "Create Project"

2. **Get Connection String:**
   - After project is created, click "Connection Details"
   - Copy the connection string (looks like:
     `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)

3. **Update Backend .env:**
   ```env
   DATABASE_URL="postgresql://PASTE_YOUR_CONNECTION_STRING_HERE"
   ```

✅ **Done!** Continue to Step 3.

---

#### Option C: Local PostgreSQL (For Advanced Users)

**Install PostgreSQL:**

Windows:

```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

macOS:

```bash
brew install postgresql
brew services start postgresql
```

Linux:

```bash
sudo apt-get update
sudo apt-get install postgresql
sudo systemctl start postgresql
```

**Create Database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vortix;

# Exit
\q
```

**Update Backend .env:**

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/vortix?schema=public"
```

✅ **Done!** Continue to Step 3.

---

### Step 3: Initialize Database (2 minutes)

```bash
# Make sure you're in backend folder
cd backend

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

**You'll see:**

```
✔ Generated Prisma Client
✔ Applied migration: 20240530_init
```

**Verify it worked:**

```bash
# Open database viewer
npx prisma studio
```

This opens **http://localhost:5555** where you can see your empty database
tables.

✅ **Checkpoint:** You should see 4 tables: User, Device, CommandHistory,
Session

---

### Step 4: Test Everything (5 minutes)

#### 4.1 Test Database Connection

```bash
cd backend
node -e "require('./lib/prisma').\$connect().then(() => console.log('✅ Database Connected!')).catch(e => console.error('❌ Error:', e))"
```

**Expected output:** `✅ Database Connected!`

#### 4.2 Start Backend

```bash
cd backend
npm start
```

**Expected output:**

```
Backend running on port 8080
Health check: http://localhost:8080/health
Database: ✅ Connected
```

Keep this terminal open!

#### 4.3 Start Dashboard (New Terminal)

```bash
cd dashboard
npm run dev
```

**Expected output:**

```
▲ Next.js 16.1.6
- Local: http://localhost:3000
✓ Ready in 2.5s
```

#### 4.4 Test Authentication

1. Open browser: **http://localhost:3000/auth**
2. Click "Sign up"
3. Enter email and password
4. Complete sign up
5. You should be redirected to **/dashboard**

#### 4.5 Verify User Created

1. Go back to Prisma Studio: **http://localhost:5555**
2. Click "User" table
3. You should see your new user!

✅ **Success!** Everything is working!

---

## 🎨 Using Command History

### In Dashboard

1. **Execute a Command:**
   - Go to dashboard
   - Select a device
   - Run any command (e.g., `echo "Hello World"`)

2. **View History:**
   - The command is automatically saved
   - You can search for it
   - Click to see full details

### Search Commands

- Type in search box
- Results filter instantly
- Shows device, time, status

### View Details

- Click any command
- See full output
- See exit code
- See execution time

---

## 🔧 Troubleshooting

### "Clerk: Missing publishable key"

**Problem:** Environment variables not loaded

**Solution:**

```bash
# Make sure you saved .env.local
# Restart the dev server
cd dashboard
npm run dev
```

---

### "Can't reach database server"

**Problem:** Database not running or wrong URL

**Solution:**

If using Prisma Postgres:

```bash
cd backend
npx prisma dev
```

If using Neon/other:

```bash
# Check your DATABASE_URL in backend/.env
# Make sure it's correct
```

---

### "Prisma Client not generated"

**Problem:** Prisma client needs to be generated

**Solution:**

```bash
cd backend
npx prisma generate
```

---

### "Migration failed"

**Problem:** Database schema mismatch

**Solution:**

```bash
cd backend
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run migrations again
npx prisma migrate dev --name init
```

---

### Commands not saving to history

**Problem:** Backend not integrated with database

**Solution:**

You need to update `backend/server.js`. See `backend/server-with-db.js` for
reference.

Key changes needed:

1. Add database imports at top
2. Add Express routes
3. Add command saving in EXECUTE_RESULT handler

---

## ✅ Verification Checklist

Before moving on, verify:

- [ ] Clerk account created
- [ ] API keys added to .env files
- [ ] Database running (Prisma Studio shows tables)
- [ ] Backend starts without errors
- [ ] Dashboard starts without errors
- [ ] Can sign up new user
- [ ] User appears in Prisma Studio
- [ ] Can execute commands
- [ ] Commands save to history (check Prisma Studio)

---

## 🚀 What's Next?

Now that authentication and database are set up:

1. **Integrate History UI:**
   - Add CommandHistory component to dashboard
   - Create history page
   - Add search functionality

2. **Add Features:**
   - Command favorites
   - Export history
   - Command templates
   - Statistics dashboard

3. **Deploy:**
   - Deploy database to Neon
   - Deploy backend to Render
   - Deploy dashboard to Vercel
   - Update environment variables

---

## 📚 Additional Resources

- **Clerk Docs:** https://clerk.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
- **Full Setup Guide:** `AUTHENTICATION_SETUP.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

---

## 💡 Quick Commands Reference

```bash
# Database
npx prisma dev              # Start Prisma Postgres
npx prisma generate         # Generate client
npx prisma migrate dev      # Run migrations
npx prisma studio           # Open database viewer
npx prisma migrate reset    # Reset database

# Development
cd backend && npm start     # Start backend
cd dashboard && npm run dev # Start dashboard

# Testing
node -e "require('./lib/prisma').\$connect().then(() => console.log('✅ Connected'))"
```

---

## 🎉 Congratulations!

You now have:

- ✅ User authentication with Clerk
- ✅ PostgreSQL database
- ✅ Command history storage
- ✅ Search functionality
- ✅ API endpoints
- ✅ Production-ready setup

**Total time:** ~20-30 minutes  
**Status:** Ready to use!

---

## 📞 Need Help?

1. **Check Troubleshooting** section above
2. **Check Logs:** Backend and dashboard console
3. **Prisma Studio:** View database directly
4. **Documentation:** Read AUTHENTICATION_SETUP.md
5. **GitHub Issues:** Open an issue
6. **Email:** vaibhavrajpoot2626@gmail.com

---

**Last Updated:** May 30, 2026  
**Version:** 2.0.0
