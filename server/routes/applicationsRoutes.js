const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { validateApplication, validateApplicationStatus } = require('../middleware/validator');

// Applications CRUD routes
router.get('/', applicationsController.getAllApplications);
router.get('/:id', applicationsController.getApplicationById);
router.post('/', validateApplication, applicationsController.createApplication);
router.put('/:id', validateApplication, applicationsController.updateApplication);
router.patch('/:id/status', validateApplicationStatus, applicationsController.updateApplicationStatus);
router.delete('/:id', applicationsController.deleteApplication);

module.exports = router;
