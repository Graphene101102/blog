const Course = require("../models/Course");
const { mongooseToObject } = require("../../util/mongoose");

class CourseController {
    // [GET] /courses/:slug
    detail(req, res, next) {

        Course.findOne({ slug: req.params.slug})
        .then(course => {
            res.render('courses/detail', {course: mongooseToObject(course)})
        })
        .catch(next);
    }
}

module.exports = new CourseController();