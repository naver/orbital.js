import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import orbitalize from './rollup-plugin-orbitalize';

export default {
	entry: 'src/orbital.js',
	moduleName: 'orbital',
	plugins: [ json(), buble(), orbitalize({env: 'amd'}) ],
//	sourceMap: 'inline',
	targets: [
		{ dest: 'dist/orbital.amd.js', format: 'amd' }
	]
};
