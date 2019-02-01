/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import css from './css/layout.css';

const layoutView = `
    <div class='${css.page}'>
        <header>
            <a href='/#'>abc shop</a>
            <div class='${css.desc}'>
                pluggable web example
            </div>
            <div class='utility'></div>
        </header>
        <aside></aside>
        <main></main>
    </div>
`;

export default layoutView;
