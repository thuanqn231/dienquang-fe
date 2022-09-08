import arrowDownwardOutline from '@iconify/icons-eva/arrow-downward-outline';
import arrowUpwardOutline from '@iconify/icons-eva/arrow-upward-outline';
import closeFill from '@iconify/icons-eva/close-fill';
import downloadOutline from '@iconify/icons-eva/download-outline';
import uploadOutline from '@iconify/icons-eva/upload-outline';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip, Typography } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: 36,
  margin: theme.spacing(0, 1),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 0),
  justifyContent: 'space-between'
}));

// ----------------------------------------------------------------------

ApprovalPathCreateToolbar.propTypes = {
  handleMovePath: PropTypes.func,
  handleChangeActionToolbar: PropTypes.func,
  handleChangeActionParallel: PropTypes.func,
  countOfApprover: PropTypes.number
};

// ----------------------------------------------------------------------

export default function ApprovalPathCreateToolbar({ handleMovePath, handleDeleteApprover, handleChangeActionToolbar, handleChangeActionParallel, countOfApprover, selectedLine }) {
  const { translate } = useLocales();
  return (
    <RootStyle>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box>
          <Button variant="outlined" disabled={!selectedLine} size="small" onClick={() => handleChangeActionToolbar('APPROVER')}>{translate(`button.approve`)}</Button>
          <Button variant="outlined" disabled={!selectedLine} size="small" sx={{ ml: 0.2 }} onClick={() => handleChangeActionToolbar('CONSENT')}>{translate(`button.consent`)}</Button>
          <Button variant="outlined" disabled={!selectedLine} size="small" sx={{ ml: 0.2 }} onClick={() => handleChangeActionToolbar('NOTIFICATION')}>{translate(`button.notification`)}</Button>
          {/* <Button variant="outlined" size="small" sx={{ ml: 0.2 }}>Post Approval</Button> */}
          <Button variant="outlined" disabled={!selectedLine} size="small" sx={{ ml: 0.2 }} onClick={() => handleChangeActionParallel('parallel')}>{translate(`button.parallel`)}</Button>
          <Button variant="outlined" disabled={!selectedLine} size="small" sx={{ ml: 0.2 }} onClick={() => handleChangeActionParallel('cancel_parallel')}>{translate(`button.cancel_parallel`)}</Button>
          <Tooltip title="Move to top">
            <IconButton disabled={!selectedLine} onClick={() => handleMovePath('top')}>
              <Icon icon={uploadOutline} width={20} height={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Up">
            <IconButton disabled={!selectedLine} onClick={() => handleMovePath('up')}>
              <Icon icon={arrowUpwardOutline} width={20} height={20} />
            </IconButton>
          </Tooltip>
          <Tooltip disabled={!selectedLine} title="Down">
            <IconButton onClick={() => handleMovePath('down')}>
              <Icon icon={arrowDownwardOutline} width={20} height={20} />
            </IconButton>
          </Tooltip>
          <Tooltip disabled={!selectedLine} title="Move to end">
            <IconButton onClick={() => handleMovePath('bottom')}>
              <Icon icon={downloadOutline} width={20} height={20} />
            </IconButton>
          </Tooltip>
          <Tooltip disabled={!selectedLine} title="Delete">
            <IconButton onClick={() => handleDeleteApprover()}>
              <Icon icon={closeFill} width={20} height={20} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Typography variant="body2">
            {translate(`typo.total`)} {countOfApprover}
          </Typography>
        </Box>
      </Box>
    </RootStyle>
  );
}
