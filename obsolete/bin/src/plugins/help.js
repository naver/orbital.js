import {version} from '../../../package.json';
import help from '../help.md';

export default {
    onStart() {
        console.log(`\n${help.replace('__VERSION__', version)}\n`);
    }
};
