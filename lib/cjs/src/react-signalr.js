'use strict';

exports.__esModule = true;

var _types = require('./types');

Object.defineProperty(exports, 'hubShape', {
  enumerable: true,
  get: function get() {
    return _types.hubShape;
  }
});

var _inject = require('./inject');

Object.defineProperty(exports, 'injectSignalR', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_inject).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }