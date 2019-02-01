/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import esDefault from './es-default';
import objectify from './objectify';
import ExportsRegistry from '../system/resolution/ExportsRegistry';
import merge from 'lodash.merge';

var warn = `[ORBITAL] You should install "orbital-loader" to use orbital with webpack.
  You can try "npm install -D orbital-loader"`;
var ManifestLoader = {discover() {console.warn(warn); objectify(); merge(); esDefault(); ExportsRegistry;}};

export default ManifestLoader;
