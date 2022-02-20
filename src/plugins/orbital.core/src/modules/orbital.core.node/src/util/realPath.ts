import * as fs from 'fs';

function realPath(dir: string) {
    return new Promise((resolve, reject) => {
        fs.lstat(dir, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            if (stats.isSymbolicLink()) {
                fs.readlink(dir, (e, target) => {
                    if (e) {
                        reject(e);
                        return;
                    }
                    resolve(target);
                });
            } else {
                resolve(dir);
            }
        });
    });
}

export default realPath;
