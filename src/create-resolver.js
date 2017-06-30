import axios from 'axios';
import Store from './store';
import Loader from './loader';
import Resolver from './resolver';

export function createResolver({ host, headers }) {
  const store  = new Store();
  const http   = axios.create({ headers });
  const loader = new Loader(http);

  return Resolver({ store, loader, http, host });
}
