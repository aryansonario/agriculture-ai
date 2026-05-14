-- Dummy test data for Smart Farm Advisor
-- Run this after app.py has created the tables:
-- sqlite3 agriculture.db < test_data.sql

BEGIN TRANSACTION;

DELETE FROM sensor_data;

INSERT INTO sensor_data (
    moisture,
    temperature,
    humidity,
    ph,
    pump_status,
    timestamp
) VALUES
    (
        28.4,
        33.1,
        48.2,
        6.2,
        'ON',
        '2026-05-13 08:00:00'
    ),
    (
        41.7,
        30.4,
        58.9,
        6.5,
        'OFF',
        '2026-05-13 08:20:00'
    ),
    (
        52.6,
        27.8,
        67.3,
        6.7,
        'OFF',
        '2026-05-13 08:40:00'
    ),
    (
        63.9,
        26.9,
        72.4,
        6.8,
        'OFF',
        '2026-05-13 09:00:00'
    ),
    (
        46.5,
        29.7,
        61.1,
        6.4,
        'OFF',
        '2026-05-13 09:20:00'
    ),
    (
        34.8,
        31.9,
        54.7,
        6.3,
        'OFF',
        '2026-05-13 09:40:00'
    ),
    (
        57.2,
        28.6,
        65.8,
        6.6,
        'OFF',
        '2026-05-13 10:00:00'
    ),
    (
        49.3,
        29.1,
        63.5,
        6.5,
        'OFF',
        '2026-05-13 10:20:00'
    );

COMMIT;
