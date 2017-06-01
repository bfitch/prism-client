import React from 'react';

export class Provider extends React.Component {
  static childContextTypes = {
    client: React.PropTypes.object
  };

  getChildContext() {
    return { client: this.props.client };
  }

  render() {
    return this.props.children;
  }
}

export function withData(query, _propsFn, opts = {}) {
  const propsFn   = _propsFn       || ((props) => { return { options: {} }});
  const name      = opts.name      || 'query';
  const logErrors = opts.logErrors === false ? false : true;

  return (WrappedComponent) => {
    return class WithData extends React.Component {
      static contextTypes = {
        client: React.PropTypes.object
      };

      constructor(props) {
        super(props);
        this.state = {
          data: {
            errors: null,
            networkErrors: null,
            loading: true
          }
        };
        this.variables = propsFn(props);
      }

      componentDidMount() {
        if (query) this.subscribeToQuery(query, this.variables);
      }

      componentWillReceiveProps({ data = {} }) {
        // merge this component's data into any prevously fetched data from another
        // wrapped parent component
        this.setState({ data: { ...data, ...this.state.data } });
      }

      componentWillUnmount() {
        if (query) this.context.client.unsubscribe(query);
      }

      render() {
        return (
          <WrappedComponent
            data={this.state.data}
            variables={this.variables}
            {...{...this.props, [name]: this.subscribeToQuery}}
          />
        );
      }

      subscribeToQuery = (query, variables) => {
        return this.context.client.subscribe(query, variables, logErrors, (resolverData) => {
          this.setState({
            data: {
              ...resolverData.data,
              loading: false,
              errors: resolverData.errors,
              networkErrors: resolverData.networkErrors
            }
          });
        });
      }
    };
  }
}

export function withMutation(mutation, opts = {}) {
  const name      = opts.name      || 'mutate';
  const logErrors = opts.logErrors === false ? false : true;

  return (WrappedComponent) => {
    return class WithMutation extends React.Component {
      static contextTypes = {
        client: React.PropTypes.object
      };

      constructor(props) {
        super(props);
        this.state = { data: {} };
      }

      render() {
        // TODO: use a lifecycle hook here? Don't mutate props
        Object.assign(this.props.data, this.state.data);

        return (
          <WrappedComponent {...{...this.props, [name]: this.mutationCallback}} />
        );
      }

      mutationCallback = (variables) => {
        return this.context.client.mutate(mutation, variables, logErrors)
          .then(resolverData => {
            if (resolverData.errors) {
              this.setState({
                data: {
                  errors: resolverData.errors,
                  networkErrors: resolverData.networkErrors
                }
              });
            }
            return resolverData;
          });
      }
    };
  }
}

export function loadable(LoadingComponent = null, ErrorComponent = null) {
  return (WrappedComponent) => {
    return class Loadable extends React.Component {
      static displayName  = `Loadable(${getDisplayName(WrappedComponent)})`;

      render() {
        if (this.props.data.loading) {
          return LoadingComponent ? <LoadingComponent {...this.props} /> : <div>Loading...</div>;
        } else {
          return <WrappedComponent {...{...this.props, errorComponent: this.renderErrors()}}/>;
        }
      }

      renderErrors() {
        const { networkErrors } = this.props.data;

        if (networkErrors) {
          return ErrorComponent
          ? <ErrorComponent {...this.props}/>
          : <div>{networkErrors.map(({message}, i) => <div key={i}>{message}</div>)}</div>;
        } else {
          return null;
        }
      }
    }
  }
}

// thank you react-redux:
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
