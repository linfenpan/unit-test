'use strict';

const UnitTest = require('../index');
const { descript, it, run } = UnitTest();


descript('test unit 1', () => {
  it('should done', done => {
    done();
  });

  it('should done too', done => {
    throw 'stop here';
    done();
  });
});

run();
