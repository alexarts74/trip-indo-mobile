# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TripMate is a React Native mobile app built with Expo for managing group trips to Indonesia. It uses Supabase for backend services (database, authentication, edge functions).

## Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web

# Run tests (watch mode)
npm test
```

## Architecture

### Navigation (Expo Router)
- `app/_layout.tsx` - Root layout with context providers (ThemeProvider > AuthProvider > TripProvider)
- `app/(main)/` - Stack navigation for main screens (trip list, profile, invitations)
- `app/(tabs)/` - Tab navigation for trip details (overview, destinations, expenses, participants)

### Context Providers
- `AuthContext` - Supabase authentication state (user, session, signIn/signUp/signOut)
- `TripContext` - Currently selected trip state
- `ThemeContext` - Light/dark theme management

### Services Layer (`src/services/`)
All Supabase interactions go through service modules:
- `tripService.ts` - Trip CRUD operations
- `expenseService.ts` - Expense management with shares
- `destinationsService.ts` - Trip destination management
- `invitationService.ts` - Trip invitations with email via Supabase Edge Functions

### Supabase Database Tables
- `trips` - Trip records (title, dates, budget, user_id)
- `trip_participants` - User-trip associations with roles (creator/participant)
- `trip_invitations` - Invitation management with status (pending/accepted/declined)
- `destinations` - Trip destinations
- `expenses` - Expenses with category_id and paid_by_user_id
- `expense_shares` - Expense split among participants
- `expense_categories` - Expense category metadata
- `profiles` - User profile data (first_name, last_name, email)

### Styling
- NativeWind (TailwindCSS for React Native) via `nativewind/babel` plugin
- Custom theme constants in `src/constants/theme.ts` (colors, spacing, borderRadius, shadows)
- Ubuntu font family loaded in root layout

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=<supabase-project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to project root
- Types defined in `src/types/`
