import execute from './execute';
import {logger} from './util';
import {realpathSync} from 'fs';

export default function runOrbital(cargs) {
    //TODO use env as orbital service
    if (cargs.env) {
        cargs.env.split(',').forEach((pair) => {
            const index = pair.indexOf(':');
            if (~index) {
                process.env[pair.slice(0, index)] = pair.slice(index + 1);
            } else {
                process.env[pair] = true;
            }
        });
    }

    //TODO use config as orbital service
    let config = cargs.config === true ? 'orbital.config.js' : cargs.config;

    if (config) {
        try {
            config = realpathSync(config);
            execute(cargs, require(config));
        } catch (e) {
            logger.error(e.message);
        }
    } else {
        execute(cargs);
    }
}
