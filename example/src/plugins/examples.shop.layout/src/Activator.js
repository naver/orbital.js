/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import homeView from './views/homeView';
import layoutView from './views/layoutView';

class Activator {

    constructor() {
        this.routes = {};
        this.extRegisteredListener = this.handleExtensionRegistered.bind(this);
        this.extUnregisteredListener = this.handleExtensionUnregistered.bind(this);
        this.hashchangeListener = this.handleHashchange.bind(this);
    }

    onStart(context) {
        this.context = context;
        this.root = document.getElementById('root');
        this.root.innerHTML = layoutView;
        context.on('extensionRegistered', this.extRegisteredListener);
        context.on('extensionUnregistered', this.extUnregisteredListener);
        window.addEventListener('hashchange', this.hashchangeListener);
    }

    onStop(context) {
        this.root.innerHTML = '';
        context.off('extensionRegistered', this.extRegisteredListener);
        context.off('extensionUnregistered', this.extUnregisteredListener);
        window.removeEventListener('hashchange', this.hashchangeListener);
    }

    handleExtensionRegistered(registration) {
        if (registration.getExtensionId() === 'examples.shop.layout:header') {
            this.refreshHeader();
        }
        if (registration.getExtensionId() === 'examples.shop.layout:aside') {
            this.refreshAside();
        }
        if (registration.getExtensionId() === 'examples.shop.layout:contents') {
            const module = registration.getModule(true);
            this.routes[module.path] = registration;
            this.renderContents();
        }
    }

    handleExtensionUnregistered(registration) {
        if (registration.getExtensionId() === 'examples.shop.layout:header') {
            this.refreshHeader();
        }
        if (registration.getExtensionId() === 'examples.shop.layout:aside') {
            this.refreshAside();
        }
        if (registration.getExtensionId() === 'examples.shop.layout:contents') {
            const module = registration.getModule(true);
            delete this.routes[module.path];
            this.renderContents();
        }
    }

    handleHashchange() {
        this.renderContents();
    }

    refreshAside() {
        const contributions = [];
        this.context.getExtensionRegistrations('examples.shop.layout:aside')
            .forEach((reg) => {
                const mod = reg.getModule(true);
                contributions.push(mod.getView(reg.getContributor()));
            });
        const aside = this.root.querySelector('aside');
        aside.innerHTML = contributions.join('\n');
    }

    refreshHeader() {
        const header = this.root.querySelector('.utility');
        header.innerHTML = '';
        this.context.getExtensionRegistrations('examples.shop.layout:header')
            .forEach((reg) => {
                const mod = reg.getModule(true);
                const element = mod.getView(reg.getContributor());
                header.appendChild(element);
            });
    }

    renderContents() {
        const main = this.root.querySelector('main');
        const currentPath = location.hash.substr(1);
        const currentRoot = currentPath.split('/')[0];
        const routes = this.routes;
        const routeExists = Object.getOwnPropertyNames(routes).some((path) => {
            if (path === currentRoot) {
                const registration = routes[path];
                const module = registration.getModule(true);
                const element = module.getElement(registration.getContributor(), currentPath);
                if (typeof element === 'string') {
                    main.innerHTML = element;
                } else {
                    main.innerHTML = '';
                    main.appendChild(element);
                }
                return true;
            }
            return false;
        });
        if (!routeExists) {
            main.innerHTML = homeView;
        }
    }
}

export default Activator;
