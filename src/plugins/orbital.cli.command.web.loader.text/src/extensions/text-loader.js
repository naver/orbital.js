const extension = {
    fileTypes: [
        'text',
        'txt'
    ],
    getSourcePath() {
        return require.resolve('require-text');
    }
};

module.exports = extension;
