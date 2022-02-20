import argToString from './argToString';

export default function argsToString(params: any[]): string {
    if (!Array.isArray(params)) {
        return '';
    }
    return params.map((arg) => {
        return argToString(arg);
    }).join(', ');
}
