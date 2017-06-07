function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

export function show({
  entityName,
  UrlBuilder,
  store,
  loader,
  normalize,
  resetForceFetch,
  forceFetchResource,
  includeResponseHeaders
}, obj, args, opts) {

  const id = opts.nestedId ? undefined : opts.id || 'id';
  const url = new UrlBuilder(obj, args, opts.url, id, opts.nestedId);
  const { options: { forceFetch = false, clearCache = false } = {} } = args,
        variables = _objectWithoutProperties(args, ['options']);
  const forceFetching = forceFetch || forceFetchResource;

  if (!forceFetching) {
    const entity = store.get(entityName, opts.nestedId || obj[id] || variables[id]);

    if (entity) {
      if (includeResponseHeaders) {
        return { headers: null, entity };
      } else {
        return entity;
      }
    }
  }
  if (forceFetching) loader.clearUrls();
  if (clearCache) store.clearCache();

  return loader.load(url).then(res => {
    const { entities, result } = normalize(res, obj, variables);
    store.set(entities);

    resetForceFetch(forceFetch);

    if (includeResponseHeaders) {
      return {
        headers: res.headers,
        entity: entities[entityName][result]
      };
    } else {
      return entities[entityName][result];
    }
  });
}
//# sourceMappingURL=show.js.map