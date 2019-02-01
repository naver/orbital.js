/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import fs from 'fs';
import path from 'path';
import normalize from './normalize';
import rpt from 'read-package-tree';

class ManifestLoader {

    static discover(callback, config) {
        console.log('[ORBITAL] cjs: ManifestLoader > discover(callback, config)');
        rpt(config.discoverPath || './', function (err, data) {
            if (!data || !data.children) {
                console.log('[ORBITAL] ' + err);
            }
            data.children.filter((module) => {
                return Reflect.has(module.package, 'orbital');
            }).forEach((module) => {
                const pack = module.package;
                const base = module.realpath;
                const orb = normalize(pack.orbital);
                let modules = [];
                //modules.push(path.join(base, 'package.json'));
                if (orb.activator) {
                    modules.push(path.join(base, orb.activator));
                }
                orb.contributable.services.forEach((service) => {
                    modules.push(path.join(base, service['interface']));
                });
                orb.contributes.services.forEach((service) => {
                    modules.push(path.join(base, service['implement']));
                });
                orb.contributes.extensions.forEach((extension) => {
                    if (extension.module) {
                        modules.push(path.join(base, extension.module));
                    }
                });                
                //console.log('modules -> ', modules);

                console.log(`Current directory: ${process.cwd()}`);
                console.log('-------------------');
                modules.forEach((mod) => {
                    let p = mod;
                    //p = p.replace(/\\/g, '/');
                    //p = '../../../' + p;
                    console.log(p);
                    console.log(require(p));
                });
            });
        });
    }
}

export default ManifestLoader;
