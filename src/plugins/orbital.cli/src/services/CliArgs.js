const minimist = require('minimist');

class CliArgs {

    constructor(context) {
        this._context = context;
    }

    getArguments() {
        return this._context.getExtensions('orbital.cli:command')
            .then((extensions) => {
                const alias = {};
                extensions.forEach((ext) => {
                    const {module} = ext;
                    alias[module.alias] = module.command;
                });
                return minimist(process.argv.slice(2), {alias});
            });
    }

    getArgValue(command) {
        return this.getArguments().then((args) => {
            return args[command];
        });
    }

    hasCommand(command) {
        return this.getArguments().then((args) => {
            return command in args;
        });
    }
}

module.exports = CliArgs;
