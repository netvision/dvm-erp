const express = require('express');
const ResourceController = require('../controllers/resourceController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Books routes
router.get('/books', requireRole(['admin', 'librarian']), ResourceController.getBooks);

// Digital resources routes  
router.get('/digital', requireRole(['admin', 'librarian']), ResourceController.getDigitalResources);

// Media resources routes
router.get('/media', requireRole(['admin', 'librarian']), ResourceController.getMediaResources);

// Equipment routes
router.get('/equipment', requireRole(['admin', 'librarian']), ResourceController.getEquipment);

// General resource routes
router.post('/', requireRole(['admin', 'librarian']), ResourceController.createResource);
router.put('/:id', requireRole(['admin', 'librarian']), ResourceController.updateResource);
router.delete('/:id', requireRole(['admin', 'librarian']), ResourceController.deleteResource);

// Import routes
router.post('/import', requireRole(['admin']), ResourceController.importResources);

module.exports = router;