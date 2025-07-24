const express = require('express');
const CourseController = require('../app/controllers/CourseController');
const router = express.Router();

router.get('/create', CourseController.create);
router.post('/store', CourseController.store);
router.get('/:id/edit', CourseController.edit);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.delete);
router.get('/:slug', CourseController.detail);


module.exports = router;
