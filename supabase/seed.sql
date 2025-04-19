
-- Seed file for local development
DELETE FROM auth.users 
WHERE email IN ('admin@campuslms.com', 'instructor@campuslms.com', 'student@campuslms.com');

-- Insert sample users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('d7bed472-7f16-4b97-8339-dc6f08dad8a7', 'admin@campuslms.com', '$2a$10$PJTLzlZc3F5fmUVPZPcQkeWYlQCxqtcxCoC.Qr4GH5HI7dRjy1ouS', NOW(), '{"full_name": "Admin User"}'),
  ('9e47a9d7-0c3f-4676-9d39-3e57cba7137c', 'instructor@campuslms.com', '$2a$10$PJTLzlZc3F5fmUVPZPcQkeWYlQCxqtcxCoC.Qr4GH5HI7dRjy1ouS', NOW(), '{"full_name": "Test Instructor"}'),
  ('f5f6e0a3-b8d4-4e17-8c98-1c0dfb5b5d3e', 'student@campuslms.com', '$2a$10$PJTLzlZc3F5fmUVPZPcQkeWYlQCxqtcxCoC.Qr4GH5HI7dRjy1ouS', NOW(), '{"full_name": "Test Student"}');
