const { values } = Object;

export default function index({
  entityName,
  UrlBuilder,
  store,
  loader,
  normalize,
  resetForceFetch,
  forceFetchResource,
  storeQuery,
  includeResponseHeaders
}, opts) {

  return (obj, args, context, _) => {
    const url = new UrlBuilder(obj, args, opts.url);
    const { options: { forceFetch = false, clearCache = false } = {}, ...variables } = args;
    const forceFetching = (forceFetch || forceFetchResource);

    if (!forceFetching) {
      const entity = store.get(entityName);
      if (entity) {
        const entities = entity.filter(storeQuery(obj, variables));

        if (includeResponseHeaders) {
          return { headers: null, entities };
        } else {
          return entities;
        }
      }
    }
    if (forceFetching) loader.clearUrls();
    if (clearCache) store.clearCache();

    return loader.load(url).then(res => {
      const { entities } = normalize(res, obj, variables);
      store.set(entities);

      resetForceFetch(forceFetch);

      const entityValues = values((entities[entityName] || {}));

      if (includeResponseHeaders) {
        return { headers: res.headers, entities: entityValues };
      } else {
        return entityValues;
      }
    });
  }
}