/* eslint-env mocha */
require('@std/esm');
const should = require('should');
const federalDocument = require('./data/cnetAPFDocument.json');
const stateDocument = require('./data/cnetGEDocument.json');
const cityDocument = require('./data/cnetGMDocument.json');
const Release = require('../lib/ocds').default;

describe('Transform compranet document to OCDS Release', () => {

  it('Release Package metadata should include publisher name', () => {
    const ocdsPackage = new Release({
      cnetDocument: cityDocument.body,
      metadata: cityDocument,
    }).package;
    should(ocdsPackage.publisher.name).eql('PODER');
  });

  it('Should have a release w/ ocid and an id', () => {
  it('Release Package metadata should gracefully ignore missing metadata', () => {
    const ocdsPackage = new Release({
      cnetDocument: cityDocument.body,
    }).package;
    should(ocdsPackage.publisher.name).eql('PODER');
  });

    const release = new Release({
      cnetDocument: federalDocument.body,
      metadata: federalDocument,
    }).release;
    should(release.ocid).eql('OCDS-0UD2Q6-AA-018TOQ765-N29-2012');
    should(release.id).eql('AA-018TOQ765-N29-2012');
  });

  it('Release 0 should have array of parties', () => {
    const release = new Release({
      cnetDocument: federalDocument.body,
      metadata: federalDocument,
    }).release;
    const party = release.parties[0];
    should(party.id).eql('comision-federal-de-electricidad');
  });

  it('Should validate release against OCDS schema', () => {
    const r = new Release({
      cnetDocument: cityDocument.body,
      metadata: cityDocument,
    });
    const isValid = r.isValid;
    should(isValid).eql(true);
  });

  it('Should validate package against OCDS schema', () => {
    const r = new Release({
      cnetDocument: cityDocument.body,
      metadata: cityDocument,
    });
    const isValid = r.isValidPackage;
    should(isValid).eql(true);
  });

});
