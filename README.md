# School Library Management System Backend

A comprehensive Node.js + Express backend API for managing a school library system with PostgreSQL database, JWT authentication, and bcrypt password hashing.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Teacher, Librarian, Admin)
- bcrypt password hashing
- Secure user registration and login

### 📚 Book Management
- Complete CRUD operations for books
- Advanced search and filtering
- ISBN validation
- Availability tracking
- Popular and recently added books
- Book borrowing statistics

### 👥 User Management
- User registration and profile management
- Role-based permissions
- User statistics and reporting
- Borrow history tracking

### 📖 Borrowing System
- Book borrowing and returning
- Due date management
- Overdue tracking with fines
- Renewal functionality
- Borrowing statistics and reports

### 🔖 Bookmark System
- Save favorite books
- Personal reading lists
- Bookmark statistics
- Popular bookmarked books

### 🎵 Media Management
- Support for DVDs, CDs, digital content
- Digital media access tracking
- Media borrowing for physical items
- Access statistics for digital content

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── bookController.js
│   ├── userController.js
│   ├── borrowController.js
│   ├── bookmarkController.js
│   └── mediaController.js
├── routes/              # API route definitions
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── userRoutes.js
│   ├── borrowRoutes.js
│   ├── bookmarkRoutes.js
│   └── mediaRoutes.js
├── middleware/          # Custom middleware
│   ├── auth.js         # JWT authentication
│   ├── errorHandler.js # Global error handling
│   └── validation.js   # Request validation
├── models/             # Data models
│   ├── User.js
│   ├── Book.js
│   ├── BorrowRecord.js
│   ├── Bookmark.js
│   └── Media.js
├── config/             # Configuration
│   └── database.js     # Database connection
├── utils/              # Utilities
│   └── logger.js       # Winston logger
└── app.js              # Application entry point

database/
├── schema.sql          # Database schema
└── sample_data.sql     # Sample data for testing
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd school-library-backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database and run the schema:

```bash
# Create database
createdb school_library

# Run schema
psql -d school_library -f database/schema.sql

# Optional: Load sample data
psql -d school_library -f database/sample_data.sql
```

### 3. Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_library
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Authenticated |
| PUT | `/api/auth/profile` | Update profile | Authenticated |
| PUT | `/api/auth/change-password` | Change password | Authenticated |

### Book Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/books` | Get all books | Public |
| GET | `/api/books/:id` | Get book by ID | Authenticated |
| POST | `/api/books` | Create book | Librarian/Admin |
| PUT | `/api/books/:id` | Update book | Librarian/Admin |
| DELETE | `/api/books/:id` | Delete book | Librarian/Admin |

### Borrowing Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/borrow` | Borrow a book | Authenticated |
| GET | `/api/borrow/current` | Get current borrows | Authenticated |
| PUT | `/api/borrow/return/:id` | Return a book | Authenticated |
| PUT | `/api/borrow/renew/:id` | Renew a book | Authenticated |

### User Management (Admin/Librarian)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin/Librarian |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin/Librarian |
| PUT | `/api/users/:id/deactivate` | Deactivate user | Admin/Librarian |

## User Roles & Permissions

### Student
- Browse and search books/media
- Borrow and return items
- Manage bookmarks
- View own borrow history

### Teacher
- All student permissions
- Extended borrowing limits
- Access to educational resources

### Librarian
- All user permissions
- Manage books and media
- View all borrow records
- Generate reports
- Manage user accounts (limited)

### Admin
- Full system access
- User management
- System configuration
- All administrative functions

## Database Schema

The system uses a PostgreSQL database with the following main tables:

- `users` - User accounts and profiles
- `books` - Book catalog
- `borrow_records` - Borrowing transactions
- `bookmarks` - User bookmarks
- `media` - Digital and physical media
- `media_borrow_records` - Media borrowing
- `media_access_logs` - Digital media access tracking

## Security Features

- **JWT Authentication** - Stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Joi schema validation
- **CORS Protection** - Configurable CORS policies
- **Security Headers** - Helmet.js integration

## Development

### Running Tests

```bash
npm test
```

### Code Style

The project follows standard JavaScript conventions. Use the provided ESLint configuration.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## Sample API Usage

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@student.school.edu",
    "password": "securePassword123",
    "role": "student",
    "student_id": "STU001",
    "grade_level": "10th Grade"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@student.school.edu",
    "password": "securePassword123"
  }'
```

### Borrow a book
```bash
curl -X POST http://localhost:3000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "book_id": 1,
    "due_date": "2024-01-15"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `school_library` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `FINE_PER_DAY` | Daily fine amount | `0.50` |

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set
   - Check token expiration
   - Verify authorization header format

3. **Permission Denied**
   - Check user role permissions
   - Verify JWT token is valid
   - Ensure user is active

### Logs

Application logs are available in:
- Console output (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## License

This project is licensed under the ISC License.

## Support

For support or questions, please contact the development team or create an issue in the repository.