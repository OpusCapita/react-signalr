'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _signalr = require('@aspnet/signalr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
          return _axios2.default.post(url, payload).catch(function (err) {
            console.error('Error: Sending data to ' + controller + ' failed.\n\n' + err);
          });
        };

        _this.invokeController = function (targetMethod) {
          var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          var urlBase = _this.props.baseUrl + '/' + controller + '/' + targetMethod;
          var url = data ? urlBase + '/' + data : urlBase;
          return _axios2.default.get(url).catch(function (err) {
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
            moribund = this.moribund || (0, _immutable.Map)();
          } else if (this.moribund) {
            moribund = moribund.mergeDeep(this.moribund);
          }
          var moribundCount = moribund.reduce(this.count, 0);
          if (moribundCount) {
            this.moribund = this.inactivateListeners(this.state.hub, moribund);
          }
          if (!pending) {
            pending = this.pending || (0, _immutable.Map)();
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
                  hub = new _signalr.HubConnectionBuilder().withUrl(hubAddress, {
                    skipNegotiation: true,
                    transport: _signalr.HttpTransportType.WebSockets,
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

            if (!_this3.pending) _this3.pending = pending || (0, _immutable.Map)();
            if (!_this3.active) _this3.active = active || (0, _immutable.Map)();
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

            if (!this.active) this.active = active || (0, _immutable.Map)();
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

          if (!this.active) this.active = active || (0, _immutable.Map)();
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
        return _react2.default.createElement(WrappedComponent, _extends({}, passThroughProps, hubProp));
      };

      return InjectSignalR;
    }(_react2.default.PureComponent), _class.WrappedComponent = WrappedComponent, _temp);


    InjectSignalR.displayName = 'InjectSignalR(' + getDisplayName(WrappedComponent) + ')';

    var getValueFromState = function getValueFromState(state, source) {
      if (typeof source === 'function') return source(state);
      if (typeof source === 'string') return source;
      return '';
    };

    var mapDispatchToProps = function mapDispatchToProps(dispatch) {
      return {
        signalrActions: (0, _redux.bindActionCreators)({
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

    return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(InjectSignalR);
  };
};

exports.default = injectSignalR;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwic2VuZFRvQ29udHJvbGxlciIsInRhcmdldCIsImRhdGEiLCJ1cmwiLCJiYXNlVXJsIiwicGF5bG9hZCIsInRvSlMiLCJheGlvcyIsInBvc3QiLCJpbnZva2VDb250cm9sbGVyIiwidGFyZ2V0TWV0aG9kIiwidXJsQmFzZSIsImdldCIsImhhbmRsZUVycm9yIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwib2xkVG9rZW4iLCJ0b2tlbiIsInNldFN0YXRlIiwicmVnaXN0ZXJMaXN0ZW5lciIsImhhbmRsZXIiLCJwZW5kaW5nIiwiYWN0aXZlIiwibW9yaWJ1bmQiLCJleGlzdGluZ01vcmlidW5kIiwiZ2V0SW4iLCJoYXMiLCJyZW1haW5pbmdNb3JpYnVuZCIsImZpbHRlck5vdCIsImgiLCJzaXplIiwic2V0SW4iLCJkZWxldGUiLCJleGlzdGluZ0FjdGl2ZSIsImV4aXN0aW5nUGVuZGluZyIsImFkZCIsInVucmVnaXN0ZXJMaXN0ZW5lciIsInJlbWFpbmluZ1BlbmRpbmciLCJ1bmRlZmluZWQiLCJyZXRyeSIsImNyZWF0ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsImh1YlByb3h5Iiwic2VuZCIsInJlbW92ZSIsImNvbm5lY3Rpb25JZCIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZE1vdW50IiwiY3JlYXRlSHViIiwiY29tcG9uZW50V2lsbFVwZGF0ZSIsIm5leHRQcm9wcyIsIm5leHRTdGF0ZSIsInN0b3BIdWIiLCJzdGFydEh1YiIsIm1lcmdlRGVlcCIsIm1vcmlidW5kQ291bnQiLCJyZWR1Y2UiLCJpbmFjdGl2YXRlTGlzdGVuZXJzIiwicGVuZGluZ0NvdW50IiwiYWN0aXZhdGVMaXN0ZW5lcnMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImN1ckNyZWF0ZSIsInNpZ25hbHJBY3Rpb25zIiwiaHViQWRkcmVzcyIsImFjY2Vzc1Rva2VuRmFjdG9yeSIsIndhcm4iLCJsb2ciLCJIdWJDb25uZWN0aW9uQnVpbGRlciIsIndpdGhVcmwiLCJza2lwTmVnb3RpYXRpb24iLCJ0cmFuc3BvcnQiLCJIdHRwVHJhbnNwb3J0VHlwZSIsIldlYlNvY2tldHMiLCJidWlsZCIsIm9uY2xvc2UiLCJzdGFydCIsInRoZW4iLCJzdG9wIiwiY2xlYXIiLCJwZW5kaW5nUGFyYW0iLCJtYXBFbnRyaWVzIiwiY3VySGFuZGxlcnMiLCJleGlzdGluZyIsImhhbmRsZXJzIiwibWFwIiwib24iLCJvZmYiLCJyZW1vdmFibGUiLCJyZW5kZXIiLCJwYXNzVGhyb3VnaFByb3BzIiwiaHViUHJvcCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImdldFZhbHVlRnJvbVN0YXRlIiwic291cmNlIiwibWFwRGlzcGF0Y2hUb1Byb3BzIiwiZGlzcGF0Y2hlciIsImdldFN0YXRlIiwiZGlzcGF0Y2giLCJtYXBTdGF0ZVRvUHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixTQUFqQkEsY0FBaUI7QUFBQSxTQUFhQyxVQUFVQyxXQUFWLElBQXlCRCxVQUFVRSxJQUFuQyxJQUEy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T0EsT0FBT3pHLEtBQVAsQ0FBUDtBQUNsQyxVQUFJLE9BQU95RyxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDLE9BQU9BLE1BQVA7QUFDaEMsYUFBTyxFQUFQO0FBQ0QsS0FKRDs7QUFNQSxRQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQjtBQUFBLGFBQWE7QUFDdENqQyx3QkFBZ0IsK0JBQW1CO0FBQ2pDRSw4QkFBb0I7QUFBQSxtQkFBTSxVQUFDZ0MsVUFBRCxFQUFhQyxRQUFiLEVBQTBCO0FBQ2xELGtCQUFNNUcsUUFBUTRHLFVBQWQ7QUFDQSxxQkFBT0osa0JBQWtCeEcsS0FBbEIsRUFBeUJaLFdBQXpCLENBQVA7QUFDRCxhQUhtQjtBQUFBO0FBRGEsU0FBbkIsRUFLYnlILFFBTGE7QUFEc0IsT0FBYjtBQUFBLEtBQTNCOztBQVNBLFFBQU1DLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQzlHLEtBQUQsRUFBVztBQUNqQyxVQUFNYSxVQUFVMkYsa0JBQWtCeEcsS0FBbEIsRUFBeUJiLFdBQXpCLENBQWhCO0FBQ0EsYUFBTyxFQUFFMEIsZ0JBQUYsRUFBUDtBQUNELEtBSEQ7O0FBS0EsV0FBTyx5QkFBUWlHLGVBQVIsRUFBeUJKLGtCQUF6QixFQUE2Q2xILGFBQTdDLENBQVA7QUFDRCxHQXhYcUI7QUFBQSxDQUF0Qjs7a0JBMFhlVCxhIiwiZmlsZSI6ImluamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBNYXAsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgeyBIdWJDb25uZWN0aW9uQnVpbGRlciwgSHR0cFRyYW5zcG9ydFR5cGUgfSBmcm9tICdAYXNwbmV0L3NpZ25hbHInO1xuXG5jb25zdCBnZXREaXNwbGF5TmFtZSA9IENvbXBvbmVudCA9PiBDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWUgfHwgJ0NvbXBvbmVudCc7XG5cbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBodWJOYW1lID0gJycsXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcbiAgICBhY2Nlc3NUb2tlbiA9IG51bGwsXG4gICAgc2lnbmFsclBhdGggPSAnc2lnbmFscicsXG4gICAgcmV0cmllcyA9IDMsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB7IGNvbnRyb2xsZXIgPSBodWJOYW1lIH0gPSBvcHRpb25zO1xuXG4gIGNsYXNzIEluamVjdFNpZ25hbFIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgV3JhcHBlZENvbXBvbmVudCA9IFdyYXBwZWRDb21wb25lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgaHViOiBudWxsLFxuICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxuICAgICAgICBtb3JpYnVuZDogdW5kZWZpbmVkLFxuICAgICAgICByZXRyeTogMCxcbiAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLmh1YlByb3h5ID0ge1xuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXG4gICAgICAgIGludm9rZTogdGhpcy5pbnZva2VDb250cm9sbGVyLFxuICAgICAgICBhZGQ6IHRoaXMuYWRkVG9Hcm91cCxcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcbiAgICAgICAgY29ubmVjdGlvbklkOiB1bmRlZmluZWQsXG4gICAgICAgIHJlZ2lzdGVyOiB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHRoaXMuY3JlYXRlSHViKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmh1YikgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCBmYWxzZSk7XG4gICAgICAgIGlmIChuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB7IHBlbmRpbmcsIG1vcmlidW5kIH0gPSBuZXh0U3RhdGU7XG4gICAgICAgIGlmICghbW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3JpYnVuZCkge1xuICAgICAgICAgIG1vcmlidW5kID0gbW9yaWJ1bmQubWVyZ2VEZWVwKHRoaXMubW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vcmlidW5kQ291bnQgPSBtb3JpYnVuZC5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChtb3JpYnVuZENvdW50KSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWVyZ2VEZWVwKHRoaXMucGVuZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gcGVuZGluZy5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xuICAgIH1cblxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XG5cbiAgICBhZGRUb0dyb3VwID0gKGdyb3VwKSA9PiB7XG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgaHViLmludm9rZSgnYWRkVG9Hcm91cCcsIGdyb3VwKVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcbiAgICAgIGNvbnN0IHsgaHViIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICBodWIuaW52b2tlKCdyZW1vdmVGcm9tR3JvdXAnLCBncm91cClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSZW1vdmluZyBjbGllbnQgZnJvbSBncm91cCAke2dyb3VwfSBpbiAke2h1Yk5hbWV9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbmRUb0NvbnRyb2xsZXIgPSAodGFyZ2V0LCBkYXRhID0gbnVsbCkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5wcm9wcy5iYXNlVXJsfS8ke2NvbnRyb2xsZXJ9LyR7dGFyZ2V0fWA7XG4gICAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcbiAgICAgIHJldHVybiBheGlvcy5wb3N0KHVybCwgcGF5bG9hZClcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgaW52b2tlQ29udHJvbGxlciA9ICh0YXJnZXRNZXRob2QsIGRhdGEgPSBudWxsKSA9PiB7XG4gICAgICBjb25zdCB1cmxCYXNlID0gYCR7dGhpcy5wcm9wcy5iYXNlVXJsfS8ke2NvbnRyb2xsZXJ9LyR7dGFyZ2V0TWV0aG9kfWA7XG4gICAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xuICAgICAgcmV0dXJuIGF4aW9zLmdldCh1cmwpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMgY3JlYXRlSHViKGN1ckNyZWF0ZSkge1xuICAgICAgY29uc3QgeyByZXRyeSwgY3JlYXRlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKHJldHJ5ID4gcmV0cmllcykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogUmFuIG91dCBvZiByZXRyaWVzIGZvciBzdGFydGluZyAke2h1Yk5hbWV9IWApO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICByZXRyeTogMCxcbiAgICAgICAgICBjcmVhdGU6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKGJhc2VVcmwgJiYgaHViTmFtZSkge1xuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcbiAgICAgICAgICBpZiAoc2lnbmFsclBhdGgpIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke3NpZ25hbHJQYXRofWA7XG4gICAgICAgICAgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7aHViTmFtZX1gO1xuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoYWNjZXNzVG9rZW4pO1xuICAgICAgICAgIGlmICh0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vbGRUb2tlbiA9PT0gdGhpcy50b2tlbikge1xuICAgICAgICAgICAgICBpZiAoKGN1ckNyZWF0ZSB8fCBjcmVhdGUpID4gcmV0cmllcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogVW5hYmxlIHRvIGdldCB1cC10by1kYXRlIGFjY2VzcyB0b2tlbi4nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgIGh1YjogbnVsbCxcbiAgICAgICAgICAgICAgICAgIGNyZWF0ZTogKGN1ckNyZWF0ZSB8fCBjcmVhdGUpICsgMSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZygnc2tpcHBpbmcgbmVnb3RpYXRpb24nKTtcbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbkJ1aWxkZXIoKVxuICAgICAgICAgICAgLndpdGhVcmwoaHViQWRkcmVzcywge1xuICAgICAgICAgICAgICBza2lwTmVnb3RpYXRpb246IHRydWUsXG4gICAgICAgICAgICAgIHRyYW5zcG9ydDogSHR0cFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyxcbiAgICAgICAgICAgICAgYWNjZXNzVG9rZW5GYWN0b3J5OiAoKSA9PiB0aGlzLnRva2VuLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICAgIGh1Yi5vbmNsb3NlID0gdGhpcy5oYW5kbGVFcnJvcjtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGh1YixcbiAgICAgICAgICAgIHJldHJ5OiByZXRyeSArIDEsXG4gICAgICAgICAgICBjcmVhdGU6IDAsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGFydEh1YihodWIpIHtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgaHViLnN0YXJ0KClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcbiAgICAgICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgICAgICByZXRyeTogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgV2FybmluZzogRXJyb3Igd2hpbGUgZXN0YWJsaXNoaW5nIGNvbm5lY3Rpb24gdG8gaHViICR7aHViTmFtZX0uXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUVycm9yID0gKGVycikgPT4ge1xuICAgICAgY29uc3QgeyByZXNwb25zZSwgc3RhdHVzQ29kZSB9ID0gZXJyO1xuICAgICAgY29uc3QgeyBzdGF0dXMgfSA9IHJlc3BvbnNlIHx8IHt9O1xuICAgICAgc3dpdGNoIChzdGF0dXMgfHwgc3RhdHVzQ29kZSkge1xuICAgICAgICBjYXNlIDUwMDpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHRoaXMudG9rZW47IC8vIGZhbGwgdGhyb3VnaFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBodWI6IG51bGwgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHN0b3BIdWIoaHViLCBjbGVhcikge1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgICAvLyBDbGVhciBwZW5kaW5nXG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHRoaXMucmVtb3ZlRnJvbUdyb3VwKCcnKTtcbiAgICAgICAgICAvLyBNZXJnZSBhY3RpdmUgdG8gcGVuZGluZ1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnN0YXRlLmFjdGl2ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5tZXJnZURlZXAodGhpcy5zdGF0ZS5hY3RpdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaHViLnN0b3AoKTtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcbiAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlLCBtb3JpYnVuZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIG1vcmlidW5kIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ01vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdNb3JpYnVuZCA9IGV4aXN0aW5nTW9yaWJ1bmQuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XG4gICAgICAgIHRoaXMubW9yaWJ1bmQgPSByZW1haW5pbmdNb3JpYnVuZC5zaXplXG4gICAgICAgICAgPyB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgcmVtYWluaW5nTW9yaWJ1bmQpIDogdGhpcy5tb3JpYnVuZC5kZWxldGUobmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbGlzdGVuZXIgdG8gcGVuZGluZyBsaXN0ZW5lcnMgKGlmIGl0IGlzIE5PVCBhY3RpdmUpXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQWN0aXZlID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoIWV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCBleGlzdGluZ1BlbmRpbmcuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB1bnJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nUGVuZGluZy5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nUGVuZGluZyA9IGV4aXN0aW5nUGVuZGluZy5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gcmVtYWluaW5nUGVuZGluZy5jb3VudCgpXG4gICAgICAgICAgPyB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCByZW1haW5pbmdQZW5kaW5nKVxuICAgICAgICAgIDogdGhpcy5wZW5kaW5nLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBtb3JpYnVuZCBsaXN0ZW5lcnMgKGlmIGl0IGlzIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmIChleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vcmlidW5kKSB0aGlzLm1vcmlidW5kID0gbW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCBleGlzdGluZ01vcmlidW5kLmFkZChoYW5kbGVyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgIT09IHBlbmRpbmcgfHwgdGhpcy5tb3JpYnVuZCAhPT0gbW9yaWJ1bmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgIG1vcmlidW5kOiB0aGlzLm1vcmlidW5kLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBwZW5kaW5nUGFyYW0pIHtcbiAgICAgIGxldCBwZW5kaW5nID0gcGVuZGluZ1BhcmFtO1xuICAgICAgaWYgKGh1YiAmJiBwZW5kaW5nUGFyYW0pIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlLnJlZHVjZSh0aGlzLmNvdW50LCAwKSkge1xuICAgICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJzID0gZXhpc3RpbmdcbiAgICAgICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IGV4aXN0aW5nLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xuICAgICAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwZW5kaW5nLm1hcEVudHJpZXMoKFtuYW1lLCBoYW5kbGVyc10pID0+IGhhbmRsZXJzLm1hcChoYW5kbGVyID0+IGh1Yi5vbihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWVyZ2VEZWVwKHBlbmRpbmcpO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGVuZGluZztcbiAgICB9XG5cbiAgICBpbmFjdGl2YXRlTGlzdGVuZXJzKGh1YiwgbW9yaWJ1bmQpIHtcbiAgICAgIGlmIChodWIgJiYgbW9yaWJ1bmQpIHtcbiAgICAgICAgbW9yaWJ1bmQubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9mZihuYW1lLCBoYW5kbGVyKSkpO1xuICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbW92YWJsZSA9IG1vcmlidW5kLmdldEluKFtuYW1lXSk7XG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSByZW1vdmFibGVcbiAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gcmVtb3ZhYmxlLmhhcyhoYW5kbGVyKSlcbiAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1vcmlidW5kO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMsIC4uLnBhc3NUaHJvdWdoUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBodWJQcm9wID0geyBbaHViTmFtZV06IHRoaXMuaHViUHJveHkgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxXcmFwcGVkQ29tcG9uZW50XG4gICAgICAgICAgey4uLnBhc3NUaHJvdWdoUHJvcHN9XG4gICAgICAgICAgey4uLmh1YlByb3B9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEluamVjdFNpZ25hbFIuZGlzcGxheU5hbWUgPSBgSW5qZWN0U2lnbmFsUigke2dldERpc3BsYXlOYW1lKFdyYXBwZWRDb21wb25lbnQpfSlgO1xuXG4gIEluamVjdFNpZ25hbFIucHJvcFR5cGVzID0ge1xuICAgIGJhc2VVcmw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBzaWduYWxyQWN0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGdldEFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9KS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0IGdldFZhbHVlRnJvbVN0YXRlID0gKHN0YXRlLCBzb3VyY2UpID0+IHtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNvdXJjZShzdGF0ZSk7XG4gICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSByZXR1cm4gc291cmNlO1xuICAgIHJldHVybiAnJztcbiAgfTtcblxuICBjb25zdCBtYXBEaXNwYXRjaFRvUHJvcHMgPSBkaXNwYXRjaCA9PiAoe1xuICAgIHNpZ25hbHJBY3Rpb25zOiBiaW5kQWN0aW9uQ3JlYXRvcnMoe1xuICAgICAgYWNjZXNzVG9rZW5GYWN0b3J5OiAoKSA9PiAoZGlzcGF0Y2hlciwgZ2V0U3RhdGUpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBnZXRTdGF0ZSgpO1xuICAgICAgICByZXR1cm4gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGFjY2Vzc1Rva2VuKTtcbiAgICAgIH0sXG4gICAgfSwgZGlzcGF0Y2gpLFxuICB9KTtcblxuICBjb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSAoc3RhdGUpID0+IHtcbiAgICBjb25zdCBiYXNlVXJsID0gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGJhc2VBZGRyZXNzKTtcbiAgICByZXR1cm4geyBiYXNlVXJsIH07XG4gIH07XG5cbiAgcmV0dXJuIGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMpKEluamVjdFNpZ25hbFIpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0U2lnbmFsUjtcbiJdfQ==