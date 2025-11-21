# Docker Networking Fix - ERR_NAME_NOT_RESOLVED

## Problem
Frontend was trying to connect to `http://backend:8000/api/chat` which caused:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**Root Cause**: The browser cannot resolve Docker service names like `backend`. These names only work inside the Docker network, not from the browser.

## Solution

### 1. Use Relative URLs in Frontend
Changed the frontend to use relative URLs (`/api/chat`) instead of absolute URLs with Docker service names.

### 2. Nginx Proxy Configuration
Nginx already proxies `/api/` requests to `http://backend:8000`, so relative URLs work perfectly:
- Browser requests: `http://localhost:3000/api/chat`
- Nginx proxies to: `http://backend:8000/api/chat` (inside Docker network)
- Response flows back through nginx to browser

### 3. Updated Files

#### `src/services/api.js`
- Added `getApiBaseURL()` function that detects Docker service names
- Returns empty string (relative URL) when Docker service names detected
- Falls back to `http://localhost:8000` for local development

#### `docker-compose.yml`
- Changed `REACT_APP_API_URL` from `http://backend:8000` to empty string
- Changed `REACT_APP_DB_API_URL` from `http://database-api:8002` to `/db-api`
- This makes the frontend use relative URLs that nginx can proxy

## How It Works

### Before (Broken)
```
Browser → http://backend:8000/api/chat
         ❌ ERR_NAME_NOT_RESOLVED (browser can't resolve "backend")
```

### After (Fixed)
```
Browser → http://localhost:3000/api/chat
         ↓
Nginx   → http://backend:8000/api/chat (proxies inside Docker network)
         ↓
Backend → Processes request
         ↓
Nginx   → Returns response to browser
         ↓
Browser → Receives response ✅
```

## Architecture

```
┌─────────────┐
│   Browser   │ (User's machine)
│ localhost:3000 │
└──────┬──────┘
       │ HTTP Request: /api/chat
       ↓
┌─────────────────┐
│  Nginx (Port 80)│ (Docker container)
│  Frontend Server│
└──────┬──────────┘
       │ Proxy: /api/ → http://backend:8000
       ↓
┌─────────────────┐
│  Backend:8000   │ (Docker container)
│  FastAPI Server │
└─────────────────┘
```

## Testing

### 1. Rebuild Frontend Container
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### 2. Verify Nginx Proxy
```bash
# Test from inside Docker network
docker exec brandpulse-frontend curl http://backend:8000/health

# Test from browser (should work)
curl http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d '{"text":"test"}'
```

### 3. Check Browser Console
- Should see: `[Chat API] Sending request to: /api/chat (baseURL: relative)`
- No more `ERR_NAME_NOT_RESOLVED` errors

## Key Points

1. **Browser runs on user's machine** - cannot resolve Docker service names
2. **Nginx runs in Docker** - can resolve Docker service names
3. **Relative URLs** - let nginx handle the proxying
4. **Same-origin requests** - no CORS issues when using relative URLs

## Environment Variables

### Docker (Production)
```yaml
REACT_APP_API_URL=          # Empty = relative URL
REACT_APP_DB_API_URL=/db-api  # Relative URL
```

### Local Development
```bash
REACT_APP_API_URL=http://localhost:8000  # Direct connection
REACT_APP_DB_API_URL=http://localhost:8001
```

## Summary

The fix ensures:
- ✅ Browser uses relative URLs (no Docker service names)
- ✅ Nginx proxies requests to backend (can resolve Docker names)
- ✅ No CORS issues (same-origin requests)
- ✅ Works in both Docker and local development
