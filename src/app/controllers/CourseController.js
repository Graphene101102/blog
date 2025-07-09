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

    // [GET] /courses/create
    create(req, res, next) {
        res.render('courses/create')
    }

    // [POST] /courses/store
    store(req, res, next) {
        const formData = req.body;
        formData.image = `https://img.youtube.com/vi/${formData.videoId}/sddefault.jpg`;
        const course = new Course(req.body);
        course.save()
        .then(() => res.redirect('/')) 
        .catch(error => {
            
        })
    }
}

module.exports = new CourseController();