# Backend API Integration Summary

## What Was Done

The frontend now uses the `school-go` backend API instead of directly calling Berlin's WFS and construction APIs.

### Files Created

1. **`/types/backend-api.ts`**

   - TypeScript types matching Go backend models
   - `EnrichedSchool`, `School`, `SchoolDetail`, `BackendConstructionProject`, etc.

2. **`/lib/api/backend-api.ts`**

   - API client functions to fetch data from backend
   - `fetchEnrichedSchools()` - Fetches all schools with complete data
   - `fetchStandaloneConstructionProjects()` - Fetches standalone construction projects

3. **`/lib/utils/convert-backend-data.ts`**
   - Conversion utilities from backend format to frontend GeoJSON format
   - `convertToGeoJSON()` - Main conversion function
   - `enrichedSchoolToFeature()` - Converts single school
   - `standaloneProjectToFeature()` - Converts standalone project

### Files Modified

1. **`/types/index.ts`**

   - Added export for backend API types

2. **`/app/page.tsx`**
   - Changed from WFS API to backend API
   - Fetches enriched schools and standalone projects
   - Converts data to GeoJSON format before passing to SchoolsMap

## How It Works

### Data Flow

```
Backend API (Go)
    ↓
fetchEnrichedSchools() + fetchStandaloneConstructionProjects()
    ↓
convertToGeoJSON()
    ↓
SchoolsGeoJSON format
    ↓
SchoolsMap component (unchanged)
```

### Code Example

```typescript
// app/page.tsx
const [enrichedSchools, standaloneProjects] = await Promise.all([
  fetchEnrichedSchools(),
  fetchStandaloneConstructionProjects(),
]);

// Convert to GeoJSON format for map component
const schoolsData = convertToGeoJSON(enrichedSchools, standaloneProjects);

// Pass to map component (no changes needed to SchoolsMap)
<SchoolsMap schoolsData={schoolsData} />
```

## Backend API Endpoints

Base URL: `http://localhost:8080` (default)

| Endpoint                                       | Description                      |
| ---------------------------------------------- | -------------------------------- |
| `GET /api/v1/schools`                          | All enriched schools             |
| `GET /api/v1/construction-projects/standalone` | Standalone construction projects |

## What's Included in Enriched Schools

Each school now includes:

- ✅ Base school data (name, address, contact, coordinates)
- ✅ School details (languages, courses, equipment, offerings)
- ✅ Citizenship statistics
- ✅ Language statistics (non-German heritage speakers)
- ✅ Residence statistics (where students live)
- ✅ Absence statistics
- ✅ Associated construction projects

## Configuration

Set the backend URL via environment variable (optional):

```bash
# .env.local
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
```

Defaults to `http://localhost:8080` if not set.

## Running the Application

### 1. Start Backend

```bash
cd school-go
go run cmd/api/main.go
```

Backend starts at `http://localhost:8080`

### 2. Start Frontend

```bash
cd schools-info
npm run dev
```

Frontend starts at `http://localhost:3000`

## Advantages

1. **Single API Call**: One request gets all school data including statistics and construction projects
2. **Pre-linked Data**: Construction projects already associated with schools
3. **Rich Information**: Access to detailed school statistics and information
4. **Better Performance**: Data cached in SQLite, no repeated external API calls
5. **Consistency**: All data timestamps match, synchronized updates
6. **Type Safety**: Complete TypeScript types matching backend models

## SchoolsMap Component

The `SchoolsMap` component **did not need any changes** because:

- It already accepts `SchoolsGeoJSON` format
- Conversion happens in `page.tsx` before passing data
- All filtering, markers, and interactions work the same way

## Next Steps (Optional)

- Add error handling for backend API failures
- Add loading states
- Add fallback to old WFS API if backend is down
- Deploy backend to production
- Update other pages to use backend API

## Troubleshooting

### Backend Not Running

```
Error: Failed to fetch enriched schools: fetch failed
```

**Solution**: Start the backend server:

```bash
cd school-go
go run cmd/api/main.go
```

### No Data

If the database is empty, trigger a refresh:

```bash
curl -X POST http://localhost:8080/api/v1/refresh
```

This fetches data from Berlin APIs and populates the database (takes a few minutes).

### CORS Issues

Backend allows `localhost:3000` by default. If using a different port, update CORS settings in `school-go/internal/server/server.go`.

## Key Files Reference

```
schools-info/
├── types/
│   ├── index.ts              # Exports all types
│   └── backend-api.ts        # Backend API types
├── lib/
│   ├── api/
│   │   └── backend-api.ts    # Backend API client
│   └── utils/
│       └── convert-backend-data.ts  # Conversion utilities
└── app/
    └── page.tsx              # Main page (uses backend API)
```
