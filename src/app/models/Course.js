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

Course.query.sortable = function (req) {
    if ('_sort' in req.query) {
            const isValidtype = ['asc','desc'].includes(req.query.type);

            return this.sort({ [req.query.column]: isValidtype? req.query.type : "desc" })
        }
    return this
}

Course.plugin(mongooseDelete,  { 
    overrideMethods: 'all' ,
    deletedAt : true,
});

module.exports = mongoose.model('Course', Course);