import def from './default.config';

function normalize(config) {
    return Object.assign({}, def, config);
}

export default normalize;
