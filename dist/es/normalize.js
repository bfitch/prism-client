import { camelizeCollection, camelizeKeys } from './utils/camelize';
import { normalize, schema } from 'normalizr';
const { isArray } = Array;

export default function Normalizer(entityName, opts) {
  const normalizeFn = opts.normalize || defaultNormalize(entityName);
  const parse = opts.parse || (res => res.data);
  const store = opts.store.cache;

  return function (res, { obj, args }) {
    const data = parse(res);
    return normalize(camelizer(data), normalizeFn(data, { obj, args, store }));
  };
}

function camelizer(data) {
  return isArray(data) ? camelizeCollection(data) : camelizeKeys(data);
}

function defaultNormalize(entityName) {
  return (data, { obj, args }) => isArray(data) ? [new schema.Entity(entityName)] : new schema.Entity(entityName);
}
//# sourceMappingURL=normalize.js.map