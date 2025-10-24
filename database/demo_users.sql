-- Insert demo users for testing the enhanced user management
INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, student_id) VALUES 
('John', 'Doe', 'john.doe@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkY0Y.S5mFj3K3a', 'student', true, 'STU001'),
('Jane', 'Smith', 'jane.smith@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkY0Y.S5mFj3K3a', 'student', true, 'STU002'),
('Bob', 'Wilson', 'bob.wilson@librarian.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkY0Y.S5mFj3K3a', 'librarian', true, NULL),
('Alice', 'Johnson', 'alice.johnson@admin.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkY0Y.S5mFj3K3a', 'admin', true, NULL);

-- Update existing admin password for testing
UPDATE users SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkY0Y.S5mFj3K3a' WHERE email = 'admin@school.edu';