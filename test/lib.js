/* eslint-env mocha */
require('@std/esm');
require = require("esm")(module/*, options*/)
const should = require('should');
const buyerPartyObject = require('../lib/ocdsData').buyerPartyObject;
const dateToISOString = require('../lib/ocdsData').dateToISOString;
const stripSiglasFromUC = require('../lib/ocdsData').stripSiglasFromUC;
const obtainClaveFromUC = require('../lib/ocdsData').obtainClaveFromUC;

describe('Parse specific values', () => {

  it('should strip initials from UC String when inititias are of organization', () => {
    const options = {
      SIGLAS: 'ISSSTE',
      NOMBRE_DE_LA_UC: 'ISSSTE-Departamento de Adquisición de Instrumental Médico #019GYN059',
    }
    const { UCString, siglas } = stripSiglasFromUC(options);
    should(UCString).eql('Departamento de Adquisición de Instrumental Médico #019GYN059');
    should(siglas).eql('ISSSTE');
  });

  it('should strip initials from UC String when inititias are `organization-city`', () => {
    const options = {
      SIGLAS: 'API-Salina Cruz',
      NOMBRE_DE_LA_UC: 'API-Salina Cruz-Gerencia de Operaciones e Ingeniería #009J3G999',
    }
    const { UCString, siglas, city } = stripSiglasFromUC(options);
    should(UCString).eql('Gerencia de Operaciones e Ingeniería #009J3G999');
    should(siglas).eql('API');
    should(city).eql('Salina Cruz');
  });

  it('should obtain claveUC from UC String', () => {
    const UC = 'ISSSTE-Departamento de Adquisición de Instrumental Médico #019GYN059';
    const ID = obtainClaveFromUC(UC);
    should(ID).eql('019GYN059');
  });

  it('should convert a date to ISO String', () => {
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

  it('buyerPartyObject should conform to expectations when APF', () => {
    const options = {
      GOBIERNO: 'APF',
      SIGLAS: 'ISSSTE',
      DEPENDENCIA: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      CLAVEUC: '019GYN059',
      NOMBRE_DE_LA_UC: 'ISSSTE-Departamento de Adquisición de Instrumental Médico #019GYN059',
      RESPONSABLE: 'NAYELI ANEL PUERTO GONGORA',
    }
    const expected = {
      role: 'buyer',
      address: { countryName: 'Mexico' },
      parent: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      id: '019GYN059',
      name: 'Departamento de Adquisición de Instrumental Médico',
      govLevel: 'country',
      contactPoint: 'NAYELI ANEL PUERTO GONGORA',
    }
    const party = buyerPartyObject(options);
    should(party).deepEqual(expected);
  });

  it('buyerPartyObject should conform to expectations when GE', () => {
    const options = {
      SIGLAS : 'SLP',
      DEPENDENCIA : '_Gobierno del Estado de San Luis Potosí',
      CLAVEUC : '924037999',
      NOMBRE_DE_LA_UC : 'SLP-Instituto Estatal de Infraestructura Física Educativa-DIRECCION DE COSTOS #924037999',
      RESPONSABLE : 'GEORGINA SILVA BARRAGAN',
      GOBIERNO: 'GE',
    }
    const expected = {
      id: '924037999',
      name: 'DIRECCION DE COSTOS',
      parent: 'Instituto Estatal de Infraestructura Física Educativa',
      role: 'buyer',
      address: {
        countryName: 'Mexico',
        region: 'San Luis Potosí',
      },
      govLevel: 'region',
    }

    const party = buyerPartyObject(options);
    should(party).deepEqual(expected);
  });

  it('buyerPartyObject should conform to expectations when GM', () => {
    const options = {
      GOBIERNO: 'GM',
      SIGLAS : 'VER',
      DEPENDENCIA : '_Gobierno Municipal del Estado de Veracruz de Ignacio de la Llave',
      CLAVEUC : '830028997',
      NOMBRE_DE_LA_UC : 'VER-Boca del Río-Municipio de Boca del Río #830028997',
      RESPONSABLE : 'Miguel Ángel Yunes Márquez',
    }
    const expected = {
      role: 'buyer',
      id: '830028997',
      name: 'Municipio de Boca del Río',
      govLevel: 'city',
      address:
       { countryName: 'Mexico',
         region: 'Veracruz de Ignacio de la Llave',
         locality: 'Boca del Río',
       },
    }

    const party = buyerPartyObject(options);
    should(party).deepEqual(expected);
  });

});
