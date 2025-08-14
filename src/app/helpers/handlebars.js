const Handlebars = require('handlebars');

module.exports = {
    sum: (a, b) => a + b,
    
    // Helper để chuyển đổi Mongoose object thành plain object
    toPlainObject: function(obj) {
        if (obj && typeof obj.toObject === 'function') {
            return obj.toObject();
        }
        return obj;
    },
    
    // Helper để kiểm tra và truy cập thuộc tính an toàn
    safeGet: function(obj, property) {
        if (obj && typeof obj === 'object') {
            return obj[property] || '';
        }
        return '';
    },
    
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

        const address = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);

        const output = `<a href="${address}">
            <span class="${icon}"></span>
        </a>`;

        return new Handlebars.SafeString(output);
    }
}
