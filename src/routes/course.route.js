const express = require('express');
const CourseController = require('../app/controllers/CourseController');
const router = express.Router();

router.get('/create', CourseController.create);
router.post('/store', CourseController.store);
router.get('/:slug', CourseController.detail);


module.exports = router;
