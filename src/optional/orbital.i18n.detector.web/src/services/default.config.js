const config = {
    persistent: true,
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
    lookupKey: {
        querystring: 'lang',
        cookie: 'orbital-i18n-detector-lang',
        localStorage: 'orbital-i18n-detector-lang'
    },
    cookie: {
        expires: 365
    }
};

export default config;
