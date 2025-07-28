const { multipleMongooseToObject } = require("../../util/mongoose");
const Course = require("../models/Course");

class MeController {
    // [GET] /me/course
    course(req, res, next) {

        let courseQuery = Course.find({});

        if ('_sort' in req.query) {
            courseQuery
                .sort({ [req.query.column]: req.query.type })
        }

        courseQuery
            .then(courses => res.render('me/stored-course', {
                courses: multipleMongooseToObject(courses)
            }))
            .catch(next);

    }

    //[GET] /me/course/trash
    courseTrash(req, res, next) {
        Course.findWithDeleted({ deleted: true })
            .then(courses => res.render('me/trash-course', {
                courses: multipleMongooseToObject(courses)
            }))
            .catch(next);
    }

    // [GET] /me/news
    news(req, res, next) {
        res.send('My news');
    }
}

module.exports = new MeController();