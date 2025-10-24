# 🏫 School Library Management System# School Library Management System Backend



A comprehensive digital library management system built with modern web technologies. This system provides separate management interfaces for books, digital resources, media, and equipment with a responsive design that works seamlessly across all devices.A comprehensive Node.js + Express backend API for managing a school library system with PostgreSQL database, JWT authentication, and bcrypt password hashing.



## 🚀 Features## Features



### 📚 Resource Management### 🔐 Authentication & Authorization

- **Book Management**: Complete CRUD operations for physical books with ISBN tracking, genre categorization, and inventory management- JWT-based authentication

- **Digital Library**: Manage e-books, PDFs, and online resources with external links and access controls- Role-based access control (Student, Teacher, Librarian, Admin)

- **Media Library**: Handle DVDs, audiobooks, educational videos with detailed metadata- bcrypt password hashing

- **Equipment Management**: Track projectors, laptops, tablets with check-out/in functionality and condition monitoring- Secure user registration and login



### 👥 User Management### 📚 Book Management

- **Role-based Authentication**: Admin, Librarian, and Student roles with JWT-based security- Complete CRUD operations for books

- **Profile Management**: Users can update personal information and change passwords- Advanced search and filtering

- **User Analytics**: Track user activity, borrowing patterns, and engagement metrics- ISBN validation

- Availability tracking

### 📊 Analytics & Reporting- Popular and recently added books

- **Real-time Dashboard**: Live statistics on borrowing, returns, popular items, and user activity- Book borrowing statistics

- **Interactive Charts**: Visual representations of library usage patterns

- **Export Functionality**: Generate reports in multiple formats### 👥 User Management

- User registration and profile management

### 🎨 Modern UI/UX- Role-based permissions

- **Responsive Design**: Mobile-first approach with seamless tablet and desktop experiences- User statistics and reporting

- **Dark/Light Mode**: User preference-based theming- Borrow history tracking

- **Intuitive Navigation**: Clean, modern interface with easy-to-use controls

- **Real-time Notifications**: Instant feedback for user actions### 📖 Borrowing System

- Book borrowing and returning

## 🛠️ Technology Stack- Due date management

- Overdue tracking with fines

### Frontend- Renewal functionality

- **Vue.js 3** with Composition API- Borrowing statistics and reports

- **TypeScript** for type safety

- **Tailwind CSS** for styling### 🔖 Bookmark System

- **Pinia** for state management- Save favorite books

- **Vue Router** for navigation- Personal reading lists

- **Axios** for API communication- Bookmark statistics

- **Vite** for build tooling- Popular bookmarked books



### Backend### 🎵 Media Management

- **Node.js** with Express.js- Support for DVDs, CDs, digital content

- **PostgreSQL** database- Digital media access tracking

- **JWT** authentication- Media borrowing for physical items

- **bcrypt** for password hashing- Access statistics for digital content

- **Winston** for logging

- **CORS** enabled## Tech Stack

- **Helmet** for security

- **Runtime**: Node.js

## 📦 Installation- **Framework**: Express.js

- **Database**: PostgreSQL

### Prerequisites- **Authentication**: JWT + bcrypt

- Node.js (v16 or higher)- **Validation**: Joi

- PostgreSQL (v12 or higher)- **Logging**: Winston

- npm or yarn- **Security**: Helmet, CORS, Rate Limiting



### 1. Clone the Repository## Project Structure

```bash

git clone https://github.com/yourusername/school-library-management.git```

cd school-library-managementsrc/

```├── controllers/          # Request handlers

│   ├── authController.js

### 2. Backend Setup│   ├── bookController.js

```bash│   ├── userController.js

# Install backend dependencies│   ├── borrowController.js

npm install│   ├── bookmarkController.js

│   └── mediaController.js

# Set up environment variables├── routes/              # API route definitions

cp .env.example .env│   ├── authRoutes.js

# Edit .env with your database credentials│   ├── bookRoutes.js

│   ├── userRoutes.js

# Set up PostgreSQL database│   ├── borrowRoutes.js

psql -U postgres│   ├── bookmarkRoutes.js

CREATE DATABASE dvm_erp;│   └── mediaRoutes.js

\q├── middleware/          # Custom middleware

│   ├── auth.js         # JWT authentication

# Run database migrations│   ├── errorHandler.js # Global error handling

node setup_database.js│   └── validation.js   # Request validation

├── models/             # Data models

# Start the backend server│   ├── User.js

npm run dev│   ├── Book.js

```│   ├── BorrowRecord.js

│   ├── Bookmark.js

### 3. Frontend Setup│   └── Media.js

```bash├── config/             # Configuration

# Navigate to frontend directory│   └── database.js     # Database connection

cd frontend├── utils/              # Utilities

│   └── logger.js       # Winston logger

# Install frontend dependencies└── app.js              # Application entry point

npm install

database/

# Start the development server├── schema.sql          # Database schema

npm run dev└── sample_data.sql     # Sample data for testing

``````



### 4. Access the Application## Quick Start

- Frontend: http://localhost:5173

- Backend API: http://localhost:3000### Prerequisites

- Database: PostgreSQL on default port 5432

- Node.js (v16 or higher)

## 🔧 Configuration- PostgreSQL (v12 or higher)

- npm or yarn

### Environment Variables

Create a `.env` file in the root directory:### 1. Clone and Install



```env```bash

# Database Configurationgit clone <repository-url>

DB_HOST=localhostcd school-library-backend

DB_PORT=5432npm install

DB_NAME=dvm_erp```

DB_USER=postgres

DB_PASSWORD=your_password### 2. Database Setup



# JWT ConfigurationCreate a PostgreSQL database and run the schema:

JWT_SECRET=your_jwt_secret_key

JWT_EXPIRES_IN=7d```bash

# Create database

# Server Configurationcreatedb school_library

PORT=3000

NODE_ENV=development# Run schema

psql -d school_library -f database/schema.sql

# CORS Configuration

FRONTEND_URL=http://localhost:5173# Optional: Load sample data

```psql -d school_library -f database/sample_data.sql

```

## 🎯 Usage

### 3. Environment Configuration

### Admin Features

1. **Dashboard**: Overview of library statistics and recent activitiesCreate a `.env` file from the example:

2. **Resource Management**: Add, edit, delete books, digital resources, media, and equipment

3. **User Management**: Manage user accounts, roles, and permissions```bash

4. **Analytics**: View detailed reports and usage patternscp .env.example .env

```

### Student Features

1. **Browse Catalog**: Search and filter available resourcesUpdate the `.env` file with your database credentials:

2. **Borrowing**: Request and manage borrowed items

3. **Digital Access**: Access digital resources and online materials```env

4. **Profile Management**: Update personal information and preferencesNODE_ENV=development

PORT=3000

## 🔐 Security Features

DB_HOST=localhost

- **JWT Authentication**: Secure token-based authenticationDB_PORT=5432

- **Password Hashing**: bcrypt with salt rounds for secure password storageDB_NAME=school_library

- **Role-based Access Control**: Different permission levels for different user typesDB_USER=postgres

- **Input Validation**: Comprehensive server-side validationDB_PASSWORD=your_password

- **SQL Injection Prevention**: Parameterized queries and ORM protection

JWT_SECRET=your-super-secret-jwt-key

## 📱 Mobile ResponsivenessJWT_EXPIRES_IN=24h

```

The application is fully responsive and provides an optimal experience on:

- **Mobile Phones**: Compact interface with touch-friendly controls### 4. Start the Server

- **Tablets**: Adapted layout for medium screens

- **Desktops**: Full-featured interface with advanced functionality```bash

# Development mode (with nodemon)

## 🚦 Development Statusnpm run dev



- ✅ **Complete**: Book Management, User Authentication, Profile Management# Production mode

- 🔄 **In Progress**: Digital Library and Media Management fine-tuningnpm start

- 📋 **Planned**: Advanced reporting, notification system```



## 📝 API DocumentationThe server will start on `http://localhost:3000`



The API is RESTful and includes endpoints for:## API Documentation

- Authentication (`/api/auth/*`)

- Books (`/api/books/*`)### Authentication Endpoints

- Digital Resources (`/api/library/digital-resources/*`)

- Media Resources (`/api/library/media-resources/*`)| Method | Endpoint | Description | Access |

- Equipment (`/api/library/equipment/*`)|--------|----------|-------------|--------|

- Users (`/api/users/*`)| POST | `/api/auth/register` | Register new user | Public |

- Analytics (`/api/library/analytics/*`)| POST | `/api/auth/login` | Login user | Public |

| GET | `/api/auth/profile` | Get user profile | Authenticated |

## 🤝 Contributing| PUT | `/api/auth/profile` | Update profile | Authenticated |

| PUT | `/api/auth/change-password` | Change password | Authenticated |

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)### Book Endpoints

3. Commit your changes (`git commit -m 'Add some amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)| Method | Endpoint | Description | Access |

5. Open a Pull Request|--------|----------|-------------|--------|

| GET | `/api/books` | Get all books | Public |

## 📄 License| GET | `/api/books/:id` | Get book by ID | Authenticated |

| POST | `/api/books` | Create book | Librarian/Admin |

This project is licensed under the MIT License.| PUT | `/api/books/:id` | Update book | Librarian/Admin |

| DELETE | `/api/books/:id` | Delete book | Librarian/Admin |

---

### Borrowing Endpoints

**Made with ❤️ for educational institutions worldwide**
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