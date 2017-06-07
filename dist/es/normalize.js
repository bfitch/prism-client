import { camelizeCollection, camelizeKeys } from './utils/camelize';
import { normalize, schema } from 'normalizr';

export default function Normalizer(_parse, __normalize, entityName) {
  const parse = _parse || (res => res.data);
  const normalizeFn = __normalize || defaultNormalizer(entityName);

  return (res, obj, args) => {
    const data = parse(res);
    return normalize(camelizer(data), normalizeFn(obj, args, data));
  };
}

function camelizer(data) {
  if (Array.isArray(data)) {
    return camelizeCollection(data);
  } else {
    return camelizeKeys(data);
  }
}

function defaultNormalizer(entityName) {
  return (obj, args, data) => {
    if (Array.isArray(data)) {
      return [new schema.Entity(entityName)];
    } else {
      return new schema.Entity(entityName);
    }
  };
}
//# sourceMappingURL=normalize.js.map