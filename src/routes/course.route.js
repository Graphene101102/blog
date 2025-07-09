const express = require('express');
const CourseCotroller = require('../app/controllers/CourseCotroller');
const router = express.Router();

// router.get('/create', CourseCotroller.create);
router.get('/:slug', CourseCotroller.detail);


module.exports = router;
