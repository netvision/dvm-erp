<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# School Library Management System

This is a Node.js + Express backend for a school library management system with PostgreSQL database.

## Project Structure
- **Models**: User, Book, BorrowRecord, Bookmark, Media
- **Authentication**: JWT tokens with bcrypt password hashing
- **Architecture**: Controllers, Routes, Middleware separation
- **Database**: PostgreSQL with connection pooling

## Development Guidelines
- Use async/await for database operations
- Implement proper error handling and validation
- Follow RESTful API conventions
- Use middleware for authentication and authorization
- Implement proper logging and security practices