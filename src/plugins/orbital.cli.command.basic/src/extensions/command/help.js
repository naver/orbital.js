const {cyan, cyanBright, green} = require('chalk');
const fs = require('fs');
const path = require('path');

const logger = {
    log(str) {
        process.stdout.write(str + '\n');
    }
};

const extension = {
    command: 'help',
    alias: 'h',
    desc: 'Show this help message',
    execute(context) {
        const helpFilePath = path.resolve(__dirname, './help.md');
        fs.readFile(helpFilePath, 'utf8', (err, doc) => {
            if (err) {throw err;}
            const depVerionMap = context.getPlugin().getManifest().getDependencyMap();
            logger.log(
                `\n${doc.replace('__VERSION__', depVerionMap['orbital.core'])}`);
            context.getExtensions('orbital.cli:command').then((extensions) => {
                extensions.forEach((ext) => {
                    const {module} = ext;
                    let str = '';
                    if (module.alias) {
                        str += ` -${cyanBright(module.alias)}, `;
                    }
                    str += ` --${cyan(module.command)}`;
                    if (module.desc) {
                        str += '\t\t';
                        str += green(module.desc);
                    }
                    logger.log(str);
                });
                logger.log('\n');
            });
        });
    }
};

module.exports = extension;
