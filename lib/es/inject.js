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
                  console.log('skipping negotiation');
                  hub = new HubConnectionBuilder().withUrl(hubAddress, {
                    skipNegotiation: true,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbIlJlYWN0IiwiUHJvcFR5cGVzIiwiYXhpb3MiLCJiaW5kQWN0aW9uQ3JlYXRvcnMiLCJjb25uZWN0IiwiTWFwIiwiU2V0IiwiSHViQ29ubmVjdGlvbkJ1aWxkZXIiLCJIdHRwVHJhbnNwb3J0VHlwZSIsImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwic2VuZFRvQ29udHJvbGxlciIsInRhcmdldCIsImRhdGEiLCJ1cmwiLCJiYXNlVXJsIiwicGF5bG9hZCIsInRvSlMiLCJwb3N0IiwiaW52b2tlQ29udHJvbGxlciIsInRhcmdldE1ldGhvZCIsInVybEJhc2UiLCJnZXQiLCJoYW5kbGVFcnJvciIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsInN0YXR1cyIsIm9sZFRva2VuIiwidG9rZW4iLCJzZXRTdGF0ZSIsInJlZ2lzdGVyTGlzdGVuZXIiLCJoYW5kbGVyIiwicGVuZGluZyIsImFjdGl2ZSIsIm1vcmlidW5kIiwiZXhpc3RpbmdNb3JpYnVuZCIsImdldEluIiwiaGFzIiwicmVtYWluaW5nTW9yaWJ1bmQiLCJmaWx0ZXJOb3QiLCJoIiwic2l6ZSIsInNldEluIiwiZGVsZXRlIiwiZXhpc3RpbmdBY3RpdmUiLCJleGlzdGluZ1BlbmRpbmciLCJhZGQiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJyZW1haW5pbmdQZW5kaW5nIiwidW5kZWZpbmVkIiwicmV0cnkiLCJjcmVhdGUiLCJjb21wb25lbnRXaWxsTW91bnQiLCJodWJQcm94eSIsInNlbmQiLCJyZW1vdmUiLCJjb25uZWN0aW9uSWQiLCJyZWdpc3RlciIsInVucmVnaXN0ZXIiLCJjb21wb25lbnREaWRNb3VudCIsImNyZWF0ZUh1YiIsImNvbXBvbmVudFdpbGxVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJzdG9wSHViIiwic3RhcnRIdWIiLCJtZXJnZURlZXAiLCJtb3JpYnVuZENvdW50IiwicmVkdWNlIiwiaW5hY3RpdmF0ZUxpc3RlbmVycyIsInBlbmRpbmdDb3VudCIsImFjdGl2YXRlTGlzdGVuZXJzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjdXJDcmVhdGUiLCJzaWduYWxyQWN0aW9ucyIsImh1YkFkZHJlc3MiLCJhY2Nlc3NUb2tlbkZhY3RvcnkiLCJ3YXJuIiwibG9nIiwid2l0aFVybCIsInNraXBOZWdvdGlhdGlvbiIsInRyYW5zcG9ydCIsIldlYlNvY2tldHMiLCJidWlsZCIsIm9uY2xvc2UiLCJzdGFydCIsInRoZW4iLCJzdG9wIiwiY2xlYXIiLCJwZW5kaW5nUGFyYW0iLCJtYXBFbnRyaWVzIiwiY3VySGFuZGxlcnMiLCJleGlzdGluZyIsImhhbmRsZXJzIiwibWFwIiwib24iLCJvZmYiLCJyZW1vdmFibGUiLCJyZW5kZXIiLCJwYXNzVGhyb3VnaFByb3BzIiwiaHViUHJvcCIsIlB1cmVDb21wb25lbnQiLCJnZXRWYWx1ZUZyb21TdGF0ZSIsInNvdXJjZSIsIm1hcERpc3BhdGNoVG9Qcm9wcyIsImRpc3BhdGNoZXIiLCJnZXRTdGF0ZSIsImRpc3BhdGNoIiwibWFwU3RhdGVUb1Byb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxPQUFPQSxLQUFQLE1BQWtCLE9BQWxCO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLE9BQU9DLEtBQVAsTUFB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cm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBNYXAsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgeyBIdWJDb25uZWN0aW9uQnVpbGRlciwgSHR0cFRyYW5zcG9ydFR5cGUgfSBmcm9tICdAYXNwbmV0L3NpZ25hbHInO1xuXG5jb25zdCBnZXREaXNwbGF5TmFtZSA9IENvbXBvbmVudCA9PiBDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWUgfHwgJ0NvbXBvbmVudCc7XG5cbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBodWJOYW1lID0gJycsXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcbiAgICBhY2Nlc3NUb2tlbiA9IG51bGwsXG4gICAgc2lnbmFsclBhdGggPSAnc2lnbmFscicsXG4gICAgcmV0cmllcyA9IDMsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB7IGNvbnRyb2xsZXIgPSBodWJOYW1lIH0gPSBvcHRpb25zO1xuXG4gIGNsYXNzIEluamVjdFNpZ25hbFIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgV3JhcHBlZENvbXBvbmVudCA9IFdyYXBwZWRDb21wb25lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgaHViOiBudWxsLFxuICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxuICAgICAgICBtb3JpYnVuZDogdW5kZWZpbmVkLFxuICAgICAgICByZXRyeTogMCxcbiAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLmh1YlByb3h5ID0ge1xuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXG4gICAgICAgIGludm9rZTogdGhpcy5pbnZva2VDb250cm9sbGVyLFxuICAgICAgICBhZGQ6IHRoaXMuYWRkVG9Hcm91cCxcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcbiAgICAgICAgY29ubmVjdGlvbklkOiB1bmRlZmluZWQsXG4gICAgICAgIHJlZ2lzdGVyOiB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHRoaXMuY3JlYXRlSHViKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmh1YikgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCBmYWxzZSk7XG4gICAgICAgIGlmIChuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB7IHBlbmRpbmcsIG1vcmlidW5kIH0gPSBuZXh0U3RhdGU7XG4gICAgICAgIGlmICghbW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3JpYnVuZCkge1xuICAgICAgICAgIG1vcmlidW5kID0gbW9yaWJ1bmQubWVyZ2VEZWVwKHRoaXMubW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vcmlidW5kQ291bnQgPSBtb3JpYnVuZC5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChtb3JpYnVuZENvdW50KSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWVyZ2VEZWVwKHRoaXMucGVuZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gcGVuZGluZy5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xuICAgIH1cblxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XG5cbiAgICBhZGRUb0dyb3VwID0gKGdyb3VwKSA9PiB7XG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgaHViLmludm9rZSgnYWRkVG9Hcm91cCcsIGdyb3VwKVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcbiAgICAgIGNvbnN0IHsgaHViIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICBodWIuaW52b2tlKCdyZW1vdmVGcm9tR3JvdXAnLCBncm91cClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSZW1vdmluZyBjbGllbnQgZnJvbSBncm91cCAke2dyb3VwfSBpbiAke2h1Yk5hbWV9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbmRUb0NvbnRyb2xsZXIgPSAodGFyZ2V0LCBkYXRhID0gbnVsbCkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5wcm9wcy5iYXNlVXJsfS8ke2NvbnRyb2xsZXJ9LyR7dGFyZ2V0fWA7XG4gICAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcbiAgICAgIHJldHVybiBheGlvcy5wb3N0KHVybCwgcGF5bG9hZClcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgaW52b2tlQ29udHJvbGxlciA9ICh0YXJnZXRNZXRob2QsIGRhdGEgPSBudWxsKSA9PiB7XG4gICAgICBjb25zdCB1cmxCYXNlID0gYCR7dGhpcy5wcm9wcy5iYXNlVXJsfS8ke2NvbnRyb2xsZXJ9LyR7dGFyZ2V0TWV0aG9kfWA7XG4gICAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xuICAgICAgcmV0dXJuIGF4aW9zLmdldCh1cmwpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMgY3JlYXRlSHViKGN1ckNyZWF0ZSkge1xuICAgICAgY29uc3QgeyByZXRyeSwgY3JlYXRlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKHJldHJ5ID4gcmV0cmllcykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogUmFuIG91dCBvZiByZXRyaWVzIGZvciBzdGFydGluZyAke2h1Yk5hbWV9IWApO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICByZXRyeTogMCxcbiAgICAgICAgICBjcmVhdGU6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKGJhc2VVcmwgJiYgaHViTmFtZSkge1xuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcbiAgICAgICAgICBpZiAoc2lnbmFsclBhdGgpIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke3NpZ25hbHJQYXRofWA7XG4gICAgICAgICAgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7aHViTmFtZX1gO1xuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoYWNjZXNzVG9rZW4pO1xuICAgICAgICAgIGlmICh0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vbGRUb2tlbiA9PT0gdGhpcy50b2tlbikge1xuICAgICAgICAgICAgICBpZiAoKGN1ckNyZWF0ZSB8fCBjcmVhdGUpID4gcmV0cmllcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogVW5hYmxlIHRvIGdldCB1cC10by1kYXRlIGFjY2VzcyB0b2tlbi4nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgIGh1YjogbnVsbCxcbiAgICAgICAgICAgICAgICAgIGNyZWF0ZTogKGN1ckNyZWF0ZSB8fCBjcmVhdGUpICsgMSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZygnc2tpcHBpbmcgbmVnb3RpYXRpb24nKTtcbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbkJ1aWxkZXIoKVxuICAgICAgICAgICAgLndpdGhVcmwoaHViQWRkcmVzcywge1xuICAgICAgICAgICAgICBza2lwTmVnb3RpYXRpb246IHRydWUsXG4gICAgICAgICAgICAgIHRyYW5zcG9ydDogSHR0cFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyxcbiAgICAgICAgICAgICAgYWNjZXNzVG9rZW5GYWN0b3J5OiAoKSA9PiB0aGlzLnRva2VuLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICAgIGh1Yi5vbmNsb3NlID0gdGhpcy5oYW5kbGVFcnJvcjtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGh1YixcbiAgICAgICAgICAgIHJldHJ5OiByZXRyeSArIDEsXG4gICAgICAgICAgICBjcmVhdGU6IDAsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydEh1YihodWIpIHtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgaHViLnN0YXJ0KClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcbiAgICAgICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgICAgICByZXRyeTogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgV2FybmluZzogRXJyb3Igd2hpbGUgZXN0YWJsaXNoaW5nIGNvbm5lY3Rpb24gdG8gaHViICR7aHViTmFtZX0uXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUVycm9yID0gKGVycikgPT4ge1xuICAgICAgY29uc3QgeyByZXNwb25zZSwgc3RhdHVzQ29kZSB9ID0gZXJyO1xuICAgICAgY29uc3QgeyBzdGF0dXMgfSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgc3dpdGNoIChzdGF0dXMgfHwgc3RhdHVzQ29kZSkge1xuICAgICAgICBjYXNlIDUwMDpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHRoaXMudG9rZW47IC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBodWI6IG51bGwgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHN0b3BIdWIoaHViLCBjbGVhcikge1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgICAvLyBDbGVhciBwZW5kaW5nXG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbUdyb3VwKCcnKTtcbiAgICAgICAgICAvLyBNZXJnZSBhY3RpdmUgdG8gcGVuZGluZ1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnN0YXRlLmFjdGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5tZXJnZURlZXAodGhpcy5zdGF0ZS5hY3RpdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaHViLnN0b3AoKTtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcbiAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlLCBtb3JpYnVuZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIG1vcmlidW5kIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ01vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdNb3JpYnVuZCA9IGV4aXN0aW5nTW9yaWJ1bmQuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XG4gICAgICAgIHRoaXMubW9yaWJ1bmQgPSByZW1haW5pbmdNb3JpYnVuZC5zaXplXG4gICAgICAgICAgPyB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgcmVtYWluaW5nTW9yaWJ1bmQpIDogdGhpcy5tb3JpYnVuZC5kZWxldGUobmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbGlzdGVuZXIgdG8gcGVuZGluZyBsaXN0ZW5lcnMgKGlmIGl0IGlzIE5PVCBhY3RpdmUpXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoIWV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCBleGlzdGluZ1BlbmRpbmcuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB1bnJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nUGVuZGluZyA9IGV4aXN0aW5nUGVuZGluZy5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gcmVtYWluaW5nUGVuZGluZy5jb3VudCgpXG4gICAgICAgICAgPyB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCByZW1haW5pbmdQZW5kaW5nKVxuICAgICAgICAgIDogdGhpcy5wZW5kaW5nLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBtb3JpYnVuZCBsaXN0ZW5lcnMgKGlmIGl0IGlzIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCBleGlzdGluZ01vcmlidW5kLmFkZChoYW5kbGVyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgIT09IHBlbmRpbmcgfHwgdGhpcy5tb3JpYnVuZCAhPT0gbW9yaWJ1bmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgIG1vcmlidW5kOiB0aGlzLm1vcmlidW5kLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBwZW5kaW5nUGFyYW0pIHtcbiAgICAgIGxldCBwZW5kaW5nID0gcGVuZGluZ1BhcmFtO1xuICAgICAgaWYgKGh1YiAmJiBwZW5kaW5nUGFyYW0pIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlLnJlZHVjZSh0aGlzLmNvdW50LCAwKSkge1xuICAgICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gZXhpc3RpbmdcbiAgICAgICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IGV4aXN0aW5nLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xuICAgICAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwZW5kaW5nLm1hcEVudHJpZXMoKFtuYW1lLCBoYW5kbGVyc10pID0+IGhhbmRsZXJzLm1hcChoYW5kbGVyID0+IGh1Yi5vbihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWVyZ2VEZWVwKHBlbmRpbmcpO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGVuZGluZztcbiAgICB9XG5cbiAgICBpbmFjdGl2YXRlTGlzdGVuZXJzKGh1YiwgbW9yaWJ1bmQpIHtcbiAgICAgIGlmIChodWIgJiYgbW9yaWJ1bmQpIHtcbiAgICAgICAgbW9yaWJ1bmQubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9mZihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbW92YWJsZSA9IG1vcmlidW5kLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSByZW1vdmFibGVcbiAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gcmVtb3ZhYmxlLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1vcmlidW5kO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMsIC4uLnBhc3NUaHJvdWdoUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBodWJQcm9wID0geyBbaHViTmFtZV06IHRoaXMuaHViUHJveHkgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxXcmFwcGVkQ29tcG9uZW50XG4gICAgICAgICAgey4uLnBhc3NUaHJvdWdoUHJvcHN9XG4gICAgICAgICAgey4uLmh1YlByb3B9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEluamVjdFNpZ25hbFIuZGlzcGxheU5hbWUgPSBgSW5qZWN0U2lnbmFsUigke2dldERpc3BsYXlOYW1lKFdyYXBwZWRDb21wb25lbnQpfSlgO1xuXG4gIEluamVjdFNpZ25hbFIucHJvcFR5cGVzID0ge1xuICAgIGJhc2VVcmw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBzaWduYWxyQWN0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGdldEFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0IGdldFZhbHVlRnJvbVN0YXRlID0gKHN0YXRlLCBzb3VyY2UpID0+IHtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNvdXJjZShzdGF0ZSk7XG4gICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSByZXR1cm4gc291cmNlO1xuICAgIHJldHVybiAnJztcbiAgfTtcblxuICBjb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSBkaXNwYXRjaCA9PiAoe1xuICAgIHNpZ25hbHJBY3Rpb25zOiBiaW5kQWN0aW9uQ3JlYXRvcnMoe1xuICAgICAgYWNjZXNzVG9rZW5GYWN0b3J5OiAoKSA9PiAoZGlzcGF0Y2hlciwgZ2V0U3RhdGUpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBnZXRTdGF0ZSgpO1xuICAgICAgICByZXR1cm4gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGFjY2Vzc1Rva2VuKTtcbiAgICAgIH0sXG4gICAgfSwgZGlzcGF0Y2gpLFxuICB9KTtcblxuICBjb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcbiAgICBjb25zdCBiYXNlVXJsID0gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGJhc2VBZGRyZXNzKTtcbiAgICByZXR1cm4geyBiYXNlVXJsIH07XG4gIH07XG5cbiAgcmV0dXJuIGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEluamVjdFNpZ25hbFIpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0U2lnbmFsUjtcbiJdfQ==