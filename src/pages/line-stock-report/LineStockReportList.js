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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Radio
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import ReactDOMServer from 'react-dom/server';
import { MIconButton } from '../../components/@material-extend';

// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { UploadLineStockReport } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { fToDate } from '../../utils/formatTime';
import { AgGridGroup, Dropdown, DthButtonPermission, DthMonthPicker } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSelectedWidget } from '../../redux/slices/page';
import { setSearchParams, resetSearchParams } from '../../redux/slices/lineStockReportManagement';
import { destructureNumber } from '../../utils/dataDestructure';
import { numberWithCommas } from '../fmb/helper';
// redux
import { useDispatch, useSelector } from '../../redux/store';

// utils
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';

import InfoTable from './InfoTable';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.stockManagement.stockControl.stockInfo.lineStockReport';
const tableCode = 'lineStockReportList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

const pxToRem = (value) => `${value / 16}rem`;

export default function LineStockReportList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.lineStockReportManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();

  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [startDate, setStartDate] = useState(new Date('2014/02/08'));

  const [hideFilters, setHideFilters] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);

  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });

  const [table, setTable] = useState(null);
  const [sumData, setSumData] = useState(null);

  const [curData, setCurData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [curSearchType, setCurSearchType] = useState('line');

  const lineStockArray = [
    'grToLine',
    'exceptGR',
    'productionIncrease',
    'giToWH',
    'exceptGI',
    'backFlush',
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
      gridColumnApi.setColumnsVisible(['line.name'], curSearchType === 'line');
    }
  }, [gridColumnApi, curSearchType]);

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
    let response = null;
    if (lineStockArray.includes(gridApi.colDef.field)) {
      setSumData(gridApi.value);
      const _detailParams = {
        materialCode: gridApi.data?.material?.code,
        month: fToDate(searchParams.month),
        detailPage: gridApi.colDef.field
      };
      if (gridApi.rowPinned === 'bottom') {
        if (curSearchType === 'line') {
          response = await query({
            url: '/v1/line-stock-report/detail',
            featureCode: 'user.create',
            params: {
              lineCode: gridApi.data?.line?.code,
              factoryPks: parseSelectedTree.factoryIds,
              ..._detailParams
            }
          }).catch((error) => {
            console.error(error);
          });
        }
        if (curSearchType === 'material') {
          response = await query({
            url: '/v1/line-stock-report/detail',
            featureCode: 'user.create',
            params: {
              factoryPks: parseSelectedTree.factoryIds,
              ..._detailParams
            }
          }).catch((error) => {
            console.error(error);
          });
        }
      } else {
        if (curSearchType === 'line') {
          response = await query({
            url: '/v1/line-stock-report/detail',
            featureCode: 'user.create',
            params: {
              lineCode: gridApi.data?.line?.code,
              factoryCode: gridApi.data?.pk.factoryCode,
              ..._detailParams
            }
          }).catch((error) => {
            console.error(error);
          });
        }
        if (curSearchType === 'material') {
          response = await query({
            url: '/v1/line-stock-report/detail',
            featureCode: 'user.create',
            params: {
              factoryCode: gridApi.data?.pk.factoryCode,
              ..._detailParams
            }
          }).catch((error) => {
            console.error(error);
          });
        }
      }

      if (response.httpStatusCode === 200 && gridApi.value !== 0) {
        if (!isEmpty(response.data.lineStockAdjustments)) {
          setCurrentData(response.data.lineStockAdjustments);
        } else if (!isEmpty(response.data.stockMovementAdjustmentHistories)) {
          setCurrentData(response.data.stockMovementAdjustmentHistories);
        } else if (!isEmpty(response.data.printBoxLabels)) {
          setCurrentData(response.data.printBoxLabels);
        } else if (!isEmpty(response.data.poBoms)) {
          setCurrentData(response.data.poBoms);
        } else if (!isEmpty(response.data.closings)) {
          setCurrentData(response.data.closings);
        } else {
          setCurrentData([]);
        }
        setTable(gridApi.colDef.field);
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
      factoryName: 'SUM',

      monthStartQty: sum('monthStartQty', data),
      grToLine: sum('grToLine', data),
      exceptGR: sum('exceptGR', data),
      productionIncrease: sum('productionIncrease', data),
      giToWH: sum('giToWH', data),
      backFlush: sum('backFlush', data),
      exceptGI: sum('exceptGI', data),
      adjustIncrease: sum('adjustIncrease', data),
      adjustDecrease: sum('adjustDecrease', data),
      closingQty: sum('closingQty', data),
      currentQty: sum('currentQty', data),
      gap: sum('gap', data),
      ...data
    });

    return result;
    // return result;
  };

  const onLoadDataTable = async () => {
    const _detailParams = {
      materialType: searchParams.materialType,
      materialCode: searchParams.materialCode,
      materialID: searchParams.materialId,
      materialDesc: searchParams.materialDesc,
      month: fToDate(searchParams.month),
      searchType: searchParams.searchType
    };

    parseOrgSearchAll(_detailParams, parseSelectedTree);
    const response = await query({
      url: '/v1/line-stock-report/search',
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
      searchType: event?.target?.value
    };

    setCurSearchType(event?.target.value);

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
            id="materialDesc"
            name="materialDesc"
            label="Material Desc."
            value={searchParams.materialDesc}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <DthMonthPicker
            name="month"
            value={searchParams.month}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                month: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            selectsStart
            maxDate={new Date()}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between' }} spacing={0}>
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                defaultValue="line"
              >
                <FormControlLabel
                  control={
                    <Radio
                      value="material"
                      onChange={handleChangeSearchCheckConfig}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="By Material"
                />
                <FormControlLabel
                  control={
                    <Radio
                      value="line"
                      onChange={handleChangeSearchCheckConfig}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="By Line"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        </>
      )
    }
  ];
  console.log(curData);
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
                    templateCode="LINE_STOCK_REPORT_TEMPLATE_1"
                    configurationCode="LINE_STOCK_REPORT_CLOSING_TEMPLATE_1"
                    uploadType="line"
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
