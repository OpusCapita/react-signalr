import PropTypes from 'prop-types';

const { func } = PropTypes;

export const hubShape = PropTypes.shape({
  invoke: func.isRequired,
  send: func.isRequired,
  register: func,
  unregister: func,
});