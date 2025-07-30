const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const Course = new Schema({
    _id: {type: Number},
    name: { type: String, minLength: 1, maxLength: 255, required: true },
    description: { type: String, maxLength: 600, required: true },
    image: { type: String, required: true },
    slug: {type: String, unique: true},
    videoId: {type: String, required: true},
},{
    _id: false,
    timestamps: true,
});

Course.query.sortable = function (req) {
    if ('_sort' in req.query) {
            const isValidtype = ['asc','desc'].includes(req.query.type);

            return this.sort({ [req.query.column]: isValidtype? req.query.type : "desc" })
        }
    return this
}

Course.plugin(AutoIncrement)
Course.plugin(mongooseDelete,  { 
    overrideMethods: 'all' ,
    deletedAt : true,
});

module.exports = mongoose.model('Course', Course);