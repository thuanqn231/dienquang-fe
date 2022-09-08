import { Icon } from '@iconify/react';
// material
import { ListItemButton, ListItemIcon, ListItemText, Typography, Badge } from '@material-ui/core';
import PropTypes from 'prop-types';
import { getApprovals, getIncomeApprovals, setSelectedSidebarItem } from '../../redux/slices/approval';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import Label from '../../components/Label';

// ----------------------------------------------------------------------

ApprovalSidebarItem.propTypes = {
  label: PropTypes.object.isRequired
};

export default function ApprovalSidebarItem({ label, ...other }) {
  const dispatch = useDispatch();
  const { selectedSidebarItem, sidebarMapParams, searchKeyword } = useSelector((state) => state.approval);
  const isUnread = label.unreadCount > 0;
  const isActive = selectedSidebarItem === label.id;
  const onSelectItem = () => {
    dispatch(setSelectedSidebarItem(label.id));
    const approvalParams = sidebarMapParams[label.id];
    if (searchKeyword) {
      approvalParams.searchKeyword = searchKeyword;
    }
    if (['submission', 'postponed'].indexOf(label.id) !== -1) {
      dispatch(getApprovals(approvalParams));
    } else {
      dispatch(getIncomeApprovals(approvalParams));
    }
  }
  return (
    <ListItemButton
      onClick={onSelectItem}
      sx={{
        px: 1,
        height: 48,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        ...(isActive && { color: 'text.primary', fontWeight: 'fontWeightMedium', bgcolor: 'action.selected' })
      }}
      {...other}
    >
      <ListItemIcon>
        <Icon icon={label.icon} style={{ color: label.color }} width={24} height={24} />
      </ListItemIcon>
      <ListItemText disableTypography primary={label.name} />
      {isUnread && <Label color="error">{label.unreadCount}</Label>}
    </ListItemButton>
  );
}
