const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET /api/settings/status
router.get('/status', settingsController.getSettingsStatus);

module.exports = router;
