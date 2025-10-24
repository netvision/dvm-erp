-- Sample data for School Library Management System
-- Run after creating the schema

-- Insert sample users
INSERT INTO users (first_name, last_name, email, password_hash, role, phone, address, employee_id, department) VALUES
('John', 'Admin', 'admin@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5ew0GnrvWrW7S', 'admin', '555-0001', '123 Admin St', 'EMP001', 'Administration'),
('Sarah', 'Librarian', 'librarian@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5ew0GnrvWrW7S', 'librarian', '555-0002', '456 Library Ave', 'EMP002', 'Library'),
('Mike', 'Teacher', 'teacher@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5ew0GnrvWrW7S', 'teacher', '555-0003', '789 Teacher Rd', 'EMP003', 'Mathematics'),
('Alice', 'Student', 'alice@student.school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5ew0GnrvWrW7S', 'student', '555-0004', '321 Student St', NULL, NULL),
('Bob', 'Student', 'bob@student.school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5ew0GnrvWrW7S', 'student', '555-0005', '654 Student Ave', NULL, NULL);

-- Update students with student IDs and grade levels
UPDATE users SET student_id = 'STU001', grade_level = '10th Grade' WHERE email = 'alice@student.school.edu';
UPDATE users SET student_id = 'STU002', grade_level = '11th Grade' WHERE email = 'bob@student.school.edu';

-- Insert sample books
INSERT INTO books (title, author, isbn, publisher, publication_year, genre, description, total_copies, available_copies, location) VALUES
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'J.B. Lippincott & Co.', 1960, 'Fiction', 'A classic American novel dealing with serious issues of rape and racial inequality.', 5, 5, 'A1-001'),
('1984', 'George Orwell', '978-0-452-28423-4', 'Secker & Warburg', 1949, 'Dystopian Fiction', 'A dystopian social science fiction novel and cautionary tale.', 3, 2, 'A1-002'),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Charles Scribners Sons', 1925, 'Fiction', 'A classic American novel set in the Jazz Age.', 4, 4, 'A1-003'),
('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'T. Egerton', 1813, 'Romance', 'A romantic novel of manners set in Georgian England.', 3, 3, 'A2-001'),
('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Little, Brown and Company', 1951, 'Fiction', 'A controversial novel about teenage rebellion and alienation.', 2, 1, 'A2-002'),
('Lord of the Flies', 'William Golding', '978-0-571-05686-2', 'Faber & Faber', 1954, 'Fiction', 'A novel about a group of British boys stranded on an uninhabited island.', 4, 4, 'A2-003'),
('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92822-7', 'George Allen & Unwin', 1937, 'Fantasy', 'A fantasy novel about the adventures of Bilbo Baggins.', 6, 5, 'B1-001'),
('Harry Potter and the Philosophers Stone', 'J.K. Rowling', '978-0-7475-3269-9', 'Bloomsbury', 1997, 'Fantasy', 'The first novel in the Harry Potter series.', 8, 7, 'B1-002'),
('Calculus: Early Transcendentals', 'James Stewart', '978-1-285-74155-0', 'Cengage Learning', 2015, 'Mathematics', 'A comprehensive calculus textbook.', 10, 8, 'C1-001'),
('Introduction to Algorithms', 'Thomas H. Cormen', '978-0-262-03384-8', 'MIT Press', 2009, 'Computer Science', 'A comprehensive textbook on algorithms.', 5, 4, 'C1-002');

-- Insert sample media
INSERT INTO media (title, type, format, duration, description, total_copies, available_copies, location) VALUES
('The Shawshank Redemption', 'dvd', 'DVD', 142, 'Classic drama film about hope and friendship in prison.', 2, 2, 'M1-001'),
('Planet Earth', 'dvd', 'Blu-ray', 550, 'BBC nature documentary series.', 3, 3, 'M1-002'),
('The Beatles - Abbey Road', 'cd', 'Audio CD', 47, 'Classic album by The Beatles.', 1, 1, 'M2-001'),
('Mozart Complete Works', 'cd', 'Audio CD Box Set', 4200, 'Complete collection of Mozart compositions.', 1, 1, 'M2-002'),
('Introduction to Python Programming', 'digital', 'MP4', 480, 'Video course on Python programming basics.', 1, 1, 'Digital Library'),
('The Great Gatsby Audiobook', 'audiobook', 'MP3', 180, 'Audio version of the classic novel.', 1, 1, 'Digital Library'),
('Digital Photography Guide', 'ebook', 'PDF', NULL, 'Comprehensive guide to digital photography.', 1, 1, 'Digital Library'),
('Learn Spanish - Beginners', 'digital', 'Interactive', 300, 'Interactive Spanish learning course.', 1, 1, 'Digital Library');

-- Add access URLs for digital media
UPDATE media SET access_url = 'https://library.school.edu/digital/python-intro' WHERE title = 'Introduction to Python Programming';
UPDATE media SET access_url = 'https://library.school.edu/audiobooks/great-gatsby' WHERE title = 'The Great Gatsby Audiobook';
UPDATE media SET access_url = 'https://library.school.edu/ebooks/photography-guide' WHERE title = 'Digital Photography Guide';
UPDATE media SET access_url = 'https://library.school.edu/courses/learn-spanish' WHERE title = 'Learn Spanish - Beginners';

-- Insert sample borrow records
INSERT INTO borrow_records (user_id, book_id, due_date, status) VALUES
((SELECT id FROM users WHERE email = 'alice@student.school.edu'), 
 (SELECT id FROM books WHERE title = '1984'), 
 CURRENT_DATE + INTERVAL '14 days', 'borrowed'),
((SELECT id FROM users WHERE email = 'bob@student.school.edu'), 
 (SELECT id FROM books WHERE title = 'The Catcher in the Rye'), 
 CURRENT_DATE + INTERVAL '10 days', 'borrowed'),
((SELECT id FROM users WHERE email = 'alice@student.school.edu'), 
 (SELECT id FROM books WHERE title = 'The Hobbit'), 
 CURRENT_DATE - INTERVAL '2 days', 'overdue');

-- Insert sample bookmarks
INSERT INTO bookmarks (user_id, book_id, notes) VALUES
((SELECT id FROM users WHERE email = 'alice@student.school.edu'), 
 (SELECT id FROM books WHERE title = 'Harry Potter and the Philosophers Stone'), 
 'Want to read this classic fantasy novel'),
((SELECT id FROM users WHERE email = 'alice@student.school.edu'), 
 (SELECT id FROM books WHERE title = 'Pride and Prejudice'), 
 'Recommended by English teacher'),
((SELECT id FROM users WHERE email = 'bob@student.school.edu'), 
 (SELECT id FROM books WHERE title = 'Introduction to Algorithms'), 
 'Need for computer science class'),
((SELECT id FROM users WHERE email = 'teacher@school.edu'), 
 (SELECT id FROM books WHERE title = 'Calculus: Early Transcendentals'), 
 'Reference material for teaching');

-- Insert sample media access logs
INSERT INTO media_access_logs (user_id, media_id, access_date) VALUES
((SELECT id FROM users WHERE email = 'alice@student.school.edu'), 
 (SELECT id FROM media WHERE title = 'Introduction to Python Programming'), 
 CURRENT_TIMESTAMP - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'bob@student.school.edu'), 
 (SELECT id FROM media WHERE title = 'Learn Spanish - Beginners'), 
 CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'teacher@school.edu'), 
 (SELECT id FROM media WHERE title = 'Digital Photography Guide'), 
 CURRENT_TIMESTAMP - INTERVAL '3 hours');

-- Note: The password hash used above is for the password "password123"
-- In production, each user should have their own secure password