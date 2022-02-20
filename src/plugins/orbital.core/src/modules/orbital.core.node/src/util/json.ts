import * as fs from 'fs';

const json = {
    read(p: string) {
        return new Promise((resolve, reject) => {
            fs.readFile(p, (e, data) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    },
    write(p: string, data: object) {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error('Empty json is not allowed'));
                return;
            }
            const jsonData = JSON.stringify(data, null, '  ') + '\n';
            fs.writeFile(p, jsonData, (e) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(jsonData.length);
                }
            });
        });
    }
};

export default json;
