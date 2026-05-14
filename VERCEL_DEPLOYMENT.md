# Vercel Deployment Guide

## What was changed to fix the 404 error

1. **Created `api/` folder** - Vercel requires Python apps to be in an `api/` directory
2. **Created `public/` folder** - Static files (HTML, CSS, JS) go in a `public/` folder
3. **Updated `app.js`** - Changed hardcoded `http://localhost:5000` to use relative paths (`/api/...`)
4. **Created `api/index.py`** - Entry point for Vercel's Python runtime
5. **Created `vercel.json`** - Configuration for routing and environment variables
6. **Created `requirements.txt`** - Python dependencies

## How to Deploy

### Step 1: Set up Environment Variables in Vercel

After connecting your GitHub repo to Vercel, add these environment variables in **Project Settings → Environment Variables**:

```
GEMINI_API_KEYS = your_keys_here
GEMINI_MODEL = gemini-2.5-flash-lite
GEMINI_KEY_COOLDOWN_SECONDS = 75
GEMINI_TEMPERATURE = 0.2
GEMINI_MAX_OUTPUT_TOKENS = 512
GEMINI_SENSOR_HISTORY_LIMIT = 40
```

If you have multiple keys, provide them comma-separated or use indexed keys:
```
GEMINI_API_KEY = your_first_key
GEMINI_API_KEY_1 = your_first_key
GEMINI_API_KEY_2 = your_second_key
GEMINI_API_KEY_3 = your_third_key
```

### Step 2: Deploy

1. Push changes to GitHub
2. Vercel will automatically detect the changes and redeploy
3. Check the deployment URL in your Vercel dashboard

### Step 3: Update ESP32 Endpoint

For your ESP32, update the endpoint from:
```
http://localhost:5000/api/data
```
to:
```
https://your-project-name.vercel.app/api/data
```

## Local Development

To test locally, keep using the original `app.py`:

```bash
python app.py
```

Or set `FLASK_URL` in `public/app.js` to `http://localhost:5000` for local testing.

## Important Notes

- The database file (`agriculture.db`) is ephemeral on Vercel - it won't persist between redeploys
- For persistent storage, consider adding a database service (MongoDB Atlas, Supabase, etc.)
- Environment variables starting with `@` are provided by Vercel's system; replace with actual values
- Ensure `gemini_keys.txt` is NOT committed to git (add to `.gitignore`)
