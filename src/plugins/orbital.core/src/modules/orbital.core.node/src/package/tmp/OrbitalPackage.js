import ExportsRegistry from '../framework/resolution/ExportsRegistry';
import {objectify} from '../util';
import merge from 'lodash.merge';

class OrbitalPackage extends FlagSupport {

    init(node, isUpdate) {
        this.requireModules(!!isUpdate);
    }

    reloadModules() {
        this.exports.paths.forEach((path) => {
            delete require.cache[require.resolve(path)];
        });
    }

    requireModules(isUpdate) {
        const meta = this.meta;
        if (meta.orbital.target !== 'node') {
            return;
        }
        let isError = false;
        const obj = {};
        const ids = this.exports.ids;
        const paths = this.exports.paths;
        if (isUpdate) {
            this.reloadModules();
        }
        ids.forEach((id, i) => {
            try {
                merge(obj, objectify(id, nodeReq(paths[i])));
            } catch (e) {
                isError = true;
                e.message += ` (${paths[i]})`;
                this.handleError('module', e, 'INVALID_MODULE');
            }
        });
        if (!isError) {
            if (isUpdate) {
                ExportsRegistry.update(meta.name, meta.version, obj);
            } else {
                ExportsRegistry.register(meta.name, meta.version, obj);
            }
        }
    }

    requires(pack) {
        return this.depList.indexOf(pack.getId()) > -1;
    }

    removeModules() {
        const meta = this.meta;
        ExportsRegistry.unregister(meta.name, meta.version);
    }
}
