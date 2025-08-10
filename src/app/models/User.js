const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const User = new Schema({
    firstName: {type: String, required: true, trim: true, maxlength: 50},
    lastName: {type: String, required: true, trim: true, maxlength:30},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/},
    phone: {type: String, trim: true, match: /^[0-9]{10,11}$/},
    password: {type: String, required: true, minlength: 8, select: false},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    isEmailVerified: {type: Boolean, default: false},
    avatar: {type: String, default: null},
    bio: {type: String, maxlength: 500},
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field cho fullName
User.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Middleware trước khi save - hash password
User.pre('save', async function(next) {
    // Chỉ hash password nếu nó được thay đổi
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password với salt rounds = 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Method để so sánh password
User.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Lỗi so sánh mật khẩu');
    }
};

// Static method để tìm user theo email
User.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', User); 
