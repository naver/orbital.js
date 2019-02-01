/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import sample from './sample';

class RestApi {

    constructor() {
        this.account = {
            loggedIn: false
        };
        this.cart = [];
    }

    deleteFromCart(id) {
        const index = this.cart.indexOf(id);
        if (index > -1) {
            this.cart.splice(index, 1);
        }
    }

    getAccount() {
        return this.account;
    }

    getCart() {
        return this.cart.slice();
    }

    getProductById(id) {
        const products = sample.products.filter((product) => {
            return product.id === id;
        });
        return products[0];
    }

    getProductCategories() {
        return sample.productCategories;
    }

    getProducts(category) {
        return sample.products.filter((product) => {
            return product.category === category;
        });
    }

    postToCart(id) {
        if (this.cart.indexOf(id) === -1) {
            this.cart.push(id);
        }
    }

    postLogin(id, pw, callback) {
        if (id === 'flower' && pw === '1234') {
            this.account = {
                id,
                loggedIn: true
            };
            callback(this.account);
        } else {
            callback(false);
        }
    }

    postLogout() {
        this.account = {
            loggedIn: false
        };
    }
}

export default RestApi;
