# Secrets Setup

## Local Development

1. Place `gemini_keys.txt` in this folder
2. Update `app.py` to point to: `secrets/gemini_keys.txt`

## Render Deployment

On Render, you have two options:

### Option A: Upload via Render File System (Recommended)
1. Go to Render Dashboard → Your Service → Files
2. Create `secrets/` folder
3. Upload `gemini_keys.txt`
4. File persists between deploys

### Option B: Use Environment Variables
```
GEMINI_API_KEYS=key1,key2,key3
```

## Security Checklist
- ✅ `gemini_keys.txt` is in `.gitignore`
- ✅ Never commit API keys to GitHub
- ✅ Rotate keys if accidentally exposed
