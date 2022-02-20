import runOrbital from './runOrbital';
import {cliArgs} from './util';

const cargs = cliArgs();

if (process.argv.length <= 2 && process.stdin.isTTY) {
    console.log('shell mode');
} else {
    runOrbital(cargs);
}
