const express = require('express');
const AuthController = require('../app/controllers/AuthController');
const { redirectIfAuthenticated, requireAuth } = require('../app/middlewares/authMiddleware');
const router = express.Router();

router.get('/login', redirectIfAuthenticated, AuthController.login);
router.get('/register', redirectIfAuthenticated, AuthController.register);
router.get('/profile', requireAuth, AuthController.profile);
router.post('/login', AuthController.loggedin);
router.post('/register', AuthController.create);
router.get('/logout', AuthController.logout);

module.exports = router;
