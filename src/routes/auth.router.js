const express = require('express');
const AuthController = require('../app/controllers/AuthController');
const { redirectIfAuthenticated, requireAuth } = require('../app/middlewares/authMiddleware');
const { uploadAvatar, handleUploadError } = require('../app/middlewares/uploadMiddleware');
const router = express.Router();

router.get('/login', redirectIfAuthenticated, AuthController.login);
router.get('/register', redirectIfAuthenticated, AuthController.register);
router.get('/profile/:userId', requireAuth, AuthController.profile);
router.get('/settings', requireAuth, AuthController.settings);
router.post('/login', AuthController.loggedin);
router.post('/register', AuthController.create);
router.post('/settings/update-profile', requireAuth, AuthController.updateProfile);
router.post('/settings/update-avatar', requireAuth, uploadAvatar, handleUploadError, AuthController.updateAvatar);
router.post('/settings/change-password', requireAuth, AuthController.changePassword);
router.get('/logout', AuthController.logout);

module.exports = router;
