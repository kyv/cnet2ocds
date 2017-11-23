/* eslint-env mocha */
require('@std/esm');
const should = require('should');
const cnetUCRutine = require('../lib/ocdsData').cnetUCRutine;
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
    const fechaNoTime = '2013-06-27';
    const dateF = dateToISOString(fechaFallo);
    const dateC = dateToISOString(fechaCeleb);
    const dateN = dateToISOString(fechaNoTime);
    should(dateF).eql('2013-06-22T00:00:00.000Z');
    should(dateC).eql('2013-06-27T00:00:00.000Z');
    should(dateN).eql('2013-06-27T00:00:00.000Z');
  });

  it('UC name parser should return `name`, and `clave_uc` when APF', () => {
    const options = {
      GOBIERNO: 'APF',
      SIGLAS: 'ISSSTE',
      DEPENDENCIA: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      CLAVEUC: '019GYN059',
      NOMBRE_DE_LA_UC: 'ISSSTE-Departamento de Adquisición de Instrumental Médico #019GYN059',
    }
    const { UCString, claveUC, siglas, dependency, govLevel } = cnetUCRutine(options);
    should(claveUC).eql('019GYN059');
    should(UCString).eql('Departamento de Adquisición de Instrumental Médico');
    should(siglas).eql('ISSSTE');
    should(dependency).eql('Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado');
    should(govLevel).eql('Federal');
  });

  it('UC name parser should return `name`, and `clave_uc` when initials are `organization-city`', () => {
    const options = {
      GOBIERNO: 'GE',
      SIGLAS: 'API-Salina Cruz',
      NOMBRE_DE_LA_UC: 'API-Salina Cruz-Gerencia de Operaciones e Ingeniería #009J3G999',
      DEPENDENCIA: 'Administración Portuaria Integral de Salina Cruz, S.A. de C.V.',
      CLAVEUC: '009J3G999',
    }
    const { UCString, claveUC, siglas, dependency, govLevel, city } = cnetUCRutine(options);
    should(claveUC).eql('009J3G999');
    should(UCString).eql('Gerencia de Operaciones e Ingeniería');
    should(siglas).eql('API');
    should(city).eql('Salina Cruz');
    should(dependency).eql('Administración Portuaria Integral de Salina Cruz, S.A. de C.V.');
    should(govLevel).eql('State');
  });

  it('UC name parser should return `name`, and `clave_uc` when `DEPENDENCY` is a state', () => {
    const options = {
      GOBIERNO: 'GM',
      SIGLAS: 'MEX',
      // EXCEPTION:  NOMBRE_DE_LA_UC: 'MEX-La Paz-DIRECCION GENERAL DE ADMINISTRACION Y FINANZAS #815070973',
      NOMBRE_DE_LA_UC: 'MEX-Tecnológico de Estudios Superiores de Cuautitlán Izcalli-RECURSOS MATERIALES Y SERVICIOS GENERALES #915084914',
      DEPENDENCIA: '_Gobierno Municipal del Estado de México',
      CLAVEUC: '815070973',
    }
    const { UCString, claveUC, siglas, dependency, govLevel, state } = cnetUCRutine(options);
    should(claveUC).eql('915084914');
    should(UCString).eql('RECURSOS MATERIALES Y SERVICIOS GENERALES');
    should(siglas).eql('MEX');
    // should(city).eql('La Paz');
    should(state).eql('México');
    should(govLevel).eql('City');
    should(dependency).eql('Tecnológico de Estudios Superiores de Cuautitlán Izcalli');
  });

});
