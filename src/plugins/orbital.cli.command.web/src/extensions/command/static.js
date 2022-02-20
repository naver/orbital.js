const ResourceGenerator = require('./ResourceGenerator');

const COMMAND = 'static';
const desc = "From packages with target is 'web', "
    + 'generate plugin resource files for a static web project.';

const extension = {
    command: COMMAND,
    alias: 's',
    desc,
    execute(context) {
        const generator = new ResourceGenerator(context);
        generator.generate();
    }
};

module.exports = extension;
