const archy = require('archy');

function out(arg) {
    process.stdout.write(arg);
}

const extension = {
    command: 'graph',
    alias: 'g',
    desc: "Show orbital package's dependency graph",
    execute(context) {
        const opm = context.getService('orbital.core:package-manager');
        const graph = archy(opm.graph(), '', {
            unicode: process.platform !== 'win32'
        });
        out('\n');
        out(graph);
        out('\n');
    }
};

module.exports = extension;
