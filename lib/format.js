import mapValues from 'lodash.mapvalues';
import isString from 'lodash.isstring';
import normalize from 'normalize-space';
import releasePackage from './ocdsData';

function cleanValues(object) {
  return mapValues(object, (v) => {
    if (isString(v)) {
      // trim and normalize
      return normalize(v.trim());
    }
    return v;
  });
}

export default function(object) {
  const cleanObject = cleanValues(object);
  return releasePackage(cleanObject);
}
