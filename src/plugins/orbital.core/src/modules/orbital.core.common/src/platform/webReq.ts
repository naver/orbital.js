import * as path from 'path';

export default function webReq(deps: string[], cb: (...modules: any[]) => void) {
    const depsFiltered: string[] = deps.map((dep) => {
        const ext = path.extname(dep);
        if (ext && ext !== '.js') {
            return ext.substr(1) + '!' + dep;
        }
        return dep;
    });
    requirejs(depsFiltered, cb);
}
