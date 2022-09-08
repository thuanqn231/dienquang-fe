import { SnackActions } from './Notistack';

export default function DthMessage({ variant = 'info', message }) {
    if (message) {
        switch (variant) {
            case 'success':
                SnackActions.success(message);
                break;
            case 'warning':
                SnackActions.warning(message);
                break;
            case 'error':
                SnackActions.error(message);
                break;
            case 'info':
            default:
                SnackActions.info(message);
                break;
        }
    }
};