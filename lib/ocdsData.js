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

function supplierPartyObject({contract}) {
  const org = orgObject(contract.PROVEEDOR_CONTRATISTA);

  const fields = {
    roles: ['supplier'],
    details: { compranetStatus: contract.ESTATUS_EMPRESA },
  }
  return Object.assign(org, fields);
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

function ucStringParse({string, id}) {

  let parsedString = string.replace(new RegExp(`#${id}$`), '').trim();
  if ( parsedString.split('-').length > 1) {
    // not all UC names have a second dash
    const array = /(^.*)-/.exec(parsedString);
    // remove $dependency (GE) or $state (GM) from front
    parsedString = parsedString.replace(new RegExp(`^${array[0]}`), '').trim();
  }
  return parsedString
}

function buyerObject(contract) {
  const partyID = obtainClaveFromUC(contract.NOMBRE_DE_LA_UC);
  const partyName = ucStringParse({string: contract.NOMBRE_DE_LA_UC, id: partyID});
  return {
    name: partyName,
    id: partyID,
    consolidatedProcess: contract.COMPRA_CONSOLIDADA,
  }
}

// SIGLAS - String
// DEPENDENCIA - String
// NOMBRE_DE_LA_UC - String
// Clave_UC - String
// Responsable - responsable
//
// Nuestro objetivo es transformarlo en los campos de OCDS:
// -Parties/Parent (extensión)
// -Parties/id
// -Parties/name
// -Parties/ContactPoint
// -parties/address/locality
// -parties/address/region
// -parties/address/countryName

export function buyerPartyObject(contract) {

  // FIXME error w/ cityDocument tests
  const party = {
    role: 'buyer',
  }
  switch (contract.GOBIERNO) {
  // SIGLAS Unless contain hyphen, then DEP-CITY
    case 'APF': {

      // Siempre: govlevel = country
      // Siempre: parties/address/countryName = Mexico
      // Dependencia = Parties/Parent
      // SIGLAS → Duda: En México las siglas de una dependencia son tanto o más usadas que el nombre, por  lo que deberían ser usados como un nombre alternativo de la dependencia.
      // Responsable = Parties/ContactPoint (habría que repasar lo que hace hacienda ya que es ditinto el responsable del contrato que el operador)
      // NOMBRE_DE_LA_UC está conformado por "SIGLAS-Nombre del Unidad #Clave UC"
      // -Entonces hay que: Encontrar el primer guión empezando por el principio del string y el primer # empezando por el final. Esto nos permite extraer:
      // -NOMBRE_DE_LA_UC/Nombre del Unidad → Parties/name
      const partyID = obtainClaveFromUC(contract.NOMBRE_DE_LA_UC);
      const partyName = ucStringParse({string: contract.NOMBRE_DE_LA_UC, id: partyID});
      return Object.assign(party, {
        parent: contract.DEPENDENCIA.replace(/_/, '').trim(),
        id: partyID,
        name: partyName,
        govLevel: 'country',
        contactPoint: contract.RESPONSABLE,
        address: {
          countryName: 'Mexico',
        },
      });
    }
    case 'GE': {
      // Siempre: govlevel = region
      // Siempre: parties/address/countryName = Mexico
      // Dependencia esta conformado por “_Gobierno del Estado de NombreEstado”
      // -Dependencia/NombreEstado → parties/address/region
      // NOMBRE_DE_LA_UC conformada “Iniciales Estado-Nombre Dependencia-Nombre UC #Número UC”
      // -Buscamos el caracter # por la derecha y extraemos todos los números para conformar la clave UC
      // -NOMBRE_DE_LA_UC/Número UC → Parties/id
      // -Nombre Dependencia (entre el primer y el segundo guión en el campo Unidad Compradora)
      // NOMBRE_DE_LA_UC/Nombre Dependencia → Parties/parent
      // -Nombre UC (todo el texto despúes del segundo guión y antes del #. Puede tener más guiones)
      // NOMBRE_DE_LA_UC/Nombre UC → Parties/name

      // SIGLAS: initials of  State
      const partyID = obtainClaveFromUC(contract.NOMBRE_DE_LA_UC);
      const partyName = ucStringParse({string: contract.NOMBRE_DE_LA_UC, id: partyID});
      return Object.assign(party, {
        id: partyID,
        name: partyName,
        parent: contract.NOMBRE_DE_LA_UC.split('-')[1],
        govLevel: 'region',
        address: {
          countryName: 'Mexico',
          region:  contract.DEPENDENCIA.replace(/^_Gobierno del Estado de/, '').trim(),
        },
      });
    }

    case 'GM': {
    //  SIEMPRE: govlevel → city
    //  Siempre: parties/address/countryName = Mexico
    //  Dependencia esta conformado por “_Gobierno Municipal del Estado de NombreEstado”
    //  -Dependencia/NombreEstado → parties/address/region
    //  Unidad Compradora conformada en “Iniciales Estado-Nombre Municipio-Nombre UC (que puede contener más guiones) #Número UC”
    //  -Buscamos el caracter # por la derecha y extraemos todos los números para conformar la clave UC
    //  NOMBRE_DE_LA_UC/Número UC → Parties/id
    //  -Nombre Municipio (entre el primer y el segundo guión en el campo Unidad Compradora)
    //  NOMBRE_DE_LA_UC/Nombre UC → Parties/parent
    //  NOMBRE_DE_LA_UC/Nombre UC → parties/address/locality
    //  -Nombre UC (todo el texto despúes del segundo guión y antes del útimo #)
    //  NOMBRE_DE_LA_UC/Nombre UC → Parties/name:

    //  SIGLAS: initials of organization (instituto mexicano de transporte)
      const partyID = obtainClaveFromUC(contract.NOMBRE_DE_LA_UC);
      const partyName = ucStringParse({string: contract.NOMBRE_DE_LA_UC, id: partyID});
      return Object.assign(party, {
        id: partyID,
        name: partyName,
        govLevel: 'city',
        address: {
          countryName: 'Mexico',
          region:  contract.DEPENDENCIA.replace(/^_Gobierno Municipal del Estado de/, '').trim(),
          locality: contract.NOMBRE_DE_LA_UC.split('-')[1],
        },
      });
    }
  }
}

function getParties(contract) {

  // console.log(options)
  const array = [
    buyerPartyObject(contract),
    supplierPartyObject({contract}),
  ];
  if (contract.ORGANISIMO) {
    array.push(Object.assign(orgObject(contract.ORGANISIMO), {roles: ['funder']}))
  }
  return array.filter(o => (o.id));
  // FIXME test for `UCString` of 'undefined' or 'null'.
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

export function releaseObject({contract, metadata}) {
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
    buyer: buyerObject(contract),
    planning: planningObject(contract),
    tender: tenderObject(contract),
    awards: [
      awardObject(contract),
    ],
    contracts: [
      contractObject(contract),
    ],
  };
  if (metadata && metadata.httpLastModified) {
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
  if (metadata && metadata.publisherUri) {
    Object.assign(publisher, { uri: metadata.publisherUri });
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
