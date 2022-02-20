const extension = {
    fileTypes: [
        'css'
    ],
    getSourcePath() {
        return require.resolve('require-css');
    }
};

module.exports = extension;
