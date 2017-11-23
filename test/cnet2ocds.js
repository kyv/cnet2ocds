/* eslint-env mocha */
require('@std/esm');
const should = require('should');
const federalDocument = require('./data/cnetAPFDocument.json');
const stateDocument = require('./data/cnetGEDocument.json');
const cityDocument = require('./data/cnetGMDocument.json');
const Release = require('../lib/ocds').default;

const cnetDocument = cityDocument;

describe('Transform compranet document to OCDS Release', () => {

  it('Release Package metadata should include publisher name', () => {
    const ocdsPackage = new Release({cnetDocument}).package;
    should(ocdsPackage.publisher.name).eql('PODER');
  });

  it('Should have a release w/ ocid and an id', () => {
    const release = new Release({cnetDocument: federalDocument}).release;
    should(release.ocid).eql('OCDS-0UD2Q6-LA-019GYN059-T11-2012');
    should(release.id).eql('LA-019GYN059-T11-2012');
  });

  it('Release 0 should have array of parties', () => {
    const release = new Release({cnetDocument: federalDocument}).release;
    const party = release.parties[0];
    should(party.id).eql('instituto-de-seguridad-y-servicios-sociales-de-los-trabajadores-del-estado');
  });

  it('Should validate release against OCDS schema', () => {
    const r = new Release({cnetDocument});
    const isValid = r.isValid;
    should(isValid).eql(true);
  });

  it('Should validate package against OCDS schema', () => {
    const r = new Release({cnetDocument});
    const isValid = r.isValidPackage;
    should(isValid).eql(true);
  });

});
