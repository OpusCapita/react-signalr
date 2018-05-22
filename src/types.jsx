import PropTypes from 'prop-types';

const { func } = PropTypes;

const hubShape = PropTypes.shape({
  invoke: func.isRequired,
  send: func.isRequired,
  register: func.isRequired,
  unregister: func.isRequired,
});

export default hubShape;
