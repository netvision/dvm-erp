const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('student', 'teacher', 'librarian', 'admin').default('student'),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    address: Joi.string().max(255).optional(),
    student_id: Joi.string().when('role', { is: 'student', then: Joi.required() }),
    employee_id: Joi.string().when('role', { is: Joi.valid('teacher', 'librarian', 'admin'), then: Joi.required() }),
    grade_level: Joi.string().when('role', { is: 'student', then: Joi.optional() }),
    department: Joi.string().when('role', { is: Joi.valid('teacher', 'librarian', 'admin'), then: Joi.optional() })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  update: Joi.object({
    first_name: Joi.string().min(2).max(50),
    last_name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/),
    address: Joi.string().max(255),
    grade_level: Joi.string(),
    department: Joi.string()
  })
};

// Book validation schemas
const bookSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    author: Joi.string().min(1).max(255).required(),
    isbn: Joi.string().pattern(/^[0-9\-X]+$/).optional(),
    publisher: Joi.string().max(255).optional(),
    publication_year: Joi.number().integer().min(1000).max(new Date().getFullYear()),
    genre: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    total_copies: Joi.number().integer().min(0).required(),
    available_copies: Joi.number().integer().min(0),
    location: Joi.string().max(100).optional(),
    language: Joi.string().max(50).default('English')
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255),
    author: Joi.string().min(1).max(255),
    isbn: Joi.string().pattern(/^[0-9\-X]+$/),
    publisher: Joi.string().max(255),
    publication_year: Joi.number().integer().min(1000).max(new Date().getFullYear()),
    genre: Joi.string().max(100),
    description: Joi.string(),
    total_copies: Joi.number().integer().min(0),
    available_copies: Joi.number().integer().min(0),
    location: Joi.string().max(100),
    language: Joi.string().max(50)
  })
};

// Borrow validation schemas
const borrowSchemas = {
  borrow: Joi.object({
    book_id: Joi.number().integer().positive().required(),
    due_date: Joi.date().min('now').optional()
  }),

  return: Joi.object({
    condition_notes: Joi.string().optional()
  })
};

// Bookmark validation schemas
const bookmarkSchemas = {
  create: Joi.object({
    book_id: Joi.number().integer().positive().required(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    notes: Joi.string().optional()
  })
};

// Media validation schemas
const mediaSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    type: Joi.string().valid('dvd', 'cd', 'digital', 'audiobook', 'ebook').required(),
    format: Joi.string().max(50).optional(),
    duration: Joi.number().integer().min(0).optional(),
    file_size: Joi.number().integer().min(0).optional(),
    description: Joi.string().optional(),
    total_copies: Joi.number().integer().min(0).required(),
    available_copies: Joi.number().integer().min(0),
    location: Joi.string().max(100).optional(),
    access_url: Joi.string().uri().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255),
    type: Joi.string().valid('dvd', 'cd', 'digital', 'audiobook', 'ebook'),
    format: Joi.string().max(50),
    duration: Joi.number().integer().min(0),
    file_size: Joi.number().integer().min(0),
    description: Joi.string(),
    total_copies: Joi.number().integer().min(0),
    available_copies: Joi.number().integer().min(0),
    location: Joi.string().max(100),
    access_url: Joi.string().uri()
  })
};

module.exports = {
  validate,
  userSchemas,
  bookSchemas,
  borrowSchemas,
  bookmarkSchemas,
  mediaSchemas
};