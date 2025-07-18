const express = require('express');
const router = express.Router();
const MeController = require('../app/controllers/MeController');

router.get('/courses', MeController.course);
router.get('/news', MeController.news);


module.exports = router;
