/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import headerView from '../views/headerView';

function addListener(fragment, api) {
    const container = fragment.querySelector('#account');
    container.addEventListener('accountChange', () => {
        refresh(container, api);
    });
}

function refresh(container, api) {
    const account = api.getAccount();
    const state = account.loggedIn
        ? `<a href=''>Logout</a>`
        : `<a href='#login'>Login</a>`;
    container.innerHTML = state;
}

export default {
    getView(accountContext) {
        const api = accountContext.getService('examples.shop.resources:api');
        const fragment = document.createRange().createContextualFragment(headerView);
        const container = fragment.querySelector('#account');
        addListener(fragment, api);
        refresh(container, api);
        return fragment;
    }
};
