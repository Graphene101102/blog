const User = require('../models/User');

// Middleware kiểm tra xác thực
function requireAuth(req, res, next) {
    if (req.session && (req.session.user || req.session.userId)) {
        return next();
    }
    return res.redirect('/auth/login');
}

// Middleware kiểm tra xem user đã đăng nhập chưa (để hiển thị thông tin)
async function checkAuth(req, res, next) {
    try {
        // Debug logging
        console.log('Session data:', {
            sessionID: req.sessionID,
            user: req.session.user,
            userId: req.session.userId,
            userEmail: req.session.userEmail,
            userRole: req.session.userRole
        });

        if (req.session && (req.session.user || req.session.userId)) {
            res.locals.isAuthenticated = true;

            // Ưu tiên object user đầy đủ nếu đã được lưu trong session
            if (req.session.user) {
                res.locals.user = req.session.user;
            } else {
                // Tương thích ngược nếu chỉ lưu các field rời
                res.locals.user = {
                    id: req.session.userId,
                    email: req.session.userEmail,
                    role: req.session.userRole
                };
            }

            console.log('User authenticated:', {
                isAuthenticated: res.locals.isAuthenticated,
                user: res.locals.user
            });
        } else {
            res.locals.isAuthenticated = false;
            res.locals.user = null;
            console.log('User not authenticated');
        }
    } catch (error) {
        console.error('Error in checkAuth middleware:', error);
        res.locals.isAuthenticated = false;
        res.locals.user = null;
    }
    next();
}

// Middleware chuyển hướng nếu đã đăng nhập (cho trang login/register)
function redirectIfAuthenticated(req, res, next) {
    if (req.session && (req.session.user || req.session.userId)) {
        return res.redirect('/');
    }
    return next();
}

module.exports = {
    requireAuth,
    checkAuth,
    redirectIfAuthenticated
}; 