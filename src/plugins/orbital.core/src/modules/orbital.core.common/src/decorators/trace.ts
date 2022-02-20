import {traceMethod} from '../logger';

export default function trace(T: any, method: string, desc: PropertyDescriptor) {
    return {
        value(...params: any[]) {
            traceMethod(this, method, params);
            const result = desc.value.apply(this, params);
            traceMethod(this, method, params, result, true);
            return result;
        }
    };
}
