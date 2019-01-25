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
                  hub = new _signalr.HubConnectionBuilder().withUrl(hubAddress, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwic2VuZFRvQ29udHJvbGxlciIsInRhcmdldCIsImRhdGEiLCJ1cmwiLCJiYXNlVXJsIiwicGF5bG9hZCIsInRvSlMiLCJheGlvcyIsInBvc3QiLCJpbnZva2VDb250cm9sbGVyIiwidGFyZ2V0TWV0aG9kIiwidXJsQmFzZSIsImdldCIsImhhbmRsZUVycm9yIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwib2xkVG9rZW4iLCJ0b2tlbiIsInNldFN0YXRlIiwicmVnaXN0ZXJMaXN0ZW5lciIsImhhbmRsZXIiLCJwZW5kaW5nIiwiYWN0aXZlIiwibW9yaWJ1bmQiLCJleGlzdGluZ01vcmlidW5kIiwiZ2V0SW4iLCJoYXMiLCJyZW1haW5pbmdNb3JpYnVuZCIsImZpbHRlck5vdCIsImgiLCJzaXplIiwic2V0SW4iLCJkZWxldGUiLCJleGlzdGluZ0FjdGl2ZSIsImV4aXN0aW5nUGVuZGluZyIsImFkZCIsInVucmVnaXN0ZXJMaXN0ZW5lciIsInJlbWFpbmluZ1BlbmRpbmciLCJ1bmRlZmluZWQiLCJyZXRyeSIsImNyZWF0ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsImh1YlByb3h5Iiwic2VuZCIsInJlbW92ZSIsImNvbm5lY3Rpb25JZCIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZE1vdW50IiwiY3JlYXRlSHViIiwiY29tcG9uZW50V2lsbFVwZGF0ZSIsIm5leHRQcm9wcyIsIm5leHRTdGF0ZSIsInN0b3BIdWIiLCJzdGFydEh1YiIsIm1lcmdlRGVlcCIsIm1vcmlidW5kQ291bnQiLCJyZWR1Y2UiLCJpbmFjdGl2YXRlTGlzdGVuZXJzIiwicGVuZGluZ0NvdW50IiwiYWN0aXZhdGVMaXN0ZW5lcnMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImN1ckNyZWF0ZSIsInNpZ25hbHJBY3Rpb25zIiwiaHViQWRkcmVzcyIsImFjY2Vzc1Rva2VuRmFjdG9yeSIsIndhcm4iLCJIdWJDb25uZWN0aW9uQnVpbGRlciIsIndpdGhVcmwiLCJ0cmFuc3BvcnQiLCJIdHRwVHJhbnNwb3J0VHlwZSIsIldlYlNvY2tldHMiLCJidWlsZCIsIm9uY2xvc2UiLCJzdGFydCIsInRoZW4iLCJzdG9wIiwiY2xlYXIiLCJwZW5kaW5nUGFyYW0iLCJtYXBFbnRyaWVzIiwiY3VySGFuZGxlcnMiLCJleGlzdGluZyIsImhhbmRsZXJzIiwibWFwIiwib24iLCJvZmYiLCJyZW1vdmFibGUiLCJyZW5kZXIiLCJwYXNzVGhyb3VnaFByb3BzIiwiaHViUHJvcCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImdldFZhbHVlRnJvbVN0YXRlIiwic291cmNlIiwibWFwRGlzcGF0Y2hUb1Byb3BzIiwiZGlzcGF0Y2hlciIsImdldFN0YXRlIiwiZGlzcGF0Y2giLCJtYXBTdGF0ZVRvUHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixTQUFqQkEsY0FBaUI7QUFBQSxTQUFhQyxVQUFVQyxXQUFWLElBQXlCRCxVQUFVRSxJQUFuQyxJQUEyQyxXQUF4RDtBQUFBLENBQXZCOztBQUVB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Q2hDLGFBQU8sRUFBUDtBQUNELEtBSkQ7O0FBTUEsUUFBTUMscUJBQXFCLFNBQXJCQSxrQkFBcUI7QUFBQSxhQUFhO0FBQ3RDL0Isd0JBQWdCLCtCQUFtQjtBQUNqQ0UsOEJBQW9CO0FBQUEsbUJBQU0sVUFBQzhCLFVBQUQsRUFBYUMsUUFBYixFQUEwQjtBQUNsRCxrQkFBTTFHLFFBQVEwRyxVQUFkO0FBQ0EscUJBQU9KLGtCQUFrQnRHLEtBQWxCLEVBQXlCWixXQUF6QixDQUFQO0FBQ0QsYUFIbUI7QUFBQTtBQURhLFNBQW5CLEVBS2J1SCxRQUxhO0FBRHNCLE9BQWI7QUFBQSxLQUEzQjs7QUFTQSxRQUFNQyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUM1RyxLQUFELEVBQVc7QUFDakMsVUFBTWEsVUFBVXlGLGtCQUFrQnRHLEtBQWxCLEVBQXlCYixXQUF6QixDQUFoQjtBQUNBLGFBQU8sRUFBRTBCLGdCQUFGLEVBQVA7QUFDRCxLQUhEOztBQUtBLFdBQU8seUJBQVErRixlQUFSLEVBQXlCSixrQkFBekIsRUFBNkNoSCxhQUE3QyxDQUFQO0FBQ0QsR0F0WHFCO0FBQUEsQ0FBdEI7O2tCQXdYZVQsYSIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgTWFwLCBTZXQgfSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHsgSHViQ29ubmVjdGlvbkJ1aWxkZXIsIEh0dHBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyJztcblxuY29uc3QgZ2V0RGlzcGxheU5hbWUgPSBDb21wb25lbnQgPT4gQ29tcG9uZW50LmRpc3BsYXlOYW1lIHx8IENvbXBvbmVudC5uYW1lIHx8ICdDb21wb25lbnQnO1xuXG5jb25zdCBpbmplY3RTaWduYWxSID0gb3B0aW9ucyA9PiAoV3JhcHBlZENvbXBvbmVudCkgPT4ge1xuICBjb25zdCB7XG4gICAgaHViTmFtZSA9ICcnLFxuICAgIGJhc2VBZGRyZXNzID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6NTU1NScsXG4gICAgYWNjZXNzVG9rZW4gPSBudWxsLFxuICAgIHNpZ25hbHJQYXRoID0gJ3NpZ25hbHInLFxuICAgIHJldHJpZXMgPSAzLFxuICB9ID0gb3B0aW9ucztcbiAgY29uc3QgeyBjb250cm9sbGVyID0gaHViTmFtZSB9ID0gb3B0aW9ucztcblxuICBjbGFzcyBJbmplY3RTaWduYWxSIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIFdyYXBwZWRDb21wb25lbnQgPSBXcmFwcGVkQ29tcG9uZW50O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGh1YjogbnVsbCxcbiAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxuICAgICAgICBhY3RpdmU6IHVuZGVmaW5lZCxcbiAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgcmV0cnk6IDAsXG4gICAgICAgIGNyZWF0ZTogMCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgdGhpcy5odWJQcm94eSA9IHtcbiAgICAgICAgc2VuZDogdGhpcy5zZW5kVG9Db250cm9sbGVyLFxuICAgICAgICBpbnZva2U6IHRoaXMuaW52b2tlQ29udHJvbGxlcixcbiAgICAgICAgYWRkOiB0aGlzLmFkZFRvR3JvdXAsXG4gICAgICAgIHJlbW92ZTogdGhpcy5yZW1vdmVGcm9tR3JvdXAsXG4gICAgICAgIGNvbm5lY3Rpb25JZDogdW5kZWZpbmVkLFxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgICB1bnJlZ2lzdGVyOiB0aGlzLnVucmVnaXN0ZXJMaXN0ZW5lcixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmh1YiAhPT0gbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5odWIpIHRoaXMuc3RvcEh1Yih0aGlzLnN0YXRlLmh1YiwgZmFsc2UpO1xuICAgICAgICBpZiAobmV4dFN0YXRlLmh1Yikge1xuICAgICAgICAgIHRoaXMuc3RhcnRIdWIobmV4dFN0YXRlLmh1Yik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIW5leHRTdGF0ZS5odWIpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgeyBwZW5kaW5nLCBtb3JpYnVuZCB9ID0gbmV4dFN0YXRlO1xuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XG4gICAgICAgICAgbW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb3JpYnVuZENvdW50ID0gbW9yaWJ1bmQucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLmluYWN0aXZhdGVMaXN0ZW5lcnModGhpcy5zdGF0ZS5odWIsIG1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcbiAgICAgICAgICBwZW5kaW5nID0gdGhpcy5wZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IHBlbmRpbmcucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5hY3RpdmF0ZUxpc3RlbmVycyhuZXh0U3RhdGUuaHViLCBwZW5kaW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjb3VudCA9IChjLCBzKSA9PiBjICsgcy5jb3VudCgpO1xuXG4gICAgYWRkVG9Hcm91cCA9IChncm91cCkgPT4ge1xuICAgICAgY29uc3QgeyBodWIgfSA9IHRoaXMuc3RhdGU7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbiB9ID0gaHViO1xuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xuICAgICAgICAgIGh1Yi5pbnZva2UoJ2FkZFRvR3JvdXAnLCBncm91cClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBBZGRpbmcgY2xpZW50IHRvIGdyb3VwICR7Z3JvdXB9IGluICR7aHViTmFtZX0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVtb3ZlRnJvbUdyb3VwID0gKGdyb3VwKSA9PiB7XG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgaHViLmludm9rZSgncmVtb3ZlRnJvbUdyb3VwJywgZ3JvdXApXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogUmVtb3ZpbmcgY2xpZW50IGZyb20gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBzZW5kVG9Db250cm9sbGVyID0gKHRhcmdldCwgZGF0YSA9IG51bGwpID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xuICAgICAgY29uc3QgcGF5bG9hZCA9IGRhdGEgPyBkYXRhLnRvSlMoKSA6IG51bGw7XG4gICAgICByZXR1cm4gYXhpb3MucG9zdCh1cmwsIHBheWxvYWQpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFNlbmRpbmcgZGF0YSB0byAke2NvbnRyb2xsZXJ9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGludm9rZUNvbnRyb2xsZXIgPSAodGFyZ2V0TWV0aG9kLCBkYXRhID0gbnVsbCkgPT4ge1xuICAgICAgY29uc3QgdXJsQmFzZSA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldE1ldGhvZH1gO1xuICAgICAgY29uc3QgdXJsID0gZGF0YSA/IGAke3VybEJhc2V9LyR7ZGF0YX1gIDogdXJsQmFzZTtcbiAgICAgIHJldHVybiBheGlvcy5nZXQodXJsKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBJbnZva2luZyAke2NvbnRyb2xsZXJ9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jIGNyZWF0ZUh1YihjdXJDcmVhdGUpIHtcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChyZXRyeSA+IHJldHJpZXMpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFJhbiBvdXQgb2YgcmV0cmllcyBmb3Igc3RhcnRpbmcgJHtodWJOYW1lfSFgKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcmV0cnk6IDAsXG4gICAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChiYXNlVXJsICYmIGh1Yk5hbWUpIHtcbiAgICAgICAgICBsZXQgaHViQWRkcmVzcyA9IGJhc2VVcmw7XG4gICAgICAgICAgaWYgKHNpZ25hbHJQYXRoKSBodWJBZGRyZXNzID0gYCR7aHViQWRkcmVzc30vJHtzaWduYWxyUGF0aH1gO1xuICAgICAgICAgIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke2h1Yk5hbWV9YDtcbiAgICAgICAgICB0aGlzLnRva2VuID0gc2lnbmFsckFjdGlvbnMuYWNjZXNzVG9rZW5GYWN0b3J5KGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgICAgaWYgKChjdXJDcmVhdGUgfHwgY3JlYXRlKSA+IHJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IFVuYWJsZSB0byBnZXQgdXAtdG8tZGF0ZSBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICBodWI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHViID0gbmV3IEh1YkNvbm5lY3Rpb25CdWlsZGVyKClcbiAgICAgICAgICAgIC53aXRoVXJsKGh1YkFkZHJlc3MsIHtcbiAgICAgICAgICAgICAgdHJhbnNwb3J0OiBIdHRwVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzLFxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IHRoaXMudG9rZW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmJ1aWxkKCk7XG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaHViLFxuICAgICAgICAgICAgcmV0cnk6IHJldHJ5ICsgMSxcbiAgICAgICAgICAgIGNyZWF0ZTogMCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0SHViKGh1Yikge1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBodWIuc3RhcnQoKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgICAgIHJldHJ5OiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIGh1Yi5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlLCBzdGF0dXNDb2RlIH0gPSBlcnI7XG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XG4gICAgICBzd2l0Y2ggKHN0YXR1cyB8fCBzdGF0dXNDb2RlKSB7XG4gICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwMTpcbiAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdGhpcy50b2tlbjsgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGlmIChjbGVhcikge1xuICAgICAgICAgIC8vIENsZWFyIHBlbmRpbmdcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5yZW1vdmVGcm9tR3JvdXAoJycpO1xuICAgICAgICAgIC8vIE1lcmdlIGFjdGl2ZSB0byBwZW5kaW5nXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMucGVuZGluZykge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMuc3RhdGUuYWN0aXZlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5wZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnN0YXRlLmFjdGl2ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gbW9yaWJ1bmQgbGlzdGVuZXJzXG4gICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ01vcmlidW5kID0gZXhpc3RpbmdNb3JpYnVuZC5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHJlbWFpbmluZ01vcmlidW5kLnNpemVcbiAgICAgICAgICA/IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCByZW1haW5pbmdNb3JpYnVuZCkgOiB0aGlzLm1vcmlidW5kLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBwZW5kaW5nIGxpc3RlbmVycyAoaWYgaXQgaXMgTk9UIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmICghZXhpc3RpbmdBY3RpdmUuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIGV4aXN0aW5nUGVuZGluZy5hZGQoaGFuZGxlcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcbiAgICAgICAgICBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHVucmVnaXN0ZXJMaXN0ZW5lciA9IChuYW1lLCBoYW5kbGVyKSA9PiB7XG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdQZW5kaW5nID0gZXhpc3RpbmdQZW5kaW5nLmZpbHRlck5vdChoID0+IGggPT09IGhhbmRsZXIpO1xuICAgICAgICB0aGlzLnBlbmRpbmcgPSByZW1haW5pbmdQZW5kaW5nLmNvdW50KClcbiAgICAgICAgICA/IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ1BlbmRpbmcpXG4gICAgICAgICAgOiB0aGlzLnBlbmRpbmcuZGVsZXRlKG5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIG1vcmlidW5kIGxpc3RlbmVycyAoaWYgaXQgaXMgYWN0aXZlKVxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ0FjdGl2ZSA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLm1vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIGV4aXN0aW5nTW9yaWJ1bmQuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhY3RpdmF0ZUxpc3RlbmVycyhodWIsIHBlbmRpbmdQYXJhbSkge1xuICAgICAgbGV0IHBlbmRpbmcgPSBwZW5kaW5nUGFyYW07XG4gICAgICBpZiAoaHViICYmIHBlbmRpbmdQYXJhbSkge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmUucmVkdWNlKHRoaXMuY291bnQsIDApKSB7XG4gICAgICAgICAgICBwZW5kaW5nID0gcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBleGlzdGluZ1xuICAgICAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gZXhpc3RpbmcuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9uKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tZXJnZURlZXAocGVuZGluZyk7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwZW5kaW5nO1xuICAgIH1cblxuICAgIGluYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBtb3JpYnVuZCkge1xuICAgICAgaWYgKGh1YiAmJiBtb3JpYnVuZCkge1xuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub2ZmKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgIGNvbnN0IHsgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZhYmxlID0gbW9yaWJ1bmQuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IHJlbW92YWJsZVxuICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiByZW1vdmFibGUuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgOiBjdXJIYW5kbGVycztcbiAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW9yaWJ1bmQ7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucywgLi4ucGFzc1Rocm91Z2hQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFdyYXBwZWRDb21wb25lbnRcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cbiAgICAgICAgICB7Li4uaHViUHJvcH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgSW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZSA9IGBJbmplY3RTaWduYWxSKCR7Z2V0RGlzcGxheU5hbWUoV3JhcHBlZENvbXBvbmVudCl9KWA7XG5cbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XG4gICAgYmFzZVVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHNpZ25hbHJBY3Rpb25zOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxuICAgIH0pLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3QgZ2V0VmFsdWVGcm9tU3RhdGUgPSAoc3RhdGUsIHNvdXJjZSkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gc291cmNlKHN0YXRlKTtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHJldHVybiBzb3VyY2U7XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IGRpc3BhdGNoID0+ICh7XG4gICAgc2lnbmFsckFjdGlvbnM6IGJpbmRBY3Rpb25DcmVhdG9ycyh7XG4gICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IChkaXNwYXRjaGVyLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGdldFN0YXRlKCk7XG4gICAgICAgIHJldHVybiBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYWNjZXNzVG9rZW4pO1xuICAgICAgfSxcbiAgICB9LCBkaXNwYXRjaCksXG4gIH0pO1xuXG4gIGNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYmFzZUFkZHJlc3MpO1xuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcbiAgfTtcblxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmplY3RTaWduYWxSO1xuIl19