import {stringify} from '../object';

export default function argToString(arg: any, quote: boolean = true) {
    const type = typeof arg;
    if (type === 'object') {
        return stringify(arg);
    } else if (type === 'function') {
        return `<Function>(${arg.name || 'anonymous'})`;
    } else if (type === 'string') {
        return quote ? `'${arg}'` : arg;
    }
    return arg;
}
