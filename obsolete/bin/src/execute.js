import commands from './commands.json';
import plugins from './plugins';
import {logger} from './util';

export default function execute(cargs, config) {
    const aliasMap = commands.alias;
    const aliases = Reflect.ownKeys(aliasMap);
    const executed = [];
    aliases.forEach((alias) => {
        if (cargs[alias]) {
            const cmd = aliasMap[alias];
            logger.info(cmd);
            try {
                const plugin = plugins[cmd];
                executed.push(plugin);
                plugin.onStart(config, cargs[alias]);
            } catch (e) {
                logger.error(`Command was '${cmd}' but`, e.message);
            }
        }
    });
    process.on('SIGINT', () => {
        executed.forEach((plugin) => {
            plugin.onStop();
        });
        process.exit(2);
    });
}
