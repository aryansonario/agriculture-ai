# Smart Farm Advisor

This project shows live farm sensor readings, stores raw sensor rows in SQLite, and fetches Gemini advice separately.

## Gemini setup

The backend now uses `gemini-2.5-flash-lite` and can rotate across up to 3 API keys to reduce free-tier quota failures.

You can configure keys in either of these ways:

1. Put them in `gemini_keys.txt`, one key per line.
2. Or set environment variables before starting Flask:

```powershell
$env:GEMINI_API_KEYS="key1,key2,key3"
python app.py
```

You can also use:

```powershell
$env:GEMINI_API_KEY_1="key1"
$env:GEMINI_API_KEY_2="key2"
$env:GEMINI_API_KEY_3="key3"
python app.py
```

Optional tuning:

- `GEMINI_MODEL` default: `gemini-2.5-flash-lite`
- `GEMINI_KEY_COOLDOWN_SECONDS` default: `75`
- `GEMINI_MAX_OUTPUT_TOKENS` default: `160`
- `GEMINI_TEMPERATURE` default: `0.2`

Main focus:

- Crop suggestions
- Irrigation advice
- Soil quality advice
- Small secondary sensor readings for DHT22 temperature, humidity, soil moisture, and pH
- Language switcher for English, Hindi, and Marathi
# agriculture-ai
# agriculture-ai
