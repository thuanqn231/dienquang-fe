import { Box, Link, Typography } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
//
import { MAvatar, MHidden } from '../../components/@material-extend';
// utils
import createAvatar from '../../utils/createAvatar';
import { fDateTimeSuffix } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: 36,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  justifyContent: 'space-between'
}));

// ----------------------------------------------------------------------

ApprovalDetailsInfo.propTypes = {
  approval: PropTypes.object
};

export default function ApprovalDetailsInfo({ approval, ...other }) {
  return (
    <RootStyle {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <MAvatar alt={`${approval.userRequest.firstName} ${approval.userRequest.lastName}`} src={approval.userRequest.avatar} color={createAvatar(approval.userRequest.firstName).color}>
          {createAvatar(approval.userRequest.firstName).name}
        </MAvatar>

        <Box sx={{ ml: 2 }}>
          <Typography display="inline" variant="subtitle2">
            {`${approval.userRequest.firstName} ${approval.userRequest.lastName}`}
          </Typography>
          <Link variant="caption" sx={{ color: 'text.secondary' }}>
            &nbsp; {`<${approval.userRequest.email}>`}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            &nbsp; {`<${approval.userRequest.department.name}>`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <MHidden width="smDown">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fDateTimeSuffix(approval.requestTime)}
          </Typography>
        </MHidden>
      </Box>
    </RootStyle>
  );
}
