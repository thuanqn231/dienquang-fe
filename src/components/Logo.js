import { Box } from '@material-ui/core';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-unresolved
import ReactLogo from '../statics/logo/logo.PNG';

// ----------------------------------------------------------------------

Logo.propTypes = {
  sx: PropTypes.object
};

export default function Logo({ sx }) {
  return (
    <Box sx={{ width: 30, height: 30, ...sx }}>
      <img src={ReactLogo} alt="Logo" />
    </Box>
  );
}
