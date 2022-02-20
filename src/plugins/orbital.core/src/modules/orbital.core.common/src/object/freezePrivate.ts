import {IKeyValue} from 'orbital.core.types';

export default function freezePrivate(target: IKeyValue, isSeal: boolean = true) {
    const properties: IKeyValue = {};
    Object.getOwnPropertyNames(target).forEach((prop) => {
        const descriptor = Object.getOwnPropertyDescriptor(target, prop) as PropertyDescriptor;
        if (descriptor.writable && prop.startsWith('_')) {
            properties[prop] = {
                configurable: false,
                enumerable: false,
                value: target[prop],
                writable: false
            };
        }
    });
    Object.defineProperties(target, properties);
    if (isSeal) {
        Object.seal(target);
    }
}
