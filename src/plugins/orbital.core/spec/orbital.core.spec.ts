import {expect} from 'chai';
import 'mocha';
import orbital from '../src/orbital.core';

describe('orbital', () => {

    it('should be a function', function () {
        expect(orbital).to.be.a('function');
    });

    it('should execute callback', function (done) {
        orbital(() => {
            done();
        });
    });

    it('should run with startup packages options', function (done) {
        orbital(() => {
            done();
        }, {
            packages: {
                startup: []
            }
        });
    });
});
