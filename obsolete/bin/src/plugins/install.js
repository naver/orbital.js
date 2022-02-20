import {execSync, logger} from '../util';
import fse from 'fs-extra';

const DEFAULT_ROOT_PATH = '.';

function getRootPath(config) {
    return config.path && config.path.root || DEFAULT_ROOT_PATH;
}

function clearOrbitalPackages(config) {
    logger.log('clearing orbital packages ...');
    const rootPath = getRootPath(config);
    const nmPath = rootPath + '/node_modules';
    if (fse.pathExistsSync(nmPath)) {
        const nmPaths = fse.readdirSync(nmPath);
        nmPaths.forEach((path) => {
            if (path === 'orbital.js') {
                return;
            }
            const nmDir = nmPath + '/' + path;
            const metafile = nmDir + '/package.json';
            if (fse.pathExistsSync(metafile)) {
                const meta = fse.readJsonSync(metafile);
                if (meta.orbital) {
                    fse.removeSync(nmDir);
                    //execSync('npm uninstall ' + meta.name);
                    logger.log(nmDir + ' cleared');
                }
            }
        });
    }
}

function installPackages(config) {
    logger.log('installing packages ...');
    const cwd = process.cwd();
    const root = fse.realpathSync(getRootPath(config));
    if (cwd !== root) {
        process.chdir(cwd);
    }
    execSync('npm install');
}

export default {
    onStart(config = {}) {
        clearOrbitalPackages(config);
        installPackages(config);
    },
    onStop() {
    }
};
