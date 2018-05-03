/* eslint-env mocha */
require('@std/esm');
const should = require('should');
const federalDocument = require('./data/cnetAPFDocument.json');
const stateDocument = require('./data/cnetGEDocument.json');
const cityDocument = require('./data/cnetGMDocument.json');
const Release = require('../lib/ocds').default;
const omit = require('lodash.omit');

describe('Transform compranet document to OCDS Release', () => {

  it('Package should include publisher name', () => {
    const metadata = omit(cityDocument, 'body');
    const ocdsPackage = new Release({
      cnetDocument: cityDocument.body,
      metadata,
    }).package;
    should(ocdsPackage.publisher.name).eql('PODER');
  });

  it('Package should gracefully ignore missing metadata', () => {
    const ocdsPackage = new Release({
      cnetDocument: cityDocument.body,
    }).package;
    should(ocdsPackage.publisher.name).eql('PODER');
  });

  it('should have an ocid and an id', () => {
    const metadata = omit(federalDocument, 'body');
    const release = new Release({
      cnetDocument: federalDocument.body,
      metadata,
    }).release;
    should(release.ocid).eql('OCDS-0UD2Q6-AA-018TOQ765-N29-2012');
    should(release.id).eql('AA-018TOQ765-N29-2012');
  });

  it('should have a tag', () => {
    const release = new Release({
      cnetDocument: federalDocument.body,
    }).release;
    should(release.tag[0]).eql('contractTermination');
  });

  it('should have a buyer', () => {
    const release = new Release({
      cnetDocument: federalDocument.body,
    }).release;
    should(release.buyer.name).eql('ZONA CAMPECHE');
  });

  it('should have array of parties', () => {
    const metadata = omit(federalDocument, 'body');
    const release = new Release({
      cnetDocument: federalDocument.body,
      metadata,
    }).release;
    const party = release.parties[0];
    should(party.id).eql('018TOQ765');
  });

  it('Should validate against OCDS schema', () => {
    const metadata = omit(cityDocument, 'body');
    const r = new Release({
      cnetDocument: cityDocument.body,
      metadata,
    });
    const isValid = r.isValid;
    should(isValid).eql(true);
  });

  it('Should validate package against OCDS schema', () => {
    const metadata = omit(cityDocument, 'body');
    const r = new Release({
      cnetDocument: cityDocument.body,
      metadata,
    });
    const isValid = r.isValidPackage;
    should(isValid).eql(true);
  });

});
