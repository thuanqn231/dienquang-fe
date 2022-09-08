import PropTypes from 'prop-types';
import { DthButtonPermission, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { camalize } from '../../utils/formatString';
import { updateGridConfig } from '../../utils/gridUtils';

const ActionButtons = (props) => {
    const { pageCode, tableCode, actionButtons, selectedWidgetCode, isChangedTableConfig,
        handleChangeTableConfig, gridApi } = props;
    const { translate } = useLocales();
    const { updateAgGridConfig } = useAuth();

    const onSaveTableConfig = async () => {
        const _columns = gridApi.getColumnDefs();
        handleChangeTableConfig(false);
        try {
            const response = await updateGridConfig(tableCode, pageCode, JSON.stringify(_columns));
            if (response.httpStatusCode === 200) {
                updateAgGridConfig();
                DthMessage({ variant: 'success', message: translate(`message.update_grid_configuration_successful`) });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            {
                actionButtons[selectedWidgetCode] && actionButtons[selectedWidgetCode].map((button) => (
                    <DthButtonPermission
                        key={camalize(button.label)}
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={button.onClick}
                        size="small"
                        label={button.label}
                        pageCode={pageCode}
                        widgetCode={selectedWidgetCode}
                        funcType={button.funcType}
                        disabled={button.disabled || false}
                    />
                ))
            }
            {isChangedTableConfig && (
                <DthButtonPermission
                    key='saveConfig'
                    sx={{ marginLeft: 1 }}
                    variant="outlined"
                    onClick={onSaveTableConfig}
                    size="small"
                    label={translate(`button.saveConfig`)}
                    pageCode={pageCode}
                    widgetCode={selectedWidgetCode}
                    funcType="EXECUTE"
                />
            )}
        </>
    );
}
export default ActionButtons;

ActionButtons.propTypes = {
    pageCode: PropTypes.string,
    tableCode: PropTypes.string,
    actionButtons: PropTypes.object,
    selectedWidgetCode: PropTypes.string,
    isChangedTableConfig: PropTypes.bool,
    handleChangeTableConfig: PropTypes.func,
    gridApi: PropTypes.object
};