function emitCartChange() {
    const container = document.querySelector('#cart');
    const ev = document.createEvent('Event');
    ev.initEvent('cartChange', true, true);
    container.dispatchEvent(ev);
}

export default emitCartChange;
