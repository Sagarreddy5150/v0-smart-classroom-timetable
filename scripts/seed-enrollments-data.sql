-- Enroll all students in all subjects for semester 3
INSERT INTO student_enrollments (id, student_id, subject_id, academic_year, semester, enrolled_at)
SELECT 
  gen_random_uuid(),
  u.id as student_id,
  s.id as subject_id,
  '2024-25',
  '3',
  now()
FROM users u
CROSS JOIN subjects s
WHERE u.role = 'student';

-- Create faculty-subject assignments
INSERT INTO faculty_subjects (id, faculty_id, subject_id, academic_year, semester, student_count, created_at)
SELECT 
  gen_random_uuid(),
  f.id as faculty_id,
  s.id as subject_id,
  '2024-25',
  '3',
  (SELECT COUNT(*) FROM users WHERE role = 'student'),
  now()
FROM (
  VALUES 
    ('Dr. T Srikanth', 'CSEN2081'),
    ('Dr. Ravi Teja Gedela', 'CSEN2061'),
    ('Dr. Amanapu Yaswanth', 'CSEN2191'),
    ('Dr. Manda Rama Narasinga Rao', 'CSEN3061'),
    ('Mr. Dr.Maddamsetty Ramesh', 'CIVL2281'),
    ('Dr. Sreekanth Puli', 'CSEN3001'),
    ('Dalli Sagar Durga Pradeep', 'MECH2331')
) AS assignments(faculty_name, subject_code)
JOIN users f ON f.full_name = assignments.faculty_name AND f.role = 'faculty'
JOIN subjects s ON s.code = assignments.subject_code;
