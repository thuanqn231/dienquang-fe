import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { makeStyles } from '@material-ui/styles';
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
  Autocomplete
} from '@material-ui/core';
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
import { setSearchParams, resetSearchParams } from '../../redux/slices/labelGenerateManagement';
import { setSelectedWidget } from '../../redux/slices/page';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk, isNullVal } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import LabelPrint from './LabelPrint';
import PurchaseLabelGenerate from './PurchaseLabelGenerate';
import { handleValidateBeforeProcess, handleVadidateFactory } from './helper';

const pageCode = 'menu.production.label.labelManagement.label.labelGeneration';
const tablepurchaseGRPlan = 'purchaseLabelPlanList';
const tablePurchaseDetail = 'purchaseLabelDetailList';
const tableProductionPlan = 'productionLabelPlanList';
const tableProductionDetail = 'productionLabelDetailList';
const tableManualLabel = 'manualLabelList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function LabelGenerationList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { commonDropdown, funcPermission, userGridConfig, updateAgGridConfig, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams } = useSelector((state) => state.labelGenerateManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenGenerateModal, setIsOpenGenerateModal] = useState(false);
  const [isOpenCheckModal, setIsOpenCheckModal] = useState(false);
  const [modalAction, setModalAction] = useState('Generate Label');
  const [rowDataPlan, setRowDataPlan] = useState([]);
  const [rowDataDetail, setRowDataDetail] = useState([]);
  const [columnsPlan, setColumnsPlan] = useState(null);
  const [columnsDetail, setColumnsDetail] = useState(null);
  const [gridApiDetail, setGridApiDetail] = useState(null);
  const [gridColumnApiDetail, setGridColumnApiDetail] = useState(null);
  const gridPlanRef = useRef();
  const [gridApiPlan, setGridApiPlan] = useState(null);
  const [gridColumnApiPlan, setGridColumnApiPlan] = useState(null);
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
  const [balQty, setBalQty] = useState(0);
  const [generateQty, setGenerateQty] = useState(0);
  const [sortedQty, setSortedQty] = useState(0);
  const [canPrint, setCanPrint] = useState(true);
  const [lotNo, setLotNo] = useState('');
  const [deleteLabels, setDeleteLabels] = useState([]);
  const [generateLabels, setGenerateLabels] = useState([]);
  const [isRenderAllOrg, setRenderAllOrg] = useState(true);
  const [type, setType] = useState('D050001');
  const [manualLabel, setManualLabel] = useState({});
  const pageSelectedWidget = selectedWidget[pageCode];
  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [errorMessage, setErrorMessage] = useState({});
  const [factories, setFactories] = useState([]);
  const [manualLabelsToDelete, setManualLabelsToDelete] = useState([]);
  const [manualLabelsGeneratedId, setManualLabelsGeneratedId] = useState([]);

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

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
    dispatch(getMaterialDropdown());
    dispatch(getBizPartnerCodeDropdown());
  }, [dispatch]);

  const getDetailGrid = () => {
    let tableCodeDetail;
    switch (pageSelectedWidget?.widgetName) {
      case 'Purchase Label':
        tableCodeDetail = tablePurchaseDetail;
        break;
      case 'Manual Label':
        tableCodeDetail = tableManualLabel;
        break;
      case 'Production Label':
      default:
        tableCodeDetail = tableProductionDetail;
        break;
    }
    return tableCodeDetail;
  }

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCodePlan = pageSelectedWidget?.widgetName === 'Purchase Label' ? tablepurchaseGRPlan : tableProductionPlan;
      const tableCodeDetail = getDetailGrid();
      const tableConfigsPlan = getGridConfig(userGridConfig, pageCode, tableCodePlan);
      tableConfigsPlan.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodePlan}.${column.field}`);
      });
      const tableConfigsDetail = getGridConfig(userGridConfig, pageCode, tableCodeDetail);
      tableConfigsDetail.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
      });
      setColumnsPlan(tableConfigsPlan);
      setColumnsDetail(tableConfigsDetail);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columnsPlan) {
      const tableCodePlan = pageSelectedWidget?.widgetName === 'Purchase Label' ? tablepurchaseGRPlan : tableProductionPlan;
      const tableConfigsPlan = [...columnsPlan];
      tableConfigsPlan.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodePlan}.${column.field}`);
      });
      setColumnsPlan(tableConfigsPlan);
    }
    if (columnsDetail) {
      const tableCodeDetail = getDetailGrid();
      const tableConfigsDetail = [...columnsDetail];
      tableConfigsDetail.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
      });
      setColumnsDetail(tableConfigsDetail);
    }
  }, [currentLang]);

  useEffect(() => {
    if (!isEmpty(manualLabel)) {
      const { errorMessage } = handleValidateBeforeProcess(manualLabel, type);
      setErrorMessage(errorMessage);
    }
  }, [manualLabel])

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  useEffect(() => {
    if (generatedId) {
      if (pageSelectedWidget?.widgetName === 'Purchase Label') {
        onLoadDataPurchaseDetail();
      } else {
        onLoadDataProductionDetail();
      }
    } else {
      setRowDataDetail([]);
    }
  }, [generatedId]);

  useEffect(() => {
    if (gridApiPlan && gridApiDetail) {
      onLoadData();
    }
  }, [selectedWidget]);

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const handleChangeManualLabel = (event) => {
    const _manualLabel = {
      ...manualLabel,
      [event.target.name]: `${event.target.value}`
    };
    setManualLabel(_manualLabel);
  }

  const handleChangeMaterialCode = (value) => {
    const materialCode = value?.value;
    setMaterialCode(value || { value: '', label: '' });
    const _manualLabel = {
      ...manualLabel,
      materialCode,
      materialId: value?.materialId,
      materialDesc: value?.materialDescription,
      unit: value?.materialMainUnit,
    };
    setManualLabel(_manualLabel);
  }

  const onLoadDatapurchaseGRPlan = async () => {
    removeSelectedGridPlan();
    const params = {
      from: fDate(searchParams.planDateFrom),
      to: fDate(searchParams.planDateTo),
      grType: searchParams.grType,
      planId: searchParams.planId,
      purchaseOrderNo: searchParams.purOrderNo,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialName,
      status: searchParams.status
    };
    parseOrgSearchFactory(params, parseSelectedTree);
    const response = await query({
      url: '/v1/box-label-detail/search',
      featureCode: 'user.create',
      params
    });
    setRowDataPlan(response?.data || []);
  }

  const onLoadDataProductionPlan = async () => {
    removeSelectedGridPlan();
    const params = {
      from: fDate(searchParams.planDateFrom),
      to: fDate(searchParams.planDateTo),
      poType: searchParams.poType,
      planId: searchParams.planId,
      prodOrderNo: searchParams.prodOrderNo,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialName,
      status: searchParams.status
    };
    parseOrgSearchAll(params, parseSelectedTree);
    const response = await query({
      url: '/v1/serial-label-detail/search',
      featureCode: 'user.create',
      params
    });
    setRowDataPlan(response?.data || []);
  }

  const onLoadDataManualLabel = async () => {
    const params = {
      from: fDate(searchParams.generatedFrom),
      to: fDate(searchParams.generatedTo),
      labelType: 'D020003',
      genNo: searchParams.generatedId,
      lotNo: searchParams.lotNo,
      boxNo: searchParams.boxNo,
      manualMaterialCode: searchParams.manualMaterialCode,
      manualMaterialName: searchParams.manualMaterialName,
      manualSupplier: searchParams.supplier
    };
    parseOrgSearchFactory(params, parseSelectedTree);
    const response = await query({
      url: '/v1/box-label/search',
      featureCode: 'user.create',
      params
    });
    setRowDataDetail(response?.data || []);
  }

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

  const onInquiry = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    disableButton();
    setSelectedPlanId(null);
    setRowDataDetail([]);
    switch (pageSelectedWidget?.widgetName) {
      case 'Purchase Label':
        await onLoadDatapurchaseGRPlan();
        break;
      case 'Production Label':
        await onLoadDataProductionPlan();
        break;
      case 'Manual Label':
        await onLoadDataManualLabel();
        break;
      default:
        break;
    }
    // updateData(response);
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail:
        <OrganizationTree
          renderAll={isRenderAllOrg}
          parseSelected={handleParseSelectedTree}
        />,
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
                    ...(isActive && { color: 'text.primary', fontWeight: 'fontWeightMedium', bgcolor: 'action.selected' })
                  }}
                  onClick={() => onClickWidget(element.code, element.name)}
                >
                  <ListItemText primary={element.name} />
                </ListItemButton>
              </ListItem>
            )
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
          {
            pageSelectedWidget?.widgetName !== 'Manual Label' &&
            <>
              {
                pageSelectedWidget?.widgetName === 'Purchase Label' &&
                <Dropdown
                  id="grType"
                  name="grType"
                  label="G/R Type"
                  value={searchParams.grType}
                  onChange={handleChangeSearchConfig}
                  groupId='D020000'
                  sx={{ my: 1 }}
                  size='small'
                />
              }
              {
                pageSelectedWidget?.widgetName === 'Production Label' &&
                <Dropdown
                  id="poType"
                  name="poType"
                  label="PO Type"
                  value={searchParams.poType}
                  onChange={handleChangeSearchConfig}
                  groupId='D020000'
                  sx={{ my: 1 }}
                  size='small'
                />
              }
              <DthDatePicker
                name="planDateFrom"
                label="Plan Date From"
                value={searchParams.planDateFrom}
                onChange={(newValue) => {
                  handleChangeDateSearchConfig("planDateFrom", newValue)
                }}
                sx={{ my: 1 }}
                fullWidth
                size="small"
              />
              <DthDatePicker
                name="planDateTo"
                label="Plan Date To"
                value={searchParams.planDateTo}
                onChange={(newValue) => {
                  handleChangeDateSearchConfig("planDateTo", newValue)
                }}
                sx={{ my: 1 }}
                fullWidth
                size="small"
              />
              <TextField
                id="planId"
                name="planId"
                label="Plan ID"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.planId}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              {
                pageSelectedWidget?.widgetName === 'Purchase Label' &&
                <TextField
                  id="purOrderNo"
                  name="purOrderNo"
                  label="Purchase Order No."
                  sx={{ my: 1 }}
                  fullWidth
                  value={searchParams.purOrderNo}
                  onChange={handleChangeSearchConfig}
                  size='small'
                />
              }
              {
                pageSelectedWidget?.widgetName === 'Production Label' &&
                <TextField
                  id="prodOrderNo"
                  name="prodOrderNo"
                  label="Prod. Order"
                  sx={{ my: 1 }}
                  fullWidth
                  value={searchParams.prodOrderNo}
                  onChange={handleChangeSearchConfig}
                  size='small'
                />
              }
              <TextField
                id="materialCode"
                name="materialCode"
                label="Material Code"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.materialCode}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <TextField
                id="materialName"
                name="materialName"
                label="Material ID"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.materialName}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <Dropdown
                id="status"
                name="status"
                label="Status"
                value={searchParams.status}
                onChange={handleChangeSearchConfig}
                options={[
                  { value: 'Planned', label: 'Planned' },
                  { value: 'Generated', label: 'Generated' }
                ]}
                sx={{ my: 1 }}
                size='small'
              />
            </>
          }
          {
            pageSelectedWidget?.widgetName === 'Manual Label' &&
            <>
              <TextField
                id="generatedId"
                name="generatedId"
                label="Generated ID"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.generatedId}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <DthDatePicker
                name="generatedFrom"
                label="Generated Date From"
                value={searchParams.generatedFrom}
                onChange={(newValue) => {
                  handleChangeDateSearchConfig("generatedFrom", newValue)
                }}
                sx={{ my: 1 }}
                fullWidth
                size="small"
              />
              <DthDatePicker
                name="generatedTo"
                label="Generated Date To"
                value={searchParams.generatedTo}
                onChange={(newValue) => {
                  handleChangeDateSearchConfig("generatedTo", newValue)
                }}
                sx={{ my: 1 }}
                fullWidth
                size="small"
              />
              <TextField
                id="lotNo"
                name="lotNo"
                label="Lot No."
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.lotNo}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <TextField
                id="boxNo"
                name="boxNo"
                label="Box No."
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.boxNo}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <TextField
                id="manualMaterialCode"
                name="manualMaterialCode"
                label="Material Code"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.manualMaterialCode}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <TextField
                id="manualMaterialName"
                name="manualMaterialName"
                label="Material Name"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.manualMaterialName}
                onChange={handleChangeSearchConfig}
                size='small'
              />
              <Dropdown
                id="supplier"
                name="supplier"
                label="Suppier"
                value={searchParams.supplier}
                onChange={handleChangeSearchConfig}
                options={bizPartnerCodeDropdown.filter((biz) => factories.includes(biz.factory) && biz.type === 'D028002')}
                sx={{ my: 1 }}
                size='small'
              />
            </>
          }
        </>
      )
    }
  ];

  const onGridReadyPlan = (params) => {
    setGridApiPlan(params.api);
    setGridColumnApiPlan(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
    switch (pageSelectedWidget?.widgetName) {
      case 'Purchase Label':
        onLoadDatapurchaseGRPlan();
        break;
      case 'Production Label':
        onLoadDataProductionPlan();
        break;
      case 'Manual Label':
        onLoadDataManualLabel();
        break;
      default:
        break;
    }
  };
  const onLoadDataProductionDetail = async () => {
    disablePrint();
    const { factoryCode } = getFactoryAndIdByPk(selectedPlanId);
    const response = await query({
      url: '/v1/serial-label/search',
      featureCode: 'user.create',
      params: {
        factoryCode,
        generateID: generatedId
      }
    });
    const data = response?.data || [];
    setRowDataDetail(data);
  };

  const onLoadDataPurchaseDetail = async () => {
    disablePrint();
    const { factoryCode } = getFactoryAndIdByPk(selectedPlanId);
    const response = await query({
      url: '/v1/box-label/search',
      featureCode: 'user.create',
      params: {
        factoryCode,
        generateID: generatedId
      }
    });
    const data = response?.data || [];
    setRowDataDetail(data);
  };

  const disableButton = () => {
    setIsAllowRegister(false);
    setIsAllowDelete(false);
  };

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const handleChangeDateSearchConfig = (name, value) => {
    const _search = {
      ...searchParams,
      [name]: `${value}`
    };
    dispatch(setSearchParams(_search));
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const onGridReadyDetail = (params) => {
    setGridApiDetail(params.api);
    setGridColumnApiDetail(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
    if (pageSelectedWidget?.widgetName === 'Manual Label') {
      onLoadDataManualLabel();
    }
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
      // 
      const selectedRows = event.api.getSelectedNodes();
      let isRePrint = false;
      const selectedEPass = [];
      const _manualLabelsToDelete = [];
      const _manualLabelsGeneratedId = [];
      selectedRows.forEach((row) => {
        const { data } = row;
        let lineOrSupplier = '';
        let model = '';
        let grNo = '';
        let poNo = '';
        switch (pageSelectedWidget?.widgetName) {
          case 'Purchase Label':
            lineOrSupplier = data?.boxLabelDetail?.supplier?.nationalName.slice(0, 20);
            model = data?.boxLabelDetail?.material?.code;
            grNo = data?.boxLabelDetail?.goodReceiptPlan?.grNo
            break;
          case 'Production Label':
            lineOrSupplier = data?.serialLabelDetail?.line?.name;
            model = data?.serialLabelDetail?.material?.code;
            grNo = data?.serialLabelDetail?.goodReceiptPlan?.grNo
            poNo = data?.serialLabelDetail?.orderNo;
            break;
          case 'Manual Label':
            lineOrSupplier = data?.boxLabelDetail?.supplier?.nationalName.slice(0, 20);
            model = data?.boxLabelDetail?.material?.code;
            if (!_manualLabelsToDelete.includes(data?.boxLabelDetail?.factoryPk)) {
              _manualLabelsGeneratedId.push(data?.boxLabelDetail?.generateID);
              _manualLabelsToDelete.push(data?.boxLabelDetail?.factoryPk);
            }
            break;
          default:
            break;
        }
        selectedEPass.push({
          factoryPk: data.factoryPk,
          printNo: data.printNo,
          rePrintReason: data.rePrintReason,
          epassNo: data?.epassNo || data?.labelNo,
          model,
          line: lineOrSupplier,
          qty: data?.qty,
          grNo,
          poNo
        });
        if (row.data?.printNo > 0) {
          isRePrint = true;
        }
      });
      setManualLabelsToDelete(_manualLabelsToDelete);
      setManualLabelsGeneratedId(_manualLabelsGeneratedId);
      setSelectedEPass(selectedEPass);
      setIsRePrint(isRePrint);
      setIsAllowPrint(true);
    }
  };

  const removeSelectedGridPlan = () => {
    gridPlanRef.current.api.forEachNode((node) => {
      node.setSelected(false);
    });
  };

  const onSelectionPlanChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    let isAllowRegister = false;
    let isAllowDelete = false;
    if (rowCount === 0) {
      setSelectedPlanId(null);
      setIsAllowRegister(isAllowRegister);
      setIsAllowDelete(isAllowDelete);
      setGeneratedId(null);
      setLabelId(null);
      setGenerateQty(0);
      setBalQty(0);
      setLotNo('');
    }
    if (rowCount === 1) {
      const { generateID, factoryPk, productionOrder, goodReceiptPlan, lotNo, generateQty, canPrint, sortedQty, remainQty } = event.api.getSelectedNodes()[0]?.data;
      const selectedId = productionOrder?.factoryPk || goodReceiptPlan.factoryPk;
      let balQty;
      if (generateID == null) {
        balQty = sortedQty > 0 ? sortedQty : goodReceiptPlan?.planQty
      }
      else {
        balQty = remainQty
      }
      console.log('balQty', balQty);
      const actualQty = productionOrder?.actualQty || goodReceiptPlan?.actualQty;
      console.log('factoryPk', factoryPk)
      if (canPrint || isUndefined(canPrint)) {
        setCanPrint(true);
      } else {
        setCanPrint(false);
      }
      setSortedQty(sortedQty || 0);
      if (generateID) {
        if (isNullVal(actualQty) || actualQty === 0) {
          isAllowDelete = true;
          setDeleteLabels([event.api.getSelectedNodes()[0]?.data]);
        }
        if (balQty > 0) {
          isAllowRegister = true;
        }
      } else {
        isAllowRegister = true;
        setGenerateLabels([event.api.getSelectedNodes()[0]?.data]);
      }
      setIsAllowRegister(isAllowRegister);
      setIsAllowDelete(isAllowDelete);
      setSelectedPlanId(selectedId);
      setGeneratedId(generateID);
      setLabelId(factoryPk);
      setBalQty(balQty);
      setGenerateQty(generateQty);
      setLotNo(lotNo);
    } else {
      const _deleteLabels = event.api
        .getSelectedNodes()
        .map((row) => row.data)
        .filter((row) => {
          const { plan, goodReceiptPlan } = row;
          const actualQty = plan?.actualQty || goodReceiptPlan?.actualQty;
          return row.generateID && (isNullVal(actualQty) || actualQty === 0)
        });
      const _generateLabels = event.api
        .getSelectedNodes()
        .map((row) => row.data)
        .filter((row) => !row.generateID);
      if (!isEmpty(_deleteLabels)) {
        isAllowDelete = true;
        setDeleteLabels(_deleteLabels);
      }
      if (!isEmpty(_generateLabels)) {
        isAllowRegister = true;
        setGenerateLabels(_generateLabels);
      }
      setIsAllowRegister(isAllowRegister);
      setIsAllowDelete(isAllowDelete);
    }
  };

  const onSaveTableConfig = () => {
    const _columns = gridApiPlan.getColumnDefs();
    updateGridConfig(_columns);
    setColumnsPlan(_columns);
    setIsChangedTableConfig(false);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
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

  const handleProcessRequest = () => {
    switch (modalAction) {
      case 'Generate Label':
        generateLabel();
        break;
      case 'Generate Manual Label':
        handleGenerateManualLabel();
        break;
      case 'Delete Generated Label':
        deleteLabel();
        break;
      case 'Delete Manual Label Generated':
        deleteManualLabel();
        break;
      case 'Print':
        handlePrint();
        break;

      default:
        break;
    }
  };

  const updateGridConfig = async (_columns) => {
    const tableCode = pageSelectedWidget?.widgetName === 'Purchase Label' ? tablepurchaseGRPlan : tableProductionPlan;
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
    if (pageSelectedWidget?.widgetName === 'Purchase Label') {
      onLoadDatapurchaseGRPlan();
    } else if (pageSelectedWidget?.widgetName === 'Manual Label') {
      onLoadDataManualLabel();
    } else {
      onLoadDataProductionPlan();
    }
  };

  const deleteManualLabel = () => {
    setIsSubmitting(true);
    mutate({
      url: `/v1/manual-label/delete-multi`,
      data: {
        boxLabelDetailPKs: manualLabelsToDelete
      },
      method: 'post',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          reloadAfterDelete();
          setIsSubmitting(false);
          handleCloseCheckModal();
          enqueueSnackbar(
            `Labels with Generated ID: ${manualLabelsGeneratedId.join(', ')} ${manualLabelsGeneratedId.length === 1 ? 'was' : 'were'} deleted successfully`,
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

  const deleteLabel = () => {
    setIsSubmitting(true);
    if (pageSelectedWidget?.widgetName === 'Purchase Label') {
      let uri = 'production-label';
      if (pageSelectedWidget?.widgetName === 'Purchase Label') {
        uri = 'box-label-detail';
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
            setRowDataDetail([]);
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
        const { factoryPk } = label?.productionOrder;
        return {
          productionOrder: {
            factoryPk
          }
        };
      });
      mutate({
        url: `/v1/serial-label-detail/delete-multi`,
        data: {
          serialLabelDetails: selectedPlanIds
        },
        method: 'post',
        featureCode: 'user.delete'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            reloadAfterDelete();
            setIsSubmitting(false);
            handleCloseCheckModal();
            setRowDataDetail([]);
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
        const { factoryPk } = label?.productionOrder;
        const { factoryCode } = getFactoryAndIdByPk(factoryPk);
        return {
          productionOrder: {
            factoryPk
          },
          pk: {
            factoryCode
          }
        };
      });
      mutate({
        url: '/v1/serial-label-detail/create-multi',
        data: {
          serialLabelDetails: selectedPlanIds
        },
        method: 'post',
        featureCode: 'user.create',
        timeout: 120000
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            onLoadDataProductionPlan();
            const generatedIds = res.data.map((data) => data.generateID);
            enqueueSnackbar(
              `Generated ID: ${generatedIds.join(', ')} ${generatedIds.length === 1 ? 'was' : 'were'
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

  const handleClickRegister = () => {
    switch (pageSelectedWidget?.widgetName) {
      case 'Production Label':
        handleOpenCheckModal('Generate Label');
        break;
      case 'Purchase Label':
        handleOpenGenerateModal(true);
        break;
      case 'Manual Label':
        handleValidateManualLabel();
        break;
      default:
        throw new Error(`Unknown action`);
    }
  }

  const handleValidateManualLabel = () => {
    const { isValid, errorMessage } = handleValidateBeforeProcess(manualLabel, type);
    if (isValid) {
      handleOpenCheckModal('Generate Manual Label');
    } else {
      setErrorMessage(errorMessage);
    }
  }

  const handleGenerateManualLabel = () => {
    setIsSubmitting(true);
    mutate({
      url: '/v1/box-label-detail/create',
      data: {
        boxLabelDetails: [
          {
            material: {
              factoryPk: manualLabel?.materialCode
            },
            supplier: {
              factoryPk: manualLabel?.supplier
            },
            reason: {
              code: manualLabel?.reason
            },
            type: 'MANUAL_PURCHASE',
            remark: manualLabel?.remark,
            lotNo: manualLabel?.lotNo,
            generateQty: manualLabel?.lableQty,
            packageQty: manualLabel?.packageQty,
            pk: {
              factoryCode: manualLabel?.factory
            }
          }
        ]
      },
      method: 'post',
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          onLoadDataManualLabel();
          const _generatedId = res?.data?.generateID || '';
          enqueueSnackbar(
            `Generated ID: ${_generatedId} was generated successfully`,
            {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            }
          );
          setManualLabel({
            factory: '',
            materialCode: '',
            materialId: '',
            materialDesc: '',
            unit: '',
            lotNo: '',
            supplier: '',
            lableQty: 0,
            packageQty: 0,
            generateId: '',
            reason: '',
            remark: ''
          });
          setMaterialCode({
            value: '',
            label: ''
          });
          setErrorMessage({
            factory: '',
            materialCode: '',
            materialId: '',
            materialDesc: '',
            unit: '',
            lotNo: '',
            supplier: '',
            lableQty: '',
            packageQty: '',
            generateId: '',
            reason: '',
            remark: ''
          })
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
                    {
                      pageSelectedWidget?.widgetName === 'Manual Label' &&
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
                          id="type"
                          name="type"
                          value={type}
                          onChange={(e) => {
                            setType(e.target.value);
                          }}
                          allowEmptyOption={false}
                          groupId="D050000"
                          sx={{ my: 1 }}
                          size="small"
                        />
                      </Stack>
                    }
                    {
                      pageSelectedWidget?.widgetName !== 'Manual Label' &&
                      <Typography variant="h5">{`${pageSelectedWidget?.widgetName === 'Production Label' ? translate(`typo.production`) : translate(`typo.purchase`)
                        } ${translate(`typo.plan_info`)}`}</Typography>
                    }
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
                        onClick={handleClickRegister}
                        size="small"
                        label={translate(`button.register`)}
                        pageCode={pageCode}
                        widgetCode={pageSelectedWidget?.widgetCode}
                        funcType="CREATE"
                        disabled={pageSelectedWidget?.widgetName !== 'Manual Label' && !isAllowRegister || !canPrint}
                      />
                      {
                        pageSelectedWidget?.widgetName !== 'Manual Label' &&
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={() => handleOpenCheckModal('Delete Generated Label')}
                          size="small"
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                          disabled={!isAllowDelete}
                        />
                      }
                    </Stack>
                  </Stack>
                  {
                    pageSelectedWidget?.widgetName === 'Manual Label' &&
                    <div className={themeAgGridClass} style={{ height: '70%', width: '100%', overflowY: 'auto' }}>
                      <Stack spacing={1} sx={{ p: 3 }}>
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
                            value={manualLabel.factory}
                            onChange={handleChangeManualLabel}
                            errorMessage={errorMessage?.factory}
                          />
                          <Autocomplete
                            id="materialCode"
                            className="materialCode-select"
                            name="materialCode"
                            fullWidth
                            options={materialDropdown.filter((matr) => matr.factory === manualLabel.factory)}
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
                              />
                            )}
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
                            value={manualLabel.materialId}
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
                            value={manualLabel.materialDesc}
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
                            value={manualLabel.unit}
                          />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pb: 1 }}>
                          <TextField
                            id="lotNo"
                            name="lotNo"
                            autoComplete="off"
                            fullWidth
                            label="Lot No."
                            size="small"
                            type='number'
                            required
                            value={manualLabel.lotNo}
                            onChange={handleChangeManualLabel}
                            error={Boolean(errorMessage?.lotNo)}
                            helperText={errorMessage?.lotNo}
                          />
                          <Dropdown
                            id="supplier"
                            name="supplier"
                            label="Supplier"
                            autoComplete="off"
                            fullWidth
                            required
                            size="small"
                            value={manualLabel.supplier}
                            onChange={handleChangeManualLabel}
                            allowEmptyOption={false}
                            options={bizPartnerCodeDropdown.filter((biz) => biz.factory === manualLabel.factory && biz.type === 'D028002')}
                            errorMessage={errorMessage?.supplier}
                          />
                          <TextField
                            id="lableQty"
                            name="lableQty"
                            autoComplete="off"
                            fullWidth
                            required
                            label="Label Qty"
                            size="small"
                            type='number'
                            value={manualLabel.lableQty}
                            onChange={handleChangeManualLabel}
                            error={Boolean(errorMessage?.lableQty)}
                            helperText={errorMessage?.lableQty}
                          />
                          <TextField
                            id="packageQty"
                            name="packageQty"
                            autoComplete="off"
                            fullWidth
                            required
                            label="Package Qty"
                            size="small"
                            type='number'
                            value={manualLabel.packageQty}
                            onChange={handleChangeManualLabel}
                            error={Boolean(errorMessage?.packageQty)}
                            helperText={errorMessage?.packageQty}
                          />
                          <TextField
                            id="generateId"
                            name="generateId"
                            autoComplete="off"
                            fullWidth
                            label="Generate ID"
                            size="small"
                            disabled
                            value={manualLabel.generateId}
                            onChange={handleChangeManualLabel}
                          />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                          <Dropdown
                            id="reason"
                            name="reason"
                            label="Reason"
                            groupId="D040000"
                            size="small"
                            fullWidth
                            required
                            value={manualLabel.reason}
                            onChange={handleChangeManualLabel}
                            errorMessage={errorMessage?.reason}
                          />
                          <TextField
                            id="remark"
                            name="remark"
                            autoComplete="off"
                            fullWidth
                            required={manualLabel.reason === 'D040003'}
                            label="Remark"
                            size="small"
                            value={manualLabel.remark}
                            onChange={handleChangeManualLabel}
                            error={Boolean(errorMessage?.remark)}
                            helperText={errorMessage?.remark}
                          />
                        </Stack>
                      </Stack>
                    </div>
                  }
                  {
                    pageSelectedWidget?.widgetName !== 'Manual Label' &&
                    <div className={themeAgGridClass} style={{ height: '85%', width: '100%', overflowY: 'auto' }}>
                      <AgGrid
                        ref={gridPlanRef}
                        columns={columnsPlan}
                        rowData={rowDataPlan}
                        className={themeAgGridClass}
                        onRowDoubleClicked={onRowDoubleClicked}
                        onGridReady={onGridReadyPlan}
                        onSelectionChanged={onSelectionPlanChanged}
                        rowSelection={pageSelectedWidget?.widgetName === 'Production Label' ? 'multiple' : 'single'}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  }
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
                        onClick={handlePrint}
                        size="small"
                        label={translate(`button.print`)}
                        disabled={!isAllowPrint}
                        pageCode={pageCode}
                        widgetCode={pageSelectedWidget?.widgetCode}
                        funcType="EXECUTE"
                      />
                      {
                        pageSelectedWidget?.widgetName === 'Manual Label' &&
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={() => handleOpenCheckModal('Delete Manual Label Generated')}
                          size="small"
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                          disabled={isEmpty(manualLabelsToDelete)}
                        />
                      }
                    </Stack>
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '88%', width: '100%' }}>
                    <AgGrid
                      columns={columnsDetail}
                      rowData={rowDataDetail}
                      className={themeAgGridClass}
                      onGridReady={onGridReadyDetail}
                      onSelectionChanged={onSelectionDetailChanged}
                      rowSelection="multiple"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
              </>
              <DialogDragable
                title={`${pageSelectedWidget?.widgetName} Print`}
                maxWidth="sm"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <LabelPrint
                  widgetName={pageSelectedWidget?.widgetName}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                  labelToPrint={selectedEPass}
                  isReprint={isRePrint}
                  withWatermark={sortedQty > 0}
                />
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.purchase_label_generate`)}
                maxWidth="lg"
                open={isOpenGenerateModal}
                onClose={handleCloseGenerateModal}
              >
                <PurchaseLabelGenerate
                  onCancel={handleCloseGenerateModal}
                  onLoadData={onLoadData}
                  selectedPlanId={selectedPlanId}
                  isOpenGenerateModal={isOpenGenerateModal}
                  balQty={balQty}
                  generateQty={generateQty}
                  sortedQty={sortedQty}
                  lotNo={lotNo}
                  labelId={labelId}
                />
              </DialogDragable>
              <DialogDragable
                title={`${modalAction}`}
                maxWidth="sm"
                open={isOpenCheckModal}
                onClose={handleCloseCheckModal}
                disableClose={isSubmitting}
              >
                <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${modalAction}?`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseCheckModal}>
                    {translate(`button.cancel`)}
                  </Button>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    onClick={handleProcessRequest}
                    loading={isSubmitting}
                    loadingIndicator="Processing..."
                  >{`${modalAction}`}</LoadingButton>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
