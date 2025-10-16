# Server Actions Architecture

## Overview

This application uses **Next.js Server Actions** to securely communicate with the backend API. This architecture ensures that the API key is never exposed to the client-side JavaScript bundle.

## Why Server Actions?

### Security Benefits

✅ **API Key Security**

- API key stays on the server and is never sent to the browser
- No risk of key exposure in client-side JavaScript bundles
- Keys cannot be extracted from network requests or browser DevTools

✅ **Type Safety**

- Full TypeScript support from client to server
- Shared types between frontend and backend calls
- Compile-time type checking for API requests/responses

✅ **Simplified Architecture**

- No need for a separate API route layer
- Direct function calls from components to server
- Automatic serialization of request/response data

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client Component (React)                                   │
│    │                                                        │
│    ├─ Call: fetchAISummary(schoolId)                      │
│    ├─ Call: calculateTravelTimes(from, to)                │
│    └─ Call: fetchEnrichedSchools()                        │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Server Action RPC
                         │ (Encrypted HTTPS)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Next.js Server (Node.js)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Server Actions (/lib/actions/)                             │
│    │                                                        │
│    ├─ ai-summary.ts      ─────┐                           │
│    ├─ travel-time.ts     ─────┤                           │
│    └─ schools.ts         ─────┤                           │
│                                │                           │
│                                ▼                           │
│  API Client (/lib/api/)                                     │
│    │                                                        │
│    └─ getApiHeaders()                                       │
│         │                                                   │
│         └─ Adds: X-API-Key: ${API_KEY}                     │
│            (from server-side env var)                       │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Request
                         │ (with API Key header)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Backend API (Go)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Auth Middleware                                            │
│    └─ Validates: X-API-Key header                          │
│                                                             │
│  Protected Routes (/api/v1/*)                               │
│    ├─ GET  /schools                                        │
│    ├─ GET  /schools/:id/summary                            │
│    ├─ POST /schools/:id/routes                             │
│    └─ GET  /construction-projects/standalone               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Server Actions

### Location: `/lib/actions/`

All server actions are located in the `lib/actions` directory and are marked with the `"use server"` directive.

### Available Actions

#### 1. Schools Actions (`/lib/actions/schools.ts`)

```typescript
"use server";

// Fetch all enriched schools
export async function fetchEnrichedSchools(): Promise<EnrichedSchool[]>;

// Fetch standalone construction projects
export async function fetchStandaloneConstructionProjects(): Promise<
  ConstructionProject[]
>;
```

**Used in:**

- `app/page.tsx` - Main page to load initial school data

#### 2. AI Summary Action (`/lib/actions/ai-summary.ts`)

```typescript
"use server";

// Fetch AI-generated summary for a school
export async function fetchAISummary(
  schoolId: string,
): Promise<AISummaryResponse>;
```

**Used in:**

- `lib/store/ai-summary-store.ts` - Zustand store for caching AI summaries
- Called from client components when user requests a school summary

#### 3. Travel Time Action (`/lib/actions/travel-time.ts`)

```typescript
"use server";

// Calculate travel times between two coordinates
export async function calculateTravelTimes(
  fromCoords: [number, number],
  toCoords: [number, number],
  schoolId?: string,
): Promise<TravelTime[]>;

// Format duration in human-readable format
export function formatDuration(minutes: number): string;
```

**Used in:**

- `lib/store/travel-time-store.ts` - Zustand store for caching travel times
- `components/schools-map/TravelTimeSection.tsx` - Displays travel times

## How to Use Server Actions

### From Server Components

Server components can directly call server actions:

```tsx
// app/page.tsx
import { fetchEnrichedSchools } from "@/lib/actions/schools";

export default async function Page() {
  const schools = await fetchEnrichedSchools();

  return <div>{/* render schools */}</div>;
}
```

### From Client Components

Client components can also call server actions (they automatically make RPC calls):

```tsx
"use client";

import { fetchAISummary } from "@/lib/actions/ai-summary";

export function SchoolDetails({ schoolId }: Props) {
  const handleFetchSummary = async () => {
    try {
      const result = await fetchAISummary(schoolId);
      console.log(result.summary);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  return <button onClick={handleFetchSummary}>Get Summary</button>;
}
```

### From Zustand Stores

Server actions can be called from Zustand stores for state management:

```typescript
// lib/store/ai-summary-store.ts
import { fetchAISummary } from "@/lib/actions/ai-summary";

export const useAISummaryStore = create<AISummaryState>()((set, get) => ({
  // ...
  fetchSummary: async (params) => {
    const data = await fetchAISummary(params.schoolId);
    set({ summary: data.summary });
  },
}));
```

## Environment Variables

### Required Configuration

Create `.env.local` in the project root:

```bash
# Backend API URL (public - used for constructing URLs)
API_URL=http://localhost:8080

# API Key (private - only accessible on server)
API_KEY=your-secure-api-key-here
```

### Variable Scope

| Variable  | Accessible In | Bundled in Client JS?      |
| --------- | ------------- | -------------------------- |
| `API_URL` | Everywhere    | ✅ Yes (safe - just a URL) |
| `API_KEY` | Server only   | ❌ No (secure)             |

The `API_KEY` variable can only be accessed in:

- Server Components
- Server Actions
- API Routes
- Middleware

It is **never** available in client components or bundled into client JavaScript.

## API Client Layer

### Location: `/lib/api/index.ts`

The API client provides utility functions for making authenticated requests to the backend:

```typescript
// Get headers with API key (server-side only)
export function getApiHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "X-API-Key": process.env.API_KEY || "",
  };
}

// Fetch enriched schools from backend
export async function fetchEnrichedSchools(): Promise<EnrichedSchool[]>;

// Fetch standalone construction projects
export async function fetchStandaloneConstructionProjects(): Promise<
  ConstructionProject[]
>;
```

These functions are called by server actions, which ensures the API key is only used on the server.

## Best Practices

### ✅ Do

1. **Use server actions for all API calls** that require authentication
2. **Keep API keys in non-public environment variables** (no `NEXT_PUBLIC_` prefix)
3. **Handle errors gracefully** in server actions and return user-friendly messages
4. **Use TypeScript** for type safety across client/server boundaries
5. **Cache results** when appropriate (using Zustand stores or React Query)

### ❌ Don't

1. **Don't use `NEXT_PUBLIC_` prefix** for sensitive keys
2. **Don't make direct fetch calls** from client components to the backend API
3. **Don't expose the API key** in any client-side code
4. **Don't skip error handling** in server actions
5. **Don't forget to revalidate** cached data when needed

## Security Checklist

- [x] API key uses `API_KEY` (not `NEXT_PUBLIC_API_KEY`)
- [x] All authenticated API calls go through server actions
- [x] Server actions marked with `"use server"`
- [x] API key never accessed in client components
- [x] `.env.local` added to `.gitignore`
- [x] Different API keys for development and production
- [x] HTTPS used in production
- [x] Error messages don't leak sensitive information

## Testing Server Actions

### Local Development

1. Set `API_KEY` in `.env.local`
2. Restart the Next.js dev server
3. Server actions will automatically use the key

### Production

1. Configure `API_KEY` in your hosting platform (Vercel, Netlify, etc.)
2. Deploy the application
3. Verify API calls work correctly

### Debugging

To debug server actions, use console.log in the server action code:

```typescript
"use server";

export async function fetchAISummary(schoolId: string) {
  console.log("Server: Fetching summary for school", schoolId);
  // Server logs appear in the terminal, not browser console
  const result = await fetch(/* ... */);
  console.log("Server: Received response", result.status);
  return result;
}
```

Server-side logs appear in:

- **Development**: Terminal where `npm run dev` is running
- **Production (Vercel)**: Vercel function logs
- **Production (Other)**: Your server/container logs

## Migration Notes

This application was migrated from client-side API calls to server actions for improved security. The migration involved:

1. **Created server actions** in `/lib/actions/` directory
2. **Renamed environment variable** from `NEXT_PUBLIC_API_KEY` to `API_KEY`
3. **Updated stores** to call server actions instead of direct fetches
4. **Removed old utility** `/lib/utils/travel-time.ts` (replaced by server action)
5. **Updated documentation** to reflect new architecture

The API key is now fully secure and never exposed to clients.

## Related Documentation

- [Environment Setup](./ENV_SETUP.md)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Backend API Authentication](../school-go/API_AUTH.md)
