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
('Learn Spanish - Beginners', 'digital', 'Interactive', 300, 'Interactive Spanish learning course.', 1, 1, 'Digital Library'),
-- NCERT Educational Ebooks
('NCERT Mathematics Class 10', 'ebook', 'PDF', NULL, 'NCERT Mathematics textbook for Class 10 - Complete curriculum covering Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, and Statistics.', 1, 1, 'Digital Library'),
('NCERT Science Class 10', 'ebook', 'PDF', NULL, 'NCERT Science textbook for Class 10 - Covers Chemical Reactions and Equations, Acids, Bases and Salts, Metals and Non-metals, Carbon and its Compounds, Life Processes, Control and Coordination, Heredity and Evolution, Light, Electricity, and more.', 1, 1, 'Digital Library'),
('NCERT Physics Class 11', 'ebook', 'PDF', NULL, 'NCERT Physics Part 1 for Class 11 - Comprehensive coverage of Physical World, Units and Measurements, Motion in a Straight Line, Motion in a Plane, Laws of Motion, Work Energy and Power, System of Particles and Rotational Motion, and Gravitation.', 1, 1, 'Digital Library'),
('NCERT Chemistry Class 11', 'ebook', 'PDF', NULL, 'NCERT Chemistry Part 1 for Class 11 - Covers Structure of Atom, Classification of Elements, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Redox Reactions, and Organic Chemistry basics.', 1, 1, 'Digital Library'),
('NCERT Biology Class 11', 'ebook', 'PDF', NULL, 'NCERT Biology for Class 11 - Diversity in Living World, Structural Organisation in Animals and Plants, Cell Structure and Function, Plant Physiology, and Human Physiology.', 1, 1, 'Digital Library'),
('NCERT Mathematics Class 12', 'ebook', 'PDF', NULL, 'NCERT Mathematics Part 1 & 2 for Class 12 - Advanced topics including Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, Applications of Derivatives, Integrals, Applications of Integrals, Differential Equations, Vectors, Three Dimensional Geometry, Linear Programming, and Probability.', 1, 1, 'Digital Library'),
('NCERT Physics Class 12', 'ebook', 'PDF', NULL, 'NCERT Physics Part 1 & 2 for Class 12 - Electric Charges and Fields, Electrostatic Potential and Capacitance, Current Electricity, Magnetic Effects of Current, Magnetism and Matter, Electromagnetic Induction, Alternating Current, Electromagnetic Waves, Ray Optics, Wave Optics, Dual Nature of Radiation, Atoms, Nuclei, and Semiconductor Electronics.', 1, 1, 'Digital Library'),
('NCERT Chemistry Class 12', 'ebook', 'PDF', NULL, 'NCERT Chemistry Part 1 & 2 for Class 12 - Solutions, Electrochemistry, Chemical Kinetics, Surface Chemistry, General Principles of Isolation of Elements, p-Block Elements, d and f Block Elements, Coordination Compounds, Haloalkanes and Haloarenes, Alcohols Phenols and Ethers, Aldehydes Ketones and Carboxylic Acids, Amines, Biomolecules, and Polymers.', 1, 1, 'Digital Library'),
('NCERT Biology Class 12', 'ebook', 'PDF', NULL, 'NCERT Biology for Class 12 - Reproduction in Organisms, Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance and Variation, Molecular Basis of Inheritance, Evolution, Human Health and Disease, Strategies for Enhancement in Food Production, Microbes in Human Welfare, Biotechnology, Organisms and Populations, Ecosystem, Biodiversity and Conservation, and Environmental Issues.', 1, 1, 'Digital Library'),
('NCERT English Beehive Class 9', 'ebook', 'PDF', NULL, 'NCERT English Beehive textbook for Class 9 - Collection of prose and poetry including works by various authors, designed to enhance reading comprehension and literary appreciation.', 1, 1, 'Digital Library'),
('NCERT History - India and the Contemporary World Class 9', 'ebook', 'PDF', NULL, 'NCERT History textbook for Class 9 - The French Revolution, Socialism in Europe and Russian Revolution, Nazism and the Rise of Hitler, Forest Society and Colonialism, Pastoralists in the Modern World.', 1, 1, 'Digital Library'),
('NCERT Economics - Understanding Economic Development Class 10', 'ebook', 'PDF', NULL, 'NCERT Economics textbook for Class 10 - Development, Sectors of Indian Economy, Money and Credit, Globalization and Indian Economy, Consumer Rights.', 1, 1, 'Digital Library'),
('NCERT Social Science - Democratic Politics Class 10', 'ebook', 'PDF', NULL, 'NCERT Political Science textbook for Class 10 - Power Sharing, Federalism, Democracy and Diversity, Gender Religion and Caste, Popular Struggles and Movements, Political Parties, Outcomes of Democracy.', 1, 1, 'Digital Library'),
('NCERT Hindi Kshitij Class 10', 'ebook', 'PDF', NULL, 'NCERT Hindi Kshitij textbook for Class 10 - Collection of Hindi literature including poetry and prose by renowned Hindi authors.', 1, 1, 'Digital Library'),
('NCERT Computer Science Class 11', 'ebook', 'PDF', NULL, 'NCERT Computer Science textbook for Class 11 - Computer System Organization, Computational Thinking and Programming, Introduction to Python, Data Handling, and Society Law and Ethics.', 1, 1, 'Digital Library'),
('NCERT Computer Science Class 12', 'ebook', 'PDF', NULL, 'NCERT Computer Science textbook for Class 12 - Computational Thinking and Programming-2, Computer Networks, Database Management, Boolean Logic, and Society Law and Ethics - Cyber Safety.', 1, 1, 'Digital Library');

-- Add access URLs for digital media
UPDATE media SET access_url = 'https://library.school.edu/digital/python-intro' WHERE title = 'Introduction to Python Programming';
UPDATE media SET access_url = 'https://library.school.edu/audiobooks/great-gatsby' WHERE title = 'The Great Gatsby Audiobook';
UPDATE media SET access_url = 'https://library.school.edu/ebooks/photography-guide' WHERE title = 'Digital Photography Guide';
UPDATE media SET access_url = 'https://library.school.edu/courses/learn-spanish' WHERE title = 'Learn Spanish - Beginners';

-- Add access URLs for NCERT ebooks (linking to official NCERT resources)
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?jemh1=0-8' WHERE title = 'NCERT Mathematics Class 10';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?jesc1=0-13' WHERE title = 'NCERT Science Class 10';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?keph1=0-8' WHERE title = 'NCERT Physics Class 11';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?kech1=0-14' WHERE title = 'NCERT Chemistry Class 11';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?kebo1=0-22' WHERE title = 'NCERT Biology Class 11';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?lemh1=0-16' WHERE title = 'NCERT Mathematics Class 12';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?leph1=0-15' WHERE title = 'NCERT Physics Class 12';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?lech1=0-16' WHERE title = 'NCERT Chemistry Class 12';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?lebo1=0-16' WHERE title = 'NCERT Biology Class 12';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?ieen1=0-14' WHERE title = 'NCERT English Beehive Class 9';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?iess1=0-5' WHERE title = 'NCERT History - India and the Contemporary World Class 9';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?jess4=0-5' WHERE title = 'NCERT Economics - Understanding Economic Development Class 10';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?jess2=0-8' WHERE title = 'NCERT Social Science - Democratic Politics Class 10';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?jhhn1=0-17' WHERE title = 'NCERT Hindi Kshitij Class 10';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?kecs1=0-12' WHERE title = 'NCERT Computer Science Class 11';
UPDATE media SET access_url = 'https://ncert.nic.in/textbook.php?lecs1=0-13' WHERE title = 'NCERT Computer Science Class 12';

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