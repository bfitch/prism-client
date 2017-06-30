var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import UrlBuilderFactory from './url-builder';
import Normalizer from './normalize';
import { indexAction, show, create, update, deleteAction } from './actions';

export default function Resolver({ store, loader, http, host }) {
  return class Resolver {
    constructor(options = {}) {
      this.entityName = options.entityName;
      this.normalize = options.normalize;
      this.parse = options.parse;
      this.serialize = options.serialize;
      this.store = store;
      this.forceFetch = false;
      this.actionContext = {
        UrlBuilder: UrlBuilderFactory(options.host || host, options.url),
        resetForceFetch: value => this.forceFetch = value,
        entityName: this.entityName,
        store,
        loader,
        http
      };
    }

    index(opts = {}) {
      const storeQuery = opts.storeQuery || (args => obj => true);
      return indexAction(_extends({}, this.resourceContext(opts), { storeQuery }), opts);
    }

    show(_ref = {}) {
      let { ids } = _ref,
          opts = _objectWithoutProperties(_ref, ['ids']);

      if (ids) {
        return (obj, args, context, _) => {
          return Promise.all(obj[ids].map(idValue => {
            return show(this.resourceContext(opts), obj, args, _extends({}, opts, { idValue }));
          }));
        };
      } else {
        return (obj, args, context, _) => show(this.resourceContext(opts), obj, args, opts);
      }
    }

    create(opts = {}) {
      return create(this.mutationContext(opts), opts);
    }

    update(opts = {}) {
      return update(this.mutationContext(opts), opts);
    }

    delete(opts = {}) {
      return deleteAction(this.mutationContext(opts), opts);
    }

    resourceContext(opts) {
      return _extends({}, this.actionContext, {
        normalize: Normalizer(this.entityName, this.normalizeOpts(opts)),
        forceFetchResource: this.forceFetch,
        includeResponseHeaders: opts.includeResponseHeaders || false
      });
    }

    mutationContext(opts) {
      return _extends({}, this.actionContext, {
        normalize: Normalizer(this.entityName, this.normalizeOpts(opts)),
        serialize: opts.serialize || this.serialize || (args => args),
        update: opts.update || ((...args) => args)
      });
    }

    normalizeOpts(opts) {
      return {
        normalize: opts.normalize || this.normalize,
        parse: opts.parse || this.parse,
        store: this.store
      };
    }
  };
}
//# sourceMappingURL=resolver.js.map