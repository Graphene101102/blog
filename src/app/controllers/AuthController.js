const User = require('../models/User');
const Course = require('../models/Course');
const { multipleMongooseToObject } = require('../../util/mongoose');

class AuthController {

    // [GET] /auth/login
    login(req, res, next) {
        res.render('auth/login');
    }

    // [GET] /auth/profile
    async profile(req, res, next) {
        try {
            const userId = req.params.userId;
            const userProfile = await User.findById(userId);
            if (!userProfile) {
                console.log('User profile not found:', userId);
                return res.status(404).send('Không tìm thấy người dùng');
            }

            const courses = await Course.find({ createdBy: userId }).sort({ updatedAt: -1 });
            
            console.log('Profile loaded successfully:', {
                userId: userId,
                coursesCount: courses.length
            });

            // Chuyển đổi Mongoose objects thành plain objects
            const plainUserProfile = userProfile.toObject();
            const plainCourses = courses.map(course => course.toObject());

            // Thiết lập isProfileOwner trong controller
            const currentUserId = (req.session.user && req.session.user.id) || req.session.userId;
            const isProfileOwner = userId === currentUserId;

            console.log('Profile ownership check:', {
                requestedUserId: userId,
                currentUserId: currentUserId,
                isProfileOwner: isProfileOwner
            });

            return res.render('auth/profile', {
                courses: plainCourses,
                userProfile: plainUserProfile,
                isAuthenticated: res.locals.isAuthenticated,
                isProfileOwner: isProfileOwner
            });
        } catch (error) {
            console.error('Profile error:', error);
            return res.status(500).send('Có lỗi xảy ra');
        }
    }

    //[POST] /auth/loggedin
    async loggedin(req, res, next) {
        try {
            const { email, password, remember } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ email và mật khẩu'
                });
            }

            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không chính xác'
                });
            }

            // Build lightweight user object to store in session
            const loggedInUser = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar || null,
            };

            // Store user info in session
            req.session.user = loggedInUser;
            // Backward-compatible individual fields
            req.session.userId = loggedInUser.id;
            req.session.userRole = loggedInUser.role;
            req.session.userEmail = loggedInUser.email;

            // Debug logging
            console.log('User logged in successfully:', {
                userId: loggedInUser.id,
                email: loggedInUser.email,
                sessionID: req.sessionID
            });

            if (remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 ngày
            }

            // Redirect after successful login
            return res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);

            return res.status(500).json({
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
            // Chuyển hướng về trang đăng nhập
            res.redirect('/auth/login');
        });
    }

    // [GET] /auth/settings
    async settings(req, res, next) {
        try {
            if (!req.session || !(req.session.user || req.session.userId)) {
                return res.redirect('/auth/login');
            }

            const userId = (req.session.user && req.session.user.id) || req.session.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.redirect('/auth/login');
            }

            // Lấy messages từ session và xóa đi
            const messages = req.session.messages || {};
            delete req.session.messages;

            return res.render('auth/settings', {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    bio: user.bio,
                    avatar: user.avatar,
                    role: user.role
                },
                messages: messages
            });
        } catch (error) {
            console.error('Settings error:', error);
            return res.status(500).send('Có lỗi xảy ra');
        }
    }

    // [POST] /auth/settings/update-profile
    async updateProfile(req, res, next) {
        try {
            if (!req.session || !(req.session.user || req.session.userId)) {
                return res.redirect('/auth/login');
            }

            const userId = (req.session.user && req.session.user.id) || req.session.userId;
            const updateData = {};

            // Chỉ cập nhật những trường được gửi lên và có giá trị
            if (req.body.firstName !== undefined) {
                const firstName = req.body.firstName.toString().trim();
                if (firstName === '') {
                    req.session.messages = { error: 'Họ và tên đệm không được để trống' };
                    return res.redirect("/auth/settings");
                }
                updateData.firstName = firstName;
            }

            if (req.body.lastName !== undefined) {
                const lastName = req.body.lastName.toString().trim();
                if (lastName === '') {
                    req.session.messages = { error: 'Tên không được để trống' };
                    return res.redirect("/auth/settings");
                }
                updateData.lastName = lastName;
            }

            if (req.body.phone !== undefined) {
                if (req.body.phone === null || req.body.phone === '') {
                    updateData.phone = null;
                } else {
                    updateData.phone = req.body.phone.toString().trim();
                }
            }

            if (req.body.bio !== undefined) {
                if (req.body.bio === null || req.body.bio === '') {
                    updateData.bio = null;
                } else {
                    updateData.bio = req.body.bio.toString().trim();
                }
            }

            // Kiểm tra xem có trường nào được cập nhật không
            if (Object.keys(updateData).length === 0) {
                req.session.messages = { error: 'Không có dữ liệu nào để cập nhật' };
                return res.redirect("/auth/settings");
            }

            console.log('Updating user with data:', updateData); // Debug log

            // Cập nhật thông tin user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                req.session.messages = { error: 'Không tìm thấy người dùng' };
                return res.redirect("/auth/settings");
            }

            // Cập nhật session nếu có thay đổi firstName hoặc lastName
            if (req.session.user) {
                if (updateData.firstName) {
                    req.session.user.firstName = updatedUser.firstName;
                }
                if (updateData.lastName) {
                    req.session.user.lastName = updatedUser.lastName;
                }
            }

            // Redirect về trang settings với thông báo thành công
            req.session.messages = { success: 'Cập nhật thông tin thành công!' };
            return res.redirect("/auth/settings");

        } catch (error) {
            console.error('Update profile error:', error);

            let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại sau';

            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                errorMessage = 'Dữ liệu không hợp lệ: ' + validationErrors.join(', ');
            }

            // Redirect về trang settings với thông báo lỗi
            req.session.messages = { error: errorMessage };
            return res.redirect("/auth/settings");
        }
    }

    // [POST] /auth/settings/update-avatar
    async updateAvatar(req, res, next) {
        try {
            if (!req.session || !(req.session.user || req.session.userId)) {
                return res.redirect('/auth/login');
            }

            const userId = (req.session.user && req.session.user.id) || req.session.userId;

            // Kiểm tra file upload (đã được xử lý bởi Multer)
            if (!req.file) {
                req.session.messages = { error: 'Vui lòng chọn ảnh để cập nhật' };
                return res.redirect("/auth/settings");
            }

            // File đã được lưu vào thư mục uploads bởi Multer
            // req.file.filename chứa tên file đã được tạo
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;


            // Cập nhật avatar trong database
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { avatar: avatarUrl },
                { new: true }
            );

            if (!updatedUser) {
                req.session.messages = { error: 'Không tìm thấy người dùng' };
                return res.redirect("/auth/settings");
            }

            // Cập nhật session
            if (req.session.user) {
                req.session.user.avatar = avatarUrl;
            }

            return res.redirect("/auth/settings");

        } catch (error) {
            console.error('Update avatar error:', error);

            // Redirect về trang settings với thông báo lỗi
            req.session.messages = { error: 'Có lỗi xảy ra, vui lòng thử lại sau' };
            return res.redirect("/auth/settings");
        }
    }

    // [POST] /auth/settings/change-password
    async changePassword(req, res, next) {
        try {
            if (!req.session || !(req.session.user || req.session.userId)) {
                return res.redirect('/auth/login');
            }

            const userId = (req.session.user && req.session.user.id) || req.session.userId;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                req.session.messages = { error: 'Vui lòng nhập đầy đủ thông tin' };
                return res.redirect("/auth/settings");
            }

            if (newPassword !== confirmPassword) {
                req.session.messages = { error: 'Mật khẩu xác nhận không khớp' };
                return res.redirect("/auth/settings");
            }

            if (newPassword.length < 8) {
                req.session.messages = { error: 'Mật khẩu mới phải có ít nhất 8 ký tự' };
                return res.redirect("/auth/settings");
            }

            // Lấy user và kiểm tra mật khẩu hiện tại
            const user = await User.findById(userId).select('+password');
            if (!user) {
                req.session.messages = { error: 'Không tìm thấy người dùng' };
                return res.redirect("/auth/settings");
            }

            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                req.session.messages = { error: 'Mật khẩu hiện tại không chính xác' };
                return res.redirect("/auth/settings");
            }

            // Cập nhật mật khẩu mới
            user.password = newPassword;
            await user.save();

            // Redirect về trang settings với thông báo thành công
            req.session.messages = { success: 'Đổi mật khẩu thành công!' };
            return res.redirect("/auth/settings");

        } catch (error) {
            console.error('Change password error:', error);

            let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại sau';

            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                errorMessage = 'Dữ liệu không hợp lệ: ' + validationErrors.join(', ');
            }

            // Redirect về trang settings với thông báo lỗi
            req.session.messages = { error: errorMessage };
            return res.redirect("/auth/settings");
        }
    }
}

module.exports = new AuthController()