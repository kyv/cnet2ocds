import slug from 'slug';
import assign from 'lodash.assign';
import isNull from 'lodash.isnull';
import camelCase from 'lodash.camelcase';
import launder from 'company-laundry';

export function dateToISOString(string) {
  const [ date, time ] = string.split(' ');
  const [ year, month, day ] = date.split('-');
  if (time) {
    const [ hour, minute, second ] = time.split(':');
    if (second) {
      return new Date(Date.UTC(year, (+month -1), day, hour, minute, second)).toISOString();
    }
    return new Date(Date.UTC(year, (+month -1), day, hour, minute)).toISOString();
  }
  return new Date(Date.UTC(year, (+month -1), day)).toISOString();

}

function nP2Ocid(string) {
  // NUMERO_PROCEDIMIENTO to OCID
  return `OCDS-0UD2Q6-${string}`
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
  // FIXME 2 organismos / 1 APORTATION_FEDERAL
  // .map((s) => ({
  //   id: slug(s, { lower: true }),
  //   name: s,
  // }));

  return {
    budget: budgetObject(contract),
    //budgetBreakdown: [
    //  { // FIXME multiple organismos / 1 aportation
    //    sourceEntity: {
    //      id: slug(contract.ORGANISMO, { lower: true }),
    //      name : contract.ORGANISMO,
    //    },
    //    // period: {
    //    //   'startDate': '2016-01-01T00:00:00Z',
    //    //   'endDate': '2016-12-31T00:00:00Z',
    //    // },
    //    // id: '001',
    //    // description: 'Budget contribution from the local government',
    //    amount: {
    //      amount: contract.APORTACION_FEDERAL,
    //      // currency: 'GBP',
    //    },
    //  },
    //],
  };
}

function awardObject(contract) {
  let date = null;
  if (contract.hasOwnProperty('EXP_F_FALLO') && !isNull(contract.EXP_F_FALLO)) {
    date = dateToISOString(contract.EXP_F_FALLO);
  }

  const suppliers = [
    orgObject(contract.PROVEEDOR_CONTRATISTA),
  ];

  return {
    title: contract.TITULO_CONTRATO,
    suppliers: suppliers,
    date,
    id: 1,
    value: {
      amount: contract.IMPORTE_CONTRATO,
      currency: contract.MONEDA,
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
  let date = null;
  if (contract.hasOwnProperty('FECHA_CELEBRACION') && !isNull(contract.FECHA_CELEBRACION)) {
    date = dateToISOString(contract.FECHA_CELEBRACION);
  }

  return {
    status: contractStatus(contract.ESTATUS_CONTRATO),
    title: contract.TITULO_CONTRATO,
    ocid: nP2Ocid(contract.NUMERO_PROCEDIMIENTO),
    suppliers: launder(contract.PROVEEDOR_CONTRATISTA),
    id: contract.CODIGO_CONTRATO,
    awardID: 1,
    period: {
      startDate: dateToISOString(contract.FECHA_INICIO),
      endDate: dateToISOString(contract.FECHA_FIN),
    },
    value: {
      amount: +contract.IMPORTE_CONTRATO,
      currency: contract.MONEDA,
    },
    date_signed: date,
  };
}

export function stripSiglasFromUC(options) {
  const { NOMBRE_DE_LA_UC, SIGLAS } = options;
  const UCString = NOMBRE_DE_LA_UC
    .replace(new RegExp(`^${SIGLAS}-`), '');
  const [ siglas, city ] = SIGLAS.split(/-/);
  return {
    UCString,
    siglas,
    city,
  }
}

export function obtainClaveFromUC(string) {
  const ucArray = string.split('#');
  return ucArray[ucArray.length-1];
}

function ucStringParse(options) {
  const { field } = options;
  const claveUC = obtainClaveFromUC(options.NOMBRE_DE_LA_UC);
  let value = null;
  let { UCString, siglas, city } = stripSiglasFromUC(options);

  UCString = UCString.replace(new RegExp(`#${claveUC}$`), '').trim();
  if ( UCString.split('-').length > 1) {
    // not all UC names have a second dash
    const array = /(^.*)-/.exec(UCString);
    value = array[1];
    // remove $dependency (GE) or $state (GM) from front
    UCString = UCString.replace(new RegExp(`^${array[0]}`), '').trim();
  }

  return {
    UCString,
    claveUC,
    siglas,
    city,
    [field]: value,
  }
}

export function cnetUCRutine(contract) {
  switch (contract.GOBIERNO) {
  // SIGLAS Unless contain hyphen, then DEP-CITY
    case 'APF': {
      // SIGLAS: initials of DEPENDENCY
      return Object.assign(ucStringParse(contract), {
        dependency: contract.DEPENDENCIA.replace(/_/, '').trim(),
        gov: 'APF',
        govLevel: 'Federal',
      });
    }
    case 'GE': {
      // SIGLAS: initials of  State
      return Object.assign(ucStringParse(Object.assign(contract, {field: 'dependency'})), {
        dependency: contract.DEPENDENCIA.replace(/_/, '').trim(),
        gov: 'GE',
        govLevel: 'State',
      });
    }

    case 'GM': {
      // SIGLAS: initials of organization (instituto mexicano de transporte)
      return Object.assign(ucStringParse(Object.assign(contract, {field: 'dependency'})), {
        state: contract.DEPENDENCIA.replace(/^_Gobierno .* del Estado de/, '').trim(),
        gov: 'GM',
        govLevel: 'City',
      });
    }
  }
}

function getParties(contract) {
  // WORKAROUND Cannot destructure property `UCString` of 'undefined' or 'null'.
  try {
    // FIXME implement remaining fields such as address
    const { UCString, claveUC, dependency, govLevel, city, state } = cnetUCRutine(contract);
    // console.log(cnetUCRutine(contract));
    return [
      assign(orgObject(dependency), {
        roles: ['buyer'],
        contactPoint: { name: contract.RESPONSABLE },
        // FIXME add department to extensions
        department: {
          name: UCString,
          id: claveUC,
        },
      }),
      assign(orgObject(contract.PROVEEDOR_CONTRATISTA),
        { roles: ['supplier'] },
        { details: { compranetStatus: contract.ESTATUS_EMPRESA }}
      ),
      assign(orgObject(contract.ORGANISIMO), {roles: ['funder']}),
    ].filter(o => (o.id));
  }
  catch(e) {
    console.log(e.message);
  }
}

function releaseTags(contract) {
  if (/ACTIVO/i.test(contract.ESTATUS_CONTRATO)) {
    return [
      'contract',
    ]
  }

  if (/TERMINADO|EXPIRADO/i.test(contract.ESTATUS_CONTRATO)) {
    return [
      'contractTermination',
    ]
  }
  return null;
}

export function releaseObject(contract) {
  // doc is a contract
  const parties = getParties(contract);
  const source = [];
  if (contract.ANUNCIO) {
    source.push(contract.ANUNCIO);
  }
  if (contract.URL) {
    source.push(contract.URL);
  }

  const release = {
    ocid: nP2Ocid(contract.NUMERO_PROCEDIMIENTO),
    id: contract.NUMERO_PROCEDIMIENTO,
    initiationType: 'tender',
    source,
    tag: releaseTags(contract),
    language: 'es',
    parties,
    // buyer: organizationReferenceObject(contract.NOMBRE_DE_LA_UC),
    planning: planningObject(contract),
    tender: tenderObject(contract),
    awards: [
      awardObject(contract),
    ],
    contracts: [
      contractObject(contract),
    ],
  };
  if (metadata) {
    const date = new Date(metadata.httpLastModified).toISOString();
    Object.assign(release, { date });
  }
  return release;
}

export function releasePackage({release, metadata}) {
  const publisher = {
    name: 'PODER',
    scheme: 'poder-scheme',
    uid: null,
  }

  if (metadata) {
    Object.assign(publisher, { uri: metadata.body.ANUNCIO });
  }

  return {
    uri: `http://api.quienesquien.wiki/releases/${release.ocid}`,
    version: '1.1',
    publishedDate: new Date().toISOString(),
    extensions: [
      'https://raw.githubusercontent.com/open-contracting/ocds_budget_breakdown_extension/master/extension.json',
      'https://raw.githubusercontent.com/open-contracting/ocds_multiple_buyers_extension/master/extension.json',
      'https://raw.githubusercontent.com/open-contracting/ocds_partyDetails_scale_extension/master/extension.json',
      'https://raw.githubusercontent.com/open-contracting/ocds_process_title_extension/v1.1.1/extension.json',
      'https://raw.githubusercontent.com/kyv/ocds-quienesquienwiki-compranet/master/extension.json',
    ],
    releases: [
      release,
    ],
    publisher,
    license:'https://creativecommons.org/licenses/by-sa/4.0/',
    publicationPolicy:'https://github.com/open-contracting/sample-data/',
  }
}
