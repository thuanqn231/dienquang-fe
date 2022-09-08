import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Backdrop,
  CircularProgress
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
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
import { getApprovedBOMDropdown, getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { setSearchParams, resetSearchParams } from '../../redux/slices/grResultManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk, capitalizeFirstChar } from '../../utils/formatString';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import DetailStock from './DetailStock';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.productionResult.grGiResult.grResult';
const tableGrPlanInfo = 'grPlanInfo';
const tableStockInfo = 'stockInfo';

const pxToRem = (value) => `${value / 16}rem`;

const useStyles = makeStyles((theme) =>
  createStyles({
    customAccordionSummary: {
      justifyContent: 'space-between !important',
      alignItems: 'center'
    },
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
      '& .MuiFilledInput-root': {
        background: '#ffff00',
        fontSize: '1.5rem'
      },
      '& .MuiFilledInput-input': {
        textAlign: 'center',
        padding: theme.spacing(1)
      }
    },
    '@keyframes greenBgEffect': {
      '0%': {
        backgroundColor: '#098d41',
        color: 'white'
      },
      '25%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '50%': {
        backgroundColor: '#098d41',
        color: 'white'
      },
      '75%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '100%': {
        backgroundColor: '#098d41',
        color: 'white'
      }
    },
    '@keyframes redBgEffect': {
      '0%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      },
      '25%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '50%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      },
      '75%': {
        backgroundColor: '#ffe6e6',
        color: '#a1a5a9'
      },
      '100%': {
        backgroundColor: '#ff1a1a',
        color: 'white'
      }
    },
    blueBg: {
      backgroundColor: '#1782a7'
    },
    rootCard: {
      padding: theme.spacing(3, 2),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  })
);

const defaultStockConfig = {
  labelQty: 0,
  prodOrder: '',
  matrCode: '',
  matrDesc: '',
  lotNo: '',
  supplier: ''
};

export default function GrResultList() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.grResultManagement);
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
  const [disableLotNo, setDisableLotNo] = useState(true);
  const [currentGr, setCurrentGr] = useState({});
  const [selectedGr, setSelectedGr] = useState(null);
  const [selectedGrPlan, setSelectedGrPlan] = useState(null);
  const [labelId, setLabelId] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [boxLabelScanner, setBoxLabelScanner] = useState('');
  const [scanStatus, setScanStatus] = useState(true);
  const [allowGr, setAllowGr] = useState(false);
  const [cancelGr, setCancelGr] = useState(false);
  const [autoGr, setAutoGr] = useState(true);
  const [grMessages, setGrMessages] = useState([]);
  const [detailParams, setDetailParams] = useState({});
  const [totalStock, setTotalStock] = useState(0);
  const [stockAction, setStockAction] = useState('gr');
  const [factories, setFactories] = useState([]);
  const [factory, setFactory] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [updateLabelIdDone, setUpdateLabelIdDone] = useState(false);
  const [updateAllowGrDone, setUpdateAllowGrDone] = useState(false);
  const [updateSelectedGrDone, setUpdateSelectedGrDone] = useState(false);
  const [updateGrToDeleteDone, setUpdateGrToDeleteDone] = useState(false);
  const [grToDelete, setGrToDelete] = useState(null);
  const pageSelectedWidget = selectedWidget[pageCode];

  useEffect(() => {
    dispatch(getMaterialDropdown());
    dispatch(getApprovedBOMDropdown());
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
    if (gridColumnApiStock && gridColumnApi) {
      onLoadData();
    }
  }, [gridColumnApiStock, gridColumnApi]);

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  useEffect(() => {
    if (cancelGr && boxLabelScanner && labelId && allowGr && autoGr && grToDelete && updateAllowGrDone && updateLabelIdDone && updateGrToDeleteDone) {
      onGoodReceipt();
    }
    if (!cancelGr && boxLabelScanner && labelId && allowGr && autoGr && selectedGr && updateSelectedGrDone && updateAllowGrDone && updateLabelIdDone) {
      onGoodReceipt();
    }

  }, [boxLabelScanner, labelId, allowGr, autoGr, selectedGr, grToDelete, updateSelectedGrDone, updateAllowGrDone, updateLabelIdDone, updateGrToDeleteDone]);

  useEffect(() => {
    let _updateGrToDelete = false;
    if (grToDelete) {
      _updateGrToDelete = true;
    }
    setUpdateGrToDeleteDone(_updateGrToDelete);
  }, [grToDelete]);

  useEffect(() => {
    let _updateSelectedGrDone = false;
    if (selectedGr) {
      _updateSelectedGrDone = true;
    }
    setUpdateSelectedGrDone(_updateSelectedGrDone);
  }, [selectedGr]);

  useEffect(() => {
    let _updateAllowGrDone = false;
    if (allowGr) {
      _updateAllowGrDone = true;
    }
    setUpdateAllowGrDone(_updateAllowGrDone);
  }, [allowGr]);

  useEffect(() => {
    let _updateLableIdDone = false;
    if (labelId) {
      _updateLableIdDone = true;
    }
    setUpdateLabelIdDone(_updateLableIdDone);
  }, [labelId]);


  useEffect(() => {
    const _stockConfig = {
      ...stockConfig,
      stock: '',
      zone: '',
      bin: ''
    };
    setStockConfig(_stockConfig);
  }, [parseSelectedTree]);

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

  const onLoadData = () => {
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
      grNo: searchParams.grNo,
      order: searchParams.order,
      QCResult: searchParams.QCResult,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialName,
      supplier: searchParams.supplier,
      grType: searchParams.grType,
      lotNoDisplay: searchParams.isLotNo,
      supplierDisplay: searchParams.isSupplier,
      labelDisplay: searchParams.isBoxNo,
      stockStatusDisplay: searchParams.isStockStatus
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
    parseOrgSearchAll(params, parseSelectedTree);
    query({
      url: '/v1/gr/gr-result/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        setSelectedGrPlan(null);
        updateData(parsePlans(res.data), parseGrResults(res.data.stockMovements));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const parseGrResults = (rawResults) =>
    rawResults.map((gr) => ({
      pk: gr?.material?.pk || {},
      labelType: gr?.label?.labelType?.name || '',
      materialId: gr?.label?.labelDetail?.material?.materialId || '',
      materialCode: gr?.label?.labelDetail?.material?.code || '',
      materialName: gr?.label?.labelDetail?.material?.name || '',
      materialType: gr?.label?.labelDetail?.material?.materialType?.name || '',
      description: gr?.label?.labelDetail?.material?.description || '',
      unitName: gr?.label?.labelDetail?.material?.mainUnit?.name || '',
      stockQty: gr?.sumStockQty || 0,
      lotNo: gr?.label?.lotNo || '',
      supplier: gr?.label?.labelDetail?.supplier?.nationalName || '',
      boxNo: gr?.label?.labelNo || '',
      stockStatus: gr?.stockStatus?.name || '',
    }));

  const parsePlans = (rawPlans) => {
    const plans = [];
    if (rawPlans?.productions) {
      const { productions } = rawPlans;
      productions.forEach((prod) => {
        plans.push({
          factoryPk: prod?.factoryPk,
          pk: prod?.pk,
          factoryName: prod?.pk?.factoryName,
          type: 'PRODUCTION',
          planDate: prod?.planDate,
          grNo: prod?.grNo,
          orderNo: prod?.orderNo,
          materialId: prod?.material?.materialId,
          materialCode: prod?.material?.code,
          materialName: prod?.material?.name,
          materialDescription: prod?.material?.description,
          materialVersion: prod?.productionOrder?.modelId?.bomVersionParent,
          mrpName: prod?.material?.mrp?.name,
          planQty: prod?.planQty,
          actualQty: prod?.actualQty,
          unit: prod?.material?.mainUnit?.name,
          grType: prod?.grType?.name,
          supplier: '',
          processType: prod?.productionOrder?.process?.name,
          qcResult: prod?.inspectionGRPlanResult?.qcResult?.description,
          actionInspection: prod?.inspectionGRPlanResult?.action?.description,
          approvalStatusInspection: prod?.inspectionGRPlanResult?.approvalStatus?.description,
          approvalTimeInspection: prod?.inspectionGRPlanResult?.approval?.approvedTime,
          approvalPICInspection: prod?.inspectionGRPlanResult?.approval?.usrLogU,
          lineCode: prod?.line?.code,
          lineName: prod?.line?.name,
          remark: prod?.remark,
          state: prod?.state,
          usrLogI: prod?.usrLogI,
          dteLogI: prod?.dteLogI,
          usrLogU: prod?.usrLogU,
          dteLogU: prod?.dteLogU
        });
      });
    }
    if (rawPlans?.purchases) {
      const { purchases } = rawPlans;
      purchases.forEach((pur) => {
        plans.push({
          factoryPk: pur?.factoryPk,
          pk: pur?.pk,
          factoryName: pur?.pk?.factoryName,
          type: 'PURCHASE',
          planDate: pur?.planDate,
          grNo: pur?.grNo,
          orderNo: pur?.orderNo,
          materialId: pur?.material?.materialId,
          materialCode: pur?.material?.code,
          materialName: pur?.material?.name,
          materialDescription: pur?.material?.description,
          materialVersion: '',
          mrpName: pur?.material?.mrp?.name,
          planQty: pur?.planQty,
          actualQty: pur?.actualQty,
          unit: pur?.material?.mainUnit?.name,
          grType: pur?.grType?.name,
          supplier: pur?.supplier.nationalName,
          processType: '',
          qcResult: pur?.inspectionGRPlanResult?.qcResult?.description,
          actionInspection: pur?.inspectionGRPlanResult?.action?.description,
          approvalStatusInspection: pur?.inspectionGRPlanResult?.approvalStatus?.description,
          approvalTimeInspection: pur?.inspectionGRPlanResult?.approval?.approvedTime,
          approvalPICInspection: pur?.inspectionGRPlanResult?.approval?.usrLogU,
          lineCode: '',
          lineName: '',
          remark: pur?.remark,
          state: pur?.state,
          usrLogI: pur?.usrLogI,
          dteLogI: pur?.dteLogI,
          usrLogU: pur?.usrLogU,
          dteLogU: pur?.dteLogU
        });
      });
    }
    return plans;
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedGrPlan(null);
      setCurrentGr({});
    } else if (rowCount === 1) {
      const { factoryPk, type, planQty, planDate, sumQtyGRResult } = event.api.getSelectedNodes()[0].data;
      setSelectedGrPlan(`${type}_${factoryPk}`);
      setCurrentGr({
        factoryPk,
        planQty,
        planDate,
        sumQtyGRResult
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

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />,
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
          <Dropdown
            id="type"
            name="type"
            label="Type"
            allowEmptyOption={false}
            value={searchParams.type}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Purchase', label: 'Purchase' },
              { value: 'PRODUCTION', label: 'Production' }
            ]}
            sx={{ my: 1 }}
            size="small"
          />
          <DthDatePicker
            name="fromDate"
            label="Plan Date From"
            value={searchParams.fromDate}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('fromDate', newValue);
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
              handleChangeDateSearchConfig('toDate', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <TextField
            fullWidth
            id="grNo"
            name="grNo"
            label="G/R No"
            value={searchParams.grNo}
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
          <Dropdown
            id="QCResult"
            name="QCResult"
            label="QC Result"
            value={searchParams.QCResult}
            onChange={handleChangeSearchConfig}
            groupId="D024000"
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
            id="grType"
            name="grType"
            label="G/R Type"
            value={searchParams.grType}
            onChange={handleChangeSearchConfig}
            groupId="D020000"
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isLotNo"
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
                    name="isSupplier"
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
                    name="isBoxNo"
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
    if (gridApi.column.colId === 'actualQty' && gridApi.value > 0) {
      setStockAction('gr');
      setDetailParams({
        from: fDate(searchParams.fromDate),
        to: fDate(searchParams.toDate),
        grNo: gridApi.data.grNo,
        factoryCode: gridApi.data.pk.factoryCode
      });
      handleOpenModal();
      setTotalStock(gridApi.value);
    }
  };

  const onCellClickedStock = (gridApi) => {
    if (gridApi.column.colId === 'stockQty' && gridApi.value > 0) {
      setStockAction('stock');
      const detailParams = {
        type: searchParams.type,
        grNo: searchParams.grNo,
        order: searchParams.order,
        QCResult: searchParams.QCResult,
        materialCode: gridApi.data.materialCode,
        materialName: searchParams.materialName,
        grType: searchParams.grType,
        lotNoDisplay: searchParams.isLotNo,
        supplierDisplay: searchParams.isSupplier,
        labelDisplay: searchParams.isBoxNo,
        factoryCode: gridApi.data.pk.factoryCode
      };
      if (searchParams.stock) {
        detailParams.stock = searchParams.stock;
      }
      if (searchParams.zone) {
        detailParams.zone = searchParams.zone;
      }
      if (searchParams.bin) {
        detailParams.bin = searchParams.bin;
      }
      if (searchParams.isLotNo) {
        detailParams.lotNo = gridApi.data.lotNo;
      }
      if (searchParams.isSupplier) {
        if (gridApi.data.supplier) {
          detailParams.supplier = gridApi.data.supplier;
        } else {
          detailParams.supplier = 'system_supplier_null';
        }
      }
      if (searchParams.isBoxNo) {
        detailParams.label = gridApi.data.boxNo;
      }
      setDetailParams(detailParams);
      setTotalStock(gridApi.value);
      handleOpenModal();
    }
  };

  const getFactoryAndType = (value) => {
    const selectedGrPlan = value.split('_');
    const type = selectedGrPlan[0] ? selectedGrPlan[0] : '';
    const factoryPk = selectedGrPlan[1] ? selectedGrPlan[1] : '';
    return { type, factoryPk };
  };

  const checkScanLabel = async (checkLabelParams) => {
    const { factoryCode } = getFactoryAndIdByPk(parseSelectedTree.factoryIds);
    let response = {};
    if (cancelGr) {
      response = await mutate({
        url: `/v1/gr/gr-result/check-cancel-label?factoryCode=${factoryCode}`,
        data: {
          grResult: {
            label: {
              labelNo: boxLabelScanner
            }
          }
        },
        featureCode: 'user.create',
        isShowMessage: false
      })
        .catch((error) => {
          setProcessing(false);
          setGrMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
          setScanStatus(false);
          setAllowGr(false);
          setBoxLabelScanner('');
          console.error(error);
        });
    } else {
      response = await mutate({
        url: `/v1//gr/gr-result/check-label/${factoryCode}`,
        data: checkLabelParams,
        method: 'post',
        featureCode: 'user.create',
        isShowMessage: false
      })
        .catch((error) => {
          setProcessing(false);
          setGrMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
          setScanStatus(false);
          setAllowGr(false);
          setBoxLabelScanner('');
          console.error(error);
        });
    }
    return response?.data || [];
  }

  const onScanBoxLabel = async () => {
    const selectedFactories = parseSelectedTree.factoryIds;
    if (selectedFactories.split(',').length === 0 || selectedFactories.split(',').length > 1) {
      setGrMessages(appendMsg('Please select 1 Factory in Organization Tree first', 'error'));
      setScanStatus(false);
      return;
    }
    if (!boxLabelScanner) {
      setGrMessages(appendMsg('Please scan Box Label', 'error'));
      setScanStatus(false);
      return;
    }
    setProcessing(true);
    const uri = cancelGr ? 'check-cancel-label' : 'check-label';
    const checkLabelParams = {
      grResult: {
        label: {
          labelNo: boxLabelScanner
        }
      }
    }
    if (selectedGrPlan) {
      const { type, factoryPk } = getFactoryAndType(selectedGrPlan);
      if (type === 'PRODUCTION') {
        checkLabelParams.grResult.goodReceiptPlan = {
          factoryPk
        }
      }
    }
    const data = await checkScanLabel(checkLabelParams);
    if (!isEmpty(data)) {
      if (data?.allowChangeLotNo === 'Y') {
        setDisableLotNo(false);
      } else {
        setDisableLotNo(true);
      }
      setGrMessages(appendMsg(`${boxLabelScanner} was scan successfully`, 'success'));
      setScanStatus(true);
      setAllowGr(true);
      const { label, label: { qty } } = data;
      setFactory(label?.boxLabelDetail?.pk?.factoryCode || '');
      setLabelId(label?.factoryPk);
      let planFactoryPk = '';
      let orderNo = '';
      let matrCode = '';
      let matrDesc = '';
      let supplier = '';
      let {stock, zone, bin} = stockConfig;
      if (cancelGr) {
        planFactoryPk = data?.goodReceiptPlan?.factoryPk;
        orderNo = data?.label?.labelDetail?.orderNo;
        matrCode = data?.label?.labelDetail?.material?.code;
        matrDesc = data?.label?.labelDetail?.material?.description;
        supplier = data?.label?.labelDetail?.line?.name || data?.label?.labelDetail?.supplier?.nationalName || '';
        bin = data?.bin?.factoryPk || 'null-null';
        zone = data?.bin?.zone?.factoryPk || 'null-null';
        stock = data?.bin?.zone?.stock?.factoryPk || 'null-null';setGrToDelete(data?.factoryPk)
      }
      if (!cancelGr) {
        setGrToDelete(null)
        const type = label?.boxLabelDetail?.type;
        planFactoryPk = label?.boxLabelDetail?.goodReceiptPlan?.factoryPk;
        orderNo = label?.boxLabelDetail?.orderNo;
        matrCode = label?.boxLabelDetail?.material?.code;
        matrDesc = label?.boxLabelDetail?.material?.description;
        supplier = label?.boxLabelDetail?.line?.name || label?.boxLabelDetail?.supplier?.nationalName || '';
        if (type === 'PRODUCTION') {
          const respSelectedGr = `${capitalizeFirstChar(type)}_${planFactoryPk}`;
          if (respSelectedGr !== selectedGrPlan) {
            setSelectedGr(`${capitalizeFirstChar(type)}_${planFactoryPk}`);
          }
        } else {
          setSelectedGr(`${capitalizeFirstChar(type)}_${planFactoryPk}`);
        }
      }
      if ((!cancelGr && data?.label?.boxLabelDetail) || (cancelGr && data?.label?.labelDetail)) {
        setStockConfig({
          ...stockConfig,
          stock,
          zone,
          bin,
          labelQty: qty,
          prodOrder: orderNo,
          matrCode,
          matrDesc,
          lotNo: data?.label?.lotNo || '',
          supplier
        });
      }
      if (!autoGr) {
        setProcessing(false);
      }
    }
  };

  const appendMsg = (msg, type) => {
    const newMsg = [...grMessages];
    newMsg.unshift({ msg, type });
    return newMsg;
  };

  const onGoodReceipt = () => {
    let isValid = true;
    const msgError = [...grMessages];
    if (!cancelGr) {
      if (isEmpty(stockConfig.bin)) {
        isValid = false;
        msgError.unshift({ msg: 'Please select Bin', type: 'error' });
      }
      if (isEmpty(stockConfig.zone)) {
        isValid = false;
        msgError.unshift({ msg: 'Please select Zone', type: 'error' });
      }
      if (isEmpty(stockConfig.stock)) {
        isValid = false;
        msgError.unshift({ msg: 'Please select Storage', type: 'error' });
      }
    }
    if (!labelId) {
      isValid = false;
      msgError.unshift({ msg: 'Please scan Box Label', type: 'error' });
    }
    if (!isValid) {
      setScanStatus(false);
      setAllowGr(false);
      setGrMessages(msgError);
      setProcessing(false);
      setBoxLabelScanner('');
      return;
    }
    if (cancelGr) {
      mutate({
        url: `/v1/gr/gr-result/${grToDelete}`,
        method: 'delete',
        featureCode: 'user.delete'
      })
        .then((res) => {
          setProcessing(false);
          setGrMessages(appendMsg(`${boxLabelScanner} was cancel G/R successfully`, 'success'));
          setScanStatus(true);
          setAllowGr(false);
          setLabelId(null);
          setStockConfig({
            ...stockConfig,
            ...defaultStockConfig
          });
          onLoadData();
          setBoxLabelScanner('');
          setCancelGr(false);
          setGrToDelete(null);
        })
        .catch((error) => {
          setProcessing(false);
          setGrMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
          setScanStatus(false);
          setAllowGr(false);
          setGrToDelete(null);
          setBoxLabelScanner('');
          console.error(error);
        });
    } else {
      const { type, factoryPk } = getFactoryAndType(selectedGr);
      const { factoryCode } = getFactoryAndIdByPk(factoryPk);
      mutate({
        url: `/v1/gr/gr-result/create`,
        data: {
          grResult: {
            goodReceiptPlan: {
              factoryPk
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
            }
          }
        },
        method: 'post',
        featureCode: 'user.create'
      })
        .then((res) => {
          setProcessing(false);
          setGrMessages(appendMsg(`${boxLabelScanner} was G/R successfully`, 'success'));
          setScanStatus(true);
          setAllowGr(false);
          setLabelId(null);
          setStockConfig({
            ...stockConfig,
            ...defaultStockConfig
          });
          setBoxLabelScanner('');
          onLoadData();
        })
        .catch((error) => {
          setProcessing(false);
          setGrMessages(appendMsg(error?.data?.statusMessageDetail, 'error'));
          setScanStatus(false);
          setAllowGr(false);
          setBoxLabelScanner('');
          console.error(error);
        });
    }
  };

  const getFactoryCode = () => {
    const selectedFactories = parseSelectedTree.factoryIds;
    if (selectedFactories.split(',').length === 0 || selectedFactories.split(',').length > 1) {
      return '';
    }
    const { factoryCode } = getFactoryAndIdByPk(parseSelectedTree.factoryIds);
    return factoryCode;
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
                      <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                    </Tooltip>
                    <Typography variant="h6">{translate(`typo.G/R_plan_information`)}</Typography>
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
                      width="100%"
                      height="100%"
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
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} md={hideFilters ? 2 : 3}>
                <Card
                  sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}
                >
                  <Card
                    sx={{ height: '18%' }}
                    className={[scanStatus ? classes.greenBg : classes.redBg, classes.rootCard].join(' ')}
                  >
                    <Stack direction="column" alignItems="center" spacing={0}>
                      <Typography
                        className={scanStatus ? classes.greenBg : classes.redBg}
                        sx={{ fontSize: '8rem', fontWeight: 'bold', mx: 0.5 }}
                        noWrap
                      >
                        {scanStatus ? 'OK' : 'NG'}
                      </Typography>
                    </Stack>
                  </Card>
                  <Typography variant="subtitle1" sx={{ color: 'common.black', mx: 0.5 }} noWrap>
                    {translate(`typo.message`)}
                  </Typography>
                  <Card sx={{ height: '18%', overflowY: 'auto' }}>
                    <Stack direction="column" alignItems="left" spacing={0}>
                      {grMessages.map((msg, idx) => (
                        <span key={`msg-${idx}`}>
                          <Typography variant="caption" sx={{ color: msg.type === 'error' ? 'red' : 'green', m: 0.5 }}>
                            {msg.msg}
                          </Typography>
                          <hr />
                        </span>
                      ))}
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
                              checked={autoGr}
                              onChange={(e) => {
                                const { checked } = e.target;
                                setAutoGr(checked);
                              }}
                              inputProps={{ 'aria-label': 'controlled' }}
                            />
                          }
                          label="Auto G/R"
                        />
                      </FormGroup>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                              checked={cancelGr}
                              onChange={(e) => {
                                const { checked } = e.target;
                                setCancelGr(checked);
                              }}
                              inputProps={{ 'aria-label': 'controlled' }}
                            />
                          }
                          label="Cancel G/R"
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
                    placeholder="Focus here to scan"
                    InputLabelProps={{ shrink: true }}
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
                          size="small"
                          disabled
                        />
                        <TextField
                          id="prodOrder"
                          name="prodOrder"
                          autoComplete="off"
                          fullWidth
                          label="Prod. Order"
                          onChange={handleChangeStockConfig}
                          value={stockConfig.prodOrder}
                          size="small"
                          disabled
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          id="matrCode"
                          name="matrCode"
                          autoComplete="off"
                          fullWidth
                          label="Material Code"
                          onChange={handleChangeStockConfig}
                          value={stockConfig.matrCode}
                          size="small"
                          disabled
                        />
                        <TextField
                          id="matrDesc"
                          name="matrDesc"
                          autoComplete="off"
                          fullWidth
                          label="Material Desc"
                          onChange={handleChangeStockConfig}
                          value={stockConfig.matrDesc}
                          size="small"
                          disabled
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <TextField
                          id="lotNo"
                          name="lotNo"
                          autoComplete="off"
                          fullWidth
                          label="Lot No."
                          onChange={handleChangeStockConfig}
                          value={stockConfig.lotNo}
                          size="small"
                          disabled={disableLotNo}
                        />
                        <TextField
                          id="supplier"
                          name="supplier"
                          autoComplete="off"
                          fullWidth
                          label="Supplier/Line"
                          onChange={handleChangeStockConfig}
                          value={stockConfig.supplier}
                          size="small"
                          disabled
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <Dropdown
                          id="stock"
                          name="stock"
                          label="Storage"
                          onChange={handleChangeStockConfig}
                          options={commonDropdown.stockDropdown.filter(
                            (stock) => {
                              const factoryCode = getFactoryCode();
                              return factories.includes(stock.factory) && stock.factory === factoryCode
                            }
                          )}
                          disabled={cancelGr}
                          value={stockConfig.stock}
                          size="small"
                          required
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <Dropdown
                          id="zone"
                          name="zone"
                          label="Zone"
                          onChange={handleChangeStockConfig}
                          options={commonDropdown.zoneDropdown.filter(
                            (zone) => {
                              const factoryCode = getFactoryCode();
                              return factories.includes(zone.factory) && zone.factory === factoryCode && zone.stock === stockConfig.stock
                            }
                          )}
                          disabled={cancelGr}
                          value={stockConfig.zone}
                          size="small"
                          required
                        />
                        <Dropdown
                          id="bin"
                          name="bin"
                          label="Bin"
                          onChange={handleChangeStockConfig}
                          options={commonDropdown.binDropdown.filter(
                            (bin) => {
                              const factoryCode = getFactoryCode();
                              return factories.includes(bin.factory) &&
                                bin.factory === factoryCode &&
                                bin.stock === stockConfig.stock &&
                                bin.zone === stockConfig.zone
                            }
                          )}
                          disabled={cancelGr}
                          value={stockConfig.bin}
                          size="small"
                          required
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Card>
                <Card sx={{ p: 0, height: '36px', borderRadius: '0px' }}>
                  <Button
                    onClick={() => {
                      setProcessing(true);
                      onGoodReceipt()
                    }}
                    variant="contained"
                    disabled={!allowGr || autoGr}
                    sx={{ width: '100%', height: '100%' }}
                  >
                    {`${cancelGr ? 'Cancel ' : ''}Good Receipt`}
                  </Button>
                </Card>
              </Grid>
            </Grid>
            <DialogDragable title={translate(`typo.detail_stock_info`)} maxWidth="xl" open={isOpenActionModal} onClose={handleCloseModal}>
              <DetailStock action={stockAction} detailParams={detailParams} totalStock={totalStock} />
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
