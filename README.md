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
    const isValid = OCDS.isValidPackage;

## Example OCDS Document

El siguiente *release* fue derivado de esta [documento de COMPRANET](./test/data/cnetGMDocument.json). That gets converted to an [OCDS release](./test/data/release.json). There is also an example [OCDS release package](./test/data/releasePackage.json). The [OCDS schema specification](http://standard.open-contracting.org/latest/en/schema) may be of interest.
