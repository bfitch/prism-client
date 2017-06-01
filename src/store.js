export default class Store {
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
