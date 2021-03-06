'use strict';

exports.__esModule = true;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var func = _propTypes2.default.func;


var hubShape = _propTypes2.default.shape({
  invoke: func.isRequired,
  send: func.isRequired,
  add: func.isRequired,
  remove: func.isRequired,
  register: func.isRequired,
  unregister: func.isRequired
});

exports.default = hubShape;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy5qc3giXSwibmFtZXMiOlsiZnVuYyIsIlByb3BUeXBlcyIsImh1YlNoYXBlIiwic2hhcGUiLCJpbnZva2UiLCJpc1JlcXVpcmVkIiwic2VuZCIsImFkZCIsInJlbW92ZSIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7SUFFUUEsSSxHQUFTQyxtQixDQUFURCxJOzs7QUFFUixJQUFNRSxXQUFXRCxvQkFBVUUsS0FBVixDQUFnQjtBQUMvQkMsVUFBUUosS0FBS0ssVUFEa0I7QUFFL0JDLFFBQU1OLEtBQUtLLFVBRm9CO0FBRy9CRSxPQUFLUCxLQUFLSyxVQUhxQjtBQUkvQkcsVUFBUVIsS0FBS0ssVUFKa0I7QUFLL0JJLFlBQVVULEtBQUtLLFVBTGdCO0FBTS9CSyxjQUFZVixLQUFLSztBQU5jLENBQWhCLENBQWpCOztrQkFTZUgsUSIsImZpbGUiOiJ0eXBlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmNvbnN0IHsgZnVuYyB9ID0gUHJvcFR5cGVzO1xuXG5jb25zdCBodWJTaGFwZSA9IFByb3BUeXBlcy5zaGFwZSh7XG4gIGludm9rZTogZnVuYy5pc1JlcXVpcmVkLFxuICBzZW5kOiBmdW5jLmlzUmVxdWlyZWQsXG4gIGFkZDogZnVuYy5pc1JlcXVpcmVkLFxuICByZW1vdmU6IGZ1bmMuaXNSZXF1aXJlZCxcbiAgcmVnaXN0ZXI6IGZ1bmMuaXNSZXF1aXJlZCxcbiAgdW5yZWdpc3RlcjogZnVuYy5pc1JlcXVpcmVkLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGh1YlNoYXBlO1xuIl19