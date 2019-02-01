/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

export default {
    getView() {
        const view = `<a href='#settings'>Settings</a>`;
        return document.createRange().createContextualFragment(view);
    }
};
