/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import css from './css/settingsContentsView.css';

const settingsContentsView = `
    <div id='settingsPane' class='${css.settings}'>
        <h1>&#x1f4e6; Installed Packages</h1>
        <table>{ROWS}</table>
    </div>
`;

export default settingsContentsView;
