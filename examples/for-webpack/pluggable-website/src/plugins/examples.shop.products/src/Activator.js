import {getProducts} from './extensions/contents';

class Activator {

    constructor() {
        this.extRegisteredListener = this.handleExtensionRegistered.bind(this);
        this.extUnregisteredListener = this.handleExtensionUnregistered.bind(this);
    }

    onStart(context) {
        this.context = context;
        context.on('extensionRegistered', this.extRegisteredListener);
        context.on('extensionUnregistered', this.extUnregisteredListener);
    }

    onStop(context) {
        context.off('extensionRegistered', this.extRegisteredListener);
        context.off('extensionUnregistered', this.extUnregisteredListener);
    }

    handleExtensionRegistered(registration) {
        if (registration.getExtensionId() === 'examples.shop.products:desc') {
            this.refresh();
        }
    }

    handleExtensionUnregistered(registration) {
        if (registration.getExtensionId() === 'examples.shop.products:desc') {
            this.refresh();
        }
    }

    refresh() {
        const path = location.hash.substr(1);
        const productsUL = document.querySelector('#products');
        if (productsUL) {
            const newProductsUL = getProducts(this.context, path);
            productsUL.parentNode.replaceChild(newProductsUL, productsUL);
        }
    }
}

export default Activator;
