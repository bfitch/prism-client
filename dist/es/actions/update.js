function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

export function update({
  entityName,
  UrlBuilder,
  http,
  store,
  loader,
  serialize,
  normalize,
  resetForceFetch,
  update
}, _ref) {
  let { method = 'put' } = _ref,
      opts = _objectWithoutProperties(_ref, ['method']);

  return (resolvers, args, context, _) => {
    const url = new UrlBuilder(resolvers, args, opts);
    const { options: { forceFetch = false, clearCache = false } = {} } = args,
          variables = _objectWithoutProperties(args, ['options']);

    if (clearCache) store.clearCache();

    const request = http({
      method,
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
  };
}
//# sourceMappingURL=update.js.map