import asideView from '../views/asideView';

export default {
    getView(productsContext) {
        const api = productsContext.getService('examples.shop.resources:api');
        const items = api.getProductCategories().map((name) => {
            return `<li><a href='#products/${name}'>${name}</a></li>`;
        });
        return asideView.replace('{ITEMS}', items.join('\n'));
    }
};
