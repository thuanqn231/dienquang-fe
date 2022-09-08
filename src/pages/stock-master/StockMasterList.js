import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { makeStyles } from '@material-ui/styles';
import { Icon } from '@iconify/react';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
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
  Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack5';
import { useState, useEffect } from 'react';
import { isEmpty, isUndefined } from 'lodash-es';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import {
  closeStockActionModal,
  openStockActionModal,
  setSearchParams,
  resetSearchParams
} from '../../redux/slices/stockMaster';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { setSelectedWidget } from '../../redux/slices/page';
// utils
import { getPageName, getGridConfig, parseOrgSearchFactory } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import StockRegistrationForm from './StockRegistrationForm';
import ZoneRegistrationForm from './ZoneRegistrationForm';
import BinRegistrationForm from './BinRegistrationForm';

// ----------------------------------------------------------------------

const pageCode = 'menu.masterData.production.storageMasterData.storageMasterData.storageManagement';
const tableStock = 'stockList';
const tableZone = 'zoneList';
const tableBin = 'binList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function StockMasterList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { commonDropdown, funcPermission, userGridConfig, updateAgGridConfig, updateCommonDropdown, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams, isOpenStockActionModal } = useSelector((state) => state.stockMaster);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentData, setCurrentData] = useState({});
  const [isOpenActionModal, setIsOpenActionModal] = useState(false);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [dialogParams, setDialogParams] = useState({
    dialogHeader: '',
    dialogMessage: '',
    dialogAction: () => {}
  });
  const [hideFilters, setHideFilters] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [isSubmitting, setSubmitting] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];

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
    const tableCode = getTableCode();
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode = getTableCode();
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
  }, [selectedWidget, gridApi]);

  const getTableCode = () => {
    let tableCode = tableStock;
    switch (pageSelectedWidget?.widgetName) {
      case 'Zone':
        tableCode = tableZone;
        break;
      case 'Bin':
        tableCode = tableBin;
        break;
      case 'Stock':
      default:
        tableCode = tableStock;
    }
    return tableCode;
  };

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleOpenActionModal = () => {
    setIsOpenActionModal(true);
  };

  const handleCloseActionModal = () => {
    setIsOpenActionModal(false);
  };

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onInquiry = () => {
    onLoadData();
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

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onLoadData = () => {
    setSelectedRowId(null);
    let uri = '';
    const requestParams = {};
    switch (pageSelectedWidget?.widgetName) {
      case 'Storage':
        uri = 'stock';
        buildStockRequestParams(requestParams);
        break;
      case 'Zone':
        uri = 'zone';
        buildZoneRequestParams(requestParams);
        break;
      case 'Bin':
        uri = 'bin';
        buildBinRequestParams(requestParams);
        break;
      default:
        break;
    }
    try {
      setGridDataSource(gridApi, `/v1/stock-management/${uri}/search-v2`, requestParams);
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const buildStockRequestParams = (requestParams) => {
    requestParams.code = searchParams.stockCode;
    requestParams.name = searchParams.stockName;
    requestParams.state = searchParams.state;
    requestParams.stockType = searchParams.stockType;
    parseOrgSearchFactory(requestParams, parseSelectedTree);
  };

  const buildZoneRequestParams = (requestParams) => {
    requestParams.code = searchParams.zoneCode;
    requestParams.name = searchParams.zoneName;
    requestParams.state = searchParams.state;
    requestParams.parentId = searchParams.stockId;
    parseOrgSearchFactory(requestParams, parseSelectedTree);
  };

  const buildBinRequestParams = (requestParams) => {
    requestParams.code = searchParams.binCode;
    requestParams.parentId = searchParams.zoneId;
    requestParams.state = searchParams.state;
    requestParams.stockId = searchParams.stockId;
    parseOrgSearchFactory(requestParams, parseSelectedTree);
  };

  const handleCloseModal = () => {
    dispatch(closeStockActionModal());
  };

  const handleOpenModal = () => {
    dispatch(openStockActionModal());
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedRowId(selectedId);
      switch (pageSelectedWidget?.widgetName) {
        case 'Storage':
          handleSelectionStock(selectedId);
          break;
        case 'Zone':
          handleSelectionZone(selectedId);
          break;
        case 'Bin':
          handleSelectionBin(selectedId);
          break;
        default:
          break;
      }
    }
  };

  const handleSelectionStock = (stockId) => {
    if (stockId) {
      query({
        url: `/v1/stock-management/stock/${stockId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setCurrentData({
            factoryPk: data.factoryPk,
            factory: data?.pk?.factoryCode,
            state: data?.state,
            stockType: data?.stockType?.code,
            stockCode: data?.code,
            stockName: data?.name,
            personInCharge: data?.personInCharge,
            agingDay: data?.agingDay,
            overAgingDay: data?.overAgingDay,
            remark: data?.remark,
            warehouseType: data?.warehouseType?.code
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleSelectionZone = (zoneId) => {
    if (zoneId) {
      query({
        url: `/v1/stock-management/zone/${zoneId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setCurrentData({
            factoryPk: data.factoryPk,
            factory: data?.pk?.factoryCode,
            state: data?.state,
            zoneCode: data?.code,
            zoneName: data?.name,
            capaLimit: data?.caPaLimit,
            stock: data?.stock?.factoryPk
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleSelectionBin = (binId) => {
    if (binId) {
      query({
        url: `/v1/stock-management/bin/${binId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setCurrentData({
            factoryPk: data.factoryPk,
            factory: data?.pk?.factoryCode,
            state: data?.state,
            binRow: data?.code.slice(0, 2),
            binColumn: data?.code.slice(-2),
            capaLimit: data?.caPaLimit,
            zone: data?.zone?.factoryPk,
            stock: data?.zone?.stock?.factoryPk
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedRowId) {
      enqueueSnackbar(`Please select 1 ${pageSelectedWidget?.widgetName}`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      setIsEdit(true);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedRowId) {
      enqueueSnackbar(`Please select 1 ${pageSelectedWidget?.widgetName}`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      setDialogParams({
        dialogHeader: 'Delete',
        dialogMessage: 'Do you want to Delete?',
        dialogAction: () => handleDelete()
      });
      handleOpenActionModal();
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/stock-management/${
        pageSelectedWidget?.widgetName === 'Storage' ? 'stock' : pageSelectedWidget?.widgetName.toLowerCase()
      }/${selectedRowId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          handleCloseActionModal();
          onLoadData();
          updateCommonDropdown();
          enqueueSnackbar(`Delete ${pageSelectedWidget?.widgetName} Successful`, {
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
        setSubmitting(false);
        console.error(error);
      });
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
          {pageSelectedWidget?.widgetName === 'Storage' && (
            <>
              <TextField
                id="stockCode"
                name="stockCode"
                label="Storage Code"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.stockCode}
                onChange={handleChangeSearchConfig}
                size="small"
              />
              <TextField
                id="stockName"
                name="stockName"
                label="Storage Name"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.stockName}
                onChange={handleChangeSearchConfig}
                size="small"
              />
              <Dropdown
                id="stockType"
                name="stockType"
                label="Storage Type"
                sx={{ my: 1 }}
                onChange={handleChangeSearchConfig}
                groupId="D003000"
                value={searchParams.stockType}
                size="small"
              />
            </>
          )}
          {pageSelectedWidget?.widgetName !== 'Storage' && (
            <Dropdown
              id="stockId"
              name="stockId"
              label="Storage"
              sx={{ my: 1 }}
              onChange={handleChangeSearchConfig}
              options={commonDropdown.stockDropdown}
              value={searchParams.stockId}
              size="small"
            />
          )}
          {pageSelectedWidget?.widgetName === 'Zone' && (
            <>
              <TextField
                id="zoneCode"
                name="zoneCode"
                label="Zone Code"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.zoneCode}
                onChange={handleChangeSearchConfig}
                size="small"
              />
              <TextField
                id="zoneName"
                name="zoneName"
                label="Zone Name"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.zoneName}
                onChange={handleChangeSearchConfig}
                size="small"
              />
            </>
          )}
          {pageSelectedWidget?.widgetName === 'Bin' && (
            <>
              <Dropdown
                id="zoneId"
                name="zoneId"
                label="Zone"
                sx={{ my: 1 }}
                onChange={handleChangeSearchConfig}
                options={commonDropdown.zoneDropdown}
                value={searchParams.zoneId}
                size="small"
              />
              <TextField
                id="binCode"
                name="binCode"
                label="Bin Code"
                sx={{ my: 1 }}
                fullWidth
                value={searchParams.binCode}
                onChange={handleChangeSearchConfig}
                size="small"
                type="number"
              />
            </>
          )}
          <Dropdown
            id="state"
            name="state"
            label="Use (Y/N)"
            value={searchParams.state}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
            sx={{ my: 1 }}
            size="small"
          />
        </>
      )
    }
  ];

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const updateGridConfig = async (_columns) => {
    const tableCode = getTableCode();
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
                          onClick={onClickAdd}
                          size="small"
                          label={translate(`button.register`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickModify}
                          size="small"
                          disabled={!selectedRowId}
                          label={translate(`button.modify`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickDelete}
                          size="small"
                          disabled={!selectedRowId}
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                        />
                        {isChangedTableConfig && (
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="outlined"
                            onClick={onSaveTableConfig}
                            size="small"
                            label={translate(`button.saveConfig`)}
                            pageCode={pageCode}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            funcType="READ"
                          />
                        )}
                      </>
                    }
                  />
                </Stack>
              </Card>
              <Card
                sx={{
                  p: 1,
                  borderRadius: '0px',
                  display: 'flex',
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: `calc(80vh - 100px)` }
                }}
              >
                <AgGrid
                  columns={columns}
                  pagination
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${pageSelectedWidget?.widgetName} ${
                  isEdit ? translate(`typo.modify`) : translate(`typo.registration`)
                }`}
                maxWidth="lg"
                open={isOpenStockActionModal}
                onClose={handleCloseModal}
              >
                {pageSelectedWidget?.widgetName === 'Storage' && (
                  <StockRegistrationForm
                    isEdit={isEdit}
                    currentData={currentData}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                  />
                )}
                {pageSelectedWidget?.widgetName === 'Zone' && (
                  <ZoneRegistrationForm
                    isEdit={isEdit}
                    currentData={currentData}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                  />
                )}
                {pageSelectedWidget?.widgetName === 'Bin' && (
                  <BinRegistrationForm
                    isEdit={isEdit}
                    currentData={currentData}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                  />
                )}
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.delete`)}
                maxWidth="sm"
                open={isOpenActionModal}
                onClose={handleCloseActionModal}
              >
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_delete`)}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseActionModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    onClick={dialogParams.dialogAction}
                    loading={isSubmitting}
                  >
                    {dialogParams.dialogHeader}
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
