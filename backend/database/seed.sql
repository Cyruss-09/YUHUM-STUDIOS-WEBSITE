-- Active: 1784321332673@@127.0.0.1@5432@Yuhum.Studio.db
INSERT INTO bookings (
    package_id, 
    package_title, 
    base_price, 
    studio, 
    booking_date, 
    day_of_week, 
    booking_time, 
    add_ons, 
    user_email
) VALUES (
    'pkg_01', 
    'Standard Portrait Session', 
    '1500', 
    'Yuhum Studios Main', 
    '2026-08-15', 
    'Saturday', 
    '14:00', 
    ARRAY['Extra Edited Photo', 'Hair & Makeup'], 
    'client@example.com'
);