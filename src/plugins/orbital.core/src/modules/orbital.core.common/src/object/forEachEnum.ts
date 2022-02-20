import {IEnum} from 'orbital.core.types';

export default function forEachEnum(enumLike: any, iteratee: (value: string | number, key: string) => void) {
    for (const KEY in enumLike as IEnum) {
        if (typeof KEY === 'string') {
            iteratee((enumLike as any)[KEY], KEY);
        }
    }
}
