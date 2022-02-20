import {expect} from 'chai';
import 'mocha';
import Starter from '../../src/runtime/Starter';

describe('Starter', () => {

    const starter = new Starter((context) => {
    }, {});

    it('Starter should be a class', function () {
        expect(Starter).to.be.a('function');
    });

    it('Starter should have a startup method', function () {
        expect(starter).to.have.property('startup');
    });

    it('Starter should have a startup method', function () {
        expect(starter.startup()).to.be.a('undefined');
    });
});
