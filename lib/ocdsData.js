import slug from 'slug';
import assign from 'lodash/assign';
import camelCase from 'lodash.camelcase';
import launder from 'company-laundry';

function nP2Ocid(string) {
  // NUMERO_PROCEDIMIENTO to OCID
  return `ocds-0ud2q6-${string}`
}

function orgObject(name) {
  // doc is an organization
  if (name) {
    const o = {
      name: launder(name),
      id: slug(name, { lower: true }),
    };
    return o;
  }
}

function organizationReferenceObject(string) {
  return {
    name: launder(string),
    uri: `https://www.quienesquien.wiki/orgs/${string}`,
  };
}

function procurementMethod(string) {
  switch (camelCase(string)) {
    case 'licitacionPublica':
      return 'open';
    case 'selective':
      return 'selective';
    case 'invitacionACuandoMenosTresProveedores':
      return 'limited';
    case 'adjudicacionDirectaFederal':
      return 'direct';
    case 'convenio':
      return 'direct';
  }
}

function tenderObject(contract) {

  return {
    id: 1, // contract.CODIGO_EXPEDIENTE,
    procurementMethod: procurementMethod(contract.TIPO_PROCEDIMIENTO),
    procurementMethodRationale: contract.CARACTER,
    procurementMethodDetails: contract.TIPO_CONTRATACION,
    submissionMethod: [
      contract.FORMA_PROCEDIMIENTO,
    ],
  };
}

function budgetObject(contract) {
  return {
    branch: contract.RAMO,
    source: contract.CLAVE_CARTERA,
  };
}

function planningObject(contract) {
  return {
    federal_funding: contract.APORTATION_FEDERAL,
    budget: budgetObject(contract),
  };
}

function awardObject(contract) {

  const suppliers = [
    orgObject(contract.PROVEEDOR_CONTRATISTA),
  ];

  return {
    title: contract.title,
    suppliers: suppliers,
    date: new Date(contract.EXP_F_FALLO).toISOString(),
    id: 1,
    value: {
      amount: contract.amount,
      currency: contract.currency,
    },
  };
}

function contractStatus(string) {
  switch (camelCase(string)) {
    // case '---':
    //   return 'pending';
    case 'selective':
      return 'selective';
    case 'activo':
      return 'active';
    case 'canceladoAntesDeFirmar':
      return 'canceled';
    case 'terminadoExpirado':
      return 'terminated';
  }
}

function contractObject(contract) {
  return {
    status: contractStatus(contract.ESTATUS_CONTRATO),
    title: contract.TITULO_CONTRATO,
    ocid: nP2Ocid(contract.NUMERO_PROCEDIMIENTO),
    suppliers: launder(contract.PROVEEDOR_CONTRATISTA),
    id: 1,
    awardID: 1,
    value: {
      amount: +contract.IMPORTE_CONTRATO,
      currency: contract.MONEDA,
    },
    date_signed: new Date(contract.FECHA_CELEBRACION).toISOString(),
  };
}


export function releaseObject(contract) {
  // doc is a contract
  const parties = [
    assign(orgObject(contract.NOMBRE_DE_LA_UC), {roles: ['buyer']}),
    assign(orgObject(contract.DEPENDENCIA), {roles: ['procuringEntity']}),
    assign(orgObject(contract.PROVEEDOR_CONTRATISTA), { roles: ['supplier']}),
    assign(orgObject(contract.ORGANISIMO), {roles: ['funder']}),
  ].filter(o => (o.id));

  return {
    ocid: nP2Ocid(contract.NUMERO_PROCEDIMIENTO),
    id: contract.NUMERO_PROCEDIMIENTO,
    date: new Date().toISOString(),
    initiationType: 'tender',
    tag: ['tender'],
    parties,
    buyer: organizationReferenceObject(contract.NOMBRE_DE_LA_UC),
    planning: planningObject(contract),
    tender: tenderObject(contract),
    awards: [
      awardObject(contract),
    ],
    contracts: [
      contractObject(contract),
    ],
  };
}

export function releasePackage(object) {
  const ocds = nP2Ocid(object.NUMERO_PROCEDIMIENTO);

  return {
    uri: `http://api.quienesquien.wiki/releases/${ocds}`,
    version: '1.1',
    publishedDate: new Date().toISOString(),
    releases: [
      object,
    ],
    publisher: {
      name: 'PODER',
      scheme: 'poder-scheme',
      uid: null,
      uri: 'https://api.quienesqien.wiki/releases/1',
    },
    'license':'http://opendatacommons.org/licenses/pddl/1.0/',
    'publicationPolicy':'https://github.com/open-contracting/sample-data/',
  }
}
