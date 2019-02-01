/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import orbitalConfig from '../system/bases/orbitalConfig';
import Installer from '../system/launch/Installer';
import ManifestLoader from './ManifestLoader';

function normalize(manifests) {
    manifests.forEach((manifest) => {
        const {dependencies} = manifest;
        Object.getOwnPropertyNames(dependencies).forEach((name) => {
            const version = dependencies[name];
            const exists = manifests.some((m) => {
                return m.name === name && m.version === version;
            });
            if (!exists) {
                delete dependencies[name];
            }
            delete dependencies[manifest.name];
        });
    });
}

class Starter {

    /**
     * Starts the platform and sets it up
     * to run a single application.
     */
    static startup(callback, config) {
        this.resolved = callback;
        this.loadPlugins(config);
    }

    /**
     * 1) Discover manifests
     */
    static loadPlugins(config) {
        ManifestLoader.discover((manifests, cfg) => {
            Object.getOwnPropertyNames(cfg).forEach((prop) => {
                orbitalConfig[prop] = cfg[prop];
            });
            normalize(manifests);
            this.installPlugins(manifests);
        }, config);
    }

    /**
     * 2) Install plugins
     *
     * Installs each plugin if it has no problem.
     * If some plugins meet error, the framework will
     * warn the reason and continue next plugins.
     */
    static installPlugins(manifests) {
        Installer.install(manifests, (installedPlugins) => {
            this.startPlugins(installedPlugins);
        });
    }

    /**
     * 3) Start system plugin
     * 4) Start initial plugins
     */
    static startPlugins(installedPlugins) {
        console.info('installedPlugins', installedPlugins);
        //TODO start system first
        //TODO start by dependency through event
        installedPlugins.forEach((plugin) => {
            plugin.start();
        });
    }
}

export default Starter;
