/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import contentsView from '../views/contentsView';

export default {

    path: 'support',

    getElement(layoutContext, path) {
        return contentsView;
    }
};
