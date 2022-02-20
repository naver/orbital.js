class Activator {

    onStart(context) {
        const logger = context.getService('orbital.core:logger');
        const cliArgs = context.getService('orbital.cli:arguments');

        context.on('extensionRegistered', (registration) => {
            const extensionId = registration.getExtensionId();
            const contributor = registration.getContributorContext();
            registration.getModule().then((module) => {
                return cliArgs.getArguments().then((args) => {
                    const argsLen = Reflect.ownKeys(args).length;
                    if (argsLen === 1 && extensionId === 'orbital.cli:shell') {
                        setTimeout(() => {
                            module.execute(contributor);
                        });
                    } else if (argsLen > 1 && extensionId === 'orbital.cli:command') {
                        if (module.command in args) {
                            module.execute(contributor);
                        } else if (typeof module.default === 'function') {
                            module.default(contributor);
                        }
                    }
                });
            }).catch((e) => {
                logger.error(e);
            });
        });
    }

    onStop(/*context*/) {
    }
}

module.exports = Activator;
