function objectify(path, value) {
    if (typeof path !== 'string') {return value;}
    const tokens = path.split('/').reverse();
    return tokens.reduce((prev, cur) => {
        const o = {};
        o[cur] = prev;
        return o;
    }, value);
}

export default objectify;
