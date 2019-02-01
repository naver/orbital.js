/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import {cartView} from '../views/contentsView';
import css from '../views/css/contents.css';
import emitCartChange from './emitCartChange';

function addListener(api, fragment) {
    const ul = fragment.querySelector('ul');
    ul.addEventListener('click', (event) => {
        if (event.target.className === 'remove') {
            api.deleteFromCart(event.target.dataset.id);
            emitCartChange();
        }
    });
    const container = document.querySelector('#cart');
    container.addEventListener('cartChange', () => {
        refresh(api);
    });
}

function refresh(api) {
    const cartPane = document.querySelector('#cartPane');
    if (cartPane) {
        const newCartPane = getCartFragment(api);
        cartPane.parentNode.replaceChild(newCartPane, cartPane);
    }
}

function getCartFragment(api) {
    if (!api.getAccount().loggedIn) {
        window.alert('please login');
        history.back();
    }
    const items = api.getCart().map((id) => {
        const product = api.getProductById(id);
        return `
            <li>
                <img src='${product.img}' />
                <div class='${css.info}'>
                    <div class='${css.name}'>${product.name}</div>
                    <div class='${css.price}'>$${product.price}</div>
                </div>
                <div class='${css.utility}'>
                    <button class='remove' data-id='${product.id}'>
                        remove
                    </button>
                </div>
            </li>
        `;
    });

    const html = cartView.replace('{ITEMS}', items.join('\n') || 'Cart is empty');
    const fragment = document.createRange().createContextualFragment(html);
    addListener(api, fragment);
    return fragment;
}

export default {

    path: 'cart',

    getElement(cartContext) {
        const api = cartContext.getService('examples.shop.resources:api');
        return getCartFragment(api);
    }
};
