# react-signalr

### Description
Higher-Order Component that provides a connection to a SignalR hub. This component adds a hub proxy, that 
may be used to register and unregister event listeners, and also to invoke a hub controller and send data to it.

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
| accessTokenFactory       | func             |                          | Method for getting an access token                       |
| signalrPath              | string           | 'signalr'                | Path to signalr hubs                                     |
| controller               | string           | &lt;hubName&gt;          | Name of the controller (if different from hubName)       |

#### Methods in hub proxy
| Method                       | Parameters                        | Description                              |
| ---------------------------- | --------------------------------- | ---------------------------------------- |
| invoke(target, query)        | target: string, query: string     | Invokes hub controller with GET          |
| send(target, payload)        | target: string, payload: object   | Invokes hub controller with POST         |
| register(event, listener)    | event: string, listener: func     | Registers a listener for an event        |
| unregister(event, listener)  | event: string, listener: func     | Unregisters a listener for an event      |

### Code example
```jsx
import React from 'react';
import { injectSignalR, hubShape } from '@opuscapita/react-signalr';

class MyComponent extends React.Component {

  // ... 

  // Listeners may be registered in componentDidMount (recommended).
  componentDidMount() {
    // Hub proxy is found in this.props.
    const { mynotifier } = this.props;
    if (mynotifier) {
      // Register this.inserted to listen 'inserted' event.
      mynotifier.register('inserted', this.onInserted);
      mynotifier.register('updated', this.onUpdated);
    }
  }

  // Listeners may be unregistered in componentWillUnmount (recommended).
  componentWillUnmount() {
    const { mynotifier } = this.props;
    if (mynotifier) {
      mynotifier.unregister('inserted', this.onInserted);
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

  render() {
    // Passing the hub proxy from this.props to child component allows
    // also the child component to register its own listeners.
    const { ...passThroughProps } = this.props;
    return (<ChildComponent
      {...passThroughProps} />);
  }
}

MyComponent.propTypes = {
  // PropType for the hub proxy.
  mynotifier: hubShape,
};

export default injectSignalR(MyComponent, {
  hubName: 'mynotifier',
  // Either a string containing the server url or 
  // a function getting the server url from the state.
  baseAddress: (state) => state.configuration.server,
});
```
