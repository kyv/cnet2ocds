/* eslint-env mocha */
import should from 'should';
import { dateToISOString } from '../lib/ocdsData';

describe('Utility functions', () => {

  it('should convert dates to ISO Strings', () => {
    const fechaFallo = '2013-06-22 00:00:00 GMT';
    const fechaCeleb = '2013-06-27 00:00:00';
    const fechaNoSeconds = '2013-06-27 00:00';
    const fechaNoTime = '2013-06-27';
    const dateF = dateToISOString(fechaFallo);
    const dateC = dateToISOString(fechaCeleb);
    const dateN = dateToISOString(fechaNoTime);
    const dateS = dateToISOString(fechaNoSeconds);
    should(dateF).eql('2013-06-22T00:00:00.000Z');
    should(dateC).eql('2013-06-27T00:00:00.000Z');
    should(dateN).eql('2013-06-27T00:00:00.000Z');
    should(dateS).eql('2013-06-27T00:00:00.000Z');
  });

});
