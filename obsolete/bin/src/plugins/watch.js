import {cliArgs, logger} from '../util';
import NodeAppProcess from './watchProcess/NodeAppProcess';
import WDSProcess from './watchProcess/WDSProcess';
import chalk from 'chalk';

//Cause of WDS BUG wait 10s for WDS Process
//https://github.com/webpack/watchpack/issues/25
//https://github.com/webpack/webpack/issues/2983

const wdsBug = 'see https://github.com/webpack/watchpack/issues/25';
const DEFAULT_TARGET = 'node';
const cargs = cliArgs();

function getTarget(config) {
    return config.target || DEFAULT_TARGET;
}

export default {
    onStart(config = {}) {
        const target = getTarget(config);
        logger.log(`target is ${chalk.bold.cyan(target)}`);
        if (target === 'node') {
            this.child = new NodeAppProcess(config);
        } else if (target === 'webpack') {
            if (cargs.install) {
                let wait = 10;
                const waiting = setInterval(() => {
                    let bar = '';
                    let w = 10;
                    while (w) {
                        if (w <= wait) {
                            bar += ' ';
                        } else {
                            bar += '>';
                        }
                        w--;
                    }
                    logger.update(`[${bar}] loading webpack-dev-server (${wdsBug})`);
                    if (wait === 0) {
                        logger.nl();
                        clearTimeout(waiting);
                        this.child = new WDSProcess(config);
                    }
                    wait--;
                }, 1000);
            } else {
                this.child = new WDSProcess(config);
            }
        }
    },
    onStop() {
        this.child.close();
    }
};
