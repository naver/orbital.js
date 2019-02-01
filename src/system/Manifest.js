import Base from './bases/Base';
import ManifestError from './exceptions/ManifestError';
import ContributableExtensionDescriptor from './extensions/ContributableExtensionDescriptor';
import ContributingExtensionDescriptor from './extensions/ContributingExtensionDescriptor';
import PackageState from './PackageState';
import ContributableServiceDescriptor from './services/ContributableServiceDescriptor';
import ContributingServiceDescriptor from './services/ContributingServiceDescriptor';

const privates = {
    createDescriptors() {
        const pluginName = this.name;
        const pluginVersion = this.version;
        const contributableServices = [];
        const contributingServices = [];
        const contributableExtensions = [];
        const contributingExtensions = [];
        const contributesIndex = {};

        function normalizeContributableId(pluginName, id) {
            const index = id.indexOf(':');
            let result = id;
            if (index < 0) {
                result = pluginName + ':' + id;
            } else if (index === 0) {
                throw new ManifestError(
                    ManifestError.SYNTAX_CONTRIBUTABLE_ID + id);
            } else if (index > 0) {
                if (index === (id.length - 1)) {
                    throw new ManifestError(
                        ManifestError.SYNTAX_CONTRIBUTABLE_ID + id);
                }
                const packageName = Manifest.getPackageName(id);
                if (packageName !== pluginName) {
                    throw new ManifestError(
                        ManifestError.PACKAGENAME_MISSMATCH + id);
                }
            }
            return result;
        }
        function validateContributingId(id) {
            const index = id.indexOf(':');
            if (index <= 0) {
                throw new ManifestError(
                    ManifestError.SYNTAX_CONTRIBUTING_ID + id);
            } else if (index > 0) {
                if (index === (id.length - 1)) {
                    throw new ManifestError(
                        ManifestError.SYNTAX_CONTRIBUTING_ID + id);
                }
            }
        }
        function checkDependencies(manifest, provider) {
            if (manifest.name === provider) {
                return;
            }
            if (!Reflect.has(manifest.dependencies, provider)) {
                throw new ManifestError(
                    ManifestError.MISSING_DEPENDENCY,
                    provider,
                    manifest.name);
            }
        }

        this.contributable.services.forEach((raw) => {
            contributableServices.push(new ContributableServiceDescriptor(
                pluginName,
                pluginVersion,
                normalizeContributableId(pluginName, raw.id),
                Object.freeze(raw.spec),
                raw.desc
            ));
        });
        this.contributes.services.forEach((raw, index) => {
            const id = raw.id;
            validateContributingId(id);
            const provider = Manifest.getPackageName(id);
            const version = provider === this.name ? this.version : this.dependencies[provider];
            const uniqueId = `services/${provider}/${version}/${id}`;
            if (!contributesIndex[uniqueId]) {
                contributesIndex[uniqueId] = 0;
            }
            checkDependencies(this, provider);
            contributingServices.push(new ContributingServiceDescriptor(
                provider,
                version,
                id,
                contributesIndex[uniqueId]++,
                raw.realize,
                raw.priority,
                raw.vendor
            ));
        });
        this.contributable.extensions.forEach((raw) => {
            contributableExtensions.push(new ContributableExtensionDescriptor(
                pluginName,
                pluginVersion,
                normalizeContributableId(pluginName, raw.id),
                Object.freeze(raw.spec),
                raw.desc
            ));
        });
        this.contributes.extensions.forEach((raw) => {
            const id = raw.id;
            validateContributingId(id);
            const provider = Manifest.getPackageName(id);
            const version = provider === this.name ? this.version : this.dependencies[provider];
            const uniqueId = `extensions/${provider}/${version}/${id}`;
            if (!contributesIndex[uniqueId]) {
                contributesIndex[uniqueId] = 0;
            }
            checkDependencies(this, provider);
            contributingExtensions.push(new ContributingExtensionDescriptor(
                provider,
                version,
                id,
                contributesIndex[uniqueId]++,
                raw.realize,
                raw.meta,
                raw.priority,
                raw.vendor
            ));
        });
        Reflect.defineProperty(this.contributable, 'services', {
            value: Object.freeze(contributableServices)
        });
        Reflect.defineProperty(this.contributes, 'services', {
            value: Object.freeze(contributingServices)
        });
        Reflect.defineProperty(this.contributable, 'extensions', {
            value: Object.freeze(contributableExtensions)
        });
        Reflect.defineProperty(this.contributes, 'extensions', {
            value: Object.freeze(contributingExtensions)
        });
    }
};

class Manifest extends Base {

    static getPackageName(id) {
        return id.split(':')[0];
    }

    constructor(meta) {
        super();
        function throwError(code) {
            throw new ManifestError(
                ManifestError[code] + ' (' + meta.path + ')');
        }
        if (!meta) {
            throwError('NOMETA');
        }
        if (meta.name) {
            this.define('name', meta.name);
        } else {
            throwError('NONAME');
        }
        if (meta.version) {
            this.define('version', meta.version);
        } else {
            throwError('VERSION');
        }
        this.define('path', meta.path);
        this.define('description', meta.description);
        this.define('license', meta.license);
        this.define('policies', meta.policies || []);
        this.define('activator', meta.activator);
        this.define('contributable', meta.contributable);
        this.define('contributes', meta.contributes);
        this.define('dependencies', meta.dependencies || {});
        this.define('parent', meta.parent);
        this.define('state', meta.state);
        this.define('errorReason', meta.errorReason);
        const {STOPPED, STOPPED_BY_DEPENDENCY} = PackageState;
        if (this.state <= (STOPPED | STOPPED_BY_DEPENDENCY)) {
            privates.createDescriptors.call(this);
        }
    }

    getContributableServiceDescriptors() {
        return this.contributable.services;
    }

    /**
     * Returns ContributableServiceDescriptor for this plugin
     * with the given service id.
     * @param {string} id - Service id
     * @return {ContributableServiceDescriptor}
     */
    getContributableServiceDescriptor(id) {
        let result = null;
        this.getContributableServiceDescriptors().some((descriptor) => {
            if (descriptor.id === id) {
                result = descriptor;
                return true;
            }
        });
        return result;
    }

    getContributableExtensionDescriptors() {
        return this.contributable.extensions;
    }

    getContributableExtensionDescriptor(id) {
        let result = null;
        this.getContributableExtensionDescriptors().some((descriptor) => {
            if (descriptor.id === id) {
                result = descriptor;
                return true;
            }
        });
        return result;
    }

    getContributingServiceDescriptors() {
        return this.contributes.services;
    }

    getContributingExtensionDescriptors() {
        return this.contributes.extensions;
    }

    getDependencyList() {
        const dependencies = this.dependencies;
        return Reflect.ownKeys(dependencies).map((name) => {
            return name + '@' + dependencies[name];
        });
    }

    hasPolicy(policy) {
        return this.policies.indexOf(policy) > -1;
    }

    hasState(state) {
        return (this.state & state) !== 0;
    }

    define(key, value) {
        super.define(key, value, {
            enumerable: true
        });
    }
}

export default Manifest;
