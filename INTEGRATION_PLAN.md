# Library Management System - Complete Integration Plan

## Project Overview
A comprehensive school library management system with Node.js + Express backend, PostgreSQL database, JWT authentication, and role-based access control. Supports books, digital resources (ebooks), media (DVDs, audiobooks), borrowing/returns, reservations, bookmarks, and analytics.

---

## 1. TECHNOLOGY STACK

### Backend
- **Runtime**: Node.js >= 16.0.0
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Validation**: Joi 17.11.0
- **Security**: Helmet 7.1.0, express-rate-limit 7.1.5
- **File Upload**: Multer 2.0.2
- **Logging**: Winston 3.11.0

### Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "joi": "^17.11.0",
  "jsonwebtoken": "^9.0.2",
  "multer": "^2.0.2",
  "pdf-parse": "^1.1.1",
  "pg": "^8.11.3",
  "winston": "^3.11.0"
}
```

---

## 2. DATABASE SCHEMA

### Complete PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'librarian', 'admin')),
    phone VARCHAR(20),
    address TEXT,
    student_id VARCHAR(50) UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    grade_level VARCHAR(20),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(255),
    publication_year INTEGER,
    genre VARCHAR(100),
    description TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    location VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_available_copies CHECK (available_copies <= total_copies)
);

-- Borrow Records Table
CREATE TABLE borrow_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
    condition_notes TEXT,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks Table
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Media Table (DVDs, CDs, Ebooks, Audiobooks, Digital Resources)
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('dvd', 'cd', 'digital', 'audiobook', 'ebook')),
    format VARCHAR(50),
    duration INTEGER,
    file_size BIGINT,
    description TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    location VARCHAR(100),
    access_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_media_available_copies CHECK (available_copies <= total_copies)
);

-- Media Borrow Records Table
CREATE TABLE media_borrow_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
    condition_notes TEXT,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Access Logs Table (for digital media tracking)
CREATE TABLE media_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    access_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Reservations Table (optional - for book reservations)
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    fulfilled_date TIMESTAMP,
    cancelled_date TIMESTAMP,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired'))
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_is_active ON books(is_active);
CREATE INDEX idx_books_available_copies ON books(available_copies);

CREATE INDEX idx_borrow_records_user_id ON borrow_records(user_id);
CREATE INDEX idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
CREATE INDEX idx_borrow_records_due_date ON borrow_records(due_date);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book_id ON bookmarks(book_id);

CREATE INDEX idx_media_title ON media(title);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_is_active ON media(is_active);

CREATE INDEX idx_media_borrow_records_user_id ON media_borrow_records(user_id);
CREATE INDEX idx_media_borrow_records_media_id ON media_borrow_records(media_id);
CREATE INDEX idx_media_borrow_records_status ON media_borrow_records(status);

CREATE INDEX idx_media_access_logs_user_id ON media_access_logs(user_id);
CREATE INDEX idx_media_access_logs_media_id ON media_access_logs(media_id);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_borrow_records_updated_at BEFORE UPDATE ON borrow_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. PROJECT STRUCTURE

```
library-system/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── database.js        # PostgreSQL connection pool
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bookController.js
│   │   ├── borrowController.js
│   │   ├── bookmarkController.js
│   │   ├── mediaController.js
│   │   ├── reservationController.js
│   │   └── analyticsController.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── BorrowRecord.js
│   │   ├── Bookmark.js
│   │   ├── Media.js
│   │   └── Reservation.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── borrowRoutes.js
│   │   ├── bookmarkRoutes.js
│   │   ├── mediaRoutes.js
│   │   └── reservationRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── authorization.js  # Role-based access
│   │   ├── validation.js     # Request validation
│   │   └── errorHandler.js
│   ├── migrations/           # Database migrations
│   │   └── 006_add_ncert_ebooks.js
│   └── utils/
│       └── logger.js         # Winston logger
├── database/
│   ├── schema.sql            # Complete database schema
│   └── sample_data.sql       # Sample/seed data
├── uploads/                  # File uploads directory
├── logs/                     # Application logs
├── .env                      # Environment variables
├── package.json
└── README.md
```

---

## 4. API ENDPOINTS

### Authentication (`/api/auth`)
```javascript
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
GET    /api/auth/profile         # Get current user profile (Protected)
PUT    /api/auth/profile         # Update profile (Protected)
PUT    /api/auth/change-password # Change password (Protected)
```

### Users (`/api/users`) - Admin/Librarian Only
```javascript
GET    /api/users               # Get all users (with pagination)
GET    /api/users/:id           # Get user by ID
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
GET    /api/users/:id/stats     # Get user statistics
```

### Books (`/api/books`)
```javascript
GET    /api/books               # Get all books (with search/filter)
GET    /api/books/:id           # Get book by ID
POST   /api/books               # Create book (Librarian/Admin)
PUT    /api/books/:id           # Update book (Librarian/Admin)
DELETE /api/books/:id           # Delete book (Admin)
GET    /api/books/popular       # Get popular books
GET    /api/books/recent        # Get recently added books
GET    /api/books/search        # Advanced search
```

### Borrowing (`/api/borrow`)
```javascript
GET    /api/borrow              # Get all borrow records (Admin/Librarian)
GET    /api/borrow/user/:userId # Get user's borrow history
POST   /api/borrow              # Borrow a book
PUT    /api/borrow/:id/return   # Return a book
GET    /api/borrow/overdue      # Get overdue books (Admin/Librarian)
GET    /api/borrow/stats        # Get borrowing statistics
```

### Bookmarks (`/api/bookmarks`)
```javascript
GET    /api/bookmarks           # Get user's bookmarks
POST   /api/bookmarks           # Add bookmark
DELETE /api/bookmarks/:id       # Remove bookmark
```

### Media (`/api/media`)
```javascript
GET    /api/media               # Get all media (with filters)
GET    /api/media/:id           # Get media by ID
POST   /api/media               # Create media (Librarian/Admin)
PUT    /api/media/:id           # Update media (Librarian/Admin)
DELETE /api/media/:id           # Delete media (Admin)
POST   /api/media/:id/access    # Log digital media access
GET    /api/media/ebooks        # Get all ebooks
GET    /api/media/ncert         # Get NCERT textbooks
```

### Reservations (`/api/reservations`) - Optional
```javascript
GET    /api/reservations        # Get all reservations
POST   /api/reservations        # Create reservation
PUT    /api/reservations/:id    # Update reservation status
DELETE /api/reservations/:id    # Cancel reservation
```

### Analytics (`/api/analytics`) - Admin/Librarian
```javascript
GET    /api/analytics/dashboard # Dashboard statistics
GET    /api/analytics/books     # Book analytics
GET    /api/analytics/users     # User analytics
GET    /api/analytics/media     # Media analytics
```

---

## 5. DATA MODELS

### User Model
```javascript
{
  id: Integer (Primary Key),
  first_name: String (50),
  last_name: String (50),
  email: String (255, Unique),
  password_hash: String (255),
  role: Enum ['student', 'teacher', 'librarian', 'admin'],
  phone: String (20, Optional),
  address: String (Optional),
  student_id: String (50, Unique, Optional),
  employee_id: String (50, Unique, Optional),
  grade_level: String (20, Optional),
  department: String (100, Optional),
  is_active: Boolean (Default: true),
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Book Model
```javascript
{
  id: Integer (Primary Key),
  title: String (255),
  author: String (255),
  isbn: String (20, Unique, Optional),
  publisher: String (255, Optional),
  publication_year: Integer (Optional),
  genre: String (100, Optional),
  description: Text (Optional),
  total_copies: Integer (Default: 1, >= 0),
  available_copies: Integer (Default: 1, >= 0),
  location: String (100, Optional),
  language: String (50, Default: 'English'),
  is_active: Boolean (Default: true),
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Borrow Record Model
```javascript
{
  id: Integer (Primary Key),
  user_id: Integer (Foreign Key -> users.id),
  book_id: Integer (Foreign Key -> books.id),
  borrow_date: Timestamp (Default: now),
  due_date: Timestamp,
  return_date: Timestamp (Optional),
  status: Enum ['borrowed', 'returned', 'overdue', 'lost'],
  condition_notes: Text (Optional),
  fine_amount: Decimal (10,2, Default: 0.00),
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Media Model
```javascript
{
  id: Integer (Primary Key),
  title: String (255),
  type: Enum ['dvd', 'cd', 'digital', 'audiobook', 'ebook'],
  format: String (50, Optional),
  duration: Integer (minutes, Optional),
  file_size: BigInt (bytes, Optional),
  description: Text (Optional),
  total_copies: Integer (Default: 1),
  available_copies: Integer (Default: 1),
  location: String (100, Optional),
  access_url: String (URL for digital access, Optional),
  is_active: Boolean (Default: true),
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Bookmark Model
```javascript
{
  id: Integer (Primary Key),
  user_id: Integer (Foreign Key -> users.id),
  book_id: Integer (Foreign Key -> books.id),
  notes: Text (Optional),
  created_at: Timestamp,
  updated_at: Timestamp,
  UNIQUE(user_id, book_id)
}
```

---

## 6. ENVIRONMENT VARIABLES

Create `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_library
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOADS_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 7. INTEGRATION STEPS

### Step 1: Copy Required Files
Copy these directories/files to your target project:

```bash
# Core application files
src/
  ├── config/database.js
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  ├── migrations/
  └── utils/logger.js

# Database files
database/
  ├── schema.sql
  └── sample_data.sql

# Configuration files
.env.example
package.json (merge dependencies)
```

### Step 2: Install Dependencies
```bash
npm install bcryptjs cors dotenv express express-rate-limit helmet joi jsonwebtoken multer pg winston
```

### Step 3: Database Setup
```bash
# Create database
createdb school_library

# Run schema
psql -d school_library -f database/schema.sql

# Optional: Load sample data including NCERT ebooks
psql -d school_library -f database/sample_data.sql

# Or run migration
node src/migrations/006_add_ncert_ebooks.js
```

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

### Step 5: Integrate Routes in Main App

```javascript
// In your main app.js or server.js
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const borrowRoutes = require('./src/routes/borrowRoutes');
const bookmarkRoutes = require('./src/routes/bookmarkRoutes');
const mediaRoutes = require('./src/routes/mediaRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/media', mediaRoutes);
```

### Step 6: Add Middleware
```javascript
// Security and parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Error handling (must be last)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);
```

### Step 7: Test the Integration
```bash
# Start the server
npm start

# Test endpoints
curl http://localhost:3000/api/books
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"password"}'
```

---

## 8. AUTHENTICATION & AUTHORIZATION

### JWT Token Structure
```javascript
{
  userId: user.id,
  email: user.email,
  role: user.role,
  iat: issuedAt,
  exp: expiresAt
}
```

### Role Hierarchy
1. **Student**: Browse, borrow, bookmark, view own records
2. **Teacher**: Same as student + access to educational resources
3. **Librarian**: Manage books, media, view all records, process returns
4. **Admin**: Full access to all features

### Protected Route Example
```javascript
const { authenticateToken, authorize } = require('./middleware/auth');

// Only authenticated users
router.get('/profile', authenticateToken, getProfile);

// Only admin and librarian
router.post('/books', authenticateToken, authorize(['admin', 'librarian']), createBook);

// Only admin
router.delete('/users/:id', authenticateToken, authorize(['admin']), deleteUser);
```

---

## 9. SPECIAL FEATURES

### 1. NCERT Ebooks Integration
- 16 pre-loaded NCERT textbooks for Class 9-12
- Subjects: Math, Science, Physics, Chemistry, Biology, Computer Science, English, Hindi, History, Economics, Political Science
- Linked to official NCERT resources
- Accessible via `/api/media?type=ebook&title=NCERT`

### 2. Digital Media Access Tracking
- Logs every access to digital resources
- Tracks IP address and user agent
- Analytics on popular digital content

### 3. Automatic Overdue Detection
- Background job to mark overdue books
- Fine calculation based on days overdue
- Notification system (can be extended)

### 4. Search & Filter
- Full-text search on books and media
- Filter by genre, author, type, availability
- Pagination support

### 5. Analytics Dashboard
- Total books, users, active borrows
- Most popular books
- User engagement metrics
- Borrowing trends

---

## 10. SAMPLE API REQUESTS

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@student.edu",
  "password": "securePassword123",
  "role": "student",
  "student_id": "STU001",
  "grade_level": "10th Grade"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@school.edu",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@school.edu",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

### Get Books with Search
```bash
GET /api/books?search=harry&genre=Fantasy&page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 8,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "isbn": "978-0-7475-3269-9",
      "genre": "Fantasy",
      "available_copies": 7,
      "total_copies": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Borrow Book
```bash
POST /api/borrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": 8,
  "due_date": "2026-02-05"
}

Response:
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "id": 15,
    "user_id": 4,
    "book_id": 8,
    "borrow_date": "2026-01-22T00:00:00Z",
    "due_date": "2026-02-05T00:00:00Z",
    "status": "borrowed"
  }
}
```

### Get NCERT Ebooks
```bash
GET /api/media?type=ebook&search=NCERT
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 9,
      "title": "NCERT Mathematics Class 10",
      "type": "ebook",
      "format": "PDF",
      "access_url": "https://ncert.nic.in/textbook.php?jemh1=0-8",
      "description": "NCERT Mathematics textbook for Class 10..."
    },
    // ... more ebooks
  ],
  "total": 16
}
```

---

## 11. DATABASE CONNECTION CONFIGURATION

### database.js
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'school_library',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = { pool, query: (text, params) => pool.query(text, params) };
```

---

## 12. TESTING

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","password":"test123","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"password"}'
```

### Default Test Credentials
```
Admin: admin@school.edu / password
Librarian: librarian@school.edu / password
Student: alice@student.school.edu / password
```

---

## 13. MIGRATION NOTES

### Running Migrations
```bash
# Run NCERT ebooks migration
node src/migrations/006_add_ncert_ebooks.js

# This migration:
# - Creates media table if not exists
# - Adds 16 NCERT ebooks
# - Links to official NCERT resources
# - Is idempotent (safe to run multiple times)
```

---

## 14. SECURITY CONSIDERATIONS

1. **Password Storage**: bcrypt with 12 salt rounds
2. **JWT Tokens**: 7-day expiration, signed with secret key
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Helmet**: Security headers enabled
5. **CORS**: Whitelist allowed origins
6. **SQL Injection**: Parameterized queries via pg library
7. **Input Validation**: Joi schema validation on all inputs
8. **File Upload**: Size limits, type validation via multer

---

## 15. DEPLOYMENT CHECKLIST

- [ ] Set strong JWT_SECRET in production
- [ ] Configure database credentials
- [ ] Set NODE_ENV=production
- [ ] Enable SSL for database connections
- [ ] Configure CORS for production domain
- [ ] Set up logging to file/external service
- [ ] Configure file upload limits
- [ ] Set up database backups
- [ ] Run migrations
- [ ] Test all API endpoints
- [ ] Set up monitoring/alerting

---

## 16. SUPPORT & MAINTENANCE

### Common Issues

**Database connection failed**
- Check DB credentials in .env
- Ensure PostgreSQL is running
- Verify database exists

**JWT token invalid**
- Check JWT_SECRET matches
- Token may have expired (7 days)
- Re-login to get new token

**File upload fails**
- Check uploads/ directory exists
- Verify write permissions
- Check MAX_FILE_SIZE limit

---

## 17. FUTURE ENHANCEMENTS

- Email notifications for overdue books
- SMS notifications
- QR code scanning for books
- Mobile app integration
- Advanced analytics dashboard
- Integration with school ERP
- Multi-library support
- E-book reader integration
- Digital library expansion
- AI-based book recommendations

---

## Contact & Support

For integration support or questions, refer to:
- GitHub Repository: [Your Repo URL]
- Documentation: README.md
- API Documentation: docs/API.md

---

**Last Updated**: January 22, 2026
**Version**: 1.0.0
