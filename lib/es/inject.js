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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmplY3QuanN4Il0sIm5hbWVzIjpbIlJlYWN0IiwiUHJvcFR5cGVzIiwiYXhpb3MiLCJiaW5kQWN0aW9uQ3JlYXRvcnMiLCJjb25uZWN0IiwiTWFwIiwiU2V0IiwiSHViQ29ubmVjdGlvbkJ1aWxkZXIiLCJIdHRwVHJhbnNwb3J0VHlwZSIsImdldERpc3BsYXlOYW1lIiwiQ29tcG9uZW50IiwiZGlzcGxheU5hbWUiLCJuYW1lIiwiaW5qZWN0U2lnbmFsUiIsIldyYXBwZWRDb21wb25lbnQiLCJvcHRpb25zIiwiaHViTmFtZSIsImJhc2VBZGRyZXNzIiwiYWNjZXNzVG9rZW4iLCJzaWduYWxyUGF0aCIsInJldHJpZXMiLCJjb250cm9sbGVyIiwiSW5qZWN0U2lnbmFsUiIsInByb3BzIiwiY291bnQiLCJjIiwicyIsImFkZFRvR3JvdXAiLCJncm91cCIsImh1YiIsInN0YXRlIiwiY29ubmVjdGlvbiIsImNvbm5lY3Rpb25TdGF0ZSIsImludm9rZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicmVtb3ZlRnJvbUdyb3VwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZW5kVG9Db250cm9sbGVyIiwidGFyZ2V0IiwiZGF0YSIsInVybCIsImJhc2VVcmwiLCJwYXlsb2FkIiwidG9KUyIsInBvc3QiLCJpbnZva2VDb250cm9sbGVyIiwidGFyZ2V0TWV0aG9kIiwidXJsQmFzZSIsImdldCIsImhhbmRsZUVycm9yIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwib2xkVG9rZW4iLCJ0b2tlbiIsInNldFN0YXRlIiwicmVnaXN0ZXJMaXN0ZW5lciIsImhhbmRsZXIiLCJwZW5kaW5nIiwiYWN0aXZlIiwibW9yaWJ1bmQiLCJleGlzdGluZ01vcmlidW5kIiwiZ2V0SW4iLCJoYXMiLCJyZW1haW5pbmdNb3JpYnVuZCIsImZpbHRlck5vdCIsImgiLCJzaXplIiwic2V0SW4iLCJkZWxldGUiLCJleGlzdGluZ0FjdGl2ZSIsImV4aXN0aW5nUGVuZGluZyIsImFkZCIsInVucmVnaXN0ZXJMaXN0ZW5lciIsInJlbWFpbmluZ1BlbmRpbmciLCJ1bmRlZmluZWQiLCJyZXRyeSIsImNyZWF0ZSIsImNvbXBvbmVudFdpbGxNb3VudCIsImh1YlByb3h5Iiwic2VuZCIsInJlbW92ZSIsImNvbm5lY3Rpb25JZCIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZE1vdW50IiwiY3JlYXRlSHViIiwiY29tcG9uZW50V2lsbFVwZGF0ZSIsIm5leHRQcm9wcyIsIm5leHRTdGF0ZSIsInN0b3BIdWIiLCJzdGFydEh1YiIsIm1lcmdlRGVlcCIsIm1vcmlidW5kQ291bnQiLCJyZWR1Y2UiLCJpbmFjdGl2YXRlTGlzdGVuZXJzIiwicGVuZGluZ0NvdW50IiwiYWN0aXZhdGVMaXN0ZW5lcnMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImN1ckNyZWF0ZSIsInNpZ25hbHJBY3Rpb25zIiwiaHViQWRkcmVzcyIsImFjY2Vzc1Rva2VuRmFjdG9yeSIsIndhcm4iLCJ3aXRoVXJsIiwic2tpcE5lZ290aWF0aW9uIiwidHJhbnNwb3J0IiwiV2ViU29ja2V0cyIsImJ1aWxkIiwib25jbG9zZSIsInN0YXJ0IiwidGhlbiIsInN0b3AiLCJjbGVhciIsInByb21pc2VzIiwicHVzaCIsImFsbCIsInBlbmRpbmdQYXJhbSIsIm1hcEVudHJpZXMiLCJjdXJIYW5kbGVycyIsImV4aXN0aW5nIiwiaGFuZGxlcnMiLCJtYXAiLCJvbiIsIm9mZiIsInJlbW92YWJsZSIsInJlbmRlciIsInBhc3NUaHJvdWdoUHJvcHMiLCJodWJQcm9wIiwiUHVyZUNvbXBvbmVudCIsImdldFZhbHVlRnJvbVN0YXRlIiwic291cmNlIiwibWFwRGlzcGF0Y2hUb1Byb3BzIiwiZGlzcGF0Y2hlciIsImdldFN0YXRlIiwiZGlzcGF0Y2giLCJtYXBTdGF0ZVRvUHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU9BLEtBQVAsTUFBa0IsT0FBbEI7QUFDQSxPQUFP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Q0QsS0FIRDs7QUFLQSxXQUFPekMsUUFBUXdJLGVBQVIsRUFBeUJKLGtCQUF6QixFQUE2Q2xILGFBQTdDLENBQVA7QUFDRCxHQTdYcUI7QUFBQSxDQUF0Qjs7QUErWEEsZUFBZVQsYUFBZiIsImZpbGUiOiJpbmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgeyBiaW5kQWN0aW9uQ3JlYXRvcnMgfSBmcm9tICdyZWR1eCc7XHJcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWFjdC1yZWR1eCc7XHJcbmltcG9ydCB7IE1hcCwgU2V0IH0gZnJvbSAnaW1tdXRhYmxlJztcclxuaW1wb3J0IHsgSHViQ29ubmVjdGlvbkJ1aWxkZXIsIEh0dHBUcmFuc3BvcnRUeXBlIH0gZnJvbSAnQGFzcG5ldC9zaWduYWxyJztcclxuXHJcbmNvbnN0IGdldERpc3BsYXlOYW1lID0gQ29tcG9uZW50ID0+IENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQubmFtZSB8fCAnQ29tcG9uZW50JztcclxuXHJcbmNvbnN0IGluamVjdFNpZ25hbFIgPSBvcHRpb25zID0+IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XHJcbiAgY29uc3Qge1xyXG4gICAgaHViTmFtZSA9ICcnLFxyXG4gICAgYmFzZUFkZHJlc3MgPSAnaHR0cDovL2xvY2FsaG9zdDo1NTU1JyxcclxuICAgIGFjY2Vzc1Rva2VuID0gbnVsbCxcclxuICAgIHNpZ25hbHJQYXRoID0gJ3NpZ25hbHInLFxyXG4gICAgcmV0cmllcyA9IDMsXHJcbiAgfSA9IG9wdGlvbnM7XHJcbiAgY29uc3QgeyBjb250cm9sbGVyID0gaHViTmFtZSB9ID0gb3B0aW9ucztcclxuXHJcbiAgY2xhc3MgSW5qZWN0U2lnbmFsUiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xyXG4gICAgc3RhdGljIFdyYXBwZWRDb21wb25lbnQgPSBXcmFwcGVkQ29tcG9uZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICBodWI6IG51bGwsXHJcbiAgICAgICAgcGVuZGluZzogdW5kZWZpbmVkLFxyXG4gICAgICAgIGFjdGl2ZTogdW5kZWZpbmVkLFxyXG4gICAgICAgIG1vcmlidW5kOiB1bmRlZmluZWQsXHJcbiAgICAgICAgcmV0cnk6IDAsXHJcbiAgICAgICAgY3JlYXRlOiAwLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcclxuICAgICAgdGhpcy5odWJQcm94eSA9IHtcclxuICAgICAgICBzZW5kOiB0aGlzLnNlbmRUb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZUNvbnRyb2xsZXIsXHJcbiAgICAgICAgYWRkOiB0aGlzLmFkZFRvR3JvdXAsXHJcbiAgICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZUZyb21Hcm91cCxcclxuICAgICAgICBjb25uZWN0aW9uSWQ6IHVuZGVmaW5lZCxcclxuICAgICAgICByZWdpc3RlcjogdGhpcy5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICAgIHVucmVnaXN0ZXI6IHRoaXMudW5yZWdpc3Rlckxpc3RlbmVyLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUh1YigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUuaHViICE9PSBuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaHViKSB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIGZhbHNlKTtcclxuICAgICAgICBpZiAobmV4dFN0YXRlLmh1Yikge1xyXG4gICAgICAgICAgdGhpcy5zdGFydEh1YihuZXh0U3RhdGUuaHViKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCFuZXh0U3RhdGUuaHViKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVIdWIobmV4dFN0YXRlLmNyZWF0ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHsgcGVuZGluZywgbW9yaWJ1bmQgfSA9IG5leHRTdGF0ZTtcclxuICAgICAgICBpZiAoIW1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vcmlidW5kKSB7XHJcbiAgICAgICAgICBtb3JpYnVuZCA9IG1vcmlidW5kLm1lcmdlRGVlcCh0aGlzLm1vcmlidW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbW9yaWJ1bmRDb3VudCA9IG1vcmlidW5kLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAobW9yaWJ1bmRDb3VudCkge1xyXG4gICAgICAgICAgdGhpcy5tb3JpYnVuZCA9IHRoaXMuaW5hY3RpdmF0ZUxpc3RlbmVycyh0aGlzLnN0YXRlLmh1YiwgbW9yaWJ1bmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBlbmRpbmcpIHtcclxuICAgICAgICAgIHBlbmRpbmcgPSBwZW5kaW5nLm1lcmdlRGVlcCh0aGlzLnBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwZW5kaW5nQ291bnQgPSBwZW5kaW5nLnJlZHVjZSh0aGlzLmNvdW50LCAwKTtcclxuICAgICAgICBpZiAocGVuZGluZ0NvdW50KSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmFjdGl2YXRlTGlzdGVuZXJzKG5leHRTdGF0ZS5odWIsIHBlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgICB0aGlzLnN0b3BIdWIodGhpcy5zdGF0ZS5odWIsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvdW50ID0gKGMsIHMpID0+IGMgKyBzLmNvdW50KCk7XHJcblxyXG4gICAgYWRkVG9Hcm91cCA9IChncm91cCkgPT4ge1xyXG4gICAgICBjb25zdCB7IGh1YiB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKGh1Yikge1xyXG4gICAgICAgIGNvbnN0IHsgY29ubmVjdGlvbiB9ID0gaHViO1xyXG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICBodWIuaW52b2tlKCdhZGRUb0dyb3VwJywgZ3JvdXApXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEFkZGluZyBjbGllbnQgdG8gZ3JvdXAgJHtncm91cH0gaW4gJHtodWJOYW1lfSBmYWlsZWQuXFxuXFxuJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVGcm9tR3JvdXAgPSAoZ3JvdXApID0+IHtcclxuICAgICAgY29uc3QgeyBodWIgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgcmV0dXJuIGh1Yi5pbnZva2UoJ3JlbW92ZUZyb21Hcm91cCcsIGdyb3VwKVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSZW1vdmluZyBjbGllbnQgZnJvbSBncm91cCAke2dyb3VwfSBpbiAke2h1Yk5hbWV9IGZhaWxlZC5cXG5cXG4ke2Vycn1gKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgc2VuZFRvQ29udHJvbGxlciA9ICh0YXJnZXQsIGRhdGEgPSBudWxsKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldH1gO1xyXG4gICAgICBjb25zdCBwYXlsb2FkID0gZGF0YSA/IGRhdGEudG9KUygpIDogbnVsbDtcclxuICAgICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBwYXlsb2FkKVxyXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvcjogU2VuZGluZyBkYXRhIHRvICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbnZva2VDb250cm9sbGVyID0gKHRhcmdldE1ldGhvZCwgZGF0YSA9IG51bGwpID0+IHtcclxuICAgICAgY29uc3QgdXJsQmFzZSA9IGAke3RoaXMucHJvcHMuYmFzZVVybH0vJHtjb250cm9sbGVyfS8ke3RhcmdldE1ldGhvZH1gO1xyXG4gICAgICBjb25zdCB1cmwgPSBkYXRhID8gYCR7dXJsQmFzZX0vJHtkYXRhfWAgOiB1cmxCYXNlO1xyXG4gICAgICByZXR1cm4gYXhpb3MuZ2V0KHVybClcclxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3I6IEludm9raW5nICR7Y29udHJvbGxlcn0gZmFpbGVkLlxcblxcbiR7ZXJyfWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhc3luYyBjcmVhdGVIdWIoY3VyQ3JlYXRlKSB7XHJcbiAgICAgIGNvbnN0IHsgcmV0cnksIGNyZWF0ZSB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgaWYgKHJldHJ5ID4gcmV0cmllcykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiBSYW4gb3V0IG9mIHJldHJpZXMgZm9yIHN0YXJ0aW5nICR7aHViTmFtZX0hYCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICByZXRyeTogMCxcclxuICAgICAgICAgIGNyZWF0ZTogMCxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCB7IGJhc2VVcmwsIHNpZ25hbHJBY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xyXG4gICAgICAgIGlmIChiYXNlVXJsICYmIGh1Yk5hbWUpIHtcclxuICAgICAgICAgIGxldCBodWJBZGRyZXNzID0gYmFzZVVybDtcclxuICAgICAgICAgIGlmIChzaWduYWxyUGF0aCkgaHViQWRkcmVzcyA9IGAke2h1YkFkZHJlc3N9LyR7c2lnbmFsclBhdGh9YDtcclxuICAgICAgICAgIGh1YkFkZHJlc3MgPSBgJHtodWJBZGRyZXNzfS8ke2h1Yk5hbWV9YDtcclxuICAgICAgICAgIHRoaXMudG9rZW4gPSBzaWduYWxyQWN0aW9ucy5hY2Nlc3NUb2tlbkZhY3RvcnkoYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub2xkVG9rZW4gPT09IHRoaXMudG9rZW4pIHtcclxuICAgICAgICAgICAgICBpZiAoKGN1ckNyZWF0ZSB8fCBjcmVhdGUpID4gcmV0cmllcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmFibGUgdG8gZ2V0IHVwLXRvLWRhdGUgYWNjZXNzIHRva2VuLicpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgaHViOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICBjcmVhdGU6IChjdXJDcmVhdGUgfHwgY3JlYXRlKSArIDEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMub2xkVG9rZW4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBodWIgPSBuZXcgSHViQ29ubmVjdGlvbkJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAud2l0aFVybChodWJBZGRyZXNzLCB7XHJcbiAgICAgICAgICAgICAgc2tpcE5lZ290aWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHRyYW5zcG9ydDogSHR0cFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0cyxcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IHRoaXMudG9rZW4sXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5idWlsZCgpO1xyXG4gICAgICAgICAgaHViLm9uY2xvc2UgPSB0aGlzLmhhbmRsZUVycm9yO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIGh1YixcclxuICAgICAgICAgICAgcmV0cnk6IHJldHJ5ICsgMSxcclxuICAgICAgICAgICAgY3JlYXRlOiAwLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRIdWIoaHViKSB7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBodWIuc3RhcnQoKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBlbmRpbmcpIHRoaXMucGVuZGluZyA9IHBlbmRpbmcgfHwgTWFwKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHRoaXMuYWN0aXZlID0gYWN0aXZlIHx8IE1hcCgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxyXG4gICAgICAgICAgICAgIHBlbmRpbmc6IHRoaXMucGVuZGluZyxcclxuICAgICAgICAgICAgICByZXRyeTogMCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBFcnJvciB3aGlsZSBlc3RhYmxpc2hpbmcgY29ubmVjdGlvbiB0byBodWIgJHtodWJOYW1lfS5cXG5cXG4ke2Vycn1gKTtcclxuICAgICAgICAgICAgaHViLnN0b3AoKTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVFcnJvciA9IChlcnIpID0+IHtcclxuICAgICAgY29uc3QgeyByZXNwb25zZSwgc3RhdHVzQ29kZSB9ID0gZXJyO1xyXG4gICAgICBjb25zdCB7IHN0YXR1cyB9ID0gcmVzcG9uc2UgfHwge307XHJcbiAgICAgIHN3aXRjaCAoc3RhdHVzIHx8IHN0YXR1c0NvZGUpIHtcclxuICAgICAgICBjYXNlIDUwMDpcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDAxOlxyXG4gICAgICAgICAgdGhpcy5vbGRUb2tlbiA9IHRoaXMudG9rZW47IC8vIGZhbGwgdGhyb3VnaFxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaHViOiBudWxsIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc3RvcEh1YihodWIsIGNsZWFyKSB7XHJcbiAgICAgIGlmIChodWIpIHtcclxuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoY2xlYXIpIHtcclxuICAgICAgICAgIC8vIENsZWFyIHBlbmRpbmdcclxuICAgICAgICAgIHRoaXMucGVuZGluZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5yZW1vdmVGcm9tR3JvdXAoJycpKTtcclxuICAgICAgICAgIC8vIE1lcmdlIGFjdGl2ZSB0byBwZW5kaW5nXHJcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wZW5kaW5nKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnN0YXRlLmFjdGl2ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcubWVyZ2VEZWVwKHRoaXMuc3RhdGUuYWN0aXZlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGh1Yi5zdG9wKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyTGlzdGVuZXIgPSAobmFtZSwgaGFuZGxlcikgPT4ge1xyXG4gICAgICBjb25zdCB7IHBlbmRpbmcsIGFjdGl2ZSwgbW9yaWJ1bmQgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lciBmcm9tIG1vcmlidW5kIGxpc3RlbmVyc1xyXG4gICAgICBpZiAoIXRoaXMubW9yaWJ1bmQpIHRoaXMubW9yaWJ1bmQgPSBtb3JpYnVuZCB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdNb3JpYnVuZCA9IHRoaXMubW9yaWJ1bmQuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgIGlmIChleGlzdGluZ01vcmlidW5kLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ01vcmlidW5kID0gZXhpc3RpbmdNb3JpYnVuZC5maWx0ZXJOb3QoaCA9PiBoID09PSBoYW5kbGVyKTtcclxuICAgICAgICB0aGlzLm1vcmlidW5kID0gcmVtYWluaW5nTW9yaWJ1bmQuc2l6ZVxyXG4gICAgICAgICAgPyB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgcmVtYWluaW5nTW9yaWJ1bmQpIDogdGhpcy5tb3JpYnVuZC5kZWxldGUobmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIHBlbmRpbmcgbGlzdGVuZXJzIChpZiBpdCBpcyBOT1QgYWN0aXZlKVxyXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgaWYgKCFleGlzdGluZ0FjdGl2ZS5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcclxuICAgICAgICBjb25zdCBleGlzdGluZ1BlbmRpbmcgPSB0aGlzLnBlbmRpbmcuZ2V0SW4oW25hbWVdLCBTZXQoKSk7XHJcbiAgICAgICAgaWYgKCFleGlzdGluZ1BlbmRpbmcuaGFzKGhhbmRsZXIpKSB7XHJcbiAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLnBlbmRpbmcuc2V0SW4oW25hbWVdLCBleGlzdGluZ1BlbmRpbmcuYWRkKGhhbmRsZXIpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMucGVuZGluZyAhPT0gcGVuZGluZyB8fCB0aGlzLm1vcmlidW5kICE9PSBtb3JpYnVuZCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgcGVuZGluZzogdGhpcy5wZW5kaW5nLFxyXG4gICAgICAgICAgbW9yaWJ1bmQ6IHRoaXMubW9yaWJ1bmQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdW5yZWdpc3Rlckxpc3RlbmVyID0gKG5hbWUsIGhhbmRsZXIpID0+IHtcclxuICAgICAgY29uc3QgeyBwZW5kaW5nLCBhY3RpdmUsIG1vcmlidW5kIH0gPSB0aGlzLnN0YXRlO1xyXG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXIgZnJvbSBwZW5kaW5nIGxpc3RlbmVyc1xyXG4gICAgICBpZiAoIXRoaXMucGVuZGluZykgdGhpcy5wZW5kaW5nID0gcGVuZGluZyB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdQZW5kaW5nID0gdGhpcy5wZW5kaW5nLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICBpZiAoZXhpc3RpbmdQZW5kaW5nLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ1BlbmRpbmcgPSBleGlzdGluZ1BlbmRpbmcuZmlsdGVyTm90KGggPT4gaCA9PT0gaGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nID0gcmVtYWluaW5nUGVuZGluZy5jb3VudCgpXHJcbiAgICAgICAgICA/IHRoaXMucGVuZGluZy5zZXRJbihbbmFtZV0sIHJlbWFpbmluZ1BlbmRpbmcpXHJcbiAgICAgICAgICA6IHRoaXMucGVuZGluZy5kZWxldGUobmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQWRkIGxpc3RlbmVyIHRvIG1vcmlidW5kIGxpc3RlbmVycyAoaWYgaXQgaXMgYWN0aXZlKVxyXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgY29uc3QgZXhpc3RpbmdBY3RpdmUgPSB0aGlzLmFjdGl2ZS5nZXRJbihbbmFtZV0sIFNldCgpKTtcclxuICAgICAgaWYgKGV4aXN0aW5nQWN0aXZlLmhhcyhoYW5kbGVyKSkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb3JpYnVuZCkgdGhpcy5tb3JpYnVuZCA9IG1vcmlidW5kIHx8IE1hcCgpO1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLmdldEluKFtuYW1lXSwgU2V0KCkpO1xyXG4gICAgICAgIGlmICghZXhpc3RpbmdNb3JpYnVuZC5oYXMoaGFuZGxlcikpIHtcclxuICAgICAgICAgIHRoaXMubW9yaWJ1bmQgPSB0aGlzLm1vcmlidW5kLnNldEluKFtuYW1lXSwgZXhpc3RpbmdNb3JpYnVuZC5hZGQoaGFuZGxlcikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5wZW5kaW5nICE9PSBwZW5kaW5nIHx8IHRoaXMubW9yaWJ1bmQgIT09IG1vcmlidW5kKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBwZW5kaW5nOiB0aGlzLnBlbmRpbmcsXHJcbiAgICAgICAgICBtb3JpYnVuZDogdGhpcy5tb3JpYnVuZCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBhY3RpdmF0ZUxpc3RlbmVycyhodWIsIHBlbmRpbmdQYXJhbSkge1xyXG4gICAgICBsZXQgcGVuZGluZyA9IHBlbmRpbmdQYXJhbTtcclxuICAgICAgaWYgKGh1YiAmJiBwZW5kaW5nUGFyYW0pIHtcclxuICAgICAgICBjb25zdCB7IGNvbm5lY3Rpb24gfSA9IGh1YjtcclxuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBjb25uZWN0aW9uLmNvbm5lY3Rpb25TdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aXZlKSB0aGlzLmFjdGl2ZSA9IGFjdGl2ZSB8fCBNYXAoKTtcclxuICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZS5yZWR1Y2UodGhpcy5jb3VudCwgMCkpIHtcclxuICAgICAgICAgICAgcGVuZGluZyA9IHBlbmRpbmcubWFwRW50cmllcygoW25hbWUsIGN1ckhhbmRsZXJzXSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5hY3RpdmUuZ2V0SW4oW25hbWVdKTtcclxuICAgICAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IGV4aXN0aW5nXHJcbiAgICAgICAgICAgICAgICA/IGN1ckhhbmRsZXJzLmZpbHRlck5vdChoYW5kbGVyID0+IGV4aXN0aW5nLmhhcyhoYW5kbGVyKSlcclxuICAgICAgICAgICAgICAgIDogY3VySGFuZGxlcnM7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGVuZGluZy5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub24obmFtZSwgaGFuZGxlcikpKTtcclxuICAgICAgICAgIHRoaXMuYWN0aXZlID0gdGhpcy5hY3RpdmUubWVyZ2VEZWVwKHBlbmRpbmcpO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIHBlbmRpbmc6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHBlbmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgaW5hY3RpdmF0ZUxpc3RlbmVycyhodWIsIG1vcmlidW5kKSB7XHJcbiAgICAgIGlmIChodWIgJiYgbW9yaWJ1bmQpIHtcclxuICAgICAgICBtb3JpYnVuZC5tYXBFbnRyaWVzKChbbmFtZSwgaGFuZGxlcnNdKSA9PiBoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBodWIub2ZmKG5hbWUsIGhhbmRsZXIpKSk7XHJcbiAgICAgICAgY29uc3QgeyBhY3RpdmUgfSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgdGhpcy5hY3RpdmUgPSBhY3RpdmUgfHwgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLmFjdGl2ZS5tYXBFbnRyaWVzKChbbmFtZSwgY3VySGFuZGxlcnNdKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByZW1vdmFibGUgPSBtb3JpYnVuZC5nZXRJbihbbmFtZV0pO1xyXG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSByZW1vdmFibGVcclxuICAgICAgICAgICAgPyBjdXJIYW5kbGVycy5maWx0ZXJOb3QoaGFuZGxlciA9PiByZW1vdmFibGUuaGFzKGhhbmRsZXIpKVxyXG4gICAgICAgICAgICA6IGN1ckhhbmRsZXJzO1xyXG4gICAgICAgICAgcmV0dXJuIFtuYW1lLCBoYW5kbGVyc107XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlLFxyXG4gICAgICAgICAgbW9yaWJ1bmQ6IHVuZGVmaW5lZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBtb3JpYnVuZDtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgIGNvbnN0IHsgYmFzZVVybCwgc2lnbmFsckFjdGlvbnMsIC4uLnBhc3NUaHJvdWdoUHJvcHMgfSA9IHRoaXMucHJvcHM7XHJcbiAgICAgIGNvbnN0IGh1YlByb3AgPSB7IFtodWJOYW1lXTogdGhpcy5odWJQcm94eSB9O1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIDxXcmFwcGVkQ29tcG9uZW50XHJcbiAgICAgICAgICB7Li4ucGFzc1Rocm91Z2hQcm9wc31cclxuICAgICAgICAgIHsuLi5odWJQcm9wfVxyXG4gICAgICAgIC8+XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbmplY3RTaWduYWxSLmRpc3BsYXlOYW1lID0gYEluamVjdFNpZ25hbFIoJHtnZXREaXNwbGF5TmFtZShXcmFwcGVkQ29tcG9uZW50KX0pYDtcclxuXHJcbiAgSW5qZWN0U2lnbmFsUi5wcm9wVHlwZXMgPSB7XHJcbiAgICBiYXNlVXJsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXHJcbiAgICBzaWduYWxyQWN0aW9uczogUHJvcFR5cGVzLnNoYXBlKHtcclxuICAgICAgZ2V0QWNjZXNzVG9rZW46IFByb3BUeXBlcy5mdW5jLFxyXG4gICAgfSkuaXNSZXF1aXJlZCxcclxuICB9O1xyXG5cclxuICBjb25zdCBnZXRWYWx1ZUZyb21TdGF0ZSA9IChzdGF0ZSwgc291cmNlKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNvdXJjZShzdGF0ZSk7XHJcbiAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHJldHVybiBzb3VyY2U7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gZGlzcGF0Y2ggPT4gKHtcclxuICAgIHNpZ25hbHJBY3Rpb25zOiBiaW5kQWN0aW9uQ3JlYXRvcnMoe1xyXG4gICAgICBhY2Nlc3NUb2tlbkZhY3Rvcnk6ICgpID0+IChkaXNwYXRjaGVyLCBnZXRTdGF0ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gZ2V0U3RhdGUoKTtcclxuICAgICAgICByZXR1cm4gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGFjY2Vzc1Rva2VuKTtcclxuICAgICAgfSxcclxuICAgIH0sIGRpc3BhdGNoKSxcclxuICB9KTtcclxuXHJcbiAgY29uc3QgbWFwU3RhdGVUb1Byb3BzID0gKHN0YXRlKSA9PiB7XHJcbiAgICBjb25zdCBiYXNlVXJsID0gZ2V0VmFsdWVGcm9tU3RhdGUoc3RhdGUsIGJhc2VBZGRyZXNzKTtcclxuICAgIHJldHVybiB7IGJhc2VVcmwgfTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gY29ubmVjdChtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcykoSW5qZWN0U2lnbmFsUik7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbmplY3RTaWduYWxSO1xyXG4iXX0=