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
import { HubConnectionBuilder, HttpTransportType } from '@aspnet/signalr';

var getDisplayName = function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
};

var injectSignalR = function injectSignalR(options) {
  return function (WrappedComponent) {
    var _class, _temp;

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
    var InjectSignalR = (_temp = _class = function (_React$PureComponent) {
      _inherits(InjectSignalR, _React$PureComponent);

      function InjectSignalR(props) {
        _classCallCheck(this, InjectSignalR);

        var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props));

        _this.count = function (c, s) {
          return c + s.count();
        };

        _this.addToGroup = function (group) {
          var hub = _this.state.hub;

          if (hub) {
            var connection = hub.connection;

            if (connection && connection.connectionState === 1) {
              hub.invoke('addToGroup', group).catch(function (err) {
                console.error('Error: Adding client to group ' + group + ' in ' + hubName + ' failed.\n\n' + err);
              });
            }
          }
        };

        _this.removeFromGroup = function (group) {
          var hub = _this.state.hub;

          if (hub) {
            var connection = hub.connection;

            if (connection && connection.connectionState === 1) {
              hub.invoke('removeFromGroup', group).catch(function (err) {
                console.error('Error: Removing client from group ' + group + ' in ' + hubName + ' failed.\n\n' + err);
              });
            }
          }
        };

        _this.sendToController = function (target) {
          var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          var url = _this.props.baseUrl + '/' + controller + '/' + target;
          var payload = data ? data.toJS() : null;
          return axios.post(url, payload).catch(function (err) {
            console.error('Error: Sending data to ' + controller + ' failed.\n\n' + err);
          });
        };

        _this.invokeController = function (targetMethod) {
          var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          var urlBase = _this.props.baseUrl + '/' + controller + '/' + targetMethod;
          var url = data ? urlBase + '/' + data : urlBase;
          return axios.get(url).catch(function (err) {
            console.error('Error: Invoking ' + controller + ' failed.\n\n' + err);
          });
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
              _this.setState({ hub: null });
              break;
          }
        };

        _this.registerListener = function (name, handler) {
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
            _this.setState({
              pending: _this.pending,
              moribund: _this.moribund
            });
          }
        };

        _this.unregisterListener = function (name, handler) {
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
            _this.setState({
              pending: _this.pending,
              moribund: _this.moribund
            });
          }
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
        this.hubProxy = {
          send: this.sendToController,
          invoke: this.invokeController,
          add: this.addToGroup,
          remove: this.removeFromGroup,
          connectionId: undefined,
          register: this.registerListener,
          unregister: this.unregisterListener
        };
      };

      InjectSignalR.prototype.componentDidMount = function componentDidMount() {
        this.createHub();
      };

      InjectSignalR.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
        if (this.state.hub !== nextState.hub) {
          if (this.state.hub) this.stopHub(this.state.hub, false);
          if (nextState.hub) {
            this.startHub(nextState.hub);
          } else {
            this.createHub(nextState.create);
          }
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
            this.moribund = this.inactivateListeners(this.state.hub, moribund);
          }
          if (!pending) {
            pending = this.pending || Map();
          } else if (this.pending) {
            pending = pending.mergeDeep(this.pending);
          }
          var pendingCount = pending.reduce(this.count, 0);
          if (pendingCount) {
            this.pending = this.activateListeners(nextState.hub, pending);
          }
        }
      };

      InjectSignalR.prototype.componentWillUnmount = function componentWillUnmount() {
        this.stopHub(this.state.hub, true);
      };

      InjectSignalR.prototype.createHub = function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(curCreate) {
          var _this2 = this;

          var _state, retry, create, _props, baseUrl, signalrActions, hubAddress, hub;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _state = this.state, retry = _state.retry, create = _state.create;

                  if (!(retry > retries)) {
                    _context.next = 6;
                    break;
                  }

                  console.error('Error: Ran out of retries for starting ' + hubName + '!');
                  this.setState({
                    retry: 0,
                    create: 0
                  });
                  _context.next = 20;
                  break;

                case 6:
                  _props = this.props, baseUrl = _props.baseUrl, signalrActions = _props.signalrActions;

                  if (!(baseUrl && hubName)) {
                    _context.next = 20;
                    break;
                  }

                  hubAddress = baseUrl;

                  if (signalrPath) hubAddress = hubAddress + '/' + signalrPath;
                  hubAddress = hubAddress + '/' + hubName;
                  this.token = signalrActions.accessTokenFactory(accessToken);

                  if (!this.token) {
                    _context.next = 17;
                    break;
                  }

                  if (!(this.oldToken === this.token)) {
                    _context.next = 16;
                    break;
                  }

                  if ((curCreate || create) > retries) {
                    console.warn('Warning: Unable to get up-to-date access token.');
                  } else {
                    this.setState({
                      hub: null,
                      create: (curCreate || create) + 1
                    });
                  }
                  return _context.abrupt('return');

                case 16:
                  this.oldToken = undefined;

                case 17:
                  hub = new HubConnectionBuilder().withUrl(hubAddress, {
                    transport: HttpTransportType.WebSockets,
                    accessTokenFactory: function accessTokenFactory() {
                      return _this2.token;
                    }
                  }).build();

                  hub.onclose = this.handleError;
                  this.setState({
                    hub: hub,
                    retry: retry + 1,
                    create: 0
                  });

                case 20:
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
        var _this3 = this;

        if (hub) {
          hub.start().then(function () {
            var _state2 = _this3.state,
                pending = _state2.pending,
                active = _state2.active;

            if (!_this3.pending) _this3.pending = pending || Map();
            if (!_this3.active) _this3.active = active || Map();
            _this3.setState({
              active: _this3.active,
              pending: _this3.pending,
              retry: 0
            });
          }).catch(function (err) {
            console.warn('Warning: Error while establishing connection to hub ' + hubName + '.\n\n' + err);
            hub.stop();
            _this3.handleError(err);
          });
        }
      };

      InjectSignalR.prototype.stopHub = function stopHub(hub, clear) {
        if (hub) {
          if (clear) {
            // Clear pending
            this.pending = undefined;
            this.removeFromGroup('');
            // Merge active to pending
          } else if (!this.pending) {
            this.pending = this.state.active;
          } else if (this.state.active) {
            this.pending = this.pending.mergeDeep(this.state.active);
          }

          hub.stop();
          this.active = undefined;
          this.setState({
            pending: this.pending,
            active: this.active
          });
        }
      };

      InjectSignalR.prototype.activateListeners = function activateListeners(hub, pendingParam) {
        var _this4 = this;

        var pending = pendingParam;
        if (hub && pendingParam) {
          var connection = hub.connection;

          if (connection && connection.connectionState === 1) {
            var active = this.state.active;

            if (!this.active) this.active = active || Map();
            if (this.active.reduce(this.count, 0)) {
              pending = pending.mapEntries(function (_ref3) {
                var name = _ref3[0],
                    curHandlers = _ref3[1];

                var existing = _this4.active.getIn([name]);
                var handlers = existing ? curHandlers.filterNot(function (handler) {
                  return existing.has(handler);
                }) : curHandlers;
                return [name, handlers];
              });
            }
            pending.mapEntries(function (_ref4) {
              var name = _ref4[0],
                  handlers = _ref4[1];
              return handlers.map(function (handler) {
                return hub.on(name, handler);
              });
            });
            this.active = this.active.mergeDeep(pending);
            this.setState({
              pending: undefined,
              active: this.active
            });
            return undefined;
          }
        }
        return pending;
      };

      InjectSignalR.prototype.inactivateListeners = function inactivateListeners(hub, moribund) {
        if (hub && moribund) {
          moribund.mapEntries(function (_ref5) {
            var name = _ref5[0],
                handlers = _ref5[1];
            return handlers.map(function (handler) {
              return hub.off(name, handler);
            });
          });
          var active = this.state.active;

          if (!this.active) this.active = active || Map();
          this.active = this.active.mapEntries(function (_ref6) {
            var name = _ref6[0],
                curHandlers = _ref6[1];

            var removable = moribund.getIn([name]);
            var handlers = removable ? curHandlers.filterNot(function (handler) {
              return removable.has(handler);
            }) : curHandlers;
            return [name, handlers];
          });
          this.setState({
            active: this.active,
            moribund: undefined
          });
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

    var getValueFromState = function getValueFromState(state, source) {
      if (typeof source === 'function') return source(state);
      if (typeof source === 'string') return source;
      return '';
    };

    var mapDispatchToProps = function mapDispatchToProps(dispatch) {
      return {
        signalrActions: bindActionCreators({
          accessTokenFactory: function accessTokenFactory() {
            return function (dispatcher, getState) {
              var state = getState();
              return getValueFromState(state, accessToken);
            };
          }
        }, dispatch)
      };
    };

    var mapStateToProps = function mapStateToProps(state) {
      var baseUrl = getValueFromState(state, baseAddress);
      return { baseUrl: baseUrl };
    };

    return connect(mapStateToProps, mapDispatchToProps)(InjectSignalR);
  };
};

export default injectSignalR;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbIlJlYWN0IiwiUHJvcFR5cGVzIiwiYXhpb3MiLCJiaW5kQWN0aW9uQ3JlYXRvcnMiLCJjb25uZWN0IiwiTWFwIiwiU2V0IiwiSHViQ29ubmVjdGlvbkJ1aWxkZXIiLCJIdHRwVHJhbnNwb3J0VHlwZSIsImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwic2VuZFRvQ29udHJvbGxlciIsInRhcmdldCIsImRhdGEiLCJ1cmwiLCJiYXNlVXJsIiwicGF5bG9hZCIsInRvSlMiLCJwb3N0IiwiaW52b2tlQ29udHJvbGxlciIsInRhcmdldE1ldGhvZCIsInVybEJhc2UiLCJnZXQiLCJoYW5kbGVFcnJvciIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsInN0YXR1cyIsIm9sZFRva2VuIiwidG9rZW4iLCJzZXRTdGF0ZSIsInJlZ2lzdGVyTGlzdGVuZXIiLCJoYW5kbGVyIiwicGVuZGluZyIsImFjdGl2ZSIsIm1vcmlidW5kIiwiZXhpc3RpbmdNb3JpYnVuZCIsImdldEluIiwiaGFzIiwicmVtYWluaW5nTW9yaWJ1bmQiLCJmaWx0ZXJOb3QiLCJoIiwic2l6ZSIsInNldEluIiwiZGVsZXRlIiwiZXhpc3RpbmdBY3RpdmUiLCJleGlzdGluZ1BlbmRpbmciLCJhZGQiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJyZW1haW5pbmdQZW5kaW5nIiwidW5kZWZpbmVkIiwicmV0cnkiLCJjcmVhdGUiLCJjb21wb25lbnRXaWxsTW91bnQiLCJodWJQcm94eSIsInNlbmQiLCJyZW1vdmUiLCJjb25uZWN0aW9uSWQiLCJyZWdpc3RlciIsInVucmVnaXN0ZXIiLCJjb21wb25lbnREaWRNb3VudCIsImNyZWF0ZUh1YiIsImNvbXBvbmVudFdpbGxVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJzdG9wSHViIiwic3RhcnRIdWIiLCJtZXJnZURlZXAiLCJtb3JpYnVuZENvdW50IiwicmVkdWNlIiwiaW5hY3RpdmF0ZUxpc3RlbmVycyIsInBlbmRpbmdDb3VudCIsImFjdGl2YXRlTGlzdGVuZXJzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjdXJDcmVhdGUiLCJzaWduYWxyQWN0aW9ucyIsImh1YkFkZHJlc3MiLCJhY2Nlc3NUb2tlbkZhY3RvcnkiLCJ3YXJuIiwid2l0aFVybCIsInRyYW5zcG9ydCIsIldlYlNvY2tldHMiLCJidWlsZCIsIm9uY2xvc2UiLCJzdGFydCIsInRoZW4iLCJzdG9wIiwiY2xlYXIiLCJwZW5kaW5nUGFyYW0iLCJtYXBFbnRyaWVzIiwiY3VySGFuZGxlcnMiLCJleGlzdGluZyIsImhhbmRsZXJzIiwibWFwIiwib24iLCJvZmYiLCJyZW1vdmFibGUiLCJyZW5kZXIiLCJwYXNzVGhyb3VnaFByb3BzIiwiaHViUHJvcCIsIlB1cmVDb21wb25lbnQiLCJnZXRWYWx1ZUZyb21TdGF0ZSIsInNvdXJjZSIsIm1hcERpc3BhdGNoVG9Qcm9wcyIsImRpc3BhdGNoZXIiLCJnZXRTdGF0ZSIsImRpc3BhdGNoIiwibWFwU3RhdGVUb1Byb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxPQUFPQSxLQUFQLE1BQWtCLE9BQWxCO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLE9BQU9DLEtBQVAsTUFBa0IsT0FBbEI7QUFDQSxTQUFTQyxrQkFBVCxRQUFtQyxPQUFuQztBQUNBLFNBQVNDLE9BQVQsUUFBd0IsYUFBeEI7QUFDQSxTQUFTQyxHQUFULEVBQWNDLEdBQWQsUUFBeUIsV0FBekI7QUFDQSxTQUFTQyxvQkFBVCxFQUErQkMsaUJBQS9CLFFBQXdELGlCQUF4RDs7QUFFQSxJQUFNQyxpQkFBaUIsU0FBakJBLGNBQWlCO0FBQUEsU0FBYUMsVUFBVUMsV0FBVixJQUF5QkQsVUFBVUUsSUFBbkMsSUFBMkMsV0FBeEQ7QUFBQSxDQUF2Qjs7QUFFQSxJQUFNQyxnQkFBZ0IsU0FBaEJBLGFBQWdCO0FBQUEsU0FBVyxVQUFDQyxnQkFBRCxFQUFzQjtBQUFBOztBQUFBLDJCQU9qREMsT0FQaUQsQ0FFbkRDLE9BRm1EO0FBQUEsUUFFbkRBLE9BRm1ELG9DQUV6QyxFQUZ5QztBQUFBLCtCQU9qREQsT0FQaUQsQ0FHbkRFLFdBSG1EO0FBQUEsUUFHbkRBLFdBSG1ELHdDQUdyQyx1QkFIcUM7QUFBQSwrQkFPakRGLE9BUGlELENBSW5ERyxXQUptRDtBQUFBLFFBSW5EQSxXQUptRCx3Q0FJckMsSUFKcUM7QUFBQSwrQkFPakRILE9BUGlELENBS25ESSxXQUxtRDtBQUFBLFFBS25EQSxXQUxtRCx3Q0FLckMsU0FMcUM7QUFBQSwyQkFPakRKLE9BUGlELENBTW5ESyxPQU5tRDtBQUFBLFFBTW5EQSxPQU5tRCxvQ0FNekMsQ0FOeUM7QUFBQSw4QkFRcEJMLE9BUm9CLENBUTdDTSxVQVI2QztBQUFBLFFBUTdDQSxVQVI2Qyx1Q0FRaENMLE9BUmdDO0FBQUEsUUFVL0NNLGFBVitDO0FBQUE7O0FBYW5ELDZCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEscURBQ2pCLGdDQUFNQSxLQUFOLENBRGlCOztBQUFBLGNBaUVuQkMsS0FqRW1CLEdBaUVYLFVBQUNDLENBQUQsRUFBSUMsQ0FBSjtBQUFBLGlCQUFVRCxJQUFJQyxFQUFFRixLQUFGLEVBQWQ7QUFBQSxTQWpFVzs7QUFBQSxjQW1FbkJHLFVBbkVtQixHQW1FTixVQUFDQyxLQUFELEVBQVc7QUFBQSxjQUNkQyxHQURjLEdBQ04sTUFBS0MsS0FEQyxDQUNkRCxHQURjOztBQUV0QixjQUFJQSxHQUFKLEVBQVM7QUFBQSxnQkFDQ0UsVUFERCxHQUNnQkYsR0FEaEIsQ0FDQ0UsVUFERDs7QUFFUCxnQkFBSUEsY0FBY0EsV0FBV0MsZUFBWCxLQUErQixDQUFqRCxFQUFvRDtBQUNsREgsa0JBQUlJLE1BQUosQ0FBVyxZQUFYLEVBQXlCTCxLQUF6QixFQUNHTSxLQURILENBQ1MsVUFBQ0MsR0FBRCxFQUFTO0FBQ2RDLHdCQUFRQyxLQUFSLG9DQUErQ1QsS0FBL0MsWUFBMkRaLE9BQTNELG9CQUFpRm1CLEdBQWpGO0FBQ0QsZUFISDtBQUlEO0FBQ0Y7QUFDRixTQTlFa0I7O0FBQUEsY0FnRm5CRyxlQWhGbUIsR0FnRkQsVUFBQ1YsS0FBRCxFQUFXO0FBQUEsY0FDbkJDLEdBRG1CLEdBQ1gsTUFBS0MsS0FETSxDQUNuQkQsR0FEbUI7O0FBRTNCLGNBQUlBLEdBQUosRUFBUztBQUFBLGdCQUNDRSxVQURELEdBQ2dCRixHQURoQixDQUNDRSxVQUREOztBQUVQLGdCQUFJQSxjQUFjQSxXQUFXQyxlQUFYLEtBQStCLENBQWpELEVBQW9EO0FBQ2xESCxrQkFBSUksTUFBSixDQUFXLGlCQUFYLEVBQThCTCxLQUE5QixFQUNHTSxLQURILENBQ1MsVUFBQ0MsR0FBRCxFQUFTO0FBQ2RDLHdCQUFRQyxLQUFSLHdDQUFtRFQsS0FBbkQsWUFBK0RaLE9BQS9ELG9CQUFxRm1CLEdBQXJGO0FBQ0QsZUFISDtBQUlEO0FBQ0Y7QUFDRixTQTNGa0I7O0FBQUEsY0E2Rm5CSSxnQkE3Rm1CLEdBNkZBLFVBQUNDLE1BQUQsRUFBeUI7QUFBQSxjQUFoQkMsSUFBZ0IsdUVBQVQsSUFBUzs7QUFDMUMsY0FBTUMsTUFBUyxNQUFLbkIsS0FBTCxDQUFXb0IsT0FBcEIsU0FBK0J0QixVQUEvQixTQUE2Q21CLE1BQW5EO0FBQ0EsY0FBTUksVUFBVUgsT0FBT0EsS0FBS0ksSUFBTCxFQUFQLEdBQXFCLElBQXJDO0FBQ0EsaUJBQU8zQyxNQUFNNEMsSUFBTixDQUFXSixHQUFYLEVBQWdCRSxPQUFoQixFQUNKVixLQURJLENBQ0UsVUFBQ0MsR0FBRCxFQUFTO0FBQ2RDLG9CQUFRQyxLQUFSLDZCQUF3Q2hCLFVBQXhDLG9CQUFpRWMsR0FBakU7QUFDRCxXQUhJLENBQVA7QUFJRCxTQXBHa0I7O0FBQUEsY0FzR25CWSxnQkF0R21CLEdBc0dBLFVBQUNDLFlBQUQsRUFBK0I7QUFBQSxjQUFoQlAsSUFBZ0IsdUVBQVQsSUFBUzs7QUFDaEQsY0FBTVEsVUFBYSxNQUFLMUIsS0FBTCxDQUFXb0IsT0FBeEIsU0FBbUN0QixVQUFuQyxTQUFpRDJCLFlBQXZEO0FBQ0EsY0FBTU4sTUFBTUQsT0FBVVEsT0FBVixTQUFxQlIsSUFBckIsR0FBOEJRLE9BQTFDO0FBQ0EsaUJBQU8vQyxNQUFNZ0QsR0FBTixDQUFVUixHQUFWLEVBQ0pSLEtBREksQ0FDRSxVQUFDQyxHQUFELEVBQVM7QUFDZEMsb0JBQVFDLEtBQVIsc0JBQWlDaEIsVUFBakMsb0JBQTBEYyxHQUExRDtBQUNELFdBSEksQ0FBUDtBQUlELFNBN0drQjs7QUFBQSxjQWlMbkJnQixXQWpMbUIsR0FpTEwsVUFBQ2hCLEdBQUQsRUFBUztBQUFBLGNBQ2JpQixRQURhLEdBQ1lqQixHQURaLENBQ2JpQixRQURhO0FBQUEsY0FDSEMsVUFERyxHQUNZbEIsR0FEWixDQUNIa0IsVUFERzs7QUFBQSxxQkFFRkQsWUFBWSxFQUZWO0FBQUEsY0FFYkUsTUFGYSxRQUViQSxNQUZhOztBQUdyQixrQkFBUUEsVUFBVUQsVUFBbEI7QUFDRSxpQkFBSyxHQUFMO0FBQ0U7QUFDRixpQkFBSyxHQUFMO0FBQ0Usb0JBQUtFLFFBQUwsR0FBZ0IsTUFBS0MsS0FBckIsQ0FKSixDQUlnQztBQUM5QjtBQUNFLG9CQUFLQyxRQUFMLENBQWMsRUFBRTVCLEtBQUssSUFBUCxFQUFkO0FBQ0E7QUFQSjtBQVNELFNBN0xrQjs7QUFBQSxjQXFObkI2QixnQkFyTm1CLEdBcU5BLFVBQUM5QyxJQUFELEVBQU8rQyxPQUFQLEVBQW1CO0FBQUEsNEJBQ0UsTUFBSzdCLEtBRFA7QUFBQSxjQUM1QjhCLE9BRDRCLGVBQzVCQSxPQUQ0QjtBQUFBLGNBQ25CQyxNQURtQixlQUNuQkEsTUFEbUI7QUFBQSxjQUNYQyxRQURXLGVBQ1hBLFFBRFc7QUFFcEM7O0FBQ0EsY0FBSSxDQUFDLE1BQUtBLFFBQVYsRUFBb0IsTUFBS0EsUUFBTCxHQUFnQkEsWUFBWXpELEtBQTVCO0FBQ3BCLGNBQU0wRCxtQkFBbUIsTUFBS0QsUUFBTCxDQUFjRSxLQUFkLENBQW9CLENBQUNwRCxJQUFELENBQXBCLEVBQTRCTixLQUE1QixDQUF6QjtBQUNBLGNBQUl5RCxpQkFBaUJFLEdBQWpCLENBQXFCTixPQUFyQixDQUFKLEVBQW1DO0FBQ2pDLGdCQUFNTyxvQkFBb0JILGlCQUFpQkksU0FBakIsQ0FBMkI7QUFBQSxxQkFBS0MsTUFBTVQsT0FBWDtBQUFBLGFBQTNCLENBQTFCO0FBQ0Esa0JBQUtHLFFBQUwsR0FBZ0JJLGtCQUFrQkcsSUFBbEIsR0FDWixNQUFLUCxRQUFMLENBQWNRLEtBQWQsQ0FBb0IsQ0FBQzFELElBQUQsQ0FBcEIsRUFBNEJzRCxpQkFBNUIsQ0FEWSxHQUNxQyxNQUFLSixRQUFMLENBQWNTLE1BQWQsQ0FBcUIzRCxJQUFyQixDQURyRDtBQUVEO0FBQ0Q7QUFDQSxjQUFJLENBQUMsTUFBS2lELE1BQVYsRUFBa0IsTUFBS0EsTUFBTCxHQUFjQSxVQUFVeEQsS0FBeEI7QUFDbEIsY0FBTW1FLGlCQUFpQixNQUFLWCxNQUFMLENBQVlHLEtBQVosQ0FBa0IsQ0FBQ3BELElBQUQsQ0FBbEIsRUFBMEJOLEtBQTFCLENBQXZCO0FBQ0EsY0FBSSxDQUFDa0UsZUFBZVAsR0FBZixDQUFtQk4sT0FBbkIsQ0FBTCxFQUFrQztBQUNoQyxnQkFBSSxDQUFDLE1BQUtDLE9BQVYsRUFBbUIsTUFBS0EsT0FBTCxHQUFlQSxXQUFXdkQsS0FBMUI7QUFDbkIsZ0JBQU1vRSxrQkFBa0IsTUFBS2IsT0FBTCxDQUFhSSxLQUFiLENBQW1CLENBQUNwRCxJQUFELENBQW5CLEVBQTJCTixLQUEzQixDQUF4QjtBQUNBLGdCQUFJLENBQUNtRSxnQkFBZ0JSLEdBQWhCLENBQW9CTixPQUFwQixDQUFMLEVBQW1DO0FBQ2pDLG9CQUFLQyxPQUFMLEdBQWUsTUFBS0EsT0FBTCxDQUFhVSxLQUFiLENBQW1CLENBQUMxRCxJQUFELENBQW5CLEVBQTJCNkQsZ0JBQWdCQyxHQUFoQixDQUFvQmYsT0FBcEIsQ0FBM0IsQ0FBZjtBQUNEO0FBQ0Y7QUFDRCxjQUFJLE1BQUtDLE9BQUwsS0FBaUJBLE9BQWpCLElBQTRCLE1BQUtFLFFBQUwsS0FBa0JBLFFBQWxELEVBQTREO0FBQzFELGtCQUFLTCxRQUFMLENBQWM7QUFDWkcsdUJBQVMsTUFBS0EsT0FERjtBQUVaRSx3QkFBVSxNQUFLQTtBQUZILGFBQWQ7QUFJRDtBQUNGLFNBL09rQjs7QUFBQSxjQWlQbkJhLGtCQWpQbUIsR0FpUEUsVUFBQy9ELElBQUQsRUFBTytDLE9BQVAsRUFBbUI7QUFBQSw2QkFDQSxNQUFLN0IsS0FETDtBQUFBLGNBQzlCOEIsT0FEOEIsZ0JBQzlCQSxPQUQ4QjtBQUFBLGNBQ3JCQyxNQURxQixnQkFDckJBLE1BRHFCO0FBQUEsY0FDYkMsUUFEYSxnQkFDYkEsUUFEYTtBQUV0Qzs7QUFDQSxjQUFJLENBQUMsTUFBS0YsT0FBVixFQUFtQixNQUFLQSxPQUFMLEdBQWVBLFdBQVd2RCxLQUExQjtBQUNuQixjQUFNb0Usa0JBQWtCLE1BQUtiLE9BQUwsQ0FBYUksS0FBYixDQUFtQixDQUFDcEQsSUFBRCxDQUFuQixFQUEyQk4sS0FBM0IsQ0FBeEI7QUFDQSxjQUFJbUUsZ0JBQWdCUixHQUFoQixDQUFvQk4sT0FBcEIsQ0FBSixFQUFrQztBQUNoQyxnQkFBTWlCLG1CQUFtQkgsZ0JBQWdCTixTQUFoQixDQUEwQjtBQUFBLHFCQUFLQyxNQUFNVCxPQUFYO0FBQUEsYUFBMUIsQ0FBekI7QUFDQSxrQkFBS0MsT0FBTCxHQUFlZ0IsaUJBQWlCcEQsS0FBakIsS0FDWCxNQUFLb0MsT0FBTCxDQUFhVSxLQUFiLENBQW1CLENBQUMxRCxJQUFELENBQW5CLEVBQTJCZ0UsZ0JBQTNCLENBRFcsR0FFWCxNQUFLaEIsT0FBTCxDQUFhVyxNQUFiLENBQW9CM0QsSUFBcEIsQ0FGSjtBQUdEO0FBQ0Q7QUFDQSxjQUFJLENBQUMsTUFBS2lELE1BQVYsRUFBa0IsTUFBS0EsTUFBTCxHQUFjQSxVQUFVeEQsS0FBeEI7QUFDbEIsY0FBTW1FLGlCQUFpQixNQUFLWCxNQUFMLENBQVlHLEtBQVosQ0FBa0IsQ0FBQ3BELElBQUQsQ0FBbEIsRUFBMEJOLEtBQTFCLENBQXZCO0FBQ0EsY0FBSWtFLGVBQWVQLEdBQWYsQ0FBbUJOLE9BQW5CLENBQUosRUFBaUM7QUFDL0IsZ0JBQUksQ0FBQyxNQUFLRyxRQUFWLEVBQW9CLE1BQUtBLFFBQUwsR0FBZ0JBLFlBQVl6RCxLQUE1QjtBQUNwQixnQkFBTTBELG1CQUFtQixNQUFLRCxRQUFMLENBQWNFLEtBQWQsQ0FBb0IsQ0FBQ3BELElBQUQsQ0FBcEIsRUFBNEJOLEtBQTVCLENBQXpCO0FBQ0EsZ0JBQUksQ0FBQ3lELGlCQUFpQkUsR0FBakIsQ0FBcUJOLE9BQXJCLENBQUwsRUFBb0M7QUFDbEMsb0JBQUtHLFFBQUwsR0FBZ0IsTUFBS0EsUUFBTCxDQUFjUSxLQUFkLENBQW9CLENBQUMxRCxJQUFELENBQXBCLEVBQTRCbUQsaUJBQWlCVyxHQUFqQixDQUFxQmYsT0FBckIsQ0FBNUIsQ0FBaEI7QUFDRDtBQUNGO0FBQ0QsY0FBSSxNQUFLQyxPQUFMLEtBQWlCQSxPQUFqQixJQUE0QixNQUFLRSxRQUFMLEtBQWtCQSxRQUFsRCxFQUE0RDtBQUMxRCxrQkFBS0wsUUFBTCxDQUFjO0FBQ1pHLHVCQUFTLE1BQUtBLE9BREY7QUFFWkUsd0JBQVUsTUFBS0E7QUFGSCxhQUFkO0FBSUQ7QUFDRixTQTVRa0I7O0FBRWpCLGNBQUtoQyxLQUFMLEdBQWE7QUFDWEQsZUFBSyxJQURNO0FBRVgrQixtQkFBU2lCLFNBRkU7QUFHWGhCLGtCQUFRZ0IsU0FIRztBQUlYZixvQkFBVWUsU0FKQztBQUtYQyxpQkFBTyxDQUxJO0FBTVhDLGtCQUFRO0FBTkcsU0FBYjtBQUZpQjtBQVVsQjs7QUF2QmtELDhCQXlCbkRDLGtCQXpCbUQsaUNBeUI5QjtBQUNuQixhQUFLQyxRQUFMLEdBQWdCO0FBQ2RDLGdCQUFNLEtBQUszQyxnQkFERztBQUVkTixrQkFBUSxLQUFLYyxnQkFGQztBQUdkMkIsZUFBSyxLQUFLL0MsVUFISTtBQUlkd0Qsa0JBQVEsS0FBSzdDLGVBSkM7QUFLZDhDLHdCQUFjUCxTQUxBO0FBTWRRLG9CQUFVLEtBQUszQixnQkFORDtBQU9kNEIsc0JBQVksS0FBS1g7QUFQSCxTQUFoQjtBQVNELE9BbkNrRDs7QUFBQSw4QkFxQ25EWSxpQkFyQ21ELGdDQXFDL0I7QUFDbEIsYUFBS0MsU0FBTDtBQUNELE9BdkNrRDs7QUFBQSw4QkF5Q25EQyxtQkF6Q21ELGdDQXlDL0JDLFNBekMrQixFQXlDcEJDLFNBekNvQixFQXlDVDtBQUN4QyxZQUFJLEtBQUs3RCxLQUFMLENBQVdELEdBQVgsS0FBbUI4RCxVQUFVOUQsR0FBakMsRUFBc0M7QUFDcEMsY0FBSSxLQUFLQyxLQUFMLENBQVdELEdBQWYsRUFBb0IsS0FBSytELE9BQUwsQ0FBYSxLQUFLOUQsS0FBTCxDQUFXRCxHQUF4QixFQUE2QixLQUE3QjtBQUNwQixjQUFJOEQsVUFBVTlELEdBQWQsRUFBbUI7QUFDakIsaUJBQUtnRSxRQUFMLENBQWNGLFVBQVU5RCxHQUF4QjtBQUNELFdBRkQsTUFFTztBQUNMLGlCQUFLMkQsU0FBTCxDQUFlRyxVQUFVWixNQUF6QjtBQUNEO0FBQ0YsU0FQRCxNQU9PLElBQUksQ0FBQ1ksVUFBVTlELEdBQWYsRUFBb0I7QUFDekIsZUFBSzJELFNBQUwsQ0FBZUcsVUFBVVosTUFBekI7QUFDRCxTQUZNLE1BRUE7QUFBQSxjQUNDbkIsT0FERCxHQUN1QitCLFNBRHZCLENBQ0MvQixPQUREO0FBQUEsY0FDVUUsUUFEVixHQUN1QjZCLFNBRHZCLENBQ1U3QixRQURWOztBQUVMLGNBQUksQ0FBQ0EsUUFBTCxFQUFlO0FBQ2JBLHVCQUFXLEtBQUtBLFFBQUwsSUFBaUJ6RCxLQUE1QjtBQUNELFdBRkQsTUFFTyxJQUFJLEtBQUt5RCxRQUFULEVBQW1CO0FBQ3hCQSx1QkFBV0EsU0FBU2dDLFNBQVQsQ0FBbUIsS0FBS2hDLFFBQXhCLENBQVg7QUFDRDtBQUNELGNBQU1pQyxnQkFBZ0JqQyxTQUFTa0MsTUFBVCxDQUFnQixLQUFLeEUsS0FBckIsRUFBNEIsQ0FBNUIsQ0FBdEI7QUFDQSxjQUFJdUUsYUFBSixFQUFtQjtBQUNqQixpQkFBS2pDLFFBQUwsR0FBZ0IsS0FBS21DLG1CQUFMLENBQXlCLEtBQUtuRSxLQUFMLENBQVdELEdBQXBDLEVBQXlDaUMsUUFBekMsQ0FBaEI7QUFDRDtBQUNELGNBQUksQ0FBQ0YsT0FBTCxFQUFjO0FBQ1pBLHNCQUFVLEtBQUtBLE9BQUwsSUFBZ0J2RCxLQUExQjtBQUNELFdBRkQsTUFFTyxJQUFJLEtBQUt1RCxPQUFULEVBQWtCO0FBQ3ZCQSxzQkFBVUEsUUFBUWtDLFNBQVIsQ0FBa0IsS0FBS2xDLE9BQXZCLENBQVY7QUFDRDtBQUNELGNBQU1zQyxlQUFldEMsUUFBUW9DLE1BQVIsQ0FBZSxLQUFLeEUsS0FBcEIsRUFBMkIsQ0FBM0IsQ0FBckI7QUFDQSxjQUFJMEUsWUFBSixFQUFrQjtBQUNoQixpQkFBS3RDLE9BQUwsR0FBZSxLQUFLdUMsaUJBQUwsQ0FBdUJSLFVBQVU5RCxHQUFqQyxFQUFzQytCLE9BQXRDLENBQWY7QUFDRDtBQUNGO0FBQ0YsT0F4RWtEOztBQUFBLDhCQTBFbkR3QyxvQkExRW1ELG1DQTBFNUI7QUFDckIsYUFBS1IsT0FBTCxDQUFhLEtBQUs5RCxLQUFMLENBQVdELEdBQXhCLEVBQTZCLElBQTdCO0FBQ0QsT0E1RWtEOztBQUFBLDhCQTRIN0MyRCxTQTVINkM7QUFBQSw2RkE0SG5DYSxTQTVIbUM7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQTZIdkIsS0FBS3ZFLEtBN0hrQixFQTZIekNnRCxLQTdIeUMsVUE2SHpDQSxLQTdIeUMsRUE2SGxDQyxNQTdIa0MsVUE2SGxDQSxNQTdIa0M7O0FBQUEsd0JBOEg3Q0QsUUFBUTFELE9BOUhxQztBQUFBO0FBQUE7QUFBQTs7QUErSC9DZ0IsMEJBQVFDLEtBQVIsNkNBQXdEckIsT0FBeEQ7QUFDQSx1QkFBS3lDLFFBQUwsQ0FBYztBQUNacUIsMkJBQU8sQ0FESztBQUVaQyw0QkFBUTtBQUZJLG1CQUFkO0FBaEkrQztBQUFBOztBQUFBO0FBQUEsMkJBcUlYLEtBQUt4RCxLQXJJTSxFQXFJdkNvQixPQXJJdUMsVUFxSXZDQSxPQXJJdUMsRUFxSTlCMkQsY0FySThCLFVBcUk5QkEsY0FySThCOztBQUFBLHdCQXNJM0MzRCxXQUFXM0IsT0F0SWdDO0FBQUE7QUFBQTtBQUFBOztBQXVJekN1Riw0QkF2SXlDLEdBdUk1QjVELE9Bdkk0Qjs7QUF3STdDLHNCQUFJeEIsV0FBSixFQUFpQm9GLGFBQWdCQSxVQUFoQixTQUE4QnBGLFdBQTlCO0FBQ2pCb0YsK0JBQWdCQSxVQUFoQixTQUE4QnZGLE9BQTlCO0FBQ0EsdUJBQUt3QyxLQUFMLEdBQWE4QyxlQUFlRSxrQkFBZixDQUFrQ3RGLFdBQWxDLENBQWI7O0FBMUk2Qyx1QkEySXpDLEtBQUtzQyxLQTNJb0M7QUFBQTtBQUFBO0FBQUE7O0FBQUEsd0JBNEl2QyxLQUFLRCxRQUFMLEtBQWtCLEtBQUtDLEtBNUlnQjtBQUFBO0FBQUE7QUFBQTs7QUE2SXpDLHNCQUFJLENBQUM2QyxhQUFhdEIsTUFBZCxJQUF3QjNELE9BQTVCLEVBQXFDO0FBQ25DZ0IsNEJBQVFxRSxJQUFSLENBQWEsaURBQWI7QUFDRCxtQkFGRCxNQUVPO0FBQ0wseUJBQUtoRCxRQUFMLENBQWM7QUFDWjVCLDJCQUFLLElBRE87QUFFWmtELDhCQUFRLENBQUNzQixhQUFhdEIsTUFBZCxJQUF3QjtBQUZwQixxQkFBZDtBQUlEO0FBcEp3Qzs7QUFBQTtBQXVKM0MsdUJBQUt4QixRQUFMLEdBQWdCc0IsU0FBaEI7O0FBdkoyQztBQXlKdkNoRCxxQkF6SnVDLEdBeUpqQyxJQUFJdEIsb0JBQUosR0FDVG1HLE9BRFMsQ0FDREgsVUFEQyxFQUNXO0FBQ25CSSwrQkFBV25HLGtCQUFrQm9HLFVBRFY7QUFFbkJKLHdDQUFvQjtBQUFBLDZCQUFNLE9BQUtoRCxLQUFYO0FBQUE7QUFGRCxtQkFEWCxFQUtUcUQsS0FMUyxFQXpKaUM7O0FBK0o3Q2hGLHNCQUFJaUYsT0FBSixHQUFjLEtBQUszRCxXQUFuQjtBQUNBLHVCQUFLTSxRQUFMLENBQWM7QUFDWjVCLDRCQURZO0FBRVppRCwyQkFBT0EsUUFBUSxDQUZIO0FBR1pDLDRCQUFRO0FBSEksbUJBQWQ7O0FBaEs2QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQSw4QkF5S25EYyxRQXpLbUQscUJBeUsxQ2hFLEdBekswQyxFQXlLckM7QUFBQTs7QUFDWixZQUFJQSxHQUFKLEVBQVM7QUFDUEEsY0FBSWtGLEtBQUosR0FDR0MsSUFESCxDQUNRLFlBQU07QUFBQSwwQkFDa0IsT0FBS2xGLEtBRHZCO0FBQUEsZ0JBQ0Y4QixPQURFLFdBQ0ZBLE9BREU7QUFBQSxnQkFDT0MsTUFEUCxXQUNPQSxNQURQOztBQUVWLGdCQUFJLENBQUMsT0FBS0QsT0FBVixFQUFtQixPQUFLQSxPQUFMLEdBQWVBLFdBQVd2RCxLQUExQjtBQUNuQixnQkFBSSxDQUFDLE9BQUt3RCxNQUFWLEVBQWtCLE9BQUtBLE1BQUwsR0FBY0EsVUFBVXhELEtBQXhCO0FBQ2xCLG1CQUFLb0QsUUFBTCxDQUFjO0FBQ1pJLHNCQUFRLE9BQUtBLE1BREQ7QUFFWkQsdUJBQVMsT0FBS0EsT0FGRjtBQUdaa0IscUJBQU87QUFISyxhQUFkO0FBS0QsV0FWSCxFQVdHNUMsS0FYSCxDQVdTLFVBQUNDLEdBQUQsRUFBUztBQUNkQyxvQkFBUXFFLElBQVIsMERBQW9FekYsT0FBcEUsYUFBbUZtQixHQUFuRjtBQUNBTixnQkFBSW9GLElBQUo7QUFDQSxtQkFBSzlELFdBQUwsQ0FBaUJoQixHQUFqQjtBQUNELFdBZkg7QUFnQkQ7QUFDRixPQTVMa0Q7O0FBQUEsOEJBNE1uRHlELE9BNU1tRCxvQkE0TTNDL0QsR0E1TTJDLEVBNE10Q3FGLEtBNU1zQyxFQTRNL0I7QUFDbEIsWUFBSXJGLEdBQUosRUFBUztBQUNQLGNBQUlxRixLQUFKLEVBQVc7QUFDVDtBQUNBLGlCQUFLdEQsT0FBTCxHQUFlaUIsU0FBZjtBQUNBLGlCQUFLdkMsZUFBTCxDQUFxQixFQUFyQjtBQUNBO0FBQ0QsV0FMRCxNQUtPLElBQUksQ0FBQyxLQUFLc0IsT0FBVixFQUFtQjtBQUN4QixpQkFBS0EsT0FBTCxHQUFlLEtBQUs5QixLQUFMLENBQVcrQixNQUExQjtBQUNELFdBRk0sTUFFQSxJQUFJLEtBQUsvQixLQUFMLENBQVcrQixNQUFmLEVBQXVCO0FBQzVCLGlCQUFLRCxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFha0MsU0FBYixDQUF1QixLQUFLaEUsS0FBTCxDQUFXK0IsTUFBbEMsQ0FBZjtBQUNEOztBQUVEaEMsY0FBSW9GLElBQUo7QUFDQSxlQUFLcEQsTUFBTCxHQUFjZ0IsU0FBZDtBQUNBLGVBQUtwQixRQUFMLENBQWM7QUFDWkcscUJBQVMsS0FBS0EsT0FERjtBQUVaQyxvQkFBUSxLQUFLQTtBQUZELFdBQWQ7QUFJRDtBQUNGLE9BaE9rRDs7QUFBQSw4QkEyUm5Ec0MsaUJBM1JtRCw4QkEyUmpDdEUsR0EzUmlDLEVBMlI1QnNGLFlBM1I0QixFQTJSZDtBQUFBOztBQUNuQyxZQUFJdkQsVUFBVXVELFlBQWQ7QUFDQSxZQUFJdEYsT0FBT3NGLFlBQVgsRUFBeUI7QUFBQSxjQUNmcEYsVUFEZSxHQUNBRixHQURBLENBQ2ZFLFVBRGU7O0FBRXZCLGNBQUlBLGNBQWNBLFdBQVdDLGVBQVgsS0FBK0IsQ0FBakQsRUFBb0Q7QUFBQSxnQkFDMUM2QixNQUQwQyxHQUMvQixLQUFLL0IsS0FEMEIsQ0FDMUMrQixNQUQwQzs7QUFFbEQsZ0JBQUksQ0FBQyxLQUFLQSxNQUFWLEVBQWtCLEtBQUtBLE1BQUwsR0FBY0EsVUFBVXhELEtBQXhCO0FBQ2xCLGdCQUFJLEtBQUt3RCxNQUFMLENBQVltQyxNQUFaLENBQW1CLEtBQUt4RSxLQUF4QixFQUErQixDQUEvQixDQUFKLEVBQXVDO0FBQ3JDb0Msd0JBQVVBLFFBQVF3RCxVQUFSLENBQW1CLGlCQUF5QjtBQUFBLG9CQUF2QnhHLElBQXVCO0FBQUEsb0JBQWpCeUcsV0FBaUI7O0FBQ3BELG9CQUFNQyxXQUFXLE9BQUt6RCxNQUFMLENBQVlHLEtBQVosQ0FBa0IsQ0FBQ3BELElBQUQsQ0FBbEIsQ0FBakI7QUFDQSxvQkFBTTJHLFdBQVdELFdBQ2JELFlBQVlsRCxTQUFaLENBQXNCO0FBQUEseUJBQVdtRCxTQUFTckQsR0FBVCxDQUFhTixPQUFiLENBQVg7QUFBQSxpQkFBdEIsQ0FEYSxHQUViMEQsV0FGSjtBQUdBLHVCQUFPLENBQUN6RyxJQUFELEVBQU8yRyxRQUFQLENBQVA7QUFDRCxlQU5TLENBQVY7QUFPRDtBQUNEM0Qsb0JBQVF3RCxVQUFSLENBQW1CO0FBQUEsa0JBQUV4RyxJQUFGO0FBQUEsa0JBQVEyRyxRQUFSO0FBQUEscUJBQXNCQSxTQUFTQyxHQUFULENBQWE7QUFBQSx1QkFBVzNGLElBQUk0RixFQUFKLENBQU83RyxJQUFQLEVBQWErQyxPQUFiLENBQVg7QUFBQSxlQUFiLENBQXRCO0FBQUEsYUFBbkI7QUFDQSxpQkFBS0UsTUFBTCxHQUFjLEtBQUtBLE1BQUwsQ0FBWWlDLFNBQVosQ0FBc0JsQyxPQUF0QixDQUFkO0FBQ0EsaUJBQUtILFFBQUwsQ0FBYztBQUNaRyx1QkFBU2lCLFNBREc7QUFFWmhCLHNCQUFRLEtBQUtBO0FBRkQsYUFBZDtBQUlBLG1CQUFPZ0IsU0FBUDtBQUNEO0FBQ0Y7QUFDRCxlQUFPakIsT0FBUDtBQUNELE9BclRrRDs7QUFBQSw4QkF1VG5EcUMsbUJBdlRtRCxnQ0F1VC9CcEUsR0F2VCtCLEVBdVQxQmlDLFFBdlQwQixFQXVUaEI7QUFDakMsWUFBSWpDLE9BQU9pQyxRQUFYLEVBQXFCO0FBQ25CQSxtQkFBU3NELFVBQVQsQ0FBb0I7QUFBQSxnQkFBRXhHLElBQUY7QUFBQSxnQkFBUTJHLFFBQVI7QUFBQSxtQkFBc0JBLFNBQVNDLEdBQVQsQ0FBYTtBQUFBLHFCQUFXM0YsSUFBSTZGLEdBQUosQ0FBUTlHLElBQVIsRUFBYytDLE9BQWQsQ0FBWDtBQUFBLGFBQWIsQ0FBdEI7QUFBQSxXQUFwQjtBQURtQixjQUVYRSxNQUZXLEdBRUEsS0FBSy9CLEtBRkwsQ0FFWCtCLE1BRlc7O0FBR25CLGNBQUksQ0FBQyxLQUFLQSxNQUFWLEVBQWtCLEtBQUtBLE1BQUwsR0FBY0EsVUFBVXhELEtBQXhCO0FBQ2xCLGVBQUt3RCxNQUFMLEdBQWMsS0FBS0EsTUFBTCxDQUFZdUQsVUFBWixDQUF1QixpQkFBeUI7QUFBQSxnQkFBdkJ4RyxJQUF1QjtBQUFBLGdCQUFqQnlHLFdBQWlCOztBQUM1RCxnQkFBTU0sWUFBWTdELFNBQVNFLEtBQVQsQ0FBZSxDQUFDcEQsSUFBRCxDQUFmLENBQWxCO0FBQ0EsZ0JBQU0yRyxXQUFXSSxZQUNiTixZQUFZbEQsU0FBWixDQUFzQjtBQUFBLHFCQUFXd0QsVUFBVTFELEdBQVYsQ0FBY04sT0FBZCxDQUFYO0FBQUEsYUFBdEIsQ0FEYSxHQUViMEQsV0FGSjtBQUdBLG1CQUFPLENBQUN6RyxJQUFELEVBQU8yRyxRQUFQLENBQVA7QUFDRCxXQU5hLENBQWQ7QUFPQSxlQUFLOUQsUUFBTCxDQUFjO0FBQ1pJLG9CQUFRLEtBQUtBLE1BREQ7QUFFWkMsc0JBQVVlO0FBRkUsV0FBZDtBQUlBLGlCQUFPQSxTQUFQO0FBQ0Q7QUFDRCxlQUFPZixRQUFQO0FBQ0QsT0ExVWtEOztBQUFBLDhCQTRVbkQ4RCxNQTVVbUQscUJBNFUxQztBQUFBOztBQUFBLHNCQUNrRCxLQUFLckcsS0FEdkQ7QUFBQSxZQUNDb0IsT0FERCxXQUNDQSxPQUREO0FBQUEsWUFDVTJELGNBRFYsV0FDVUEsY0FEVjtBQUFBLFlBQzZCdUIsZ0JBRDdCOztBQUVQLFlBQU1DLG1DQUFhOUcsT0FBYixJQUF1QixLQUFLaUUsUUFBNUIsV0FBTjtBQUNBLGVBQ0Usb0JBQUMsZ0JBQUQsZUFDTTRDLGdCQUROLEVBRU1DLE9BRk4sRUFERjtBQU1ELE9BclZrRDs7QUFBQTtBQUFBLE1BVXpCOUgsTUFBTStILGFBVm1CLFVBVzVDakgsZ0JBWDRDLEdBV3pCQSxnQkFYeUI7OztBQXdWckRRLGtCQUFjWCxXQUFkLHNCQUE2Q0YsZUFBZUssZ0JBQWYsQ0FBN0M7O0FBU0EsUUFBTWtILG9CQUFvQixTQUFwQkEsaUJBQW9CLENBQUNsRyxLQUFELEVBQVFtRyxNQUFSLEVBQW1CO0FBQzNDLFVBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQyxPQUFPQSxPQUFPbkcsS0FBUCxDQUFQO0FBQ2xDLFVBQUksT0FBT21HLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0MsT0FBT0EsTUFBUDtBQUNoQyxhQUFPLEVBQVA7QUFDRCxLQUpEOztBQU1BLFFBQU1DLHFCQUFxQixTQUFyQkEsa0JBQXFCO0FBQUEsYUFBYTtBQUN0QzVCLHdCQUFnQm5HLG1CQUFtQjtBQUNqQ3FHLDhCQUFvQjtBQUFBLG1CQUFNLFVBQUMyQixVQUFELEVBQWFDLFFBQWIsRUFBMEI7QUFDbEQsa0JBQU10RyxRQUFRc0csVUFBZDtBQUNBLHFCQUFPSixrQkFBa0JsRyxLQUFsQixFQUF5QlosV0FBekIsQ0FBUDtBQUNELGFBSG1CO0FBQUE7QUFEYSxTQUFuQixFQUtibUgsUUFMYTtBQURzQixPQUFiO0FBQUEsS0FBM0I7O0FBU0EsUUFBTUMsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDeEcsS0FBRCxFQUFXO0FBQ2pDLFVBQU1hLFVBQVVxRixrQkFBa0JsRyxLQUFsQixFQUF5QmIsV0FBekIsQ0FBaEI7QUFDQSxhQUFPLEVBQUUwQixnQkFBRixFQUFQO0FBQ0QsS0FIRDs7QUFLQSxXQUFPdkMsUUFBUWtJLGVBQVIsRUFBeUJKLGtCQUF6QixFQUE2QzVHLGFBQTdDLENBQVA7QUFDRCxHQXRYcUI7QUFBQSxDQUF0Qjs7QUF3WEEsZUFBZVQsYUFBZiIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XHJcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XHJcbmltcG9ydCB7IE1hcCwgU2V0IH0gZnJvbSAnaW1tdXRhYmxlJztcclxuaW1wb3J0IHsgSHViQ29ubmVjdGlvbkJ1aWxkZXIsIEh0dHBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyJztcclxuXHJcbmNvbnN0IGdldERpc3BsYXlOYW1lID0gQ29tcG9uZW50ID0+IENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQubmFtZSB8fCAnQ29tcG9uZW50JztcclxuXHJcbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XHJcbiAgY29uc3Qge1xyXG4gICAgaHViTmFtZSA9ICcnLFxyXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcclxuICAgIGFjY2Vzc1Rva2VuID0gbnVsbCxcclxuICAgIHNpZ25hbHJQYXRoID0gJ3NpZ25hbHInLFxyXG4gICAgcmV0cmllcyA9IDMsXHJcbiAgfSA9IG9wdGlvbnM7XHJcbiAgY29uc3QgeyBjb250cm9sbGVyID0gaHViTmFtZSB9ID0gb3B0aW9ucztcclxuXHJcbiAgY2xhc3MgSW5qZWN0U2lnbmFsUiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xyXG4gICAgc3RhdGljIFdyYXBwZWRDb21wb25lbnQgPSBXcmFwcGVkQ29tcG9uZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICBodWI6IG51bGwsXHJcbiAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxyXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXHJcbiAgICAgICAgcmV0cnk6IDAsXHJcbiAgICAgICAgY3JlYXRlOiAwLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcclxuICAgICAgdGhpcy5odWJQcm94eSA9IHtcclxuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZUNvbnRyb2xsZXIsXHJcbiAgICAgICAgYWRkOiB0aGlzLmFkZFRvR3JvdXAsXHJcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcclxuICAgICAgICBjb25uZWN0aW9uSWQ6IHVuZGVmaW5lZCxcclxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaHViKSB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIGZhbHNlKTtcclxuICAgICAgICBpZiAobmV4dFN0YXRlLmh1Yikge1xyXG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHsgcGVuZGluZywgbW9yaWJ1bmQgfSA9IG5leHRTdGF0ZTtcclxuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbW9yaWJ1bmRDb3VudCA9IG1vcmlidW5kLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xyXG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwZW5kaW5nQ291bnQgPSBwZW5kaW5nLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XHJcblxyXG4gICAgYWRkVG9Hcm91cCA9IChncm91cCkgPT4ge1xyXG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKGh1Yikge1xyXG4gICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbiB9ID0gaHViO1xyXG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICBodWIuaW52b2tlKCdhZGRUb0dyb3VwJywgZ3JvdXApXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcclxuICAgICAgY29uc3QgeyBodWIgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgaHViLmludm9rZSgncmVtb3ZlRnJvbUdyb3VwJywgZ3JvdXApXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFJlbW92aW5nIGNsaWVudCBmcm9tIGdyb3VwICR7Z3JvdXB9IGluICR7aHViTmFtZX0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc2VuZFRvQ29udHJvbGxlciA9ICh0YXJnZXQsIGRhdGEgPSBudWxsKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xyXG4gICAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcclxuICAgICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBwYXlsb2FkKVxyXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbnZva2VDb250cm9sbGVyID0gKHRhcmdldE1ldGhvZCwgZGF0YSA9IG51bGwpID0+IHtcclxuICAgICAgY29uc3QgdXJsQmFzZSA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldE1ldGhvZH1gO1xyXG4gICAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xyXG4gICAgICByZXR1cm4gYXhpb3MuZ2V0KHVybClcclxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhc3luYyBjcmVhdGVIdWIoY3VyQ3JlYXRlKSB7XHJcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKHJldHJ5ID4gcmV0cmllcykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSYW4gb3V0IG9mIHJldHJpZXMgZm9yIHN0YXJ0aW5nICR7aHViTmFtZX0hYCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICByZXRyeTogMCxcclxuICAgICAgICAgIGNyZWF0ZTogMCxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xyXG4gICAgICAgIGlmIChiYXNlVXJsICYmIGh1Yk5hbWUpIHtcclxuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcclxuICAgICAgICAgIGlmIChzaWduYWxyUGF0aCkgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7c2lnbmFsclBhdGh9YDtcclxuICAgICAgICAgIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke2h1Yk5hbWV9YDtcclxuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgICBpZiAoKGN1ckNyZWF0ZSB8fCBjcmVhdGUpID4gcmV0cmllcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmFibGUgdG8gZ2V0IHVwLXRvLWRhdGUgYWNjZXNzIHRva2VuLicpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgaHViOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbkJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAud2l0aFVybChodWJBZGRyZXNzLCB7XHJcbiAgICAgICAgICAgICAgdHJhbnNwb3J0OiBIdHRwVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzLFxyXG4gICAgICAgICAgICAgIGFjY2Vzc1Rva2VuRmFjdG9yeTogKCkgPT4gdGhpcy50b2tlbixcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmJ1aWxkKCk7XHJcbiAgICAgICAgICBodWIub25jbG9zZSA9IHRoaXMuaGFuZGxlRXJyb3I7XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgaHViLFxyXG4gICAgICAgICAgICByZXRyeTogcmV0cnkgKyAxLFxyXG4gICAgICAgICAgICBjcmVhdGU6IDAsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydEh1YihodWIpIHtcclxuICAgICAgaWYgKGh1Yikge1xyXG4gICAgICAgIGh1Yi5zdGFydCgpXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXHJcbiAgICAgICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgICAgIHJldHJ5OiAwLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFdhcm5pbmc6IEVycm9yIHdoaWxlIGVzdGFibGlzaGluZyBjb25uZWN0aW9uIHRvIGh1YiAke2h1Yk5hbWV9LlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgICAgICBodWIuc3RvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUVycm9yID0gKGVycikgPT4ge1xyXG4gICAgICBjb25zdCB7IHJlc3BvbnNlLCBzdGF0dXNDb2RlIH0gPSBlcnI7XHJcbiAgICAgIGNvbnN0IHsgc3RhdHVzIH0gPSByZXNwb25zZSB8fCB7fTtcclxuICAgICAgc3dpdGNoIChzdGF0dXMgfHwgc3RhdHVzQ29kZSkge1xyXG4gICAgICAgIGNhc2UgNTAwOlxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA0MDE6XHJcbiAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdGhpcy50b2tlbjsgLy8gZmFsbCB0aHJvdWdoXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBodWI6IG51bGwgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdG9wSHViKGh1YiwgY2xlYXIpIHtcclxuICAgICAgaWYgKGh1Yikge1xyXG4gICAgICAgIGlmIChjbGVhcikge1xyXG4gICAgICAgICAgLy8gQ2xlYXIgcGVuZGluZ1xyXG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVGcm9tR3JvdXAoJycpO1xyXG4gICAgICAgICAgLy8gTWVyZ2UgYWN0aXZlIHRvIHBlbmRpbmdcclxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlbmRpbmcpIHtcclxuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMuc3RhdGUuYWN0aXZlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5tZXJnZURlZXAodGhpcy5zdGF0ZS5hY3RpdmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaHViLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcclxuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcclxuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBtb3JpYnVuZCBsaXN0ZW5lcnNcclxuICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICBpZiAoZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICBjb25zdCByZW1haW5pbmdNb3JpYnVuZCA9IGV4aXN0aW5nTW9yaWJ1bmQuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHJlbWFpbmluZ01vcmlidW5kLnNpemVcclxuICAgICAgICAgID8gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ01vcmlidW5kKSA6IHRoaXMubW9yaWJ1bmQuZGVsZXRlKG5hbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBwZW5kaW5nIGxpc3RlbmVycyAoaWYgaXQgaXMgTk9UIGFjdGl2ZSlcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgIGlmICghZXhpc3RpbmdBY3RpdmUuaGFzKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICAgIGlmICghZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5wZW5kaW5nLnNldEluKFtuYW1lXSwgZXhpc3RpbmdQZW5kaW5nLmFkZChoYW5kbGVyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgIT09IHBlbmRpbmcgfHwgdGhpcy5tb3JpYnVuZCAhPT0gbW9yaWJ1bmQpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcclxuICAgICAgICAgIG1vcmlidW5kOiB0aGlzLm1vcmlidW5kLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHVucmVnaXN0ZXJMaXN0ZW5lciA9IChuYW1lLCBoYW5kbGVyKSA9PiB7XHJcbiAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlLCBtb3JpYnVuZCB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gcGVuZGluZyBsaXN0ZW5lcnNcclxuICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nUGVuZGluZyA9IHRoaXMucGVuZGluZy5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgaWYgKGV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICBjb25zdCByZW1haW5pbmdQZW5kaW5nID0gZXhpc3RpbmdQZW5kaW5nLmZpbHRlck5vdChoID0+IGggPT09IGhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMucGVuZGluZyA9IHJlbWFpbmluZ1BlbmRpbmcuY291bnQoKVxyXG4gICAgICAgICAgPyB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCByZW1haW5pbmdQZW5kaW5nKVxyXG4gICAgICAgICAgOiB0aGlzLnBlbmRpbmcuZGVsZXRlKG5hbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBtb3JpYnVuZCBsaXN0ZW5lcnMgKGlmIGl0IGlzIGFjdGl2ZSlcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgIGlmIChleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcclxuICAgICAgICBjb25zdCBleGlzdGluZ01vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgICBpZiAoIWV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICB0aGlzLm1vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIGV4aXN0aW5nTW9yaWJ1bmQuYWRkKGhhbmRsZXIpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBwZW5kaW5nUGFyYW0pIHtcclxuICAgICAgbGV0IHBlbmRpbmcgPSBwZW5kaW5nUGFyYW07XHJcbiAgICAgIGlmIChodWIgJiYgcGVuZGluZ1BhcmFtKSB7XHJcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XHJcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IHsgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmUucmVkdWNlKHRoaXMuY291bnQsIDApKSB7XHJcbiAgICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1hcEVudHJpZXMoKFtuYW1lLCBjdXJIYW5kbGVyc10pID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBleGlzdGluZ1xyXG4gICAgICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiBleGlzdGluZy5oYXMoaGFuZGxlcikpXHJcbiAgICAgICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xyXG4gICAgICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9uKG5hbWUsIGhhbmRsZXIpKSk7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuYWN0aXZlLm1lcmdlRGVlcChwZW5kaW5nKTtcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwZW5kaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGluYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBtb3JpYnVuZCkge1xyXG4gICAgICBpZiAoaHViICYmIG1vcmlidW5kKSB7XHJcbiAgICAgICAgbW9yaWJ1bmQubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9mZihuYW1lLCBoYW5kbGVyKSkpO1xyXG4gICAgICAgIGNvbnN0IHsgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcmVtb3ZhYmxlID0gbW9yaWJ1bmQuZ2V0SW4oW25hbWVdKTtcclxuICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gcmVtb3ZhYmxlXHJcbiAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gcmVtb3ZhYmxlLmhhcyhoYW5kbGVyKSlcclxuICAgICAgICAgICAgOiBjdXJIYW5kbGVycztcclxuICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcclxuICAgICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbW9yaWJ1bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zLCAuLi5wYXNzVGhyb3VnaFByb3BzIH0gPSB0aGlzLnByb3BzO1xyXG4gICAgICBjb25zdCBodWJQcm9wID0geyBbaHViTmFtZV06IHRoaXMuaHViUHJveHkgfTtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICA8V3JhcHBlZENvbXBvbmVudFxyXG4gICAgICAgICAgey4uLnBhc3NUaHJvdWdoUHJvcHN9XHJcbiAgICAgICAgICB7Li4uaHViUHJvcH1cclxuICAgICAgICAvPlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgSW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZSA9IGBJbmplY3RTaWduYWxSKCR7Z2V0RGlzcGxheU5hbWUoV3JhcHBlZENvbXBvbmVudCl9KWA7XHJcblxyXG4gIEluamVjdFNpZ25hbFIucHJvcFR5cGVzID0ge1xyXG4gICAgYmFzZVVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxyXG4gICAgc2lnbmFsckFjdGlvbnM6IFByb3BUeXBlcy5zaGFwZSh7XHJcbiAgICAgIGdldEFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuZnVuYyxcclxuICAgIH0pLmlzUmVxdWlyZWQsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0VmFsdWVGcm9tU3RhdGUgPSAoc3RhdGUsIHNvdXJjZSkgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdmdW5jdGlvbicpIHJldHVybiBzb3VyY2Uoc3RhdGUpO1xyXG4gICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSByZXR1cm4gc291cmNlO1xyXG4gICAgcmV0dXJuICcnO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IGRpc3BhdGNoID0+ICh7XHJcbiAgICBzaWduYWxyQWN0aW9uczogYmluZEFjdGlvbkNyZWF0b3JzKHtcclxuICAgICAgYWNjZXNzVG9rZW5GYWN0b3J5OiAoKSA9PiAoZGlzcGF0Y2hlciwgZ2V0U3RhdGUpID0+IHtcclxuICAgICAgICBjb25zdCBzdGF0ZSA9IGdldFN0YXRlKCk7XHJcbiAgICAgICAgcmV0dXJuIGdldFZhbHVlRnJvbVN0YXRlKHN0YXRlLCBhY2Nlc3NUb2tlbik7XHJcbiAgICAgIH0sXHJcbiAgICB9LCBkaXNwYXRjaCksXHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xyXG4gICAgY29uc3QgYmFzZVVybCA9IGdldFZhbHVlRnJvbVN0YXRlKHN0YXRlLCBiYXNlQWRkcmVzcyk7XHJcbiAgICByZXR1cm4geyBiYXNlVXJsIH07XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEluamVjdFNpZ25hbFIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0U2lnbmFsUjtcclxuIl19