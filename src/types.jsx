import PropTypes from 'prop-types';

const { func, string } = PropTypes;

export const hubShape = PropTypes.shape({
  invoke: func.isRequired,
  send: func.isRequired,
  connectionId: string,
  register: func.isRequired,
  unregister: func.isRequired,
});