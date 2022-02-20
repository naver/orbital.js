class Activator {

    constructor() {
        this.extRegisteredListener = this.handleExtensionRegistered.bind(this);
        this.extUnregisteredListener = this.handleExtensionUnregistered.bind(this);
    }

    onStart(context) {
        this.startServer();
        context.on('extensionRegistered', this.extRegisteredListener);
        context.on('extensionUnregistered', this.extUnregisteredListener);
    }

    onStop(context) {
        const url = this.server.url;
        this.server.destroy(() => {
            console.log('%s closed', url);
        });
        context.off('extensionRegistered', this.extRegisteredListener);
        context.off('extensionUnregistered', this.extUnregisteredListener);
    }

    bindPathToController(ext) {
        return this.server.get(ext.path, ext.controller);
    }

    createServer() {
        const restify = require('restify');
        const enableDestroy = require('server-destroy');
        const server = restify.createServer();
        enableDestroy(server);
        return server;
    }

    handleExtensionRegistered(registration) {
        if (registration.getExtensionId() === 'examples.rest:route') {
            registration.getModule().then(module => {
                this.routes[module.path] = this.bindPathToController(module);
            });
        }
    }

    handleExtensionUnregistered(registration) {
        if (registration.getExtensionId() === 'examples.rest:route') {
            registration.getModule().then(module => {
                this.server.rm(this.routes[module.path]);
            });
        }
    }

    startServer() {
        this.server = this.createServer();
        this.routes = {};
        this.server.listen(8080, 'localhost', () => {
            console.log('%s listening', this.server.url);
        });
    }
}

module.exports = Activator;
