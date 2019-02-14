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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZW5kVG9Db250cm9sbGVyIiwidGFyZ2V0IiwiZGF0YSIsInVybCIsImJhc2VVcmwiLCJwYXlsb2FkIiwidG9KUyIsImF4aW9zIiwicG9zdCIsImludm9rZUNvbnRyb2xsZXIiLCJ0YXJnZXRNZXRob2QiLCJ1cmxCYXNlIiwiZ2V0IiwiaGFuZGxlRXJyb3IiLCJyZXNwb25zZSIsInN0YXR1c0NvZGUiLCJzdGF0dXMiLCJvbGRUb2tlbiIsInRva2VuIiwic2V0U3RhdGUiLCJyZWdpc3Rlckxpc3RlbmVyIiwiaGFuZGxlciIsInBlbmRpbmciLCJhY3RpdmUiLCJtb3JpYnVuZCIsImV4aXN0aW5nTW9yaWJ1bmQiLCJnZXRJbiIsImhhcyIsInJlbWFpbmluZ01vcmlidW5kIiwiZmlsdGVyTm90IiwiaCIsInNpemUiLCJzZXRJbiIsImRlbGV0ZSIsImV4aXN0aW5nQWN0aXZlIiwiZXhpc3RpbmdQZW5kaW5nIiwiYWRkIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwicmVtYWluaW5nUGVuZGluZyIsInVuZGVmaW5lZCIsInJldHJ5IiwiY3JlYXRlIiwiY29tcG9uZW50V2lsbE1vdW50IiwiaHViUHJveHkiLCJzZW5kIiwicmVtb3ZlIiwiY29ubmVjdGlvbklkIiwicmVnaXN0ZXIiLCJ1bnJlZ2lzdGVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJjcmVhdGVIdWIiLCJjb21wb25lbnRXaWxsVXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwic3RvcEh1YiIsInN0YXJ0SHViIiwibWVyZ2VEZWVwIiwibW9yaWJ1bmRDb3VudCIsInJlZHVjZSIsImluYWN0aXZhdGVMaXN0ZW5lcnMiLCJwZW5kaW5nQ291bnQiLCJhY3RpdmF0ZUxpc3RlbmVycyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY3VyQ3JlYXRlIiwic2lnbmFsckFjdGlvbnMiLCJodWJBZGRyZXNzIiwiYWNjZXNzVG9rZW5GYWN0b3J5Iiwid2FybiIsIkh1YkNvbm5lY3Rpb25CdWlsZGVyIiwid2l0aFVybCIsInRyYW5zcG9ydCIsIkh0dHBUcmFuc3BvcnRUeXBlIiwiV2ViU29ja2V0cyIsImJ1aWxkIiwib25jbG9zZSIsInN0YXJ0IiwidGhlbiIsInN0b3AiLCJjbGVhciIsInByb21pc2VzIiwicHVzaCIsImFsbCIsInBlbmRpbmdQYXJhbSIsIm1hcEVudHJpZXMiLCJjdXJIYW5kbGVycyIsImV4aXN0aW5nIiwiaGFuZGxlcnMiLCJtYXAiLCJvbiIsIm9mZiIsInJlbW92YWJsZSIsInJlbmRlciIsInBhc3NUaHJvdWdoUHJvcHMiLCJodWJQcm9wIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZ2V0VmFsdWVGcm9tU3RhdGUiLCJzb3VyY2UiLCJtYXBEaXNwYXRjaFRvUHJvcHMiLCJkaXNwYXRjaGVyIiwiZ2V0U3RhdGUiLCJkaXNwYXRjaCIsIm1hcFN0YXRlVG9Qcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsaUJBQWlCLFNBQWpCQSxjQUFpQjtBQUFBLFNBQWFDLFVBQVVDLFdBQVYsSUFB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QWVLLGdCQUFmLENBQTdDOztBQVNBLFFBQU0ySCxvQkFBb0IsU0FBcEJBLGlCQUFvQixDQUFDM0csS0FBRCxFQUFRNEcsTUFBUixFQUFtQjtBQUMzQyxVQUFJLE9BQU9BLE1BQVAsS0FBa0IsVUFBdEIsRUFBa0MsT0FBT0EsT0FBTzVHLEtBQVAsQ0FBUDtBQUNsQyxVQUFJLE9BQU80RyxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDLE9BQU9BLE1BQVA7QUFDaEMsYUFBTyxFQUFQO0FBQ0QsS0FKRDs7QUFNQSxRQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQjtBQUFBLGFBQWE7QUFDdENsQyx3QkFBZ0IsK0JBQW1CO0FBQ2pDRSw4QkFBb0I7QUFBQSxtQkFBTSxVQUFDaUMsVUFBRCxFQUFhQyxRQUFiLEVBQTBCO0FBQ2xELGtCQUFNL0csUUFBUStHLFVBQWQ7QUFDQSxxQkFBT0osa0JBQWtCM0csS0FBbEIsRUFBeUJaLFdBQXpCLENBQVA7QUFDRCxhQUhtQjtBQUFBO0FBRGEsU0FBbkIsRUFLYjRILFFBTGE7QUFEc0IsT0FBYjtBQUFBLEtBQTNCOztBQVNBLFFBQU1DLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBQ2pILEtBQUQsRUFBVztBQUNqQyxVQUFNZSxVQUFVNEYsa0JBQWtCM0csS0FBbEIsRUFBeUJiLFdBQXpCLENBQWhCO0FBQ0EsYUFBTyxFQUFFNEIsZ0JBQUYsRUFBUDtBQUNELEtBSEQ7O0FBS0EsV0FBTyx5QkFBUWtHLGVBQVIsRUFBeUJKLGtCQUF6QixFQUE2Q3JILGFBQTdDLENBQVA7QUFDRCxHQTVYcUI7QUFBQSxDQUF0Qjs7a0JBOFhlVCxhIiwiZmlsZSI6ImluamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGJpbmRBY3Rpb25DcmVhdG9ycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBNYXAsIFNldCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgeyBIdWJDb25uZWN0aW9uQnVpbGRlciwgSHR0cFRyYW5zcG9ydFR5cGUgfSBmcm9tICdAYXNwbmV0L3NpZ25hbHInO1xuXG5jb25zdCBnZXREaXNwbGF5TmFtZSA9IENvbXBvbmVudCA9PiBDb21wb25lbnQuZGlzcGxheU5hbWUgfHwgQ29tcG9uZW50Lm5hbWUgfHwgJ0NvbXBvbmVudCc7XG5cbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XG4gIGNvbnN0IHtcbiAgICBodWJOYW1lID0gJycsXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcbiAgICBhY2Nlc3NUb2tlbiA9IG51bGwsXG4gICAgc2lnbmFsclBhdGggPSAnc2lnbmFscicsXG4gICAgcmV0cmllcyA9IDMsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB7IGNvbnRyb2xsZXIgPSBodWJOYW1lIH0gPSBvcHRpb25zO1xuXG4gIGNsYXNzIEluamVjdFNpZ25hbFIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgV3JhcHBlZENvbXBvbmVudCA9IFdyYXBwZWRDb21wb25lbnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgaHViOiBudWxsLFxuICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxuICAgICAgICBtb3JpYnVuZDogdW5kZWZpbmVkLFxuICAgICAgICByZXRyeTogMCxcbiAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICB0aGlzLmh1YlByb3h5ID0ge1xuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXG4gICAgICAgIGludm9rZTogdGhpcy5pbnZva2VDb250cm9sbGVyLFxuICAgICAgICBhZGQ6IHRoaXMuYWRkVG9Hcm91cCxcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcbiAgICAgICAgY29ubmVjdGlvbklkOiB1bmRlZmluZWQsXG4gICAgICAgIHJlZ2lzdGVyOiB0aGlzLnJlZ2lzdGVyTGlzdGVuZXIsXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHRoaXMuY3JlYXRlSHViKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmh1YikgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCBmYWxzZSk7XG4gICAgICAgIGlmIChuZXh0U3RhdGUuaHViKSB7XG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICB0aGlzLmNyZWF0ZUh1YihuZXh0U3RhdGUuY3JlYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB7IHBlbmRpbmcsIG1vcmlidW5kIH0gPSBuZXh0U3RhdGU7XG4gICAgICAgIGlmICghbW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3JpYnVuZCkge1xuICAgICAgICAgIG1vcmlidW5kID0gbW9yaWJ1bmQubWVyZ2VEZWVwKHRoaXMubW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vcmlidW5kQ291bnQgPSBtb3JpYnVuZC5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChtb3JpYnVuZENvdW50KSB7XG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWVyZ2VEZWVwKHRoaXMucGVuZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGVuZGluZ0NvdW50ID0gcGVuZGluZy5yZWR1Y2UodGhpcy5jb3VudCwgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xuICAgIH1cblxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XG5cbiAgICBhZGRUb0dyb3VwID0gKGdyb3VwKSA9PiB7XG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgaHViLmludm9rZSgnYWRkVG9Hcm91cCcsIGdyb3VwKVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcbiAgICAgIGNvbnN0IHsgaHViIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gaHViLmludm9rZSgncmVtb3ZlRnJvbUdyb3VwJywgZ3JvdXApXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogUmVtb3ZpbmcgY2xpZW50IGZyb20gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICBzZW5kVG9Db250cm9sbGVyID0gKHRhcmdldCwgZGF0YSA9IG51bGwpID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xuICAgICAgY29uc3QgcGF5bG9hZCA9IGRhdGEgPyBkYXRhLnRvSlMoKSA6IG51bGw7XG4gICAgICByZXR1cm4gYXhpb3MucG9zdCh1cmwsIHBheWxvYWQpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFNlbmRpbmcgZGF0YSB0byAke2NvbnRyb2xsZXJ9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGludm9rZUNvbnRyb2xsZXIgPSAodGFyZ2V0TWV0aG9kLCBkYXRhID0gbnVsbCkgPT4ge1xuICAgICAgY29uc3QgdXJsQmFzZSA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldE1ldGhvZH1gO1xuICAgICAgY29uc3QgdXJsID0gZGF0YSA/IGAke3VybEJhc2V9LyR7ZGF0YX1gIDogdXJsQmFzZTtcbiAgICAgIHJldHVybiBheGlvcy5nZXQodXJsKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBJbnZva2luZyAke2NvbnRyb2xsZXJ9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jIGNyZWF0ZUh1YihjdXJDcmVhdGUpIHtcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChyZXRyeSA+IHJldHJpZXMpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFJhbiBvdXQgb2YgcmV0cmllcyBmb3Igc3RhcnRpbmcgJHtodWJOYW1lfSFgKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcmV0cnk6IDAsXG4gICAgICAgICAgY3JlYXRlOiAwLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChiYXNlVXJsICYmIGh1Yk5hbWUpIHtcbiAgICAgICAgICBsZXQgaHViQWRkcmVzcyA9IGJhc2VVcmw7XG4gICAgICAgICAgaWYgKHNpZ25hbHJQYXRoKSBodWJBZGRyZXNzID0gYCR7aHViQWRkcmVzc30vJHtzaWduYWxyUGF0aH1gO1xuICAgICAgICAgIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke2h1Yk5hbWV9YDtcbiAgICAgICAgICB0aGlzLnRva2VuID0gc2lnbmFsckFjdGlvbnMuYWNjZXNzVG9rZW5GYWN0b3J5KGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgICAgaWYgKChjdXJDcmVhdGUgfHwgY3JlYXRlKSA+IHJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IFVuYWJsZSB0byBnZXQgdXAtdG8tZGF0ZSBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICBodWI6IG51bGwsXG4gICAgICAgICAgICAgICAgICBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHViID0gbmV3IEh1YkNvbm5lY3Rpb25CdWlsZGVyKClcbiAgICAgICAgICAgIC53aXRoVXJsKGh1YkFkZHJlc3MsIHtcbiAgICAgICAgICAgICAgdHJhbnNwb3J0OiBIdHRwVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzLFxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IHRoaXMudG9rZW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmJ1aWxkKCk7XG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaHViLFxuICAgICAgICAgICAgcmV0cnk6IHJldHJ5ICsgMSxcbiAgICAgICAgICAgIGNyZWF0ZTogMCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0SHViKGh1Yikge1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBodWIuc3RhcnQoKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgICAgIHJldHJ5OiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIGh1Yi5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlLCBzdGF0dXNDb2RlIH0gPSBlcnI7XG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XG4gICAgICBzd2l0Y2ggKHN0YXR1cyB8fCBzdGF0dXNDb2RlKSB7XG4gICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwMTpcbiAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdGhpcy50b2tlbjsgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG5cbiAgICAgICAgaWYgKGNsZWFyKSB7XG4gICAgICAgICAgLy8gQ2xlYXIgcGVuZGluZ1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMucmVtb3ZlRnJvbUdyb3VwKCcnKSk7XG4gICAgICAgICAgLy8gTWVyZ2UgYWN0aXZlIHRvIHBlbmRpbmdcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5zdGF0ZS5hY3RpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcubWVyZ2VEZWVwKHRoaXMuc3RhdGUuYWN0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gbW9yaWJ1bmQgbGlzdGVuZXJzXG4gICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ01vcmlidW5kID0gZXhpc3RpbmdNb3JpYnVuZC5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHJlbWFpbmluZ01vcmlidW5kLnNpemVcbiAgICAgICAgICA/IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCByZW1haW5pbmdNb3JpYnVuZCkgOiB0aGlzLm1vcmlidW5kLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBwZW5kaW5nIGxpc3RlbmVycyAoaWYgaXQgaXMgTk9UIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmICghZXhpc3RpbmdBY3RpdmUuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIGV4aXN0aW5nUGVuZGluZy5hZGQoaGFuZGxlcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcbiAgICAgICAgICBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHVucmVnaXN0ZXJMaXN0ZW5lciA9IChuYW1lLCBoYW5kbGVyKSA9PiB7XG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdQZW5kaW5nID0gZXhpc3RpbmdQZW5kaW5nLmZpbHRlck5vdChoID0+IGggPT09IGhhbmRsZXIpO1xuICAgICAgICB0aGlzLnBlbmRpbmcgPSByZW1haW5pbmdQZW5kaW5nLmNvdW50KClcbiAgICAgICAgICA/IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ1BlbmRpbmcpXG4gICAgICAgICAgOiB0aGlzLnBlbmRpbmcuZGVsZXRlKG5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIG1vcmlidW5kIGxpc3RlbmVycyAoaWYgaXQgaXMgYWN0aXZlKVxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ0FjdGl2ZSA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLm1vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIGV4aXN0aW5nTW9yaWJ1bmQuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhY3RpdmF0ZUxpc3RlbmVycyhodWIsIHBlbmRpbmdQYXJhbSkge1xuICAgICAgbGV0IHBlbmRpbmcgPSBwZW5kaW5nUGFyYW07XG4gICAgICBpZiAoaHViICYmIHBlbmRpbmdQYXJhbSkge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmUucmVkdWNlKHRoaXMuY291bnQsIDApKSB7XG4gICAgICAgICAgICBwZW5kaW5nID0gcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBleGlzdGluZ1xuICAgICAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gZXhpc3RpbmcuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9uKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tZXJnZURlZXAocGVuZGluZyk7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwZW5kaW5nO1xuICAgIH1cblxuICAgIGluYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBtb3JpYnVuZCkge1xuICAgICAgaWYgKGh1YiAmJiBtb3JpYnVuZCkge1xuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub2ZmKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgIGNvbnN0IHsgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZhYmxlID0gbW9yaWJ1bmQuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IHJlbW92YWJsZVxuICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiByZW1vdmFibGUuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgOiBjdXJIYW5kbGVycztcbiAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW9yaWJ1bmQ7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucywgLi4ucGFzc1Rocm91Z2hQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFdyYXBwZWRDb21wb25lbnRcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cbiAgICAgICAgICB7Li4uaHViUHJvcH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgSW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZSA9IGBJbmplY3RTaWduYWxSKCR7Z2V0RGlzcGxheU5hbWUoV3JhcHBlZENvbXBvbmVudCl9KWA7XG5cbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XG4gICAgYmFzZVVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHNpZ25hbHJBY3Rpb25zOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxuICAgIH0pLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3QgZ2V0VmFsdWVGcm9tU3RhdGUgPSAoc3RhdGUsIHNvdXJjZSkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gc291cmNlKHN0YXRlKTtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHJldHVybiBzb3VyY2U7XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IGRpc3BhdGNoID0+ICh7XG4gICAgc2lnbmFsckFjdGlvbnM6IGJpbmRBY3Rpb25DcmVhdG9ycyh7XG4gICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IChkaXNwYXRjaGVyLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGdldFN0YXRlKCk7XG4gICAgICAgIHJldHVybiBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYWNjZXNzVG9rZW4pO1xuICAgICAgfSxcbiAgICB9LCBkaXNwYXRjaCksXG4gIH0pO1xuXG4gIGNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYmFzZUFkZHJlc3MpO1xuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcbiAgfTtcblxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmplY3RTaWduYWxSO1xuIl19