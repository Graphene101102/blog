const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const handlebars = require('express-handlebars');

const db = require('./config/db');
const route = require('./routes/index.route');
const SortMiddleWare = require('./app/middlewares/SortMiddleWare')

// Connect to MongoDB 
db.connect();

// Init app
const app = express();
const port = 3000;

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

app.use(methodOverride('_method'))

//MiddleWare
app.use(SortMiddleWare);

// HTTP logger
// Middleware để ghi log các HTTP request, giúp debug trong quá trình phát triển
app.use(morgan('combined'));

// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    sum: (a, b) => a + b,
    sortable: (field, sort) => {

      const sortType = field === sort.column ? sort.type : 'default';

      const icons = {
        default: 'oi oi-elevator',
        asc: 'oi oi-sort-ascending',
        desc: 'oi oi-sort-descending'
      };
      const icon = icons[sortType];

      const types = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc'
      }
      const type = types[sortType];

      return `<a href="?_sort&column=${field}&type=${type}">
        <span class="${icon}"></>
      </a>`;

    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
