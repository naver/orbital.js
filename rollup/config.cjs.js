import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import orbitalize from './rollup-plugin-orbitalize';

export default {
	entry: 'src/orbital.js',
	moduleName: 'orbital',
	plugins: [ json(), buble(), orbitalize({env: 'cjs'}) ],
//	sourceMap: 'inline',
	targets: [
		{ dest: 'dist/orbital.js', format: 'cjs' }
	]
};
