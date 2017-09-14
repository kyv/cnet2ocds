/* eslint-env mocha */
require('@std/esm');
const should = require('should');
const Ajv = require('ajv');
const cnetDocument = require('./doc.json');
const cnet2ocds = require('../lib/format').default;
const releaseSchema = require('../schema/release-schema.json');
const ajv = new Ajv({allErrors: true});

// configure ajv for schema draft 04
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

describe('Transform compranet document to OCDS Release', () => {

  it('Release Package metadata should include publisher name', () => {
    const ocdsPackage = cnet2ocds(cnetDocument);
    should(ocdsPackage.publisher.name).eql('PODER');
  });

  it('Should have a release w/ ocid and an id', () => {
    const ocdsPackage = cnet2ocds(cnetDocument);
    const release = ocdsPackage.releases[0];
    should(release.ocid).eql('ocds-0ud2q6-LA-019GYN059-T11-2012');
    should(release.id).eql('LA-019GYN059-T11-2012');
  });

  it('Release 0 should have array of parties', () => {
    const ocdsPackage = cnet2ocds(cnetDocument);
    const release = ocdsPackage.releases[0];
    const party = release.parties[0];
    should(party.id).eql('issste-departamento-de-adquisicion-de-instrumental-medico-019gyn059');
  });

  it('Should validate against OCDS release schema', () => {
    const ocdsPackage = cnet2ocds(cnetDocument);
    const release = ocdsPackage.releases[0];
    const valid = ajv.validate(releaseSchema, release);
    if (!valid) {
      throw ajv.errors;
    }
  });
});
