// Load environment variables
require('dotenv').config();

const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const session = require('express-session');

const db = require('./config/db');
const route = require('./routes/index.route');
const sortMiddleWare = require('./app/middlewares/sortMiddleWare');
const { checkAuth } = require('./app/middlewares/authMiddleware');

// Connect to MongoDB 
db.connect();

// Init app
const app = express();
const port = process.env.PORT || 3000;

// Static file
// Phục vụ các file tĩnh (static files) như hình ảnh, CSS, JavaScript từ thư mục 'public'
// Cho phép truy cập trực tiếp các file trong thư mục public thông qua URL
// Ví dụ: http://localhost:3000/images/logo.png sẽ trả về file logo.png trong thư mục public/images
app.use(express.static(path.join(__dirname, 'public')));

// Parse request to json
// Middleware để xử lý dữ liệu từ form HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
// Middleware để xử lý dữ liệu JSON từ request body
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(methodOverride('_method'))

// Authentication middleware - kiểm tra trạng thái đăng nhập cho tất cả routes
app.use(checkAuth);

//MiddleWare
app.use(sortMiddleWare);

// HTTP logger
// Middleware để ghi log các HTTP request, giúp debug trong quá trình phát triển
app.use(morgan('combined'));

// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: require('./app/helpers/handlebars')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
