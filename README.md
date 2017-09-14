Convert from COMPRANET to OCDS

## Installation

    npm install git+ssh://git@github.com:kyv/cnet2ocds.git 

## Usage

    const cnet2ocds = require('cnet2ocds');

    const cnetDocument = { compranet data };
    const ocdsDocument = cnet2ocds(cnetDocument);

## Example OCDS Document

El siguiente *release* fue derivado de esta [documento de COMPRANET](./test/doc.json). The [OCDS schema specification](http://standard.open-contracting.org/latest/en/schema) may be of interest.

### OCDS

    {
      "uri": "http://api.quienesquien.wiki/releases/ocds-0ud2q6-LA-019GYN059-T11-2012",
      "version": "1.1",
      "publishedDate": "2017-09-01T22:20:06.487Z",
      "releases": [
          {
              "ocid": "ocds-0ud2q6-LA-019GYN059-T11-2012",
              "id": "LA-019GYN059-T11-2012",
              "date": "2017-09-01T22:20:06.490Z",
              "initiationType": "tender",
              "tag": [
                  "tender"
              ],
              "parties": [
                  {
                      "name": "ISSSTE-Departamento de Adquisición de Instrumental Médico #019 GYN059",
                      "id": "issste-departamento-de-adquisicion-de-instrumental-medico-019gyn059",
                      "roles": [
                          "buyer"
                      ]
                  },
                  {
                      "name": "Instituto de Seguridad Y. Servicios Sociales de los Trabajadores del Estado",
                      "id": "instituto-de-seguridad-y-servicios-sociales-de-los-trabajadores-del-estado",
                      "roles": [
                          "procuringEntity"
                      ]
                  },
                  {
                      "name": "CORPORATIVO GIORMAR de MEXICO",
                      "id": "corporativo-giormar-de-mexico",
                      "roles": [
                          "supplier"
                      ]
                  }
              ],
              "buyer": {
                  "name": "ISSSTE-Departamento de Adquisición de Instrumental Médico #019 GYN059",
                  "uri": "https://www.quienesquien.wiki/orgs/ISSSTE-Departamento de Adquisición de Instrumental Médico #019GYN059"
              },
              "planning": {
                  "budget": {}
              },
              "tender": {
                  "id": 1,
                  "procurementMethod": "open",
                  "procurementMethodRationale": "Internacional",
                  "procurementMethodDetails": "Adquisiciones",
                  "submissionMethod": [
                      "Mixta"
                  ]
              },
              "awards": [
                  {
                      "suppliers": [
                          {
                              "name": "CORPORATIVO GIORMAR de MEXICO",
                              "id": "corporativo-giormar-de-mexico"
                          }
                      ],
                      "date": "2013-02-13T00:00:00.000Z",
                      "id": 1,
                      "value": {}
                  }
              ],
              "contracts": [
                  {
                      "title": "CONTRATO 0010 IM/2013",
                      "ocid": "ocds-0ud2q6-LA-019GYN059-T11-2012",
                      "suppliers": "CORPORATIVO GIORMAR de MEXICO",
                      "id": 1,
                      "awardID": 1,
                      "value": {
                          "amount": 2290976.8,
                          "currency": "MXN"
                      },
                      "date_signed": "2013-02-20T06:00:00.000Z"
                  }
              ]
          }
      ],
      "publisher": {
          "name": "PODER",
          "scheme": "poder-scheme",
          "uid": null,
          "uri": "https://api.quienesqien.wiki/releases/1"
      },
      "license": "http://opendatacommons.org/licenses/pddl/1.0/",
      "publicationPolicy": "https://github.com/open-contracting/sample-data/"

    }
