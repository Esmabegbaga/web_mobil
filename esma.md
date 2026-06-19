# Campus Online

## Overview

University campus events and announcements platform — web + mobile. Students discover events, clubs, and announcements; club officials manage events; admins moderate content.

## Architecture

pnpm workspace monorepo with 4 artifacts:
- `artifacts/api-server` — Express 5 REST API (JWT auth, all routes at `/api/*`)
- `artifacts/campus-online` — React + Vite web app
- `artifacts/campus-mobile` — Expo React Native mobile app
- `artifacts/mockup-sandbox` — Canvas component preview server

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24 / **TypeScript**: 5.9
- **API**: Express 5 + JWT auth (`jsonwebtoken`) + sha256+salt password hashing
- **Database**: PostgreSQL + Drizzle ORM (tables: users, clubs, events, announcements, event_reactions)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from `lib/api-spec/openapi.yaml` → `lib/api-client-react`)
- **Mobile**: Expo SDK 54, expo-router, React Query, AsyncStorage for auth tokens
- **Web**: React + Vite + Wouter routing, React Query hooks

## Seed Accounts

| Email | Password | Role |
|---|---|---|
| admin@campusonline.edu | admin123 | admin |
| ahmet@campusonline.edu | student123 | student |
| mehmet@campusonline.edu | club123 | club_official (Yazılım Geliştirme Kulübü) |
| ayse@campusonline.edu | club123 | club_official (Müzik Kulübü) |

## Key Commands

- `pnpm run typecheck` — typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
