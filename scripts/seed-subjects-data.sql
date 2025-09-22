-- Insert subjects based on the timetable and course data
INSERT INTO subjects (id, code, name, credits, duration_minutes, is_lab, department, created_at) VALUES
(gen_random_uuid(), 'CIVL2281', 'Disaster Management', 3, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CLAD2001', 'Preparation For Campus Placement-1 (Soft Skills 5A)', 2, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CSEN2061', 'Database Management Systems', 4, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CSEN2061P', 'Database Management Systems Lab', 2, 120, true, 'computer science', now()),
(gen_random_uuid(), 'CSEN2081', 'Data Visualization and Exploration with R', 3, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CSEN2081P', 'Data Visualization and Exploration With R Lab', 2, 120, true, 'computer science', now()),
(gen_random_uuid(), 'CSEN2191', 'Introduction To Competitive Programming', 3, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CSEN2191P', 'Introduction To Competitive Programming Lab', 2, 120, true, 'computer science', now()),
(gen_random_uuid(), 'CSEN3001', 'Design and analysis of algorithms', 4, 50, false, 'computer science', now()),
(gen_random_uuid(), 'CSEN3061', 'Automata Theory and Compiler Design', 4, 50, false, 'computer science', now()),
(gen_random_uuid(), 'MECH2331', 'Mechanical Engineering Course', 3, 50, false, 'mechanical', now());
