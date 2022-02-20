import {exec, logger} from '../../util';

const DEFAULT_ENTRY_PATH = './src/app/main.js';

function getEntryPath(config) {
    return config.path && config.path.entry || DEFAULT_ENTRY_PATH;
}

class NodeAppProcess {

    constructor(config) {
        this.cmd = 'node ' + getEntryPath(config);
        this.child = exec(this.cmd, {
            parentArgs: true
        });

        //TODO This won't work, have to find out the reason.
        this.child.on('close', () => {
            logger.log(`${this.cmd} closed.`);
        });
    }

    close() {
        logger.log(`${this.cmd} closed.`);
    }
}

export default NodeAppProcess;
