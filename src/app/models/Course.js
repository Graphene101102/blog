const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Course = new Schema({
    name: { type: String, minLength: 1, maxLength: 255, required: true },
    description: { type: String, maxLength: 600, required: true },
    image: { type: String, required: true },
    slug: {type: String, unique: true},
    videoId: {type: String, required: true},
},{
    timestamps: true,
});

Course.plugin(mongooseDelete,  { 
    overrideMethods: 'all' ,
    deletedAt : true,
});

module.exports = mongoose.model('Course', Course);