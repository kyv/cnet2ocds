/* eslint-env mocha */
import should from 'should';
import { contractObject } from '../lib/ocdsData';
import { contractStatus } from '../lib/ocdsData';
import cityDocument from './data/cnetGMDocument.json';

describe('contract object', () => {

  it('contractStatus converts `Activo` to active', () => {
    const scale = contractStatus('Activo');
    should(scale).equal('active');
  });

  it('contractStatus converts `terminado` and `expirado` to terminated', () => {
    const scale0 = contractStatus('Terminado');
    const scale1 = contractStatus('Expirado');
    should(scale0).equal('terminated');
    should(scale1).equal('terminated');
  });

  it('should conform to expectations', () => {
    const expected = {
      status: 'terminated',
      statusMxCnet: 'Expirado',
      title: 'CONTRATO DE OBRA PUBLICA MBR-2014-RM-0514',
      ocid: 'OCDS-0UD2Q6-LO-830028997-N2-2014',
      suppliers: 'JORGE ARTURO MATUS OLVERA',
      id: '672651',
      awardID: 0,
      period: {
        startDate: '2015-01-01T00:00:00.000Z',
        endDate: '2015-06-29T00:00:00.000Z',
        multiyearContractMxCnet: '1' },
      value: { amount: 23266093.9, currency: 'MXN' },
      valueWithTax: { amount: 23266093.9, currency: 'MXN' },
      dateSigned: '2014-12-30T00:00:00.000Z',
      hasFramework: '0',
      framework: null,
      filedMxCnet: 'No',
    }

    const contract = contractObject(cityDocument.body);
    should(contract).deepEqual(expected);
  });

});
