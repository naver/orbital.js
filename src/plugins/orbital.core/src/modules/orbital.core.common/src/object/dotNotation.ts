/* eslint no-undefined: 0 */

function dotNotation(obj, accessor) {
    const arr = accessor.split('.');
    const lastIndex = arr.length - 1;
    return arr.reduce((acc, val, i) => {
        const nextAccum = acc[val];
        if (nextAccum === undefined) {
            if (lastIndex === i) {
                return undefined;
            }
            return {};
        }
        return nextAccum;
    }, obj);
}

export default dotNotation;
