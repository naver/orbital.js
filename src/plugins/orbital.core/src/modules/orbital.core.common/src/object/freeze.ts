import {IKeyValue} from 'orbital.core.types';

export default function freeze(target: IKeyValue, props: string[], isSeal: boolean = true) {
    const properties: IKeyValue = {};
    props.forEach((prop: string) => {
        properties[prop] = {
            configurable: false,
            enumerable: false,
            value: target[prop],
            writable: false
        };
    });
    Object.defineProperties(target, properties);
    if (isSeal) {
        Object.seal(target);
    }
}
