import skipBackOutline from '@iconify/icons-eva/skip-back-outline';
import skipForwardOutline from '@iconify/icons-eva/skip-forward-outline';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { Icon } from '@iconify/react';
import { Box, Button, IconButton, Tooltip } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import { closeApprovalActionModal, openApprovalActionModal, setHideApprovalList } from '../../redux/slices/approval';
import { useDispatch, useSelector } from '../../redux/store';
import useAuth from '../../hooks/useAuth';
import ApprovalAction from './ApprovalAction';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  height: 36,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 0),
  justifyContent: 'space-between'
}));

// ----------------------------------------------------------------------

export default function ApprovalDetailsToolbar({ ...other }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { hideApprovalList, selectedSidebarItem, isOpenApprovalActionModal, approval } = useSelector((state) => state.approval);
  const [action, setAction] = useState('');
  const [isApprove, setApprove] = useState(true);

  useEffect(() => {
    if (approval) {
      const currentApprover = approval.documentApprovalStates.filter((approver) => (`${approver.userPk.factoryCode}-${approver.userPk.id}` === user.id));
      setApprove(currentApprover[0]?.type === 'APPROVER');
    }
  }, [approval]);

  const handleHideApprovalList = () => {
    dispatch(setHideApprovalList(!hideApprovalList));
  };
  const actionTooltip = hideApprovalList ? 'Show' : 'Hide';

  const handleOpenApprovalActionModal = (action) => {
    setAction(action);
    dispatch(openApprovalActionModal());
  };

  const handleCloseApprovalActionModal = () => {
    dispatch(closeApprovalActionModal());
  };

  return (
    <RootStyle {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={`${actionTooltip} Approval List`}>
          <IconButton onClick={handleHideApprovalList}>
            {hideApprovalList ? <LastPage /> : <FirstPage />}
          </IconButton>
        </Tooltip>
        {selectedSidebarItem === 'pending' &&
          <Box>
            {
              isApprove && <Button variant="outlined" size="small" onClick={() => handleOpenApprovalActionModal('Approve')}>Approve</Button>
            }
            {
              !isApprove && <Button variant="outlined" size="small" onClick={() => handleOpenApprovalActionModal('Consent')}>Consent</Button>
            }
            <Button variant="outlined" size="small" onClick={() => handleOpenApprovalActionModal('Reject')} sx={{ ml: 1 }}>Reject</Button>
          </Box>
        }
        {selectedSidebarItem === 'submission' &&
          <Box>
            {/* <Button variant="outlined" size="small">Status Inquiry</Button> */}
            <Button variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => handleOpenApprovalActionModal('Recall')}>Recall</Button>
          </Box>
        }
        {/* {
          ['notification', 'postponed', 'approved'].indexOf(selectedSidebarItem) !== -1 &&
          <Box>
            <Button variant="outlined" size="small">Status Inquiry</Button>
          </Box>
        } */}
      </Box>
      <ApprovalAction action={action} open={isOpenApprovalActionModal} onClose={handleCloseApprovalActionModal} />
    </RootStyle>
  );
}
