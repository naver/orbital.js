import {IKeyValue} from 'orbital.core.types';

export default function deepFreeze(target: IKeyValue) {
    Object.getOwnPropertyNames(target).forEach((key) => {
        if (target[key] && typeof target[key] === 'object') {
            deepFreeze(target[key]);
        }
    });
    Object.freeze(target);
}
