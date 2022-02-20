import commands from '../commands.json';
import minimist from 'minimist';

export function cliArgs() {
    return minimist(process.argv.slice(2), commands);
}
