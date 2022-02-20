function esDefault(mod) {
    let result = mod;
    if (Reflect.has(mod, '__esModule')
            && Reflect.has(mod, 'default')) {
        result = mod['default'];
    }
    return result;
}

export default esDefault;
