const express = require('express');
const CourseController = require('../app/controllers/CourseController');
const router = express.Router();

router.get('/create', CourseController.create);
router.post('/store', CourseController.store);
router.post('/handle-action-form', CourseController.handleFormAction)
router.post('/handle-action-trash-form', CourseController.handleFormActionTrash)
router.get('/:id/edit', CourseController.edit);
router.put('/:id', CourseController.update);
router.patch('/:id/restore', CourseController.restore)
router.delete('/:id/force', CourseController.destroy);
router.delete('/:id', CourseController.delete);
router.get('/:slug', CourseController.detail);


module.exports = router;
