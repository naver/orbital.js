define([], function () {
    'use strict';
    return class Activator {
        onStart() {
            console.log('hello Activator');
        }
        onStop() {
            console.log('bye Activator');
        }
    };
});
