import * as fs from 'fs';
import {BasicError} from 'orbital.core.common';
import {PackageState} from 'orbital.core.types';
import * as path from 'path';

function validateContributingFile(realizedPath: string) {
    if (!fs.existsSync(realizedPath)) {
        const relativePath = path.relative(process.cwd(), realizedPath);
        const error = new BasicError(relativePath);
        error.code = PackageState.MODULE_NOT_FOUND;
        throw error;
    }
}

export default validateContributingFile;
