import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Divider, Stack, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
//
import { MIconButton } from '../../components/@material-extend';
import { DialogDragable } from '../../components/animate';
import ApprovalActionForm from './ApprovalActionForm';

// ----------------------------------------------------------------------

ApprovalAction.propTypes = {
    open: PropTypes.bool,
    action: PropTypes.string,
    onClose: PropTypes.func
};

export default function ApprovalAction({ action, open, onClose }) {
    return (
        <DialogDragable title={`${action} Comments`} open={open} onClose={onClose} maxWidth="md">
            <ApprovalActionForm action={action} onClose={onClose} />
        </DialogDragable>
    );
}
