module.exports = function (config) {
    config.set({
        basePath: '../',
        frameworks: ['mocha', 'karma-typescript'],
        files: [
            './src/**/*.ts',
            './spec/**/*.spec.ts'
        ],
        preprocessors: {
            './src/**/*.ts': ['karma-typescript'],
            './spec/**/*.spec.ts': ['karma-typescript']
        },
        karmaTypescriptConfig: {
            tsconfig: './config/ts.spec.json'
        },
        reporters: ['mocha', 'coverage'],
        browsers: ['Chrome', 'IE', 'Electron']
    });
};
