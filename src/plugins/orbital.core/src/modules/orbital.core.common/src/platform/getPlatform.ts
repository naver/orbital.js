import {IPlatform} from 'orbital.core.types';

function getPlatform(): IPlatform {
    if (typeof process === 'object') {
        if ((process as any).browser) {
            return 'webpack';
        }
        return 'node';
    } else if (window) {
        return 'web';
    }
    return 'unknown';
}

export default getPlatform;
