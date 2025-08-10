// Middleware kiểm tra xác thực
function requireAuth(req, res, next) {
    // Kiểm tra xem user có đăng nhập không
    if (req.session && req.session.userId) {
        // User đã đăng nhập, cho phép truy cập
        next();
    } else {
        // User chưa đăng nhập, chuyển hướng đến trang login
        res.redirect('/auth/login');
    }
}

// Middleware kiểm tra xem user đã đăng nhập chưa (để hiển thị thông tin)
function checkAuth(req, res, next) {
    // Kiểm tra xem user có đăng nhập không
    if (req.session && req.session.userId) {
        // User đã đăng nhập, thêm thông tin user vào res.locals
        res.locals.isAuthenticated = true;
        res.locals.user = {
            id: req.session.userId,
            email: req.session.userEmail,
            role: req.session.userRole
        };
    } else {
        // User chưa đăng nhập
        res.locals.isAuthenticated = false;
        res.locals.user = null;
    }
    next();
}

// Middleware chuyển hướng nếu đã đăng nhập (cho trang login/register)
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User đã đăng nhập, chuyển hướng về trang chủ
        res.redirect('/');
    } else {
        // User chưa đăng nhập, cho phép truy cập
        next();
    }
}

module.exports = {
    requireAuth,
    checkAuth,
    redirectIfAuthenticated
}; 