from flask import Flask, jsonify, request, send_from_directory
import json
import os
import time
import base64
from threading import Lock
from google import genai
from google.genai import types
from supabase import create_client, Client
from datetime import datetime


PUMP_THRESHOLD = 30.0
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://zdssdthnchagpqypgzaa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
FRONTEND_FOLDER = "."
AUTO_SEED_DEMO_DATA = True
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

# Look for gemini_keys.txt in secrets/ folder first, then root folder
_secrets_path = "secrets/gemini_keys.txt"
_root_path = "gemini_keys.txt"
GEMINI_KEYS_FILE = os.getenv("GEMINI_KEYS_FILE", _secrets_path if os.path.exists(_secrets_path) else _root_path)
GEMINI_KEY_COOLDOWN_SECONDS = int(
    os.getenv("GEMINI_KEY_COOLDOWN_SECONDS", "75")
)
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))
GEMINI_MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "512"))
GEMINI_SENSOR_HISTORY_LIMIT = max(
    1,
    min(40, int(os.getenv("GEMINI_SENSOR_HISTORY_LIMIT", "40"))),
)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

VALID_PLANT_TYPES = {"crop", "tree", "none"}
DEFAULT_CONTEXT = {
    "plant_type": "none",
    "plant_name": "",
}

DEMO_CONTEXT = {
    "plant_type": "crop",
    "plant_name": "Wheat",
}

DEMO_SENSOR_ROWS = [
    {
        "moisture": 28.4,
        "temperature": 33.1,
        "humidity": 48.2,
        "pump_status": "ON",
        "timestamp": "2026-05-13 08:00:00",
    },
    {
        "moisture": 41.7,
        "temperature": 30.4,
        "humidity": 58.9,
        "pump_status": "OFF",
        "timestamp": "2026-05-13 08:20:00",
    },
    {
        "moisture": 52.6,
        "temperature": 27.8,
        "humidity": 67.3,
        "pump_status": "OFF",
        "timestamp": "2026-05-13 08:40:00",
    },
    {
        "moisture": 63.9,
        "temperature": 26.9,
        "humidity": 72.4,
        "pump_status": "OFF",
        "timestamp": "2026-05-13 09:00:00",
    },
    {
        "moisture": 49.3,
        "temperature": 29.1,
        "humidity": 63.5,
        "pump_status": "OFF",
        "timestamp": "2026-05-13 10:20:00",
    },
]

manual_pump_state = "OFF"
latest_advice_cache = {
    "signature": None,
    "advice": None,
}
latest_detail_cache = {
    "signature": None,
    "detail": None,
}

ADVICE_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "required": ["crop_suggestion", "irrigation_advice", "soil_health"],
    "properties": {
        "crop_suggestion": {"type": "STRING"},
        "irrigation_advice": {"type": "STRING"},
        "soil_health": {"type": "STRING"},
    },
}

IMAGE_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "required": ["quality", "disease", "precautions"],
    "properties": {
        "quality": {"type": "STRING"},
        "disease": {"type": "STRING"},
        "precautions": {"type": "STRING"},
    },
}

ADVICE_DETAIL_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "required": [
        "crop_current_status",
        "crop_next_crop",
        "crop_market_outlook",
        "profit_tip",
        "irrigation_schedule",
        "irrigation_weather_note",
        "soil_nutrients",
        "soil_improvement",
        "general_weather_tip",
    ],
    "properties": {
        "crop_current_status": {"type": "STRING"},
        "crop_next_crop": {"type": "STRING"},
        "crop_market_outlook": {"type": "STRING"},
        "profit_tip": {"type": "STRING"},
        "irrigation_schedule": {"type": "STRING"},
        "irrigation_weather_note": {"type": "STRING"},
        "soil_nutrients": {"type": "STRING"},
        "soil_improvement": {"type": "STRING"},
        "general_weather_tip": {"type": "STRING"},
    },
}


def dedupe_non_empty(values):
    unique_values = []
    seen = set()

    for value in values:
        cleaned_value = str(value or "").strip()
        if cleaned_value and cleaned_value not in seen:
            seen.add(cleaned_value)
            unique_values.append(cleaned_value)

    return unique_values


def load_gemini_api_keys():
    csv_keys = [
        key.strip()
        for key in os.getenv("GEMINI_API_KEYS", "").split(",")
        if key.strip()
    ]
    indexed_keys = [
        os.getenv("GEMINI_API_KEY_1", ""),
        os.getenv("GEMINI_API_KEY_2", ""),
        os.getenv("GEMINI_API_KEY_3", ""),
        os.getenv("GEMINI_API_KEY", ""),
    ]
    file_keys = []

    if os.path.exists(GEMINI_KEYS_FILE):
        with open(GEMINI_KEYS_FILE, "r", encoding="utf-8") as keys_file:
            for line in keys_file:
                cleaned_line = line.strip()
                if cleaned_line and not cleaned_line.startswith("#"):
                    file_keys.append(cleaned_line)

    return dedupe_non_empty(csv_keys + indexed_keys + file_keys)


def build_gemini_key_states():
    return [
        {
            "key": api_key,
            "client": genai.Client(api_key=api_key),
            "cooldown_until": 0.0,
            "disabled": False,
            "last_error": "",
        }
        for api_key in load_gemini_api_keys()
    ]


app = Flask(__name__, static_folder=FRONTEND_FOLDER)
gemini_key_states = build_gemini_key_states()
gemini_rotation_index = 0
gemini_rotation_lock = Lock()
loaded_gemini_keys_signature = tuple(state["key"] for state in gemini_key_states)


def init_database():
    print("[SUPABASE] Using Supabase for database operations")


def count_sensor_rows():
    response = supabase.table("sensor_data").select("*", count="exact").execute()
    return response.count


def normalize_farm_context(plant_type, plant_name):
    cleaned_type = str(plant_type or "none").strip().lower()
    if cleaned_type not in VALID_PLANT_TYPES:
        raise ValueError("plant_type must be crop, tree, or none")

    cleaned_name = str(plant_name or "").strip()
    if cleaned_type == "none":
        cleaned_name = ""

    return {
        "plant_type": cleaned_type,
        "plant_name": cleaned_name,
    }


def get_farm_context():
    response = supabase.table("farm_context").select("plant_type, plant_name").eq("id", 1).execute()
    if not response.data:
        return DEFAULT_CONTEXT.copy()

    row = response.data[0]
    return {
        "plant_type": row.get("plant_type") or "none",
        "plant_name": row.get("plant_name") or "",
    }


def save_farm_context(plant_type, plant_name):
    supabase.table("farm_context").upsert({
        "id": 1,
        "plant_type": plant_type,
        "plant_name": plant_name,
        "updated_at": datetime.utcnow().isoformat()
    }).execute()


def save_to_database(
    moisture,
    temperature,
    humidity,
    pump_status,
    timestamp=None,
):
    data = {
        "moisture": moisture,
        "temperature": temperature,
        "humidity": humidity,
        "pump_status": pump_status,
    }
    if timestamp:
        data["timestamp"] = timestamp

    supabase.table("sensor_data").insert(data).execute()


def seed_demo_data():
    if not AUTO_SEED_DEMO_DATA or count_sensor_rows() > 0:
        return

    save_farm_context(DEMO_CONTEXT["plant_type"], DEMO_CONTEXT["plant_name"])

    for row in DEMO_SENSOR_ROWS:
        save_to_database(
            row["moisture"],
            row["temperature"],
            row["humidity"],
            row["pump_status"],
            row["timestamp"],
        )

    print("[OK] Demo sensor data seeded")


def get_latest_sensor_row_from_database():
    response = supabase.table("sensor_data").select("id, moisture, temperature, humidity, pump_status, timestamp").order("id", desc=True).limit(1).execute()
    if not response.data:
        return None
    return response.data[0]


def get_recent_sensor_rows_from_database(limit=GEMINI_SENSOR_HISTORY_LIMIT):
    response = supabase.table("sensor_data").select("id, moisture, temperature, humidity, pump_status, timestamp").order("id", desc=True).limit(limit).execute()
    return list(reversed(response.data))


def get_latest_from_database():
    latest_row = get_latest_sensor_row_from_database()
    if latest_row is None:
        return None

    latest_row["sensor_id"] = latest_row.pop("id")
    latest_row.update(get_farm_context())
    return latest_row


def get_recent_advice_signature(sensor_rows, farm_context):
    latest_id = sensor_rows[-1]["id"]
    oldest_id = sensor_rows[0]["id"]
    return "|".join(
        [
            str(oldest_id),
            str(latest_id),
            str(len(sensor_rows)),
            farm_context["plant_type"],
            farm_context["plant_name"],
        ]
    )


def format_sensor_rows_for_prompt(sensor_rows):
    compact_rows = []

    for row in sensor_rows:
        compact_rows.append(
            {
                "time": row["timestamp"],
                "moisture": row["moisture"],
                "temperature": row["temperature"],
                "humidity": row["humidity"],
                "pump": row["pump_status"],
            }
        )

    moisture_values = [row["moisture"] for row in sensor_rows if row["moisture"] is not None]
    temperature_values = [
        row["temperature"] for row in sensor_rows if row["temperature"] is not None
    ]
    humidity_values = [row["humidity"] for row in sensor_rows if row["humidity"] is not None]

    def average(values):
        return round(sum(values) / len(values), 1) if values else None

    summary = {
        "reading_count": len(sensor_rows),
        "latest_timestamp": sensor_rows[-1]["timestamp"],
        "latest_moisture": sensor_rows[-1]["moisture"],
        "latest_temperature": sensor_rows[-1]["temperature"],
        "latest_humidity": sensor_rows[-1]["humidity"],
        "average_moisture": average(moisture_values),
        "average_temperature": average(temperature_values),
        "average_humidity": average(humidity_values),
        "min_moisture": min(moisture_values) if moisture_values else None,
        "max_moisture": max(moisture_values) if moisture_values else None,
        "min_temperature": min(temperature_values) if temperature_values else None,
        "max_temperature": max(temperature_values) if temperature_values else None,
        "min_humidity": min(humidity_values) if humidity_values else None,
        "max_humidity": max(humidity_values) if humidity_values else None,
    }

    return {
        "summary_json": json.dumps(summary, separators=(",", ":")),
        "rows_json": json.dumps(compact_rows, separators=(",", ":")),
    }


def refresh_gemini_key_states(force=False):
    global gemini_key_states, gemini_rotation_index, loaded_gemini_keys_signature

    latest_keys = load_gemini_api_keys()
    latest_signature = tuple(latest_keys)

    with gemini_rotation_lock:
        if not force and latest_signature == loaded_gemini_keys_signature:
            return

        gemini_key_states = [
            {
                "key": api_key,
                "client": genai.Client(api_key=api_key),
                "cooldown_until": 0.0,
                "disabled": False,
                "last_error": "",
            }
            for api_key in latest_keys
        ]
        gemini_rotation_index = 0
        loaded_gemini_keys_signature = latest_signature

    print(f"[GEMINI] Reloaded key pool. Configured keys: {len(gemini_key_states)}")


def is_gemini_quota_error(error_text):
    lowered = error_text.lower()
    return (
        "429" in error_text
        or "too many requests" in lowered
        or "quota" in lowered
        or "resource exhausted" in lowered
        or "rate limit" in lowered
    )


def is_gemini_auth_error(error_text):
    lowered = error_text.lower()
    return (
        "401" in error_text
        or "403" in error_text
        or "api key not valid" in lowered
        or "permission denied" in lowered
        or "access not configured" in lowered
    )


def get_next_ready_key_indices():
    global gemini_rotation_index

    now = time.time()
    with gemini_rotation_lock:
        total_keys = len(gemini_key_states)
        if total_keys == 0:
            return []

        ordered_indices = [
            (gemini_rotation_index + offset) % total_keys
            for offset in range(total_keys)
        ]
        gemini_rotation_index = (gemini_rotation_index + 1) % total_keys

    ready_indices = []
    for index in ordered_indices:
        state = gemini_key_states[index]
        if not state["disabled"] and state["cooldown_until"] <= now:
            ready_indices.append(index)

    return ready_indices


def mark_key_quota_limited(index, error_text):
    cooldown_until = time.time() + GEMINI_KEY_COOLDOWN_SECONDS
    with gemini_rotation_lock:
        gemini_key_states[index]["cooldown_until"] = max(
            gemini_key_states[index]["cooldown_until"],
            cooldown_until,
        )
        gemini_key_states[index]["last_error"] = error_text


def disable_key(index, error_text):
    with gemini_rotation_lock:
        gemini_key_states[index]["disabled"] = True
        gemini_key_states[index]["last_error"] = error_text


def get_key_pool_status():
    now = time.time()
    available_count = 0
    cooling_until = []
    disabled_count = 0

    for state in gemini_key_states:
        if state["disabled"]:
            disabled_count += 1
            continue

        if state["cooldown_until"] > now:
            cooling_until.append(state["cooldown_until"])
        else:
            available_count += 1

    return {
        "configured": len(gemini_key_states),
        "available": available_count,
        "disabled": disabled_count,
        "next_ready_in_seconds": (
            max(1, int(min(cooling_until) - now)) if cooling_until else 0
        ),
    }


def describe_field_context(plant_type, plant_name):
    if plant_type == "crop":
        if plant_name:
            return f"A crop is currently growing here: {plant_name}."
        return "A crop is currently growing here, but the farmer did not share the crop name."

    if plant_type == "tree":
        if plant_name:
            return f"A tree is currently growing here: {plant_name}."
        return "A tree is currently growing here, but the farmer did not share the tree name."

    return "Nothing is currently being grown on this soil."


def get_gemini_advice(sensor_rows, plant_type, plant_name):
    refresh_gemini_key_states()
    prompt_data = format_sensor_rows_for_prompt(sensor_rows)

    # Build crop-specific instruction for the suggestion field
    if plant_type == "crop" and plant_name:
        crop_instruction = (
            f"crop_suggestion: First mention one specific care tip for the current crop ({plant_name}) "
            f"based on the sensor data (e.g. watering, fertiliser, or pest risk). "
            f"Then on the same line suggest the best next crop to rotate to after {plant_name} "
            f"given this soil and climate — name the crop and give one reason."
        )
    elif plant_type == "tree" and plant_name:
        crop_instruction = (
            f"crop_suggestion: Give one specific care or maintenance tip for the {plant_name} tree "
            f"based on the sensor data (e.g. watering schedule, nutrient need, or disease risk). "
            f"Then suggest one complementary crop or plant that grows well alongside {plant_name} in this soil."
        )
    else:
        crop_instruction = (
            "crop_suggestion: Based on the sensor data (soil moisture, temperature, humidity), "
            "name the single best crop to start growing on this field right now and give one reason why."
        )

    prompt = f"""
You are an agricultural expert helping an Indian farmer.
Use the sensor data and field context below to fill in exactly three JSON fields.
Keep every answer practical, plain, and short — 1 to 2 sentences per field. No markdown.

Field context:
- {describe_field_context(plant_type, plant_name)}

Sensor summary JSON:
{prompt_data["summary_json"]}

Recent sensor readings JSON, oldest to newest:
{prompt_data["rows_json"]}

Fill in the three fields as follows:
- {crop_instruction}
- irrigation_advice: Tell the farmer exactly what to do with watering today — ON, OFF, how long, or any caution — based on the moisture trend.
- soil_health: Describe the current soil condition (moisture, temperature suitability) and flag any concern the farmer should watch.
"""

    if not gemini_key_states:
        message = (
            "No Gemini API keys configured. Add up to 3 keys in "
            "GEMINI_API_KEYS or place one key per line in gemini_keys.txt."
        )
        return {
            "crop_suggestion": message,
            "irrigation_advice": message,
            "soil_health": message,
        }

    errors = []
    attempted_any_key = False

    for index in get_next_ready_key_indices():
        attempted_any_key = True
        state = gemini_key_states[index]

        try:
            response = state["client"].models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ADVICE_RESPONSE_SCHEMA,
                    candidate_count=1,
                    max_output_tokens=GEMINI_MAX_OUTPUT_TOKENS,
                    temperature=GEMINI_TEMPERATURE,
                ),
            )
            raw_text = (response.text or "").strip()
            print(f"[GEMINI] Raw response ({len(raw_text)} chars): {raw_text[:300]}")
            advice = json.loads(raw_text) if raw_text else {}

            if not all(
                key in advice
                for key in ["crop_suggestion", "irrigation_advice", "soil_health"]
            ):
                raise ValueError(
                    f"Gemini response missing required keys. Got: {list(advice.keys())}"
                )

            print(
                f"[OK] Gemini response received from key {index + 1} using {GEMINI_MODEL}"
            )
            return advice

        except Exception as error:
            error_text = str(error)
            errors.append(error_text)
            print(f"[ERROR] Gemini error on key {index + 1}: {error_text}")

            if is_gemini_quota_error(error_text):
                mark_key_quota_limited(index, error_text)
                continue

            if is_gemini_auth_error(error_text):
                disable_key(index, error_text)
                continue

    pool_status = get_key_pool_status()

    if not attempted_any_key:
        if pool_status["configured"] == 0:
            message = (
                "No Gemini API keys configured. Add up to 3 keys in "
                "GEMINI_API_KEYS or place one key per line in gemini_keys.txt."
            )
        else:
            message = (
                "All Gemini keys are cooling down after hitting free-tier limits. "
                f"Try again in about {pool_status['next_ready_in_seconds']} seconds."
            )
    elif pool_status["available"] == 0 and pool_status["configured"] > pool_status["disabled"]:
        message = (
            "All Gemini keys hit their free-tier quota or rate limit. "
            f"Try again in about {pool_status['next_ready_in_seconds']} seconds."
        )
    elif pool_status["disabled"] == pool_status["configured"]:
        message = "All configured Gemini keys were rejected. Check the keys and Gemini API access."
    elif errors:
        message = f"Gemini request failed: {errors[-1]}"
    else:
        message = "Gemini request failed for an unknown reason."

    return {
        "crop_suggestion": message,
        "irrigation_advice": message,
        "soil_health": message,
    }


def get_latest_gemini_advice():
    global latest_advice_cache

    recent_rows = get_recent_sensor_rows_from_database()
    if not recent_rows:
        return None

    farm_context = get_farm_context()
    latest_row = recent_rows[-1]
    signature = get_recent_advice_signature(recent_rows, farm_context)

    if latest_advice_cache["signature"] == signature and latest_advice_cache["advice"]:
        return latest_advice_cache["advice"]

    advice = get_gemini_advice(
        recent_rows,
        farm_context["plant_type"],
        farm_context["plant_name"],
    )
    advice_payload = {
        "sensor_id": latest_row["id"],
        "timestamp": latest_row["timestamp"],
        "reading_count_used": len(recent_rows),
        "reading_limit": GEMINI_SENSOR_HISTORY_LIMIT,
        "plant_type": farm_context["plant_type"],
        "plant_name": farm_context["plant_name"],
        "crop_suggestion": advice["crop_suggestion"],
        "irrigation_advice": advice["irrigation_advice"],
        "soil_health": advice["soil_health"],
    }

    latest_advice_cache = {
        "signature": signature,
        "advice": advice_payload,
    }
    return advice_payload


def decide_pump(moisture):
    global manual_pump_state

    if manual_pump_state == "ON":
        return "ON"

    if moisture < PUMP_THRESHOLD:
        return "ON"

    return "OFF"


@app.route("/api/data", methods=["POST"])
def receive_sensor_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    moisture = float(data.get("moisture", 0))
    temperature = float(data.get("temperature", 0))
    humidity = float(data.get("humidity", 0))

    pump_status = decide_pump(moisture)

    save_to_database(
        moisture,
        temperature,
        humidity,
        pump_status,
    )

    return jsonify({
        "status": "ok",
        "pump_command": pump_status,
    })


@app.route("/api/latest", methods=["GET"])
def get_latest_data():
    latest = get_latest_from_database()

    if latest is None:
        farm_context = get_farm_context()
        return jsonify({
            "message": "No data yet. Waiting for ESP32...",
            "sensor_id": None,
            "moisture": None,
            "temperature": None,
            "humidity": None,
            "pump_status": "OFF",
            "plant_type": farm_context["plant_type"],
            "plant_name": farm_context["plant_name"],
            "timestamp": None,
        })

    return jsonify(latest)


@app.route("/api/advice/latest", methods=["GET"])
def get_latest_advice():
    advice = get_latest_gemini_advice()

    if advice is None:
        return jsonify({
            "error": "No sensor data yet. Waiting for ESP32...",
            "crop_suggestion": "Waiting for sensor data...",
            "irrigation_advice": "Waiting for sensor data...",
            "soil_health": "Waiting for sensor data...",
        }), 404

    return jsonify(advice)


@app.route("/api/farm-context", methods=["POST"])
def update_farm_context():
    data = request.get_json() or {}

    try:
        farm_context = normalize_farm_context(
            data.get("plant_type"),
            data.get("plant_name"),
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    if farm_context["plant_type"] != "none" and not farm_context["plant_name"]:
        return jsonify({"error": "Please enter the crop or tree name"}), 400

    save_farm_context(farm_context["plant_type"], farm_context["plant_name"])

    return jsonify({
        "status": "ok",
        "message": "Field context saved",
        "plant_type": farm_context["plant_type"],
        "plant_name": farm_context["plant_name"],
        "latest_data": get_latest_from_database(),
    })


@app.route("/api/analyze-image", methods=["POST"])
def analyze_image():
    data = request.get_json()
    if not data or "image" not in data or "mime_type" not in data:
        return jsonify({"error": "Missing image or mime_type"}), 400

    try:
        image_bytes = base64.b64decode(data["image"])
    except Exception as e:
        return jsonify({"error": f"Invalid base64 image data: {str(e)}"}), 400

    mime_type = data["mime_type"]
    prompt = (
        "You are an expert botanist and agricultural ML model. "
        "Analyze the provided image of a plant, crop, or flower. "
        "Provide exactly three JSON fields: "
        "- quality: A brief assessment of the plant's visual quality and health. "
        "- disease: Identify any visible diseases, pests, or issues (or state 'None detected'). "
        "- precautions: Provide 1-2 practical steps to care for this plant or treat any identified issues."
    )

    refresh_gemini_key_states()

    if not gemini_key_states:
        return jsonify({"error": "No ML model keys configured."}), 500

    errors = []
    
    for index in get_next_ready_key_indices():
        state = gemini_key_states[index]

        try:
            response = state["client"].models.generate_content(
                model=GEMINI_MODEL,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=IMAGE_ANALYSIS_SCHEMA,
                    candidate_count=1,
                    max_output_tokens=GEMINI_MAX_OUTPUT_TOKENS,
                    temperature=GEMINI_TEMPERATURE,
                ),
            )
            raw_text = (response.text or "").strip()
            print(f"[ML_MODEL] Image analysis raw response: {raw_text[:300]}")
            result = json.loads(raw_text) if raw_text else {}
            
            if not all(k in result for k in ["quality", "disease", "precautions"]):
                raise ValueError(f"Response missing required keys. Got: {list(result.keys())}")

            return jsonify(result)

        except Exception as error:
            error_text = str(error)
            errors.append(error_text)
            print(f"[ERROR] ML model image analysis error on key {index + 1}: {error_text}")

            if is_gemini_quota_error(error_text):
                mark_key_quota_limited(index, error_text)
                continue

            if is_gemini_auth_error(error_text):
                disable_key(index, error_text)
                continue

    return jsonify({"error": f"ML model analysis failed. Errors: {errors[-1] if errors else 'Unknown'}"}), 500


@app.route("/api/pump", methods=["POST"])
def manual_pump_control():
    global manual_pump_state

    data = request.get_json() or {}
    command = data.get("pump_command", "OFF")

    if command not in ["ON", "OFF"]:
        return jsonify({"error": "Invalid command"}), 400

    manual_pump_state = command
    return jsonify({"status": "ok", "pump_status": command})


@app.route("/api/seed-demo", methods=["POST"])
def seed_demo_endpoint():
    supabase.table("sensor_data").delete().neq("id", 0).execute()
    supabase.table("farm_context").delete().neq("id", 0).execute()

    init_database()
    seed_demo_data()

    return jsonify({
        "status": "ok",
        "message": "Demo data loaded",
        "latest_data": get_latest_from_database(),
    })


@app.route("/")
def serve_dashboard():
    return send_from_directory(FRONTEND_FOLDER, "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)


if __name__ == "__main__":
    init_database()
    seed_demo_data()

    print("\n[FARM] Smart Farm Advisor Server Starting...")
    print("[DASHBOARD] http://localhost:5000")
    print("[ESP32] Endpoint: http://localhost:5000/api/data")
    print("[DEMO] Demo data auto-loads when the database is empty")
    print(
        f"[GEMINI] Model: {GEMINI_MODEL} | Configured keys: {len(gemini_key_states)}"
    )

    app.run(debug=True, host="0.0.0.0", port=5000)
