import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import { Map, Set } from 'immutable';
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
    controller: '',
    retries: 3
  }) {

  const getAccessToken = () => {
    const { Authorization } = axios.defaults.headers.common;
    return Authorization ? Authorization.replace(/^(bearer )?/i, '') : Authorization;
  }

  const {
    hubName = '',
    baseAddress = 'http://localhost:5555',
    accessTokenFactory = getAccessToken,
    signalrPath = 'signalr',
    retries = 3
  } = options;
  const { controller = hubName } = options;

  class InjectSignalR extends React.PureComponent {
   
    static WrappedComponent = WrappedComponent;

    constructor(props) {
      super(props);
      this.state = {
        hub: null,
        pending: undefined,
        active: undefined,
        moribund: undefined,
        retry: 0,
        oldToken: undefined,
      };
    }

    componentWillMount() {
      //console.log(`${InjectSignalR.displayName}.componentWillMount`);
      this.hubProxy = {
        invoke: this.invoke,
        send: this.send,
        connectionId: undefined,
        register: this.registerListener,
        unregister: this.unregisterListener,
      }
    }

    componentDidMount() {
      //console.log(`${InjectSignalR.displayName}.componentDidMount`);
      this.createHub();
    }

    componentWillUnmount() {
      //console.log(`${InjectSignalR.displayName}.componentWillUnmount`);
      this.stopHub(this.state.hub, true);
    }

    componentWillUpdate(nextProps, nextState) {
      if (this.state.hub !== nextState.hub) {
        //console.log(`${InjectSignalR.displayName}.componentWillUpdate => hub`);
        if (this.state.hub) this.stopHub(this.state.hub, false);
        if (nextState.hub) this.startHub(nextState.hub);
        else this.createHub();
      }
      else if (!nextState.hub)
        this.createHub();
      else {
        let { pending, moribund } = nextState;
        if (!moribund) 
          moribund = this.moribund || Map();
        else if (this.moribund)
          moribund = moribund.mergeDeep(this.moribund);
        const moribundCount = moribund.reduce(this.count, 0);
        if (moribundCount) {
          //console.log(`${InjectSignalR.displayName}.componentWillUpdate => moribund [${moribundCount}]`);
          this.moribund = this.inactivateListeners(this.state.hub, moribund);
        }
        if (!pending)
          pending = this.pending || Map();
        else if (this.pending)
          pending = pending.mergeDeep(this.pending);
        const pendingCount = pending.reduce(this.count, 0);
        if (pendingCount) {
          //console.log(`${InjectSignalR.displayName}.componentWillUpdate => pending [${pendingCount}]`);
          this.pending = this.activateListeners(nextState.hub, pending);
        }
      }
    }

    count(c, s) { return c + s.count(); }

    createHub() {
      //console.log(`${InjectSignalR.displayName}.createHub`);
      const { retry } = this.state;
      if (retry > retries) {
        console.log(`WARN: ${hubName}: Ran out of retries for starting hub!`);
        this.setState({ retry: 0 });
      }
      else {
        const { baseAddress } = this.props;
        if (baseAddress && hubName) {
          let hubAddress = baseAddress;
          if (signalrPath) hubAddress = `${hubAddress}/${signalrPath}`;
          hubAddress = `${hubAddress}/${hubName}`
          // Here below is how things are done with ASP.NET Core 2.0 version
          if (accessTokenFactory) {
            this.token = accessTokenFactory();
            if (this.token) {
              if (this.oldToken === this.token) {
                this.setState({ hub: null });
                return;
              }
              this.oldToken = undefined;
              hubAddress = `${hubAddress}?access_token=${this.token}`;
            }
          }
          const hub = new HubConnection(hubAddress, { transport: TransportType.WebSockets });
          // Here below is how things should be done after upgrading to ASP.NET Core 2.1 version
          //const hub = new HubConnection(hubAddress, { transport: TransportType.WebSockets, accessTokenFactory });
          hub.onclose = this.handleError;
          this.setState({ hub, retry: retry + 1 });
        }
      }
    }

    startHub(hub) {
      //console.log(`${InjectSignalR.displayName}.startHub`);
      if (hub)
        hub.start()
          .then(res => {
            const { connectionId } = hub.connection || {};
            this.hubProxy.connectionId = connectionId;
            const { pending, active } = this.state;
            if (!this.pending) this.pending = pending || Map();
            if (!this.active) this.active = active || Map();
            this.setState({ active: this.active, pending: this.pending, retry: 0 });
          })
          .catch(err => {
            console.log(`WARN: ${hubName}: Error while establishing connection :(`);
            console.log(err);
            hub.stop();
            this.handleError(err);
          });
    }

    handleError = (err) => {
      const { response, statusCode } = err;
      const { status } = response || {};
      switch (status || statusCode)
      {
        case 500: break;
        case 401: this.oldToken = this.token; //fall through
        default: this.setState({ hub: null }); break;
      }
    }

    stopHub(hub, clear) {
      //console.log(`${InjectSignalR.displayName}.stopHub`);
      if (hub) {
        if (clear)
          // Clear pending
          this.pending = undefined;
        else {
          // Merge active to pending
          if (!this.pending)
            this.pending = this.state.active;
          else if (this.state.active)
            this.pending = this.pending.mergeDeep(this.state.active);
        }
        hub.stop();
        this.active = undefined;
        this.setState({ pending: this.pending, active: this.active });
      }
    }

    registerListener = (name, handler) => {
      //console.log(`${InjectSignalR.displayName}.registerListener(${name}, ${handler.name || '<handler>'}(...))`);
      const { pending, active, moribund } = this.state;
      // Remove listener from moribund listeners
      if (!this.moribund) this.moribund = moribund || Map();
      const existingMoribund = this.moribund.getIn([name], Set());
      if (existingMoribund.has(handler)) {
        const remainingMoribund = existingMoribund.filterNot(h => h === handler);
        this.moribund = remainingMoribund.size
          ? this.moribund.setIn([name], remainingMoribund) : this.moribund.delete(name);
      }
      // Add listener to pending listeners (if it is NOT active)
      if (!this.active) this.active = active || Map();
      const existingActive = this.active.getIn([name], Set());
      if (!existingActive.has(handler)) {
        if (!this.pending) this.pending = pending || Map();
        const existingPending = this.pending.getIn([name], Set());
        if (!existingPending.has(handler)) 
          this.pending = this.pending.setIn([name], existingPending.add(handler));
      }
      if (this.pending !== pending || this.moribund !== moribund)
        this.setState({ pending: this.pending, moribund: this.moribund });
    }

    unregisterListener = (name, handler) => {
      //console.log(`${InjectSignalR.displayName}.unregisterListener(${name}, ${handler.name || '<handler>'}(...))`);
      const { pending, active, moribund } = this.state;
      // Remove listener from pending listeners
      if (!this.pending) this.pending = pending || Map();
      const existingPending = this.pending.getIn([name], Set());
      if (existingPending.has(handler)) {
        const remainingPending = existingPending.filterNot(h => h === handler);
        this.pending = remainingPending.count()
          ? this.pending.setIn([name], remainingPending)
          : this.pending.delete(name);
      }
      // Add listener to moribund listeners (if it is active)
      if (!this.active) this.active = active || Map();
      const existingActive = this.active.getIn([name], Set());
      if (existingActive.has(handler)) {
        if (!this.moribund) this.moribund = moribund || Map();
        const existingMoribund = this.moribund.getIn([name], Set());
        if (!existingMoribund.has(handler))
          this.moribund = this.moribund.setIn([name], existingMoribund.add(handler));
      }
      if (this.pending !== pending || this.moribund !== moribund)
        this.setState({ pending: this.pending, moribund: this.moribund });
    }

    activateListeners(hub, pending) {
      //console.log(`${InjectSignalR.displayName}.activateListeners([${(pending ? pending.reduce(this.count, 0) : 0)}])`);
      if (hub && pending) {
        const { connection } = hub;
        if (connection && connection.connectionState === 2) {
          const { active } = this.state;
          if (!this.active) this.active = active || Map();
          if (this.active.reduce(this.count, 0))
            pending = pending.mapEntries(([name, handlers]) => {
              const existing = this.active.getIn([name]);
              if (existing) handlers = handlers.filterNot(handler => existing.has(handler))
              return [name, handlers];
            });
          pending.mapEntries(([name, handlers]) =>
            handlers.map(handler => hub.on(name, handler)));
          this.active = this.active.mergeDeep(pending);
          this.setState({ pending: undefined, active: this.active });
          return undefined;
        }
      }
      return pending;
    }

    inactivateListeners(hub, moribund) {
      //console.log(`${InjectSignalR.displayName}.inactivateListeners([${(moribund ? moribund.reduce(this.count, 0) : 0)}])`);
      if (hub && moribund) {
        moribund.mapEntries(([name, handlers]) =>
          handlers.map(handler => hub.off(name, handler)));
        const { active } = this.state;
        if (!this.active) this.active = active || Map();
        this.active = this.active.mapEntries(([name, handlers]) => {
          const removable = moribund.getIn([name]);
          if (removable) handlers = handlers.filterNot(handler => removable.has(handler))
          return [name, handlers];
        });
        this.setState({ active: this.active, moribund: undefined });
        return undefined;
      }
      return moribund;
    }

    invoke = (target, data) => {
      invokeController(this.props.baseAddress, target, data);
    }

    send = (target, data) => {
      sendToController(this.props.baseAddress, target, data);
    }

    render() {
      const { baseAddress, ...passThroughProps } = this.props;
      const hubProp = { [hubName]: this.hubProxy };
      return (
        <WrappedComponent
          {...passThroughProps}
          {...hubProp}
        />
      )
    }
  }

  const invokeController = (baseAddress, target, data = undefined) => {
    const urlBase = `${baseAddress}/${controller}/${target}`;
    const url = data ? `${urlBase}/${data}` : urlBase;
    return axios.get(url)
      .catch(err => {
        console.log(`ERROR: ${hubName}: Invoking ${controller} failed: ${err}`);
      });
  }

  const sendToController = (baseAddress, targetMethod, data) => {
    const url = `${baseAddress}/${controller}/${targetMethod}`;
    const payload = data ? data.toJS() : null;
    return axios.post(url, payload)
      .catch(err => {
        console.log(`ERROR: ${hubName}: Sending data to ${controller} failed: ${err}`);
      });
  }

  InjectSignalR.displayName = `InjectSignalR(${getDisplayName(WrappedComponent)})`;

  InjectSignalR.propTypes = {
    baseAddress: PropTypes.string.isRequired,
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
    }
  }

  return connect(mapStateToProps)(InjectSignalR);

};