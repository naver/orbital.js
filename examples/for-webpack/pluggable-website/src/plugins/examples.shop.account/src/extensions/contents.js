import {loggedIn, loginForm} from '../views/contentsView';

function addListener(fragment, api) {
    const form = fragment.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = form.elements.id.value;
        const pw = form.elements.pw.value;
        api.postLogin(id, pw, (account) => {
            if (account) {
                const container = document.querySelector('#account');
                const ev = document.createEvent('Event');
                ev.initEvent('accountChange', true, true);
                container.dispatchEvent(ev);
                history.back();
            } else {
                window.alert('login failed');
            }
        });
    });
}

export default {
    getElement(accountContext) {
        const api = accountContext.getService('examples.shop.resources:api');
        const account = api.getAccount();
        if (account.loggedIn) {
            return loggedIn.replace('{ID}', account.id);
        }
        const fragment = document.createRange().createContextualFragment(loginForm);
        addListener(fragment, api);
        return fragment;
    }
};
