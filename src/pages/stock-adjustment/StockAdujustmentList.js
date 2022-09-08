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
  DialogActions,
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
  Checkbox
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useRef, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import {
  setSearchParams,
  setOperations,
  resetSearchParams,
  resetOperation
} from '../../redux/slices/stockAdjustmentManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk, capitalizeFirstChar, isNullVal } from '../../utils/formatString';
import { getGridConfig, getPageName } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import LabelPrint from './LabelPrint';
import DetailStock from '../gr-result/DetailStock';
import PurchaseLabelGenerate from './PurchaseLabelGenerate';
import {
  handleRequestAdjust,
  handleQueryStockMovement,
  handleValidateBeforeProcess,
  handleQueryAdjustmentHistory,
  OperationEnum,
  OperationCode,
  ScanLabelEnum
} from './helper';

const pageCode = 'menu.production.stockManagement.stockManagement.stockAdjustment.stockAdjustment';
const tableStockInfo = 'stockInfo';
const tableStockHistory = 'stockHistory';

const pxToRem = (value) => `${value / 16}rem`;

const useStyles = makeStyles((theme) =>
  createStyles({
    inputScanner: {
      '& .MuiFilledInput-root': {
        background: '#ffff00',
        fontSize: '1.2rem',
        width: '50%',
        alignSelf: 'center'
      },
      '& .MuiFilledInput-input': {
        textAlign: 'center',
        padding: theme.spacing(1)
      },
      '& .MuiFormHelperText-root': {
        width: '50%',
        alignSelf: 'center'
      }
    },
    customAccordionSummary: {
      justifyContent: 'space-between !important',
      alignItems: 'center'
    }
  })
);

export default function StockAdujustmentList() {
  const inputRef = useRef(null);
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, commonDropdown, user } = useAuth();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams, operations } = useSelector((state) => state.stockAdjustmentManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenDetailModal, setOpenDetailModal] = useState(false);
  const [isOpenAdjustResultModal, setOpenAdjustResultModal] = useState(false);
  const [isOpenGenerateModal, setIsOpenGenerateModal] = useState(false);
  const [isOpenCheckModal, setIsOpenCheckModal] = useState(false);
  const [modalAction, setModalAction] = useState('Generate Label');
  const [modalStockAction, setModalStockAction] = useState('Re-Print');
  const [adjustmentResult, setAdjustmentResult] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowRegister, setIsAllowRegister] = useState(false);
  const [isAllowDelete, setIsAllowDelete] = useState(false);
  const [isAllowPrint, setIsAllowPrint] = useState(false);
  const [isRePrint, setIsRePrint] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [selectedEPass, setSelectedEPass] = useState([]);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState(null);
  const [labelId, setLabelId] = useState(null);
  const [deleteLabels, setDeleteLabels] = useState([]);
  const [generateLabels, setGenerateLabels] = useState([]);
  const [operationType, setOperationType] = useState('D026003');
  const [boxLabelScanner, setBoxLabelScanner] = useState('');
  const [boxLabelScanner2, setBoxLabelScanner2] = useState('');
  const [scanStatus, setScanStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState({});
  const [detailParams, setDetailParams] = useState({});
  const [totalStock, setTotalStock] = useState(0);
  const [selectedStockId, setSelectedStockId] = useState([]);
  const [isAllowReprint, setIsAllowReprint] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    const currentPage = funcPermission.filter((permission) => permission.code === pageCode);
    if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
      const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
      setListOfWidgets(activeWidgets);
      if (!isEmpty(activeWidgets) && isUndefined(pageSelectedWidget)) {
        dispatch(
          setSelectedWidget({
            ...selectedWidget,
            [pageCode]: {
              widgetCode: activeWidgets[0].code,
              widgetName: activeWidgets[0].name
            }
          })
        );
      }
    }
  }, [funcPermission]);

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCode = pageSelectedWidget?.widgetName === 'Stock Adjustment' ? tableStockInfo : tableStockHistory;
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode = pageSelectedWidget?.widgetName === 'Stock Adjustment' ? tableStockInfo : tableStockHistory;
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(() => {
    if (gridApi) {
      onLoadData();
    }
  }, [selectedWidget]);

  useEffect(() => {
    reValidate();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [operations]);

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  const handleOpenDetailModal = (action) => {
    setOpenDetailModal(true);
    setModalStockAction(action);
  };

  useEffect(() => {
    if (gridColumnApi) {
      if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
        onLoadDataAdjustment();
      } else {
        onLoadDataHistory();
      }
    }
  }, [gridColumnApi]);

  useEffect(() => {
    if (generatedId) {
      if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
        onLoadDataAdjustment();
      } else {
        onLoadDataHistory();
      }
    }
  }, [generatedId]);

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  // useEffect(() => {
  //     if (gridApiPlan) {
  //         reSelectGridPlan();
  //     }
  // }, [rowDataPlan]);

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const onClickWidget = (widgetCode, widgetName) => {
    dispatch(
      setSelectedWidget({
        ...selectedWidget,
        [pageCode]: {
          widgetCode,
          widgetName
        }
      })
    );
  };

  const onInquiry = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    disableButton();
    setSelectedPlanId(null);
    switch (pageSelectedWidget?.widgetName) {
      case 'Stock Adjustment':
        await onLoadDataAdjustment();
        break;
      case 'Stock History':
        await onLoadDataHistory();
        break;
      default:
        break;
    }
    // updateData(response);
  };

  const onLoadDataHistory = async () => {
    const response = await handleQueryAdjustmentHistory(searchParams, parseSelectedTree);
    setRowData(response?.data || []);
  };

  const onLoadDataAdjustment = async () => {
    if (gridColumnApi) {
      ['lotNo', 'supplier', 'boxNo', 'stockStatus', 'labelType'].forEach((field) => {
        if (field === 'labelType') {
          let isShowLabelType = false;
          if (searchParams.isBoxNo) {
            isShowLabelType = true;
          }
          gridColumnApi.setColumnVisible(field, isShowLabelType);
        } else {
          const fieldNm = `is${capitalizeFirstChar(field)}`;
          gridColumnApi.setColumnVisible(field, searchParams[fieldNm]);
        }
      });
    }
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
    const detailParams = {
      materialType: searchParams.materialType,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialDesc,
      supplier: searchParams.supplier,
      label: searchParams.label,
      lotNo: searchParams.lotNo,
      stockStatus: searchParams.stockStatus,
      stockStatusDisplay: searchParams.isStockStatus,
      lotNoDisplay: searchParams.isLotNo,
      supplierDisplay: searchParams.isSupplier,
      labelDisplay: searchParams.isBoxNo,
      pageName: 'stock'
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
    if (searchParams.stockStatus) {
      detailParams.stockStatus = searchParams.stockStatus;
    }
    query({
      url: '/v1/stock-movement/search-adjustment',
      featureCode: 'user.create',
      params: detailParams
    })
      .then((res) => {
        const data = res.data.map((stock) => ({
          pk: stock?.label?.labelDetail?.material?.pk || {},
          factoryPk: stock?.label?.labelDetail?.material?.factoryPk || 'null-null',
          labelType: stock?.label?.labelType?.name || '',
          materialId: stock?.label?.labelDetail?.material?.materialId || '',
          materialCode: stock?.label?.labelDetail?.material?.code || '',
          materialName: stock?.label?.labelDetail?.material?.name || '',
          materialType: stock?.label?.labelDetail?.material?.materialType?.name || '',
          description: stock?.label?.labelDetail?.material?.description || '',
          unitName: stock?.label?.labelDetail?.material?.mainUnit?.name || '',
          stockQty: stock?.sumStockQty || 0,
          lotNo: stock?.label?.lotNo || '',
          supplier: stock?.label?.labelDetail?.supplier?.nationalName || '',
          boxNo: stock?.label?.labelNo || '',
          stockStatus: stock?.stockStatus?.name || '',
          selectedEPass: {
            factoryPk: stock?.label?.factoryPk,
            printNo: stock?.label?.printNo,
            rePrintReason: stock?.label?.rePrintReason,
            epassNo: stock?.label?.labelNo,
            model: stock?.label?.labelDetail?.material?.code,
            line: stock?.label?.labelDetail?.supplier?.nationalName
              ? stock?.label?.labelDetail?.supplier?.nationalName.slice(0, 20)
              : '',
            qty: stock?.label?.qty,
            grNo: stock?.grNo
          }
        }));
        setRowData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const disableButton = () => {
    setIsAllowRegister(false);
    setIsAllowDelete(false);
  };

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const handleChangeDateSearchConfig = (name, value) => {
    const _search = {
      ...searchParams,
      [name]: `${value}`
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

  const handleChangeOperations = (event) => {
    const { name } = event.target;
    let { value } = event.target;
    const { parentKey, childKey } = parseKeyOperation(name);
    const parentObj = {
      [parentKey]: {
        ...operations[parentKey],
        [childKey]: value
      }
    };
    if (name === 'split.stockQty1') {
      if (value > operations.split.stockQty) {
        value = operations.split.stockQty;
        parentObj[parentKey][childKey] = value;
      }
      const stockQty2 = operations.split.stockQty - value;
      parentObj[parentKey].stockQty2 = stockQty2;
    }
    if (name === 'grWtPo.lineName' || name === 'giWtPo.lineName') {
      const line = commonDropdown.lineDropdown.find((line) => line.value === value);
      parentObj[parentKey].lineCode = line.code;
      parentObj[parentKey].linePk = line.factoryPk;
    }
    const _operations = {
      ...operations,
      ...parentObj
    };
    dispatch(setOperations(_operations));
  };

  const reValidate = () => {
    const validateResult = handleValidateBeforeProcess(operationType, operations, boxLabelScanner, boxLabelScanner2);
    const { error } = validateResult;
    setErrorMessage(error);
  };

  const parseKeyOperation = (keys) => {
    const keySplit = keys.split('.');
    return {
      parentKey: keySplit[0],
      childKey: keySplit[1]
    };
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree parseSelected={handleParseSelectedTree} />,
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
            id="materialType"
            name="materialType"
            label="Material Type"
            value={searchParams.materialType}
            onChange={handleChangeSearchConfig}
            groupId="D003000"
            sx={{ my: 1 }}
            size="small"
          />
          {pageSelectedWidget?.widgetName === 'Stock History' && (
            <TextField
              fullWidth
              id="operationNo"
              name="operationNo"
              label="Adjust No"
              value={searchParams.operationNo}
              onChange={handleChangeSearchConfig}
              sx={{ my: 1 }}
              size="small"
            />
          )}
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
            id="materialDesc"
            name="materialDesc"
            label="Material Name"
            value={searchParams.materialDesc}
            onChange={handleChangeSearchConfig}
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
          <TextField
            fullWidth
            id="label"
            name="label"
            label="Label No."
            value={searchParams.label}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="lotNo"
            name="lotNo"
            label="Lot No."
            value={searchParams.lotNo}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="stockStatus"
            name="stockStatus"
            label="Stock Status"
            value={searchParams.stockStatus}
            onChange={handleChangeSearchConfig}
            groupId="D025000"
            sx={{ my: 1 }}
            size="small"
          />
          {pageSelectedWidget?.widgetName === 'Stock History' && (
            <Dropdown
              id="operationTypeSearch"
              name="operationTypeSearch"
              label="Operation Type"
              value={searchParams.operationTypeSearch}
              onChange={handleChangeSearchConfig}
              groupId="D026000"
              excludes={['D026001', 'D026002', 'D026010', 'D026011']}
              sx={{ my: 1 }}
              size="small"
            />
          )}
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

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const disablePrint = () => {
    setSelectedEPass([]);
    setIsRePrint(false);
    setIsAllowPrint(false);
  };

  const onSelectionDetailChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      disablePrint();
    } else {
      const selectedRows = event.api.getSelectedNodes();
      let isRePrint = false;
      const selectedEPass = [];
      selectedRows.forEach((row) => {
        const { data } = row;
        selectedEPass.push({
          factoryPk: data.factoryPk,
          printNo: data.printNo,
          rePrintReason: data.rePrintReason,
          epassNo: data?.epassNo || data?.boxNo,
          model: data?.productionLabel?.plan?.modelId?.parentCode?.code || data?.boxLabel?.purchasePlan?.material?.code,
          line:
            data?.productionLabel?.plan?.line?.name ||
            data?.boxLabel?.purchasePlan?.supplier?.nationalName.slice(0, 20),
          qty: data?.qty,
          grNo: data?.productionLabel?.plan?.grNo || data?.boxLabel?.purchasePlan?.grNo
        });
        if (row.data?.printNo > 0) {
          isRePrint = true;
        }
      });
      setSelectedEPass(selectedEPass);
      setIsRePrint(isRePrint);
      setIsAllowPrint(true);
    }
  };

  const onSelectionPlanChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedStockId(null);
      setSelectedEPass([]);
      setIsAllowReprint(false);
      setIsRePrint(false);
    } else {
      const selectedEPass = [];
      const selectedStockId = event.api.getSelectedNodes()[0].data.factoryPk;
      const selectedRows = event.api.getSelectedNodes();
      let isRePrint = false;
      selectedRows.forEach((row) => {
        const { data } = row;
        selectedEPass.push(data.selectedEPass);
        if (data.selectedEPass.printNo > 0) {
          isRePrint = true;
        }
      });
      setIsRePrint(isRePrint);
      setSelectedStockId(selectedStockId);
      setSelectedEPass(selectedEPass);
      if (gridColumnApi.getColumn('boxNo').visible) {
        setIsAllowReprint(true);
      } else {
        setIsAllowReprint(false);
      }
    }
  };

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleCloseAdjustResultModel = () => {
    setOpenAdjustResultModal(false);
  };

  const handleOpenAdjustResultModel = () => {
    setOpenAdjustResultModal(true);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const handleCloseGenerateModal = () => {
    setIsOpenGenerateModal(false);
  };

  const handleOpenGenerateModal = () => {
    setIsOpenGenerateModal(true);
  };

  const handleOpenCheckModal = (action) => {
    setIsOpenCheckModal(true);
    setModalAction(action);
  };

  const handleCloseCheckModal = () => {
    setIsOpenCheckModal(false);
  };

  const updateGridConfig = async (_columns) => {
    const tableCode = pageSelectedWidget?.widgetName === 'Stock Adjustment' ? tableStockInfo : tableStockHistory;
    mutate({
      url: '/v1/user/ag-grid-configuration/update',
      data: [
        {
          agGridId: tableCode,
          featureCode: pageCode,
          agGridConfig: JSON.stringify(_columns)
        }
      ],
      method: 'post',
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          updateAgGridConfig();
          enqueueSnackbar(translate(`message.update_grid_configuration_successful`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const reloadAfterDelete = () => {
    disableButton();
    if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
      onLoadDataAdjustment();
    } else {
      onLoadDataHistory();
    }
  };

  const deleteLabel = () => {
    setIsSubmitting(true);
    if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
      let uri = 'production-label';
      if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
        uri = 'box-label';
      }
      mutate({
        url: `/v1/${uri}/${labelId}`,
        method: 'delete',
        featureCode: 'user.delete'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            reloadAfterDelete();
            setIsSubmitting(false);
            handleCloseCheckModal();
            enqueueSnackbar(`Label: ${generatedId} was deleted successfully`, {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
        })
        .catch((error) => {
          console.error(error);
          setIsSubmitting(false);
        });
    } else {
      const selectedPlanIds = deleteLabels.map((label) => {
        const { factoryPk } = label?.plan;
        return {
          plan: {
            factoryPk
          }
        };
      });
      mutate({
        url: `/v1/production-label/delete-multi`,
        data: {
          productionLabelList: selectedPlanIds
        },
        method: 'post',
        featureCode: 'user.delete'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            reloadAfterDelete();
            setIsSubmitting(false);
            handleCloseCheckModal();
            const _generatedIds = deleteLabels.map((label) => label.generateID);
            enqueueSnackbar(
              `Label: ${_generatedIds.join(', ')} ${_generatedIds.length === 1 ? 'was' : 'were'} deleted successfully`,
              {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              }
            );
          }
        })
        .catch((error) => {
          console.error(error);
          setIsSubmitting(false);
        });
    }
  };

  const generateLabel = () => {
    if (isEmpty(generateLabels)) {
      selectPlanWarning();
    } else {
      setIsSubmitting(true);
      const selectedPlanIds = generateLabels.map((label) => {
        const { factoryPk } = label?.plan;
        const { factoryCode } = getFactoryAndIdByPk(factoryPk);
        return {
          plan: {
            factoryPk
          },
          pk: {
            factoryCode
          }
        };
      });
      mutate({
        url: '/v1/production-label/create-multi',
        data: {
          productionLabelList: selectedPlanIds
        },
        method: 'post',
        featureCode: 'user.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            onLoadDataAdjustment();
            const generatedIds = res.data.map((data) => data.generateID);
            enqueueSnackbar(
              `Generated ID: ${generatedIds.join(', ')} ${
                generatedIds.length === 1 ? 'was' : 'were'
              } generated successfully`,
              {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              }
            );
            setIsSubmitting(false);
            handleCloseCheckModal();
          }
        })
        .catch((error) => {
          enqueueSnackbar(error?.data?.statusMessageDetail, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          console.error(error);
          setIsSubmitting(false);
          handleCloseCheckModal();
        });
    }
  };

  const handlePrint = () => {
    handleOpenModal(true);
  };

  const selectPlanWarning = () => {
    enqueueSnackbar(translate(`message.please_select_at_least_1_plan`), {
      variant: 'warning',
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const onRowDoubleClicked = (e) => {
    if (pageSelectedWidget?.widgetName === 'Production Label') {
      e.api.forEachNode((node) => node.setSelected(node.data.plan.factoryPk === e.data.plan.factoryPk));
    }
  };

  const onCellClicked = (gridApi) => {
    if (gridApi.column.colId === 'stockQty' && gridApi.value > 0) {
      const detailParams = {
        materialType: searchParams.materialType,
        materialCode: searchParams.materialCode,
        materialName: searchParams.materialDesc,
        label: searchParams.label,
        lotNo: searchParams.lotNo,
        stockStatus: searchParams.stockStatus,
        stockStatusDisplay: searchParams.isStockStatus,
        lotNoDisplay: searchParams.isLotNo,
        supplierDisplay: searchParams.isSupplier,
        labelDisplay: searchParams.isBoxNo,
        pageName: 'stock',
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
      if (searchParams.stockStatus) {
        detailParams.stockStatus = searchParams.stockStatus;
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
      handleOpenDetailModal('Detail Stock Info');
      setTotalStock(gridApi.value);
    }
  };

  const handleClear = () => {
    setBoxLabelScanner('');
    dispatch(resetOperation());
  };

  const handleProcessRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await handleRequestAdjust(modalAction, operations);
      setIsSubmitting(false);
      const { data } = res;
      if (data.mergedStockMovement) {
        dispatch(
          setOperations({
            ...operations,
            merge: {
              ...operations.merge,
              labelNoMerge: data.mergedStockMovement?.label?.labelNo
            }
          })
        );
      }
      if (data.splitStockMovements && data.splitStockMovements.length === 2) {
        dispatch(
          setOperations({
            ...operations,
            split: {
              ...operations.split,
              lotNo1: data.splitStockMovements[0]?.label?.lotNo,
              labelNo1: data.splitStockMovements[0]?.label?.labelNo,
              lotNo2: data.splitStockMovements[1]?.label?.lotNo,
              labelNo2: data.splitStockMovements[1]?.label?.labelNo
            }
          })
        );
      }
      handleCloseModal();
      setAdjustmentResult(data?.stockMovementAdjustmentHistory?.operationNo);
      handleOpenAdjustResultModel();
    } catch (error) {
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  const onClickProcess = () => {
    const validateResult = handleValidateBeforeProcess(operationType, operations, boxLabelScanner, boxLabelScanner2);
    const { isValid, error } = validateResult;

    setErrorMessage(error);
    if (isValid) {
      setModalAction(operationType);
      handleOpenModal(true);
    }
  };

  const onScanBoxLabel = (type) => {
    if (!boxLabelScanner) {
      enqueueSnackbar(translate(`message.please_scan_box_label`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      setScanStatus(false);
      return;
    }
    handleQueryLabel(type);
  };

  const handleQueryLabel = async (scanType) => {
    try {
      const _operation = await handleQueryStockMovement(
        scanType,
        scanType === ScanLabelEnum.SCAN_LABEL_2 ? boxLabelScanner2 : boxLabelScanner,
        operationType,
        operations
      );
      dispatch(setOperations(_operation));
    } catch (error) {
      console.error(error);
    }
  };

  const onClickReprint = () => {
    if (!selectedStockId) {
      selectWarning();
    } else {
      handleOpenDetailModal('Re-Print');
    }
  };

  const selectWarning = () => {
    enqueueSnackbar(translate(`message.please_select_1_row`), {
      variant: 'warning',
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };
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
                  Inquiry
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
                {pageSelectedWidget?.widgetName === 'Stock Adjustment' && (
                  <Card
                    sx={{
                      px: 1,
                      py: 1,
                      borderRadius: '0px',
                      display: 'row',
                      height: 'calc((100% - 30px)/2)',
                      minHeight: { xs: `calc((80vh - 100px)/2)` }
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="left"
                        display="flex"
                        alignItems="center"
                        sx={{ marginTop: `0 !important`, marginBottom: `1 !important`, width: '30%' }}
                      >
                        <Typography variant="h5" noWrap sx={{ width: '50%' }}>
                          {translate(`typo.operation_type`)}
                        </Typography>
                        <Dropdown
                          fullWidth
                          id="operationType"
                          name="operationType"
                          value={operationType}
                          onChange={(e) => {
                            setOperationType(e.target.value);
                          }}
                          allowEmptyOption={false}
                          groupId="D026000"
                          excludes={['D026001', 'D026002', 'D026010', 'D026011']}
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
                          onClick={handleClear}
                          size="small"
                          label="Clear"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickProcess}
                          size="small"
                          label="Process"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                      </Stack>
                    </Stack>
                    <Card
                      sx={{
                        px: 1,
                        py: 1,
                        borderRadius: '0px',
                        height: { md: `calc((80vh - 190px)/2)` },
                        overflow: 'auto'
                      }}
                    >
                      {operationType === OperationEnum.SPLIT && (
                        <>
                          <TextField
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
                            error={Boolean(errorMessage?.split?.boxNo)}
                            helperText={errorMessage?.split?.boxNo}
                          />
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Typography variant="subtitle2">&nbsp;</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="split.stockQty"
                                    name="split.stockQty"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label Qty"
                                    size="small"
                                    disabled
                                    value={operations.split.stockQty}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.materialCode"
                                    name="split.materialCode"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Code"
                                    size="small"
                                    disabled
                                    value={operations.split.materialCode}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.materialId"
                                    name="split.materialId"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material ID"
                                    size="small"
                                    disabled
                                    value={operations.split.materialId}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.materialDesc"
                                    name="split.materialDesc"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Desc."
                                    size="small"
                                    disabled
                                    value={operations.split.materialDesc}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.unit"
                                    name="split.unit"
                                    autoComplete="off"
                                    fullWidth
                                    label="Unit"
                                    size="small"
                                    disabled
                                    value={operations.split.unit}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                                <Typography variant="subtitle2">&nbsp;</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="split.lotNo"
                                    name="split.lotNo"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    disabled
                                    value={operations.split.lotNo}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="supplier"
                                    name="supplier"
                                    autoComplete="off"
                                    fullWidth
                                    label="Supplier"
                                    size="small"
                                    disabled
                                    value={operations.split.supplier}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.stock"
                                    name="split.stock"
                                    autoComplete="off"
                                    fullWidth
                                    label="Storage"
                                    size="small"
                                    disabled
                                    value={operations.split.stock}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.zone"
                                    name="split.zone"
                                    autoComplete="off"
                                    fullWidth
                                    label="Zone"
                                    size="small"
                                    disabled
                                    value={operations.split.zone}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.bin"
                                    name="split.bin"
                                    autoComplete="off"
                                    fullWidth
                                    label="Bin"
                                    size="small"
                                    disabled
                                    value={operations.split.bin}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Typography variant="subtitle2">{translate(`typo.label_1_information`)}</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="split.stockQty1"
                                    name="split.stockQty1"
                                    autoComplete="off"
                                    fullWidth
                                    required
                                    label="Label Qty"
                                    size="small"
                                    value={operations.split.stockQty1}
                                    onChange={handleChangeOperations}
                                    error={Boolean(errorMessage?.split?.stockQty1)}
                                    helperText={errorMessage?.split?.stockQty1}
                                  />
                                  <TextField
                                    id="split.lotNo1"
                                    name="split.lotNo1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    value={operations.split.lotNo1}
                                    disabled={operations.split.disableLotNo1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.labelNo1"
                                    name="split.labelNo1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label No."
                                    size="small"
                                    disabled
                                    value={operations.split.labelNo1}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                                <Typography variant="subtitle2">{translate(`typo.label_2_information`)}</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="split.stockQty2"
                                    name="split.stockQty2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label Qty"
                                    size="small"
                                    disabled
                                    value={operations.split.stockQty2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.lotNo2"
                                    name="split.lotNo2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    disabled
                                    value={operations.split.lotNo2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="split.labelNo2"
                                    name="split.labelNo2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label No."
                                    size="small"
                                    disabled
                                    value={operations.split.labelNo2}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {operationType === OperationEnum.MERGE && (
                        <Grid container spacing={1} sx={{ mt: 1 }} key="merge">
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <TextField
                                // autoFocus
                                variant="filled"
                                className={classes.inputScanner}
                                fullWidth
                                value={boxLabelScanner}
                                onChange={(e) => setBoxLabelScanner(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    onScanBoxLabel(ScanLabelEnum.SCAN_LABEL_1);
                                  }
                                }}
                                placeholder="Focus here to scan 1st label"
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errorMessage?.merge?.boxNo1)}
                                helperText={errorMessage?.merge?.boxNo1}
                              />
                              <Card sx={{ p: 1 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                                  <TextField
                                    id="merge.stockQty1"
                                    name="merge.stockQty1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label Qty"
                                    size="small"
                                    disabled
                                    value={operations.merge.stockQty1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialCode1"
                                    name="merge.materialCode1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Code"
                                    size="small"
                                    disabled
                                    value={operations.merge.materialCode1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialId1"
                                    name="merge.materialId1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material ID"
                                    size="small"
                                    disabled
                                    value={operations.merge.materialId1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialDesc1"
                                    name="merge.materialDesc1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Desc."
                                    size="small"
                                    disabled
                                    value={operations.merge.materialDesc1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.unit1"
                                    name="merge.unit1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Unit"
                                    size="small"
                                    disabled
                                    value={operations.merge.unit1}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="merge.lotNo1"
                                    name="merge.lotNo1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    disabled
                                    value={operations.merge.lotNo1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.supplier1"
                                    name="merge.supplier1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Supplier"
                                    size="small"
                                    disabled
                                    value={operations.merge.supplier1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.stock1"
                                    name="merge.stock1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Storage"
                                    size="small"
                                    disabled
                                    value={operations.merge.stock1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.zone1"
                                    name="merge.zone1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Zone"
                                    size="small"
                                    disabled
                                    value={operations.merge.zone1}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.bin1"
                                    name="merge.bin1"
                                    autoComplete="off"
                                    fullWidth
                                    label="Bin"
                                    size="small"
                                    disabled
                                    value={operations.merge.bin1}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                              </Card>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <TextField
                                // autoFocus
                                variant="filled"
                                className={classes.inputScanner}
                                fullWidth
                                value={boxLabelScanner2}
                                onChange={(e) => setBoxLabelScanner2(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    onScanBoxLabel(ScanLabelEnum.SCAN_LABEL_2);
                                  }
                                }}
                                placeholder="Focus here to scan 2nd label"
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errorMessage?.merge?.boxNo2)}
                                helperText={errorMessage?.merge?.boxNo2}
                              />
                              <Card sx={{ p: 1 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                                  <TextField
                                    id="merge.stockQty2"
                                    name="merge.stockQty2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label Qty"
                                    size="small"
                                    disabled
                                    value={operations.merge.stockQty2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialCode2"
                                    name="merge.materialCode2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Code"
                                    size="small"
                                    disabled
                                    value={operations.merge.materialCode2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialId2"
                                    name="merge.materialId2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material ID"
                                    size="small"
                                    disabled
                                    value={operations.merge.materialId2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.materialDesc2"
                                    name="merge.materialDesc2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Material Desc."
                                    size="small"
                                    disabled
                                    value={operations.merge.materialDesc2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.unit2"
                                    name="merge.unit2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Unit"
                                    size="small"
                                    disabled
                                    value={operations.merge.unit2}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <TextField
                                    id="merge.lotNo2"
                                    name="merge.lotNo2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    disabled
                                    value={operations.merge.lotNo2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.supplier2"
                                    name="merge.supplier2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Supplier"
                                    size="small"
                                    disabled
                                    value={operations.merge.supplier2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.stock2"
                                    name="merge.stock2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Storage"
                                    size="small"
                                    disabled
                                    value={operations.merge.stock2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.zone2"
                                    name="merge.zone2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Zone"
                                    size="small"
                                    disabled
                                    value={operations.merge.zone2}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.bin2"
                                    name="merge.bin2"
                                    autoComplete="off"
                                    fullWidth
                                    label="Bin"
                                    size="small"
                                    disabled
                                    value={operations.merge.bin2}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                              </Card>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <Stack spacing={1}>
                              <Card sx={{ p: 1 }}>
                                <Typography variant="subtitle2">{translate(`typo.label_merge_information`)}</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <Dropdown
                                    id="merge.stockMerge"
                                    name="merge.stockMerge"
                                    label="Storage"
                                    options={commonDropdown.stockDropdown.filter((stock) =>
                                      factories.includes(stock.factory)
                                    )}
                                    size="small"
                                    required
                                    value={operations.merge.stockMerge}
                                    onChange={handleChangeOperations}
                                    errorMessage={errorMessage?.merge?.stockMerge}
                                  />
                                  <Dropdown
                                    id="merge.zoneMerge"
                                    name="merge.zoneMerge"
                                    label="Zone"
                                    options={commonDropdown.zoneDropdown.filter(
                                      (zone) =>
                                        factories.includes(zone.factory) && zone.stock === operations.merge.stockMerge
                                    )}
                                    size="small"
                                    required
                                    value={operations.merge.zoneMerge}
                                    onChange={handleChangeOperations}
                                    errorMessage={errorMessage?.merge?.zoneMerge}
                                  />
                                  <Dropdown
                                    id="merge.binMerge"
                                    name="merge.binMerge"
                                    label="Bin"
                                    options={commonDropdown.binDropdown.filter(
                                      (bin) =>
                                        factories.includes(bin.factory) &&
                                        bin.stock === operations.merge.stockMerge &&
                                        bin.zone === operations.merge.zoneMerge
                                    )}
                                    size="small"
                                    required
                                    value={operations.merge.binMerge}
                                    onChange={handleChangeOperations}
                                    errorMessage={errorMessage?.merge?.binMerge}
                                  />
                                  <TextField
                                    key="merge-lotNoMerge"
                                    id="merge.lotNoMerge"
                                    name="merge.lotNoMerge"
                                    autoComplete="off"
                                    fullWidth
                                    label="Lot No."
                                    size="small"
                                    disabled={operations.merge.disableLotNoMerge}
                                    value={operations.merge.lotNoMerge}
                                    onChange={handleChangeOperations}
                                  />
                                  <TextField
                                    id="merge.labelNoMerge"
                                    name="merge.labelNoMerge"
                                    autoComplete="off"
                                    fullWidth
                                    label="Label No."
                                    size="small"
                                    disabled
                                    value={operations.merge.labelNoMerge}
                                    onChange={handleChangeOperations}
                                  />
                                </Stack>
                              </Card>
                            </Stack>
                          </Grid>
                        </Grid>
                      )}
                      {operationType === OperationEnum.BLOCK_RELEASE && (
                        <>
                          <TextField
                            // autoFocus
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
                            error={Boolean(errorMessage?.block?.boxNo)}
                            helperText={errorMessage?.block?.boxNo}
                          />
                          <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="block.stockQty"
                                name="block.stockQty"
                                autoComplete="off"
                                fullWidth
                                label="Label Qty"
                                size="small"
                                disabled
                                value={operations.block.stockQty}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.materialCode"
                                name="block.materialCode"
                                autoComplete="off"
                                fullWidth
                                label="Material Code"
                                size="small"
                                disabled
                                value={operations.block.materialCode}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.materialId"
                                name="block.materialId"
                                autoComplete="off"
                                fullWidth
                                label="Material ID"
                                size="small"
                                disabled
                                value={operations.block.materialId}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.materialDesc"
                                name="block.materialDesc"
                                autoComplete="off"
                                fullWidth
                                label="Material Desc."
                                size="small"
                                disabled
                                value={operations.block.materialDesc}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.unit"
                                name="block.unit"
                                autoComplete="off"
                                fullWidth
                                label="Unit"
                                size="small"
                                disabled
                                value={operations.block.unit}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="block.lotNo"
                                name="block.lotNo"
                                autoComplete="off"
                                fullWidth
                                label="Lot No."
                                size="small"
                                disabled
                                value={operations.block.lotNo}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.supplier"
                                name="block.supplier"
                                autoComplete="off"
                                fullWidth
                                label="Supplier"
                                size="small"
                                disabled
                                value={operations.block.supplier}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.stock"
                                name="block.stock"
                                autoComplete="off"
                                fullWidth
                                label="Storage"
                                size="small"
                                disabled
                                value={operations.block.stock}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.zone"
                                name="block.zone"
                                autoComplete="off"
                                fullWidth
                                label="Zone"
                                size="small"
                                disabled
                                value={operations.block.zone}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="block.bin"
                                name="block.bin"
                                autoComplete="off"
                                fullWidth
                                label="Bin"
                                size="small"
                                disabled
                                value={operations.block.bin}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <Dropdown
                                id="block.reason"
                                name="block.reason"
                                label="Reason"
                                groupId="D027000"
                                size="small"
                                fullWidth
                                required
                                value={operations.block.reason}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.block?.reason}
                              />
                              <TextField
                                id="block.detailReason"
                                name="block.detailReason"
                                autoComplete="off"
                                fullWidth
                                required
                                label="Detail Reason"
                                size="small"
                                value={operations.block.detailReason}
                                onChange={handleChangeOperations}
                                error={errorMessage?.block?.detailReason}
                                helperText={errorMessage?.block?.detailReason}
                              />
                            </Stack>
                          </Stack>
                        </>
                      )}
                      {(operationType === OperationEnum.ADJUST) && (
                        <>
                          <TextField
                            // autoFocus
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
                            error={Boolean(errorMessage?.adjust?.boxNo)}
                            helperText={errorMessage?.adjust?.boxNo}
                          />
                          <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="adjust.stockQty"
                                name="adjust.stockQty"
                                autoComplete="off"
                                fullWidth
                                required
                                label="Label Qty"
                                size="small"
                                value={operations.adjust.stockQty}
                                onChange={handleChangeOperations}
                                error={errorMessage?.adjust?.stockQty}
                                helperText={errorMessage?.adjust?.stockQty}
                              />
                              <TextField
                                id="adjust.materialCode"
                                name="adjust.materialCode"
                                autoComplete="off"
                                fullWidth
                                label="Material Code"
                                size="small"
                                disabled
                                value={operations.adjust.materialCode}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.materialId"
                                name="adjust.materialId"
                                autoComplete="off"
                                fullWidth
                                label="Material ID"
                                size="small"
                                disabled
                                value={operations.adjust.materialId}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.materialDesc"
                                name="adjust.materialDesc"
                                autoComplete="off"
                                fullWidth
                                label="Material Desc."
                                size="small"
                                disabled
                                value={operations.adjust.materialDesc}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.unit"
                                name="adjust.unit"
                                autoComplete="off"
                                fullWidth
                                label="Unit"
                                size="small"
                                disabled
                                value={operations.adjust.unit}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="adjust.lotNo"
                                name="adjust.lotNo"
                                autoComplete="off"
                                fullWidth
                                label="Lot No."
                                size="small"
                                disabled
                                value={operations.adjust.lotNo}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.supplier"
                                name="adjust.supplier"
                                autoComplete="off"
                                fullWidth
                                label="Supplier"
                                size="small"
                                disabled
                                value={operations.adjust.supplier}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.storage"
                                name="adjust.storage"
                                autoComplete="off"
                                fullWidth
                                label="Storage"
                                size="small"
                                disabled
                                value={operations.adjust.storage}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.zone"
                                name="adjust.zone"
                                autoComplete="off"
                                fullWidth
                                label="Zone"
                                size="small"
                                disabled
                                value={operations.adjust.zone}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="adjust.bin"
                                name="adjust.bin"
                                autoComplete="off"
                                fullWidth
                                label="Bin"
                                size="small"
                                disabled
                                value={operations.adjust.bin}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <Dropdown
                                id="adjust.reason"
                                name="adjust.reason"
                                label="Reason"
                                groupId="D027000"
                                size="small"
                                fullWidth
                                required
                                value={operations.adjust.reason}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.adjust?.reason}
                              />
                              <TextField
                                id="adjust.detailReason"
                                name="adjust.detailReason"
                                autoComplete="off"
                                fullWidth
                                required
                                label="Detail Reason"
                                size="small"
                                value={operations.adjust.detailReason}
                                onChange={handleChangeOperations}
                                error={errorMessage?.adjust?.detailReason}
                                helperText={errorMessage?.adjust?.detailReason}
                              />
                            </Stack>
                          </Stack>
                        </>
                      )}
                      {operationType === OperationEnum.GI_WT_PO && (
                        <>
                        <TextField
                          // autoFocus
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
                          error={Boolean(errorMessage?.giWtPo?.boxNo)}
                          helperText={errorMessage?.giWtPo?.boxNo}
                        />
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="giWtPo.stockQty"
                              name="giWtPo.stockQty"
                              autoComplete="off"
                              fullWidth
                              required
                              label="Label Qty"
                              size="small"
                              value={operations?.giWtPo?.stockQty}
                              onChange={handleChangeOperations}
                              error={errorMessage?.giWtPo?.stockQty}
                              helperText={errorMessage?.giWtPo?.stockQty}
                            />
                            <TextField
                              id="giWtPo.materialCode"
                              name="giWtPo.materialCode"
                              autoComplete="off"
                              fullWidth
                              label="Material Code"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.materialCode}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.materialId"
                              name="giWtPo.materialId"
                              autoComplete="off"
                              fullWidth
                              label="Material ID"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.materialId}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.materialDesc"
                              name="giWtPo.materialDesc"
                              autoComplete="off"
                              fullWidth
                              label="Material Desc."
                              size="small"
                              disabled
                              value={operations?.giWtPo?.materialDesc}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.unit"
                              name="giWtPo.unit"
                              autoComplete="off"
                              fullWidth
                              label="Unit"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.unit}
                              onChange={handleChangeOperations}
                            />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="giWtPo.lotNo"
                              name="giWtPo.lotNo"
                              autoComplete="off"
                              fullWidth
                              label="Lot No."
                              size="small"
                              disabled
                              value={operations?.giWtPo?.lotNo}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.supplier"
                              name="giWtPo.supplier"
                              autoComplete="off"
                              fullWidth
                              label="Supplier"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.supplier}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.storage"
                              name="giWtPo.storage"
                              autoComplete="off"
                              fullWidth
                              label="Storage"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.stock}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.zone"
                              name="giWtPo.zone"
                              autoComplete="off"
                              fullWidth
                              label="Zone"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.zone}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="giWtPo.bin"
                              name="giWtPo.bin"
                              autoComplete="off"
                              fullWidth
                              label="Bin"
                              size="small"
                              disabled
                              value={operations?.giWtPo?.bin}
                              onChange={handleChangeOperations}
                            />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <Dropdown
                                id="giWtPo.lineName"
                                name="giWtPo.lineName"
                                label="Line Name"
                                allowEmptyOption={false}
                                options={commonDropdown.lineDropdown}
                                size="small"
                                fullWidth
                                value={operations?.giWtPo?.lineName}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="giWtPo.lineCode"
                                name="giWtPo.lineCode"
                                label="Line Code"
                                disabled
                                size="small"
                                fullWidth
                                value={operations?.giWtPo?.lineCode}
                              />
                            <Dropdown
                              id="giWtPo.reason"
                              name="giWtPo.reason"
                              label="Reason"
                              groupId="D027000"
                              size="small"
                              fullWidth
                              required
                              value={operations?.giWtPo?.reason}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.giWtPo?.reason}
                            />
                            <TextField
                              id="giWtPo.detailReason"
                              name="giWtPo.detailReason"
                              autoComplete="off"
                              fullWidth
                              required
                              label="Detail Reason"
                              size="small"
                              value={operations?.giWtPo?.detailReason}
                              onChange={handleChangeOperations}
                              error={errorMessage?.giWtPo?.detailReason}
                              helperText={errorMessage?.giWtPo?.detailReason}
                            />
                          </Stack>
                        </Stack>
                      </>
                      )}
                      {operationType === OperationEnum.GR_WT_PO && (
                        <>
                          <TextField
                            // autoFocus
                            variant="filled"
                            className={classes.inputScanner}
                            fullWidth
                            value={boxLabelScanner}
                            onChange={(e) => setBoxLabelScanner(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                onScanBoxLabel('SCAN_BY_LABEL');
                              }
                            }}
                            placeholder="Focus here to scan"
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errorMessage?.grWtPo?.boxNo)}
                            helperText={errorMessage?.grWtPo?.boxNo}
                          />
                          <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="grWtPo.stockQty"
                                name="grWtPo.stockQty"
                                autoComplete="off"
                                fullWidth
                                label="Label Qty"
                                size="small"
                                disabled
                                value={operations.grWtPo.stockQty}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.materialCode"
                                name="grWtPo.materialCode"
                                autoComplete="off"
                                fullWidth
                                label="Material Code"
                                size="small"
                                disabled
                                value={operations.grWtPo.materialCode}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.materialId"
                                name="grWtPo.materialId"
                                autoComplete="off"
                                fullWidth
                                label="Material ID"
                                size="small"
                                disabled
                                value={operations.grWtPo.materialId}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.materialDesc"
                                name="grWtPo.materialDesc"
                                autoComplete="off"
                                fullWidth
                                label="Material Desc."
                                size="small"
                                disabled
                                value={operations.grWtPo.materialDesc}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.unit"
                                name="grWtPo.unit"
                                autoComplete="off"
                                fullWidth
                                label="Unit"
                                size="small"
                                disabled
                                value={operations.grWtPo.unit}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="grWtPo.lotNo"
                                name="grWtPo.lotNo"
                                autoComplete="off"
                                fullWidth
                                label="Lot No."
                                size="small"
                                disabled
                                value={operations.grWtPo.lotNo}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.supplier"
                                name="grWtPo.supplier"
                                autoComplete="off"
                                fullWidth
                                label="Supplier"
                                size="small"
                                disabled
                                value={operations.grWtPo.supplier}
                                onChange={handleChangeOperations}
                              />
                              <Dropdown
                                id="grWtPo.stock"
                                name="grWtPo.stock"
                                label="Storage"
                                options={commonDropdown.stockDropdown.filter((stock) =>
                                  factories.includes(stock.factory)
                                )}
                                size="small"
                                required
                                value={operations.grWtPo.stock}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.grWtPo?.stock}
                              />
                              <Dropdown
                                id="grWtPo.zone"
                                name="grWtPo.zone"
                                label="Zone"
                                options={commonDropdown.zoneDropdown.filter(
                                  (zone) => factories.includes(zone.factory) && zone.stock === operations.grWtPo.stock
                                )}
                                size="small"
                                required
                                value={operations.grWtPo.zone}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.grWtPo?.zone}
                              />
                              <Dropdown
                                id="grWtPo.bin"
                                name="grWtPo.bin"
                                label="Bin"
                                options={commonDropdown.binDropdown.filter(
                                  (bin) =>
                                    factories.includes(bin.factory) &&
                                    bin.stock === operations.grWtPo.stock &&
                                    bin.zone === operations.grWtPo.zone
                                )}
                                size="small"
                                required
                                value={operations.grWtPo.bin}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.grWtPo?.bin}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <Dropdown
                                id="grWtPo.lineName"
                                name="grWtPo.lineName"
                                label="Line Name"
                                allowEmptyOption={false}
                                options={commonDropdown.lineDropdown}
                                size="small"
                                fullWidth
                                value={operations.grWtPo.lineName}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="grWtPo.lineCode"
                                name="grWtPo.lineCode"
                                label="Line Code"
                                disabled
                                size="small"
                                fullWidth
                                value={operations.grWtPo.lineCode}
                              />
                              <Dropdown
                                id="grWtPo.reason"
                                name="grWtPo.reason"
                                label="Reason"
                                groupId="D027000"
                                size="small"
                                fullWidth
                                required
                                value={operations.grWtPo.reason}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.grWtPo?.reason}
                              />
                              <TextField
                                id="grWtPo.detailReason"
                                name="grWtPo.detailReason"
                                autoComplete="off"
                                fullWidth
                                label="Detail Reason"
                                size="small"
                                required
                                value={operations.grWtPo.detailReason}
                                onChange={handleChangeOperations}
                                error={errorMessage?.grWtPo?.detailReason}
                                helperText={errorMessage?.grWtPo?.detailReason}
                              />
                            </Stack>
                          </Stack>
                        </>
                      )}
                      {operationType === OperationEnum.STOCK_MOVE && (
                        <>
                          <TextField
                            // autoFocus
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
                            error={Boolean(errorMessage?.stockMove?.boxNo)}
                            helperText={errorMessage?.stockMove?.boxNo}
                          />
                          <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="stockMove.stockQty"
                                name="stockMove.stockQty"
                                autoComplete="off"
                                fullWidth
                                label="Label Qty"
                                size="small"
                                disabled
                                value={operations.stockMove.stockQty}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="stockMove.materialCode"
                                name="stockMove.materialCode"
                                autoComplete="off"
                                fullWidth
                                label="Material Code"
                                size="small"
                                disabled
                                value={operations.stockMove.materialCode}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="stockMove.materialId"
                                name="stockMove.materialId"
                                autoComplete="off"
                                fullWidth
                                label="Material ID"
                                size="small"
                                disabled
                                value={operations.stockMove.materialId}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="stockMove.materialDesc"
                                name="stockMove.materialDesc"
                                autoComplete="off"
                                fullWidth
                                label="Material Desc."
                                size="small"
                                disabled
                                value={operations.stockMove.materialDesc}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="stockMove.unit"
                                name="stockMove.unit"
                                autoComplete="off"
                                fullWidth
                                label="Unit"
                                size="small"
                                disabled
                                value={operations.stockMove.unit}
                                onChange={handleChangeOperations}
                              />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                id="stockMove.lotNo"
                                name="stockMove.lotNo"
                                autoComplete="off"
                                fullWidth
                                label="Lot No."
                                size="small"
                                disabled
                                value={operations.stockMove.lotNo}
                                onChange={handleChangeOperations}
                              />
                              <TextField
                                id="stockMove.supplier"
                                name="stockMove.supplier"
                                autoComplete="off"
                                fullWidth
                                label="Supplier"
                                size="small"
                                disabled
                                value={operations.stockMove.supplier}
                                onChange={handleChangeOperations}
                              />
                              <Dropdown
                                id="stockMove.stock"
                                name="stockMove.stock"
                                label="Storage"
                                options={commonDropdown.stockDropdown.filter((stock) =>
                                  factories.includes(stock.factory)
                                )}
                                size="small"
                                required
                                value={operations.stockMove.stock}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.stockMove?.stock}
                              />
                              <Dropdown
                                id="stockMove.zone"
                                name="stockMove.zone"
                                label="Zone"
                                options={commonDropdown.zoneDropdown.filter(
                                  (zone) =>
                                    factories.includes(zone.factory) && zone.stock === operations.stockMove.stock
                                )}
                                size="small"
                                required
                                value={operations.stockMove.zone}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.stockMove?.zone}
                              />
                              <Dropdown
                                id="stockMove.bin"
                                name="stockMove.bin"
                                label="Bin"
                                options={commonDropdown.binDropdown.filter(
                                  (bin) =>
                                    factories.includes(bin.factory) &&
                                    bin.stock === operations.stockMove.stock &&
                                    bin.zone === operations.stockMove.zone
                                )}
                                size="small"
                                required
                                value={operations.stockMove.bin}
                                onChange={handleChangeOperations}
                                errorMessage={errorMessage?.stockMove?.bin}
                              />
                            </Stack>
                          </Stack>
                        </>
                      )}
                    </Card>
                  </Card>
                )}
                <Card
                  sx={{
                    px: 1,
                    py: 0,
                    borderRadius: '0px',
                    display: 'row',
                    height: `${
                      pageSelectedWidget?.widgetName === 'Stock Adjustment'
                        ? 'calc((100% - 35px)/2)'
                        : 'calc((100% - 35px))'
                    }`,
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  {pageSelectedWidget?.widgetName === 'Stock Adjustment' && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="h5">{translate(`typo.detail_generation_info`)}</Typography>
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
                          onClick={onClickReprint}
                          size="small"
                          label="Print"
                          disabled={!isAllowReprint}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                      </Stack>
                    </Stack>
                  )}
                  <div
                    className={themeAgGridClass}
                    style={{
                      height: `${pageSelectedWidget?.widgetName === 'Stock Adjustment' ? '88%' : '98%'}`,
                      width: '100%'
                    }}
                  >
                    <AgGrid
                      columns={columns}
                      rowData={rowData}
                      className={themeAgGridClass}
                      onRowDoubleClicked={onRowDoubleClicked}
                      onCellClicked={onCellClicked}
                      onGridReady={onGridReady}
                      onSelectionChanged={onSelectionPlanChanged}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
              </>
              <DialogDragable
                title={`${OperationCode[modalAction]}`}
                maxWidth="sm"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
                  OperationCode[modalAction]
                }?`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseModal}>
                    {translate(`button.cancel`)}
                  </Button>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    onClick={handleProcessRequest}
                    loading={isSubmitting}
                    loadingIndicator="Processing..."
                  >{`${OperationCode[modalAction]}`}</LoadingButton>
                </DialogActions>
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.information`)}
                maxWidth="sm"
                open={isOpenAdjustResultModal}
                onClose={handleCloseAdjustResultModel}
              >
                <Typography variant="subtitle1" align="center">{`${translate(
                  `typo.process_is_completed_successfully_adjustment_no`
                )}: ${adjustmentResult}?`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseAdjustResultModel}>
                    {translate(`button.ok`)}
                  </Button>
                </DialogActions>
              </DialogDragable>
              <DialogDragable
                title={`${modalStockAction}`}
                maxWidth={['Re-Print'].includes(modalStockAction) ? 'sm' : 'xl'}
                open={isOpenDetailModal}
                onClose={handleCloseDetailModal}
              >
                {modalStockAction === 'Re-Print' && (
                  <LabelPrint
                    widgetName="Purchase Label"
                    onCancel={handleCloseDetailModal}
                    labelToPrint={selectedEPass}
                    isReprint={isRePrint}
                  />
                )}
                {modalStockAction !== 'Re-Print' && (
                  <DetailStock action="stock" detailParams={detailParams} totalStock={totalStock} />
                )}
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
