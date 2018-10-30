# react-signalr

### Description
Higher-Order Component that provides a connection to a SignalR hub. This component adds a hub proxy, that 
may be used to register and unregister event listeners, and also to invoke a hub controller and send data to it.

This component is built using the [SignalR JavaScript client](https://github.com/aspnet/SignalR/tree/release/2.1/clients/ts/signalr) of 
the [ASP.NET Core 2.1 Signalr](https://github.com/aspnet/SignalR/tree/release/2.1) product.

### Installation
```
npm install @opuscapita/react-signalr --save
```

### Builds
#### UMD
The default build with compiled styles in the .js file. Also minified version available in the lib/umd directory.
#### CommonJS/ES Module
You need to configure your module loader to use `cjs` or `es` fields of the package.json to use these module types.
Also you need to configure sass loader, since all the styles are in sass format.
* With webpack use [resolve.mainFields](https://webpack.js.org/configuration/resolve/#resolve-mainfields) to configure the module type.
* Add [SASS loader](https://github.com/webpack-contrib/sass-loader) to support importing of SASS styles.

### API

#### Options for ```injectSignalR```
| Option                   | Type             | Default                  | Description                                              |
| ------------------------ | ---------------- | ------------------------ | -------------------------------------------------------- |
| hubName                  | string           | required                 | Name of the signalr hub                                  |
| baseAddress              | string \| func   | required                 | Base address for signalr server                          |
| accessToken              | string \| func   |                          | Access token for authorization on the server             |
| signalrPath              | string           | 'signalr'                | Path to signalr hubs                                     |
| controller               | string           | &lt;hubName&gt;          | Name of the controller (if different from hubName)       |
| retries                  | integer          | 3                        | Number of retries to connect after a failure             |

#### Methods in hub proxy
| Method                       | Parameters                        | Description                                    |
| ---------------------------- | --------------------------------- | ---------------------------------------------- |
| invoke(target, query)        | target: string, query: string     | Invokes hub controller with GET                |
| send(target, payload)        | target: string, payload: object   | Invokes hub controller with POST               |
| register(event, listener)    | event: string, listener: func     | Registers a listener for an event              |
| unregister(event, listener)  | event: string, listener: func     | Unregisters a listener for an event            |
| add(group)                   | group: string                     | Adds client to a named group<sup>1)</sup>      |
| remove(group)                | group: string                     | Removes client from a named group<sup>1)</sup> |

<sup>1)</sup> To be able to use group messaging the SignalR hub must implement two methods, `AddToGroup(string group)` and `RemoveFromGroup(string group)`, which respectively add and remove the client to and from the specified named group *(cf. [code example](#addingremoving-the-client-tofrom-a-named-group))*.

### Code example

#### Injecting signalr HOC to a component

##### As a HOC
```jsx
import React from 'react';
import { injectSignalR, hubShape } from '@opuscapita/react-signalr';

class MyComponent extends React.Component {
  // ... 
}

MyComponent.propTypes = {
  // PropType for the hub proxy.
  mynotifier: hubShape,
};

export default injectSignalR({
  // Defines both the last part of the route to the hub,
  // and also the key of the hub proxy in this.props.
  // In this case it hub proxy is found in this.props.mynotifier.
  hubName: 'mynotifier',
  // Either 1) a string containing the server url, or 
  // 2) a function getting the server url from the state (example).
  baseAddress: (state) => state.configuration.server,
  // 1) A string containing the access token, or 
  // 2) a function getting the access token from the state (example), or
  // 3) a function using the state to return a function that 
  // gets the access token.
  accessToken: (state) => state.configuration.accessToken,
})(MyComponent);
```

##### As a decorator
```jsx
import React from 'react';
import { injectSignalR, hubShape } from '@opuscapita/react-signalr';

@injectSignalR({
  hubName: 'mynotifier',
  baseAddress: (state) => state.configuration.server,
  accessToken: (state) => state.configuration.accessToken,
})
export default class MyComponent extends React.Component {
  // ... 
}

MyComponent.propTypes = {
  // PropType for the hub proxy.
  mynotifier: hubShape,
};
```

#### Passing the hub proxy to child component(s)
```jsx
class MyComponent extends React.Component {

  // ... 

  render() {
    // Passing the hub proxy from this.props to child component(s) allows
    // also the child component(s) to register its (their) own listeners.
    const { ...passThroughProps } = this.props;
    return (<ChildComponent
      {...passThroughProps} />);
  }
}
```

#### Registering and unregistering listeners
```jsx
class MyComponent extends React.Component {

  // ...

  // Listeners may be registered in componentDidMount (recommended).
  componentDidMount() {
    // Hub proxy is found in this.props.
    const { mynotifier } = this.props;
    if (mynotifier) {
      // Register this.onInserted to listen 'inserted' event.
      mynotifier.register('inserted', this.onInserted);
      // Register this.onUpdated to listen 'updated' event.
      mynotifier.register('updated', this.onUpdated);
    }
  }

  // Listeners may be unregistered in componentWillUnmount (recommended).
  componentWillUnmount() {
    const { mynotifier } = this.props;
    if (mynotifier) {
      // Unregister this.onInserted from listening to 'inserted' event.
      mynotifier.unregister('inserted', this.onInserted);
      // Unregister this.onUpdated from listening to 'updated' event.
      mynotifier.unregister('updated', this.onUpdated);
    }
  }

  // Parameter list should match the response sent from the server.
  onInserted = (target, id) => {
    // Handle inserted event ...
  }

  onUpdated = (target, id) =>  {
    // Handle updated event ...
  }

  // ...
}
```

#### Invoking controller or sending data to it
```jsx
class MyComponent extends React.Component {

  // ...

  invoke() {
    // Requests '<baseAddress>/<controller>/target/123' with GET
    this.props.mynotifier.invoke('target', 123);
  }

  send(data) {
    // Requests '<baseAddress>/<controller>/target' with POST 
    // and the JS object `data` as payload in JSON format
    this.props.mynotifier.send('target', data);
  }

  // ...
}
```

#### Adding/removing the client to/from a named group

##### The SignalR hub
```csharp
public class MyNotifier : Hub
{
    // ...

    public Task AddToGroup(string group)
        => Groups.AddToGroupAsync(group);

    public Task RemoveFromGroup(string group)
        => Groups.RemoveFromGroupAsync(group);

    // ...
}
```

##### The client component
```jsx
class MyComponent extends React.Component {

  // ...

  add(group) {
    this.props.mynotifier.add(group);
  }

  remove(group) {
    this.props.mynotifier.remove(group);
  }

  // ...
}
```
