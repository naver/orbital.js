/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import css from './css/contents.css';

export const cartView = `
    <div id='cartPane' class='${css.cart}'>
        <h1>Cart</h1>
        <ul>{ITEMS}</ul>
    </div>
`;
