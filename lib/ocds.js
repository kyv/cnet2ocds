import Ajv from 'ajv';
import { releasePackage, releaseObject } from './ocdsData';
import releaseSchema from '../schema/release-schema.json';
const ajv = new Ajv({allErrors: true});

// configure ajv for schema draft 04
import jsonSchemaDraftFour from 'ajv/lib/refs/json-schema-draft-04.json';
ajv.addMetaSchema(jsonSchemaDraftFour);

// FIXME Release class should accept an already converted document
// then we can have methods like releasePackage, isValid and redFlags

export default class Release {
  constructor({ cnetDocument, release }) {
    this.release = release;
    if (!release) {
      this.release = releaseObject(cnetDocument)
    }
  }

  get getRelease() {
    // returns OCDS release
    return this.release;
  }


  get package() {
    // returns OCDS release
    return releasePackage(this.release);
  }

  get isValid() {
    // BOOL
    return ajv.validate(releaseSchema, this.release);
  }

  // FIXME  we can return redFlags here
  // redFlags() {
  //   return flags(this.release);
  // }
}
