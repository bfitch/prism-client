import axios from 'axios';
import Loader from './loader';
import Store from './store';
import UrlBuilderFactory from './url-builder';
import Normalizer from './normalize';
const { values } = Object;

export function createResolver({ host, headers }) {
  const store  = new Store();
  const http   = axios.create({headers});
  const loader = new Loader(http);

  return class Resolver {
    static store  = store;
    static loader = loader;

    constructor(options = {}) {
      this.store      = store;
      this.entityName = options.entityName;
      this.serialize  = options.serialize;
      this.loader     = loader;
      this.UrlBuilder = UrlBuilderFactory((options.host || host), options.url);
      this.forceFetch = false;
    }

    index(opts = {}) {
      const normalize              = Normalizer(opts.parse, opts.normalize, this.entityName);
      const storeQuery             = opts.storeQuery || (args => obj => true);
      const includeResponseHeaders = opts.includeResponseHeaders || false;

      return (obj, args, context, _) => {
        const url = new this.UrlBuilder(obj, args, opts.url);
        const {
          options: { forceFetch = false, clearCache = false } = {},
          ...variables
        } = args;
        const forceFetching = (forceFetch || this.forceFetch);

        if (!forceFetching) {
          const entity = this.store.get(this.entityName);
          if (entity) {
            const entities = entity.filter(storeQuery(obj, variables));

            if (includeResponseHeaders) {
              return { headers: null, entities };
            } else {
              return entities;
            }
          }
        }
        if (forceFetching) this.loader.clearUrls();
        if (clearCache) this.store.clearCache();

        return this.loader.load(url, { cache: true })
          .then(res => {
            const { entities } = normalize(res, obj, variables);
            this.store.set(entities);

            this.forceFetch = false;

            const entityValues = values((entities[this.entityName] || {}));

            if (includeResponseHeaders) {
              return { headers: res.headers, entities: entityValues };
            } else {
              return entityValues;
            }
          });
      }
    }

    show(opts = {}) {
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const ids       = opts.ids;

      if (ids) {
        return (obj, args, context, _) => {
          return Promise.all(obj[ids].map(nestedId => {
            return this._show(obj, args, normalize, {...opts, nestedId });
          }));
        }

      } else {
        return (obj, args, context, _) => {
          return this._show(obj, args, normalize, opts);
        }
      }
    }

    _show = (obj, args, normalize, opts) => {
      const nestedId               = opts.nestedId;
      const id                     = nestedId ? undefined : (opts.id || 'id');
      const includeResponseHeaders = opts.includeResponseHeaders || false;

        const url = new this.UrlBuilder(obj, args, opts.url, id, nestedId);
        const {
          options: { forceFetch = false, clearCache = false } = {},
          ...variables
        } = args;
        const forceFetching = (forceFetch || this.forceFetch);

        if (!forceFetching) {
          const entity = this.store.get(this.entityName, (nestedId || obj[id] || variables[id]));

          if (entity) {
            if (includeResponseHeaders) {
              return { headers: null, entity };
            } else {
              return entity;
            }
          }
        }
        if (forceFetching) this.loader.clear(url);
        if (clearCache) this.store.clearCache();

        return this.loader.load(url)
          .then(res => {
            const { entities, result } = normalize(res, obj, variables);
            this.store.set(entities);

            this.forceFetch = false;

            if (includeResponseHeaders) {
              return {
                headers: res.headers,
                entity: entities[this.entityName][result]
              };
            } else {
              return entities[this.entityName][result];
            }
          });
    }

    create(opts = {}) {
      const serialize = opts.serialize || this.serialize || ((args) => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const update    = opts.update || ((...args) => args);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url);
        const {
          options: { forceFetch = false, clearCache = false } = {},
          ...variables
        } = args;

        if (clearCache) this.store.clearCache();

        const request = http({
          method: 'post',
          url: url.href,
          params: url.params,
          headers: url.headers,
          data: serialize(variables)
        });

        return request.then(res => {
          const { entities, result } = normalize(res, resolvers, variables);
          this.store.set(entities);

          this.loader.clearUrls();
          this.forceFetch = forceFetch;

          const entity = entities[this.entityName][result];

          update(Resolver.store.cache, entity);

          return entity;
        });
      }
    }

    update({ id = 'id', method = 'put', ...opts } = {}) {
      const serialize = opts.serialize || this.serialize || ((args) => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url, id);
        const {
          options: { forceFetch = false, clearCache = false } = {},
          ...variables
        } = args;

        if (clearCache) this.store.clearCache();

        const request = http({
          method,
          url: url.href,
          params: url.params,
          headers: url.headers,
          data: serialize(variables)
        });

        return request.then(res => {
          const { entities, result } = normalize(res, resolvers, variables);
          this.store.set(entities);

          this.loader.clear(url);
          this.forceFetch = forceFetch;

          return entities[this.entityName][result];
        });
      }
    }

    delete({ id = 'id', ...opts } = {}) {
      const serialize = opts.serialize || this.serialize || ((args) => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const update    = opts.update || ((...args) => args);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url, id);
        const {
          options: { forceFetch = false, clearCache = false } = {},
          ...variables
        } = args;

        const request = http({
          method: 'delete',
          url: url.href,
          params: url.params,
          headers: url.headers,
          data: serialize(variables)
        });

        return request.then(res => {
          const { entities, result } = normalize(res, resolvers, variables);

          this.store.delete(this.entityName, url.id);

          if (clearCache) {
            this.store.clearCache();
            this.loader.clearUrls();
          }

          this.loader.clear(url);
          this.forceFetch = forceFetch;

          update(Resolver.store.cache, args);

          return entities[this.entityName][result] || {};
        });
      }
    }

  }
}
