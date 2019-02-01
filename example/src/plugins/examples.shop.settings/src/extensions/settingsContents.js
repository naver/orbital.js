/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import meta from '../../package.json';
import settingsContentsView from '../views/settingsContentsView';
import css from '../views/css/settingsContentsView.css';

const STATE = {
    1: 'uninstalled',
    [1 << 1]: 'installed',
    [1 << 2]: 'resolved',
    [1 << 3]: 'starting',
    [1 << 4]: 'active',
    [1 << 5]: 'stopping'
};

const ACTION = {
    1: '',
    [1 << 1]: 'Enable',
    [1 << 2]: 'Enable',
    [1 << 3]: '',
    [1 << 4]: 'Disable',
    [1 << 5]: ''
};

const ICON = {
    Enable: '&#9658;',
    Disable: '&#10073;&#10073;'
};

function addListener(fragment, context) {
    const settingsPane = fragment.querySelector('#settingsPane');
    settingsPane.addEventListener('click', (event) => {
        if (event.target.className.indexOf(css.state) > -1) {
            const plugin = context.getPluginById(event.target.dataset.id);
            const action = ACTION[plugin.getState()];
            if (action === 'Disable') {
                plugin.stop();
            } else if (action === 'Enable') {
                plugin.start({contributors: 'active'});
            }
        }
    });
}

export function getSettingsFragment(settingsContext) {
    const api = settingsContext.getService('examples.shop.resources:api');
    if (!api.getAccount().loggedIn) {
        //window.alert('please login');
        //history.back();
    }
    const plugins = settingsContext.getPlugins();
    const rows = plugins.map((plugin) => {
        const stateCode = plugin.getState();
        const action = ACTION[stateCode];
        const state = STATE[stateCode];
        return `
            <tr>
                <td>
                    <span class='${css.name}'>${plugin.getName()}</span>
                    <span class='${css.version}'>${plugin.getVersion()}</span>
                    <span class='${css.state}'>${state}</span>
                    <br />
                    <div class='${css.desc}'>
                        ${plugin.getManifest().description}
                    </div>
                </td>
                <td>
                    <button data-id='${plugin.getId()}' class='${css.state} ${css[action]}'>
                        ${ICON[action]} ${action}
                    </button>
                </td>
            </tr>
        `;
    });
    const html = settingsContentsView.replace('{ROWS}', rows.join('\n'));
    const fragment = document.createRange().createContextualFragment(html);
    addListener(fragment, settingsContext);
    return fragment;
}

export default {

    path: 'settings',

    getElement(settingsContext) {
        return getSettingsFragment(settingsContext);
    }
};
