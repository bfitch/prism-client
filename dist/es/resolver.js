var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import UrlBuilderFactory from './url-builder';
import Normalizer from './normalize';
import { indexAction, show, create, update, deleteAction } from './actions';

export default function Resolver({ store, loader, http, host }) {
  return class Resolver {
    constructor(options = {}) {
      this.entityName = options.entityName;
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
      return indexAction(_extends({}, this.actionContext, {
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        forceFetchResource: this.forceFetch,
        includeResponseHeaders: opts.includeResponseHeaders || false,
        storeQuery: opts.storeQuery || (args => obj => true)
      }), opts);
    }

    show(_ref = {}) {
      let { ids } = _ref,
          opts = _objectWithoutProperties(_ref, ['ids']);

      const resourceContext = _extends({}, this.actionContext, {
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        forceFetchResource: this.forceFetch,
        includeResponseHeaders: opts.includeResponseHeaders || false
      });

      if (ids) {
        return (obj, args, context, _) => {
          return Promise.all(obj[ids].map(nestedId => {
            return show(resourceContext, obj, args, _extends({}, opts, { nestedId }));
          }));
        };
      } else {
        return (obj, args, context, _) => {
          return show(resourceContext, obj, args, opts);
        };
      }
    }

    create(opts = {}) {
      return create(_extends({}, this.actionContext, {
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: opts.serialize || this.serialize || (args => args),
        update: opts.update || ((...args) => args)
      }), opts);
    }

    update(opts = {}) {
      return update(_extends({}, this.actionContext, {
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: opts.serialize || this.serialize || (args => args),
        update: opts.update || ((...args) => args)
      }), opts);
    }

    delete(opts = {}) {
      return deleteAction(_extends({}, this.actionContext, {
        normalize: Normalizer(opts.parse, opts.normalize, this.entityName),
        serialize: opts.serialize || this.serialize || (args => args),
        update: opts.update || ((...args) => args)
      }), opts);
    }
  };
}
//# sourceMappingURL=resolver.js.map