'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = injectSignalR;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _signalrClient = require('@aspnet/signalr-client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

function injectSignalR(WrappedComponent) {
  var _class, _temp;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    hubName: '',
    baseAddress: undefined,
    accessToken: undefined,
    signalrPath: 'signalr',
    controller: '',
    retries: 3
  };
  var _options$hubName = options.hubName,
      hubName = _options$hubName === undefined ? '' : _options$hubName,
      _options$baseAddress = options.baseAddress,
      baseAddress = _options$baseAddress === undefined ? 'http://localhost:5555' : _options$baseAddress,
      _options$accessToken = options.accessToken,
      accessToken = _options$accessToken === undefined ? null : _options$accessToken,
      _options$signalrPath = options.signalrPath,
      signalrPath = _options$signalrPath === undefined ? 'signalr' : _options$signalrPath,
      _options$retries = options.retries,
      retries = _options$retries === undefined ? 3 : _options$retries;
  var _options$controller = options.controller,
      controller = _options$controller === undefined ? hubName : _options$controller;


  var getValueFromState = function getValueFromState(state, source) {
    if (typeof source === 'function') {
      return source(state);
    } else if (typeof source === 'string') {
      return source;
    }
    return '';
  };

  var invokeController = function invokeController(address, target) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    var urlBase = address + '/' + controller + '/' + target;
    var url = data ? urlBase + '/' + data : urlBase;
    return _axios2.default.get(url).catch(function (err) {
      console.error('Error: Invoking ' + controller + ' failed.\n\n' + err);
    });
  };

  var sendToController = function sendToController(address, targetMethod, data) {
    var url = address + '/' + controller + '/' + targetMethod;
    var payload = data ? data.toJS() : null;
    return _axios2.default.post(url, payload).catch(function (err) {
      console.error('Error: Sending data to ' + controller + ' failed.\n\n' + err);
    });
  };

  function accessTokenFactory() {
    return function (dispatch, getState) {
      var state = getState();
      return getValueFromState(state, accessToken);
    };
  }

  var InjectSignalR = (_temp = _class = function (_React$PureComponent) {
    _inherits(InjectSignalR, _React$PureComponent);

    function InjectSignalR(props) {
      _classCallCheck(this, InjectSignalR);

      var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

      _this.count = function (c, s) {
        return c + s.count();
      };

      _this.handleError = function (err) {
        var response = err.response,
            statusCode = err.statusCode;

        var _ref = response || {},
            status = _ref.status;

        switch (status || statusCode) {
          case 500:
            break;
          case 401:
            _this.oldToken = _this.token; // fall through
          default:
            _this.setState({ hub: null });break;
        }
      };

      _this.registerListener = function (name, handler) {
        // console.debug(`${InjectSignalR.displayName}
        //   .registerListener(${name}, ${handler.name || '<handler>'}(...))`);
        var _this$state = _this.state,
            pending = _this$state.pending,
            active = _this$state.active,
            moribund = _this$state.moribund;
        // Remove listener from moribund listeners

        if (!_this.moribund) _this.moribund = moribund || (0, _immutable.Map)();
        var existingMoribund = _this.moribund.getIn([name], (0, _immutable.Set)());
        if (existingMoribund.has(handler)) {
          var remainingMoribund = existingMoribund.filterNot(function (h) {
            return h === handler;
          });
          _this.moribund = remainingMoribund.size ? _this.moribund.setIn([name], remainingMoribund) : _this.moribund.delete(name);
        }
        // Add listener to pending listeners (if it is NOT active)
        if (!_this.active) _this.active = active || (0, _immutable.Map)();
        var existingActive = _this.active.getIn([name], (0, _immutable.Set)());
        if (!existingActive.has(handler)) {
          if (!_this.pending) _this.pending = pending || (0, _immutable.Map)();
          var existingPending = _this.pending.getIn([name], (0, _immutable.Set)());
          if (!existingPending.has(handler)) {
            _this.pending = _this.pending.setIn([name], existingPending.add(handler));
          }
        }
        if (_this.pending !== pending || _this.moribund !== moribund) {
          _this.setState({ pending: _this.pending, moribund: _this.moribund });
        }
      };

      _this.unregisterListener = function (name, handler) {
        // console.debug(`${InjectSignalR.displayName}
        //   .unregisterListener(${name}, ${handler.name || '<handler>'}(...))`);
        var _this$state2 = _this.state,
            pending = _this$state2.pending,
            active = _this$state2.active,
            moribund = _this$state2.moribund;
        // Remove listener from pending listeners

        if (!_this.pending) _this.pending = pending || (0, _immutable.Map)();
        var existingPending = _this.pending.getIn([name], (0, _immutable.Set)());
        if (existingPending.has(handler)) {
          var remainingPending = existingPending.filterNot(function (h) {
            return h === handler;
          });
          _this.pending = remainingPending.count() ? _this.pending.setIn([name], remainingPending) : _this.pending.delete(name);
        }
        // Add listener to moribund listeners (if it is active)
        if (!_this.active) _this.active = active || (0, _immutable.Map)();
        var existingActive = _this.active.getIn([name], (0, _immutable.Set)());
        if (existingActive.has(handler)) {
          if (!_this.moribund) _this.moribund = moribund || (0, _immutable.Map)();
          var existingMoribund = _this.moribund.getIn([name], (0, _immutable.Set)());
          if (!existingMoribund.has(handler)) {
            _this.moribund = _this.moribund.setIn([name], existingMoribund.add(handler));
          }
        }
        if (_this.pending !== pending || _this.moribund !== moribund) {
          _this.setState({ pending: _this.pending, moribund: _this.moribund });
        }
      };

      _this.invoke = function (target, data) {
        invokeController(_this.props.baseUrl, target, data);
      };

      _this.send = function (target, data) {
        sendToController(_this.props.baseUrl, target, data);
      };

      _this.state = {
        hub: null,
        pending: undefined,
        active: undefined,
        moribund: undefined,
        retry: 0,
        create: 0
      };
      return _this;
    }

    InjectSignalR.prototype.componentWillMount = function componentWillMount() {
      // console.debug(`${InjectSignalR.displayName}.componentWillMount`);
      this.hubProxy = {
        invoke: this.invoke,
        send: this.send,
        connectionId: undefined,
        register: this.registerListener,
        unregister: this.unregisterListener
      };
    };

    InjectSignalR.prototype.componentDidMount = function componentDidMount() {
      // console.debug(`${InjectSignalR.displayName}.componentDidMount`);
      this.createHub();
    };

    InjectSignalR.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
      if (this.state.hub !== nextState.hub) {
        // console.debug(`${InjectSignalR.displayName}.componentWillUpdate => hub`);
        if (this.state.hub) this.stopHub(this.state.hub, false);
        if (nextState.hub) this.startHub(nextState.hub);else this.createHub(nextState.create);
      } else if (!nextState.hub) {
        this.createHub(nextState.create);
      } else {
        var pending = nextState.pending,
            moribund = nextState.moribund;

        if (!moribund) {
          moribund = this.moribund || (0, _immutable.Map)();
        } else if (this.moribund) {
          moribund = moribund.mergeDeep(this.moribund);
        }
        var moribundCount = moribund.reduce(this.count, 0);
        if (moribundCount) {
          // console.debug(`${InjectSignalR.displayName}
          //   .componentWillUpdate => moribund [${moribundCount}]`);
          this.moribund = this.inactivateListeners(this.state.hub, moribund);
        }
        if (!pending) {
          pending = this.pending || (0, _immutable.Map)();
        } else if (this.pending) {
          pending = pending.mergeDeep(this.pending);
        }
        var pendingCount = pending.reduce(this.count, 0);
        if (pendingCount) {
          // console.debug(`${InjectSignalR.displayName}
          //   .componentWillUpdate => pending [${pendingCount}]`);
          this.pending = this.activateListeners(nextState.hub, pending);
        }
      }
    };

    InjectSignalR.prototype.componentWillUnmount = function componentWillUnmount() {
      // console.debug(`${InjectSignalR.displayName}.componentWillUnmount`);
      this.stopHub(this.state.hub, true);
    };

    InjectSignalR.prototype.createHub = function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(curCreate) {
        var _state, retry, create, _props, baseUrl, signalrActions, hubAddress, hub;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // console.debug(`${InjectSignalR.displayName}.createHub`);
                _state = this.state, retry = _state.retry, create = _state.create;

                if (!(retry > retries)) {
                  _context.next = 6;
                  break;
                }

                console.error('Error: Ran out of retries for starting ' + hubName + '!');
                this.setState({ retry: 0, create: 0 });
                _context.next = 21;
                break;

              case 6:
                _props = this.props, baseUrl = _props.baseUrl, signalrActions = _props.signalrActions;

                if (!(baseUrl && hubName)) {
                  _context.next = 21;
                  break;
                }

                hubAddress = baseUrl;

                if (signalrPath) hubAddress = hubAddress + '/' + signalrPath;
                hubAddress = hubAddress + '/' + hubName;
                // Here below is how things are done with ASP.NET Core 2.0 version
                this.token = signalrActions.accessTokenFactory();

                if (!this.token) {
                  _context.next = 18;
                  break;
                }

                if (!(this.oldToken === this.token)) {
                  _context.next = 16;
                  break;
                }

                this.setState({ hub: null, create: (curCreate || create) + 1 });
                return _context.abrupt('return');

              case 16:
                this.oldToken = undefined;
                hubAddress = hubAddress + '?access_token=' + this.token;

              case 18:
                hub = new _signalrClient.HubConnection(hubAddress, { transport: _signalrClient.TransportType.WebSockets });
                // Here below is how things should be done after upgrading to ASP.NET Core 2.1 version
                // this.token = signalrActions.accessTokenFactory();
                // if (this.token) {
                //   if (this.oldToken === this.token) {
                //     this.setState({ hub: null, create: (curCreate || create) + 1 });
                //     return;
                //   }
                //   this.oldToken = undefined;
                // }
                // const hub = new HubConnection(hubAddress, {
                //   transport: TransportType.WebSockets,
                //   accessTokenFactory: signalrActions.accessTokenFactory,
                // });

                hub.onclose = this.handleError;
                this.setState({ hub: hub, retry: retry + 1, create: 0 });

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function createHub(_x3) {
        return _ref2.apply(this, arguments);
      }

      return createHub;
    }();

    InjectSignalR.prototype.startHub = function startHub(hub) {
      var _this2 = this;

      // console.debug(`${InjectSignalR.displayName}.startHub`);
      if (hub) {
        hub.start().then(function () {
          var _ref3 = hub.connection || {},
              connectionId = _ref3.connectionId;

          _this2.hubProxy.connectionId = connectionId;
          var _state2 = _this2.state,
              pending = _state2.pending,
              active = _state2.active;

          if (!_this2.pending) _this2.pending = pending || (0, _immutable.Map)();
          if (!_this2.active) _this2.active = active || (0, _immutable.Map)();
          _this2.setState({ active: _this2.active, pending: _this2.pending, retry: 0 });
        }).catch(function (err) {
          console.warn('Warning: Error while establishing connection to hub ' + hubName + '.\n\n' + err);
          hub.stop();
          _this2.handleError(err);
        });
      }
    };

    InjectSignalR.prototype.stopHub = function stopHub(hub, clear) {
      // console.debug(`${InjectSignalR.displayName}.stopHub`);
      if (hub) {
        if (clear) {
          // Clear pending
          this.pending = undefined;
          // Merge active to pending
        } else if (!this.pending) {
          this.pending = this.state.active;
        } else if (this.state.active) {
          this.pending = this.pending.mergeDeep(this.state.active);
        }
        hub.stop();
        this.active = undefined;
        this.setState({ pending: this.pending, active: this.active });
      }
    };

    InjectSignalR.prototype.activateListeners = function activateListeners(hub, pendingParam) {
      var _this3 = this;

      // console.debug(`${InjectSignalR.displayName}
      //   .activateListeners([${(pending ? pending.reduce(this.count, 0) : 0)}])`);
      var pending = pendingParam;
      if (hub && pendingParam) {
        var connection = hub.connection;

        if (connection && connection.connectionState === 2) {
          var active = this.state.active;

          if (!this.active) this.active = active || (0, _immutable.Map)();
          if (this.active.reduce(this.count, 0)) {
            pending = pending.mapEntries(function (_ref4) {
              var name = _ref4[0],
                  curHandlers = _ref4[1];

              var existing = _this3.active.getIn([name]);
              var handlers = existing ? curHandlers.filterNot(function (handler) {
                return existing.has(handler);
              }) : curHandlers;
              return [name, handlers];
            });
          }
          pending.mapEntries(function (_ref5) {
            var name = _ref5[0],
                handlers = _ref5[1];
            return handlers.map(function (handler) {
              return hub.on(name, handler);
            });
          });
          this.active = this.active.mergeDeep(pending);
          this.setState({ pending: undefined, active: this.active });
          return undefined;
        }
      }
      return pending;
    };

    InjectSignalR.prototype.inactivateListeners = function inactivateListeners(hub, moribund) {
      // console.debug(`${InjectSignalR.displayName}
      //   .inactivateListeners([${(moribund ? moribund.reduce(this.count, 0) : 0)}])`);
      if (hub && moribund) {
        moribund.mapEntries(function (_ref6) {
          var name = _ref6[0],
              handlers = _ref6[1];
          return handlers.map(function (handler) {
            return hub.off(name, handler);
          });
        });
        var active = this.state.active;

        if (!this.active) this.active = active || (0, _immutable.Map)();
        this.active = this.active.mapEntries(function (_ref7) {
          var name = _ref7[0],
              curHandlers = _ref7[1];

          var removable = moribund.getIn([name]);
          var handlers = removable ? curHandlers.filterNot(function (handler) {
            return removable.has(handler);
          }) : curHandlers;
          return [name, handlers];
        });
        this.setState({ active: this.active, moribund: undefined });
        return undefined;
      }
      return moribund;
    };

    InjectSignalR.prototype.render = function render() {
      var _hubProp;

      var _props2 = this.props,
          baseUrl = _props2.baseUrl,
          signalrActions = _props2.signalrActions,
          passThroughProps = _objectWithoutProperties(_props2, ['baseUrl', 'signalrActions']);

      var hubProp = (_hubProp = {}, _hubProp[hubName] = this.hubProxy, _hubProp);
      return _react2.default.createElement(WrappedComponent, _extends({}, passThroughProps, hubProp));
    };

    return InjectSignalR;
  }(_react2.default.PureComponent), _class.WrappedComponent = WrappedComponent, _temp);


  InjectSignalR.displayName = 'InjectSignalR(' + getDisplayName(WrappedComponent) + ')';

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      signalrActions: (0, _redux.bindActionCreators)({ accessTokenFactory: accessTokenFactory }, dispatch)
    };
  };

  var mapStateToProps = function mapStateToProps(state) {
    var baseUrl = getValueFromState(state, baseAddress);
    return { baseUrl: baseUrl };
  };

  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(InjectSignalR);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbImluamVjdFNpZ25hbFIiLCJnZXREaXNwbGF5TmFtZSIsIkNvbXBvbmVudCIsImRpc3BsYXlOYW1lIiwibmFtZSIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwidW5kZWZpbmVkIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsImNvbnRyb2xsZXIiLCJyZXRyaWVzIiwiZ2V0VmFsdWVGcm9tU3RhdGUiLCJzdGF0ZSIsInNvdXJjZSIsImludm9rZUNvbnRyb2xsZXIiLCJhZGRyZXNzIiwidGFyZ2V0IiwiZGF0YSIsInVybEJhc2UiLCJ1cmwiLCJnZXQiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInNlbmRUb0NvbnRyb2xsZXIiLCJ0YXJnZXRNZXRob2QiLCJwYXlsb2FkIiwidG9KUyIsInBvc3QiLCJhY2Nlc3NUb2tlbkZhY3RvcnkiLCJkaXNwYXRjaCIsImdldFN0YXRlIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImhhbmRsZUVycm9yIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwib2xkVG9rZW4iLCJ0b2tlbiIsInNldFN0YXRlIiwiaHViIiwicmVnaXN0ZXJMaXN0ZW5lciIsImhhbmRsZXIiLCJwZW5kaW5nIiwiYWN0aXZlIiwibW9yaWJ1bmQiLCJleGlzdGluZ01vcmlidW5kIiwiZ2V0SW4iLCJoYXMiLCJyZW1haW5pbmdNb3JpYnVuZCIsImZpbHRlck5vdCIsImgiLCJzaXplIiwic2V0SW4iLCJkZWxldGUiLCJleGlzdGluZ0FjdGl2ZSIsImV4aXN0aW5nUGVuZGluZyIsImFkZCIsInVucmVnaXN0ZXJMaXN0ZW5lciIsInJlbWFpbmluZ1BlbmRpbmciLCJpbnZva2UiLCJiYXNlVXJsIiwic2VuZCIsInJldHJ5IiwiY3JlYXRlIiwiY29tcG9uZW50V2lsbE1vdW50IiwiaHViUHJveHkiLCJjb25uZWN0aW9uSWQiLCJyZWdpc3RlciIsInVucmVnaXN0ZXIiLCJjb21wb25lbnREaWRNb3VudCIsImNyZWF0ZUh1YiIsImNvbXBvbmVudFdpbGxVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJzdG9wSHViIiwic3RhcnRIdWIiLCJtZXJnZURlZXAiLCJtb3JpYnVuZENvdW50IiwicmVkdWNlIiwiaW5hY3RpdmF0ZUxpc3RlbmVycyIsInBlbmRpbmdDb3VudCIsImFjdGl2YXRlTGlzdGVuZXJzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjdXJDcmVhdGUiLCJzaWduYWxyQWN0aW9ucyIsImh1YkFkZHJlc3MiLCJ0cmFuc3BvcnQiLCJXZWJTb2NrZXRzIiwib25jbG9zZSIsInN0YXJ0IiwidGhlbiIsImNvbm5lY3Rpb24iLCJ3YXJuIiwic3RvcCIsImNsZWFyIiwicGVuZGluZ1BhcmFtIiwiY29ubmVjdGlvblN0YXRlIiwibWFwRW50cmllcyIsImN1ckhhbmRsZXJzIiwiZXhpc3RpbmciLCJoYW5kbGVycyIsIm1hcCIsIm9uIiwib2ZmIiwicmVtb3ZhYmxlIiwicmVuZGVyIiwicGFzc1Rocm91Z2hQcm9wcyIsImh1YlByb3AiLCJQdXJlQ29tcG9uZW50IiwibWFwRGlzcGF0Y2hUb1Byb3BzIiwibWFwU3RhdGVUb1Byb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBWXdCQSxhOztBQVp4Qjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQyxjQUFULENBQXdCQyxTQUF4QixFQUFtQztBQUNqQyxTQUFPQSxVQUFVQyxXQUFWLElBQXlCRCxVQUFVRSxJQUFuQyxJQUEyQyxXQUFsRDtBQUNEOztBQUVjLFNBQVNKLGFBQVQsQ0FDYkssZ0JBRGEsRUFVYjtBQUFBOztBQUFBLE1BUkFDLE9BUUEsdUVBUlU7QUFDUkMsYUFBUyxFQUREO0FBRVJDLGlCQUFhQyxTQUZMO0FBR1JDLGlCQUFhRCxTQUhMO0FBSVJFLGlCQUFhLFNBSkw7QUFLUkMsZ0JBQVksRUFMSjtBQU1SQyxhQUFTO0FBTkQsR0FRVjtBQUFBLHlCQU9JUCxPQVBKLENBRUVDLE9BRkY7QUFBQSxNQUVFQSxPQUZGLG9DQUVZLEVBRlo7QUFBQSw2QkFPSUQsT0FQSixDQUdFRSxXQUhGO0FBQUEsTUFHRUEsV0FIRix3Q0FHZ0IsdUJBSGhCO0FBQUEsNkJBT0lGLE9BUEosQ0FJRUksV0FKRjtBQUFBLE1BSUVBLFdBSkYsd0NBSWdCLElBSmhCO0FBQUEsNkJBT0lKLE9BUEosQ0FLRUssV0FMRjtBQUFBLE1BS0VBLFdBTEYsd0NBS2dCLFNBTGhCO0FBQUEseUJBT0lMLE9BUEosQ0FNRU8sT0FORjtBQUFBLE1BTUVBLE9BTkYsb0NBTVksQ0FOWjtBQUFBLDRCQVFpQ1AsT0FSakMsQ0FRUU0sVUFSUjtBQUFBLE1BUVFBLFVBUlIsdUNBUXFCTCxPQVJyQjs7O0FBVUEsTUFBTU8sb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQzNDLFFBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUNoQyxhQUFPQSxPQUFPRCxLQUFQLENBQVA7QUFDRCxLQUZELE1BRU8sSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO0FBQ3JDLGFBQU9BLE1BQVA7QUFDRDtBQUNELFdBQU8sRUFBUDtBQUNELEdBUEQ7O0FBU0EsTUFBTUMsbUJBQW1CLFNBQW5CQSxnQkFBbUIsQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXVDO0FBQUEsUUFBckJDLElBQXFCLHVFQUFkWCxTQUFjOztBQUM5RCxRQUFNWSxVQUFhSCxPQUFiLFNBQXdCTixVQUF4QixTQUFzQ08sTUFBNUM7QUFDQSxRQUFNRyxNQUFNRixPQUFVQyxPQUFWLFNBQXFCRCxJQUFyQixHQUE4QkMsT0FBMUM7QUFDQSxXQUFPLGdCQUFNRSxHQUFOLENBQVVELEdBQVYsRUFDSkUsS0FESSxDQUNFLFVBQUNDLEdBQUQsRUFBUztBQUNkQyxjQUFRQyxLQUFSLHNCQUFpQ2YsVUFBakMsb0JBQTBEYSxHQUExRDtBQUNELEtBSEksQ0FBUDtBQUlELEdBUEQ7O0FBU0EsTUFBTUcsbUJBQW1CLFNBQW5CQSxnQkFBbUIsQ0FBQ1YsT0FBRCxFQUFVVyxZQUFWLEVBQXdCVCxJQUF4QixFQUFpQztBQUN4RCxRQUFNRSxNQUFTSixPQUFULFNBQW9CTixVQUFwQixTQUFrQ2lCLFlBQXhDO0FBQ0EsUUFBTUMsVUFBVVYsT0FBT0EsS0FBS1csSUFBTCxFQUFQLEdBQXFCLElBQXJDO0FBQ0EsV0FBTyxnQkFBTUMsSUFBTixDQUFXVixHQUFYLEVBQWdCUSxPQUFoQixFQUNKTixLQURJLENBQ0UsVUFBQ0MsR0FBRCxFQUFTO0FBQ2RDLGNBQVFDLEtBQVIsNkJBQXdDZixVQUF4QyxvQkFBaUVhLEdBQWpFO0FBQ0QsS0FISSxDQUFQO0FBSUQsR0FQRDs7QUFTQSxXQUFTUSxrQkFBVCxHQUE4QjtBQUM1QixXQUFPLFVBQUNDLFFBQUQsRUFBV0MsUUFBWCxFQUF3QjtBQUM3QixVQUFNcEIsUUFBUW9CLFVBQWQ7QUFDQSxhQUFPckIsa0JBQWtCQyxLQUFsQixFQUF5QkwsV0FBekIsQ0FBUDtBQUNELEtBSEQ7QUFJRDs7QUExQ0QsTUE0Q00wQixhQTVDTjtBQUFBOztBQStDRSwyQkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLG1EQUNqQixnQ0FBTUEsS0FBTixDQURpQjs7QUFBQSxZQW9FbkJDLEtBcEVtQixHQW9FWCxVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxlQUFVRCxJQUFJQyxFQUFFRixLQUFGLEVBQWQ7QUFBQSxPQXBFVzs7QUFBQSxZQW9JbkJHLFdBcEltQixHQW9JTCxVQUFDaEIsR0FBRCxFQUFTO0FBQUEsWUFDYmlCLFFBRGEsR0FDWWpCLEdBRFosQ0FDYmlCLFFBRGE7QUFBQSxZQUNIQyxVQURHLEdBQ1lsQixHQURaLENBQ0hrQixVQURHOztBQUFBLG1CQUVGRCxZQUFZLEVBRlY7QUFBQSxZQUViRSxNQUZhLFFBRWJBLE1BRmE7O0FBR3JCLGdCQUFRQSxVQUFVRCxVQUFsQjtBQUNFLGVBQUssR0FBTDtBQUFVO0FBQ1YsZUFBSyxHQUFMO0FBQVUsa0JBQUtFLFFBQUwsR0FBZ0IsTUFBS0MsS0FBckIsQ0FGWixDQUV3QztBQUN0QztBQUFTLGtCQUFLQyxRQUFMLENBQWMsRUFBRUMsS0FBSyxJQUFQLEVBQWQsRUFBOEI7QUFIekM7QUFLRCxPQTVJa0I7O0FBQUEsWUFnS25CQyxnQkFoS21CLEdBZ0tBLFVBQUM3QyxJQUFELEVBQU84QyxPQUFQLEVBQW1CO0FBQ3BDO0FBQ0E7QUFGb0MsMEJBR0UsTUFBS25DLEtBSFA7QUFBQSxZQUc1Qm9DLE9BSDRCLGVBRzVCQSxPQUg0QjtBQUFBLFlBR25CQyxNQUhtQixlQUduQkEsTUFIbUI7QUFBQSxZQUdYQyxRQUhXLGVBR1hBLFFBSFc7QUFJcEM7O0FBQ0EsWUFBSSxDQUFDLE1BQUtBLFFBQVYsRUFBb0IsTUFBS0EsUUFBTCxHQUFnQkEsWUFBWSxxQkFBNUI7QUFDcEIsWUFBTUMsbUJBQW1CLE1BQUtELFFBQUwsQ0FBY0UsS0FBZCxDQUFvQixDQUFDbkQsSUFBRCxDQUFwQixFQUE0QixxQkFBNUIsQ0FBekI7QUFDQSxZQUFJa0QsaUJBQWlCRSxHQUFqQixDQUFxQk4sT0FBckIsQ0FBSixFQUFtQztBQUNqQyxjQUFNTyxvQkFBb0JILGlCQUFpQkksU0FBakIsQ0FBMkI7QUFBQSxtQkFBS0MsTUFBTVQsT0FBWDtBQUFBLFdBQTNCLENBQTFCO0FBQ0EsZ0JBQUtHLFFBQUwsR0FBZ0JJLGtCQUFrQkcsSUFBbEIsR0FDWixNQUFLUCxRQUFMLENBQWNRLEtBQWQsQ0FBb0IsQ0FBQ3pELElBQUQsQ0FBcEIsRUFBNEJxRCxpQkFBNUIsQ0FEWSxHQUNxQyxNQUFLSixRQUFMLENBQWNTLE1BQWQsQ0FBcUIxRCxJQUFyQixDQURyRDtBQUVEO0FBQ0Q7QUFDQSxZQUFJLENBQUMsTUFBS2dELE1BQVYsRUFBa0IsTUFBS0EsTUFBTCxHQUFjQSxVQUFVLHFCQUF4QjtBQUNsQixZQUFNVyxpQkFBaUIsTUFBS1gsTUFBTCxDQUFZRyxLQUFaLENBQWtCLENBQUNuRCxJQUFELENBQWxCLEVBQTBCLHFCQUExQixDQUF2QjtBQUNBLFlBQUksQ0FBQzJELGVBQWVQLEdBQWYsQ0FBbUJOLE9BQW5CLENBQUwsRUFBa0M7QUFDaEMsY0FBSSxDQUFDLE1BQUtDLE9BQVYsRUFBbUIsTUFBS0EsT0FBTCxHQUFlQSxXQUFXLHFCQUExQjtBQUNuQixjQUFNYSxrQkFBa0IsTUFBS2IsT0FBTCxDQUFhSSxLQUFiLENBQW1CLENBQUNuRCxJQUFELENBQW5CLEVBQTJCLHFCQUEzQixDQUF4QjtBQUNBLGNBQUksQ0FBQzRELGdCQUFnQlIsR0FBaEIsQ0FBb0JOLE9BQXBCLENBQUwsRUFBbUM7QUFDakMsa0JBQUtDLE9BQUwsR0FBZSxNQUFLQSxPQUFMLENBQWFVLEtBQWIsQ0FBbUIsQ0FBQ3pELElBQUQsQ0FBbkIsRUFBMkI0RCxnQkFBZ0JDLEdBQWhCLENBQW9CZixPQUFwQixDQUEzQixDQUFmO0FBQ0Q7QUFDRjtBQUNELFlBQUksTUFBS0MsT0FBTCxLQUFpQkEsT0FBakIsSUFBNEIsTUFBS0UsUUFBTCxLQUFrQkEsUUFBbEQsRUFBNEQ7QUFDMUQsZ0JBQUtOLFFBQUwsQ0FBYyxFQUFFSSxTQUFTLE1BQUtBLE9BQWhCLEVBQXlCRSxVQUFVLE1BQUtBLFFBQXhDLEVBQWQ7QUFDRDtBQUNGLE9BekxrQjs7QUFBQSxZQTJMbkJhLGtCQTNMbUIsR0EyTEUsVUFBQzlELElBQUQsRUFBTzhDLE9BQVAsRUFBbUI7QUFDdEM7QUFDQTtBQUZzQywyQkFHQSxNQUFLbkMsS0FITDtBQUFBLFlBRzlCb0MsT0FIOEIsZ0JBRzlCQSxPQUg4QjtBQUFBLFlBR3JCQyxNQUhxQixnQkFHckJBLE1BSHFCO0FBQUEsWUFHYkMsUUFIYSxnQkFHYkEsUUFIYTtBQUl0Qzs7QUFDQSxZQUFJLENBQUMsTUFBS0YsT0FBVixFQUFtQixNQUFLQSxPQUFMLEdBQWVBLFdBQVcscUJBQTFCO0FBQ25CLFlBQU1hLGtCQUFrQixNQUFLYixPQUFMLENBQWFJLEtBQWIsQ0FBbUIsQ0FBQ25ELElBQUQsQ0FBbkIsRUFBMkIscUJBQTNCLENBQXhCO0FBQ0EsWUFBSTRELGdCQUFnQlIsR0FBaEIsQ0FBb0JOLE9BQXBCLENBQUosRUFBa0M7QUFDaEMsY0FBTWlCLG1CQUFtQkgsZ0JBQWdCTixTQUFoQixDQUEwQjtBQUFBLG1CQUFLQyxNQUFNVCxPQUFYO0FBQUEsV0FBMUIsQ0FBekI7QUFDQSxnQkFBS0MsT0FBTCxHQUFlZ0IsaUJBQWlCN0IsS0FBakIsS0FDWCxNQUFLYSxPQUFMLENBQWFVLEtBQWIsQ0FBbUIsQ0FBQ3pELElBQUQsQ0FBbkIsRUFBMkIrRCxnQkFBM0IsQ0FEVyxHQUVYLE1BQUtoQixPQUFMLENBQWFXLE1BQWIsQ0FBb0IxRCxJQUFwQixDQUZKO0FBR0Q7QUFDRDtBQUNBLFlBQUksQ0FBQyxNQUFLZ0QsTUFBVixFQUFrQixNQUFLQSxNQUFMLEdBQWNBLFVBQVUscUJBQXhCO0FBQ2xCLFlBQU1XLGlCQUFpQixNQUFLWCxNQUFMLENBQVlHLEtBQVosQ0FBa0IsQ0FBQ25ELElBQUQsQ0FBbEIsRUFBMEIscUJBQTFCLENBQXZCO0FBQ0EsWUFBSTJELGVBQWVQLEdBQWYsQ0FBbUJOLE9BQW5CLENBQUosRUFBaUM7QUFDL0IsY0FBSSxDQUFDLE1BQUtHLFFBQVYsRUFBb0IsTUFBS0EsUUFBTCxHQUFnQkEsWUFBWSxxQkFBNUI7QUFDcEIsY0FBTUMsbUJBQW1CLE1BQUtELFFBQUwsQ0FBY0UsS0FBZCxDQUFvQixDQUFDbkQsSUFBRCxDQUFwQixFQUE0QixxQkFBNUIsQ0FBekI7QUFDQSxjQUFJLENBQUNrRCxpQkFBaUJFLEdBQWpCLENBQXFCTixPQUFyQixDQUFMLEVBQW9DO0FBQ2xDLGtCQUFLRyxRQUFMLEdBQWdCLE1BQUtBLFFBQUwsQ0FBY1EsS0FBZCxDQUFvQixDQUFDekQsSUFBRCxDQUFwQixFQUE0QmtELGlCQUFpQlcsR0FBakIsQ0FBcUJmLE9BQXJCLENBQTVCLENBQWhCO0FBQ0Q7QUFDRjtBQUNELFlBQUksTUFBS0MsT0FBTCxLQUFpQkEsT0FBakIsSUFBNEIsTUFBS0UsUUFBTCxLQUFrQkEsUUFBbEQsRUFBNEQ7QUFDMUQsZ0JBQUtOLFFBQUwsQ0FBYyxFQUFFSSxTQUFTLE1BQUtBLE9BQWhCLEVBQXlCRSxVQUFVLE1BQUtBLFFBQXhDLEVBQWQ7QUFDRDtBQUNGLE9Bck5rQjs7QUFBQSxZQXdRbkJlLE1BeFFtQixHQXdRVixVQUFDakQsTUFBRCxFQUFTQyxJQUFULEVBQWtCO0FBQ3pCSCx5QkFBaUIsTUFBS29CLEtBQUwsQ0FBV2dDLE9BQTVCLEVBQXFDbEQsTUFBckMsRUFBNkNDLElBQTdDO0FBQ0QsT0ExUWtCOztBQUFBLFlBNFFuQmtELElBNVFtQixHQTRRWixVQUFDbkQsTUFBRCxFQUFTQyxJQUFULEVBQWtCO0FBQ3ZCUSx5QkFBaUIsTUFBS1MsS0FBTCxDQUFXZ0MsT0FBNUIsRUFBcUNsRCxNQUFyQyxFQUE2Q0MsSUFBN0M7QUFDRCxPQTlRa0I7O0FBRWpCLFlBQUtMLEtBQUwsR0FBYTtBQUNYaUMsYUFBSyxJQURNO0FBRVhHLGlCQUFTMUMsU0FGRTtBQUdYMkMsZ0JBQVEzQyxTQUhHO0FBSVg0QyxrQkFBVTVDLFNBSkM7QUFLWDhELGVBQU8sQ0FMSTtBQU1YQyxnQkFBUTtBQU5HLE9BQWI7QUFGaUI7QUFVbEI7O0FBekRILDRCQTJERUMsa0JBM0RGLGlDQTJEdUI7QUFDbkI7QUFDQSxXQUFLQyxRQUFMLEdBQWdCO0FBQ2ROLGdCQUFRLEtBQUtBLE1BREM7QUFFZEUsY0FBTSxLQUFLQSxJQUZHO0FBR2RLLHNCQUFjbEUsU0FIQTtBQUlkbUUsa0JBQVUsS0FBSzNCLGdCQUpEO0FBS2Q0QixvQkFBWSxLQUFLWDtBQUxILE9BQWhCO0FBT0QsS0FwRUg7O0FBQUEsNEJBc0VFWSxpQkF0RUYsZ0NBc0VzQjtBQUNsQjtBQUNBLFdBQUtDLFNBQUw7QUFDRCxLQXpFSDs7QUFBQSw0QkEyRUVDLG1CQTNFRixnQ0EyRXNCQyxTQTNFdEIsRUEyRWlDQyxTQTNFakMsRUEyRTRDO0FBQ3hDLFVBQUksS0FBS25FLEtBQUwsQ0FBV2lDLEdBQVgsS0FBbUJrQyxVQUFVbEMsR0FBakMsRUFBc0M7QUFDcEM7QUFDQSxZQUFJLEtBQUtqQyxLQUFMLENBQVdpQyxHQUFmLEVBQW9CLEtBQUttQyxPQUFMLENBQWEsS0FBS3BFLEtBQUwsQ0FBV2lDLEdBQXhCLEVBQTZCLEtBQTdCO0FBQ3BCLFlBQUlrQyxVQUFVbEMsR0FBZCxFQUFtQixLQUFLb0MsUUFBTCxDQUFjRixVQUFVbEMsR0FBeEIsRUFBbkIsS0FDSyxLQUFLK0IsU0FBTCxDQUFlRyxVQUFVVixNQUF6QjtBQUNOLE9BTEQsTUFLTyxJQUFJLENBQUNVLFVBQVVsQyxHQUFmLEVBQW9CO0FBQ3pCLGFBQUsrQixTQUFMLENBQWVHLFVBQVVWLE1BQXpCO0FBQ0QsT0FGTSxNQUVBO0FBQUEsWUFDQ3JCLE9BREQsR0FDdUIrQixTQUR2QixDQUNDL0IsT0FERDtBQUFBLFlBQ1VFLFFBRFYsR0FDdUI2QixTQUR2QixDQUNVN0IsUUFEVjs7QUFFTCxZQUFJLENBQUNBLFFBQUwsRUFBZTtBQUNiQSxxQkFBVyxLQUFLQSxRQUFMLElBQWlCLHFCQUE1QjtBQUNELFNBRkQsTUFFTyxJQUFJLEtBQUtBLFFBQVQsRUFBbUI7QUFDeEJBLHFCQUFXQSxTQUFTZ0MsU0FBVCxDQUFtQixLQUFLaEMsUUFBeEIsQ0FBWDtBQUNEO0FBQ0QsWUFBTWlDLGdCQUFnQmpDLFNBQVNrQyxNQUFULENBQWdCLEtBQUtqRCxLQUFyQixFQUE0QixDQUE1QixDQUF0QjtBQUNBLFlBQUlnRCxhQUFKLEVBQW1CO0FBQ2pCO0FBQ0E7QUFDQSxlQUFLakMsUUFBTCxHQUFnQixLQUFLbUMsbUJBQUwsQ0FBeUIsS0FBS3pFLEtBQUwsQ0FBV2lDLEdBQXBDLEVBQXlDSyxRQUF6QyxDQUFoQjtBQUNEO0FBQ0QsWUFBSSxDQUFDRixPQUFMLEVBQWM7QUFDWkEsb0JBQVUsS0FBS0EsT0FBTCxJQUFnQixxQkFBMUI7QUFDRCxTQUZELE1BRU8sSUFBSSxLQUFLQSxPQUFULEVBQWtCO0FBQ3ZCQSxvQkFBVUEsUUFBUWtDLFNBQVIsQ0FBa0IsS0FBS2xDLE9BQXZCLENBQVY7QUFDRDtBQUNELFlBQU1zQyxlQUFldEMsUUFBUW9DLE1BQVIsQ0FBZSxLQUFLakQsS0FBcEIsRUFBMkIsQ0FBM0IsQ0FBckI7QUFDQSxZQUFJbUQsWUFBSixFQUFrQjtBQUNoQjtBQUNBO0FBQ0EsZUFBS3RDLE9BQUwsR0FBZSxLQUFLdUMsaUJBQUwsQ0FBdUJSLFVBQVVsQyxHQUFqQyxFQUFzQ0csT0FBdEMsQ0FBZjtBQUNEO0FBQ0Y7QUFDRixLQTVHSDs7QUFBQSw0QkE4R0V3QyxvQkE5R0YsbUNBOEd5QjtBQUNyQjtBQUNBLFdBQUtSLE9BQUwsQ0FBYSxLQUFLcEUsS0FBTCxDQUFXaUMsR0FBeEIsRUFBNkIsSUFBN0I7QUFDRCxLQWpISDs7QUFBQSw0QkFxSFErQixTQXJIUjtBQUFBLDJGQXFIa0JhLFNBckhsQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBc0hJO0FBdEhKLHlCQXVIOEIsS0FBSzdFLEtBdkhuQyxFQXVIWXdELEtBdkhaLFVBdUhZQSxLQXZIWixFQXVIbUJDLE1BdkhuQixVQXVIbUJBLE1BdkhuQjs7QUFBQSxzQkF3SFFELFFBQVExRCxPQXhIaEI7QUFBQTtBQUFBO0FBQUE7O0FBeUhNYSx3QkFBUUMsS0FBUiw2Q0FBd0RwQixPQUF4RDtBQUNBLHFCQUFLd0MsUUFBTCxDQUFjLEVBQUV3QixPQUFPLENBQVQsRUFBWUMsUUFBUSxDQUFwQixFQUFkO0FBMUhOO0FBQUE7O0FBQUE7QUFBQSx5QkE0SDBDLEtBQUtuQyxLQTVIL0MsRUE0SGNnQyxPQTVIZCxVQTRIY0EsT0E1SGQsRUE0SHVCd0IsY0E1SHZCLFVBNEh1QkEsY0E1SHZCOztBQUFBLHNCQTZIVXhCLFdBQVc5RCxPQTdIckI7QUFBQTtBQUFBO0FBQUE7O0FBOEhZdUYsMEJBOUhaLEdBOEh5QnpCLE9BOUh6Qjs7QUErSFEsb0JBQUkxRCxXQUFKLEVBQWlCbUYsYUFBZ0JBLFVBQWhCLFNBQThCbkYsV0FBOUI7QUFDakJtRiw2QkFBZ0JBLFVBQWhCLFNBQThCdkYsT0FBOUI7QUFDQTtBQUNBLHFCQUFLdUMsS0FBTCxHQUFhK0MsZUFBZTVELGtCQUFmLEVBQWI7O0FBbElSLHFCQW1JWSxLQUFLYSxLQW5JakI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsc0JBb0ljLEtBQUtELFFBQUwsS0FBa0IsS0FBS0MsS0FwSXJDO0FBQUE7QUFBQTtBQUFBOztBQXFJWSxxQkFBS0MsUUFBTCxDQUFjLEVBQUVDLEtBQUssSUFBUCxFQUFhd0IsUUFBUSxDQUFDb0IsYUFBYXBCLE1BQWQsSUFBd0IsQ0FBN0MsRUFBZDtBQXJJWjs7QUFBQTtBQXdJVSxxQkFBSzNCLFFBQUwsR0FBZ0JwQyxTQUFoQjtBQUNBcUYsNkJBQWdCQSxVQUFoQixzQkFBMkMsS0FBS2hELEtBQWhEOztBQXpJVjtBQTJJY0UsbUJBM0lkLEdBMklvQixpQ0FBa0I4QyxVQUFsQixFQUE4QixFQUFFQyxXQUFXLDZCQUFjQyxVQUEzQixFQUE5QixDQTNJcEI7QUE0SVE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0FoRCxvQkFBSWlELE9BQUosR0FBYyxLQUFLeEQsV0FBbkI7QUFDQSxxQkFBS00sUUFBTCxDQUFjLEVBQUVDLFFBQUYsRUFBT3VCLE9BQU9BLFFBQVEsQ0FBdEIsRUFBeUJDLFFBQVEsQ0FBakMsRUFBZDs7QUExSlI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUEsNEJBK0pFWSxRQS9KRixxQkErSldwQyxHQS9KWCxFQStKZ0I7QUFBQTs7QUFDWjtBQUNBLFVBQUlBLEdBQUosRUFBUztBQUNQQSxZQUFJa0QsS0FBSixHQUNHQyxJQURILENBQ1EsWUFBTTtBQUFBLHNCQUNlbkQsSUFBSW9ELFVBQUosSUFBa0IsRUFEakM7QUFBQSxjQUNGekIsWUFERSxTQUNGQSxZQURFOztBQUVWLGlCQUFLRCxRQUFMLENBQWNDLFlBQWQsR0FBNkJBLFlBQTdCO0FBRlUsd0JBR2tCLE9BQUs1RCxLQUh2QjtBQUFBLGNBR0ZvQyxPQUhFLFdBR0ZBLE9BSEU7QUFBQSxjQUdPQyxNQUhQLFdBR09BLE1BSFA7O0FBSVYsY0FBSSxDQUFDLE9BQUtELE9BQVYsRUFBbUIsT0FBS0EsT0FBTCxHQUFlQSxXQUFXLHFCQUExQjtBQUNuQixjQUFJLENBQUMsT0FBS0MsTUFBVixFQUFrQixPQUFLQSxNQUFMLEdBQWNBLFVBQVUscUJBQXhCO0FBQ2xCLGlCQUFLTCxRQUFMLENBQWMsRUFBRUssUUFBUSxPQUFLQSxNQUFmLEVBQXVCRCxTQUFTLE9BQUtBLE9BQXJDLEVBQThDb0IsT0FBTyxDQUFyRCxFQUFkO0FBQ0QsU0FSSCxFQVNHL0MsS0FUSCxDQVNTLFVBQUNDLEdBQUQsRUFBUztBQUNkQyxrQkFBUTJFLElBQVIsMERBQW9FOUYsT0FBcEUsYUFBbUZrQixHQUFuRjtBQUNBdUIsY0FBSXNELElBQUo7QUFDQSxpQkFBSzdELFdBQUwsQ0FBaUJoQixHQUFqQjtBQUNELFNBYkg7QUFjRDtBQUNGLEtBakxIOztBQUFBLDRCQTZMRTBELE9BN0xGLG9CQTZMVW5DLEdBN0xWLEVBNkxldUQsS0E3TGYsRUE2THNCO0FBQ2xCO0FBQ0EsVUFBSXZELEdBQUosRUFBUztBQUNQLFlBQUl1RCxLQUFKLEVBQVc7QUFDVDtBQUNBLGVBQUtwRCxPQUFMLEdBQWUxQyxTQUFmO0FBQ0E7QUFDRCxTQUpELE1BSU8sSUFBSSxDQUFDLEtBQUswQyxPQUFWLEVBQW1CO0FBQ3hCLGVBQUtBLE9BQUwsR0FBZSxLQUFLcEMsS0FBTCxDQUFXcUMsTUFBMUI7QUFDRCxTQUZNLE1BRUEsSUFBSSxLQUFLckMsS0FBTCxDQUFXcUMsTUFBZixFQUF1QjtBQUM1QixlQUFLRCxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFha0MsU0FBYixDQUF1QixLQUFLdEUsS0FBTCxDQUFXcUMsTUFBbEMsQ0FBZjtBQUNEO0FBQ0RKLFlBQUlzRCxJQUFKO0FBQ0EsYUFBS2xELE1BQUwsR0FBYzNDLFNBQWQ7QUFDQSxhQUFLc0MsUUFBTCxDQUFjLEVBQUVJLFNBQVMsS0FBS0EsT0FBaEIsRUFBeUJDLFFBQVEsS0FBS0EsTUFBdEMsRUFBZDtBQUNEO0FBQ0YsS0E3TUg7O0FBQUEsNEJBc1FFc0MsaUJBdFFGLDhCQXNRb0IxQyxHQXRRcEIsRUFzUXlCd0QsWUF0UXpCLEVBc1F1QztBQUFBOztBQUNuQztBQUNBO0FBQ0EsVUFBSXJELFVBQVVxRCxZQUFkO0FBQ0EsVUFBSXhELE9BQU93RCxZQUFYLEVBQXlCO0FBQUEsWUFDZkosVUFEZSxHQUNBcEQsR0FEQSxDQUNmb0QsVUFEZTs7QUFFdkIsWUFBSUEsY0FBY0EsV0FBV0ssZUFBWCxLQUErQixDQUFqRCxFQUFvRDtBQUFBLGNBQzFDckQsTUFEMEMsR0FDL0IsS0FBS3JDLEtBRDBCLENBQzFDcUMsTUFEMEM7O0FBRWxELGNBQUksQ0FBQyxLQUFLQSxNQUFWLEVBQWtCLEtBQUtBLE1BQUwsR0FBY0EsVUFBVSxxQkFBeEI7QUFDbEIsY0FBSSxLQUFLQSxNQUFMLENBQVltQyxNQUFaLENBQW1CLEtBQUtqRCxLQUF4QixFQUErQixDQUEvQixDQUFKLEVBQXVDO0FBQ3JDYSxzQkFBVUEsUUFBUXVELFVBQVIsQ0FBbUIsaUJBQXlCO0FBQUEsa0JBQXZCdEcsSUFBdUI7QUFBQSxrQkFBakJ1RyxXQUFpQjs7QUFDcEQsa0JBQU1DLFdBQVcsT0FBS3hELE1BQUwsQ0FBWUcsS0FBWixDQUFrQixDQUFDbkQsSUFBRCxDQUFsQixDQUFqQjtBQUNBLGtCQUFNeUcsV0FBV0QsV0FDYkQsWUFBWWpELFNBQVosQ0FBc0I7QUFBQSx1QkFBV2tELFNBQVNwRCxHQUFULENBQWFOLE9BQWIsQ0FBWDtBQUFBLGVBQXRCLENBRGEsR0FFYnlELFdBRko7QUFHQSxxQkFBTyxDQUFDdkcsSUFBRCxFQUFPeUcsUUFBUCxDQUFQO0FBQ0QsYUFOUyxDQUFWO0FBT0Q7QUFDRDFELGtCQUFRdUQsVUFBUixDQUFtQjtBQUFBLGdCQUFFdEcsSUFBRjtBQUFBLGdCQUFReUcsUUFBUjtBQUFBLG1CQUNqQkEsU0FBU0MsR0FBVCxDQUFhO0FBQUEscUJBQVc5RCxJQUFJK0QsRUFBSixDQUFPM0csSUFBUCxFQUFhOEMsT0FBYixDQUFYO0FBQUEsYUFBYixDQURpQjtBQUFBLFdBQW5CO0FBRUEsZUFBS0UsTUFBTCxHQUFjLEtBQUtBLE1BQUwsQ0FBWWlDLFNBQVosQ0FBc0JsQyxPQUF0QixDQUFkO0FBQ0EsZUFBS0osUUFBTCxDQUFjLEVBQUVJLFNBQVMxQyxTQUFYLEVBQXNCMkMsUUFBUSxLQUFLQSxNQUFuQyxFQUFkO0FBQ0EsaUJBQU8zQyxTQUFQO0FBQ0Q7QUFDRjtBQUNELGFBQU8wQyxPQUFQO0FBQ0QsS0FoU0g7O0FBQUEsNEJBa1NFcUMsbUJBbFNGLGdDQWtTc0J4QyxHQWxTdEIsRUFrUzJCSyxRQWxTM0IsRUFrU3FDO0FBQ2pDO0FBQ0E7QUFDQSxVQUFJTCxPQUFPSyxRQUFYLEVBQXFCO0FBQ25CQSxpQkFBU3FELFVBQVQsQ0FBb0I7QUFBQSxjQUFFdEcsSUFBRjtBQUFBLGNBQVF5RyxRQUFSO0FBQUEsaUJBQ2xCQSxTQUFTQyxHQUFULENBQWE7QUFBQSxtQkFBVzlELElBQUlnRSxHQUFKLENBQVE1RyxJQUFSLEVBQWM4QyxPQUFkLENBQVg7QUFBQSxXQUFiLENBRGtCO0FBQUEsU0FBcEI7QUFEbUIsWUFHWEUsTUFIVyxHQUdBLEtBQUtyQyxLQUhMLENBR1hxQyxNQUhXOztBQUluQixZQUFJLENBQUMsS0FBS0EsTUFBVixFQUFrQixLQUFLQSxNQUFMLEdBQWNBLFVBQVUscUJBQXhCO0FBQ2xCLGFBQUtBLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlzRCxVQUFaLENBQXVCLGlCQUF5QjtBQUFBLGNBQXZCdEcsSUFBdUI7QUFBQSxjQUFqQnVHLFdBQWlCOztBQUM1RCxjQUFNTSxZQUFZNUQsU0FBU0UsS0FBVCxDQUFlLENBQUNuRCxJQUFELENBQWYsQ0FBbEI7QUFDQSxjQUFNeUcsV0FBV0ksWUFDYk4sWUFBWWpELFNBQVosQ0FBc0I7QUFBQSxtQkFBV3VELFVBQVV6RCxHQUFWLENBQWNOLE9BQWQsQ0FBWDtBQUFBLFdBQXRCLENBRGEsR0FFYnlELFdBRko7QUFHQSxpQkFBTyxDQUFDdkcsSUFBRCxFQUFPeUcsUUFBUCxDQUFQO0FBQ0QsU0FOYSxDQUFkO0FBT0EsYUFBSzlELFFBQUwsQ0FBYyxFQUFFSyxRQUFRLEtBQUtBLE1BQWYsRUFBdUJDLFVBQVU1QyxTQUFqQyxFQUFkO0FBQ0EsZUFBT0EsU0FBUDtBQUNEO0FBQ0QsYUFBTzRDLFFBQVA7QUFDRCxLQXJUSDs7QUFBQSw0QkErVEU2RCxNQS9URixxQkErVFc7QUFBQTs7QUFBQSxvQkFDa0QsS0FBSzdFLEtBRHZEO0FBQUEsVUFDQ2dDLE9BREQsV0FDQ0EsT0FERDtBQUFBLFVBQ1V3QixjQURWLFdBQ1VBLGNBRFY7QUFBQSxVQUM2QnNCLGdCQUQ3Qjs7QUFFUCxVQUFNQyxtQ0FBYTdHLE9BQWIsSUFBdUIsS0FBS21FLFFBQTVCLFdBQU47QUFDQSxhQUNFLDhCQUFDLGdCQUFELGVBQ015QyxnQkFETixFQUVNQyxPQUZOLEVBREY7QUFNRCxLQXhVSDs7QUFBQTtBQUFBLElBNEM0QixnQkFBTUMsYUE1Q2xDLFVBNkNTaEgsZ0JBN0NULEdBNkM0QkEsZ0JBN0M1Qjs7O0FBMlVBK0IsZ0JBQWNqQyxXQUFkLHNCQUE2Q0YsZUFBZUksZ0JBQWYsQ0FBN0M7O0FBU0EsTUFBTWlILHFCQUFxQixTQUFyQkEsa0JBQXFCO0FBQUEsV0FBYTtBQUN0Q3pCLHNCQUFnQiwrQkFBbUIsRUFBRTVELHNDQUFGLEVBQW5CLEVBQTJDQyxRQUEzQztBQURzQixLQUFiO0FBQUEsR0FBM0I7O0FBSUEsTUFBTXFGLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQ3hHLEtBQUQsRUFBVztBQUNqQyxRQUFNc0QsVUFBVXZELGtCQUFrQkMsS0FBbEIsRUFBeUJQLFdBQXpCLENBQWhCO0FBQ0EsV0FBTyxFQUFFNkQsZ0JBQUYsRUFBUDtBQUNELEdBSEQ7O0FBS0EsU0FBTyx5QkFBUWtELGVBQVIsRUFBeUJELGtCQUF6QixFQUE2Q2xGLGFBQTdDLENBQVA7QUFDRCIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgTWFwLCBTZXQgfSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHsgSHViQ29ubmVjdGlvbiwgVHJhbnNwb3J0VHlwZSB9IGZyb20gJ0Bhc3BuZXQvc2lnbmFsci1jbGllbnQnO1xuXG5mdW5jdGlvbiBnZXREaXNwbGF5TmFtZShDb21wb25lbnQpIHtcbiAgcmV0dXJuIENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQubmFtZSB8fCAnQ29tcG9uZW50Jztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5qZWN0U2lnbmFsUihcbiAgV3JhcHBlZENvbXBvbmVudCxcbiAgb3B0aW9ucyA9IHtcbiAgICBodWJOYW1lOiAnJyxcbiAgICBiYXNlQWRkcmVzczogdW5kZWZpbmVkLFxuICAgIGFjY2Vzc1Rva2VuOiB1bmRlZmluZWQsXG4gICAgc2lnbmFsclBhdGg6ICdzaWduYWxyJyxcbiAgICBjb250cm9sbGVyOiAnJyxcbiAgICByZXRyaWVzOiAzLFxuICB9LFxuKSB7XG4gIGNvbnN0IHtcbiAgICBodWJOYW1lID0gJycsXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcbiAgICBhY2Nlc3NUb2tlbiA9IG51bGwsXG4gICAgc2lnbmFsclBhdGggPSAnc2lnbmFscicsXG4gICAgcmV0cmllcyA9IDMsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB7IGNvbnRyb2xsZXIgPSBodWJOYW1lIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IGdldFZhbHVlRnJvbVN0YXRlID0gKHN0YXRlLCBzb3VyY2UpID0+IHtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHNvdXJjZShzdGF0ZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIGNvbnN0IGludm9rZUNvbnRyb2xsZXIgPSAoYWRkcmVzcywgdGFyZ2V0LCBkYXRhID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgY29uc3QgdXJsQmFzZSA9IGAke2FkZHJlc3N9LyR7Y29udHJvbGxlcn0vJHt0YXJnZXR9YDtcbiAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xuICAgIHJldHVybiBheGlvcy5nZXQodXJsKVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgfSk7XG4gIH07XG5cbiAgY29uc3Qgc2VuZFRvQ29udHJvbGxlciA9IChhZGRyZXNzLCB0YXJnZXRNZXRob2QsIGRhdGEpID0+IHtcbiAgICBjb25zdCB1cmwgPSBgJHthZGRyZXNzfS8ke2NvbnRyb2xsZXJ9LyR7dGFyZ2V0TWV0aG9kfWA7XG4gICAgY29uc3QgcGF5bG9hZCA9IGRhdGEgPyBkYXRhLnRvSlMoKSA6IG51bGw7XG4gICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBwYXlsb2FkKVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFNlbmRpbmcgZGF0YSB0byAke2NvbnRyb2xsZXJ9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFjY2Vzc1Rva2VuRmFjdG9yeSgpIHtcbiAgICByZXR1cm4gKGRpc3BhdGNoLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgY29uc3Qgc3RhdGUgPSBnZXRTdGF0ZSgpO1xuICAgICAgcmV0dXJuIGdldFZhbHVlRnJvbVN0YXRlKHN0YXRlLCBhY2Nlc3NUb2tlbik7XG4gICAgfTtcbiAgfVxuXG4gIGNsYXNzIEluamVjdFNpZ25hbFIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgV3JhcHBlZENvbXBvbmVudCA9IFdyYXBwZWRDb21wb25lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgaHViOiBudWxsLFxuICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxuICAgICAgICBtb3JpYnVuZDogdW5kZWZpbmVkLFxuICAgICAgICByZXRyeTogMCxcbiAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9LmNvbXBvbmVudFdpbGxNb3VudGApO1xuICAgICAgdGhpcy5odWJQcm94eSA9IHtcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZSxcbiAgICAgICAgc2VuZDogdGhpcy5zZW5kLFxuICAgICAgICBjb25uZWN0aW9uSWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVnaXN0ZXI6IHRoaXMucmVnaXN0ZXJMaXN0ZW5lcixcbiAgICAgICAgdW5yZWdpc3RlcjogdGhpcy51bnJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5jb21wb25lbnREaWRNb3VudGApO1xuICAgICAgdGhpcy5jcmVhdGVIdWIoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5odWIgIT09IG5leHRTdGF0ZS5odWIpIHtcbiAgICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5jb21wb25lbnRXaWxsVXBkYXRlID0+IGh1YmApO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5odWIpIHRoaXMuc3RvcEh1Yih0aGlzLnN0YXRlLmh1YiwgZmFsc2UpO1xuICAgICAgICBpZiAobmV4dFN0YXRlLmh1YikgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcbiAgICAgICAgZWxzZSB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgIH0gZWxzZSBpZiAoIW5leHRTdGF0ZS5odWIpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgeyBwZW5kaW5nLCBtb3JpYnVuZCB9ID0gbmV4dFN0YXRlO1xuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XG4gICAgICAgICAgbW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb3JpYnVuZENvdW50ID0gbW9yaWJ1bmQucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xuICAgICAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX1cbiAgICAgICAgICAvLyAgIC5jb21wb25lbnRXaWxsVXBkYXRlID0+IG1vcmlidW5kIFske21vcmlidW5kQ291bnR9XWApO1xuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLmluYWN0aXZhdGVMaXN0ZW5lcnModGhpcy5zdGF0ZS5odWIsIG1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcbiAgICAgICAgICBwZW5kaW5nID0gdGhpcy5wZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IHBlbmRpbmcucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XG4gICAgICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfVxuICAgICAgICAgIC8vICAgLmNvbXBvbmVudFdpbGxVcGRhdGUgPT4gcGVuZGluZyBbJHtwZW5kaW5nQ291bnR9XWApO1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMuYWN0aXZhdGVMaXN0ZW5lcnMobmV4dFN0YXRlLmh1YiwgcGVuZGluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX0uY29tcG9uZW50V2lsbFVubW91bnRgKTtcbiAgICAgIHRoaXMuc3RvcEh1Yih0aGlzLnN0YXRlLmh1YiwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgY291bnQgPSAoYywgcykgPT4gYyArIHMuY291bnQoKTtcblxuICAgIGFzeW5jIGNyZWF0ZUh1YihjdXJDcmVhdGUpIHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX0uY3JlYXRlSHViYCk7XG4gICAgICBjb25zdCB7IHJldHJ5LCBjcmVhdGUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICBpZiAocmV0cnkgPiByZXRyaWVzKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSYW4gb3V0IG9mIHJldHJpZXMgZm9yIHN0YXJ0aW5nICR7aHViTmFtZX0hYCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZXRyeTogMCwgY3JlYXRlOiAwIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKGJhc2VVcmwgJiYgaHViTmFtZSkge1xuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcbiAgICAgICAgICBpZiAoc2lnbmFsclBhdGgpIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke3NpZ25hbHJQYXRofWA7XG4gICAgICAgICAgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7aHViTmFtZX1gO1xuICAgICAgICAgIC8vIEhlcmUgYmVsb3cgaXMgaG93IHRoaW5ncyBhcmUgZG9uZSB3aXRoIEFTUC5ORVQgQ29yZSAyLjAgdmVyc2lvblxuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoKTtcbiAgICAgICAgICBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCwgY3JlYXRlOiAoY3VyQ3JlYXRlIHx8IGNyZWF0ZSkgKyAxIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9P2FjY2Vzc190b2tlbj0ke3RoaXMudG9rZW59YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHViID0gbmV3IEh1YkNvbm5lY3Rpb24oaHViQWRkcmVzcywgeyB0cmFuc3BvcnQ6IFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyB9KTtcbiAgICAgICAgICAvLyBIZXJlIGJlbG93IGlzIGhvdyB0aGluZ3Mgc2hvdWxkIGJlIGRvbmUgYWZ0ZXIgdXBncmFkaW5nIHRvIEFTUC5ORVQgQ29yZSAyLjEgdmVyc2lvblxuICAgICAgICAgIC8vIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoKTtcbiAgICAgICAgICAvLyBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgIC8vICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAvLyAgICAgdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCwgY3JlYXRlOiAoY3VyQ3JlYXRlIHx8IGNyZWF0ZSkgKyAxIH0pO1xuICAgICAgICAgIC8vICAgICByZXR1cm47XG4gICAgICAgICAgLy8gICB9XG4gICAgICAgICAgLy8gICB0aGlzLm9sZFRva2VuID0gdW5kZWZpbmVkO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgICAvLyBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbihodWJBZGRyZXNzLCB7XG4gICAgICAgICAgLy8gICB0cmFuc3BvcnQ6IFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyxcbiAgICAgICAgICAvLyAgIGFjY2Vzc1Rva2VuRmFjdG9yeTogc2lnbmFsckFjdGlvbnMuYWNjZXNzVG9rZW5GYWN0b3J5LFxuICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgIGh1Yi5vbmNsb3NlID0gdGhpcy5oYW5kbGVFcnJvcjtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaHViLCByZXRyeTogcmV0cnkgKyAxLCBjcmVhdGU6IDAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydEh1YihodWIpIHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX0uc3RhcnRIdWJgKTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgaHViLnN0YXJ0KClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb25JZCB9ID0gaHViLmNvbm5lY3Rpb24gfHwge307XG4gICAgICAgICAgICB0aGlzLmh1YlByb3h5LmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBhY3RpdmU6IHRoaXMuYWN0aXZlLCBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsIHJldHJ5OiAwIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgV2FybmluZzogRXJyb3Igd2hpbGUgZXN0YWJsaXNoaW5nIGNvbm5lY3Rpb24gdG8gaHViICR7aHViTmFtZX0uXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUVycm9yID0gKGVycikgPT4ge1xuICAgICAgY29uc3QgeyByZXNwb25zZSwgc3RhdHVzQ29kZSB9ID0gZXJyO1xuICAgICAgY29uc3QgeyBzdGF0dXMgfSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgc3dpdGNoIChzdGF0dXMgfHwgc3RhdHVzQ29kZSkge1xuICAgICAgICBjYXNlIDUwMDogYnJlYWs7XG4gICAgICAgIGNhc2UgNDAxOiB0aGlzLm9sZFRva2VuID0gdGhpcy50b2tlbjsgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgIGRlZmF1bHQ6IHRoaXMuc2V0U3RhdGUoeyBodWI6IG51bGwgfSk7IGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BIdWIoaHViLCBjbGVhcikge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5zdG9wSHViYCk7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGlmIChjbGVhcikge1xuICAgICAgICAgIC8vIENsZWFyIHBlbmRpbmdcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgLy8gTWVyZ2UgYWN0aXZlIHRvIHBlbmRpbmdcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5zdGF0ZS5hY3RpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcubWVyZ2VEZWVwKHRoaXMuc3RhdGUuYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmc6IHRoaXMucGVuZGluZywgYWN0aXZlOiB0aGlzLmFjdGl2ZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX1cbiAgICAgIC8vICAgLnJlZ2lzdGVyTGlzdGVuZXIoJHtuYW1lfSwgJHtoYW5kbGVyLm5hbWUgfHwgJzxoYW5kbGVyPid9KC4uLikpYCk7XG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBtb3JpYnVuZCBsaXN0ZW5lcnNcbiAgICAgIGlmICghdGhpcy5tb3JpYnVuZCkgdGhpcy5tb3JpYnVuZCA9IG1vcmlidW5kIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nTW9yaWJ1bmQgPSBleGlzdGluZ01vcmlidW5kLmZpbHRlck5vdChoID0+IGggPT09IGhhbmRsZXIpO1xuICAgICAgICB0aGlzLm1vcmlidW5kID0gcmVtYWluaW5nTW9yaWJ1bmQuc2l6ZVxuICAgICAgICAgID8gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ01vcmlidW5kKSA6IHRoaXMubW9yaWJ1bmQuZGVsZXRlKG5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIHBlbmRpbmcgbGlzdGVuZXJzIChpZiBpdCBpcyBOT1QgYWN0aXZlKVxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ0FjdGl2ZSA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKCFleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nUGVuZGluZyA9IHRoaXMucGVuZGluZy5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgICAgaWYgKCFleGlzdGluZ1BlbmRpbmcuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5wZW5kaW5nLnNldEluKFtuYW1lXSwgZXhpc3RpbmdQZW5kaW5nLmFkZChoYW5kbGVyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgIT09IHBlbmRpbmcgfHwgdGhpcy5tb3JpYnVuZCAhPT0gbW9yaWJ1bmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmc6IHRoaXMucGVuZGluZywgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdW5yZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX1cbiAgICAgIC8vICAgLnVucmVnaXN0ZXJMaXN0ZW5lcigke25hbWV9LCAke2hhbmRsZXIubmFtZSB8fCAnPGhhbmRsZXI+J30oLi4uKSlgKTtcbiAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlLCBtb3JpYnVuZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIHBlbmRpbmcgbGlzdGVuZXJzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nUGVuZGluZyA9IHRoaXMucGVuZGluZy5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ1BlbmRpbmcuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ1BlbmRpbmcgPSBleGlzdGluZ1BlbmRpbmcuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XG4gICAgICAgIHRoaXMucGVuZGluZyA9IHJlbWFpbmluZ1BlbmRpbmcuY291bnQoKVxuICAgICAgICAgID8gdGhpcy5wZW5kaW5nLnNldEluKFtuYW1lXSwgcmVtYWluaW5nUGVuZGluZylcbiAgICAgICAgICA6IHRoaXMucGVuZGluZy5kZWxldGUobmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbGlzdGVuZXIgdG8gbW9yaWJ1bmQgbGlzdGVuZXJzIChpZiBpdCBpcyBhY3RpdmUpXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoZXhpc3RpbmdBY3RpdmUuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGlmICghdGhpcy5tb3JpYnVuZCkgdGhpcy5tb3JpYnVuZCA9IG1vcmlidW5kIHx8IE1hcCgpO1xuICAgICAgICBjb25zdCBleGlzdGluZ01vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgICAgaWYgKCFleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgZXhpc3RpbmdNb3JpYnVuZC5hZGQoaGFuZGxlcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsIG1vcmlidW5kOiB0aGlzLm1vcmlidW5kIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFjdGl2YXRlTGlzdGVuZXJzKGh1YiwgcGVuZGluZ1BhcmFtKSB7XG4gICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9XG4gICAgICAvLyAgIC5hY3RpdmF0ZUxpc3RlbmVycyhbJHsocGVuZGluZyA/IHBlbmRpbmcucmVkdWNlKHRoaXMuY291bnQsIDApIDogMCl9XSlgKTtcbiAgICAgIGxldCBwZW5kaW5nID0gcGVuZGluZ1BhcmFtO1xuICAgICAgaWYgKGh1YiAmJiBwZW5kaW5nUGFyYW0pIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAyKSB7XG4gICAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlLnJlZHVjZSh0aGlzLmNvdW50LCAwKSkge1xuICAgICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gZXhpc3RpbmdcbiAgICAgICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IGV4aXN0aW5nLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xuICAgICAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwZW5kaW5nLm1hcEVudHJpZXMoKFtuYW1lLCBoYW5kbGVyc10pID0+XG4gICAgICAgICAgICBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub24obmFtZSwgaGFuZGxlcikpKTtcbiAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuYWN0aXZlLm1lcmdlRGVlcChwZW5kaW5nKTtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZzogdW5kZWZpbmVkLCBhY3RpdmU6IHRoaXMuYWN0aXZlIH0pO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwZW5kaW5nO1xuICAgIH1cblxuICAgIGluYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBtb3JpYnVuZCkge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfVxuICAgICAgLy8gICAuaW5hY3RpdmF0ZUxpc3RlbmVycyhbJHsobW9yaWJ1bmQgPyBtb3JpYnVuZC5yZWR1Y2UodGhpcy5jb3VudCwgMCkgOiAwKX1dKWApO1xuICAgICAgaWYgKGh1YiAmJiBtb3JpYnVuZCkge1xuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PlxuICAgICAgICAgIGhhbmRsZXJzLm1hcChoYW5kbGVyID0+IGh1Yi5vZmYobmFtZSwgaGFuZGxlcikpKTtcbiAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuYWN0aXZlLm1hcEVudHJpZXMoKFtuYW1lLCBjdXJIYW5kbGVyc10pID0+IHtcbiAgICAgICAgICBjb25zdCByZW1vdmFibGUgPSBtb3JpYnVuZC5nZXRJbihbbmFtZV0pO1xuICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gcmVtb3ZhYmxlXG4gICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IHJlbW92YWJsZS5oYXMoaGFuZGxlcikpXG4gICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xuICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZTogdGhpcy5hY3RpdmUsIG1vcmlidW5kOiB1bmRlZmluZWQgfSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW9yaWJ1bmQ7XG4gICAgfVxuXG4gICAgaW52b2tlID0gKHRhcmdldCwgZGF0YSkgPT4ge1xuICAgICAgaW52b2tlQ29udHJvbGxlcih0aGlzLnByb3BzLmJhc2VVcmwsIHRhcmdldCwgZGF0YSk7XG4gICAgfVxuXG4gICAgc2VuZCA9ICh0YXJnZXQsIGRhdGEpID0+IHtcbiAgICAgIHNlbmRUb0NvbnRyb2xsZXIodGhpcy5wcm9wcy5iYXNlVXJsLCB0YXJnZXQsIGRhdGEpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMsIC4uLnBhc3NUaHJvdWdoUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBodWJQcm9wID0geyBbaHViTmFtZV06IHRoaXMuaHViUHJveHkgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxXcmFwcGVkQ29tcG9uZW50XG4gICAgICAgICAgey4uLnBhc3NUaHJvdWdoUHJvcHN9XG4gICAgICAgICAgey4uLmh1YlByb3B9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEluamVjdFNpZ25hbFIuZGlzcGxheU5hbWUgPSBgSW5qZWN0U2lnbmFsUigke2dldERpc3BsYXlOYW1lKFdyYXBwZWRDb21wb25lbnQpfSlgO1xuXG4gIEluamVjdFNpZ25hbFIucHJvcFR5cGVzID0ge1xuICAgIGJhc2VVcmw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBzaWduYWxyQWN0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGdldEFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IGRpc3BhdGNoID0+ICh7XG4gICAgc2lnbmFsckFjdGlvbnM6IGJpbmRBY3Rpb25DcmVhdG9ycyh7IGFjY2Vzc1Rva2VuRmFjdG9yeSB9LCBkaXNwYXRjaCksXG4gIH0pO1xuXG4gIGNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYmFzZUFkZHJlc3MpO1xuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcbiAgfTtcblxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XG59XG4iXX0=