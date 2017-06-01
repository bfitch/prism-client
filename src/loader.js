import DataLoader from 'dataloader';

export default class Loader {
  constructor(http) {
    // this.cachedUrls = {};
    // this.indexUrls  = [];
    this.loader     = new DataLoader(fetchEntity(http, this.cachedUrls));
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
  return (urls) => {
    return Promise.all(
      urls.map(url => {
        // Object.assign(cachedUrls, { [url]: url });
        return http(JSON.parse(url));
      })
    );
  }
}

function stringify(urlObject) {
  const { href, params, headers } = urlObject;
  return JSON.stringify({ url: href, params, headers });
}
