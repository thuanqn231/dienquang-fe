import {
    Box, Button, Card, DialogActions, Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import AgGrid from '../../core/wrapper/AgGrid';
// utils
import { getGridConfig } from '../../utils/pageConfig';

// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.productionResult.grGiResult.giResult';
const tableCode = 'cancelGi';

CancellGi.propTypes = {
    labelToCancel: PropTypes.array,
    onClose: PropTypes.func,
    onCancelGiSuccess: PropTypes.func
};

export default function CancellGi({ labelToCancel, onClose, onCancelGiSuccess }) {
    const { userGridConfig } = useAuth();
    const { themeAgGridClass } = useSettings();
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGiResult, setSelectedGiResult] = useState(null);
    const [selectedGiPlan, setSelectedGiPlan] = useState(null);
    const { translate, currentLang } = useLocales();

    const handleOpenConfirmModal = () => {
        setIsOpenConfirmModal(true);
    }

    const handleCloseConfirmModal = () => {
        setIsOpenConfirmModal(false);
    }

    useEffect(() => {
        const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
        tableConfigs.forEach((column) => {
            column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
        });
        setColumns(tableConfigs);
    }, [userGridConfig]);

    useEffect(() => {
        if (columns) {
            const tableConfigs = [...columns];
            tableConfigs.forEach((column) => {
                column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
            });
            setColumns(tableConfigs);
        }
    }, [currentLang]);

    useEffect(() => {
        if (gridApi) {
            onLoadDataGi();
        }
    }, [gridApi]);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        params.api.addGlobalListener((type, event) => {
            if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
                setIsChangedTableConfig(true);
            }
        });
    };

    const onLoadDataGi = async () => {
        updateData(labelToCancel);
    };

    const updateData = (data) => {
        setRowData(data);
    };

    const handleCancel = async () => {
        setIsSubmitting(true);
        await mutate({
            url: `/v1/gi/gi-result/${selectedGiResult}`,
            method: 'delete',
            featureCode: 'user.delete'
        }).then((res) => {
            if (res.httpStatusCode === 200) {
                setIsSubmitting(false);
                handleCloseConfirmModal();
                onClose();
                onCancelGiSuccess(selectedGiPlan);
            }
        }).catch((error) => {
            setIsSubmitting(false);
            console.error(error);
        });
    }

    const onSelectionChanged = (event) => {
        const rowCount = event.api.getSelectedNodes().length;
        if (rowCount === 0) {
            setSelectedGiResult(null);
        } else if (rowCount === 1) {
            const { factoryPk, goodIssuePlan } = event.api.getSelectedNodes()[0].data;
            setSelectedGiResult(factoryPk);
            setSelectedGiPlan(goodIssuePlan?.factoryPk);
        }
    }

    return (
        <>
            <Card
                sx={{
                    p: 1,
                    borderRadius: '0px',
                    display: 'flex',
                    height: '60vh',
                    minHeight: { xs: '60vh' }
                }}
            >
                <AgGrid
                    columns={columns}
                    rowData={rowData}
                    className={themeAgGridClass}
                    onGridReady={onGridReady}
                    onSelectionChanged={onSelectionChanged}
                    width='100%'
                    height='100%'
                />
            </Card>
            <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button type="button" variant="outlined" color="inherit" onClick={onClose}>
                    {translate(`button.close`)}
                </Button>
                <LoadingButton type="button" loading={isSubmitting} loadingIndicator="Canceling..." variant="contained" onClick={handleOpenConfirmModal} disabled={!selectedGiResult}>
                    {translate(`button.cancelGi`)}
                </LoadingButton>
            </DialogActions>
            <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
                <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to_cancel_this_G/I`)}</Typography>
                <DialogActions>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
                        {translate(`button.no`)}
                    </Button>
                    <LoadingButton loading={isSubmitting} loadingIndicator="Canceling..." type="button" variant="contained" onClick={handleCancel}>
                        {translate(`button.yes`)}
                    </LoadingButton>
                </DialogActions>
            </DialogAnimate>
        </>
    );
}
