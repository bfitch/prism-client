function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
    const url = new UrlBuilder(resolvers, args, opts.url);
    const { options: { forceFetch = false, clearCache = false } = {} } = args,
          variables = _objectWithoutProperties(args, ['options']);

    if (clearCache) store.clearCache();

    const request = http({
      method: 'post',
      url: url.href,
      params: url.params,
      headers: url.headers,
      data: serialize(variables)
    });

    return request.then(res => {
      const { entities, result } = normalize(res, resolvers, variables);
      store.set(entities);

      loader.clearUrls();
      resetForceFetch(forceFetch);

      const entity = entities[entityName][result];
      update(store.cache, entity);

      return entity;
    });
  };
}
//# sourceMappingURL=create.js.map