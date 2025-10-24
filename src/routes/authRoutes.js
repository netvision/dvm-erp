const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(userSchemas.register), AuthController.register);
router.post('/login', validate(userSchemas.login), AuthController.login);

// Protected routes
router.use(authenticateToken);

router.get('/profile', AuthController.getProfile);
router.put('/profile', validate(userSchemas.update), AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);
router.post('/logout', AuthController.logout);
router.delete('/deactivate', AuthController.deactivateAccount);

module.exports = router;