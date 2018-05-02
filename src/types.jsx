import PropTypes from 'prop-types';

const { func, string } = PropTypes;

const hubShape = PropTypes.shape({
  invoke: func.isRequired,
  send: func.isRequired,
  connectionId: string,
  register: func.isRequired,
  unregister: func.isRequired,
});

export default hubShape;
