import {ILoggerCommandMap, ILogWriter} from 'orbital.core.types';
import {getPlatform} from '../platform';
import {nodeWriter, webWriter} from './writers';

let writerCache: ILogWriter;

function getWriter() {
    if (writerCache) {
        return writerCache;
    }
    writerCache = getPlatform() === 'node'
        ? nodeWriter
        : webWriter;
    return writerCache;
}

const commandMap: ILoggerCommandMap | any = {
    debug(date: Date, args: any[]) {
        getWriter().out('debug', date, args);
    },
    emphasize(date: Date, args: any[]) {
        getWriter().out('emphasize', date, args);
    },
    error(date: Date, args: any[]) {
        getWriter().err(date, args);
    },
    info(date: Date, args: any[]) {
        getWriter().out('info', date, args);
    },
    log(date: Date, args: any[]) {
        getWriter().out('log', date, args);
    },
    nl() {
        getWriter().nl();
    },
    setPrompt (prompt: string) {
        getWriter().setPropmt(prompt);
    },
    silly(date: Date, args: any[]) {
        getWriter().out('silly', date, args);
    },
    spin(date: Date, args: any[]) {
        getWriter().spin(date, args);
    },
    trace(date: Date, args: any[]) {
        getWriter().trace(date, args);
    },
    update(date: Date, args: any[]) {
        getWriter().update(date, args);
    },
    warn(date: Date, args: any[]) {
        getWriter().out('warn', date, args);
    }
};

export default commandMap;
