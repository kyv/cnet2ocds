/* eslint-env mocha */
import should from 'should';
import { tenderObject } from '../lib/ocdsData';
import { tenderAwardCriteriaDetailScale } from '../lib/ocdsData';
import { tenderMainProcurementCategory } from '../lib/ocdsData';
import { tenderProcurementMethod } from '../lib/ocdsData';
import stateDocument from './data/cnetGEDocument.json';

describe('tender object', () => {

  it('tenderAwardCriteriaDetailScale converts `No MIPYME` to `Large`', () => {
    const scale = tenderAwardCriteriaDetailScale('No MIPYME');
    should(scale).equal('Large');
  });

  it('tenderAwardCriteriaDetailScale converts `Mediana` and `Pequeña`to `sme`', () => {
    const scale0 = tenderAwardCriteriaDetailScale('Mediana');
    const scale1 = tenderAwardCriteriaDetailScale('Pequeña');
    should(scale0).equal('sme');
    should(scale1).equal('sme');
  });

  it('tenderAwardCriteriaDetailScale converts `Micro` to `micro`', () => {
    const scale = tenderAwardCriteriaDetailScale('Micro');
    should(scale).equal('micro');
  });

  it('tenderMainProcurementCategory converts `adquisiciones` and `arrendamientos` to goods', () => {
    const scale0 = tenderMainProcurementCategory('Adquisiciones');
    const scale1 = tenderMainProcurementCategory('Arrendamientos');
    should(scale0).equal('goods');
    should(scale1).equal('goods');
  });

  it('tenderMainProcurementCategory converts `Obra Pública` and `Servicios Relacionados con la OP` to works', () => {
    const scale0 = tenderMainProcurementCategory('Obra Pública');
    const scale1 = tenderMainProcurementCategory('servicios Relacionados con la OP');
    should(scale0).equal('works');
    should(scale1).equal('works');
  });

  it('tenderMainProcurementCategory converts `Servicios` to services', () => {
    const scale = tenderMainProcurementCategory('Servicios');
    should(scale).equal('services');
  });

  it('tenderProcurementMethod converts `Licitación Pública` to open', () => {
    const scale0 = tenderProcurementMethod('Licitación Pública');
    const scale1 = tenderProcurementMethod('Licitación Pública con OSD');
    should(scale0).equal('open');
    should(scale1).equal('open');
  });

  it('tenderProcurementMethod converts `Invitación` to limited', () => {
    const scale = tenderProcurementMethod('Invitación a Cuando Menos 3 Personas');
    should(scale).equal('limited');
  });

  it('tenderProcurementMethod converts `ajudicatción` and `conventio` to direct', () => {
    const scale0 = tenderProcurementMethod('Adjudicación Directa Federal');
    const scale1 = tenderProcurementMethod('convenio');
    should(scale0).equal('direct');
    should(scale1).equal('direct');
  });

  it('tenderObject should conform to expectations', () => {
    const expected = {
      id: '714786',
      title: 'OBRAS AQUISMONY HUEHUETLAN, S.L.P.',
      status: 'complete',
      procurementMethod: 'open',
      procurementMethodMxCnet: 'Licitación Pública',
      procurementMethodCharacterMxCnet: 'Nacional',
      mainProcurmentCategory: 'works',
      additionalProcurmentCategory: 'Obra Pública',
      procurementMethodDetailsTemplateMxCnet: '30. Licitación Pública Nacional de Obra Pública (Legislación Estatal)',
      awardCriteriaDetailsScale: [ 'sme' ],
      awardCriteriaDetailsScaleDetailsMxCnet: [ 'Pequeña' ],
      contractPeriod: { multiyearContractMxCnet: '0' },
      submissionMethod: [ 'Presencial' ],
      tenderPeriod:
   { startDate: '2014-11-20T08:15:00.000Z',
     endDate: '2014-12-04T09:00:00.000Z' } }

    const tender = tenderObject(stateDocument.body);
    should(tender).deepEqual(expected);
  });

});
