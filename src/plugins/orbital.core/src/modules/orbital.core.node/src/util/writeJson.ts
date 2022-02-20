import * as fs from 'fs';

function writeJson(path: string, obj: object, options = {spaces: '  ', EOL: '\n', replacer: null}) {
    const {spaces, EOL, replacer} = options;
    return new Promise((resolve, reject) => {
        try {
            const str = JSON.stringify(obj, replacer, spaces) + (EOL || '');
            fs.writeFile(path, str, (e) => {
                if (e) {
                    throw e;
                }
                resolve(str);
            });
        } catch (e) {
            reject(e);
        }
    });
}

export default writeJson;
