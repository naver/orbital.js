//import InstallError from '../exceptions/InstallError';
import Notice from '../../util/Notice';

const reg = new Map();

const ExportsRegistry = {

    register(name, version, exports) {
        if (!reg.has(name)) {
            reg.set(name, {});
        }
        const regsByName = reg.get(name);
        regsByName[version] = exports;
        Notice.log(`${name}@${version} registered to ExportsRegistry`);
        /*
        if (regsByName[version]) {
            throw new Error(
                `${InstallError.ALEXIST} (${name}@${version})`);
        } else {
            regsByName[version] = exports;
            Notice.log(`${name}@${version} ${JSON.stringify(exports)} registered to ExportsRegistry`);
        }
        */
    },

    unregister(name, version) {
        const regsByName = reg.get(name);
        if (regsByName && regsByName[version]) {
            delete regsByName[version];
            Notice.log(`${name}@${version} unregistered from ExportsRegistry`);
        }
    },

    update(name, version, exports) {
        this.unregister(name, version);
        this.register(name, version, exports);
    },

    getExportsByPlugin(plugin) {
        const name = plugin.getName();
        const version = plugin.getVersion();
        const byName = reg.get(name);
        if (byName) {
            return byName[version];
        }
        return null;
    }
};

export default ExportsRegistry;
