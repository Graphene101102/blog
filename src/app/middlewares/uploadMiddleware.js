const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage cho Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất: avatar_userId_timestamp.extension
        const userId = req.session?.user?.id || req.session?.userId || 'unknown';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `avatar_${userId}_${timestamp}${extension}`;
        cb(null, filename);
    }
});

// Filter file upload
const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

// Cấu hình Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Chỉ cho phép upload 1 file
    }
});

// Middleware xử lý upload avatar
const uploadAvatar = upload.single('avatar');

// Middleware xử lý lỗi upload
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn! Vui lòng chọn file nhỏ hơn 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ được upload 1 file'
            });
        }
    }
    
    if (error.message === 'Chỉ chấp nhận file ảnh!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi upload file'
    });
};

module.exports = {
    uploadAvatar,
    handleUploadError
}; 