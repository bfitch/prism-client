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

  const url = new UrlBuilder(obj, args, opts);

  const { options: { forceFetch = false, clearCache = false } = {}, ...variables } = args;
  const forceFetching = (forceFetch || forceFetchResource);

  if (!forceFetching) {
    const entity = store.get(entityName, url.id);

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
    const { entities, result } = normalize(res, { obj, args: variables });

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
