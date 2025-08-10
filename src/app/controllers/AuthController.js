const User = require('../models/User');

class AuthController {

    // [GET] /auth/login
    login(req, res, next) {
        res.render('auth/login');
    }

    //[POST] /auth/loggedin
    async loggedin(req, res, next) {
        try {
            const { email, password, remember } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ email và mật khẩu'
                });
            }

            // Tìm user theo email (bao gồm password để so sánh)
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                });
            }

            // So sánh mật khẩu
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                });
            }

            // Tạo session cho user
            req.session.userId = user._id;
            req.session.userRole = user.role;
            req.session.userEmail = user.email;

            // Nếu chọn "remember me", tăng thời gian session
            if (remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 ngày
            }

            // Chuyển hướng về trang chủ sau khi đăng nhập thành công
            res.redirect('/');

        } catch (error) {
            console.error('Login error:', error);

            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        }
    }

    // [GET] /auth/register
    register(req, res, next) {
        res.render('auth/register');
    }

    //[POST] /auth/create
    async create(req, res, next) {
        try {
            const { firstName, lastName, email, phone, password, confirmPassword, agreeTerms } = req.body;

            // Validation
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu xác nhận không khớp'
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu phải có ít nhất 8 ký tự'
                });
            }

            if (!agreeTerms) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn phải đồng ý với điều khoản sử dụng'
                });
            }

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email này đã được sử dụng'
                });
            }

            // Tạo user mới
            const newUser = new User({
                firstName,
                lastName,
                email,
                phone: phone || null,
                password,
                role: 'user',
                isEmailVerified: false
            });

            // Lưu user vào database
            const savedUser = await newUser.save();

            // Trả về response thành công (không bao gồm password)
            const userResponse = {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role,
                fullName: savedUser.fullName,
                createdAt: savedUser.createdAt
            };

            res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công!',
                data: userResponse
            });

        } catch (error) {
            console.error('Registration error:', error);

            // Xử lý lỗi validation của Mongoose
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: validationErrors
                });
            }

            // Xử lý lỗi duplicate key (email)
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Email này đã được sử dụng'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        }
    }

    //[GET] /auth/logout
    logout(req, res, next) {
        // Xóa session
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi đăng xuất'
                });
            }

            // Chuyển hướng về trang chủ
            res.redirect('/auth/login');
        });
    }
}

module.exports = new AuthController()