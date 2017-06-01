import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
const { assign, entries } = Object;

export class Prism {
  constructor(typeDefs, resolvers) {
    this.resolvers = resolvers;
    this.schema    = makeExecutableSchema({ typeDefs, resolvers });
    this.queries   = {};
  }

  subscribe(query, variables = {}, logErrors, cb) {
    if (this.queries[query]) delete this.queries[query];
    assign(this.queries, { [query]: { variables, cb } });

    return this.query(query, variables)
      .then(resolverData => {
        const data = handleErrors(resolverData, logErrors)
        return data.errors ? data : resolverData;
      })
      .then((data) => { cb(data); return data; });
  }

  unsubscribe(query) {
    delete this.queries[query];
  }

  query(query, variables = {}) {
    return graphql(this.schema, query, this.resolvers, null, variables);
  }

  mutate(mutation, variables = {}, logErrors) {
    return graphql(this.schema, mutation, this.resolvers, null, variables)
      .then(resolverData => {
        const data = handleErrors(resolverData, logErrors);
        return data.errors ? data : this.broadcast(resolverData);
      });
  }

  broadcast = (resolverData) => {
    entries(this.queries).forEach(([query, { variables, cb }]) => {
      this.query(query, variables).then(cb);
    });
    return resolverData;
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
