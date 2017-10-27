# c2o Dicarbon monoxide

Convert from COMPRANET to OCDS

## Installation

    npm install git+ssh://git@github.com:kyv/cnet2ocds.git

## Usage

    const Release = require('cnet2ocds');

    const cnetDocument = { compranet data };
    const ocdsRelease = new Release({cnetDocument}).release;

### Or if you want a package
    const ocdsPackage = new Release({cnetDocument}).package;

### You can also validate the document

    new Release({cnetDocument}).isValid;

### Full API

    const OCDS = new Release({cnetDocument});
    const release = OCDS.release;
    const package = OCDS.package;
    const isValid = OCDS.isValid;

## Example OCDS Document

El siguiente *release* fue derivado de esta [documento de COMPRANET](./test/cnetDocument.json). That gets converted to an [OCDS release](./test/release.json). The [OCDS schema specification](http://standard.open-contracting.org/latest/en/schema) may be of interest.
