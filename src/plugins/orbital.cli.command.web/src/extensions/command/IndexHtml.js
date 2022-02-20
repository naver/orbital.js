const fs = require('fs');
const fse = require('fs-extra');
const beautify = require('js-beautify');
const jsdom = require('jsdom');
const common = require('orbital.core.common');

class IndexHtml extends common.Base {

    constructor(inPath, outPath, generator) {
        super();
        this.inPath = inPath;
        this.outPath = outPath;
        this.generator = generator;
        this.logger = generator.logger;
    }

    addScript(url) {
        const logger = this.logger;
        return (new Promise((resolve, reject) => {
            try {
                const doc = this.dom.window.document;
                const script = doc.createElement('script');
                script.setAttribute('src', url);
                doc.body.appendChild(script);
                resolve(script);
                logger.log(`script element added (src: ${url})`);
            } catch (e) {
                reject(e);
            }
        })).catch(e => logger.error(e));
    }

    normalize(dom) {
        const logger = this.logger;
        return (new Promise((resolve, reject) => {
            try {
                const doc = dom.window.document;
                let body = doc.body;
                if (!body) {
                    body = doc.createElement('body');
                    doc.appendChild(body);
                }
                let head = doc.querySelector('head');
                if (!head) {
                    head = doc.createElement('head');
                    body.insertBefore(head, body.firstChild);
                }
                resolve(dom);
                logger.log('index-html normalized');
            } catch (e) {
                reject(e);
            }
        })).catch(e => logger.error(e));
    }

    parse() {
        return this.parseTemplate()
            .then(dom => this.normalize(dom));
    }

    parseTemplate() {
        const logger = this.logger;
        return (new Promise((resolve, reject) => {
            fs.readFile(this.inPath, 'utf8', (err, template) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        this.dom = new jsdom.JSDOM(template);
                        resolve(this.dom);
                        logger.log(this.inPath, 'parsed');
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        })).catch(e => logger.error(e));
    }

    serialize() {
        return beautify.html(this.dom.serialize(), {
            extra_liners: false,
            max_preserve_newlines: 0,
            preserve_newlines: false
        });
    }

    write() {
        const logger = this.logger;
        const outPath = this.outPath;
        return fse.outputFile(outPath, this.serialize() + '\n')
            .then(() => {
                logger.info(this.generator.emp(outPath), 'written');
            })
            .catch((e) => {
                this.logger.error(e);
            });
    }
}

module.exports = IndexHtml;
