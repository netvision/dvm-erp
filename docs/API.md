# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "status": "success" | "error",
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## Error Codes
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@school.edu",
  "password": "securePassword123",
  "role": "student",
  "phone": "+1234567890",
  "address": "123 Main St",
  "student_id": "STU001",
  "grade_level": "10th Grade"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@school.edu",
  "password": "securePassword123"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

## Books Endpoints

### Get All Books
```http
GET /books?page=1&limit=10&search=javascript&genre=programming&available_only=true
```

### Get Book by ID
```http
GET /books/:id
Authorization: Bearer <token>
```

### Create Book (Librarian/Admin)
```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "JavaScript: The Good Parts",
  "author": "Douglas Crockford",
  "isbn": "978-0596517748",
  "publisher": "O'Reilly Media",
  "publication_year": 2008,
  "genre": "Programming",
  "description": "A comprehensive guide to JavaScript",
  "total_copies": 5,
  "location": "A1-001"
}
```

### Update Book (Librarian/Admin)
```http
PUT /books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "total_copies": 10
}
```

## Borrowing Endpoints

### Borrow Book
```http
POST /borrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": 1,
  "due_date": "2024-01-15"
}
```

### Get Current Borrows
```http
GET /borrow/current
Authorization: Bearer <token>
```

### Return Book
```http
PUT /borrow/return/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "condition_notes": "Book returned in good condition"
}
```

### Renew Book
```http
PUT /borrow/renew/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "additional_days": 14
}
```

## User Management Endpoints (Admin/Librarian)

### Get All Users
```http
GET /users?page=1&limit=10&role=student&is_active=true&search=john
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_active": false
}
```

### Deactivate User
```http
PUT /users/:id/deactivate
Authorization: Bearer <token>
```

## Bookmark Endpoints

### Create Bookmark
```http
POST /bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": 1,
  "notes": "Want to read this book"
}
```

### Get My Bookmarks
```http
GET /bookmarks/my?page=1&limit=10
Authorization: Bearer <token>
```

### Toggle Bookmark
```http
POST /bookmarks/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": 1
}
```

## Media Endpoints

### Get All Media
```http
GET /media?type=dvd&format=blu-ray&available_only=true
```

### Get Media by Type
```http
GET /media/type/ebook
```

### Access Digital Media
```http
POST /media/:id/access
Authorization: Bearer <token>
```

### Create Media (Librarian/Admin)
```http
POST /media
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learning Python",
  "type": "ebook",
  "format": "PDF",
  "description": "Comprehensive Python tutorial",
  "total_copies": 1,
  "access_url": "https://library.school.edu/ebooks/python"
}
```

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
- `search` - Search text
- `role` - User role filter
- `status` - Record status filter
- `type` - Media type filter
- `available_only` - Show only available items
- `overdue_only` - Show only overdue records

### Sorting
- `sort_by` - Field to sort by
- `sort_order` - ASC or DESC (default: ASC)

## Sample Responses

### Successful Authentication
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@school.edu",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Books List
```json
{
  "status": "success",
  "data": {
    "books": [
      {
        "id": 1,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "isbn": "978-0-06-112008-4",
        "total_copies": 5,
        "available_copies": 3,
        "location": "A1-001"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 150,
      "total_pages": 15
    }
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Book not found"
}
```

### Validation Error
```json
{
  "status": "error",
  "message": "\"email\" must be a valid email"
}
```

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP

## Status Codes

### Success Codes
- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)

### Client Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit)

### Server Error Codes
- `500` - Internal Server Error
- `503` - Service Unavailable

## Postman Collection

A Postman collection with all endpoints is available at:
```
/docs/postman_collection.json
```

Import this collection into Postman for easy API testing.