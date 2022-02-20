import {logger} from '../../util';
import chalk from 'chalk';
import fse from 'fs-extra';
import relative from 'require-relative';

const DEFAULT_WEBPACK_CONFIG_PATH = './webpack.config.js';

function getConfigPath(config) {
    return config.path && config.path.webpack || DEFAULT_WEBPACK_CONFIG_PATH;
}

class WDSProcess {

    constructor(config) {
        this.tryStartServer(config);
    }

    handleError(e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            let emsg;
            const msg = e.message;
            if (msg) {
                emsg = `${msg}.`;
                const pkgName = msg.substring(
                    msg.indexOf("'") + 1, msg.lastIndexOf("'")
                );
                if (pkgName) {
                    emsg += ` Install it with 'npm install -D ${pkgName}'`;
                }
            } else {
                emsg = 'file or module not found';
            }
            logger.error(emsg);
        } else {
            logger.error(e.message);
        }
        process.exit(2);
    }

    fix(wdsCfg) {
        if (!wdsCfg.watchOptions) {
            wdsCfg.watchOptions = {};
        }
        if (typeof wdsCfg.watchOptions.poll === 'undefined') {
            wdsCfg.watchOptions.poll = true;
        }
    }

    startDevServer(webpack, Server, wpCfg, wdsCfg) {
        Server.addDevServerEntrypoints(wpCfg, wdsCfg);
        const host = wdsCfg.host || 'localhost';
        const port = wdsCfg.port || 80;
        const compiler = webpack(wpCfg);
        this.fix(wdsCfg);
        this.server = new Server(compiler, wdsCfg);
        logger.log('starting webpack-dev-server ...');
        this.server.listen(port, host, () => {
            const address = chalk.bold.cyan(`${host}:${port}`);
            logger.log(
                `webpack-dev-server running on ${address}`);
        });
    }

    tryStartServer(config) {
        Promise
            .resolve()
            .then(() => {
                const wpCfgPath = getConfigPath(config);
                if (fse.pathExistsSync(wpCfgPath)) {
                    return wpCfgPath;
                } else {
                    const m = `Cannot find webpack config file '${wpCfgPath}'`;
                    const e = new Error(m);
                    e.code = 'FILE_NOT_FOUND';
                    throw e;
                }
            })
            .then((wpCfgPath) => {
                return relative(wpCfgPath);
            })
            .then((wpCfg) => {
                const webpack = relative('webpack', process.cwd());
                return {wpCfg, webpack};
            })
            .then((opt) => {
                const {wpCfg, webpack} = opt;
                const wdsCfg = wpCfg.devServer;
                const Server = relative(
                    'webpack-dev-server', process.cwd());
                this.startDevServer(webpack, Server, wpCfg, wdsCfg);
            })
            .catch((e) => {
                this.handleError(e);
            });
    }

    close() {
        logger.log('webpack-dev-server stopped.');
        if (this.server) {
            this.server.close();
        }
    }
}

export default WDSProcess;
