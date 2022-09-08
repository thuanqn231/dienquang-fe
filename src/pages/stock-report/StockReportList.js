import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { makeStyles } from '@material-ui/styles';
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
  DialogActions,
  TextField,
  Tooltip,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import moment from 'moment';
import ReactDOMServer from 'react-dom/server';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { UploadExcelFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSelectedWidget } from '../../redux/slices/page';
import { setSearchParams, resetSearchParams } from '../../redux/slices/stockReportManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { fDate, fDateTime } from '../../utils/formatTime';
import { capitalizeFirstChar } from '../../utils/formatString';
// utils
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import DetailStock from '../gr-result/DetailStock';
import LabelPrint from '../label-generation/LabelPrint';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.stockManagement.stockControl.stockInfo.stockReport';
const tableCode = 'stockInfo';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

const pxToRem = (value) => `${value / 16}rem`;

export default function StockReportList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.stockReportManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, funcPermission, commonDropdown, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [modalAction, setModalAction] = useState('Re-Print');
  const [isAllowReprint, setIsAllowReprint] = useState(false);
  const [selectedEPass, setSelectedEPass] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState([]);
  const [hideFilters, setHideFilters] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [action, setAction] = useState('stock');
  const [totalStock, setTotalStock] = useState(0);
  const [isRePrint, setIsRePrint] = useState(false);
  const [detailParams, setDetailParams] = useState({});
  const pageSelectedWidget = selectedWidget[pageCode];

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
    const _search = {
      ...searchParams,
      isStockStatus: true
    };
    dispatch(setSearchParams(_search));
  }, [dispatch]);

  useEffect(() => {
    if (gridColumnApi) {
      onLoadData();
    }
  }, [gridColumnApi]);

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

  const onLoadData = () => {
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
    const _detailParams = {
      materialType: searchParams.materialType,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialId,
      materialDesc: searchParams.materialDesc,
      label: searchParams.label,
      lotNo: searchParams.lotNo,
      supplier: searchParams.supplier,
      stockStatusDisplay: searchParams.isStockStatus,
      lotNoDisplay: searchParams.isLotNo,
      supplierDisplay: searchParams.isSupplier,
      labelDisplay: searchParams.isBoxNo,
      pageName: 'stock'
    };
    if (searchParams.stock) {
      _detailParams.stock = searchParams.stock
    }
    if (searchParams.zone) {
      _detailParams.zone = searchParams.zone
    }
    if (searchParams.bin) {
      _detailParams.bin = searchParams.bin
    }
    if (searchParams.stockStatus) {
      _detailParams.stockStatus = searchParams.stockStatus
    }
    parseOrgSearchFactory(_detailParams, parseSelectedTree);
    setDetailParams(_detailParams);
    query({
      url: '/v1/stock-movement/search-adjustment',
      featureCode: 'user.create',
      params: _detailParams
    })
      .then((res) => {
        setSelectedStockId(null);
        const data = res.data.map((stock) => (
          {
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
              line: stock?.label?.labelDetail?.supplier?.nationalName ? stock?.label?.labelDetail?.supplier?.nationalName.slice(0, 20) : '',
              qty: stock?.label?.qty,
              grNo: stock?.grNo
            }
          }
        ))
        updateData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  const handleChangeSearchCheckConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: event.target.checked
    };
    dispatch(setSearchParams(_search));
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = (action) => {
    setOpenActionModal(true);
    setModalAction(action);
  };

  const onSelectionChanged = (event) => {
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

  const onClickReprint = () => {
    if (!selectedStockId) {
      selectWarning();
    } else {
      handleOpenModal('Re-Print');
    }
  };

  const onCellClicked = (gridApi) => {
    if (gridApi.column.colId === 'stockQty' && gridApi.value > 0) {
      const _detailParams = {
        materialType: searchParams.materialType,
        materialCode: gridApi.data.materialCode,
        materialName: searchParams.materialId,
        materialDesc: searchParams.materialDesc,
        label: searchParams.label,
        lotNo: searchParams.lotNo,
        stockStatusDisplay: searchParams.isStockStatus,
        lotNoDisplay: searchParams.isLotNo,
        supplierDisplay: searchParams.isSupplier,
        labelDisplay: searchParams.isBoxNo,
        factoryCode: gridApi.data.pk.factoryCode
      };
      if (searchParams.stock) {
        _detailParams.stock = searchParams.stock;
      }
      if (searchParams.zone) {
        _detailParams.zone = searchParams.zone;
      }
      if (searchParams.bin) {
        _detailParams.bin = searchParams.bin;
      }
      if (searchParams.stockStatus) {
        _detailParams.stockStatus = searchParams.stockStatus;
      }
      if (searchParams.isLotNo) {
        _detailParams.lotNo = gridApi.data.lotNo;
      }
      if (searchParams.isSupplier) {
        if (gridApi.data.supplier) {
          _detailParams.supplier = gridApi.data.supplier;
        } else {
          _detailParams.supplier = 'system_supplier_null';
        }
      }
      if (searchParams.isBoxNo) {
        _detailParams.label = gridApi.data.boxNo;
      }
      setDetailParams(_detailParams);
      handleOpenModal('Detail Stock Info');
      setTotalStock(gridApi.value);
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
            id="materialDesc"
            name="materialDesc"
            label="Material Desc."
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
              <Card sx={{ pr: 1, borderRadius: '0px', height: '60px' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                  <Tooltip title={`${actionTooltip} Filters`}>
                    <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                  </Tooltip>

                  <HeaderBreadcrumbs
                    activeLast
                    pageCode={pageCode}
                    action={
                      <>
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickReprint}
                          size="small"
                          label="Re-Print"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                          disabled={!isAllowReprint}
                        />
                      </>
                    }
                  />
                </Stack>
              </Card>
              <Card
                sx={{
                  p: 1,
                  borderRadius: '0px',
                  display: 'row',
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: `calc((80vh - 100px))` }
                }}
              >
                <AgGrid
                  columns={columns}
                  rowData={rowData}
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  onCellClicked={onCellClicked}
                  rowSelection="multiple"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${modalAction}`}
                maxWidth={['Re-Print'].includes(modalAction) ? 'sm' : 'xl'}
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                {modalAction === 'Re-Print' && (
                  <LabelPrint
                    widgetName="Purchase Label"
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    labelToPrint={selectedEPass}
                    isReprint={isRePrint}
                  />
                )}
                {modalAction !== 'Re-Print' && (
                  <DetailStock action='stock' detailParams={detailParams} totalStock={totalStock} />
                )}
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
