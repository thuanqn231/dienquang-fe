import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card, Checkbox, Container, FormControlLabel, FormGroup, Grid, IconButton, List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    TextField, Tooltip, Typography,
    Backdrop,
    CircularProgress
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { createStyles, makeStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSearchParams } from '../../redux/slices/giResultManagement';
import { getMrpDropdown } from '../../redux/slices/mrpManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { capitalizeFirstChar, getFactoryAndIdByPk, isNullVal } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
// utils
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import DetailStock from '../gr-result/DetailStock';
import CancelGi from './CancelGi';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.productionResult.grGiResult.giResult';
const tableGrPlanInfo = 'giPlanInfo';
const tableStockInfo = 'stockInfo';

const pxToRem = (value) => `${value / 16}rem`;

const useStyles = makeStyles((theme) =>
    createStyles({
        yellowBg: {
            backgroundColor: '#ffff00'
        },
        greenBg: {
            animation: `$greenBgEffect 4000ms linear infinite`
        },
        greyBg: {
            backgroundColor: '#ebebeb'
        },
        redBg: {
            animation: `$redBgEffect 4000ms linear infinite`
        },
        inputScanner: {
            "& .MuiFilledInput-root": {
                background: "#ffff00",
                fontSize: "1.5rem"
            },
            "& .MuiFilledInput-input": {
                textAlign: 'center',
                padding: theme.spacing(1)
            }
        },
        "@keyframes greenBgEffect": {
            "0%": {
                backgroundColor: '#098d41',
                color: 'white'
            },
            "25%": {
                backgroundColor: '#ffe6e6',
                color: '#a1a5a9'
            },
            "50%": {
                backgroundColor: '#098d41',
                color: 'white'
            },
            "75%": {
                backgroundColor: '#ffe6e6',
                color: '#a1a5a9'
            },
            "100%": {
                backgroundColor: '#098d41',
                color: 'white'
            }
        },
        "@keyframes redBgEffect": {
            "0%": {
                backgroundColor: '#ff1a1a',
                color: 'white'
            },
            "25%": {
                backgroundColor: '#ffe6e6',
                color: '#a1a5a9'
            },
            "50%": {
                backgroundColor: '#ff1a1a',
                color: 'white'
            },
            "75%": {
                backgroundColor: '#ffe6e6',
                color: '#a1a5a9'
            },
            "100%": {
                backgroundColor: '#ff1a1a',
                color: 'white'
            }
        },
        blueBg: {
            backgroundColor: '#1782a7'
        },
        rootCard: {
            padding: theme.spacing(3, 2),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        }
    })
);

const defaultStockConfig = {
    order: '',
    actualAndPlanQty: '',
    customerOrLine: '',
    labelQty: 0,
    matrCode: '',
    matrDesc: '',
    stock: '',
    zone: '',
    bin: ''
}

export default function GiResultList() {
    const dispatch = useDispatch();
    const classes = useStyles();
    const { translate, currentLang } = useLocales();
    const { searchParams } = useSelector((state) => state.giResultManagement);
    const { mrpDropdown } = useSelector((state) => state.mrpManagement);
    const { selectedWidget } = useSelector((state) => state.page);
    const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
    const { themeAgGridClass } = useSettings();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [stockConfig, setStockConfig] = useState(defaultStockConfig);
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowDataStock, setRowDataStock] = useState(null);
    const [columnsStock, setColumnsStock] = useState(null);
    const [gridApiStock, setGridApiStock] = useState(null);
    const [gridColumnApiStock, setGridColumnApiStock] = useState(null);
    const [isOpenActionModal, setOpenActionModal] = useState(false);
    const [modalAction, setModalAction] = useState('Register');
    const [currentGi, setCurrentGi] = useState({});
    const [selectedGi, setSelectedGi] = useState(null);
    const [labelId, setLabelId] = useState(null);
    const [hideFilters, setHideFilters] = useState(false);
    const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
    const [listOfWidgets, setListOfWidgets] = useState([]);
    const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
    const [boxLabelScanner, setBoxLabelScanner] = useState("");
    const [scanStatus, setScanStatus] = useState(true);
    const [allowGi, setAllowGi] = useState(false);
    const [cancelGi, setCancelGi] = useState(false);
    const [giMessages, setGiMessages] = useState([]);
    const [maxAllowGi, setMaxAllowGi] = useState(0);
    const [giTime, setGiTime] = useState(1);
    const [labelToCancel, setLabelToCancel] = useState([]);
    const [detailParams, setDetailParams] = useState({});
    const [totalStock, setTotalStock] = useState(0);
    const [isSubmitting, setSubmitting] = useState(false);;
    const [stockAction, setStockAction] = useState('gi');
    const [factories, setFactories] = useState([]);
    const [autoGi, setAutoGi] = useState(true);
    const [isProcessing, setProcessing] = useState(false);
    const [updateLabelIdDone, setUpdateLabelIdDone] = useState(false);
    const [updateAllowGiDone, setUpdateAllowGiDone] = useState(false);
    const [updateLabelToCancelDone, setUpdateLabelToCancelDone] = useState(false);
    const pageSelectedWidget = selectedWidget[pageCode];

    useEffect(() => {
        dispatch(getMrpDropdown());
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
        const tableConfigs = getGridConfig(userGridConfig, pageCode, tableGrPlanInfo);
        const tableConfigsStock = getGridConfig(userGridConfig, pageCode, tableStockInfo);
        tableConfigs.forEach((column) => {
            column.headerName = translate(`data_grid.${tableGrPlanInfo}.${column.field}`);
        });
        tableConfigsStock.forEach((column) => {
            column.headerName = translate(`data_grid.${tableStockInfo}.${column.field}`);
        });
        setColumns(tableConfigs);
        setColumnsStock(tableConfigsStock);
    }, [userGridConfig]);

    useEffect(() => {
        if (columns) {
            const tableConfigs = [...columns];
            const tableConfigsStock = [...columnsStock];
            tableConfigs.forEach((column) => {
                column.headerName = translate(`data_grid.${tableGrPlanInfo}.${column.field}`);
            });
            tableConfigsStock.forEach((column) => {
                column.headerName = translate(`data_grid.${tableStockInfo}.${column.field}`);
            });
            setColumns(tableConfigs);
            setColumnsStock(tableConfigsStock);
        }
    }, [currentLang]);

    useEffect(() => {
        if (gridColumnApiStock && gridColumnApi && gridApi) {
            onLoadData();
        }
    }, [gridColumnApiStock, gridColumnApi, gridApi]);

    useEffect(() => {
        let _updateLableIdDone = false;
        if (labelId) {
            _updateLableIdDone = true;
        }
        setUpdateLabelIdDone(_updateLableIdDone);
    }, [labelId]);

    useEffect(() => {
        let _updateLabelToCancelDone = false;
        if (!isEmpty(labelToCancel)) {
            _updateLabelToCancelDone = true;
        }
        setUpdateLabelToCancelDone(_updateLabelToCancelDone);
    }, [labelToCancel]);

    useEffect(() => {
        if (!cancelGi && boxLabelScanner && labelId && allowGi && autoGi && updateAllowGiDone && updateLabelIdDone) {
            onGoodIssued();
        }

    }, [boxLabelScanner, labelId, allowGi, autoGi, labelToCancel, updateLabelToCancelDone, updateAllowGiDone, updateLabelIdDone]);

    useEffect(() => {
        if (cancelGi && autoGi && boxLabelScanner && !isEmpty(labelToCancel) && updateLabelToCancelDone) {
            onGoodIssued();
        }
    }, [cancelGi, boxLabelScanner, labelToCancel, updateLabelToCancelDone, autoGi]);

    useEffect(() => {
        let _updateAllowGiDone = false;
        if (allowGi) {
            _updateAllowGiDone = true;
        }
        setUpdateAllowGiDone(_updateAllowGiDone);
    }, [allowGi]);

    useEffect(() => {
        const {
            organizationalChartProduction: { factoryPks }
        } = user;
        const factories = factoryPks.map((factory) => factory.factoryCode);
        setFactories(factories);
    }, [user]);

    const handleHideFilters = () => {
        setHideFilters(!hideFilters);
    };
    const actionTooltip = hideFilters ? 'Show' : 'Hide';

    const onInquiry = () => {
        onLoadData();
    };

    const handleChangeDateSearchConfig = (name, value) => {
        const _search = {
            ...searchParams,
            [name]: `${fDate(value)}`
        };
        dispatch(setSearchParams(_search));
    }
    const handleChangeSearchConfig = (event) => {
        const _search = {
            ...searchParams,
            [event.target.name]: `${event.target.value}`
        };
        dispatch(setSearchParams(_search));
    };

    const handleChangeSearchCheckConfig = (event) => {
        const _search = {
            ...searchParams,
            [event.target.name]: event.target.checked
        };
        dispatch(setSearchParams(_search));
    };

    const handleChangeStockConfig = (event) => {
        const _stockConfig = {
            ...stockConfig,
            [event.target.name]: `${event.target.value}`
        };
        setStockConfig(_stockConfig);
    };

    const updateData = (dataPlan, dataStock) => {
        if (gridColumnApiStock) {
            setRowDataStock(dataStock);
        }
        if (gridColumnApi) {
            setRowData(dataPlan);
        }
    };

    const updateStock = (dataStock) => {
        if (gridColumnApiStock) {
            setRowDataStock(dataStock);
        }
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        params.api.addGlobalListener((type, event) => {
            if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
                setIsChangedTableConfig(true);
            }
        });
        // onLoadData();
    };

    const onGridReadyStock = (params) => {
        setGridApiStock(params.api);
        setGridColumnApiStock(params.columnApi);
        params.api.addGlobalListener((type, event) => {
            if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
                setIsChangedTableConfig(true);
            }
        });
    };

    const onLoadData = (updateAll = true) => {
        if (gridColumnApiStock) {
            ['lotNo', 'supplier', 'boxNo', 'stockStatus', 'labelType'].forEach((field) => {
                if (field === 'labelType') {
                    let isShowLabelType = false;
                    if (searchParams.isBoxNo) {
                        isShowLabelType = true;
                    }
                    gridColumnApiStock.setColumnVisible(field, isShowLabelType);
                } else {
                    const fieldNm = `is${capitalizeFirstChar(field)}`;
                    gridColumnApiStock.setColumnVisible(field, searchParams[fieldNm]);
                }

            });
        }
        if (gridApiStock) {
            gridApiStock.sizeColumnsToFit();
        }
        const params = {
            from: fDate(searchParams.fromDate),
            to: fDate(searchParams.toDate),
            type: searchParams.type,
            giNo: searchParams.giNo,
            order: searchParams.order,
            materialCode: searchParams.materialCode,
            materialName: searchParams.materialName,
            supplier: searchParams.supplier,
            giType: searchParams.giType,
            stockStatus: searchParams.stockStatus,
            lotNoDisplay: searchParams.isLotNo,
            supplierDisplay: searchParams.isSupplier,
            labelDisplay: searchParams.isBoxNo,
            stockStatusDisplay: searchParams.isStockStatus
        };
        if (!isNullVal(searchParams.mrp)) {
            params.mrp = searchParams.mrp;
        }
        if (searchParams.supplier) {
            params.supplier = searchParams.supplier
        }
        if (searchParams.stock) {
            params.stock = searchParams.stock
        }
        if (searchParams.zone) {
            params.zone = searchParams.zone
        }
        if (searchParams.bin) {
            params.bin = searchParams.bin
        }
        parseOrgSearchFactory(params, parseSelectedTree);
        query({
            url: '/v1/gi/gi-result/search',
            featureCode: 'user.create',
            params
        })
            .then((res) => {
                if (updateAll) {
                    updateData(parsePlans(res.data), parseGiResults(res.data.stockMovements));
                } else {
                    updateStock(parseGiResults(res.data.stockMovements));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const parseGiResults = (rawResults) => (
        rawResults.map((gi) => (
            {
                pk: gi?.label?.labelDetail?.material?.pk || {},
                factoryPk: gi?.label?.labelDetail?.material?.factoryPk || 'null-null',
                labelType: gi?.label?.labelType?.name || '',
                materialId: gi?.label?.labelDetail?.material?.materialId || '',
                materialCode: gi?.label?.labelDetail?.material?.code || '',
                materialName: gi?.label?.labelDetail?.material?.name || '',
                materialType: gi?.label?.labelDetail?.material?.materialType?.name || '',
                description: gi?.label?.labelDetail?.material?.description || '',
                unitName: gi?.label?.labelDetail?.material?.mainUnit?.name || '',
                stockQty: gi?.sumStockQty || 0,
                lotNo: gi?.label?.lotNo || '',
                supplier: gi?.label?.labelDetail?.supplier?.nationalName || '',
                boxNo: gi?.label?.labelNo || '',
                stockStatus: gi?.stockStatus?.name || '',
            }
        ))
    )

    const parsePlans = (rawPlans) => {
        const plans = [];
        if (rawPlans?.productions) {
            const { productions } = rawPlans;
            productions.forEach((prod) => {
                plans.push({
                    pk: prod?.pk,
                    factoryPk: prod?.factoryPk,
                    factoryName: prod?.pk?.factoryName,
                    type: 'Production',
                    planDate: prod?.planDate,
                    giNo: prod?.giNo,
                    orderNo: prod?.plan?.prodOrderNo,
                    materialPk: prod?.material?.factoryPk,
                    materialId: prod?.material?.materialId,
                    materialCode: prod?.material?.code,
                    materialName: prod?.material?.name,
                    materialDescription: prod?.material?.description,
                    mrpName: prod?.material?.mrp?.name,
                    planQty: prod?.planQty,
                    actualQty: prod?.actualQty,
                    unit: prod?.material?.mainUnit?.name,
                    giType: prod?.giType?.name,
                    supplier: '',
                    processType: prod?.line?.processType?.name,
                    qcResult: '',
                    lineCode: prod?.line?.code,
                    lineName: prod?.line?.name,
                    remark: prod?.remark,
                    state: prod?.state,
                    usrLogI: prod?.usrLogI,
                    dteLogI: prod?.dteLogI,
                    usrLogU: prod?.usrLogU,
                    dteLogU: prod?.dteLogU,
                })
            })
        }
        if (rawPlans?.shippings) {
            const { shippings } = rawPlans;
            shippings.forEach((shipping) => {
                plans.push({
                    pk: shipping?.pk,
                    factoryPk: shipping?.factoryPk,
                    factoryName: shipping?.pk?.factoryName,
                    type: 'Shipping',
                    planDate: shipping?.planDate,
                    giNo: shipping?.giNo,
                    orderNo: shipping?.soNo,
                    materialPk: shipping?.material?.factoryPk,
                    materialId: shipping?.material?.materialId,
                    materialCode: shipping?.material?.code,
                    materialName: shipping?.material?.name,
                    materialDescription: shipping?.material?.description,
                    mrpName: shipping?.material?.mrp?.name,
                    planQty: shipping?.planQty,
                    actualQty: shipping?.actualQty,
                    unit: shipping?.material?.mainUnit?.name,
                    giType: shipping?.giType?.name,
                    supplier: shipping?.supplier.nationalName,
                    processType: '',
                    qcResult: '',
                    lineCode: '',
                    lineName: '',
                    remark: shipping?.remark,
                    state: shipping?.state,
                    usrLogI: shipping?.usrLogI,
                    dteLogI: shipping?.dteLogI,
                    usrLogU: shipping?.usrLogU,
                    dteLogU: shipping?.dteLogU,
                })
            })
        }
        return plans;
    }

    const handleCloseModal = () => {
        setOpenActionModal(false);
    };

    const handleOpenModal = (action) => {
        setModalAction(action)
        setOpenActionModal(true);
    };

    const onSelectionChanged = (event) => {
        const rowCount = event.api.getSelectedNodes().length;
        if (rowCount === 0) {
            setSelectedGi(null);
            setCurrentGi({})
        } else if (rowCount === 1) {
            const { factoryPk, type, planQty, planDate, giNo, materialPk, actualQty } = event.api.getSelectedNodes()[0].data;
            setSelectedGi(factoryPk);
            setCurrentGi({
                factoryPk,
                planQty,
                actualQty: actualQty || 0,
                planDate,
                giNo,
                material: {
                    factoryPk: materialPk
                }
            });
        }
    };
    const selectProductionOrderWarning = () => {
        enqueueSnackbar(translate(`message.please_select_1_production_order`), {
            variant: 'warning',
            action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                </MIconButton>
            )
        });
    }

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

    const ACCORDIONS = [
        {
            value: `panel1`,
            heading: `Organization`,
            defaultExpanded: true,
            detail: (
                <OrganizationTree
                    parseSelected={handleParseSelectedTree}
                />
            )
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
            detail: (
                <>
                    <Dropdown
                        id="type"
                        name="type"
                        label="Type"
                        allowEmptyOption={false}
                        value={searchParams.type}
                        onChange={handleChangeSearchConfig}
                        options={[
                            { value: 'All', label: 'All' },
                            { value: 'Shipping', label: 'Shipping' },
                            { value: 'Production', label: 'Production' }
                        ]}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <DthDatePicker
                        name="fromDate"
                        label="Plan Date From"
                        value={searchParams.fromDate}
                        onChange={(newValue) => {
                            handleChangeDateSearchConfig("fromDate", newValue)
                        }}
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                    />
                    <DthDatePicker
                        name="toDate"
                        label="Plan Date To"
                        value={searchParams.toDate}
                        onChange={(newValue) => {
                            handleChangeDateSearchConfig("toDate", newValue)
                        }}
                        sx={{ my: 1 }}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="giNo"
                        name="giNo"
                        label="G/I No"
                        value={searchParams.giNo}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="order"
                        name="order"
                        label="PO No."
                        value={searchParams.order}
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
                        id="mrp"
                        name="mrp"
                        label="MRP Controller"
                        value={searchParams.mrp}
                        onChange={handleChangeSearchConfig}
                        options={mrpDropdown}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        id="giType"
                        name="giType"
                        label="G/I Type"
                        value={searchParams.giType}
                        onChange={handleChangeSearchConfig}
                        groupId='D020000'
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        id="supplier"
                        name="supplier"
                        label="Supplier"
                        value={searchParams.supplier}
                        onChange={handleChangeSearchConfig}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        fullWidth
                        id="stock"
                        name="stock"
                        label="Storage"
                        value={searchParams.stock}
                        onChange={handleChangeSearchConfig}
                        options={commonDropdown.stockDropdown}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        fullWidth
                        id="zone"
                        name="zone"
                        label="Zone"
                        value={searchParams.zone}
                        onChange={handleChangeSearchConfig}
                        options={commonDropdown.zoneDropdown}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        fullWidth
                        id="bin"
                        name="bin"
                        label="Bin"
                        value={searchParams.bin}
                        onChange={handleChangeSearchConfig}
                        options={commonDropdown.binDropdown}
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Dropdown
                        id="stockStatus"
                        name="stockStatus"
                        label="Stock Status"
                        value={searchParams.stockStatus}
                        onChange={handleChangeSearchConfig}
                        groupId='D025000'
                        sx={{ my: 1 }}
                        size="small"
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name='isLotNo'
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={searchParams.isLotNo}
                                        onChange={handleChangeSearchCheckConfig}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                }
                                label="LotNo."
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name='isSupplier'
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={searchParams.isSupplier}
                                        onChange={handleChangeSearchCheckConfig}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                }
                                label="Supplier"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name='isBoxNo'
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={searchParams.isBoxNo}
                                        onChange={handleChangeSearchCheckConfig}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                }
                                label="Label"
                            />
                        </FormGroup>
                    </Stack>
                </>
            )
        }
    ];

    const onCellClicked = (gridApi) => {
        if (gridApi.column.colId === "actualQty" && gridApi.value > 0) {
            setDetailParams({
                from: fDate(searchParams.fromDate),
                to: fDate(searchParams.toDate),
                giNo: gridApi.data.giNo,
                factoryCode: gridApi.data.pk.factoryCode
            });
            setStockAction('gi');
            handleOpenModal('Detail Stock Info');
            setTotalStock(gridApi.value);
        }
    }

    const onCellClickedStock = (gridApi) => {
        if (gridApi.column.colId === "stockQty" && gridApi.value > 0) {
            const detailParams = {
                type: searchParams.type,
                giNo: searchParams.giNo,
                order: searchParams.order,
                materialCode: gridApi.data.materialCode,
                materialName: searchParams.materialName,
                giType: searchParams.giType,
                stockStatus: searchParams.stockStatus,
                lotNoDisplay: searchParams.isLotNo,
                supplierDisplay: searchParams.isSupplier,
                labelDisplay: searchParams.isBoxNo,
                stockStatusDisplay: searchParams.isStockStatus,
                factoryCode: gridApi.data.pk.factoryCode
            };
            if (searchParams.stock) {
                detailParams.stock = searchParams.stock
            }
            if (searchParams.zone) {
                detailParams.zone = searchParams.zone
            }
            if (searchParams.bin) {
                detailParams.bin = searchParams.bin
            }
            if (!isNullVal(searchParams.mrp)) {
                detailParams.mrp = searchParams.mrp;
            }
            if (searchParams.isLotNo) {
                detailParams.lotNo = gridApi.data.lotNo
            }
            if (searchParams.isSupplier) {
                if (gridApi.data.supplier) {
                    detailParams.supplier = gridApi.data.supplier
                } else {
                    detailParams.supplier = 'system_supplier_null'
                }
            }
            if (searchParams.isBoxNo) {
                detailParams.label = gridApi.data.boxNo
            }
            setStockAction('stock');
            setDetailParams(detailParams);
            setTotalStock(gridApi.value);
            handleOpenModal('Detail Stock Info');
        }
    }

    const onScanBoxLabel = () => {
        if (!selectedGi && !cancelGi) {
            setGiMessages(appendMsg(`G/I Plan wasn't selected`, 'error'));
            setScanStatus(false);
            setAllowGi(false);
            return;
        }
        setProcessing(true);
        if (cancelGi) {
            mutate({
                url: `/v1/gi/gi-result/check-cancel-label`,
                data: {
                    giResult: {
                        label: {
                            labelNo: boxLabelScanner
                        }
                    }
                },
                method: 'post',
                featureCode: 'user.create',
                isShowMessage: false
            }).then((res) => {
                const { data } = res;
                if (data) {
                    const _scanTime = data?.scanTime || 1;
                    setGiTime(_scanTime);
                    setLabelToCancel(data?.giResults || []);
                    setGiMessages(appendMsg(`${boxLabelScanner} was scan successfully`, 'success'));
                    setScanStatus(true);
                    setAllowGi(true);
                    setStockConfig({
                        ...stockConfig,
                        order: _scanTime === 1 ? data?.stockMovement?.label?.labelDetail?.orderNo : '',
                        actualAndPlanQty: '',
                        customerOrLine: _scanTime === 1 ? data?.stockMovement?.label?.labelDetail?.supplier?.nationalName || '' : '',
                        labelQty: _scanTime === 1 ? data?.stockMovement?.stockQty || '' : '',
                        matrCode: data?.stockMovement?.label?.labelDetail?.material?.code || '',
                        matrDesc: data?.stockMovement?.label?.labelDetail?.material?.description || '',
                        bin: data?.stockMovement?.bin?.factoryPk || 'null-null',
                        zone: data?.stockMovement?.bin?.zone?.factoryPk || 'null-null',
                        stock: data?.stockMovement?.bin?.zone?.stock?.factoryPk || 'null-null',
                    });
                }
            }).catch((error) => {
                setProcessing(false);
                setGiMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
                setScanStatus(false);
                setAllowGi(false);
                resetUpdateStatus();
                console.error(error);
            });
        } else {
            mutate({
                url: `/v1/gi/gi-result/check-label`,
                data: {
                    giResult: {
                        goodIssuePlan: currentGi,
                        label: {
                            labelNo: boxLabelScanner
                        }
                    }
                },
                method: 'post',
                featureCode: 'user.create',
                isShowMessage: false
            }).then((res) => {
                const { data } = res;
                if (data) {
                    const _maxAllowGi = Math.min(data.allowMaxQtyScan, data.labelQtyRemaining);
                    setMaxAllowGi(_maxAllowGi);
                    setGiMessages(appendMsg(`${boxLabelScanner} was scan successfully`, 'success'));
                    setScanStatus(true);
                    setAllowGi(true);
                    setLabelId(data?.stockMovement?.label?.factoryPk);
                    setStockConfig({
                        ...stockConfig,
                        order: data?.stockMovement?.label?.labelDetail?.orderNo || '',
                        actualAndPlanQty: `${currentGi?.actualQty}/${currentGi?.planQty}`,
                        customerOrLine: data?.stockMovement?.label?.labelDetail?.supplier?.nationalName || '',
                        labelQty: _maxAllowGi || 0,
                        matrCode: data?.stockMovement?.label?.labelDetail?.material?.code || '',
                        matrDesc: data?.stockMovement?.label?.labelDetail?.material?.description || '',
                        bin: data?.stockMovement?.bin?.factoryPk || 'null-null',
                        zone: data?.stockMovement?.bin?.zone?.factoryPk || 'null-null',
                        stock: data?.stockMovement?.bin?.zone?.stock?.factoryPk || 'null-null',
                    });
                }
            }).catch((error) => {
                setProcessing(false);
                setGiMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
                setScanStatus(false);
                setAllowGi(false);
                setLabelId(null);
                resetUpdateStatus();
                console.error(error);
            });
        }
        if (!autoGi) {
            setProcessing(false);
        }
    }

    const resetUpdateStatus = () => {
        setUpdateLabelIdDone(false);
        setUpdateAllowGiDone(false);
    }

    const appendMsg = (msg, type) => {
        const newMsg = [...giMessages];
        newMsg.unshift({ msg, type });
        return newMsg;
    }

    const onGoodIssued = () => {
        setSubmitting(true);
        if (cancelGi) {
            if (giTime === 1) {
                const selectedGiResult = labelToCancel[0]?.factoryPk;
                mutate({
                    url: `/v1/gi/gi-result/${selectedGiResult}`,
                    method: 'delete',
                    featureCode: 'user.delete'
                }).then((res) => {
                    if (res.httpStatusCode === 200) {
                        setLabelToCancel([]);
                        onCancelGiSuccess(labelToCancel[0]?.goodIssuePlan?.factoryPk);
                        setSubmitting(false);
                        setProcessing(false);
                        resetUpdateStatus();
                    }
                }).catch((error) => {
                    console.error(error);
                    setSubmitting(false);
                    setProcessing(false);
                    resetUpdateStatus();
                });
            } else {
                handleOpenModal('Cancel G/I');
                setProcessing(false);
            }
        } else {
            const { factoryCode } = getFactoryAndIdByPk(selectedGi);
            mutate({
                url: `/v1/gi/gi-result/create`,
                data: {
                    giResult: {
                        goodIssuePlan: {
                            factoryPk: selectedGi,
                            giNo: currentGi.giNo
                        },
                        lotNo: stockConfig.lotNo,
                        bin: {
                            factoryPk: stockConfig.bin
                        },
                        label: {
                            factoryPk: labelId
                        },
                        pk: {
                            factoryCode
                        },
                        giQty: stockConfig.labelQty
                    }
                },
                method: 'post',
                featureCode: 'user.create'
            }).then((res) => {
                setGiMessages(appendMsg(`${boxLabelScanner} was G/I successfully`, 'success'));
                setScanStatus(true);
                setAllowGi(false);
                setLabelId(null);
                resetUpdateStatus();
                setStockConfig({
                    ...stockConfig,
                    ...defaultStockConfig
                });
                setBoxLabelScanner('');
                onLoadData(false);
                updateActualGi();
                setSubmitting(false);
                setProcessing(false);
            }).catch((error) => {
                setProcessing(false);
                resetUpdateStatus();
                setSubmitting(false);
                setGiMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
                setScanStatus(false);
                setAllowGi(false);
                setBoxLabelScanner('');
                console.error(error);
            });
        }
    }

    const getActualGiQty = async (giPlan) => {
        let actualQty = 0;
        const response = await query({
            url: `/v1/gi/${giPlan}`,
            featureCode: 'user.create'
        });
        if (response?.data) {
            const { data } = response;
            actualQty = data?.actualQty || 0
        }
        return actualQty;
    }

    const updateActualGi = async (selectedGiPlan) => {
        const giPlan = selectedGiPlan || selectedGi;
        const actualQty = await getActualGiQty(giPlan);
        gridApi.forEachNode((node) => {
            if (node.data.factoryPk === giPlan) {
                node.setDataValue('actualQty', actualQty);
            }
        });
    }

    const onCancelGiSuccess = (selectedGiPlan) => {
        setGiMessages(appendMsg(`${boxLabelScanner} was cancel G/I successfully`, 'success'));
        setScanStatus(true);
        setAllowGi(false);
        setLabelId(null);
        setStockConfig({
            ...stockConfig,
            ...defaultStockConfig
        });
        setLabelToCancel([]);
        setBoxLabelScanner('');
        onLoadData(false);
        updateActualGi(selectedGiPlan);
        setSubmitting(false);
        setCancelGi(false);
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
                                            sx={{ minHeight: `${3} !important` }}
                                        >
                                            <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
                                                <Typography variant="subtitle1">{accordion.heading}</Typography>
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
                        <Grid container spacing={0} sx={{ px: 0 }}>
                            <Grid item xs={12} md={hideFilters ? 10 : 9}>
                                <Card
                                    sx={{
                                        p: 1,
                                        borderRadius: '0px',
                                        display: 'row',
                                        height: 'calc((100% - 5px)/2)',
                                        minHeight: { xs: `calc((85vh - 100px)/2)` }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="left" sx={{ mb: 1 }}>
                                        <Tooltip title={`${actionTooltip} Filters`}>
                                            <IconButton onClick={handleHideFilters}>
                                                {hideFilters ? <LastPage /> : <FirstPage />}
                                            </IconButton>
                                        </Tooltip>
                                        <Typography variant="h6">{translate(`typo.G/I_plan_information`)}</Typography>
                                    </Stack>
                                    <div className={themeAgGridClass} style={{ height: '88%', width: '100%', overflowY: 'auto' }}>
                                        <AgGrid
                                            columns={columns}
                                            rowData={rowData}
                                            className={themeAgGridClass}
                                            suppressCell
                                            onGridReady={onGridReady}
                                            onSelectionChanged={onSelectionChanged}
                                            onCellClicked={onCellClicked}
                                            rowSelection="single"
                                            width='100%'
                                            height='100%'
                                        />
                                    </div>
                                </Card>
                                <Card
                                    sx={{
                                        p: 1,
                                        borderRadius: '0px',
                                        display: 'row',
                                        height: 'calc((100% - 5px)/2)',
                                        minHeight: { xs: `calc((85vh - 100px)/2)` }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography variant="h6">{translate(`typo.stock_info`)}</Typography>
                                    </Stack>
                                    <div className={themeAgGridClass} style={{ height: '88%', width: '100%', overflowY: 'auto' }}>
                                        <AgGrid
                                            columns={columnsStock}
                                            rowData={rowDataStock}
                                            className={themeAgGridClass}
                                            onGridReady={onGridReadyStock}
                                            onSelectionChanged={onSelectionChanged}
                                            onCellClicked={onCellClickedStock}
                                            rowSelection="single"
                                            width='100%'
                                            height='100%'
                                        />
                                    </div>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={hideFilters ? 2 : 3}>
                                <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
                                    <Card sx={{ height: '15%' }} className={[scanStatus ? classes.greenBg : classes.redBg, classes.rootCard].join(" ")}>
                                        <Stack direction="column" alignItems="center" spacing={0}>
                                            <Typography className={scanStatus ? classes.greenBg : classes.redBg} sx={{ fontSize: '6rem', fontWeight: 'bold', mx: 0.5 }} noWrap>
                                                {scanStatus ? translate(`typo.ok`) : translate(`typo.ng`)}
                                            </Typography>
                                        </Stack>
                                    </Card>
                                    <Typography variant="subtitle1" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                                        {translate(`typo.message`)}
                                    </Typography>
                                    <Card sx={{ height: '15%', overflowY: 'auto' }}>
                                        <Stack direction="column" alignItems="left" spacing={0}>
                                            {
                                                giMessages.map((msg, idx) => (
                                                    <span key={`msg-${idx}`}>
                                                        <Typography variant="caption" sx={{ color: msg.type === 'error' ? 'red' : 'green', m: 0.5 }}>
                                                            {msg.msg}
                                                        </Typography>
                                                        <hr />
                                                    </span>
                                                ))
                                            }
                                        </Stack>
                                    </Card>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                                        <Typography variant="subtitle1" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                                            {translate(`typo.plan_info`)}
                                        </Typography>
                                    </Stack>
                                    <Card sx={{ px: 1, py: 2 }}>
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    id="order"
                                                    name="order"
                                                    label="Order"
                                                    value={stockConfig.order}
                                                    onChange={handleChangeStockConfig}
                                                    size="small"
                                                    disabled
                                                />
                                                <TextField
                                                    fullWidth
                                                    id="actualAndPlanQty"
                                                    name="actualAndPlanQty"
                                                    label="Actual/Plan Qty"
                                                    value={stockConfig.actualAndPlanQty}
                                                    onChange={handleChangeStockConfig}
                                                    size="small"
                                                    disabled
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    id="customerOrLine"
                                                    name="customerOrLine"
                                                    label="Supplier"
                                                    value={stockConfig.customerOrLine}
                                                    onChange={handleChangeStockConfig}
                                                    size="small"
                                                    disabled
                                                />
                                            </Stack>
                                        </Stack>
                                    </Card>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                                        <Typography variant="subtitle1" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                                            {translate(`typo.label_info`)}
                                        </Typography>
                                        <Stack direction="row" alignItems="left" spacing={0}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                                            checked={autoGi}
                                                            onChange={(e) => {
                                                                const { checked } = e.target;
                                                                setAutoGi(checked);
                                                            }}
                                                            inputProps={{ 'aria-label': 'controlled' }}
                                                        />
                                                    }
                                                    label="Auto G/I"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                                            checked={cancelGi}
                                                            onChange={(e) => {
                                                                setCancelGi(e.target.checked);
                                                            }}
                                                            inputProps={{ 'aria-label': 'controlled' }}
                                                        />
                                                    }
                                                    label="Cancel G/I"
                                                />
                                            </FormGroup>
                                        </Stack>
                                    </Stack>
                                    <TextField
                                        autoFocus
                                        variant="filled"
                                        className={classes.inputScanner}
                                        fullWidth
                                        value={boxLabelScanner}
                                        onChange={(e) => setBoxLabelScanner(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                onScanBoxLabel();
                                            }
                                        }}
                                    />
                                    <Card sx={{ px: 1, py: 2 }}>
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                <TextField
                                                    id="labelQty"
                                                    name="labelQty"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Label Qty"
                                                    onChange={handleChangeStockConfig}
                                                    value={stockConfig.labelQty}
                                                    disabled={cancelGi}
                                                    size='small'
                                                    type="number"
                                                    InputProps={{
                                                        inputProps: {
                                                            max: maxAllowGi, min: 0
                                                        }
                                                    }}
                                                    error={!cancelGi && stockConfig.labelQty > maxAllowGi}
                                                    helperText={!cancelGi && stockConfig.labelQty > maxAllowGi && "Can't G/I over plan"}
                                                />
                                                <TextField
                                                    id="matrCode"
                                                    name="matrCode"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Material Code"
                                                    onChange={handleChangeStockConfig}
                                                    value={stockConfig.matrCode}
                                                    size='small'
                                                    disabled
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                <TextField
                                                    id="matrDesc"
                                                    name="matrDesc"
                                                    autoComplete="off"
                                                    fullWidth
                                                    label="Material Desc"
                                                    onChange={handleChangeStockConfig}
                                                    value={stockConfig.matrDesc}
                                                    size='small'
                                                    disabled
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                                <Dropdown
                                                    id="stock"
                                                    name="stock"
                                                    label="Storage"
                                                    onChange={handleChangeStockConfig}
                                                    options={commonDropdown.stockDropdown.filter((stock) => factories.includes(stock.factory))}
                                                    value={stockConfig.stock}
                                                    size="small"
                                                    required
                                                    disabled
                                                />
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                                <Dropdown
                                                    id="zone"
                                                    name="zone"
                                                    label="Zone"
                                                    onChange={handleChangeStockConfig}
                                                    options={commonDropdown.zoneDropdown.filter((zone) => factories.includes(zone.factory) && zone.stock === stockConfig.stock)}
                                                    value={stockConfig.zone}
                                                    size="small"
                                                    required
                                                    disabled
                                                />
                                                <Dropdown
                                                    id="bin"
                                                    name="bin"
                                                    label="Bin"
                                                    onChange={handleChangeStockConfig}
                                                    options={commonDropdown.binDropdown.filter((bin) => factories.includes(bin.factory) && bin.stock === stockConfig.stock && bin.zone === stockConfig.zone)}
                                                    value={stockConfig.bin}
                                                    size="small"
                                                    required
                                                    disabled
                                                />
                                            </Stack>
                                        </Stack>
                                    </Card>
                                </Card>
                                <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                                    <LoadingButton onClick={() => onGoodIssued()} variant="contained" disabled={!allowGi || (!cancelGi && stockConfig.labelQty > maxAllowGi)} sx={{ width: '100%', height: '100%' }} loading={isSubmitting} loadingIndicator="Processing...">
                                        {`${cancelGi ? `${translate(`button.cancel`)} ` : ''}${translate(`button.goodIssue`)}`}
                                    </LoadingButton>
                                </Card>
                            </Grid>
                        </Grid>
                        <DialogDragable
                            title={modalAction}
                            maxWidth="xl"
                            open={isOpenActionModal}
                            onClose={handleCloseModal}
                        >
                            {
                                modalAction === 'Detail Stock Info' &&
                                <DetailStock
                                    action={stockAction}
                                    detailParams={detailParams}
                                    totalStock={totalStock}
                                />
                            }
                            {
                                modalAction === 'Cancel G/I' && !isEmpty(labelToCancel) &&
                                <CancelGi
                                    onCancelGiSuccess={onCancelGiSuccess}
                                    onClose={handleCloseModal}
                                    labelToCancel={labelToCancel}
                                />
                            }
                        </DialogDragable>
                    </Grid>
                </Grid>
            </Container>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isProcessing}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Page>
    );
}