# MealMates

A full-stack meal planning application built with React Native (Expo) and Next.js in a Turborepo monorepo.

## Tech Stack

```text
apps
  ├─ expo
  │   ├─ Expo SDK 54 + React Native 0.81
  │   ├─ Navigation using Expo Router
  │   ├─ Tailwind CSS v4 using NativeWind v5
  │   └─ Typesafe API calls using tRPC
  └─ nextjs
      ├─ Next.js 15 + React 19
      ├─ Tailwind CSS v4
      └─ E2E Typesafe API Server & Client
packages
  ├─ api - tRPC v11 router definition
  ├─ auth - Authentication using better-auth
  ├─ db - Typesafe db calls using Drizzle & Supabase
  ├─ ui - shadcn-ui components
  └─ validators - Shared validation schemas
```

## Getting Started

### Prerequisites

- Node.js (see `package.json#engines` for required version)
- pnpm package manager
- For iOS: macOS with Xcode installed
- For Android: Android Studio with emulator setup

### Setup for Team Members

1. **Install dependencies**

```bash
pnpm i
```

2. **Configure environment variables**

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Ask your team lead for the shared Supabase project URL and keys

# Add to .env: Google Maps API Key (Required for Location Search & Maps)
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

That's it! The database schema is already deployed to Supabase, so you don't need to run any database migrations.

> **Note for Database Schema Changes**: Only the person modifying the schema needs to run `pnpm db:push` and `pnpm --filter @mealmates/auth generate`. Other team members just need to configure their `.env` file to point to the same Supabase instance.

## Running the App

### Next.js Web App

```bash
pnpm dev
```

The web app will be available at `http://localhost:3000`

### Mobile App (Expo)

#### Android Emulator

The easiest way to run the Android app:

```bash
# From the root directory
pnpm dev

# Then press 'a' to open Android emulator
```

Or manually:

```bash
cd apps/expo
pnpm dev
# Press 'a' to launch Android emulator
```

#### iOS Simulator (macOS only)

1. Make sure you have Xcode and XCommand Line Tools installed

```bash
cd apps/expo
pnpm dev
# Press 'i' to launch iOS simulator
```

> **Note**: If you just installed or updated Xcode, you need to open the simulator manually once first.

#### iOS Physical Device (Xcode Required)

Since we don't have an Apple Developer account, iOS apps can only be run locally using Xcode with a free Apple ID:

```bash
cd apps/expo
npx expo prebuild
open ios/MealMates.xcworkspace
```

Then in Xcode:

1. Connect your iPhone via USB
2. Select your personal Apple ID as the Team (free account works)
3. Select your device as the build target
4. Click ▶️ to run

⚠️ **Free Apple ID Limitations**:

- App signature expires every 7 days (need to rebuild)
- Limited number of devices
- Cannot publish to App Store
- Must rebuild weekly to continue using

## Development

### Adding UI Components

Use the interactive shadcn/ui CLI:

```bash
pnpm ui-add
```

### Adding New Packages

Generate a new package using Turbo:

```bash
pnpm turbo gen init
```

### Database Schema Changes (Maintainers Only)

If you need to modify the database schema:

```bash
# 1. Edit the schema in packages/db/src/schema.ts

# 2. Push changes to Supabase
pnpm db:push

# 3. If auth config changed, regenerate auth schema
pnpm --filter @mealmates/auth generate
```

## Project Structure

- `apps/expo` - React Native mobile app
- `apps/nextjs` - Next.js web application
- `packages/api` - Shared tRPC API definitions
- `packages/auth` - Authentication configuration
- `packages/db` - Database schema and client
- `packages/ui` - Shared UI components
- `packages/validators` - Shared validation schemas
- `tooling/` - Shared configuration (ESLint, Prettier, TypeScript, etc.)

## Authentication

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth system is configured to work with both the Next.js and Expo apps.

For OAuth to work properly in development, the Next.js app uses an auth proxy plugin. Make sure the Next.js app is running when testing authentication in the Expo app.

## Deployment

### Next.js (Vercel)

1. Create a new project on Vercel
2. Select `apps/nextjs` as the root directory
3. Add your `POSTGRES_URL` environment variable
4. Deploy!

### Expo (App Stores)

For production builds, follow the [EAS Build guide](https://docs.expo.dev/build/introduction):

```bash
# Install EAS CLI
pnpm add -g eas-cli

# Login and configure
eas login
cd apps/expo
eas build:configure

# Create a production build
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Troubleshooting

### Expo app can't connect to the API

Make sure the Next.js app is running and check the `getBaseUrl` function in `apps/expo/src/utils/api.tsx` to ensure it's pointing to the correct URL.

### Database connection issues

Verify your `.env` file has the correct Supabase credentials. Contact your team lead if you need access to the shared Supabase project.

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Better Auth Documentation](https://www.better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

---

Based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)
