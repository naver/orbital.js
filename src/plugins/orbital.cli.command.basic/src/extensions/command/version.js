const extension = {
    command: 'version',
    alias: 'v',
    desc: 'Show version number',
    execute(context) {
        const depVerionMap = context.getPlugin().getManifest().getDependencyMap();
        process.stdout.write(`orbital version ${depVerionMap['orbital.core']}\n`);
    }
};

module.exports = extension;
