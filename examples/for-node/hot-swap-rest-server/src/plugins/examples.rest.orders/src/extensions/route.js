const sample = require('./orders.json');

module.exports = {

    path: '/orders',

    controller(req, res, next) {
        res.send(sample);
        next();
    }
};
