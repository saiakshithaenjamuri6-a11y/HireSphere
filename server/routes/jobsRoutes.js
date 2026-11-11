const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { validateJob } = require('../middleware/validator');

// Jobs CRUD routes
router.get('/', jobsController.getAllJobs);
router.get('/:id', jobsController.getJobById);
router.post('/', validateJob, jobsController.createJob);
router.put('/:id', validateJob, jobsController.updateJob);
router.delete('/:id', jobsController.deleteJob);

module.exports = router;
