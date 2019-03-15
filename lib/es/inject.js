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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbIlJlYWN0IiwiUHJvcFR5cGVzIiwiYXhpb3MiLCJiaW5kQWN0aW9uQ3JlYXRvcnMiLCJjb25uZWN0IiwiTWFwIiwiU2V0IiwiSHViQ29ubmVjdGlvbkJ1aWxkZXIiLCJIdHRwVHJhbnNwb3J0VHlwZSIsImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZW5kVG9Db250cm9sbGVyIiwidGFyZ2V0IiwiZGF0YSIsInVybCIsImJhc2VVcmwiLCJwYXlsb2FkIiwidG9KUyIsInBvc3QiLCJpbnZva2VDb250cm9sbGVyIiwidGFyZ2V0TWV0aG9kIiwidXJsQmFzZSIsImdldCIsImhhbmRsZUVycm9yIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwib2xkVG9rZW4iLCJ0b2tlbiIsInNldFN0YXRlIiwicmVnaXN0ZXJMaXN0ZW5lciIsImhhbmRsZXIiLCJwZW5kaW5nIiwiYWN0aXZlIiwibW9yaWJ1bmQiLCJleGlzdGluZ01vcmlidW5kIiwiZ2V0SW4iLCJoYXMiLCJyZW1haW5pbmdNb3JpYnVuZCIsImZpbHRlck5vdCIsImgiLCJzaXplIiwic2V0SW4iLCJkZWxldGUiLCJleGlzdGluZ0FjdGl2ZSIsImV4aXN0aW5nUGVuZGluZyIsImFkZCIsInVucmVnaXN0ZXJMaXN0ZW5lciIsInJlbWFpbmluZ1BlbmRpbmciLCJ1bmRlZmluZWQiLCJyZXRyeSIsImNyZWF0ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsImh1YlByb3h5Iiwic2VuZCIsInJlbW92ZSIsImNvbm5lY3Rpb25JZCIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZE1vdW50IiwiY3JlYXRlSHViIiwiY29tcG9uZW50V2lsbFVwZGF0ZSIsIm5leHRQcm9wcyIsIm5leHRTdGF0ZSIsInN0b3BIdWIiLCJzdGFydEh1YiIsIm1lcmdlRGVlcCIsIm1vcmlidW5kQ291bnQiLCJyZWR1Y2UiLCJpbmFjdGl2YXRlTGlzdGVuZXJzIiwicGVuZGluZ0NvdW50IiwiYWN0aXZhdGVMaXN0ZW5lcnMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImN1ckNyZWF0ZSIsInNpZ25hbHJBY3Rpb25zIiwiaHViQWRkcmVzcyIsImFjY2Vzc1Rva2VuRmFjdG9yeSIsIndhcm4iLCJ3aXRoVXJsIiwic2tpcE5lZ290aWF0aW9uIiwidHJhbnNwb3J0IiwiV2ViU29ja2V0cyIsImJ1aWxkIiwib25jbG9zZSIsInN0YXJ0IiwidGhlbiIsInN0b3AiLCJjbGVhciIsInByb21pc2VzIiwicHVzaCIsImFsbCIsInBlbmRpbmdQYXJhbSIsIm1hcEVudHJpZXMiLCJjdXJIYW5kbGVycyIsImV4aXN0aW5nIiwiaGFuZGxlcnMiLCJtYXAiLCJvbiIsIm9mZiIsInJlbW92YWJsZSIsInJlbmRlciIsInBhc3NUaHJvdWdoUHJvcHMiLCJodWJQcm9wIiwiUHVyZUNvbXBvbmVudCIsImdldFZhbHVlRnJvbVN0YXRlIiwic291cmNlIiwibWFwRGlzcGF0Y2hUb1Byb3BzIiwiZGlzcGF0Y2hlciIsImdldFN0YXRlIiwiZGlzcGF0Y2giLCJtYXBTdGF0ZVRvUHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU9BLEtBQVAsTUFBa0IsT0FBbEI7QUFDQSxPQUFP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Q0QsS0FIRDs7QUFLQSxXQUFPekMsUUFBUXdJLGVBQVIsRUFBeUJKLGtCQUF6QixFQUE2Q2xILGFBQTdDLENBQVA7QUFDRCxHQTdYcUI7QUFBQSxDQUF0Qjs7QUErWEEsZUFBZVQsYUFBZiIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgTWFwLCBTZXQgfSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHsgSHViQ29ubmVjdGlvbkJ1aWxkZXIsIEh0dHBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyJztcblxuY29uc3QgZ2V0RGlzcGxheU5hbWUgPSBDb21wb25lbnQgPT4gQ29tcG9uZW50LmRpc3BsYXlOYW1lIHx8IENvbXBvbmVudC5uYW1lIHx8ICdDb21wb25lbnQnO1xuXG5jb25zdCBpbmplY3RTaWduYWxSID0gb3B0aW9ucyA9PiAoV3JhcHBlZENvbXBvbmVudCkgPT4ge1xuICBjb25zdCB7XG4gICAgaHViTmFtZSA9ICcnLFxuICAgIGJhc2VBZGRyZXNzID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6NTU1NScsXG4gICAgYWNjZXNzVG9rZW4gPSBudWxsLFxuICAgIHNpZ25hbHJQYXRoID0gJ3NpZ25hbHInLFxuICAgIHJldHJpZXMgPSAzLFxuICB9ID0gb3B0aW9ucztcbiAgY29uc3QgeyBjb250cm9sbGVyID0gaHViTmFtZSB9ID0gb3B0aW9ucztcblxuICBjbGFzcyBJbmplY3RTaWduYWxSIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIFdyYXBwZWRDb21wb25lbnQgPSBXcmFwcGVkQ29tcG9uZW50O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGh1YjogbnVsbCxcbiAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxuICAgICAgICBhY3RpdmU6IHVuZGVmaW5lZCxcbiAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgcmV0cnk6IDAsXG4gICAgICAgIGNyZWF0ZTogMCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgdGhpcy5odWJQcm94eSA9IHtcbiAgICAgICAgc2VuZDogdGhpcy5zZW5kVG9Db250cm9sbGVyLFxuICAgICAgICBpbnZva2U6IHRoaXMuaW52b2tlQ29udHJvbGxlcixcbiAgICAgICAgYWRkOiB0aGlzLmFkZFRvR3JvdXAsXG4gICAgICAgIHJlbW92ZTogdGhpcy5yZW1vdmVGcm9tR3JvdXAsXG4gICAgICAgIGNvbm5lY3Rpb25JZDogdW5kZWZpbmVkLFxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxuICAgICAgICB1bnJlZ2lzdGVyOiB0aGlzLnVucmVnaXN0ZXJMaXN0ZW5lcixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmh1YiAhPT0gbmV4dFN0YXRlLmh1Yikge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5odWIpIHRoaXMuc3RvcEh1Yih0aGlzLnN0YXRlLmh1YiwgZmFsc2UpO1xuICAgICAgICBpZiAobmV4dFN0YXRlLmh1Yikge1xuICAgICAgICAgIHRoaXMuc3RhcnRIdWIobmV4dFN0YXRlLmh1Yik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIW5leHRTdGF0ZS5odWIpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgeyBwZW5kaW5nLCBtb3JpYnVuZCB9ID0gbmV4dFN0YXRlO1xuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XG4gICAgICAgICAgbW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW9yaWJ1bmQpIHtcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb3JpYnVuZENvdW50ID0gbW9yaWJ1bmQucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLmluYWN0aXZhdGVMaXN0ZW5lcnModGhpcy5zdGF0ZS5odWIsIG1vcmlidW5kKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcbiAgICAgICAgICBwZW5kaW5nID0gdGhpcy5wZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGVuZGluZykge1xuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBlbmRpbmdDb3VudCA9IHBlbmRpbmcucmVkdWNlKHRoaXMuY291bnQsIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5hY3RpdmF0ZUxpc3RlbmVycyhuZXh0U3RhdGUuaHViLCBwZW5kaW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgdGhpcy5zdG9wSHViKHRoaXMuc3RhdGUuaHViLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjb3VudCA9IChjLCBzKSA9PiBjICsgcy5jb3VudCgpO1xuXG4gICAgYWRkVG9Hcm91cCA9IChncm91cCkgPT4ge1xuICAgICAgY29uc3QgeyBodWIgfSA9IHRoaXMuc3RhdGU7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbiB9ID0gaHViO1xuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xuICAgICAgICAgIGh1Yi5pbnZva2UoJ2FkZFRvR3JvdXAnLCBncm91cClcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBBZGRpbmcgY2xpZW50IHRvIGdyb3VwICR7Z3JvdXB9IGluICR7aHViTmFtZX0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVtb3ZlRnJvbUdyb3VwID0gKGdyb3VwKSA9PiB7XG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChodWIpIHtcbiAgICAgICAgY29uc3QgeyBjb25uZWN0aW9uIH0gPSBodWI7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGh1Yi5pbnZva2UoJ3JlbW92ZUZyb21Hcm91cCcsIGdyb3VwKVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IFJlbW92aW5nIGNsaWVudCBmcm9tIGdyb3VwICR7Z3JvdXB9IGluICR7aHViTmFtZX0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgc2VuZFRvQ29udHJvbGxlciA9ICh0YXJnZXQsIGRhdGEgPSBudWxsKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLnByb3BzLmJhc2VVcmx9LyR7Y29udHJvbGxlcn0vJHt0YXJnZXR9YDtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSBkYXRhID8gZGF0YS50b0pTKCkgOiBudWxsO1xuICAgICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBwYXlsb2FkKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBTZW5kaW5nIGRhdGEgdG8gJHtjb250cm9sbGVyfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpbnZva2VDb250cm9sbGVyID0gKHRhcmdldE1ldGhvZCwgZGF0YSA9IG51bGwpID0+IHtcbiAgICAgIGNvbnN0IHVybEJhc2UgPSBgJHt0aGlzLnByb3BzLmJhc2VVcmx9LyR7Y29udHJvbGxlcn0vJHt0YXJnZXRNZXRob2R9YDtcbiAgICAgIGNvbnN0IHVybCA9IGRhdGEgPyBgJHt1cmxCYXNlfS8ke2RhdGF9YCA6IHVybEJhc2U7XG4gICAgICByZXR1cm4gYXhpb3MuZ2V0KHVybClcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogSW52b2tpbmcgJHtjb250cm9sbGVyfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYyBjcmVhdGVIdWIoY3VyQ3JlYXRlKSB7XG4gICAgICBjb25zdCB7IHJldHJ5LCBjcmVhdGUgfSA9IHRoaXMuc3RhdGU7XG4gICAgICBpZiAocmV0cnkgPiByZXRyaWVzKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSYW4gb3V0IG9mIHJldHJpZXMgZm9yIHN0YXJ0aW5nICR7aHViTmFtZX0hYCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHJldHJ5OiAwLFxuICAgICAgICAgIGNyZWF0ZTogMCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoYmFzZVVybCAmJiBodWJOYW1lKSB7XG4gICAgICAgICAgbGV0IGh1YkFkZHJlc3MgPSBiYXNlVXJsO1xuICAgICAgICAgIGlmIChzaWduYWxyUGF0aCkgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7c2lnbmFsclBhdGh9YDtcbiAgICAgICAgICBodWJBZGRyZXNzID0gYCR7aHViQWRkcmVzc30vJHtodWJOYW1lfWA7XG4gICAgICAgICAgdGhpcy50b2tlbiA9IHNpZ25hbHJBY3Rpb25zLmFjY2Vzc1Rva2VuRmFjdG9yeShhY2Nlc3NUb2tlbik7XG4gICAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9sZFRva2VuID09PSB0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICAgIGlmICgoY3VyQ3JlYXRlIHx8IGNyZWF0ZSkgPiByZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmFibGUgdG8gZ2V0IHVwLXRvLWRhdGUgYWNjZXNzIHRva2VuLicpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgaHViOiBudWxsLFxuICAgICAgICAgICAgICAgICAgY3JlYXRlOiAoY3VyQ3JlYXRlIHx8IGNyZWF0ZSkgKyAxLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGh1YiA9IG5ldyBIdWJDb25uZWN0aW9uQnVpbGRlcigpXG4gICAgICAgICAgICAud2l0aFVybChodWJBZGRyZXNzLCB7XG4gICAgICAgICAgICAgIHNraXBOZWdvdGlhdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgdHJhbnNwb3J0OiBIdHRwVHJhbnNwb3J0VHlwZS5XZWJTb2NrZXRzLFxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IHRoaXMudG9rZW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmJ1aWxkKCk7XG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaHViLFxuICAgICAgICAgICAgcmV0cnk6IHJldHJ5ICsgMSxcbiAgICAgICAgICAgIGNyZWF0ZTogMCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0SHViKGh1Yikge1xuICAgICAgaWYgKGh1Yikge1xuICAgICAgICBodWIuc3RhcnQoKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcGVuZGluZywgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgICAgIHJldHJ5OiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIGh1Yi5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zdCB7IHJlc3BvbnNlLCBzdGF0dXNDb2RlIH0gPSBlcnI7XG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XG4gICAgICBzd2l0Y2ggKHN0YXR1cyB8fCBzdGF0dXNDb2RlKSB7XG4gICAgICAgIGNhc2UgNTAwOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwMTpcbiAgICAgICAgICB0aGlzLm9sZFRva2VuID0gdGhpcy50b2tlbjsgLy8gZmFsbCB0aHJvdWdoXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGh1YjogbnVsbCB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XG4gICAgICBpZiAoaHViKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG5cbiAgICAgICAgaWYgKGNsZWFyKSB7XG4gICAgICAgICAgLy8gQ2xlYXIgcGVuZGluZ1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMucmVtb3ZlRnJvbUdyb3VwKCcnKSk7XG4gICAgICAgICAgLy8gTWVyZ2UgYWN0aXZlIHRvIHBlbmRpbmdcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZW5kaW5nKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nID0gdGhpcy5zdGF0ZS5hY3RpdmU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcubWVyZ2VEZWVwKHRoaXMuc3RhdGUuYWN0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBodWIuc3RvcCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVyIGZyb20gbW9yaWJ1bmQgbGlzdGVuZXJzXG4gICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nTW9yaWJ1bmQuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ01vcmlidW5kID0gZXhpc3RpbmdNb3JpYnVuZC5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcbiAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHJlbWFpbmluZ01vcmlidW5kLnNpemVcbiAgICAgICAgICA/IHRoaXMubW9yaWJ1bmQuc2V0SW4oW25hbWVdLCByZW1haW5pbmdNb3JpYnVuZCkgOiB0aGlzLm1vcmlidW5kLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBwZW5kaW5nIGxpc3RlbmVycyAoaWYgaXQgaXMgTk9UIGFjdGl2ZSlcbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcbiAgICAgIGlmICghZXhpc3RpbmdBY3RpdmUuaGFzKGhhbmRsZXIpKSB7XG4gICAgICAgIGlmICghdGhpcy5wZW5kaW5nKSB0aGlzLnBlbmRpbmcgPSBwZW5kaW5nIHx8IE1hcCgpO1xuICAgICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIGV4aXN0aW5nUGVuZGluZy5hZGQoaGFuZGxlcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcbiAgICAgICAgICBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHVucmVnaXN0ZXJMaXN0ZW5lciA9IChuYW1lLCBoYW5kbGVyKSA9PiB7XG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICBpZiAoZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBjb25zdCByZW1haW5pbmdQZW5kaW5nID0gZXhpc3RpbmdQZW5kaW5nLmZpbHRlck5vdChoID0+IGggPT09IGhhbmRsZXIpO1xuICAgICAgICB0aGlzLnBlbmRpbmcgPSByZW1haW5pbmdQZW5kaW5nLmNvdW50KClcbiAgICAgICAgICA/IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ1BlbmRpbmcpXG4gICAgICAgICAgOiB0aGlzLnBlbmRpbmcuZGVsZXRlKG5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIG1vcmlidW5kIGxpc3RlbmVycyAoaWYgaXQgaXMgYWN0aXZlKVxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XG4gICAgICBjb25zdCBleGlzdGluZ0FjdGl2ZSA9IHRoaXMuYWN0aXZlLmdldEluKFtuYW1lXSwgU2V0KCkpO1xuICAgICAgaWYgKGV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xuICAgICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XG4gICAgICAgIGlmICghZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcbiAgICAgICAgICB0aGlzLm1vcmlidW5kID0gdGhpcy5tb3JpYnVuZC5zZXRJbihbbmFtZV0sIGV4aXN0aW5nTW9yaWJ1bmQuYWRkKGhhbmRsZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhY3RpdmF0ZUxpc3RlbmVycyhodWIsIHBlbmRpbmdQYXJhbSkge1xuICAgICAgbGV0IHBlbmRpbmcgPSBwZW5kaW5nUGFyYW07XG4gICAgICBpZiAoaHViICYmIHBlbmRpbmdQYXJhbSkge1xuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcbiAgICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdGUgPT09IDEpIHtcbiAgICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmUucmVkdWNlKHRoaXMuY291bnQsIDApKSB7XG4gICAgICAgICAgICBwZW5kaW5nID0gcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBleGlzdGluZ1xuICAgICAgICAgICAgICAgID8gY3VySGFuZGxlcnMuZmlsdGVyTm90KGhhbmRsZXIgPT4gZXhpc3RpbmcuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XG4gICAgICAgICAgICAgIHJldHVybiBbbmFtZSwgaGFuZGxlcnNdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGhhbmRsZXJzXSkgPT4gaGFuZGxlcnMubWFwKGhhbmRsZXIgPT4gaHViLm9uKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tZXJnZURlZXAocGVuZGluZyk7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwZW5kaW5nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwZW5kaW5nO1xuICAgIH1cblxuICAgIGluYWN0aXZhdGVMaXN0ZW5lcnMoaHViLCBtb3JpYnVuZCkge1xuICAgICAgaWYgKGh1YiAmJiBtb3JpYnVuZCkge1xuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub2ZmKG5hbWUsIGhhbmRsZXIpKSk7XG4gICAgICAgIGNvbnN0IHsgYWN0aXZlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZhYmxlID0gbW9yaWJ1bmQuZ2V0SW4oW25hbWVdKTtcbiAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IHJlbW92YWJsZVxuICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiByZW1vdmFibGUuaGFzKGhhbmRsZXIpKVxuICAgICAgICAgICAgOiBjdXJIYW5kbGVycztcbiAgICAgICAgICByZXR1cm4gW25hbWUsIGhhbmRsZXJzXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmUsXG4gICAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW9yaWJ1bmQ7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3QgeyBiYXNlVXJsLCBzaWduYWxyQWN0aW9ucywgLi4ucGFzc1Rocm91Z2hQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFdyYXBwZWRDb21wb25lbnRcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cbiAgICAgICAgICB7Li4uaHViUHJvcH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgSW5qZWN0U2lnbmFsUi5kaXNwbGF5TmFtZSA9IGBJbmplY3RTaWduYWxSKCR7Z2V0RGlzcGxheU5hbWUoV3JhcHBlZENvbXBvbmVudCl9KWA7XG5cbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XG4gICAgYmFzZVVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHNpZ25hbHJBY3Rpb25zOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxuICAgIH0pLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3QgZ2V0VmFsdWVGcm9tU3RhdGUgPSAoc3RhdGUsIHNvdXJjZSkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gc291cmNlKHN0YXRlKTtcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHJldHVybiBzb3VyY2U7XG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IGRpc3BhdGNoID0+ICh7XG4gICAgc2lnbmFsckFjdGlvbnM6IGJpbmRBY3Rpb25DcmVhdG9ycyh7XG4gICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IChkaXNwYXRjaGVyLCBnZXRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGdldFN0YXRlKCk7XG4gICAgICAgIHJldHVybiBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYWNjZXNzVG9rZW4pO1xuICAgICAgfSxcbiAgICB9LCBkaXNwYXRjaCksXG4gIH0pO1xuXG4gIGNvbnN0IG1hcFN0YXRlVG9Qcm9wcyA9IChzdGF0ZSkgPT4ge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRWYWx1ZUZyb21TdGF0ZShzdGF0ZSwgYmFzZUFkZHJlc3MpO1xuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcbiAgfTtcblxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBpbmplY3RTaWduYWxSO1xuIl19