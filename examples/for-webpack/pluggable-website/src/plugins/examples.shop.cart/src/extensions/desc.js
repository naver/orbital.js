import css from '../views/css/desc.css';
import emitCartChange from './emitCartChange';

function addListener(fragment, api) {
    const button = fragment.querySelector('button');
    button.addEventListener('click', (event) => {
        const account = api.getAccount();
        if (account.loggedIn) {
            api.postToCart(event.target.dataset.id);
            emitCartChange();
        } else {
            window.alert('please login');
        }
    });
}

export default {
    getView(cartContext, product) {
        const api = cartContext.getService('examples.shop.resources:api');
        const html = `
            <button class='${css.cart}' data-id='${product.id}'>
                Add To Cart
            </button>
        `;
        const fragment = document.createRange().createContextualFragment(html);
        addListener(fragment, api);
        return fragment;
    }
};
