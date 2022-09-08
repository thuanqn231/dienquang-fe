import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { MIconButton } from '../../components/@material-extend';

// ----------------------------------------------------------------------

export default function ShowMessage({ message = 'default', variant = 'ghost' }) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    enqueueSnackbar(message, {
        variant,
        action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
            </MIconButton>
        ),
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
    })
}

ShowMessage.propTypes = {
    message: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'error', 'success', 'warning', 'info'])
};