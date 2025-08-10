const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/app/models/User');

async function checkUsers() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI;
        console.log('Connecting to MongoDB...');
        console.log('URI:', mongoURI);
        
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Check if there are any users
        const userCount = await User.countDocuments({});
        console.log(`📊 Total users in database: ${userCount}`);

        if (userCount > 0) {
            const users = await User.find({}).select('email firstName lastName');
            console.log('👥 Users found:');
            users.forEach(user => {
                console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
            });
        } else {
            console.log('❌ No users found in database');
            console.log('💡 You need to register a user first!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed');
    }
}

checkUsers(); 