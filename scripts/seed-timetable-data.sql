-- Create timetable slots based on the schedule shown in images
WITH faculty_ids AS (
  SELECT id, full_name FROM users WHERE role = 'faculty'
),
subject_ids AS (
  SELECT id, code FROM subjects
),
room_ids AS (
  SELECT id, room_number FROM rooms
)

INSERT INTO timetable_slots (id, day_of_week, start_time, end_time, subject_id, faculty_id, room_id, academic_year, semester, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  day_of_week,
  start_time,
  end_time,
  s.id as subject_id,
  f.id as faculty_id,
  r.id as room_id,
  '2024-25',
  '3',
  true,
  now(),
  now()
FROM (
  -- Monday schedule
  VALUES 
    (1, '08:00'::time, '08:50'::time, 'CSEN2081', 'Dr. T Srikanth', '101'),
    (1, '09:00'::time, '09:50'::time, 'CSEN2061', 'Dr. Ravi Teja Gedela', '101'),
    (1, '10:00'::time, '10:50'::time, 'CSEN2191P', 'Dr. Amanapu Yaswanth', 'LAB-A'),
    (1, '11:00'::time, '11:50'::time, 'CSEN3061', 'Dr. Manda Rama Narasinga Rao', '101'),
    (1, '12:00'::time, '12:50'::time, 'CIVL2281', 'Mr. Dr.Maddamsetty Ramesh', '101'),
    (1, '14:00'::time, '14:50'::time, 'CSEN3001', 'Dr. Sreekanth Puli', '101'),
    
  -- Tuesday schedule  
    (2, '08:00'::time, '08:50'::time, 'CLAD2001', 'Dr. T Srikanth', '101'),
    (2, '09:00'::time, '09:50'::time, 'CLAD2001', 'Dr. T Srikanth', '101'),
    (2, '10:00'::time, '10:50'::time, 'CSEN2061', 'Dr. Ravi Teja Gedela', '101'),
    (2, '11:00'::time, '11:50'::time, 'CSEN2191', 'Dr. Amanapu Yaswanth', '101'),
    (2, '12:00'::time, '12:50'::time, 'CIVL2281', 'Mr. Dr.Maddamsetty Ramesh', '101'),
    (2, '14:00'::time, '14:50'::time, 'MECH2331', 'Dalli Sagar Durga Pradeep', '205'),
    
  -- Wednesday schedule
    (3, '08:00'::time, '08:50'::time, 'CSEN2061', 'Dr. Ravi Teja Gedela', '101'),
    (3, '09:00'::time, '09:50'::time, 'CSEN2191P', 'Dr. Amanapu Yaswanth', 'LAB-A'),
    (3, '10:00'::time, '10:50'::time, 'CSEN3001', 'Dr. Sreekanth Puli', '101'),
    (3, '11:00'::time, '11:50'::time, 'CSEN2081', 'Dr. T Srikanth', '101'),
    (3, '12:00'::time, '12:50'::time, 'CIVL2281', 'Mr. Dr.Maddamsetty Ramesh', '101'),
    
  -- Thursday schedule
    (4, '08:00'::time, '08:50'::time, 'CSEN3061', 'Dr. Manda Rama Narasinga Rao', '101'),
    (4, '09:00'::time, '09:50'::time, 'CSEN2081', 'Dr. T Srikanth', '101'),
    (4, '10:00'::time, '10:50'::time, 'CSEN2061P', 'Dr. Ravi Teja Gedela', 'LAB-B'),
    (4, '11:00'::time, '11:50'::time, 'CSEN2061P', 'Dr. Ravi Teja Gedela', 'LAB-B'),
    (4, '12:00'::time, '12:50'::time, 'MECH2331', 'Dalli Sagar Durga Pradeep', '205'),
    
  -- Friday schedule
    (5, '08:00'::time, '08:50'::time, 'CSEN3001', 'Dr. Sreekanth Puli', '101'),
    (5, '09:00'::time, '09:50'::time, 'CSEN3061', 'Dr. Manda Rama Narasinga Rao', '101'),
    (5, '10:00'::time, '10:50'::time, 'CSEN2081P', 'Dr. T Srikanth', 'LAB-A'),
    (5, '11:00'::time, '11:50'::time, 'CSEN2081P', 'Dr. T Srikanth', 'LAB-A'),
    (5, '12:00'::time, '12:50'::time, 'MECH2331', 'Dalli Sagar Durga Pradeep', '205'),
    (5, '14:00'::time, '14:50'::time, 'CSEN2191P', 'Dr. Amanapu Yaswanth', 'LAB-A'),
    (5, '15:00'::time, '15:50'::time, 'CSEN2191P', 'Dr. Amanapu Yaswanth', 'LAB-A')
) AS schedule(day_of_week, start_time, end_time, subject_code, faculty_name, room_number)
JOIN subject_ids s ON s.code = schedule.subject_code
JOIN faculty_ids f ON f.full_name = schedule.faculty_name  
JOIN room_ids r ON r.room_number = schedule.room_number;
