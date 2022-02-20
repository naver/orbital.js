import {IRuntimeCallback, IRuntimeProjectConfig} from 'orbital.core.types';
import Starter from './runtime/Starter';

function orbital(callback: IRuntimeCallback, runtimeConfig: IRuntimeProjectConfig = {}) {
    const starter = new Starter(callback, runtimeConfig);
    starter.startup();
}

export default orbital;
