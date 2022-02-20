export default {
    getView() {
        const view = `<a href='#settings'>Settings</a>`;
        return document.createRange().createContextualFragment(view);
    }
};
