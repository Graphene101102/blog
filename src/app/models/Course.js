const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Course = new Schema({
    name: { type: String, minLength: 1, maxLength: 255, required: true },
    description: { type: String, maxLength: 600, required: true },
    image: { type: String, required: true },
    slug: {type: String, slug:'name', unique: true},
    videoId: {type: String, required: true},
},{
    timestamps: true,
});

module.exports = mongoose.model('Course', Course);