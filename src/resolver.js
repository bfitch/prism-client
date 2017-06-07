import UrlBuilderFactory from './url-builder';
import Normalizer from './normalize';
import index from './actions/index';
import show from './actions/show';
import create from './actions/create';
import update from './actions/update';
import deleteAction from './actions/delete';

export default function Resolver({ store, loader, http, host }) {
  return class Resolver {
    constructor(options = {}) {
      this.entityName = options.entityName;
      this.forceFetch = false;

      this.actionContext = {
        UrlBuilder: UrlBuilderFactory((options.host || host), options.url),
        resetForceFetch: (value) => (this.forceFetch = value),
        entityName: this.entityName,
        store,
        loader,
        http
      }
    }

    index(opts = {}) {
      return index({
        ...this.actionContext,
        forceFetchResource: this.forceFetch,
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        includeResponseHeaders: (opts.includeResponseHeaders || false),
        storeQuery: (opts.storeQuery || (args => obj => true))
      }, opts);
    }

    show({ ids , ...opts } = {}) {
      const resourceContext = {
        ...this.actionContext,
        forceFetchResource: this.forceFetch,
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        includeResponseHeaders: (opts.includeResponseHeaders || false)
      };

      if (ids) {
        return (obj, args, context, _) => {
          return Promise.all(obj[ids].map(nestedId => {
            return show(resourceContext, obj, args, { ...opts, nestedId });
          }));
        }
      } else {
        return (obj, args, context, _) => {
          return show(resourceContext, obj, args, opts);
        }
      }
    }

    create(opts = {}) {
      return create({
        ...this.actionContext,
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: (opts.serialize || this.serialize || ((args) => args)),
        update: (opts.update || ((...args) => args))
      }, opts);
    }

    update(opts = {}) {
      return update({
        ...this.actionContext,
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: (opts.serialize || this.serialize || ((args) => args)),
        update: (opts.update || ((...args) => args))
      }, opts);
    }

    delete(opts = {}) {
      return deleteAction({ // delete is a reserved word
        ...this.actionContext,
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: (opts.serialize || this.serialize || ((args) => args)),
        update: (opts.update || ((...args) => args))
      }, opts);
    }
  }
}
