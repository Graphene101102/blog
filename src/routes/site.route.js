const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');
const { requireAuth } = require('../app/middlewares/authMiddleware');

router.get('/search', siteController.search);
router.get('/', requireAuth, siteController.home);

module.exports = router;