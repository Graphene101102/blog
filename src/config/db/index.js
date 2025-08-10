const mongoose = require("mongoose");

async function connect() {
    const mongoURI = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.log(err));
}

module.exports = { connect }