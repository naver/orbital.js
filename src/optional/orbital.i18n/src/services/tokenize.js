function tokenize(str) {
    if (!str) {
        throw new Error(
            'tokenize function requires a string');
    }
    let old = null;
    let now = null;
    let string = [];
    let variable = [];
    let isVar = false;
    const len = str.length;
    const tokens = [];
    for (let i = 0; i < len; i++) {
        now = str[i];
        if (old === '{' && now === '{') {
            if (string.length) {
                tokens.push({
                    type: 'string',
                    value: string.join('')
                });
            }
            isVar = true;
            variable = [];
        } else if (old === '}' && now === '}') {
            if (variable.length) {
                tokens.push({
                    type: 'variable',
                    value: variable.join('')
                });
            }
            isVar = false;
            string = [];
        } else if (now !== '{' && now !== '}') {
            if (isVar) {
                variable.push(now);
            } else {
                string.push(now);
            }
        }
        old = now;
    }
    if (isVar) {
        tokens.push({
            type: 'variable',
            value: variable.join('')
        });
    } else {
        tokens.push({
            type: 'string',
            value: string.join('')
        });
    }
    return tokens;
}

export default tokenize;
