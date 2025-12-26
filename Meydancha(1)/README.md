# MEYDANCHA - Sports Field Booking Platform

A fully functional web platform for booking sports fields, built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database
```bash
# Create the database and run migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run db:seed
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Test Credentials

After seeding, you can use these test accounts:

### Admin
- **Email:** `admin@meydancha.com`
- **Password:** `admin123`

### Owner
- **Email:** `owner1@meydancha.com`
- **Password:** `owner123`

### Player
- **Email:** `player1@meydancha.com`
- **Password:** `player123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Features

- ✅ Search & Filter fields by sport, location, date/time
- ✅ Real-time availability checking
- ✅ Hourly booking system
- ✅ Tap & Play mode (find fields available now)
- ✅ Ratings & Reviews
- ✅ Role-based access (Player, Owner, Admin)
- ✅ Booking management
- ✅ Field management for owners

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** SQLite (Prisma ORM)
- **Validation:** Zod
- **Forms:** React Hook Form

## Troubleshooting

If you encounter issues:

1. **Database errors:** Run `npx prisma generate` to regenerate Prisma client
2. **Port already in use:** Change the port in `package.json` or kill the process using port 3000
3. **Module not found:** Delete `node_modules` and `package-lock.json`, then run `npm install` again


