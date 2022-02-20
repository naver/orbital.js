import sampleUsers from './users.json';

export default {

    path: '/users',

    controller(req, res, next) {
        res.send(sampleUsers);
        next();
    }
};
