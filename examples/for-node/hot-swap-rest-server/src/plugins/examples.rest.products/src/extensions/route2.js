const sample = require('./products.json');

module.exports = {

    path: '/products2',

    controller(req, res, next) {
        res.send(sample);
        next();
    }
};
