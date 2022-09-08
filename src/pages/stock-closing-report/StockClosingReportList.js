import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';

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

import { useEffect, useState } from 'react';

// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { UploadLineStockReport } from '../../components/upload';
import { query } from '../../core/api';
import { fToDate } from '../../utils/formatTime';
import { AgGridGroup, Dropdown, DthButtonPermission, DthMonthPicker } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSelectedWidget } from '../../redux/slices/page';
import { setSearchParams, resetSearchParams } from '../../redux/slices/stockClosingReportManagement';

// redux
import { useDispatch, useSelector } from '../../redux/store';

// utils
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
import { destructureNumber } from '../../utils/dataDestructure';
import { numberWithCommas } from '../fmb/helper';
import InfoTable from './InfoTable';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.stockManagement.stockControl.stockInfo.stockClosingReport';
const tableCode = 'stockClosingReportList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

const pxToRem = (value) => `${value / 16}rem`;

export default function StockClosingReportList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.stockClosingReportManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { userGridConfig, funcPermission, commonDropdown, user } = useAuth();
  const { themeAgGridClass } = useSettings();

  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [modalAction, setModalAction] = useState('');

  const [hideFilters, setHideFilters] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);

  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });

  const [table, setTable] = useState(null);
  const [sumData, setSumData] = useState(null);

  const [curData, setCurData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const pageSelectedWidget = selectedWidget[pageCode];

  const lineStockArray = [
    'grToWH',
    'exceptGR',
    'giToLine',
    'exceptGI',
    'adjustIncrease',
    'adjustDecrease',
    'closingQty'
  ];

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
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);

    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      if (column.children) {
        column.children.forEach((child) => {
          child.headerName = translate(`data_grid.${tableCode}.${child.field}`);
        });
      }
    });

    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
        if (column.children) {
          column.children.forEach((child) => {
            child.headerName = translate(`data_grid.${tableCode}.${child.field}`);
          });
        }
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(() => {
    if (gridApi && gridColumnApi) {
      onLoadData();
    }
  }, [gridApi, gridColumnApi]);

  useEffect(() => {
    if (curData && gridApi) {
      updateData(destructureNumber(curData));
      gridApi.setPinnedBottomRowData(calculateFooterData(curData));
    }
  }, [curData, gridApi]);

  useEffect(() => {
    if (gridColumnApi) {
      gridColumnApi.setColumnsVisible(['labelNo'], searchParams.labelDisplay);
      gridColumnApi.setColumnsVisible(['lotNo'], searchParams.lotNoDisplay);
      gridColumnApi.setColumnsVisible(['supplier.nationalName'], searchParams.supplierDisplay);
    }
  }, [gridColumnApi, searchParams]);

  useEffect(() => {
    dispatch(getBizPartnerCodeDropdown());
  }, [dispatch]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const onInquiry = () => {
    onLoadData();
  };

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onClickUpload = () => {
    handleOpenModal('Upload');
  };

  const onCellClicked = async (gridApi) => {
    if (lineStockArray.includes(gridApi.colDef.field)) {
      setSumData(gridApi.value);
      const _detailParams = {
        materialCode: gridApi.data?.material?.code,
        storage: gridApi.data?.bin?.zone?.stock?.factoryPk,
        month: fToDate(searchParams.month),
        detailPage: gridApi.colDef.field,
        label: searchParams.labelDisplay ? gridApi.data.labelNo : '',
        supplier: searchParams.supplierDisplay ? gridApi.data?.supplier?.factoryPk : '',
        lotNo: searchParams.lotNoDisplay ? gridApi.data.lotNo : '',
        exactSearch: true
      };
      const response = await query({
        url: '/v1/stock-closing-report/detail',
        featureCode: 'user.create',
        params: _detailParams
      }).catch((error) => {
        console.error(error);
      });
      if (response.httpStatusCode === 200 && gridApi.value !== 0) {
        if (!isEmpty(response.data.closings)) {
          setCurrentData(response.data.closings);
        } else if (!isEmpty(response.data.stockMovementAdjustmentHistories)) {
          setCurrentData(response.data.stockMovementAdjustmentHistories);
        } else {
          setCurrentData([]);
        }
        setTable(`${gridApi.colDef.field}-closing`);
        handleOpenModal('');
      }
    }
  };

  const sum = (col, data) => {
    const curSum = data?.map((curData) => curData[col]).reduce((previous, current) => previous + current, 0);
    return numberWithCommas(curSum);
  };

  const calculateFooterData = (data) => {
    const result = [];

    result.push({
      pk: {
        factoryName: 'SUM'
      },

      monthStartQty: sum('monthStartQty', data),
      grToWH: sum('grToWH', data),
      exceptGR: sum('exceptGR', data),
      giToLine: sum('giToLine', data),
      exceptGI: sum('exceptGI', data),
      adjustIncrease: sum('adjustIncrease', data),
      adjustDecrease: sum('adjustDecrease', data),
      closingQty: sum('closingQty', data),
      currentQty: sum('currentQty', data),
      gap: sum('gap', data),
      ...data
    });

    return result;
  };

  const onLoadDataTable = async () => {
    const _detailParams = {
      materialType: searchParams.materialType,
      materialCode: searchParams.materialCode,
      materialID: searchParams.materialId,
      materialDesc: searchParams.materialDesc,
      month: fToDate(searchParams.month),
      supplier: searchParams.supplier,
      storage: searchParams.stock,
      zone: searchParams.zone,
      bin: searchParams.bin,
      label: searchParams.label,
      lotNo: searchParams.lotNo,
      stockStatus: searchParams.stockStatus,
      lotNoDisplay: searchParams.lotNoDisplay,
      supplierDisplay: searchParams.supplierDisplay,
      labelDisplay: searchParams.labelDisplay
    };

    parseOrgSearchAll(_detailParams, parseSelectedTree);
    const response = await query({
      url: '/v1/stock-closing-report/search',
      featureCode: 'user.create',
      params: _detailParams
    }).catch((error) => {
      console.error(error);
    });

    return response?.data?.map((row) => ({
      factoryName: row.line?.pk.factoryName,
      ...row
    }));
  };

  const onLoadData = async () => {
    const response = await onLoadDataTable();
    setCurData(response);
  };
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
    onLoadData();
  };

  const handleOpenModal = (action) => {
    setOpenActionModal(true);
    setModalAction(action);
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
          <Dropdown
            id="supplier"
            name="supplier"
            label="Supplier"
            value={searchParams.supplier}
            onChange={handleChangeSearchConfig}
            options={bizPartnerCodeDropdown}
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
          <DthMonthPicker
            name="Month"
            value={searchParams.month}
            maxDate={new Date()}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                month: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            selectsStart
          />

          <Stack spacing={0}>
            <Grid container>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="lotNoDisplay"
                      style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                      checked={searchParams.lotNoDisplay}
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
                      name="supplierDisplay"
                      style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                      checked={searchParams.supplierDisplay}
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
                      name="labelDisplay"
                      style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                      checked={searchParams.labelDisplay}
                      onChange={handleChangeSearchCheckConfig}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="Label"
                />
              </FormGroup>
            </Grid>
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
                          size="small"
                          onClick={onClickUpload}
                          label="Upload Stock"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
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
                <AgGridGroup
                  columns={columns}
                  rowData={rowData}
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onCellClicked={onCellClicked}
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={
                  modalAction === 'Upload'
                    ? translate(`title.upload_inventory_checking_result`)
                    : translate(`title.${table}`)
                }
                maxWidth={modalAction === 'Upload' ? 'sm' : 'xl'}
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                {modalAction === 'Upload' ? (
                  <UploadLineStockReport
                    onCancel={handleCloseModal}
                    templateCode="STOCK_CLOSING_REPORT_TEMPLATE_1"
                    configurationCode="STOCK_CLOSING_REPORT_CLOSING_QTY_TEMPLATE_1"
                    uploadType="closing"
                    month={fToDate(searchParams.month)}
                    onLoadData={onLoadData}
                  />
                ) : (
                  <InfoTable
                    onCancel={handleCloseModal}
                    tableCode={table}
                    pageCode={pageCode}
                    currentData={currentData}
                    sumData={sumData}
                  />
                )}
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
