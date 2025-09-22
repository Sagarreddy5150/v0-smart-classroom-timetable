-- Insert GITAM subjects
INSERT INTO public.subjects (code, name, department, credits, is_lab, duration_minutes) VALUES
('CSEN2191', 'Introduction To Competitive Programming', 'Computer Science', 3, false, 50),
('CSEN2191P', 'Introduction To Competitive Programming Lab', 'Computer Science', 1, true, 100),
('MECH2331', 'Introduction To Operations Research', 'Mechanical Engineering', 3, false, 50),
('CIVL2281', 'Disaster Management', 'Civil Engineering', 3, false, 50),
('CLAD2001', 'Preparation For Campus Placement-1 (Soft Skills 5A)', 'General Studies', 2, false, 50),
('CSEN3061', 'Automata Theory and Compiler Design', 'Computer Science', 4, false, 50),
('CSEN2061', 'Database Management Systems', 'Computer Science', 3, false, 50),
('CSEN2061P', 'Database Management Systems Lab', 'Computer Science', 1, true, 100),
('CSEN3001', 'Design and analysis of algorithms', 'Computer Science', 4, false, 50),
('CSEN2081', 'Data Visualization and Exploration with R', 'Computer Science', 3, false, 50),
('CSEN2081P', 'Data Visualization and Exploration With R Lab', 'Computer Science', 1, true, 100),
('PHPY1001', 'Gandhi for the 21st Century', 'Philosophy', 2, false, 50),
('MFST1001', 'Health and Wellbeing', 'Medical Sciences', 2, false, 50),
('FINA3001', 'Personal Financial Planning', 'Finance', 3, false, 50);

-- Insert ICT-enabled rooms
INSERT INTO public.rooms (room_number, name, capacity, room_type, has_ict, resources) VALUES
('ICT-101', 'ICT Classroom 101', 60, 'classroom', true, ARRAY['Projector', 'Smart Board', 'Audio System', 'WiFi']),
('ICT-102', 'ICT Classroom 102', 60, 'classroom', true, ARRAY['Projector', 'Smart Board', 'Audio System', 'WiFi']),
('ICT-103', 'ICT Classroom 103', 60, 'classroom', true, ARRAY['Projector', 'Smart Board', 'Audio System', 'WiFi']),
('ICT-104', 'ICT Classroom 104', 60, 'classroom', true, ARRAY['Projector', 'Smart Board', 'Audio System', 'WiFi']),
('ICT-105', 'ICT Classroom 105', 60, 'classroom', true, ARRAY['Projector', 'Smart Board', 'Audio System', 'WiFi']),
('LAB-201', 'Computer Science Lab 1', 30, 'lab', true, ARRAY['Computers', 'Projector', 'Smart Board', 'Software', 'WiFi']),
('LAB-202', 'Computer Science Lab 2', 30, 'lab', true, ARRAY['Computers', 'Projector', 'Smart Board', 'Software', 'WiFi']),
('LAB-203', 'Data Science Lab', 30, 'lab', true, ARRAY['Computers', 'Projector', 'R Studio', 'Python', 'WiFi']),
('LAB-204', 'Database Lab', 30, 'lab', true, ARRAY['Computers', 'Projector', 'Database Software', 'WiFi']),
('AUD-301', 'Main Auditorium', 200, 'auditorium', true, ARRAY['Projector', 'Sound System', 'Microphones', 'WiFi']);

-- Insert sample admin user (will be created when someone signs up with this email)
-- Note: Actual user creation happens through auth.users, this is just for reference
