/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

function incubate(Child, Parent) {
    const protoBackup = {};
    const ChildPrototype = Child.prototype;
    Reflect.ownKeys(ChildPrototype).forEach((prop) => {
        protoBackup[prop] = ChildPrototype[prop];
    });
    Child.prototype = Object.create(Parent.prototype);
    Object.assign(Child.prototype, protoBackup);
}

export default incubate;
