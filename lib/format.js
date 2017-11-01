import mapValues from 'lodash.mapvalues';
import isString from 'lodash.isstring';
import normalize from 'normalize-space';

export default function cleanValues(object) {
  return mapValues(object, (v) => {
    if (+v) {
      return +v;
    }
    if (isString(v)) {
      // trim and normalize
      return normalize(v.trim());
    }
    return v;
  });
}
