/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';

class ContributingServiceDescriptor extends Base {
    constructor(provider, version, id, index, realize, priority, vendor) {
        super();
        this.define('provider', provider);
        this.define('version', version);
        this.define('id', id);
        this.define('index', index);
        this.define('realize', realize);
        this.define('priority', priority || 0);
        this.define('vendor', vendor || '');
        Object.freeze(this);
    }
}

export default ContributingServiceDescriptor;
