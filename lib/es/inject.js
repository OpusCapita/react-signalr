var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, Set } from 'immutable';
import { HubConnection, TransportType } from '@aspnet/signalr-client';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function injectSignalR(WrappedComponent) {
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
    return axios.get(url).catch(function (err) {
      console.error('Error: Invoking ' + controller + ' failed.\n\n' + err);
    });
  };

  var sendToController = function sendToController(address, targetMethod, data) {
    var url = address + '/' + controller + '/' + targetMethod;
    var payload = data ? data.toJS() : null;
    return axios.post(url, payload).catch(function (err) {
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

        if (!_this.moribund) _this.moribund = moribund || Map();
        var existingMoribund = _this.moribund.getIn([name], Set());
        if (existingMoribund.has(handler)) {
          var remainingMoribund = existingMoribund.filterNot(function (h) {
            return h === handler;
          });
          _this.moribund = remainingMoribund.size ? _this.moribund.setIn([name], remainingMoribund) : _this.moribund.delete(name);
        }
        // Add listener to pending listeners (if it is NOT active)
        if (!_this.active) _this.active = active || Map();
        var existingActive = _this.active.getIn([name], Set());
        if (!existingActive.has(handler)) {
          if (!_this.pending) _this.pending = pending || Map();
          var existingPending = _this.pending.getIn([name], Set());
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

        if (!_this.pending) _this.pending = pending || Map();
        var existingPending = _this.pending.getIn([name], Set());
        if (existingPending.has(handler)) {
          var remainingPending = existingPending.filterNot(function (h) {
            return h === handler;
          });
          _this.pending = remainingPending.count() ? _this.pending.setIn([name], remainingPending) : _this.pending.delete(name);
        }
        // Add listener to moribund listeners (if it is active)
        if (!_this.active) _this.active = active || Map();
        var existingActive = _this.active.getIn([name], Set());
        if (existingActive.has(handler)) {
          if (!_this.moribund) _this.moribund = moribund || Map();
          var existingMoribund = _this.moribund.getIn([name], Set());
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
          moribund = this.moribund || Map();
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
          pending = this.pending || Map();
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
                hub = new HubConnection(hubAddress, { transport: TransportType.WebSockets });
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

          if (!_this2.pending) _this2.pending = pending || Map();
          if (!_this2.active) _this2.active = active || Map();
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

          if (!this.active) this.active = active || Map();
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

        if (!this.active) this.active = active || Map();
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
      return React.createElement(WrappedComponent, _extends({}, passThroughProps, hubProp));
    };

    return InjectSignalR;
  }(React.PureComponent), _class.WrappedComponent = WrappedComponent, _temp);


  InjectSignalR.displayName = 'InjectSignalR(' + getDisplayName(WrappedComponent) + ')';

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      signalrActions: bindActionCreators({ accessTokenFactory: accessTokenFactory }, dispatch)
    };
  };

  var mapStateToProps = function mapStateToProps(state) {
    var baseUrl = getValueFromState(state, baseAddress);
    return { baseUrl: baseUrl };
  };

  return connect(mapStateToProps, mapDispatchToProps)(InjectSignalR);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbIlJlYWN0IiwiUHJvcFR5cGVzIiwiYXhpb3MiLCJiaW5kQWN0aW9uQ3JlYXRvcnMiLCJjb25uZWN0IiwiTWFwIiwiU2V0IiwiSHViQ29ubmVjdGlvbiIsIlRyYW5zcG9ydFR5cGUiLCJnZXREaXNwbGF5TmFtZSIsIkNvbXBvbmVudCIsImRpc3BsYXlOYW1lIiwibmFtZSIsImluamVjdFNpZ25hbFIiLCJXcmFwcGVkQ29tcG9uZW50Iiwib3B0aW9ucyIsImh1Yk5hbWUiLCJiYXNlQWRkcmVzcyIsInVuZGVmaW5lZCIsImFjY2Vzc1Rva2VuIiwic2lnbmFsclBhdGgiLCJjb250cm9sbGVyIiwicmV0cmllcyIsImdldFZhbHVlRnJvbVN0YXRlIiwic3RhdGUiLCJzb3VyY2UiLCJpbnZva2VDb250cm9sbGVyIiwiYWRkcmVzcyIsInRhcmdldCIsImRhdGEiLCJ1cmxCYXNlIiwidXJsIiwiZ2V0IiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJzZW5kVG9Db250cm9sbGVyIiwidGFyZ2V0TWV0aG9kIiwicGF5bG9hZCIsInRvSlMiLCJwb3N0IiwiYWNjZXNzVG9rZW5GYWN0b3J5IiwiZGlzcGF0Y2giLCJnZXRTdGF0ZSIsIkluamVjdFNpZ25hbFIiLCJwcm9wcyIsImNvdW50IiwiYyIsInMiLCJoYW5kbGVFcnJvciIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsInN0YXR1cyIsIm9sZFRva2VuIiwidG9rZW4iLCJzZXRTdGF0ZSIsImh1YiIsInJlZ2lzdGVyTGlzdGVuZXIiLCJoYW5kbGVyIiwicGVuZGluZyIsImFjdGl2ZSIsIm1vcmlidW5kIiwiZXhpc3RpbmdNb3JpYnVuZCIsImdldEluIiwiaGFzIiwicmVtYWluaW5nTW9yaWJ1bmQiLCJmaWx0ZXJOb3QiLCJoIiwic2l6ZSIsInNldEluIiwiZGVsZXRlIiwiZXhpc3RpbmdBY3RpdmUiLCJleGlzdGluZ1BlbmRpbmciLCJhZGQiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJyZW1haW5pbmdQZW5kaW5nIiwiaW52b2tlIiwiYmFzZVVybCIsInNlbmQiLCJyZXRyeSIsImNyZWF0ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsImh1YlByb3h5IiwiY29ubmVjdGlvbklkIiwicmVnaXN0ZXIiLCJ1bnJlZ2lzdGVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJjcmVhdGVIdWIiLCJjb21wb25lbnRXaWxsVXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwic3RvcEh1YiIsInN0YXJ0SHViIiwibWVyZ2VEZWVwIiwibW9yaWJ1bmRDb3VudCIsInJlZHVjZSIsImluYWN0aXZhdGVMaXN0ZW5lcnMiLCJwZW5kaW5nQ291bnQiLCJhY3RpdmF0ZUxpc3RlbmVycyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY3VyQ3JlYXRlIiwic2lnbmFsckFjdGlvbnMiLCJodWJBZGRyZXNzIiwidHJhbnNwb3J0IiwiV2ViU29ja2V0cyIsIm9uY2xvc2UiLCJzdGFydCIsInRoZW4iLCJjb25uZWN0aW9uIiwid2FybiIsInN0b3AiLCJjbGVhciIsInBlbmRpbmdQYXJhbSIsImNvbm5lY3Rpb25TdGF0ZSIsIm1hcEVudHJpZXMiLCJjdXJIYW5kbGVycyIsImV4aXN0aW5nIiwiaGFuZGxlcnMiLCJtYXAiLCJvbiIsIm9mZiIsInJlbW92YWJsZSIsInJlbmRlciIsInBhc3NUaHJvdWdoUHJvcHMiLCJodWJQcm9wIiwiUHVyZUNvbXBvbmVudCIsIm1hcERpc3BhdGNoVG9Qcm9wcyIsIm1hcFN0YXRlVG9Qcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsT0FBT0EsS0FBUCxNQUFrQixPQUFsQjtBQUNBLE9BQU9DLFNBQVAsTUFBc0IsWUFBdEI7QUFDQSxPQUFPQyxLQUFQLE1BQWtCLE9BQWxCO0FBQ0EsU0FBU0Msa0JBQVQsUUFBbUMsT0FBbkM7QUFDQSxTQUFTQyxPQUFULFFBQXdCLGFBQXhCO0FBQ0EsU0FBU0MsR0FBVCxFQUFjQyxHQUFkLFFBQXlCLFdBQXpC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QkFBa0IsU0FBbEJBLGVBQWtCLENBQUN4RyxLQUFELEVBQVc7QUFDakMsUUFBTXNELFVBQVV2RCxrQkFBa0JDLEtBQWxCLEVBQXlCUCxXQUF6QixDQUFoQjtBQUNBLFdBQU8sRUFBRTZELGdCQUFGLEVBQVA7QUFDRCxHQUhEOztBQUtBLFNBQU8xRSxRQUFRNEgsZUFBUixFQUF5QkQsa0JBQXpCLEVBQTZDbEYsYUFBN0MsQ0FBUDtBQUNEIiwiZmlsZSI6ImluamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBNYXAsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgeyBIdWJDb25uZWN0aW9uLCBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyLWNsaWVudCc7XG5cbmZ1bmN0aW9uIGdldERpc3BsYXlOYW1lKENvbXBvbmVudCkge1xuICByZXR1cm4gQ29tcG9uZW50LmRpc3BsYXlOYW1lIHx8IENvbXBvbmVudC5uYW1lIHx8ICdDb21wb25lbnQnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbmplY3RTaWduYWxSKFxuICBXcmFwcGVkQ29tcG9uZW50LFxuICBvcHRpb25zID0ge1xuICAgIGh1Yk5hbWU6ICcnLFxuICAgIGJhc2VBZGRyZXNzOiB1bmRlZmluZWQsXG4gICAgYWNjZXNzVG9rZW46IHVuZGVmaW5lZCxcbiAgICBzaWduYWxyUGF0aDogJ3NpZ25hbHInLFxuICAgIGNvbnRyb2xsZXI6ICcnLFxuICAgIHJldHJpZXM6IDMsXG4gIH0sXG4pIHtcbiAgY29uc3Qge1xuICAgIGh1Yk5hbWUgPSAnJyxcbiAgICBiYXNlQWRkcmVzcyA9ICdodHRwOi8vbG9jYWxob3N0OjU1NTUnLFxuICAgIGFjY2Vzc1Rva2VuID0gbnVsbCxcbiAgICBzaWduYWxyUGF0aCA9ICdzaWduYWxyJyxcbiAgICByZXRyaWVzID0gMyxcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHsgY29udHJvbGxlciA9IGh1Yk5hbWUgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgZ2V0VmFsdWVGcm9tU3RhdGUgPSAoc3RhdGUsIHNvdXJjZSkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gc291cmNlKHN0YXRlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgY29uc3QgaW52b2tlQ29udHJvbGxlciA9IChhZGRyZXNzLCB0YXJnZXQsIGRhdGEgPSB1bmRlZmluZWQpID0+IHtcbiAgICBjb25zdCB1cmxCYXNlID0gYCR7YWRkcmVzc30vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xuICAgIGNvbnN0IHVybCA9IGRhdGEgPyBgJHt1cmxCYXNlfS8ke2RhdGF9YCA6IHVybEJhc2U7XG4gICAgcmV0dXJuIGF4aW9zLmdldCh1cmwpXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogSW52b2tpbmcgJHtjb250cm9sbGVyfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICB9KTtcbiAgfTtcblxuICBjb25zdCBzZW5kVG9Db250cm9sbGVyID0gKGFkZHJlc3MsIHRhcmdldE1ldGhvZCwgZGF0YSkgPT4ge1xuICAgIGNvbnN0IHVybCA9IGAke2FkZHJlc3N9LyR7Y29udHJvbGxlcn0vJHt0YXJnZXRNZXRob2R9YDtcbiAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcbiAgICByZXR1cm4gYXhpb3MucG9zdCh1cmwsIHBheWxvYWQpXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gYWNjZXNzVG9rZW5GYWN0b3J5KCkge1xuICAgIHJldHVybiAoZGlzcGF0Y2gsIGdldFN0YXRlKSA9PiB7XG4gICAgICBjb25zdCBzdGF0ZSA9IGdldFN0YXRlKCk7XG4gICAgICByZXR1cm4gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGFjY2Vzc1Rva2VuKTtcbiAgICB9O1xuICB9XG5cbiAgY2xhc3MgSW5qZWN0U2lnbmFsUiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBXcmFwcGVkQ29tcG9uZW50ID0gV3JhcHBlZENvbXBvbmVudDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICBzdXBlcihwcm9wcyk7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBodWI6IG51bGwsXG4gICAgICAgIHBlbmRpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgYWN0aXZlOiB1bmRlZmluZWQsXG4gICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXG4gICAgICAgIHJldHJ5OiAwLFxuICAgICAgICBjcmVhdGU6IDAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX0uY29tcG9uZW50V2lsbE1vdW50YCk7XG4gICAgICB0aGlzLmh1YlByb3h5ID0ge1xuICAgICAgICBpbnZva2U6IHRoaXMuaW52b2tlLFxuICAgICAgICBzZW5kOiB0aGlzLnNlbmQsXG4gICAgICAgIGNvbm5lY3Rpb25JZDogdW5kZWZpbmVkLFxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgICB1bnJlZ2lzdGVyOiB0aGlzLnVucmVnaXN0ZXJMaXN0ZW5lcixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9LmNvbXBvbmVudERpZE1vdW50YCk7XG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmh1YiAhPT0gbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9LmNvbXBvbmVudFdpbGxVcGRhdGUgPT4gaHViYCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmh1YikgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCBmYWxzZSk7XG4gICAgICAgIGlmIChuZXh0U3RhdGUuaHViKSB0aGlzLnN0YXJ0SHViKG5leHRTdGF0ZS5odWIpO1xuICAgICAgICBlbHNlIHRoaXMuY3JlYXRlSHViKG5leHRTdGF0ZS5jcmVhdGUpO1xuICAgICAgfSBlbHNlIGlmICghbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB7IHBlbmRpbmcsIG1vcmlidW5kIH0gPSBuZXh0U3RhdGU7XG4gICAgICAgIGlmICghbW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3JpYnVuZCkge1xuICAgICAgICAgIG1vcmlidW5kID0gbW9yaWJ1bmQubWVyZ2VEZWVwKHRoaXMubW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vcmlidW5kQ291bnQgPSBtb3JpYnVuZC5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChtb3JpYnVuZENvdW50KSB7XG4gICAgICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfVxuICAgICAgICAgIC8vICAgLmNvbXBvbmVudFdpbGxVcGRhdGUgPT4gbW9yaWJ1bmQgWyR7bW9yaWJ1bmRDb3VudH1dYCk7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWVyZ2VEZWVwKHRoaXMucGVuZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gcGVuZGluZy5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9XG4gICAgICAgICAgLy8gICAuY29tcG9uZW50V2lsbFVwZGF0ZSA9PiBwZW5kaW5nIFske3BlbmRpbmdDb3VudH1dYCk7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5hY3RpdmF0ZUxpc3RlbmVycyhuZXh0U3RhdGUuaHViLCBwZW5kaW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5jb21wb25lbnRXaWxsVW5tb3VudGApO1xuICAgICAgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjb3VudCA9IChjLCBzKSA9PiBjICsgcy5jb3VudCgpO1xuXG4gICAgYXN5bmMgY3JlYXRlSHViKGN1ckNyZWF0ZSkge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5jcmVhdGVIdWJgKTtcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChyZXRyeSA+IHJldHJpZXMpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFJhbiBvdXQgb2YgcmV0cmllcyBmb3Igc3RhcnRpbmcgJHtodWJOYW1lfSFgKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJldHJ5OiAwLCBjcmVhdGU6IDAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoYmFzZVVybCAmJiBodWJOYW1lKSB7XG4gICAgICAgICAgbGV0IGh1YkFkZHJlc3MgPSBiYXNlVXJsO1xuICAgICAgICAgIGlmIChzaWduYWxyUGF0aCkgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7c2lnbmFsclBhdGh9YDtcbiAgICAgICAgICBodWJBZGRyZXNzID0gYCR7aHViQWRkcmVzc30vJHtodWJOYW1lfWA7XG4gICAgICAgICAgLy8gSGVyZSBiZWxvdyBpcyBob3cgdGhpbmdzIGFyZSBkb25lIHdpdGggQVNQLk5FVCBDb3JlIDIuMCB2ZXJzaW9uXG4gICAgICAgICAgdGhpcy50b2tlbiA9IHNpZ25hbHJBY3Rpb25zLmFjY2Vzc1Rva2VuRmFjdG9yeSgpO1xuICAgICAgICAgIGlmICh0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vbGRUb2tlbiA9PT0gdGhpcy50b2tlbikge1xuICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaHViOiBudWxsLCBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBodWJBZGRyZXNzID0gYCR7aHViQWRkcmVzc30/YWNjZXNzX3Rva2VuPSR7dGhpcy50b2tlbn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbihodWJBZGRyZXNzLCB7IHRyYW5zcG9ydDogVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzIH0pO1xuICAgICAgICAgIC8vIEhlcmUgYmVsb3cgaXMgaG93IHRoaW5ncyBzaG91bGQgYmUgZG9uZSBhZnRlciB1cGdyYWRpbmcgdG8gQVNQLk5FVCBDb3JlIDIuMSB2ZXJzaW9uXG4gICAgICAgICAgLy8gdGhpcy50b2tlbiA9IHNpZ25hbHJBY3Rpb25zLmFjY2Vzc1Rva2VuRmFjdG9yeSgpO1xuICAgICAgICAgIC8vIGlmICh0aGlzLnRva2VuKSB7XG4gICAgICAgICAgLy8gICBpZiAodGhpcy5vbGRUb2tlbiA9PT0gdGhpcy50b2tlbikge1xuICAgICAgICAgIC8vICAgICB0aGlzLnNldFN0YXRlKHsgaHViOiBudWxsLCBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEgfSk7XG4gICAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgLy8gfVxuICAgICAgICAgIC8vIGNvbnN0IGh1YiA9IG5ldyBIdWJDb25uZWN0aW9uKGh1YkFkZHJlc3MsIHtcbiAgICAgICAgICAvLyAgIHRyYW5zcG9ydDogVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzLFxuICAgICAgICAgIC8vICAgYWNjZXNzVG9rZW5GYWN0b3J5OiBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnksXG4gICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBodWIsIHJldHJ5OiByZXRyeSArIDEsIGNyZWF0ZTogMCB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0SHViKGh1Yikge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfS5zdGFydEh1YmApO1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBodWIuc3RhcnQoKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbklkIH0gPSBodWIuY29ubmVjdGlvbiB8fCB7fTtcbiAgICAgICAgICAgIHRoaXMuaHViUHJveHkuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xuICAgICAgICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZTogdGhpcy5hY3RpdmUsIHBlbmRpbmc6IHRoaXMucGVuZGluZywgcmV0cnk6IDAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIGh1Yi5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlLCBzdGF0dXNDb2RlIH0gPSBlcnI7XG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XG4gICAgICBzd2l0Y2ggKHN0YXR1cyB8fCBzdGF0dXNDb2RlKSB7XG4gICAgICAgIGNhc2UgNTAwOiBicmVhaztcbiAgICAgICAgY2FzZSA0MDE6IHRoaXMub2xkVG9rZW4gPSB0aGlzLnRva2VuOyAvLyBmYWxsIHRocm91Z2hcbiAgICAgICAgZGVmYXVsdDogdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCB9KTsgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XG4gICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9LnN0b3BIdWJgKTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgaWYgKGNsZWFyKSB7XG4gICAgICAgICAgLy8gQ2xlYXIgcGVuZGluZ1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAvLyBNZXJnZSBhY3RpdmUgdG8gcGVuZGluZ1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnN0YXRlLmFjdGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5tZXJnZURlZXAodGhpcy5zdGF0ZS5hY3RpdmUpO1xuICAgICAgICB9XG4gICAgICAgIGh1Yi5zdG9wKCk7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZzogdGhpcy5wZW5kaW5nLCBhY3RpdmU6IHRoaXMuYWN0aXZlIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfVxuICAgICAgLy8gICAucmVnaXN0ZXJMaXN0ZW5lcigke25hbWV9LCAke2hhbmRsZXIubmFtZSB8fCAnPGhhbmRsZXI+J30oLi4uKSlgKTtcbiAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlLCBtb3JpYnVuZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIG1vcmlidW5kIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ01vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdNb3JpYnVuZCA9IGV4aXN0aW5nTW9yaWJ1bmQuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XG4gICAgICAgIHRoaXMubW9yaWJ1bmQgPSByZW1haW5pbmdNb3JpYnVuZC5zaXplXG4gICAgICAgICAgPyB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgcmVtYWluaW5nTW9yaWJ1bmQpIDogdGhpcy5tb3JpYnVuZC5kZWxldGUobmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbGlzdGVuZXIgdG8gcGVuZGluZyBsaXN0ZW5lcnMgKGlmIGl0IGlzIE5PVCBhY3RpdmUpXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoIWV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCBleGlzdGluZ1BlbmRpbmcuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZzogdGhpcy5wZW5kaW5nLCBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1bnJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgLy8gY29uc29sZS5kZWJ1ZyhgJHtJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lfVxuICAgICAgLy8gICAudW5yZWdpc3Rlckxpc3RlbmVyKCR7bmFtZX0sICR7aGFuZGxlci5uYW1lIHx8ICc8aGFuZGxlcj4nfSguLi4pKWApO1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nUGVuZGluZyA9IGV4aXN0aW5nUGVuZGluZy5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gcmVtYWluaW5nUGVuZGluZy5jb3VudCgpXG4gICAgICAgICAgPyB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCByZW1haW5pbmdQZW5kaW5nKVxuICAgICAgICAgIDogdGhpcy5wZW5kaW5nLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBtb3JpYnVuZCBsaXN0ZW5lcnMgKGlmIGl0IGlzIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCBleGlzdGluZ01vcmlidW5kLmFkZChoYW5kbGVyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgIT09IHBlbmRpbmcgfHwgdGhpcy5tb3JpYnVuZCAhPT0gbW9yaWJ1bmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmc6IHRoaXMucGVuZGluZywgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBwZW5kaW5nUGFyYW0pIHtcbiAgICAgIC8vIGNvbnNvbGUuZGVidWcoYCR7SW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZX1cbiAgICAgIC8vICAgLmFjdGl2YXRlTGlzdGVuZXJzKFskeyhwZW5kaW5nID8gcGVuZGluZy5yZWR1Y2UodGhpcy5jb3VudCwgMCkgOiAwKX1dKWApO1xuICAgICAgbGV0IHBlbmRpbmcgPSBwZW5kaW5nUGFyYW07XG4gICAgICBpZiAoaHViICYmIHBlbmRpbmdQYXJhbSkge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDIpIHtcbiAgICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmUucmVkdWNlKHRoaXMuY291bnQsIDApKSB7XG4gICAgICAgICAgICBwZW5kaW5nID0gcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBleGlzdGluZ1xuICAgICAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gZXhpc3RpbmcuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT5cbiAgICAgICAgICAgIGhhbmRsZXJzLm1hcChoYW5kbGVyID0+IGh1Yi5vbihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWVyZ2VEZWVwKHBlbmRpbmcpO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nOiB1bmRlZmluZWQsIGFjdGl2ZTogdGhpcy5hY3RpdmUgfSk7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBlbmRpbmc7XG4gICAgfVxuXG4gICAgaW5hY3RpdmF0ZUxpc3RlbmVycyhodWIsIG1vcmlidW5kKSB7XG4gICAgICAvLyBjb25zb2xlLmRlYnVnKGAke0luamVjdFNpZ25hbFIuZGlzcGxheU5hbWV9XG4gICAgICAvLyAgIC5pbmFjdGl2YXRlTGlzdGVuZXJzKFskeyhtb3JpYnVuZCA/IG1vcmlidW5kLnJlZHVjZSh0aGlzLmNvdW50LCAwKSA6IDApfV0pYCk7XG4gICAgICBpZiAoaHViICYmIG1vcmlidW5kKSB7XG4gICAgICAgIG1vcmlidW5kLm1hcEVudHJpZXMoKFtuYW1lLCBoYW5kbGVyc10pID0+XG4gICAgICAgICAgaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9mZihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbW92YWJsZSA9IG1vcmlidW5kLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSByZW1vdmFibGVcbiAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gcmVtb3ZhYmxlLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYWN0aXZlOiB0aGlzLmFjdGl2ZSwgbW9yaWJ1bmQ6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtb3JpYnVuZDtcbiAgICB9XG5cbiAgICBpbnZva2UgPSAodGFyZ2V0LCBkYXRhKSA9PiB7XG4gICAgICBpbnZva2VDb250cm9sbGVyKHRoaXMucHJvcHMuYmFzZVVybCwgdGFyZ2V0LCBkYXRhKTtcbiAgICB9XG5cbiAgICBzZW5kID0gKHRhcmdldCwgZGF0YSkgPT4ge1xuICAgICAgc2VuZFRvQ29udHJvbGxlcih0aGlzLnByb3BzLmJhc2VVcmwsIHRhcmdldCwgZGF0YSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucywgLi4ucGFzc1Rocm91Z2hQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFdyYXBwZWRDb21wb25lbnRcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cbiAgICAgICAgICB7Li4uaHViUHJvcH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgSW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZSA9IGBJbmplY3RTaWduYWxSKCR7Z2V0RGlzcGxheU5hbWUoV3JhcHBlZENvbXBvbmVudCl9KWA7XG5cbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XG4gICAgYmFzZVVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHNpZ25hbHJBY3Rpb25zOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxuICAgIH0pLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gZGlzcGF0Y2ggPT4gKHtcbiAgICBzaWduYWxyQWN0aW9uczogYmluZEFjdGlvbkNyZWF0b3JzKHsgYWNjZXNzVG9rZW5GYWN0b3J5IH0sIGRpc3BhdGNoKSxcbiAgfSk7XG5cbiAgY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XG4gICAgY29uc3QgYmFzZVVybCA9IGdldFZhbHVlRnJvbVN0YXRlKHN0YXRlLCBiYXNlQWRkcmVzcyk7XG4gICAgcmV0dXJuIHsgYmFzZVVybCB9O1xuICB9O1xuXG4gIHJldHVybiBjb25uZWN0KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzKShJbmplY3RTaWduYWxSKTtcbn1cbiJdfQ==