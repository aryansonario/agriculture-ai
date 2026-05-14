DELETE FROM sensor_data;
DELETE FROM farm_context;

INSERT INTO farm_context (id, plant_type, plant_name, updated_at)
VALUES (1, 'crop', 'Wheat', now());

INSERT INTO sensor_data (moisture, temperature, humidity, pump_status, timestamp)
VALUES
  (28.4, 33.1, 48.2, 'ON', '2026-05-13 08:00:00'),
  (41.7, 30.4, 58.9, 'OFF', '2026-05-13 08:20:00'),
  (52.6, 27.8, 67.3, 'OFF', '2026-05-13 08:40:00'),
  (63.9, 26.9, 72.4, 'OFF', '2026-05-13 09:00:00'),
  (46.5, 29.7, 61.1, 'OFF', '2026-05-13 09:20:00'),
  (34.8, 31.9, 54.7, 'OFF', '2026-05-13 09:40:00'),
  (57.2, 28.6, 65.8, 'OFF', '2026-05-13 10:00:00'),
  (49.3, 29.1, 63.5, 'OFF', '2026-05-13 10:20:00'),
  (35.2, 31.5, 55.1, 'ON', '2026-05-13 10:40:00'),
  (45.8, 28.9, 61.2, 'OFF', '2026-05-13 11:00:00');
