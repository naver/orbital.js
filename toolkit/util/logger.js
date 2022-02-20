const logger = {
    log(msg) {
        process.stdout.write('\n> ' + msg + '\n');
    },
    error(msg) {
        process.stderr.write('\n> ' + msg + '\n');
    }
};

module.exports = logger;
