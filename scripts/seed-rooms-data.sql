-- Insert rooms
INSERT INTO rooms (id, name, room_number, capacity, room_type, has_ict, resources, created_at) VALUES
(gen_random_uuid(), 'Room 101', '101', 60, 'classroom', true, ARRAY['projector', 'whiteboard', 'ac'], now()),
(gen_random_uuid(), 'Room 205', '205', 40, 'classroom', true, ARRAY['projector', 'whiteboard', 'ac'], now()),
(gen_random_uuid(), 'Lab A', 'LAB-A', 30, 'lab', true, ARRAY['computers', 'projector', 'ac'], now()),
(gen_random_uuid(), 'Lab B', 'LAB-B', 30, 'lab', true, ARRAY['computers', 'projector', 'ac'], now());
