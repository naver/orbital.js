import {version} from '../../../package.json';

export default {
    onStart() {
        console.log(`orbital version ${version}`);
    }
};
