'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var graphql = require('graphql');
var graphqlTools_schemaGenerator = require('graphql-tools/schemaGenerator');

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios$1 = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios$1.Axios = Axios;

// Factory for creating new instances
axios$1.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios$1.Cancel = require('./cancel/Cancel');
axios$1.CancelToken = require('./cancel/CancelToken');
axios$1.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios$1.all = function all(promises) {
  return Promise.all(promises);
};
axios$1.spread = require('./helpers/spread');

module.exports = axios$1;

// Allow use of default import syntax in TypeScript
module.exports.default = axios$1;

var axios$2 = Object.freeze({

});

var require$$0 = ( axios$2 && undefined ) || axios$2;

var index = require$$0;

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
  'use strict';

  exports.__esModule = true;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /**
   * A `DataLoader` creates a public API for loading data from a particular
   * data back-end with unique keys such as the `id` column of a SQL table or
   * document name in a MongoDB database, given a batch loading function.
   *
   * Each `DataLoader` instance contains a unique memoized cache. Use caution when
   * used in long-lived applications or those which serve many users with
   * different access permissions and consider creating a new instance per
   * web request.
   */

  // Optionally turn off batching or caching or provide a cache key function or a
  // custom cache instance.
  var DataLoader = function () {
    function DataLoader(batchLoadFn, options) {
      _classCallCheck(this, DataLoader);

      if (typeof batchLoadFn !== 'function') {
        throw new TypeError('DataLoader must be constructed with a function which accepts ' + ('Array<key> and returns Promise<Array<value>>, but got: ' + batchLoadFn + '.'));
      }
      this._batchLoadFn = batchLoadFn;
      this._options = options;
      this._promiseCache = options && options.cacheMap || new Map();
      this._queue = [];
    }

    // Private


    /**
     * Loads a key, returning a `Promise` for the value represented by that key.
     */
    DataLoader.prototype.load = function load(key) {
      var _this = this;

      if (key === null || key === undefined) {
        throw new TypeError('The loader.load() function must be called with a value,' + ('but got: ' + String(key) + '.'));
      }

      // Determine options
      var options = this._options;
      var shouldBatch = !options || options.batch !== false;
      var shouldCache = !options || options.cache !== false;
      var cacheKeyFn = options && options.cacheKeyFn;
      var cacheKey = cacheKeyFn ? cacheKeyFn(key) : key;

      // If caching and there is a cache-hit, return cached Promise.
      if (shouldCache) {
        var cachedPromise = this._promiseCache.get(cacheKey);
        if (cachedPromise) {
          return cachedPromise;
        }
      }

      // Otherwise, produce a new Promise for this value.
      var promise = new Promise(function (resolve, reject) {
        // Enqueue this Promise to be dispatched.
        _this._queue.push({ key: key, resolve: resolve, reject: reject });

        // Determine if a dispatch of this queue should be scheduled.
        // A single dispatch should be scheduled per queue at the time when the
        // queue changes from "empty" to "full".
        if (_this._queue.length === 1) {
          if (shouldBatch) {
            // If batching, schedule a task to dispatch the queue.
            enqueuePostPromiseJob(function () {
              return dispatchQueue(_this);
            });
          } else {
            // Otherwise dispatch the (queue of one) immediately.
            dispatchQueue(_this);
          }
        }
      });

      // If caching, cache this promise.
      if (shouldCache) {
        this._promiseCache.set(cacheKey, promise);
      }

      return promise;
    };

    /**
     * Loads multiple keys, promising an array of values:
     *
     *     var [ a, b ] = await myLoader.loadMany([ 'a', 'b' ]);
     *
     * This is equivalent to the more verbose:
     *
     *     var [ a, b ] = await Promise.all([
     *       myLoader.load('a'),
     *       myLoader.load('b')
     *     ]);
     *
     */

    DataLoader.prototype.loadMany = function loadMany(keys) {
      var _this2 = this;

      if (!Array.isArray(keys)) {
        throw new TypeError('The loader.loadMany() function must be called with Array<key> ' + ('but got: ' + keys + '.'));
      }
      return Promise.all(keys.map(function (key) {
        return _this2.load(key);
      }));
    };

    /**
     * Clears the value at `key` from the cache, if it exists. Returns itself for
     * method chaining.
     */

    DataLoader.prototype.clear = function clear(key) {
      var cacheKeyFn = this._options && this._options.cacheKeyFn;
      var cacheKey = cacheKeyFn ? cacheKeyFn(key) : key;
      this._promiseCache.delete(cacheKey);
      return this;
    };

    /**
     * Clears the entire cache. To be used when some event results in unknown
     * invalidations across this particular `DataLoader`. Returns itself for
     * method chaining.
     */

    DataLoader.prototype.clearAll = function clearAll() {
      this._promiseCache.clear();
      return this;
    };

    /**
     * Adds the provied key and value to the cache. If the key already exists, no
     * change is made. Returns itself for method chaining.
     */

    DataLoader.prototype.prime = function prime(key, value) {
      var cacheKeyFn = this._options && this._options.cacheKeyFn;
      var cacheKey = cacheKeyFn ? cacheKeyFn(key) : key;

      // Only add the key if it does not already exist.
      if (this._promiseCache.get(cacheKey) === undefined) {
        // Cache a rejected promise if the value is an Error, in order to match
        // the behavior of load(key).
        var promise = value instanceof Error ? Promise.reject(value) : Promise.resolve(value);

        this._promiseCache.set(cacheKey, promise);
      }

      return this;
    };

    return DataLoader;
  }();

  // Private: Enqueue a Job to be executed after all "PromiseJobs" Jobs.
  //
  // ES6 JavaScript uses the concepts Job and JobQueue to schedule work to occur
  // after the current execution context has completed:
  // http://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues
  //
  // Node.js uses the `process.nextTick` mechanism to implement the concept of a
  // Job, maintaining a global FIFO JobQueue for all Jobs, which is flushed after
  // the current call stack ends.
  //
  // When calling `then` on a Promise, it enqueues a Job on a specific
  // "PromiseJobs" JobQueue which is flushed in Node as a single Job on the
  // global JobQueue.
  //
  // DataLoader batches all loads which occur in a single frame of execution, but
  // should include in the batch all loads which occur during the flushing of the
  // "PromiseJobs" JobQueue after that same execution frame.
  //
  // In order to avoid the DataLoader dispatch Job occuring before "PromiseJobs",
  // A Promise Job is created with the sole purpose of enqueuing a global Job,
  // ensuring that it always occurs after "PromiseJobs" ends.


  // If a custom cache is provided, it must be of this type (a subset of ES6 Map).

  /**
   *  Copyright (c) 2015, Facebook, Inc.
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree. An additional grant
   *  of patent rights can be found in the PATENTS file in the same directory.
   */

  // A Function, which when given an Array of keys, returns a Promise of an Array
  // of values or Errors.


  exports.default = DataLoader;
  function enqueuePostPromiseJob(fn) {
    if (!resolvedPromise) {
      resolvedPromise = Promise.resolve();
    }
    resolvedPromise.then(function () {
      return process.nextTick(fn);
    });
  }

  // Private: cached resolved Promise instance
  var resolvedPromise;

  // Private: given the current state of a Loader instance, perform a batch load
  // from its current queue.
  function dispatchQueue(loader) {
    // Take the current loader queue, replacing it with an empty queue.
    var queue = loader._queue;
    loader._queue = [];

    // If a maxBatchSize was provided and the queue is longer, then segment the
    // queue into multiple batches, otherwise treat the queue as a single batch.
    var maxBatchSize = loader._options && loader._options.maxBatchSize;
    if (maxBatchSize && maxBatchSize > 0 && maxBatchSize < queue.length) {
      for (var i = 0; i < queue.length / maxBatchSize; i++) {
        dispatchQueueBatch(loader, queue.slice(i * maxBatchSize, (i + 1) * maxBatchSize));
      }
    } else {
      dispatchQueueBatch(loader, queue);
    }
  }

  function dispatchQueueBatch(loader, queue) {
    // Collect all keys to be loaded in this dispatch
    var keys = queue.map(function (_ref) {
      var key = _ref.key;
      return key;
    });

    // Call the provided batchLoadFn for this loader with the loader queue's keys.
    var batchLoadFn = loader._batchLoadFn;
    var batchPromise = batchLoadFn(keys);

    // Assert the expected response from batchLoadFn
    if (!batchPromise || typeof batchPromise.then !== 'function') {
      return failedDispatch(loader, queue, new TypeError('DataLoader must be constructed with a function which accepts ' + 'Array<key> and returns Promise<Array<value>>, but the function did ' + ('not return a Promise: ' + String(batchPromise) + '.')));
    }

    // Await the resolution of the call to batchLoadFn.
    batchPromise.then(function (values) {

      // Assert the expected resolution from batchLoadFn.
      if (!Array.isArray(values)) {
        throw new TypeError('DataLoader must be constructed with a function which accepts ' + 'Array<key> and returns Promise<Array<value>>, but the function did ' + ('not return a Promise of an Array: ' + String(values) + '.'));
      }
      if (values.length !== keys.length) {
        throw new TypeError('DataLoader must be constructed with a function which accepts ' + 'Array<key> and returns Promise<Array<value>>, but the function did ' + 'not return a Promise of an Array of the same length as the Array ' + 'of keys.' + ('\n\nKeys:\n' + String(keys)) + ('\n\nValues:\n' + String(values)));
      }

      // Step through the values, resolving or rejecting each Promise in the
      // loaded queue.
      queue.forEach(function (_ref2, index) {
        var key = _ref2.key;
        var resolve = _ref2.resolve;
        var reject = _ref2.reject;

        var value = values[index];
        if (value instanceof Error) {
          reject(value);
        } else {
          resolve(value);
        }
      });
    }).catch(function (error) {
      return failedDispatch(loader, queue, error);
    });
  }

  // Private: do not cache individual loads if the entire batch dispatch fails,
  // but still reject each request so they do not hang.
  function failedDispatch(loader, queue, error) {
    queue.forEach(function (_ref3) {
      var key = _ref3.key;
      var reject = _ref3.reject;

      loader.clear(key);
      reject(error);
    });
  }

  // Private
  module.exports = exports['default'];
});

var DataLoader = unwrapExports(index$1);

class Loader {
  constructor(http) {
    // this.cachedUrls = {};
    // this.indexUrls  = [];
    this.loader = new DataLoader(fetchEntity(http, this.cachedUrls));
  }

  load(urlObject, { cache } = { cache: false }) {
    const url = stringify(urlObject);

    // if (cache) {
    //   const index = this.indexUrls.indexOf(url);
    //   if (index > -1) this.indexUrls.splice(index, 1);
    //   this.indexUrls.push(url);
    // }
    return this.loader.load(url);
  }

  clearUrls() {
    // this.indexUrls.forEach(url => this.clear(url));
    this.loader._promiseCache.clear();
  }

  clear(urlObject) {
    let url;

    if (!(typeof urlObject === 'string')) {
      url = stringify(urlObject);
    } else {
      url = urlObject;
    }

    // if (this.cachedUrls[url]) {
    //   delete this.cachedUrls[url];
    this.loader.clear(url);
    // }
  }
}

function fetchEntity(http, cachedUrls) {
  // dataloader's caching function: URL => HTTP response.
  // stores any recieved URL/responses in the dataloader cache.
  return urls => {
    return Promise.all(urls.map(url => {
      // Object.assign(cachedUrls, { [url]: url });
      return http(JSON.parse(url));
    }));
  };
}

function stringify(urlObject) {
  const { href, params, headers } = urlObject;
  return JSON.stringify({ url: href, params, headers });
}

class Store {
  constructor(cache = { entities: {} }) {
    this._cache = cache;
  }

  get cache() {
    return this._cache.entities;
  }

  clearCache() {
    this._cache.entities = {};
  }

  get(entityName, id = undefined) {
    const entity = this.cache[entityName];

    if (id) return entity ? entity[id] : null;
    return entity ? Object.values(entity) : null;
  }

  delete(entityName, id) {
    delete this.cache[entityName][id];
  }

  set(entities) {
    for (const entity in entities) {
      if (this.cache[entity]) {
        Object.assign(this.cache[entity], entities[entity]);
      } else {
        this.cache[entity] = entities[entity];
      }
    }
  }
}

function UrlBuilderFactory(host = '', defaultUrl) {
  return class UrlBuilder {
    constructor(_obj, args, urlFn, id, idValue) {
      const obj = args && Object.keys(args).length ? args : _obj;
      this.id = idValue || (obj[id] ? obj[id] : Object.values(obj).pop()[id]);
      this.customUrl = urlFn && urlFn(obj) || defaultUrl;
    }

    get href() {
      return `${host}${this.path()}`;
    }

    get params() {
      return this._customUrl().params;
    }

    get headers() {
      return this._customUrl().headers;
    }

    path() {
      if (this.id) return `${this._customUrl().url}/${this.id}`;
      return this._customUrl().url;
    }

    _customUrl() {
      if (typeof this.customUrl === 'string') {
        return {
          url: this.customUrl,
          params: undefined,
          headers: undefined
        };
      } else {
        return {
          url: this.customUrl.url || defaultUrl,
          params: this.customUrl.params,
          headers: this.customUrl.headers
        };
      }
    }
  };
}

function camelizeCollection(data) {
  return data.map(obj => camelizeKeys(obj));
}

function camelizeKeys(data) {
  return Object.entries(data).reduce((camelizedData, [key, value]) => {
    if (value.constructor && value.constructor === Object) {
      return camelizeKeys(value);
    } else {
      return Object.assign(camelizedData, { [camelize(key)]: value });
    }
  }, {});
}

function camelize(string) {
  return string.replace(/(_\w)/g, function (k) {
    return k[1].toUpperCase();
  });
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _extends$1 = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _ImmutableUtils = require('./ImmutableUtils');

var ImmutableUtils = _interopRequireWildcard(_ImmutableUtils);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var getDefaultGetId = function getDefaultGetId(idAttribute) {
  return function (input) {
    return ImmutableUtils.isImmutable(input) ? input.get(idAttribute) : input[idAttribute];
  };
};

var EntitySchema = function () {
  function EntitySchema(key) {
    var definition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, EntitySchema);

    if (!key || typeof key !== 'string') {
      throw new Error('Expected a string key for Entity, but found ' + key + '.');
    }

    var _options$idAttribute = options.idAttribute,
        idAttribute = _options$idAttribute === undefined ? 'id' : _options$idAttribute,
        _options$mergeStrateg = options.mergeStrategy,
        mergeStrategy = _options$mergeStrateg === undefined ? function (entityA, entityB) {
      return _extends$1({}, entityA, entityB);
    } : _options$mergeStrateg,
        _options$processStrat = options.processStrategy,
        processStrategy = _options$processStrat === undefined ? function (input) {
      return _extends$1({}, input);
    } : _options$processStrat;

    this._key = key;
    this._getId = typeof idAttribute === 'function' ? idAttribute : getDefaultGetId(idAttribute);
    this._idAttribute = idAttribute;
    this._mergeStrategy = mergeStrategy;
    this._processStrategy = processStrategy;
    this.define(definition);
  }

  _createClass(EntitySchema, [{
    key: 'define',
    value: function define(definition) {
      this.schema = Object.keys(definition).reduce(function (entitySchema, key) {
        var schema = definition[key];
        return _extends$1({}, entitySchema, _defineProperty({}, key, schema));
      }, this.schema || {});
    }
  }, {
    key: 'getId',
    value: function getId(input, parent, key) {
      return this._getId(input, parent, key);
    }
  }, {
    key: 'merge',
    value: function merge(entityA, entityB) {
      return this._mergeStrategy(entityA, entityB);
    }
  }, {
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this = this;

      var processedEntity = this._processStrategy(input, parent, key);
      Object.keys(this.schema).forEach(function (key) {
        if (processedEntity.hasOwnProperty(key) && _typeof(processedEntity[key]) === 'object') {
          var schema = _this.schema[key];
          processedEntity[key] = visit(processedEntity[key], processedEntity, key, schema, addEntity);
        }
      });

      addEntity(this, processedEntity, input, parent, key);
      return this.getId(input, parent, key);
    }
  }, {
    key: 'denormalize',
    value: function denormalize(entity, unvisit) {
      var _this2 = this;

      if (ImmutableUtils.isImmutable(entity)) {
        return ImmutableUtils.denormalizeImmutable(this.schema, entity, unvisit);
      }

      Object.keys(this.schema).forEach(function (key) {
        if (entity.hasOwnProperty(key)) {
          var schema = _this2.schema[key];
          entity[key] = unvisit(entity[key], schema);
        }
      });
      return entity;
    }
  }, {
    key: 'key',
    get: function get() {
      return this._key;
    }
  }, {
    key: 'idAttribute',
    get: function get() {
      return this._idAttribute;
    }
  }]);

  return EntitySchema;
}();

exports.default = EntitySchema;

var Entity = Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass$1 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Polymorphic = require('./Polymorphic');

var _Polymorphic2 = _interopRequireDefault(_Polymorphic);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var UnionSchema = function (_PolymorphicSchema) {
  _inherits(UnionSchema, _PolymorphicSchema);

  function UnionSchema(definition, schemaAttribute) {
    _classCallCheck$1(this, UnionSchema);

    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    return _possibleConstructorReturn(this, (UnionSchema.__proto__ || Object.getPrototypeOf(UnionSchema)).call(this, definition, schemaAttribute));
  }

  _createClass$1(UnionSchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      return this.normalizeValue(input, parent, key, visit, addEntity);
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      return this.denormalizeValue(input, unvisit);
    }
  }]);

  return UnionSchema;
}(_Polymorphic2.default);

exports.default = UnionSchema;

var Union = Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends$2 = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass$2 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Polymorphic$1 = require('./Polymorphic');

var _Polymorphic2$1 = _interopRequireDefault$1(_Polymorphic$1);

function _interopRequireDefault$1(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck$2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn$1(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ValuesSchema = function (_PolymorphicSchema) {
  _inherits$1(ValuesSchema, _PolymorphicSchema);

  function ValuesSchema() {
    _classCallCheck$2(this, ValuesSchema);

    return _possibleConstructorReturn$1(this, (ValuesSchema.__proto__ || Object.getPrototypeOf(ValuesSchema)).apply(this, arguments));
  }

  _createClass$2(ValuesSchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this2 = this;

      return Object.keys(input).reduce(function (output, key, index) {
        var value = input[key];
        return value !== undefined && value !== null ? _extends$2({}, output, _defineProperty$1({}, key, _this2.normalizeValue(value, input, key, visit, addEntity))) : output;
      }, {});
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      var _this3 = this;

      return Object.keys(input).reduce(function (output, key) {
        var entityOrId = input[key];
        return _extends$2({}, output, _defineProperty$1({}, key, _this3.denormalizeValue(entityOrId, unvisit)));
      }, {});
    }
  }]);

  return ValuesSchema;
}(_Polymorphic2$1.default);

exports.default = ValuesSchema;

var Values = Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalize = exports.normalize = undefined;

var _createClass$3 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Polymorphic$2 = require('./Polymorphic');

var _Polymorphic2$2 = _interopRequireDefault$2(_Polymorphic$2);

function _interopRequireDefault$2(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck$3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn$2(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits$2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var validateSchema = function validateSchema(definition) {
  var isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error('Expected schema definition to be a single schema, but found ' + definition.length + '.');
  }

  return definition[0];
};

var getValues = function getValues(input) {
  return Array.isArray(input) ? input : Object.keys(input).map(function (key) {
    return input[key];
  });
};

var normalize = exports.normalize = function normalize(schema, input, parent, key, visit, addEntity) {
  schema = validateSchema(schema);

  var values = getValues(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map(function (value, index) {
    return visit(value, parent, key, schema, addEntity);
  });
};

var denormalize = exports.denormalize = function denormalize(schema, input, unvisit) {
  schema = validateSchema(schema);
  return input && input.map ? input.map(function (entityOrId) {
    return unvisit(entityOrId, schema);
  }) : input;
};

var ArraySchema = function (_PolymorphicSchema) {
  _inherits$2(ArraySchema, _PolymorphicSchema);

  function ArraySchema() {
    _classCallCheck$3(this, ArraySchema);

    return _possibleConstructorReturn$2(this, (ArraySchema.__proto__ || Object.getPrototypeOf(ArraySchema)).apply(this, arguments));
  }

  _createClass$3(ArraySchema, [{
    key: 'normalize',
    value: function normalize(input, parent, key, visit, addEntity) {
      var _this2 = this;

      var values = getValues(input);

      return values.map(function (value, index) {
        return _this2.normalizeValue(value, parent, key, visit, addEntity);
      }).filter(function (value) {
        return value !== undefined && value !== null;
      });
    }
  }, {
    key: 'denormalize',
    value: function denormalize(input, unvisit) {
      var _this3 = this;

      return input && input.map ? input.map(function (value) {
        return _this3.denormalizeValue(value, unvisit);
      }) : input;
    }
  }]);

  return ArraySchema;
}(_Polymorphic2$2.default);

exports.default = ArraySchema;

var _Array = Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.denormalize = exports.normalize = undefined;

var _createClass$4 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _extends$3 = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _ImmutableUtils$1 = require('./ImmutableUtils');

var ImmutableUtils$1 = _interopRequireWildcard$1(_ImmutableUtils$1);

function _interopRequireWildcard$1(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

function _defineProperty$2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck$4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var _normalize = function _normalize(schema, input, parent, key, visit, addEntity) {
  var object = _extends$3({}, input);
  Object.keys(schema).forEach(function (key) {
    var localSchema = schema[key];
    var value = visit(input[key], input, key, localSchema, addEntity);
    if (value === undefined || value === null) {
      delete object[key];
    } else {
      object[key] = value;
    }
  });
  return object;
};

exports.normalize = _normalize;
var _denormalize = function _denormalize(schema, input, unvisit) {
  if (ImmutableUtils$1.isImmutable(input)) {
    return ImmutableUtils$1.denormalizeImmutable(schema, input, unvisit);
  }

  var object = _extends$3({}, input);
  Object.keys(schema).forEach(function (key) {
    if (object[key]) {
      object[key] = unvisit(object[key], schema[key]);
    }
  });
  return object;
};

exports.denormalize = _denormalize;

var ObjectSchema = function () {
  function ObjectSchema(definition) {
    _classCallCheck$4(this, ObjectSchema);

    this.define(definition);
  }

  _createClass$4(ObjectSchema, [{
    key: 'define',
    value: function define(definition) {
      this.schema = Object.keys(definition).reduce(function (entitySchema, key) {
        var schema = definition[key];
        return _extends$3({}, entitySchema, _defineProperty$2({}, key, schema));
      }, this.schema || {});
    }
  }, {
    key: 'normalize',
    value: function normalize() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _normalize.apply(undefined, [this.schema].concat(args));
    }
  }, {
    key: 'denormalize',
    value: function denormalize() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _denormalize.apply(undefined, [this.schema].concat(args));
    }
  }]);

  return ObjectSchema;
}();

exports.default = ObjectSchema;

var _Object = Object.freeze({

});

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImmutable = isImmutable;
exports.denormalizeImmutable = denormalizeImmutable;
/**
 * Helpers to enable Immutable compatibility *without* bringing in
 * the 'immutable' package as a dependency.
 */

/**
 * Check if an object is immutable by checking if it has a key specific
 * to the immutable library.
 *
 * @param  {any} object
 * @return {bool}
 */
function isImmutable(object) {
  return !!(object && (object.hasOwnProperty('__ownerID') || // Immutable.Map
  object._map && object._map.hasOwnProperty('__ownerID' // Immutable.Record
  )));
}

/**
 * Denormalize an immutable entity.
 *
 * @param  {Schema} schema
 * @param  {Immutable.Map|Immutable.Record} input
 * @param  {function} unvisit
 * @param  {function} getDenormalizedEntity
 * @return {Immutable.Map|Immutable.Record}
 */
function denormalizeImmutable(schema, input, unvisit) {
  return Object.keys(schema).reduce(function (object, key) {
    // Immutable maps cast keys to strings on write so we need to ensure
    // we're accessing them using string keys.
    var stringKey = '' + key;

    if (object.has(stringKey)) {
      return object.set(stringKey, unvisit(object.get(stringKey), schema[stringKey]));
    } else {
      return object;
    }
  }, input);
}

var ImmutableUtils$2 = Object.freeze({

});

var _Entity = ( Entity && undefined ) || Entity;

var _Union = ( Union && undefined ) || Union;

var _Values = ( Values && undefined ) || Values;

var _Array$1 = ( _Array && undefined ) || _Array;

var _Object$1 = ( _Object && undefined ) || _Object;

var _ImmutableUtils$2 = ( ImmutableUtils$2 && undefined ) || ImmutableUtils$2;

var index$2 = createCommonjsModule(function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.denormalize = exports.normalize = exports.schema = undefined;

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }return target;
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var _Entity2 = _interopRequireDefault(_Entity);

  var _Union2 = _interopRequireDefault(_Union);

  var _Values2 = _interopRequireDefault(_Values);

  var ArrayUtils = _interopRequireWildcard(_Array$1);

  var ObjectUtils = _interopRequireWildcard(_Object$1);

  var ImmutableUtils = _interopRequireWildcard(_ImmutableUtils$2);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }newObj.default = obj;return newObj;
    }
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }

  var visit = function visit(value, parent, key, schema, addEntity) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || !value) {
      return value;
    }

    if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && (!schema.normalize || typeof schema.normalize !== 'function')) {
      var method = Array.isArray(schema) ? ArrayUtils.normalize : ObjectUtils.normalize;
      return method(schema, value, parent, key, visit, addEntity);
    }

    return schema.normalize(value, parent, key, visit, addEntity);
  };

  var addEntities = function addEntities(entities) {
    return function (schema, processedEntity, value, parent, key) {
      var schemaKey = schema.key;
      var id = schema.getId(value, parent, key);
      if (!(schemaKey in entities)) {
        entities[schemaKey] = {};
      }

      var existingEntity = entities[schemaKey][id];
      if (existingEntity) {
        entities[schemaKey][id] = schema.merge(existingEntity, processedEntity);
      } else {
        entities[schemaKey][id] = processedEntity;
      }
    };
  };

  var schema = exports.schema = {
    Array: ArrayUtils.default,
    Entity: _Entity2.default,
    Object: ObjectUtils.default,
    Union: _Union2.default,
    Values: _Values2.default
  };

  var normalize = exports.normalize = function normalize(input, schema) {
    if (!input || (typeof input === 'undefined' ? 'undefined' : _typeof(input)) !== 'object') {
      throw new Error('Unexpected input given to normalize. Expected type to be "object", found "' + (typeof input === 'undefined' ? 'undefined' : _typeof(input)) + '".');
    }

    var entities = {};
    var addEntity = addEntities(entities);

    var result = visit(input, input, null, schema, addEntity);
    return { entities: entities, result: result };
  };

  var unvisitEntity = function unvisitEntity(input, schema, unvisit, getEntity, cache) {
    var entity = getEntity(input, schema);
    if ((typeof entity === 'undefined' ? 'undefined' : _typeof(entity)) !== 'object' || entity === null) {
      return entity;
    }

    var id = schema.getId(entity);

    if (!cache[schema.key]) {
      cache[schema.key] = {};
    }

    if (!cache[schema.key][id]) {
      // Ensure we don't mutate it non-immutable objects
      var entityCopy = ImmutableUtils.isImmutable(entity) ? entity : _extends({}, entity);

      // Need to set this first so that if it is referenced further within the
      // denormalization the reference will already exist.
      cache[schema.key][id] = entityCopy;
      cache[schema.key][id] = schema.denormalize(entityCopy, unvisit);
    }

    return cache[schema.key][id];
  };

  var getUnvisit = function getUnvisit(entities) {
    var cache = {};
    var getEntity = getEntities(entities);

    return function unvisit(input, schema) {
      if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
        var method = Array.isArray(schema) ? ArrayUtils.denormalize : ObjectUtils.denormalize;
        return method(schema, input, unvisit);
      }

      if (input === undefined || input === null) {
        return input;
      }

      if (schema instanceof _Entity2.default) {
        return unvisitEntity(input, schema, unvisit, getEntity, cache);
      }

      return schema.denormalize(input, unvisit);
    };
  };

  var getEntities = function getEntities(entities) {
    var isImmutable = ImmutableUtils.isImmutable(entities);

    return function (entityOrId, schema) {
      var schemaKey = schema.key;

      if ((typeof entityOrId === 'undefined' ? 'undefined' : _typeof(entityOrId)) === 'object') {
        return entityOrId;
      }

      return isImmutable ? entities.getIn([schemaKey, entityOrId.toString()]) : entities[schemaKey][entityOrId];
    };
  };

  var denormalize = exports.denormalize = function denormalize(input, schema, entities) {
    if (!input) {
      return input;
    }

    return getUnvisit(entities)(input, schema);
  };
});

var index_2 = index$2.normalize;
var index_3 = index$2.schema;

function Normalizer(_parse, __normalize, entityName) {
  const parse = _parse || (res => res.data);
  const normalizeFn = __normalize || defaultNormalizer(entityName);

  return (res, obj, args) => {
    const data = parse(res);
    return index_2(camelizer(data), normalizeFn(obj, args, data));
  };
}

function camelizer(data) {
  if (Array.isArray(data)) {
    return camelizeCollection(data);
  } else {
    return camelizeKeys(data);
  }
}

function defaultNormalizer(entityName) {
  return (obj, args, data) => {
    if (Array.isArray(data)) {
      return [new index_3.Entity(entityName)];
    } else {
      return new index_3.Entity(entityName);
    }
  };
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const { values } = Object;

function createResolver({ host, headers }) {
  var _class, _temp;

  const store = new Store();
  const http = index.create({ headers });
  const loader = new Loader(http);

  return _temp = _class = class Resolver {

    constructor(options = {}) {
      this._show = (obj, args, normalize, opts) => {
        const nestedId = opts.nestedId;
        const id = nestedId ? undefined : opts.id || 'id';
        const includeResponseHeaders = opts.includeResponseHeaders || false;

        const url = new this.UrlBuilder(obj, args, opts.url, id, nestedId);
        const {
          options: { forceFetch = false, clearCache = false } = {}
        } = args,
              variables = _objectWithoutProperties(args, ['options']);
        const forceFetching = forceFetch || this.forceFetch;

        if (!forceFetching) {
          const entity = this.store.get(this.entityName, nestedId || obj[id] || variables[id]);

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

        return this.loader.load(url).then(res => {
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
      };

      this.store = store;
      this.entityName = options.entityName;
      this.serialize = options.serialize;
      this.loader = loader;
      this.UrlBuilder = UrlBuilderFactory(options.host || host, options.url);
      this.forceFetch = false;
    }

    index(opts = {}) {
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const storeQuery = opts.storeQuery || (args => obj => true);
      const includeResponseHeaders = opts.includeResponseHeaders || false;

      return (obj, args, context, _) => {
        const url = new this.UrlBuilder(obj, args, opts.url);
        const {
          options: { forceFetch = false, clearCache = false } = {}
        } = args,
              variables = _objectWithoutProperties(args, ['options']);
        const forceFetching = forceFetch || this.forceFetch;

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

        return this.loader.load(url, { cache: true }).then(res => {
          const { entities } = normalize(res, obj, variables);
          this.store.set(entities);

          this.forceFetch = false;

          const entityValues = values(entities[this.entityName] || {});

          if (includeResponseHeaders) {
            return { headers: res.headers, entities: entityValues };
          } else {
            return entityValues;
          }
        });
      };
    }

    show(opts = {}) {
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const ids = opts.ids;

      if (ids) {
        return (obj, args, context, _) => {
          return Promise.all(obj[ids].map(nestedId => {
            return this._show(obj, args, normalize, _extends({}, opts, { nestedId }));
          }));
        };
      } else {
        return (obj, args, context, _) => {
          return this._show(obj, args, normalize, opts);
        };
      }
    }

    create(opts = {}) {
      const serialize = opts.serialize || this.serialize || (args => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const update = opts.update || ((...args) => args);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url);
        const {
          options: { forceFetch = false, clearCache = false } = {}
        } = args,
              variables = _objectWithoutProperties(args, ['options']);

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
      };
    }

    update(_ref = {}) {
      let { id = 'id', method = 'put' } = _ref,
          opts = _objectWithoutProperties(_ref, ['id', 'method']);

      const serialize = opts.serialize || this.serialize || (args => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url, id);
        const {
          options: { forceFetch = false, clearCache = false } = {}
        } = args,
              variables = _objectWithoutProperties(args, ['options']);

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
      };
    }

    delete(_ref2 = {}) {
      let { id = 'id' } = _ref2,
          opts = _objectWithoutProperties(_ref2, ['id']);

      const serialize = opts.serialize || this.serialize || (args => args);
      const normalize = Normalizer(opts.parse, opts.normalize, this.entityName);
      const update = opts.update || ((...args) => args);

      return (resolvers, args, context, _) => {
        const url = new this.UrlBuilder(resolvers, args, opts.url, id);
        const {
          options: { forceFetch = false, clearCache = false } = {}
        } = args,
              variables = _objectWithoutProperties(args, ['options']);

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
      };
    }

  }, _class.store = store, _class.loader = loader, _temp;
}

const { assign, entries } = Object;

class Prism {
  constructor(typeDefs, resolvers) {
    this.broadcast = resolverData => {
      entries(this.queries).forEach(([query, { variables, cb }]) => {
        this.query(query, variables).then(cb);
      });
      return resolverData;
    };

    this.resolvers = resolvers;
    this.schema = graphqlTools_schemaGenerator.makeExecutableSchema({ typeDefs, resolvers });
    this.queries = {};
  }

  subscribe(query, variables = {}, logErrors, cb) {
    if (this.queries[query]) delete this.queries[query];
    assign(this.queries, { [query]: { variables, cb } });

    return this.query(query, variables).then(resolverData => {
      const data = handleErrors(resolverData, logErrors);
      return data.errors ? data : resolverData;
    }).then(data => {
      cb(data);return data;
    });
  }

  unsubscribe(query) {
    delete this.queries[query];
  }

  query(query, variables = {}) {
    return graphql.graphql(this.schema, query, this.resolvers, null, variables);
  }

  mutate(mutation, variables = {}, logErrors) {
    return graphql.graphql(this.schema, mutation, this.resolvers, null, variables).then(resolverData => {
      const data = handleErrors(resolverData, logErrors);
      return data.errors ? data : this.broadcast(resolverData);
    });
  }

}

function handleErrors(resolverData, logErrors) {
  let filteredErrors = { errors: null, networkErrors: null };

  if (resolverData.errors) {
    filteredErrors = buildErrors(resolverData.errors, logErrors);
    if (logErrors) console.log(filteredErrors);
  }
  return filteredErrors;
}

function buildErrors(errors, logErrors) {
  return errors.reduce((obj, error) => {
    if (error.originalError && error.originalError.response) {
      obj.networkErrors.push({
        message: error.originalError.message,
        stack: error.originalError.stack,
        status: error.originalError.response.status,
        response: error.originalError.response
      });
      return obj;
    } else {
      if (logErrors) {
        console.error(error.message);
        console.log(error.stack);
      }
      obj.errors.push(error);
      return obj;
    }
  }, { errors: [], networkErrors: [] });
}

exports.createResolver = createResolver;
exports.Prism = Prism;
