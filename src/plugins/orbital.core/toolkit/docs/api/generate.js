const fs = require('fs');
const path = require('path');
const typedoc = require('typedoc');

const INDEX_HTML = 'template/index.html';

const options = JSON.parse(fs.readFileSync('./config/typedoc.json'));
const typedocApp = new typedoc.Application(options);
const src = typedocApp.expandInputFiles([options.src]);
const project = typedocApp.convert(src);

typedocApp.generateJson(project, options.cache);

const model = JSON.stringify(JSON.parse(fs.readFileSync(options.cache).toString()));
const index = fs.readFileSync(path.join(__dirname, INDEX_HTML))
    .toString().replace('{{doc.model}}', model);

fs.writeFileSync(path.join(options.out, 'api.html'), index);
