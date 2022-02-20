import {ILogWriter} from 'orbital.core.types';
import {argsToString, argToString} from '../../array';
import {nodeReq} from '../../platform';
import {format as stringFormat, strpad} from '../../string';
import NODE_LOG_COLOR from './NODE_LOG_COLOR';

const NL = '\n';
const TAB = '         ';
let prompt: string = '';
let spinner: any = null;

function dateFormat(d: Date) {
    const chalk = nodeReq('chalk');
    const time = chalk.gray(
        strpad(d.getHours(), 2, '0') + ':'
        + strpad(d.getMinutes(), 2, '0') + ':'
        + strpad(d.getSeconds(), 2, '0') + ' '
        + strpad(d.getMilliseconds(), 3, '0')
    );
    return chalk.white('[') + time + chalk.white(']');
}

function logFormat(type: string, date: Date, args: any[], useNL: boolean = true): string {
    const chalk = nodeReq('chalk');
    const out = [];
    out.push(prompt || getPrompt());
    out.push(dateFormat(date));
    let str;
    if (args[args.length - 1] === '%f') {
        args.pop();
        for (let i = 1; i < args.length; i++) {
            args[i] = argToString(args[i], false);
        }
        str = stringFormat(...args);
    } else {
        str = args.join(' ');
    }
    out.push(type ? chalk[NODE_LOG_COLOR[type]](str) : str);
    if (useNL) {
        out.push(NL);
    }
    return out.join(' ');
}

function getPrompt() {
    const chalk = nodeReq('chalk');
    prompt = chalk.cyan('ORBITAL');
    return prompt;
}

function trimStack(stack: string) {
    const stacks = stack.split(NL);
    const lines = stacks.map((line) => {
        return TAB + line.trim();
    });
    return NL + lines.join(NL);
}

const writer: ILogWriter = {
    err(date: Date, args: any[]) {
        args.some((arr, i) => {
            if (arr instanceof Error && arr.stack) {
                args[i] = trimStack(arr.stack);
                return true;
            }
            return false;
        });
        if (args.length) {
            process.stderr.write(logFormat('error', date, args));
        }
    },
    nl() {
        process.stdout.write(NL);
    },
    out(type: string, date: Date, args: any[]) {
        if (args.length) {
            process.stdout.write(logFormat(type, date, args));
        }
    },
    setPropmt(p: string) {
        prompt = p;
    },
    spin(date: Date, args: any[]) {
        const arg0 = args[0];
        if (arg0 === 'start') {
            const {Spinner} = nodeReq('cli-spinner');
            const msg = logFormat('spin', date, [args[1], '%s'], false);
            spinner = new Spinner(msg);
            spinner.start();
        } else if (arg0 === 'stop') {
            spinner.stop(true);
            if (args[1]) {
                this.out('info', date, [args[1]]);
            }
        }
    },
    trace(date: Date, args: any[]) {
        args[3] = argsToString(args[3]);
        if (args[4] && typeof args[4] === 'object') {
            args[4] = args[4].toString();
        }
        this.out('trace', date, [stringFormat(...args)]);
    },
    update(date: Date, args: any[]) {
        const stdout = process.stdout;
        const readline = nodeReq('readline');
        readline.clearLine(stdout, 1);
        readline.cursorTo(stdout, 0, null);
        stdout.write(logFormat('update', date, args, false));
    }
};

export default writer;
