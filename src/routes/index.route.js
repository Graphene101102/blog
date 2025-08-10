const newsRouter = require('./news.route');
const authRouter = require('./auth.router');
const siteRouter = require('./site.route');
const courseRouter = require('./course.route');
const meRouter = require('./me.route')

function route(app) {
    app.use('/me', meRouter);
    app.use('/auth', authRouter);
    app.use('/courses', courseRouter);
    app.use('/news', newsRouter);
    app.use('/', siteRouter);
    

}

module.exports = route;