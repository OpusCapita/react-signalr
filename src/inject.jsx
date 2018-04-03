import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import { HubConnection, TransportType } from '@aspnet/signalr-client';
import { hubShape } from './types';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function injectSignalR(WrappedComponent, 
  options = { 
    hubName: '', 
    baseAddress: undefined, 
    accessTokenFactory: undefined, 
    signalrPath: 'signalr', 
    controller: ''
  }) {

  const getAccessToken = () => {
    const { Authorization } = axios.defaults.headers.common;
    return Authorization ? Authorization.replace(/^bearer /i, '') : Authorization;
  }

  const {
    hubName = '',
    baseAddress = 'http://localhost:5555',
    accessTokenFactory = getAccessToken,
    signalrPath = 'signalr'
  } = options;
  const { controller = hubName } = options;

  class InjectSignalR extends React.Component {
   
    static WrappedComponent = WrappedComponent;

    constructor(props) {
      super(props);
      this.state = {
        hub: null,
        pending: Map(),
        active: Map(),
        retries: 0,
      };
    }

    componentWillMount() {
      let hub = this.props[hubName];
      hub.register = this.registerListener;
      hub.unregister = this.unregisterListener;
    }

    componentDidMount() {
      this.createHub();
    }

    componentWillUnmount() {
      this.stopHub(this.state.hub);
    }

    componentWillUpdate(nextProps, nextState) {
      if (nextState.hub && this.state.hub !== nextState.hub) {
        if (this.state.hub)
          this.stopHub(this.state.hub);
        this.startHub(nextState.hub);
      }
      else if (nextState.pending.size) {
        this.activateListeners(nextState.pending);
      }
    }

    createHub() {
      const retry = this.state.retries;
      if (retry > 3)
        console.log('Ran out of retries for starting hub!');
      else {
        const actualBaseAddress = this.props.baseAddress;
        if (actualBaseAddress && hubName) {
          let hubAddress = `${actualBaseAddress}/${signalrPath}/${hubName}`;
          if (accessTokenFactory) {
            var token = accessTokenFactory();
            if (token) hubAddress = `${hubAddress}?access_token=${token}`;
          }
          const hub = new HubConnection(hubAddress, { transport: TransportType.WebSockets });
          // Here below is how things should be done after upgrading to ASP.NET Core 2.1 version
          //const hubAddress = `${actualBaseAddress}/signalr/${hubName}`;
          //const hub = new HubConnection(hubAddress, { transport: TransportType.WebSockets, accessTokenFactory });
          hub.onclose = (e) => {
            if (e && e.statusCode == 401)
              this.createHub();
          }
          this.setState({ hub, retries: retry + 1 });
        }
      }
    }

    startHub(hub) {
      if (hub)
        hub.start()
          .then(res => {
            const pending = this.pending
              ? this.state.active.mergeDeep(this.pending)
              : this.state.active;
            this.setState({ pending, retries: 0 });
          })
          .catch(err => {
            console.log('Error while establishing connection :(');
            console.log(err);
            hub.stop();
            if (!err.response || err.response.status != 500)
              this.createHub();
          });
    }

    stopHub(hub) {
      if (hub) {
        this.state.active.mapKeys(name => hub.off(name));
        hub.stop();
      }
    }

    static pending = undefined;

    // Register a listener
    registerListener = (name, handler) => {
      // Use pending listeners in case the state.listeners has not yet been updated
      if (!this.pending) this.pending = this.state.pending;
      // Push the specified handler in the list under the specified name
      this.pending = this.pending.updateIn([name], List(), list => list.push(handler));
      // Update the state
      this.setState({ pending: this.pending });
    }

    // Unregister a listener
    unregisterListener = (name, handler) => {
      const { hub, pending } = this.state;
      // Turn off listener for existing hub
      if (hub) {
        const deletableListener = Map({ [name]: List([handler]) });
        hub.off(name, handler);
      }
      // Remove listener from pending listeners
      if (!this.pending) this.pending = pending;
      const remainingPending = this.pending.getIn([name]).filter(h => h !== handler);
      this.pending = remainingPending.size
        ? this.pending.setIn([name], remainingPending) : this.pending.delete(name);
      // Remove listener from active listeners
      let { active } = this.state;
      const remainingActive = active.getIn([name]).filter(h => h !== handler);
      active = remainingActive.size
        ? active.setIn([name], remainingActive) : active.delete(name);
      // Update the state
      this.setState({ active, pending: this.pending });
    }

    activateListeners(pending) {
      const { hub } = this.state;
      if (hub && pending) {
        pending.mapEntries(([name, handlers]) =>
          handlers.map(handler => hub.on(name, handler)));
        const active = this.state.active.mergeDeep(pending);
        this.setState({ active, pending: Map() });
      }
    }

    render() {
      const { baseAddress, ...passThroughProps } = this.props;
      return (
        <WrappedComponent
          {...passThroughProps}
        />
      )
    }
  }

  const invokeController = (baseAddress, target, data = undefined) => {
    const urlBase = `${baseAddress}/${controller}/${target}`;
    const url = data ? `${urlBase}/${data}` : urlBase;
    return axios.get(url)
      .catch(err => {
        console.log(`ERROR: Invoking ${controller} failed: ${err}`);
      });
  }

  const sendToController = (baseAddress, targetMethod, data) => {
    const url = `${baseAddress}/${controller}/${targetMethod}`;
    const payload = data ? data.toJS() : null;
    return axios.post(url, payload)
      .catch(err => {
        console.log(`ERROR: Sending data to ${controller} failed: ${err}`);
      });
  }

  InjectSignalR.displayName = `InjectSignalR(${getDisplayName(WrappedComponent)})`;

  InjectSignalR.propTypes = {
    baseAddress: PropTypes.string.isRequired,
    [hubName]: hubShape.isRequired,
  };

  const mapStateToProps = (state, props) => {
    let actualBaseAddress = '';
    if (typeof baseAddress === 'function')
      actualBaseAddress = baseAddress(state);
    else if (typeof baseAddress === 'string')
      actualBaseAddress = baseAddress;
    if (!actualBaseAddress)
      throw new Error('Missing required property baseAddress!');
    return {
      baseAddress: actualBaseAddress,
      [hubName]: {
        invoke: (target, data) => invokeController(actualBaseAddress, target, data),
        send: (target, data) => sendToController(actualBaseAddress, target, data),
        register: undefined,
        unregister: undefined,
      }
    }
  }

  return connect(mapStateToProps)(InjectSignalR);

};