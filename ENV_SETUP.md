# Environment Setup

## Required Environment Variables

This Next.js application requires the following environment variables to connect to the backend API.

## Creating Your Environment File

Create a `.env.local` file in the root of the project (this file is gitignored):

```bash
# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080

# API Authentication (Server-Side Only)
# IMPORTANT: This must match the API_KEY set in your backend .env file
# NOTE: No NEXT_PUBLIC_ prefix - this keeps the key secure on the server
API_KEY=your-secure-api-key-here
```

## Environment Variables Explained

### `NEXT_PUBLIC_BACKEND_API_URL`

**Purpose**: The base URL of your backend API server

**Default**: `http://localhost:8080` (if not set)

**Examples**:
- Development: `http://localhost:8080`
- Production: `https://api.your-domain.com`

### `API_KEY`

**Purpose**: API key for authenticating requests to the backend

**Required**: Yes (for production), Optional (for development if backend has no API_KEY set)

**Important Notes**:
- This key **must match** the `API_KEY` configured in your backend's `.env` file
- **Does NOT use** `NEXT_PUBLIC_` prefix - this keeps it server-side only
- The key is **never exposed** to the browser or client-side JavaScript
- All API calls use Next.js Server Actions to keep the key secure
- Keep this key secure and never commit it to version control
- Use different keys for development and production

**Generating a secure key**:
```bash
openssl rand -hex 32
```

## Setup Steps

1. **Copy the example above** and create a `.env.local` file in the project root

2. **Get the API key** from your backend administrator or generate one if you manage the backend

3. **Update the values** in `.env.local` with your actual configuration

4. **Restart the development server** for changes to take effect:
   ```bash
   npm run dev
   ```

## How It Works

The application uses these environment variables to:

1. **Connect to the backend API** - All API requests use `NEXT_PUBLIC_BACKEND_API_URL` as the base URL

2. **Authenticate requests** - The `API_KEY` is used in Next.js Server Actions to authenticate API calls:
   - `/lib/actions/schools.ts` - Server actions for schools and construction projects
   - `/lib/actions/ai-summary.ts` - Server action for AI-powered summaries
   - `/lib/actions/travel-time.ts` - Server action for travel time calculations

3. **Server-side security** - The API key is **only accessible on the server**:
   - Server Actions execute on the server, never in the browser
   - The API key is never bundled into client-side JavaScript
   - Client components call server actions, which handle authentication

## Security Features

✅ **Enhanced Security**:

- The `API_KEY` is **never exposed** to the browser or client-side code
- All API calls go through Next.js Server Actions which run exclusively on the server
- The API key cannot be intercepted or viewed by users
- This architecture is secure for public-facing applications
- No need for a backend-for-frontend (BFF) layer
- Use different API keys for different environments
- Rotate keys regularly

## Troubleshooting

### "Failed to fetch" errors

**Cause**: Backend API is not running or URL is incorrect

**Solution**: 
- Verify the backend server is running
- Check that `NEXT_PUBLIC_BACKEND_API_URL` matches your backend's address and port

### "401 Unauthorized" errors

**Cause**: Missing or invalid API key

**Solution**:
1. Verify `API_KEY` (without NEXT_PUBLIC prefix) is set in `.env.local`
2. Verify it matches the `API_KEY` in the backend's `.env` file
3. Restart the Next.js dev server after changing environment variables

### Changes not taking effect

**Cause**: Environment variables are cached

**Solution**:
1. Stop the development server (`Ctrl+C`)
2. Clear the Next.js cache: `rm -rf .next`
3. Restart the server: `npm run dev`

## Production Deployment

For production deployments (e.g., Vercel, Netlify):

1. **Add environment variables** in your hosting platform's dashboard
2. **Use production values** for the backend URL (e.g., `https://api.your-domain.com`)
3. **Use a production API key** (different from development)
4. **Redeploy** the application after updating environment variables

### Example: Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_BACKEND_API_URL` = `https://your-api-domain.com`
   - `API_KEY` = `your-production-api-key` (without NEXT_PUBLIC prefix for security)
4. Redeploy the application

**Note**: The `API_KEY` variable will only be available in server-side code (Server Actions, API Routes, Server Components), which is exactly what we want for security.

## Related Documentation

- [Backend API Authentication](/path/to/backend/API_AUTH.md)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

