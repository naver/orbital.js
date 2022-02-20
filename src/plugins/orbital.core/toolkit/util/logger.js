const logger = {
    log(msg) {
        process.stdout.write('> ' + msg + '\n');
    },
    error(msg) {
        process.stderr.write('> ' + msg + '\n');
    }
};

module.exports = logger;
