const Course = require("../models/Course");
const { mongooseToObject } = require("../../util/mongoose");
const slugify = require('slugify');

class CourseController {
    // [GET] /courses/:slug
    detail(req, res, next) {

        Course.findOne({ slug: req.params.slug })
            .then(course => {
                res.render('courses/detail', { course: mongooseToObject(course) })
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
        formData.slug = slugify(formData.name, { lower: true, strict: true });
        const course = new Course(req.body);
        course.save()
            .then(() => res.redirect('/'))
            .catch(error => {

            })
    }

    // [GET] /courses/:id/edit
    edit(req, res, next) {
        Course.findById(req.params.id)
            .then((course) => res.render('courses/edit', {
                course: mongooseToObject(course),
            }))
            .catch(next)
    }

    //[PUT] /courses/:id
    update(req, res, next) {

        req.body.image = `https://img.youtube.com/vi/${req.body.videoId}/sddefault.jpg`;
        req.body.slug = slugify(req.body.name, { lower: true, strict: true });

        Course.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/me/courses'))
            .catch(next)
    }

    //[DELETE] /courses/:id/delete
    delete(req, res, next) {
        Course.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('/me/courses'))
            .catch(next)
    }
}

module.exports = new CourseController();