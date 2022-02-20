function nextTick(fn: () => void) {
    setTimeout(fn, 0);
}

export default nextTick;
