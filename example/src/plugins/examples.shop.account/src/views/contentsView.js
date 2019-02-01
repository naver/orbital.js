/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import css from './css/contents.css';

export const loginForm = `
    <div class='${css.login}'>
        <h1>Login</h1>
        <form>
            ID <input type='text' name='id' value='flower' />
            PW <input type='text' name='pw' value='1234' />
            <input type='submit' value='login' >
        </form>
    </div>
`;

export const loggedIn = `
    <div class='${css.login}'>
        <h1>Login</h1>
        <div>
            {ID} already logged in
        </div>
    </div>
`;
