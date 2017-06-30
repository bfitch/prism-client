export function deleteAction({
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
      method: 'delete',
      url: url.href,
      params: url.params,
      headers: url.headers,
      data: serialize(variables)
    });

    return request.then(res => {
      const { entities, result } = normalize(res, { obj: resolvers, args: variables });

      store.delete(entityName, url.id);

      loader.clearUrls();
      resetForceFetch(forceFetch);

      update(store.cache, args);
      return entities[entityName][result] || {};
    });
  }
}
