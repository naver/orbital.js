import {ILogWriter} from 'orbital.core.types';
import {argsToString} from '../../array';
import {format as stringFormat, strpad} from '../../string';
import WEB_LOG_COLOR from './WEB_LOG_COLOR';

const NL = '\n';
const act: any = {
    debug: console.info,
    emphasize: console.log,
    error: console.error,
    info: console.info,
    log: console.log,
    trace: console.info,
    undefined: console.log,
    warn: console.warn
};
let prompt: string = '[ORBITAL]';

function dateFormat(d: Date) {
    return '['
        + strpad(d.getHours(), 2, '0') + ':'
        + strpad(d.getMinutes(), 2, '0') + ':'
        + strpad(d.getSeconds(), 2, '0') + ' '
        + strpad(d.getMilliseconds(), 3, '0')
        + ']';
}

function write(type: string, date: Date, args: any[], useNL: boolean = true) {
    if (!args.length) {
        return;
    }
    let result = [prompt, dateFormat(date)].concat(args);
    if (useNL) {
        result.push(NL);
    }
    if (type) {
        result[0] = '%c' + result[0];
        result = [result.join(' ')];
        result.push('color:' + WEB_LOG_COLOR[type]);
    } else {
        type = 'log';
    }
    act[type].apply(console, result);
}

const writer: ILogWriter = {
    err(date: Date, args: any[]) {
        args.some((arr, i) => {
            if (arr instanceof Error && arr.stack) {
                args[i] = arr.stack;
                return true;
            }
            return false;
        });
        write('error', date, args);
    },
    nl() {
        console.info(NL);
    },
    out(type: string, date: Date, args: any[]) {
        write(type, date, args);
    },
    setPropmt(p: string) {
        prompt = p;
    },
    spin(date: Date, args: any[]) {
        // TODO
    },
    trace(date: Date, args: any[]) {
        args[3] = argsToString(args[3]);
        if (args[4]) {
            args[4] = JSON.stringify(args[4]);
        }
        write('trace', date, [stringFormat(...args)]);
    },
    update(date: Date, args: any[]) {
        write('update', date, args);
    }
};

export default writer;
