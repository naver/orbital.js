import homeView from './views/homeView';
import layoutView from './views/layoutView';

class Activator {

    constructor() {
        this.routes = {};
        this.extRegisteredListener = this.handleExtensionRegistered.bind(this);
        this.extUnregisteredListener = this.handleExtensionUnregistered.bind(this);
        this.hashchangeListener = this.handleHashchange.bind(this);
        this.localeChangeListener = this.refreshAll.bind(this);
    }

    onStart(context) {
        this.context = context;
        this.root = document.getElementById('root');
        this.i18nManager = context.getService('orbital.i18n:manager');
        this.i18nAgent = this.i18nManager.createAgent(context.getPlugin().getId());
        this.i18nManager.on('localeChange', this.localeChangeListener);
        context.on('extensionRegistered', this.extRegisteredListener);
        context.on('extensionUnregistered', this.extUnregisteredListener);
        window.addEventListener('hashchange', this.hashchangeListener);
        this.refreshAll();
    }

    onStop(context) {
        this.root.innerHTML = '';
        this.i18nManager.off('localeChange', this.localeChangeListener);
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
            const {path} = registration.getMeta();
            this.routes[path] = registration;
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
            const {path} = registration.getMeta();
            delete this.routes[path];
            this.renderContents();
        }
    }

    handleHashchange() {
        this.renderContents();
    }

    refreshAll() {
        this.renderRoot();
        this.refreshHeader();
        this.refreshAside();
        this.renderContents();
    }

    refreshAside() {
        this.context.getExtensions('examples.shop.layout:aside')
            .then(extensions => {
                const aside = this.root.querySelector('aside');
                aside.innerHTML = '';
                extensions.forEach((ext) => {
                    const {module, registration} = ext;
                    const context = registration.getContributor();
                    const view = module.getView(context);
                    if (typeof view === 'string') {
                        aside.innerHTML += view;
                    } else {
                        aside.appendChild(view);
                    }
                });
            }).catch(e => console.error(e));
    }

    refreshHeader() {
        this.context.getExtensions('examples.shop.layout:header')
            .then(extensions => {
                const fragment = document.createDocumentFragment();
                extensions.forEach((ext) => {
                    const {module, registration} = ext;
                    const context = registration.getContributor();
                    const element = module.getView(context);
                    fragment.appendChild(element);
                });
                const header = this.root.querySelector('.utility');
                header.innerHTML = '';
                header.appendChild(fragment);
            }).catch(e => console.error(e));
    }

    renderContents() {
        const main = this.root.querySelector('main');
        const currentPath = location.hash.substr(1);
        const currentRoot = currentPath.split('/')[0];
        const routes = this.routes;
        const routeExists = Object.getOwnPropertyNames(routes).some((path) => {
            if (path === currentRoot) {
                const registration = routes[path];
                registration.getModule().then((module) => {
                    const element = module.getElement(
                        registration.getContributor(), currentPath);
                    if (typeof element === 'string') {
                        main.innerHTML = element;
                    } else {
                        main.innerHTML = '';
                        main.appendChild(element);
                    }
                }).catch(e => console.error(e));
                return true;
            }
        });
        if (!routeExists) {
            main.innerHTML = homeView;
        }
    }

    renderRoot() {
        this.root.innerHTML = this.translate(
            layoutView, this.i18nAgent.localize('head'));
    }

    translate(view, messageSet) {
        Reflect.ownKeys(messageSet).forEach((key) => {
            const regExp = new RegExp('{{' + key + '}}', 'g');
            view = view.replace(regExp, messageSet[key]);
        });
        return view;
    }
}

export default Activator;
