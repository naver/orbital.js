const sample = require('./products.json');

module.exports = {

    path: '/products',

    controller(req, res, next) {
        res.send(sample);
        next();
    }
};
