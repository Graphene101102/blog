// Middleware kiểm tra xác thực
function requireAuth(req, res, next) {
    if (req.session && (req.session.user || req.session.userId)) {
        return next();
    }
    return res.redirect('/auth/login');
}

// Middleware kiểm tra xem user đã đăng nhập chưa (để hiển thị thông tin)
function checkAuth(req, res, next) {
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
    } else {
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