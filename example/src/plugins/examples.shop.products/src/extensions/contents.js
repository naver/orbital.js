/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import {productsView} from '../views/contentsView';
import css from '../views/css/contents.css';

function applyExtensions(productsContext, product, li) {
    const info = li.querySelector(`.${css.info}`);
    productsContext.getExtensionRegistrations('examples.shop.products:desc')
        .forEach((reg) => {
            const module = reg.getModule(true);
            const context = reg.getContributor();
            info.appendChild(module.getView(context, product));
        });
}

function fragment(html) {
    return document.createRange().createContextualFragment(html);
}

export function getProducts(productsContext, path) {
    const api = productsContext.getService('examples.shop.resources:api');
    const category = path.split('/')[1];
    const productsUL = fragment(productsView).querySelector('ul');
    api.getProducts(category).forEach((product) => {
        const html = `
            <li>
                <img src='${product.img}' />
                <div class='${css.info}'>
                    <span class='${css.name}'>${product.name}</span>
                    <span class='${css.price}'>$${product.price}</span>
                </div>
            </li>
        `;
        const li = fragment(html).querySelector('li');
        applyExtensions(productsContext, product, li);
        productsUL.appendChild(li);
    });
    return productsUL;
}

export default {

    path: 'products',

    getElement(productsContext, path) {
        return getProducts(productsContext, path);
    }
};
