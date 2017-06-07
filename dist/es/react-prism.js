var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import React from 'react';

export class Provider extends React.Component {

  getChildContext() {
    return { client: this.props.client };
  }

  render() {
    return this.props.children;
  }
}

Provider.childContextTypes = {
  client: React.PropTypes.object
};
export function withData(query, _propsFn, opts = {}) {
  const propsFn = _propsFn || (props => {
    return { options: {} };
  });
  const name = opts.name || 'query';
  const logErrors = opts.logErrors === false ? false : true;

  return WrappedComponent => {
    var _class, _temp;

    return _temp = _class = class WithData extends React.Component {

      constructor(props) {
        super(props);

        this.subscribeToQuery = (query, variables) => {
          return this.context.client.subscribe(query, variables, logErrors, resolverData => {
            this.setState({
              data: _extends({}, resolverData.data, {
                loading: false,
                errors: resolverData.errors,
                networkErrors: resolverData.networkErrors
              })
            });
          });
        };

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
        this.setState({ data: _extends({}, data, this.state.data) });
      }

      componentWillUnmount() {
        if (query) this.context.client.unsubscribe(query);
      }

      render() {
        return React.createElement(WrappedComponent, _extends({
          data: this.state.data,
          variables: this.variables
        }, _extends({}, this.props, { [name]: this.subscribeToQuery })));
      }

    }, _class.contextTypes = {
      client: React.PropTypes.object
    }, _temp;
  };
}

export function withMutation(mutation, opts = {}) {
  const name = opts.name || 'mutate';
  const logErrors = opts.logErrors === false ? false : true;

  return WrappedComponent => {
    var _class2, _temp2;

    return _temp2 = _class2 = class WithMutation extends React.Component {

      constructor(props) {
        super(props);

        this.mutationCallback = variables => {
          return this.context.client.mutate(mutation, variables, logErrors).then(resolverData => {
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
        };

        this.state = { data: {} };
      }

      render() {
        // TODO: use a lifecycle hook here? Don't mutate props
        Object.assign(this.props.data, this.state.data);

        return React.createElement(WrappedComponent, _extends({}, this.props, { [name]: this.mutationCallback }));
      }

    }, _class2.contextTypes = {
      client: React.PropTypes.object
    }, _temp2;
  };
}

export function loadable(LoadingComponent = null, ErrorComponent = null) {
  return WrappedComponent => {
    var _class3, _temp3;

    return _temp3 = _class3 = class Loadable extends React.Component {

      render() {
        if (this.props.data.loading) {
          return LoadingComponent ? React.createElement(LoadingComponent, this.props) : React.createElement(
            'div',
            null,
            'Loading...'
          );
        } else {
          return React.createElement(WrappedComponent, _extends({}, this.props, { errorComponent: this.renderErrors() }));
        }
      }

      renderErrors() {
        const { networkErrors } = this.props.data;

        if (networkErrors) {
          return ErrorComponent ? React.createElement(ErrorComponent, this.props) : React.createElement(
            'div',
            null,
            networkErrors.map(({ message }, i) => React.createElement(
              'div',
              { key: i },
              message
            ))
          );
        } else {
          return null;
        }
      }
    }, _class3.displayName = `Loadable(${getDisplayName(WrappedComponent)})`, _temp3;
  };
}

// thank you react-redux:
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
//# sourceMappingURL=react-prism.js.map