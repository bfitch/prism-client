export function create({
  entityName,
  UrlBuilder,
  http,
  store,
  loader,
  serialize,
  normalize,
  resetForceFetch,
  update
}, opts) {

  return (resolvers, args, context, _) => {
    const url = new UrlBuilder(resolvers, args, opts);
    const { options: { forceFetch = false, clearCache = false } = {}, ...variables } = args;

    if (clearCache) store.clearCache();

    const request = http({
      method: 'post',
      url: url.href,
      params: url.params,
      headers: url.headers,
      data: serialize(variables)
    });

    return request.then(res => {
      const { entities, result } = normalize(res, { obj: resolvers, args: variables });
      store.set(entities);

      loader.clearUrls();
      resetForceFetch(forceFetch);

      const entity = entities[entityName][result];
      update(store.cache, entity);

      return entity;
    });
  }

}
