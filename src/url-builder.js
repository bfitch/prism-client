export default function UrlBuilderFactory(host = '', defaultUrl) {
  return class UrlBuilder {
    constructor(_obj, args, urlFn, id, idValue) {
      const obj       = (args && Object.keys(args).length) ? args : _obj;
      this.id         = idValue || (obj[id] ? obj[id] : Object.values(obj).pop()[id]);
      this.customUrl  = (urlFn && urlFn(obj)) || defaultUrl;
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
          url: (this.customUrl.url || defaultUrl),
          params: this.customUrl.params,
          headers: this.customUrl.headers
        };
      }
    }
  }
}
