import { Box, Button, DialogActions, Typography, Divider } from '@material-ui/core';
import PropTypes from 'prop-types';
import { DialogDragable } from '../../components/animate';
import useLocales from '../../hooks/useLocales';

ChangeFactoryWarning.propTypes = {
    isOpen: PropTypes.bool,
    onResetForm: PropTypes.func
};
export default function ChangeFactoryWarning({ isOpen, onChangeFactory }) {
    const { translate } = useLocales();
    const handleReset = (isReset) => {
        onChangeFactory(isReset);
    }

    return (
        <DialogDragable title={translate(`typo.factory_change`)} maxWidth="sm" open={isOpen}>
            <Typography variant="subtitle1" align="center" color="red" sx={{ pt: 1, pb: 2 }}>
                {translate(`typo.you_are_changing_the_factory_information_if_you_choose_yes_all_data_will_be_lost_are_you_sure_to_change`)}
            </Typography>
            <Divider />
            <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button type="button" variant="outlined" color="inherit" onClick={() => handleReset(false)}>
                    {translate(`button.no`)}
                </Button>
                <Button type="button" variant="contained" onClick={() => handleReset(true)}>
                    {translate(`button.yes`)}
                </Button>
            </DialogActions>
        </DialogDragable>
    );
}