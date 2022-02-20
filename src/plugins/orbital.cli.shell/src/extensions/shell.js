const chalk = require('chalk');
const repl = require('repl');

(function shim() {
    const proto = repl.REPLServer.prototype;
    if (!proto.clearBufferedCommand) {
        proto.clearBufferedCommand = function clearBufferedCommand() {
            // TODO
        };
    }
})();

function createReplServer(commands) {
    const server = repl.start({
        ignoreUndefined: true,
        prompt: chalk.cyan('ORBITAL') + ' > '
    });
    commands.forEach((command) => {
        Object.defineProperty(server.context, command.name, {
            get: command.action.bind(server)
        });
    });
}

const extension = {
    execute(context) {
        const opm = context.getService('orbital.core:package-manager');
        createReplServer([{
            name: 'list',
            help: "Shows a list of plugins and it's state",
            action() {
                this.clearBufferedCommand();
                opm.list().forEach((pack) => {
                    console.log(pack.getId(), pack.getErrorString());
                });
                this.displayPrompt();
            }
        }, {
            name: 'exit',
            help: 'Exit orbital cli shell',
            action() {
                console.log('See you!');
                this.close();
            }
        }]);
    }
};

module.exports = extension;
