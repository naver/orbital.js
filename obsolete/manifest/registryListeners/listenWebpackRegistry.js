import {logger, nodeReq} from '../../util';

function touchOrbital(rootPath, callback) {
    const rpt = nodeReq('read-package-tree');
    rpt(rootPath, (err, root) => {
        if (err) {
            logger.error(err);
            return;
        }
        (function walk(node) {
            const pack = node.package;
            if (pack.name === 'orbital.js') {
                const fs = nodeReq('fs');
                const path = nodeReq('path');
                const p = path.resolve(node.realpath, pack.main);
                fs.open(p, 'r+', (err, fd) => {
                    const time = Date.now() / 1000;
                    fs.futimes(fd, time, time, () => {
                        callback(p);
                    });
                });
                return;
            }
            node.children.forEach((child) => {
                walk(child);
            });
        })(root);
    });
}

function listenWebpackRegistry(registry) {
    function processQueue() {
        logger.log('processing update queue');
        touchOrbital(registry.rootPath, (/*p*/) => {
            logger.log('orbital touched');
        });
    }
    function addUpdateQueue(event, id, manifest) {
        logger.log(event, id);
        if (registry.queue.length === 0) {
            processQueue();
        }
        registry.queue.push({event, id, manifest});
    }
    registry.on('packageAdded', (pack) => {
        addUpdateQueue('packageAdded', pack.getId(), pack.getManifest());
    });
    registry.on('packageWillUpdate', (reloadId) => {
        logger.log('packageWillUpdate', reloadId, 'does nothing');
    });
    registry.on('packageUpdated', (id, manifest) => {
        addUpdateQueue('packageUpdated', id, manifest);
    });
    registry.on('packageWillRemove', (pack) => {
        logger.log('packageWillRemove', pack, 'does nothing');
    });
    registry.on('packageRemoved', (pack) => {
        addUpdateQueue('packageRemoved', pack.getId(), pack.getManifest());
    });
}

export default listenWebpackRegistry;
