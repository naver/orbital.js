import chalk from 'chalk';
import {AbstractPackageManager, clone} from 'orbital.core.common';
import {
    IOrbitalPackageGraphNode, IOrbitalPackageJson,
    IPackageNode, IPluginContext,
    PackageManagerEvent
} from 'orbital.core.types';
import * as rpt_ from 'read-package-tree';
import Package from './Package';
import {getId} from './util';

const cyan = chalk.cyan.bold;
const stateStyle = {
    inactive: chalk.yellow.bold('(inactive)'),
    stopped: chalk.magenta.bold('(stopped)'),
};

function getStateMsg(state: string) {
    return (stateStyle as any)[state] || '';
}

function forEachNodes(node: IPackageNode, callback: (node: IPackageNode) => void) {
    callback(node);
    node.children.forEach((child: IPackageNode) => {
        forEachNodes(child, callback);
    });
}

class PackageManager extends AbstractPackageManager {

    private _root: IPackageNode | null = null;

    constructor(context: IPluginContext) {
        super(context);
    }

    /**
     * Shows dependency graph.
     */
    graph() {
        if (this._root) {
            const rootId = getId(this._root);
            if (rootId) {
                const root: IOrbitalPackageGraphNode = {
                    label: rootId,
                    nodes: []
                };
                this.getRegistry_().forEachPacks((pack) => {
                    const id = pack.getId();
                    const node: IOrbitalPackageGraphNode = {
                        label: id + ' ' + pack.getErrorString(),
                        nodes: []
                    };
                    root.nodes.push(node);
                    pack.dependencies.forEach((depPack) => {
                        const depId = depPack.getId();
                        node.nodes.push({
                            label: depId + ' ' + depPack.getErrorString(),
                            nodes: []
                        });
                    });
                });
                return root;
            }
        }
    }

    init() {
        const logger = this.logger_;
        const context = this.context_;
        const project = context.getService('orbital.core:project');
        const rootPath = project.getRealPath().root;
        const registry = this.getRegistry_();
        return new Promise((resolve, reject) => {
            logger.spin('start', 'discovering orbital packages ...');
            const rpt = rpt_;
            const nodes: IPackageNode[] = [];
            const discovered: IOrbitalPackageJson[] = [];
            rpt(rootPath, (err, root) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                let total = 0;
                let index = 0;
                this._root = root as IPackageNode;
                forEachNodes(this._root, () => { total++; });
                forEachNodes(this._root, (node) => {
                    const nodePackage = node.package;
                    if (Reflect.has(nodePackage, 'orbital')) {
                        nodes.push(node as IPackageNode);
                        discovered.push(clone(nodePackage) as IOrbitalPackageJson);
                    }
                    this.emit(PackageManagerEvent.traverse, {
                        index, package: nodePackage, total
                    });
                    logger.update(`(${++index}/${total}) ${nodePackage.name}`);
                });
                logger.spin('stop', `orbital packages discovered (${nodes.length}/${total})`);
                this.emit(PackageManagerEvent.discovered, discovered);
                // TODO nodes could be sorted by levels option here.
                this._addSystemPackage(nodes);
                nodes.forEach((node) => {
                    const id = getId(node);
                    if (id) {
                        const state = getStateMsg(node.package.orbital.state);
                        logger.log(cyan(id), state, 'detected');
                        registry.addPackage(new Package(node, logger));
                    }
                });
                resolve();
                
            });
        });
    }

    install() {
        // TODO
    }

    uninstall() {
        // TODO
    }

    update() {
        // TODO
    }

    private _addSystemPackage(nodes: IPackageNode[]) {
        const index = nodes.findIndex((nd: IPackageNode) => {
            return nd.package.name === 'orbital.core';
        });
        const node = nodes.splice(index, 1)[0];
        if (node) {
            const id = getId(node);
            if (id) {
                const logger = this.logger_;
                logger.log(cyan(id), 'detected');
                const sysNode = Object.assign({}, node);
                sysNode.package.dependencies = {};
                this.getRegistry_().addPackage(
                    new Package(sysNode, logger)
                );
            }
        }
    }
}

export default PackageManager;
