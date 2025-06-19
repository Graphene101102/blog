const mongoose = require("mongoose");

async function connect() {
    await mongoose.connect("mongodb://localhost:27017/Viet's_blog")
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.log(err));

}

module.exports = { connect }