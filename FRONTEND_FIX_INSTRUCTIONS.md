# Frontend Fix Instructions - ERR_NAME_NOT_RESOLVED

## Problem
Frontend is trying to connect to `http://backend:8000` which causes `ERR_NAME_NOT_RESOLVED` because browsers cannot resolve Docker service names.

## Solution Applied

### Code Changes
1. Updated `src/services/api.js` to detect and override Docker service names at runtime
2. Added runtime checks to force relative URLs when Docker service names are detected
3. Added logging to help debug configuration issues

## Steps to Fix

### Option 1: Restart Frontend Dev Server (Recommended)

1. **Stop the current dev server** (Ctrl+C in the terminal)

2. **Clear any cached builds**:
   ```bash
   rm -rf node_modules/.cache
   rm -rf build
   ```

3. **Restart the dev server**:
   ```bash
   npm start
   ```

4. **Clear browser cache** or use **Incognito/Private mode**

5. **Check browser console** - you should see:
   ```
   [API Config] Runtime fix: Overriding baked-in Docker service name
   [API Config] Axios instance created with baseURL: (empty - relative URLs)
   ```

### Option 2: If Running in Docker

1. **Rebuild the frontend container**:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

2. **Clear browser cache**

### Option 3: Manual Environment Variable Override

If the dev server is still using the wrong URL:

1. **Stop the dev server**

2. **Set environment variable explicitly**:
   ```bash
   export REACT_APP_API_URL=
   npm start
   ```

   Or create/update `.env` file:
   ```
   REACT_APP_API_URL=
   REACT_APP_DB_API_URL=/db-api
   ```

3. **Restart dev server**

## Verification

After restarting, check the browser console:

✅ **Should see:**
```
[API Config] Axios instance created with baseURL: (empty - relative URLs)
[API Config] Full URL example: http://localhost:3000/api/chat
[Chat API] Sending request to: /api/chat (baseURL: relative)
```

❌ **Should NOT see:**
```
[Chat API] Sending request to: http://backend:8000/api/chat
ERR_NAME_NOT_RESOLVED
```

## How It Works Now

### Local Development (npm start)
- Uses relative URLs (`/api/chat`)
- If running on `localhost:3000`, requests go to `http://localhost:3000/api/chat`
- If you have a proxy configured, it will forward to backend
- Otherwise, you need to set `REACT_APP_API_URL=http://localhost:8000`

### Docker Production
- Uses relative URLs (`/api/chat`)
- Nginx proxies `/api/` to `http://backend:8000`
- Browser makes request to same origin (nginx)
- No CORS issues, no Docker service name resolution needed

## Troubleshooting

### Still seeing `http://backend:8000`?

1. **Check if dev server is running from Docker**:
   ```bash
   docker ps | grep frontend
   ```
   If yes, rebuild the container.

2. **Check environment variables**:
   ```bash
   echo $REACT_APP_API_URL
   ```
   Should be empty or `http://localhost:8000`, NOT `http://backend:8000`

3. **Check .env file**:
   ```bash
   cat .env | grep REACT_APP_API_URL
   ```
   Should NOT contain `backend:8000`

4. **Hard refresh browser**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

5. **Check browser console** for the `[API Config]` logs to see what's being used

## Summary

The fix ensures that:
- ✅ Docker service names are detected and overridden at runtime
- ✅ Relative URLs are used (nginx can proxy)
- ✅ Works in both local dev and Docker
- ✅ No more `ERR_NAME_NOT_RESOLVED` errors

**Action Required**: Restart your frontend dev server to apply the changes!

