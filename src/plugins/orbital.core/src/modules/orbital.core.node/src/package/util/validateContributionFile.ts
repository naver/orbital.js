import fs from 'fs';
import path from 'path';

function validateContributionFile(realizedPath) {
    if (!fs.existsSync(realizedPath)) {
        const relativePath = path.relative(process.cwd(), realizedPath);
        const error = new Error(relativePath);
        error.type = 'MODULE_NOT_FOUND';
        throw error;
    }
}

export default validateContributionFile;
