module.exports = function sortMiddleWare (req, res, next) {

    res.locals._sort = {
        enable: false,
        type: 'default',
        column: '',
    };

      if ('_sort' in req.query) {
        res.locals._sort.enable = true;
        res.locals._sort.type = req.query.type; 
        res.locals._sort.column = req.query.column;
      };

    next();
}