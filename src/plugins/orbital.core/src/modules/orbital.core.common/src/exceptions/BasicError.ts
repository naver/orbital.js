import {IOrbitalError} from 'orbital.core.types';
import {format as stringFormat} from '../string';

class BasicError extends Error implements IOrbitalError {

    code: number = 0;
    type: string = '';

    constructor(...args: any[]) {
        super(...args);
        this.message = stringFormat(...args);
    }
}

export default BasicError;
