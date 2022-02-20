import {
    ContributionRole,
    IContributableDefinition,
    IContributableExtension,
    IContributablePermissionDefinition,
    IContributableService,
    IOrbitalMeta,
    IOrbitalPackageJson
} from 'orbital.core.types';
import {merge} from '../object';

const DEFAULT_BUNDLE_PATH = './dist';
const DEFAULT_TARGET = 'node';
const DEFAULT_NODE_BUNDLER = 'rollup';
const DEFAULT_UMD_BUNDLER = 'webpack';
const DEFAULT_WEB_BUNDLER = 'webpack';
const DEFAULT_NODE_FORMAT = 'cjs';
const DEFAULT_UMD_FORMAT = 'umd';
const DEFAULT_WEB_FORMAT = 'amd';

/*
 This just normalizes IOrbitalPackageJson.
 Validation of it's values will be proceed with IPackage.validate().
 1) default target is 'node'.
 2) without bundle field,
 'web' target assumes source modules are 'amd'.
 'node' target assumes source modules are 'commonjs'.
 target is set to both, assumes source modules are 'umd'.
*/

function normalizeContributableExtensions(extensions: IContributableExtension[]) {
    extensions = extensions.map((extension) => {
        normalizePermission(extension);
        return extension;
    });
}

function normalizeContributableServices(services: IContributableService[]) {
    services = services.map((service) => {
        if (typeof service.async !== 'boolean') {
            service.async = false;
        }
        if (typeof service.tolerant !== 'boolean') {
            service.tolerant = false;
        }
        normalizePermission(service);
        return service;
    });
}

function normalizeContributionRole(orbitalMeta: IOrbitalMeta, role: ContributionRole) {
    if (typeof orbitalMeta[role] === 'object') {
        if (!orbitalMeta[role].extensions) {
            orbitalMeta[role].extensions = [];
        }
        if (!orbitalMeta[role].services) {
            orbitalMeta[role].services = [];
        }
    } else {
        orbitalMeta[role] = {
            extensions: [],
            services: []
        };
    }
}

function normalizePermission(definition: IContributableDefinition) {
    const defaultPermission: IContributablePermissionDefinition = {
        call: {
            allow: 'all',
            deny: 'none'
        },
        realize: {
            allow: 'all',
            deny: 'none'
        }
    };
    const {permission} = definition;
    if (permission) {
        if (typeof permission === 'object') {
            definition.permission = merge(defaultPermission, permission);
        }
    } else {
        definition.permission = defaultPermission;
    }
}

function normalizeTarget(orbitalMeta: IOrbitalMeta) {
    if (!orbitalMeta.target) {
        orbitalMeta.target = [DEFAULT_TARGET];
    } else if (typeof orbitalMeta.target === 'string') {
        if (orbitalMeta.target === 'node'
            || orbitalMeta.target === 'web') {
            orbitalMeta.target = [orbitalMeta.target];
        }
    }
}

function normalizeBundle(orbitalMeta: IOrbitalMeta) {
    const targetIsWeb = orbitalMeta.target.indexOf('web') > -1;
    const targetIsNode = orbitalMeta.target.indexOf('node') > -1;
    if (!orbitalMeta.bundle) {
        return;
    }
    if (targetIsWeb && targetIsNode) {
        if (orbitalMeta.bundle === true) {
            orbitalMeta.bundle = {
                bundler: DEFAULT_UMD_BUNDLER,
                format: DEFAULT_UMD_FORMAT,
                path: DEFAULT_BUNDLE_PATH
            };
        } else if (typeof orbitalMeta.bundle === 'object') {
            if (!orbitalMeta.bundle.bundler) {
                orbitalMeta.bundle.bundler = DEFAULT_UMD_BUNDLER;
            }
            if (!orbitalMeta.bundle.format) {
                orbitalMeta.bundle.format = DEFAULT_UMD_FORMAT;
            }
        }
    } else if (targetIsWeb) {
        if (orbitalMeta.bundle === true) {
            orbitalMeta.bundle = {
                bundler: DEFAULT_WEB_BUNDLER,
                format: DEFAULT_WEB_FORMAT,
                path: DEFAULT_BUNDLE_PATH
            };
        } else if (typeof orbitalMeta.bundle === 'object') {
            if (!orbitalMeta.bundle.bundler) {
                orbitalMeta.bundle.bundler = DEFAULT_WEB_BUNDLER;
            }
            if (!orbitalMeta.bundle.format) {
                orbitalMeta.bundle.format = DEFAULT_WEB_FORMAT;
            }
        }
    } else if (targetIsNode) {
        if (orbitalMeta.bundle === true) {
            orbitalMeta.bundle = {
                bundler: DEFAULT_NODE_BUNDLER,
                format: DEFAULT_NODE_FORMAT,
                path: DEFAULT_BUNDLE_PATH
            };
        } else if (typeof orbitalMeta.bundle === 'object') {
            if (!orbitalMeta.bundle.bundler) {
                orbitalMeta.bundle.bundler = DEFAULT_NODE_BUNDLER;
            }
            if (!orbitalMeta.bundle.format) {
                orbitalMeta.bundle.format = DEFAULT_NODE_FORMAT;
            }
        }
    }
    if (typeof orbitalMeta.bundle === 'object' && !orbitalMeta.bundle.path) {
        orbitalMeta.bundle.path = DEFAULT_BUNDLE_PATH;
    }
}

export default function normalizeOrbitalPackageJson(packageJson0: any): IOrbitalPackageJson {
    const packageJson = JSON.parse(JSON.stringify(packageJson0));
    const orbitalMeta = packageJson.orbital;
    if (typeof orbitalMeta !== 'object') {
        throw new Error(
            `Field name 'orbital' is not found in the package.json`);
    }
    if (typeof packageJson.dependencies !== 'object') {
        packageJson.dependencies = {};
    }
    if (!orbitalMeta.policies) {
        orbitalMeta.policies = [];
    }
    normalizeContributionRole(orbitalMeta, ContributionRole.CONTRIBUTABLE);
    normalizeContributionRole(orbitalMeta, ContributionRole.CONTRIBUTES);
    normalizeTarget(orbitalMeta);
    normalizeBundle(orbitalMeta);
    normalizeContributableExtensions(orbitalMeta.contributable.extensions);
    normalizeContributableServices(orbitalMeta.contributable.services);
    return packageJson;
}
