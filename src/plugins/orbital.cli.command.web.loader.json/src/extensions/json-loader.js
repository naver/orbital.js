const extension = {
    fileTypes: [
        'json'
    ],
    getSourcePath() {
        return require.resolve('require-json');
    }
};

module.exports = extension;
