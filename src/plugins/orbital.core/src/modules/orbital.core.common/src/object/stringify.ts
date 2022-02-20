import {IKeyValue} from 'orbital.core.types';

const regQuote = /\"/g;
const regProp = /\"(\w+)\":/g;

function singleQuote(obj: object) {
    return JSON.stringify(obj)
        .replace(regProp, '$1:')
        .replace(regQuote, '\'');
}

export default function stringify(arg: IKeyValue) {
    if (!arg || typeof arg !== 'object') {
        return arg;
    }
    if (arg.constructor.name === 'Object') {
        try {
            return singleQuote(arg);
        } catch (e) {
            const simplified = Object.getOwnPropertyNames(arg)
                .reduce((accumulator: IKeyValue, propKey) => {
                    accumulator[propKey] = arg[propKey] + '';
                    return accumulator;
                }, {});
            return singleQuote(simplified);
        }
    }
    const toString = arg.toString();
    if (toString === '[object Object]') {
        return `<${arg.constructor.name}>`;
    }
    return toString;
}
