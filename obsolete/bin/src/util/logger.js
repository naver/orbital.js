import chalk from 'chalk';
import readline from 'readline';

if (!process.stderr.isTTY) {
    chalk.enabled = false;
}

const prefix = chalk.green.bold('ORBITAL');
const arrow = chalk.white('>');
const nl = '\n';

const style = {
    error: chalk.red,
    info: chalk.greenBright,
    warn: chalk.yellowBright
};

function format(args, useNl) {
    args.unshift(arrow);
    args.unshift(prefix);
    if (useNl) {args.push(nl);}
}

function out(arrs, type, useNl = true) {
    const args = ([]).slice.call(arrs);
    if (args.length) {
        format(args, useNl);
        const str = args.join(' ');
        const res = type ? style[type](str) : str;
        process.stdout.write(res);
    }
}

function err(arrs, type) {
    const args = ([]).slice.call(arrs);
    if (args.length) {
        format(args);
        process.stderr.write(style[type](args.join(' ')));
    }
}

function update(arrs) {
    const args = ([]).slice.call(arrs);
    const stdout = process.stdout;
    format(args, false);
    readline.clearLine(stdout, 0);
    readline.cursorTo(stdout, 0, null);
    stdout.write(args.join(' '));
}

export const logger = {
    error() {
        err(arguments, 'error');
    },
    info() {
        out(arguments, 'info');
    },
    log() {
        out(arguments);
    },
    nl() {
        process.stdout.write(nl);
    },
    update() {
        update(arguments);
    },
    warn() {
        err(arguments, 'warn');
    }
};
