import {exec, logger} from '../util';
import chalk from 'chalk';
import chokidar from 'chokidar';
import {realpathSync} from 'fs';
import fse from 'fs-extra';
import path from 'path';
import rpj from 'read-package-json';
import rpt from 'read-package-tree';

const sourcePrefix = chalk.bold.white.bgBlue;
const targetPrefix = chalk.bold.white.bgGreen;

export class Watcher {

    constructor(target, entryPath, rootPath, pluginsPath) {
        this.target = target;
        this.entryPath = entryPath;
        this.rootPath = rootPath;
        this.pluginsPath = pluginsPath;
        this.watcher = chokidar
            .watch(pluginsPath, {ignoreInitial: true})
            .on('all', this.handleChange.bind(this));
        logger.log(`target platform is ${chalk.bold.cyan(this.target)}`);
        logger.log(`plugin-watcher is watching '${chalk.bold.cyan(pluginsPath)}'. ctrl+c to exit.\n`);
        this.execEntryPoint();
    }

    close() {
        this.watcher.close();
        logger.log('plugin-watcher stopped.');
    }

    execEntryPoint() {
        if (this.target === 'node') {
            exec(`node ${this.entryPath}`);
        }
    }

    handleChange(event, filepath) {
        const cwd = process.cwd();
        const absSourceFile = cwd + path.sep + filepath;
        const absPluginsDir = realpathSync(this.pluginsPath);
        const relFile = path.relative(absPluginsDir, absSourceFile);
        const relTokens = relFile.split(path.sep);
        const relSourcePackageDir = relTokens.shift();
        const relSourceFile = relTokens.join(path.sep);
        const manifestPath = absPluginsDir + path.sep
            + relSourcePackageDir + path.sep + 'package.json';
        logger.log(sourcePrefix(' UPDATING ... '), filepath);
        rpj(manifestPath, (err, manifest) => {
            if (err) {
                logger.error(`Error reading manifest file (${manifestPath})`);
                return;
            }
            //find packages inside of the rpt
            //Node {path, realpath, error, id, package, parent, isLink, children}
            rpt(this.rootPath, (err, root) => {
                this.walk(root, {
                    event,
                    manifest,
                    source: {
                        absolute: absSourceFile,
                        relative: relSourceFile
                    }
                });
            });
        });
    }

    update(node, opt) {
        const event = opt.event;
        const prefix = targetPrefix(` ${event.toUpperCase()} `);
        const source = opt.source.absolute;
        const target = node.realpath + path.sep + opt.source.relative;
        if (event === 'add' || event === 'change' || event === 'addDir') {
            fse.ensureDir(path.dirname(target))
                .then(() => {
                    fse.copy(source, target, (err) => {
                        if (err) {
                            logger.error(err);
                            return;
                        }
                        logger.log(prefix, `${target}`);
                    });
                })
                .catch((err) => {
                    logger.error(err);
                });
        } else if (event === 'unlink' || event === 'unlinkDir') {
            fse.remove(target, (err) => {
                if (err) {
                    logger.error(err);
                    return;
                }
                logger.log(prefix, `${target}`);
            });
        } else {
            logger.error('unhandled event', event);
        }
    }

    walk(node, opt) {
        if (opt.manifest._id === node.package._id) {
            this.update(node, opt);
        }
        if (node.children) {
            node.children.forEach((childNode) => {
                this.walk(childNode, opt);
            });
        }
    }
}
