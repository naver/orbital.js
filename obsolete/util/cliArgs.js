import nodeReq from '../util/nodeReq';
import commands from '../bin/src/commands.json';

function cliArgs() {
    const minimist = nodeReq('minimist');
    const argv = process.argv.slice(2);
    let parentArgs;
    const parentArgsExitst = argv.some((arg) => {
        parentArgs = arg;
        return arg.startsWith('orbitalprocessargv=');
    });
    if (parentArgsExitst) {
        const parentArgv = JSON.parse(parentArgs.split('=')[1]);
        return minimist(parentArgv.slice(2), commands);
    } else {
        return minimist(process.argv.slice(2), commands);
    }
}

export default cliArgs;
