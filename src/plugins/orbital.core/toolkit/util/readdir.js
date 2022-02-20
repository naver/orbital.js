const fs = require('fs');
const path = require('path');

function readdir(p) {
    return new Promise((resolve, reject) => {
        fs.readdir(p, (e, items) => {
            const dirs = items.filter((item) => {
                return fs.lstatSync(p + path.sep + item).isDirectory();
            });
            if (e) {
                reject(e);
            } else {
                resolve(dirs);
            }
        });
    });
}

module.exports = readdir;
