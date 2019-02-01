/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import css from '../views/css/header.css';
import headerView from '../views/headerView';

function addListener(fragment, api) {
    const container = fragment.querySelector('#cart');
    container.addEventListener('cartChange', () => {
        refresh(container, api);
    });
}

function refresh(container, api) {
    let badge = '';
    const products = api.getCart();
    if (products.length) {
        badge = `<span class='${css.badge}'>${products.length}</span>`;
    }
    container.innerHTML = `<a href='#cart'>Cart${badge}</a>`;
}

export default {
    getView(cartContext) {
        const api = cartContext.getService('examples.shop.resources:api');
        const fragment = document.createRange().createContextualFragment(headerView);
        const container = fragment.querySelector('#cart');
        addListener(fragment, api);
        refresh(container, api);
        return fragment;
    }
};
