import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Autocomplete, Box,
    Button,
    Card,
    Container,
    DialogActions,
    Grid, IconButton, List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    TextField, Tooltip, Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
import { resetErrorMessage, resetLineStockAdjustment, resetSearchParams, setErrorMessage, setLineStockAdjustment, setSearchParams } from '../../redux/slices/lineStockAdjustmentManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';
import { isNullPk } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { createLineStockAdj, deleteLineStockAdj, handleValidateBeforeProcess, loadDataLineStockAdj, loadStockAdj, updateLineStockAdj } from './helper';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.stockManagement.stockManagement.stockAdjustment.lineStockAdjustment';
const tableCode = 'lineStockAdjustmentHistory';

const useStyles = makeStyles({
    customAccordionSummary: {
        justifyContent: 'space-between !important',
        alignItems: 'center'
    }
});

export default function LineStockAdjustment() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { translate, currentLang } = useLocales();
    const { searchParams, lineStockAdjustment, errorMessage } = useSelector((state) => state.lineStockAdjustmentManagement);
    const { selectedWidget } = useSelector((state) => state.page);
    const { materialDropdown } = useSelector((state) => state.materialMaster);
    const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
    const { userGridConfig, funcPermission, user, commonDropdown } = useAuth();
    const { themeAgGridClass } = useSettings();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isOpenActionModal, setOpenActionModal] = useState(false);
    const [action, setAction] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [selectedAdjIds, setSelectedAdjIds] = useState([]);
    const [hideFilters, setHideFilters] = useState(false);
    const [actionTooltip, setActionTooltip] = useState('Hide');
    const [listOfWidgets, setListOfWidgets] = useState([]);
    const [operation, setOperation] = useState('D051001');
    const [processTime, setProcessTime] = useState(0);
    const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
    const [factories, setFactories] = useState([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const pageSelectedWidget = selectedWidget[pageCode];
    const [materialCode, setMaterialCode] = useState({
        value: '',
        label: ''
    });

    useEffect(() => {
        handleClearAdjustment();
        return () => {
            handleClearAdjustment();
        }
    }, []);

    useEffect(() => {
        dispatch(getMaterialDropdown());
        dispatch(getBizPartnerCodeDropdown());
    }, [dispatch]);

    useEffect(() => {
        const currentPage = funcPermission.filter((permission) => permission.code === pageCode);
        if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
            const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
            setListOfWidgets(activeWidgets);
            if (!isEmpty(activeWidgets) && isUndefined(pageSelectedWidget)) {
                dispatch(
                    setSelectedWidget(
                        {
                            ...selectedWidget,
                            [pageCode]:
                            {
                                widgetCode: activeWidgets[0].code,
                                widgetName: activeWidgets[0].name
                            }
                        }
                    )
                );
            }
        }
    }, [funcPermission]);

    useEffect(() => {
        const {
            organizationalChartProduction: { factoryPks }
        } = user;
        const factories = factoryPks.map((factory) => factory.factoryCode);
        setFactories(factories);
    }, [user]);

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
        setActionTooltip(hideFilters ? 'Show' : 'Hide');
    }, [hideFilters]);

    useEffect(() => {
        if (!isEmpty(lineStockAdjustment) && processTime !== 0) {
            const { errorMessage } = handleValidateBeforeProcess(lineStockAdjustment);
            dispatch(setErrorMessage(errorMessage));
        }
    }, [lineStockAdjustment])

    const handleChangeLineStockAdjsutment = (event) => {
        const _lineStockAdjustment = {
            ...lineStockAdjustment,
            [event.target.name]: `${event.target.value}`
        };
        dispatch(setLineStockAdjustment(_lineStockAdjustment));
    }

    const handleChangeMaterialCode = (value) => {
        const materialCode = value?.value;
        setMaterialCode(value || { value: '', label: '' });
        const _lineStockAdjustment = {
            ...lineStockAdjustment,
            materialCode,
            materialId: value?.materialId,
            materialName: value?.materialName,
            materialDesc: value?.materialDescription,
            unit: value?.materialMainUnit,
        };
        dispatch(setLineStockAdjustment(_lineStockAdjustment));
    }

    const handleHideFilters = () => {
        setHideFilters(!hideFilters);
    };

    const onInquiry = () => {
        onLoadData();
    };

    const handleChangeDateSearchConfig = (name, value) => {
        const _search = {
            ...searchParams,
            [name]: `${value}`
        };
        dispatch(setSearchParams(_search));
    };

    const handleChangeSearchConfig = (event) => {
        const _search = {
            ...searchParams,
            [event.target.name]: `${event.target.value}`
        };
        dispatch(setSearchParams(_search));
    };

    const updateData = (data) => {
        setRowData(data);
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        onLoadData();
    };

    const onLoadData = async () => {
        const params = {
            from: fDate(searchParams.operationFrom),
            to: fDate(searchParams.operationTo),

            operationType: searchParams.operationType,
            objectType: searchParams.objectType,
            reason: searchParams.reason,
            materialID: searchParams.materialId,
            materialName: searchParams.materialName,
            materialCode: searchParams.materialCode,
            registerID: searchParams.registerId,
            lotNo: searchParams.lotNo,
            stock: searchParams.storage,
        };
        parseOrgSearchAll(params, parseSelectedTree);
        const data = await loadDataLineStockAdj(params);
        setSelectedAdjIds([]);
        updateData(data);
    };

    const handleCloseModal = () => {
        setOpenActionModal(false);
    };

    const handleOpenModal = (action) => {
        setOpenActionModal(true);
        setAction(action);
        let actionMsg = '';
        switch (action) {
            case 'Delete':
                actionMsg = translate(`typo.are_you_sure_to_delete`);
                break;
                case 'Modify':
                    actionMsg = translate(`typo.do_you_want_to_modify`);
                    break;
                case 'Register':
            default:
                actionMsg = translate(`typo.do_you_want_to_register`);
                break;
        }
        setActionMsg(actionMsg);
    };

    const onSelectionChanged = async (event) => {
        const rowCount = event.api.getSelectedNodes().length;
        if (rowCount === 0) {
            handleClearAdjustment();
            setSelectedAdjIds([]);
        } else if(rowCount === 1) {
            const selectedAdj = event.api.getSelectedNodes()[0].data.factoryPk;
            setSelectedAdjIds([selectedAdj]);
            const currentAdj = await loadStockAdj(selectedAdj);
            if(currentAdj) {
                const selectedMaterial = materialDropdown.find((material) => material.value === currentAdj?.material?.factoryPk);
                setMaterialCode(selectedMaterial || { value: '', label: '' });
                setOperation(currentAdj?.operationType?.code);
                dispatch(setLineStockAdjustment({
                    factoryPk: currentAdj?.factoryPk || 'null-null',
                    factory: currentAdj?.pk?.factoryCode || '',
                    part:  currentAdj?.line?.part?.factoryPk || '',
                    lineName: currentAdj?.line?.name || '',
                    lineCode: currentAdj?.line?.factoryPk ||'',
                    lotNo: currentAdj?.lotNo || '',
                    supplier: currentAdj?.supplier?.factoryPk || '',
                    materialCode: currentAdj?.material?.factoryPk || '',
                    materialName: currentAdj?.material?.name || '',
                    materialId: currentAdj?.material?.materialId || '',
                    materialDesc: currentAdj?.material?.description || '',
                    unit: currentAdj?.material?.mainUnit?.name || '',
                    qty: currentAdj?.quantity || 0,
                    objectType: currentAdj?.objectType?.code || '',
                    reason: currentAdj?.reason?.code || '',
                    detailReason: currentAdj?.detailReason || ''
                }));
            }
        } else {
            handleClearAdjustment();
            const selectedAdjs = event.api.getSelectedNodes();
            const adjIds = selectedAdjs.map((adj) => adj.data.factoryPk);
            setSelectedAdjIds(adjIds);
        }
    };

    const onClickWidget = (widgetCode, widgetName) => {
        dispatch(
            setSelectedWidget(
                {
                    ...selectedWidget,
                    [pageCode]:
                    {
                        widgetCode,
                        widgetName
                    }
                }
            )
        );
    };

    const handleParseSelectedTree = (selected) => {
        setParseSelectedTree(selected);
    };

    const stopPropagation = (event) => {
        event.stopPropagation();
    };
    const resetSearchParam = () => {
        dispatch(resetSearchParams());
    };

    const ACCORDIONS = [
        {
            value: `panel1`,
            heading: `Organization`,
            defaultExpanded: true,
            detail: (
                <OrganizationTree
                    renderAll
                    parseSelected={handleParseSelectedTree}
                />
            ),
            maxHeight: '35vh'
        },
        {
            value: `panel2`,
            heading: `Widget`,
            defaultExpanded: true,
            detail: (
                <List>
                    {listOfWidgets.map((element) => {
                        const isActive = pageSelectedWidget?.widgetCode === element.code;
                        return (
                            <ListItem key={element.code}>
                                <ListItemButton
                                    sx={{
                                        px: 1,
                                        height: 48,
                                        typography: 'body2',
                                        color: 'text.secondary',
                                        textTransform: 'capitalize',
                                        ...(isActive && {
                                            color: 'text.primary',
                                            fontWeight: 'fontWeightMedium',
                                            bgcolor: 'action.selected'
                                        })
                                    }}
                                    onClick={() => onClickWidget(element.code, element.name)}
                                >
                                    <ListItemText primary={element.name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            )
        },
        {
            value: `panel3`,
            heading: `Search`,
            defaultExpanded: true,
            isClearFilter: true,
            detail: (
                <>
                    <DthDatePicker
                        name="operationFrom"
                        label="Operation Date From"
                        value={searchParams.operationFrom}
                        onChange={(newValue) => {
                            handleChangeDateSearchConfig('operationFrom', newValue);
                        }}
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                    />
                    <DthDatePicker
                        name="operationTo"
                        label="Operation Date To"
                        value={searchParams.operationTo}
                        onChange={(newValue) => {
                            handleChangeDateSearchConfig('operationTo', newValue);
                        }}
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                    />
                    <Dropdown
                        id="operationType"
                        name="operationType"
                        label="Operation Type"
                        value={searchParams.operationType}
                        onChange={handleChangeSearchConfig}
                        groupId='D051000'
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        id="objectType"
                        name="objectType"
                        label="Object Type"
                        value={searchParams.objectType}
                        onChange={handleChangeSearchConfig}
                        groupId='D052000'
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        id="reason"
                        name="reason"
                        label="Operation Type"
                        value={searchParams.reason}
                        onChange={handleChangeSearchConfig}
                        groupId='D053000'
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="materialId"
                        name="materialId"
                        label="Material ID"
                        value={searchParams.materialId}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="materialCode"
                        name="materialCode"
                        label="Material Code"
                        value={searchParams.materialCode}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="materialName"
                        name="materialName"
                        label="Material Name"
                        value={searchParams.materialName}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        id="storage"
                        name="storage"
                        label="Storage"
                        value={searchParams.storage}
                        onChange={handleChangeSearchConfig}
                        options={commonDropdown.wipStorageDropdown.filter((wip) => factories.includes(wip.factory))}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="registerId"
                        name="registerId"
                        label="Register ID"
                        value={searchParams.registerId}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="lotNo"
                        name="lotNo"
                        label="Lot No"
                        value={searchParams.lotNo}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                </>
            )
        }
    ];

    const handleClearAdjustment = () => {
        
        if (gridApi) {
            gridApi.forEachNode((node) => {
                node.setSelected(false);
            });
        }
        setSelectedAdjIds([]);
        setOperation('D051001');
        setProcessTime(0);
        dispatch(resetLineStockAdjustment());
        setMaterialCode({
            value: '',
            label: ''
        });
    }

    const handleValidate = (action) => {
        const { isValid, errorMessage } = handleValidateBeforeProcess(lineStockAdjustment);
        if (!isValid) {
            setProcessTime(processTime + 1);
            dispatch(setErrorMessage(errorMessage));
        } else {
            handleOpenModal(action);
            setProcessTime(0);
            dispatch(resetErrorMessage());
        }
    }

    const handleProcess = () => {
        switch (action) {
            case 'Register':
                handleAdjustLineStock();
                break;
            case 'Modify':
                handleModifyAdjustLineStock();
                break;
            case 'Delete':
                handleDeleteAdjust();
                break;
            default:
                break;
        }
    }

    const handleDeleteAdjust = async () => {
        setSubmitting(true);
        try {
            const res = await deleteLineStockAdj(selectedAdjIds);
            if (res.httpStatusCode === 200) {
                setSubmitting(false);
                onLoadData();
                handleCloseModal();
                enqueueSnackbar(translate(`message.delete_line_stock_adjustment_successful`), {
                    variant: 'success',
                    action: (key) => (
                        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                            <Icon icon={closeFill} />
                        </MIconButton>
                    )
                });
            } else {
                setSubmitting(false);
                handleCloseModal();
            }
        } catch (error) {
            console.error(error);
            setSubmitting(false);
        }
    }

    const handleModifyAdjustLineStock = async () => {
        setSubmitting(true);
        try {
            const stockAdjustment = {
                factoryPk: lineStockAdjustment.factoryPk,
                line: {
                    factoryPk: lineStockAdjustment.lineCode
                },
                lotNo: lineStockAdjustment.lotNo,
                material: {
                    factoryPk: lineStockAdjustment.materialCode
                },
                quantity: lineStockAdjustment.qty,
                objectType: {
                    code: lineStockAdjustment.objectType
                },
                reason: {
                    code: lineStockAdjustment.reason
                },
                operationType: {
                    code: operation
                },
                detailReason: lineStockAdjustment.detailReason,
                pk: {
                    factoryCode: lineStockAdjustment.factory
                }
            }
            if (!isNullPk(lineStockAdjustment.supplier)) {
                stockAdjustment.supplier = {
                    factoryPk: lineStockAdjustment.supplier
                }
            }
            const res = await updateLineStockAdj(stockAdjustment);
            if (res.httpStatusCode === 200) {
                handleClearAdjustment();
                setSubmitting(false);
                onLoadData();
                handleCloseModal();
                enqueueSnackbar(translate(`message.line_stock_adjustment_successful`), {
                    variant: 'success',
                    action: (key) => (
                        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                            <Icon icon={closeFill} />
                        </MIconButton>
                    )
                });
            } else {
                setSubmitting(false);
                handleCloseModal();
            }
        } catch (error) {
            console.error(error);
            setSubmitting(false);
        }
    }

    const handleAdjustLineStock = async () => {
        setSubmitting(true);
        try {
            const stockAdjustment = {
                line: {
                    factoryPk: lineStockAdjustment.lineCode
                },
                lotNo: lineStockAdjustment.lotNo,
                material: {
                    factoryPk: lineStockAdjustment.materialCode
                },
                quantity: lineStockAdjustment.qty,
                objectType: {
                    code: lineStockAdjustment.objectType
                },
                reason: {
                    code: lineStockAdjustment.reason
                },
                operationType: {
                    code: operation
                },
                detailReason: lineStockAdjustment.detailReason,
                pk: {
                    factoryCode: lineStockAdjustment.factory
                }
            }
            if (!isNullPk(lineStockAdjustment.supplier)) {
                stockAdjustment.supplier = {
                    factoryPk: lineStockAdjustment.supplier
                }
            }
            const res = await createLineStockAdj(stockAdjustment);
            if (res.httpStatusCode === 200) {
                handleClearAdjustment();
                setSubmitting(false);
                onLoadData();
                handleCloseModal();
                enqueueSnackbar(translate(`message.line_stock_adjustment_successful`), {
                    variant: 'success',
                    action: (key) => (
                        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                            <Icon icon={closeFill} />
                        </MIconButton>
                    )
                });
            } else {
                setSubmitting(false);
                handleCloseModal();
            }
        } catch (error) {
            console.error(error);
            setSubmitting(false);
        }
    }

    return (
        <Page title={getPageName(pageCode)}>
            <Container sx={{ px: `0px !important` }} maxWidth={false}>
                <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 254px)` }}>
                    {!hideFilters && (
                        <Grid item xs={12} md={2}>
                            <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
                                <Box sx={{ mb: 5 }}>
                                    {ACCORDIONS.map((accordion, index) => (
                                        <Accordion
                                            key={accordion.value}
                                            defaultExpanded={accordion.defaultExpanded}
                                            sx={{
                                                ...(accordion.maxHeight && {
                                                    maxHeight: accordion.maxHeight,
                                                    overflowY: 'auto'
                                                })
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}
                                                classes={{ content: classes.customAccordionSummary }}
                                            >
                                                <Typography variant="subtitle1">{accordion.heading}</Typography>
                                                {accordion.isClearFilter && (
                                                    <>
                                                        {' '}
                                                        <Button onClick={stopPropagation}>
                                                            <a href="#" onClick={resetSearchParam}>
                                                                {translate(`button.clearFilter`)}
                                                            </a>
                                                        </Button>
                                                    </>
                                                )}
                                            </AccordionSummary>
                                            <AccordionDetails>{accordion.detail}</AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            </Card>
                            <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                                <Button onClick={() => onInquiry()} variant="contained" sx={{ width: '100%', height: '100%' }}>
                                    {translate(`button.inquiry`)}
                                </Button>
                            </Card>
                        </Grid>
                    )}
                    <Grid item xs={12} md={hideFilters ? 12 : 10}>
                        <>
                            <Card sx={{ pr: 1, borderRadius: '0px', height: '35px' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                                    <Tooltip title={`${actionTooltip} Filters`}>
                                        <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                                    </Tooltip>
                                    <HeaderBreadcrumbs activeLast pageCode={pageCode} />
                                </Stack>
                            </Card>
                            <>
                                <Card
                                    sx={{
                                        p: 1,
                                        borderRadius: '0px',
                                        display: 'row',
                                        height: 'calc((100% - 35px)/2)',
                                        minHeight: { xs: `calc((80vh - 100px)/2)` }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Stack
                                            direction="row"
                                            justifyContent="left"
                                            display="flex"
                                            alignItems="center"
                                            sx={{ marginTop: `0 !important`, marginBottom: `1 !important`, width: '20%' }}
                                        >
                                            <Typography variant="h5" noWrap sx={{ width: '20%' }}>
                                                {translate(`label.type`)}
                                            </Typography>
                                            <Dropdown
                                                fullWidth
                                                id="operation"
                                                name="operation"
                                                value={operation}
                                                onChange={(e) => {
                                                    setOperation(e.target.value);
                                                }}
                                                allowEmptyOption={false}
                                                groupId="D051000"
                                                sx={{ my: 1 }}
                                                size="small"
                                            />
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            justifyContent="right"
                                            display="flex"
                                            alignItems="center"
                                            sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}
                                        >
                                            <DthButtonPermission
                                                sx={{ marginLeft: 1 }}
                                                variant="contained"
                                                size="small"
                                                label={translate(`button.clear`)}
                                                pageCode={pageCode}
                                                widgetCode={pageSelectedWidget?.widgetCode}
                                                funcType="CREATE"
                                                onClick={handleClearAdjustment}
                                            />
                                            <DthButtonPermission
                                                sx={{ marginLeft: 1 }}
                                                variant="contained"
                                                size="small"
                                                label={translate(`button.register`)}
                                                pageCode={pageCode}
                                                widgetCode={pageSelectedWidget?.widgetCode}
                                                funcType="CREATE"
                                                onClick={() => handleValidate('Register')}
                                                loading={isSubmitting}
                                                loadingIndicator="Registering..."
                                            />
                                            <DthButtonPermission
                                                sx={{ marginLeft: 1 }}
                                                variant="contained"
                                                size="small"
                                                label={translate(`button.modify`)}
                                                pageCode={pageCode}
                                                widgetCode={pageSelectedWidget?.widgetCode}
                                                funcType="UPDATE"
                                                onClick={() => handleValidate('Modify')}
                                                loading={isSubmitting}
                                                loadingIndicator="Modifying..."
                                                disabled={selectedAdjIds.length !== 1}
                                            />
                                        </Stack>
                                    </Stack>
                                    <div className={themeAgGridClass} style={{ height: '75%', width: '100%', overflowY: 'auto' }}>
                                        <Stack spacing={1} sx={{ p: theme => theme.spacing(1, 5, 0, 5) }}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pb: 1 }}>
                                                <Dropdown
                                                    id="factory"
                                                    name="factory"
                                                    label='Factory'
                                                    autoComplete="off"
                                                    fullWidth
                                                    size="small"
                                                    required
                                                    options={commonDropdown.factoryDropdown}
                                                    value={lineStockAdjustment.factory}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    errorMessage={errorMessage?.factory}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Dropdown
                                                    id="part"
                                                    name="part"
                                                    label='Part'
                                                    autoComplete="off"
                                                    fullWidth
                                                    size="small"
                                                    required
                                                    options={commonDropdown.partDropdown.filter((part) => part.factory === lineStockAdjustment.factory)}
                                                    value={lineStockAdjustment.part}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    errorMessage={errorMessage?.part}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Dropdown
                                                    id="lineCode"
                                                    name="lineCode"
                                                    label='Line'
                                                    autoComplete="off"
                                                    fullWidth
                                                    size="small"
                                                    required
                                                    options={commonDropdown.lineDropdown.filter((line) => line.factory === lineStockAdjustment.factory && line.part === lineStockAdjustment.part)}
                                                    value={lineStockAdjustment.lineCode}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    errorMessage={errorMessage?.lineCode}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <TextField
                                                    id="lotNo"
                                                    name="lotNo"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Lot No."
                                                    size="small"
                                                    type='number'
                                                    value={lineStockAdjustment.lotNo}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    error={Boolean(errorMessage?.lotNo)}
                                                    helperText={errorMessage?.lotNo}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Dropdown
                                                    id="supplier"
                                                    name="supplier"
                                                    label="Supplier"
                                                    autoComplete="off"
                                                    fullWidth
                                                    size="small"
                                                    value={lineStockAdjustment.supplier}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    options={bizPartnerCodeDropdown.filter((biz) => biz.factory === lineStockAdjustment.factory)}
                                                    errorMessage={errorMessage?.supplier}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pb: 1 }}>
                                                <Autocomplete
                                                    id="materialCode"
                                                    className="materialCode-select"
                                                    name="materialCode"
                                                    fullWidth
                                                    options={materialDropdown.filter((matr) => matr.factory === lineStockAdjustment.factory)}
                                                    getOptionLabel={(option) => option.label}
                                                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                                                    value={materialCode}
                                                    onChange={(e, value) => {
                                                        handleChangeMaterialCode(value);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            name="materialCode"
                                                            label="Material Code"
                                                            variant="outlined"
                                                            fullWidth
                                                            required
                                                            size="small"
                                                            error={Boolean(errorMessage?.materialCode)}
                                                            helperText={errorMessage?.materialCode}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <TextField
                                                    id="materialName"
                                                    name="materialName"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Material Name"
                                                    size="small"
                                                    disabled
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={lineStockAdjustment.materialName}
                                                />
                                                <TextField
                                                    id="materialId"
                                                    name="materialId"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Material ID"
                                                    size="small"
                                                    disabled
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={lineStockAdjustment.materialId}
                                                />
                                                <TextField
                                                    id="materialDesc"
                                                    name="materialDesc"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Material Desc."
                                                    size="small"
                                                    disabled
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={lineStockAdjustment.materialDesc}
                                                />
                                                <TextField
                                                    id="unit"
                                                    name="unit"
                                                    autoComplete="off"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    label="Unit"
                                                    size="small"
                                                    disabled
                                                    value={lineStockAdjustment.unit}
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <TextField
                                                    id="qty"
                                                    name="qty"
                                                    autoComplete="off"
                                                    fullWidth
                                                    required
                                                    label="Qty"
                                                    size="small"
                                                    type='number'
                                                    value={lineStockAdjustment.qty}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    error={Boolean(errorMessage?.qty)}
                                                    helperText={errorMessage?.qty}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Dropdown
                                                    id="objectType"
                                                    name="objectType"
                                                    label="Object Type"
                                                    autoComplete="off"
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    value={lineStockAdjustment.objectType}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    groupId='D052000'
                                                    errorMessage={errorMessage?.objectType}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Dropdown
                                                    id="reason"
                                                    name="reason"
                                                    label="Reason"
                                                    groupId="D053000"
                                                    size="small"
                                                    fullWidth
                                                    required
                                                    value={lineStockAdjustment.reason}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    errorMessage={errorMessage?.reason}
                                                />
                                                <TextField
                                                    id="detailReason"
                                                    name="detailReason"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Detail Reason"
                                                    size="small"
                                                    required
                                                    value={lineStockAdjustment.detailReason}
                                                    onChange={handleChangeLineStockAdjsutment}
                                                    error={Boolean(errorMessage?.detailReason)}
                                                    helperText={errorMessage?.detailReason}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </Stack>
                                        </Stack>
                                    </div>
                                </Card>
                                <Card
                                    sx={{
                                        p: 1,
                                        borderRadius: '0px',
                                        display: 'row',
                                        height: 'calc((100% - 35px)/2)',
                                        minHeight: { xs: `calc((80vh - 100px)/2)` }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography variant="h5">{translate(`typo.line_stock_adjustment_history`)}</Typography>
                                        <Stack
                                            direction="row"
                                            justifyContent="right"
                                            display="flex"
                                            alignItems="center"
                                            sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}
                                        >
                                            <DthButtonPermission
                                                sx={{ marginLeft: 1 }}
                                                variant="contained"
                                                size="small"
                                                label={translate(`button.delete`)}
                                                pageCode={pageCode}
                                                onClick={() => handleOpenModal('Delete')}
                                                widgetCode={pageSelectedWidget?.widgetCode}
                                                funcType="DELETE"
                                                disabled={isEmpty(selectedAdjIds)}
                                            />
                                        </Stack>
                                    </Stack>
                                    <div className={themeAgGridClass} style={{ height: '88%', width: '100%' }}>
                                        <AgGrid
                                            columns={columns}
                                            rowData={rowData}
                                            className={themeAgGridClass}
                                            onGridReady={onGridReady}
                                            onSelectionChanged={onSelectionChanged}
                                            rowSelection="multiple"
                                            width="100%"
                                            height="100%"
                                        />
                                    </div>
                                </Card>
                            </>
                            <DialogDragable
                                title={`${action}`}
                                maxWidth="sm"
                                open={isOpenActionModal}
                                onClose={handleCloseModal}
                            >
                                <Typography variant="subtitle1" align="center">
                                    {actionMsg}
                                </Typography>
                                <DialogActions>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Button type="button" variant="outlined" color="inherit" onClick={handleCloseModal}>
                                        {translate(`button.no`)}
                                    </Button>
                                    <LoadingButton type="button" variant="contained" onClick={handleProcess} loading={isSubmitting} loadingIndicator="Processing...">
                                        {action === 'Delete' ? translate(`button.delete`) : translate(`button.process`)}
                                    </LoadingButton>
                                </DialogActions>
                            </DialogDragable>
                        </>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
}