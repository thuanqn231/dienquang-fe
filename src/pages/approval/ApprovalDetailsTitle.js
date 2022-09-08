import { Box, Typography } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: 32,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  justifyContent: 'space-between'
}));

// ----------------------------------------------------------------------

ApprovalDetailsTitle.propTypes = {
  approval: PropTypes.object
};

export default function ApprovalDetailsTitle({ approval, ...other }) {
  return (
    <RootStyle {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography display="inline" variant="subtitle1">
            {approval.title}
          </Typography>
        </Box>
      </Box>
    </RootStyle>
  );
}
