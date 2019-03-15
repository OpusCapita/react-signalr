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
              return hub.invoke('removeFromGroup', group).catch(function (err) {
                console.error('Error: Removing client from group ' + group + ' in ' + hubName + ' failed.\n\n' + err);
              });
            }
          }
          return Promise.resolve();
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
          var promises = [];

          if (clear) {
            // Clear pending
            this.pending = undefined;
            promises.push(this.removeFromGroup(''));
            // Merge active to pending
          } else if (!this.pending) {
            this.pending = this.state.active;
          } else if (this.state.active) {
            this.pending = this.pending.mergeDeep(this.state.active);
          }

          Promise.all(promises).then(function () {
            hub.stop();
          });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZW5kVG9Db250cm9sbGVyIiwidGFyZ2V0IiwiZGF0YSIsInVybCIsImJhc2VVcmwiLCJwYXlsb2FkIiwidG9KUyIsImF4aW9zIiwicG9zdCIsImludm9rZUNvbnRyb2xsZXIiLCJ0YXJnZXRNZXRob2QiLCJ1cmxCYXNlIiwiZ2V0IiwiaGFuZGxlRXJyb3IiLCJyZXNwb25zZSIsInN0YXR1c0NvZGUiLCJzdGF0dXMiLCJvbGRUb2tlbiIsInRva2VuIiwic2V0U3RhdGUiLCJyZWdpc3Rlckxpc3RlbmVyIiwiaGFuZGxlciIsInBlbmRpbmciLCJhY3RpdmUiLCJtb3JpYnVuZCIsImV4aXN0aW5nTW9yaWJ1bmQiLCJnZXRJbiIsImhhcyIsInJlbWFpbmluZ01vcmlidW5kIiwiZmlsdGVyTm90IiwiaCIsInNpemUiLCJzZXRJbiIsImRlbGV0ZSIsImV4aXN0aW5nQWN0aXZlIiwiZXhpc3RpbmdQZW5kaW5nIiwiYWRkIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwicmVtYWluaW5nUGVuZGluZyIsInVuZGVmaW5lZCIsInJldHJ5IiwiY3JlYXRlIiwiY29tcG9uZW50V2lsbE1vdW50IiwiaHViUHJveHkiLCJzZW5kIiwicmVtb3ZlIiwiY29ubmVjdGlvbklkIiwicmVnaXN0ZXIiLCJ1bnJlZ2lzdGVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJjcmVhdGVIdWIiLCJjb21wb25lbnRXaWxsVXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwic3RvcEh1YiIsInN0YXJ0SHViIiwibWVyZ2VEZWVwIiwibW9yaWJ1bmRDb3VudCIsInJlZHVjZSIsImluYWN0aXZhdGVMaXN0ZW5lcnMiLCJwZW5kaW5nQ291bnQiLCJhY3RpdmF0ZUxpc3RlbmVycyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY3VyQ3JlYXRlIiwic2lnbmFsckFjdGlvbnMiLCJodWJBZGRyZXNzIiwiYWNjZXNzVG9rZW5GYWN0b3J5Iiwid2FybiIsIkh1YkNvbm5lY3Rpb25CdWlsZGVyIiwid2l0aFVybCIsInNraXBOZWdvdGlhdGlvbiIsInRyYW5zcG9ydCIsIkh0dHBUcmFuc3BvcnRUeXBlIiwiV2ViU29ja2V0cyIsImJ1aWxkIiwib25jbG9zZSIsInN0YXJ0IiwidGhlbiIsInN0b3AiLCJjbGVhciIsInByb21pc2VzIiwicHVzaCIsImFsbCIsInBlbmRpbmdQYXJhbSIsIm1hcEVudHJpZXMiLCJjdXJIYW5kbGVycyIsImV4aXN0aW5nIiwiaGFuZGxlcnMiLCJtYXAiLCJvbiIsIm9mZiIsInJlbW92YWJsZSIsInJlbmRlciIsInBhc3NUaHJvdWdoUHJvcHMiLCJodWJQcm9wIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZ2V0VmFsdWVGcm9tU3RhdGUiLCJzb3VyY2UiLCJtYXBEaXNwYXRjaFRvUHJvcHMiLCJkaXNwYXRjaGVyIiwiZ2V0U3RhdGUiLCJkaXNwYXRjaCIsIm1hcFN0YXRlVG9Qcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsaUJBQWlCLFNBQWpCQSxjQUFpQjtBQUFBLFNB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QVh5Qjs7O0FBK1ZyRFEsa0JBQWNYLFdBQWQsc0JBQTZDRixlQUFlSyxnQkFBZixDQUE3Qzs7QUFTQSxRQUFNNEgsb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBQzVHLEtBQUQsRUFBUTZHLE1BQVIsRUFBbUI7QUFDM0MsVUFBSSxPQUFPQSxNQUFQLEtBQWtCLFVBQXRCLEVBQWtDLE9BQU9BLE9BQU83RyxLQUFQLENBQVA7QUFDbEMsVUFBSSxPQUFPNkcsTUFBUCxLQUFrQixRQUF0QixFQUFnQyxPQUFPQSxNQUFQO0FBQ2hDLGFBQU8sRUFBUDtBQUNELEtBSkQ7O0FBTUEsUUFBTUMscUJBQXFCLFNBQXJCQSxrQkFBcUI7QUFBQSxhQUFhO0FBQ3RDbkMsd0JBQWdCLCtCQUFtQjtBQUNqQ0UsOEJBQW9CO0FBQUEsbUJBQU0sVUFBQ2tDLFVBQUQsRUFBYUMsUUFBYixFQUEwQjtBQUNsRCxrQkFBTWhILFFBQVFnSCxVQUFkO0FBQ0EscUJBQU9KLGtCQUFrQjVHLEtBQWxCLEVBQXlCWixXQUF6QixDQUFQO0FBQ0QsYUFIbUI7QUFBQTtBQURhLFNBQW5CLEVBS2I2SCxRQUxhO0FBRHNCLE9BQWI7QUFBQSxLQUEzQjs7QUFTQSxRQUFNQyxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNsSCxLQUFELEVBQVc7QUFDakMsVUFBTWUsVUFBVTZGLGtCQUFrQjVHLEtBQWxCLEVBQXlCYixXQUF6QixDQUFoQjtBQUNBLGFBQU8sRUFBRTRCLGdCQUFGLEVBQVA7QUFDRCxLQUhEOztBQUtBLFdBQU8seUJBQVFtRyxlQUFSLEVBQXlCSixrQkFBekIsRUFBNkN0SCxhQUE3QyxDQUFQO0FBQ0QsR0E3WHFCO0FBQUEsQ0FBdEI7O2tCQStYZVQsYSIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XHJcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XHJcbmltcG9ydCB7IE1hcCwgU2V0IH0gZnJvbSAnaW1tdXRhYmxlJztcclxuaW1wb3J0IHsgSHViQ29ubmVjdGlvbkJ1aWxkZXIsIEh0dHBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyJztcclxuXHJcbmNvbnN0IGdldERpc3BsYXlOYW1lID0gQ29tcG9uZW50ID0+IENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQubmFtZSB8fCAnQ29tcG9uZW50JztcclxuXHJcbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XHJcbiAgY29uc3Qge1xyXG4gICAgaHViTmFtZSA9ICcnLFxyXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcclxuICAgIGFjY2Vzc1Rva2VuID0gbnVsbCxcclxuICAgIHNpZ25hbHJQYXRoID0gJ3NpZ25hbHInLFxyXG4gICAgcmV0cmllcyA9IDMsXHJcbiAgfSA9IG9wdGlvbnM7XHJcbiAgY29uc3QgeyBjb250cm9sbGVyID0gaHViTmFtZSB9ID0gb3B0aW9ucztcclxuXHJcbiAgY2xhc3MgSW5qZWN0U2lnbmFsUiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xyXG4gICAgc3RhdGljIFdyYXBwZWRDb21wb25lbnQgPSBXcmFwcGVkQ29tcG9uZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICBodWI6IG51bGwsXHJcbiAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxyXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXHJcbiAgICAgICAgcmV0cnk6IDAsXHJcbiAgICAgICAgY3JlYXRlOiAwLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcclxuICAgICAgdGhpcy5odWJQcm94eSA9IHtcclxuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZUNvbnRyb2xsZXIsXHJcbiAgICAgICAgYWRkOiB0aGlzLmFkZFRvR3JvdXAsXHJcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcclxuICAgICAgICBjb25uZWN0aW9uSWQ6IHVuZGVmaW5lZCxcclxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaHViKSB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIGZhbHNlKTtcclxuICAgICAgICBpZiAobmV4dFN0YXRlLmh1Yikge1xyXG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHsgcGVuZGluZywgbW9yaWJ1bmQgfSA9IG5leHRTdGF0ZTtcclxuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbW9yaWJ1bmRDb3VudCA9IG1vcmlidW5kLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xyXG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwZW5kaW5nQ291bnQgPSBwZW5kaW5nLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XHJcblxyXG4gICAgYWRkVG9Hcm91cCA9IChncm91cCkgPT4ge1xyXG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKGh1Yikge1xyXG4gICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbiB9ID0gaHViO1xyXG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICBodWIuaW52b2tlKCdhZGRUb0dyb3VwJywgZ3JvdXApXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcclxuICAgICAgY29uc3QgeyBodWIgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgcmV0dXJuIGh1Yi5pbnZva2UoJ3JlbW92ZUZyb21Hcm91cCcsIGdyb3VwKVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSZW1vdmluZyBjbGllbnQgZnJvbSBncm91cCAke2dyb3VwfSBpbiAke2h1Yk5hbWV9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgc2VuZFRvQ29udHJvbGxlciA9ICh0YXJnZXQsIGRhdGEgPSBudWxsKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xyXG4gICAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcclxuICAgICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBwYXlsb2FkKVxyXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbnZva2VDb250cm9sbGVyID0gKHRhcmdldE1ldGhvZCwgZGF0YSA9IG51bGwpID0+IHtcclxuICAgICAgY29uc3QgdXJsQmFzZSA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldE1ldGhvZH1gO1xyXG4gICAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xyXG4gICAgICByZXR1cm4gYXhpb3MuZ2V0KHVybClcclxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhc3luYyBjcmVhdGVIdWIoY3VyQ3JlYXRlKSB7XHJcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKHJldHJ5ID4gcmV0cmllcykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSYW4gb3V0IG9mIHJldHJpZXMgZm9yIHN0YXJ0aW5nICR7aHViTmFtZX0hYCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICByZXRyeTogMCxcclxuICAgICAgICAgIGNyZWF0ZTogMCxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xyXG4gICAgICAgIGlmIChiYXNlVXJsICYmIGh1Yk5hbWUpIHtcclxuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcclxuICAgICAgICAgIGlmIChzaWduYWxyUGF0aCkgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7c2lnbmFsclBhdGh9YDtcclxuICAgICAgICAgIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke2h1Yk5hbWV9YDtcclxuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgICBpZiAoKGN1ckNyZWF0ZSB8fCBjcmVhdGUpID4gcmV0cmllcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmFibGUgdG8gZ2V0IHVwLXRvLWRhdGUgYWNjZXNzIHRva2VuLicpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgaHViOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbkJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAud2l0aFVybChodWJBZGRyZXNzLCB7XHJcbiAgICAgICAgICAgICAgc2tpcE5lZ290aWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHRyYW5zcG9ydDogSHR0cFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyxcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IHRoaXMudG9rZW4sXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5idWlsZCgpO1xyXG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIGh1YixcclxuICAgICAgICAgICAgcmV0cnk6IHJldHJ5ICsgMSxcclxuICAgICAgICAgICAgY3JlYXRlOiAwLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRIdWIoaHViKSB7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBodWIuc3RhcnQoKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxyXG4gICAgICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcclxuICAgICAgICAgICAgICByZXRyeTogMCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcclxuICAgICAgICAgICAgaHViLnN0b3AoKTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVFcnJvciA9IChlcnIpID0+IHtcclxuICAgICAgY29uc3QgeyByZXNwb25zZSwgc3RhdHVzQ29kZSB9ID0gZXJyO1xyXG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XHJcbiAgICAgIHN3aXRjaCAoc3RhdHVzIHx8IHN0YXR1c0NvZGUpIHtcclxuICAgICAgICBjYXNlIDUwMDpcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDAxOlxyXG4gICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHRoaXMudG9rZW47IC8vIGZhbGwgdGhyb3VnaFxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaHViOiBudWxsIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoY2xlYXIpIHtcclxuICAgICAgICAgIC8vIENsZWFyIHBlbmRpbmdcclxuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5yZW1vdmVGcm9tR3JvdXAoJycpKTtcclxuICAgICAgICAgIC8vIE1lcmdlIGFjdGl2ZSB0byBwZW5kaW5nXHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZW5kaW5nKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnN0YXRlLmFjdGl2ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcubWVyZ2VEZWVwKHRoaXMuc3RhdGUuYWN0aXZlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGh1Yi5zdG9wKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xyXG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIG1vcmlidW5kIGxpc3RlbmVyc1xyXG4gICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgIGlmIChleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ01vcmlidW5kID0gZXhpc3RpbmdNb3JpYnVuZC5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcclxuICAgICAgICB0aGlzLm1vcmlidW5kID0gcmVtYWluaW5nTW9yaWJ1bmQuc2l6ZVxyXG4gICAgICAgICAgPyB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgcmVtYWluaW5nTW9yaWJ1bmQpIDogdGhpcy5tb3JpYnVuZC5kZWxldGUobmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIHBlbmRpbmcgbGlzdGVuZXJzIChpZiBpdCBpcyBOT1QgYWN0aXZlKVxyXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgaWYgKCFleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcclxuICAgICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgICAgaWYgKCFleGlzdGluZ1BlbmRpbmcuaGFzKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCBleGlzdGluZ1BlbmRpbmcuYWRkKGhhbmRsZXIpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdW5yZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcclxuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBwZW5kaW5nIGxpc3RlbmVyc1xyXG4gICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICBpZiAoZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ1BlbmRpbmcgPSBleGlzdGluZ1BlbmRpbmcuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gcmVtYWluaW5nUGVuZGluZy5jb3VudCgpXHJcbiAgICAgICAgICA/IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ1BlbmRpbmcpXHJcbiAgICAgICAgICA6IHRoaXMucGVuZGluZy5kZWxldGUobmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIG1vcmlidW5kIGxpc3RlbmVycyAoaWYgaXQgaXMgYWN0aXZlKVxyXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgaWYgKGV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb3JpYnVuZCkgdGhpcy5tb3JpYnVuZCA9IG1vcmlidW5kIHx8IE1hcCgpO1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICAgIGlmICghZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgZXhpc3RpbmdNb3JpYnVuZC5hZGQoaGFuZGxlcikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXHJcbiAgICAgICAgICBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBhY3RpdmF0ZUxpc3RlbmVycyhodWIsIHBlbmRpbmdQYXJhbSkge1xyXG4gICAgICBsZXQgcGVuZGluZyA9IHBlbmRpbmdQYXJhbTtcclxuICAgICAgaWYgKGh1YiAmJiBwZW5kaW5nUGFyYW0pIHtcclxuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZS5yZWR1Y2UodGhpcy5jb3VudCwgMCkpIHtcclxuICAgICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcclxuICAgICAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IGV4aXN0aW5nXHJcbiAgICAgICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IGV4aXN0aW5nLmhhcyhoYW5kbGVyKSlcclxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub24obmFtZSwgaGFuZGxlcikpKTtcclxuICAgICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWVyZ2VEZWVwKHBlbmRpbmcpO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIHBlbmRpbmc6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHBlbmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgaW5hY3RpdmF0ZUxpc3RlbmVycyhodWIsIG1vcmlidW5kKSB7XHJcbiAgICAgIGlmIChodWIgJiYgbW9yaWJ1bmQpIHtcclxuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub2ZmKG5hbWUsIGhhbmRsZXIpKSk7XHJcbiAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByZW1vdmFibGUgPSBtb3JpYnVuZC5nZXRJbihbbmFtZV0pO1xyXG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSByZW1vdmFibGVcclxuICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiByZW1vdmFibGUuaGFzKGhhbmRsZXIpKVxyXG4gICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xyXG4gICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxyXG4gICAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBtb3JpYnVuZDtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMsIC4uLnBhc3NUaHJvdWdoUHJvcHMgfSA9IHRoaXMucHJvcHM7XHJcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIDxXcmFwcGVkQ29tcG9uZW50XHJcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cclxuICAgICAgICAgIHsuLi5odWJQcm9wfVxyXG4gICAgICAgIC8+XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lID0gYEluamVjdFNpZ25hbFIoJHtnZXREaXNwbGF5TmFtZShXcmFwcGVkQ29tcG9uZW50KX0pYDtcclxuXHJcbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XHJcbiAgICBiYXNlVXJsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXHJcbiAgICBzaWduYWxyQWN0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcclxuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxyXG4gICAgfSkuaXNSZXF1aXJlZCxcclxuICB9O1xyXG5cclxuICBjb25zdCBnZXRWYWx1ZUZyb21TdGF0ZSA9IChzdGF0ZSwgc291cmNlKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNvdXJjZShzdGF0ZSk7XHJcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHJldHVybiBzb3VyY2U7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gZGlzcGF0Y2ggPT4gKHtcclxuICAgIHNpZ25hbHJBY3Rpb25zOiBiaW5kQWN0aW9uQ3JlYXRvcnMoe1xyXG4gICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IChkaXNwYXRjaGVyLCBnZXRTdGF0ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gZ2V0U3RhdGUoKTtcclxuICAgICAgICByZXR1cm4gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGFjY2Vzc1Rva2VuKTtcclxuICAgICAgfSxcclxuICAgIH0sIGRpc3BhdGNoKSxcclxuICB9KTtcclxuXHJcbiAgY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XHJcbiAgICBjb25zdCBiYXNlVXJsID0gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGJhc2VBZGRyZXNzKTtcclxuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbmplY3RTaWduYWxSO1xyXG4iXX0=