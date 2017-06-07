import DataLoader from 'dataloader';

export default class Loader {
  constructor(http) {
    this.loader = new DataLoader(fetchEntity(http));
  }

  load(urlObject, { cache } = { cache: false }) {
    const url = stringify(urlObject);
    return this.loader.load(url);
  }

  clearUrls() {
    this.loader._promiseCache.clear();
  }

  clear(urlObject) {
    let url;

    if (!(typeof urlObject === 'string')) {
      url = stringify(urlObject);
    } else {
      url = urlObject;
    }
    this.loader.clear(url);
  }
}

function fetchEntity(http) {
  // dataloader's caching function: URL => HTTP response.
  // stores any recieved URL/responses in the dataloader cache.
  return urls => {
    return Promise.all(urls.map(url => http(JSON.parse(url))));
  };
}

function stringify(urlObject) {
  const { href, params, headers } = urlObject;
  return JSON.stringify({ url: href, params, headers });
}
//# sourceMappingURL=loader.js.map