/* eslint-env mocha */
import should from 'should';
import { planningObject } from '../lib/ocdsData';
import stateDocument from './data/cnetGMDocument.json';

describe('planning object', () => {

  it('should conform to expectations', () => {
    const expected = {
      budget: {
        budgetBreakdown: {
          description: 'Importe de Aportación del Gobierno Federal señalada en el oficio de autorización sin incluir el impuesto al valor agregado.',
          amount: { amount: 1067586.2, currency: 'MXN' },
          budgetClassifications: { origin: 1 } },
        project: '20S155',
        projectID: 'P APOYO INST MUJERES ENT FEDER',
      },
    }

    const planning = planningObject(stateDocument.body);
    should(planning).deepEqual(expected);
  });

});
