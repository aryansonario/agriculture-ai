-- Smart Farm Advisor - Supabase Setup & Test Data
-- Copy and paste this entire script into the Supabase SQL Editor

-- 1. Create the tables if they do not exist
CREATE TABLE IF NOT EXISTS farm_context (
    id SERIAL PRIMARY KEY,
    plant_type TEXT NOT NULL DEFAULT 'none',
    plant_name TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    moisture NUMERIC NOT NULL,
    temperature NUMERIC NOT NULL,
    humidity NUMERIC NOT NULL,
    pump_status TEXT NOT NULL DEFAULT 'OFF',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clear existing data to avoid duplicates during testing
TRUNCATE TABLE sensor_data RESTART IDENTITY;
TRUNCATE TABLE farm_context RESTART IDENTITY;

-- 3. Insert farm context (Wheat crop)
INSERT INTO farm_context (id, plant_type, plant_name, updated_at)
VALUES (1, 'crop', 'Wheat', CURRENT_TIMESTAMP);

-- 4. Insert sensor readings 
-- Format matches app.py requirements: moisture, temperature, humidity, pump_status, timestamp
INSERT INTO sensor_data (moisture, temperature, humidity, pump_status, timestamp)
VALUES
  (28.4, 33.1, 48.2, 'ON', NOW() - INTERVAL '3 hours'),
  (41.7, 30.4, 58.9, 'OFF', NOW() - INTERVAL '2 hours 40 minutes'),
  (52.6, 27.8, 67.3, 'OFF', NOW() - INTERVAL '2 hours 20 minutes'),
  (63.9, 26.9, 72.4, 'OFF', NOW() - INTERVAL '2 hours'),
  (46.5, 29.7, 61.1, 'OFF', NOW() - INTERVAL '1 hour 40 minutes'),
  (34.8, 31.9, 54.7, 'OFF', NOW() - INTERVAL '1 hour 20 minutes'),
  (57.2, 28.6, 65.8, 'OFF', NOW() - INTERVAL '1 hour'),
  (49.3, 29.1, 63.5, 'OFF', NOW() - INTERVAL '40 minutes'),
  (35.2, 31.5, 55.1, 'ON', NOW() - INTERVAL '20 minutes'),
  (45.8, 28.9, 61.2, 'OFF', NOW());

-- 5. Verify data loaded
SELECT 'sensor_data count' as check_type, COUNT(*) as result FROM sensor_data
UNION ALL
SELECT 'farm_context count', COUNT(*) FROM farm_context;
