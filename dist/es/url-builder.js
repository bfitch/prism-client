import getId from './utils/get-id';

export default function UrlBuilderFactory(host = '', defaultUrl) {
  return class UrlBuilder {
    constructor(obj, args, opts = {}) {
      this.id = getId(obj, args, opts);
      this.customUrl = opts.url && opts.url(obj, args) || defaultUrl;
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
          url: this.customUrl.url,
          params: this.customUrl.params,
          headers: this.customUrl.headers
        };
      }
    }
  };
}
//# sourceMappingURL=url-builder.js.map