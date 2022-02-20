import cliArgs from './cliArgs';
import nodeReq from './nodeReq';

const DEFAULT_CONFIG_FILE_NAME = 'orbital.config.js';

function getOrbitalConfig() {
    const fs = nodeReq('fs');
    const path = nodeReq('path');
    const cargs = cliArgs();
    let configFileName = DEFAULT_CONFIG_FILE_NAME;
    if (typeof cargs.config === 'string') {
        configFileName = cargs.config;
    }
    const configPath = path.resolve(__dirname, configFileName);
    if (fs.existsSync(configPath)) {
        return nodeReq(configPath);
    }
    return {};
}

export default getOrbitalConfig;
