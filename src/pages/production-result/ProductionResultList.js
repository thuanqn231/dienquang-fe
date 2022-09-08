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
  Container, Grid, IconButton, List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField, Tooltip, Typography, Checkbox
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { makeStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useLayoutEffect, useRef, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import { DialogDragable } from '../../components/animate';
import useSettings from '../../hooks/useSettings';
import { resetSearchParams, setSearchParams } from '../../redux/slices/productionResultManagement';
import { setSelectedWidget } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { getLastWeekDate, fDate, fDateTime } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.productionReport.productionResult.productionResult';
const tableCodeMaster = 'productionResultMaster';
const tableCodeDetail = 'productionResultDetail';
const tableCodeDetailCancel = 'productionResultDetailCancel';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});



export default function ProductionResultList() {

  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.productionResultManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, commonDropdown, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowDataMaster, setRowDataMaster] = useState([]);
  const [columnsMaster, setColumnsMaster] = useState(null);
  const [rowDataDetail, setRowDataDetail] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const pageSelectedWidget = selectedWidget[pageCode];
  const [openDetail, setOpenDetail] = useState(false)
  const [factories, setFactories] = useState([]);
  const [currentMaster, setCurrentMaster] = useState(null);
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  useLayoutEffect(() => {
    console.log('checked', checked);
    if (!isEmpty(currentMaster)) {
      if (checked) {
        const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCodeDetailCancel);
        tableConfigs.forEach((column) => {
          column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
        });
        query({
          url: '/v1/production-result/detail',
          featureCode: 'user.create',
          method: 'GET',
          params: {
            ...currentMaster,
            isActive: true
          }
        })
          .then(res => {
            setRowDataDetail(res.data || [])
          })
          .catch(err => {
            console.error(err);
            setRowDataDetail([]);
          });
        setColumnsDetail(tableConfigs);
      }
      else {
        const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCodeDetail);
        tableConfigs.forEach((column) => {
          column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
        });
        query({
          url: '/v1/production-result/detail',
          featureCode: 'user.create',
          method: 'GET',
          params: {
            ...currentMaster,
            isActive: false
          }
        })
          .then(res => {
            setRowDataDetail(res.data)
          })
          .catch(err => {
            console.error(err);
            setRowDataDetail([]);
          });
        setColumnsDetail(tableConfigs);
      }
    }
  }, [checked]);

  useLayoutEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);
  useLayoutEffect(() => {
    const _Search = {
      ...searchParams,
      factoryPks: parseSelectedTree.factoryIds,
      plantPks: parseSelectedTree.plantIds,
      teamPks: parseSelectedTree.teamIds,
      groupPks: parseSelectedTree.groupIds,
      partPks: parseSelectedTree.partIds,
      linePks: parseSelectedTree.lineIds,
      processPks: parseSelectedTree.processIds,

    }
    dispatch(setSearchParams(_Search));
  }, [parseSelectedTree])

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCodeMaster);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCodeMaster}.${column.field}`);
    });
    setColumnsMaster(tableConfigs);
  }, [userGridConfig]);

  useLayoutEffect(() => {
    if (columnsMaster) {
      const tableConfigs = [...columnsMaster];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeMaster}.${column.field}`);
      });
      setColumnsMaster(tableConfigs);
    }
  }, [currentLang]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    setColumnsMaster(_columns);
    setIsChangedTableConfig(false);
  };
  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    // params.api.sizeColumnsToFit();

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
    onLoadData();
  };
  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const handleChangeDateSearchConfig = (_name, value) => {
    value = fDate(value);
    const _search = {
      ...searchParams,
      [_name]: `${value}`
    };
    dispatch(setSearchParams(_search));
  }
  // * change on load 
  const onLoadData = async () => {

    const { workStation, ...params } = searchParams;
    if (workStation !== '') params.workStation = workStation;
    query({
      url: '/v1/production-result/search',
      featureCode: 'user.create',
      method: 'GET',
      params: {
        ...params
      }
    })
      .then(res => {
        console.log(res.data);
        const _rowDataMaster = res.data.map((item) => ({
          ...item,
          planEndTime: fDateTime(item.planEndTime),
          planStartTime: fDateTime(item.planStartTime),
          actualEndTime: fDateTime(item.actualEndTime),
          actualStartTime: fDateTime(item.actualStartTime),
        }));
        setRowDataMaster(_rowDataMaster)
      })
      .catch(err => {
        console.error(err);
        setRowDataMaster([]);
      });
  }
  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };
  
  const resetSearchParam = () => {
    dispatch(resetSearchParams());
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
  const updateGridConfig = async (_columns) => {
    mutate({
      url: '/v1/user/ag-grid-configuration/update',
      data: [
        {
          agGridId: tableCodeMaster,
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
  const onInquiry = () => {

    onLoadData();
  };
  const onCellClicked = (gridApi) => {
    const { planDate, factoryCode, workstation, lineCode, process, prodOrderNo } = gridApi.data
    setOpenDetail(true);
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCodeDetail);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
    });
    query({
      url: '/v1/production-result/detail',
      featureCode: 'user.create',
      method: 'GET',
      params: {
        planDate, factoryCode, workstation, lineCode, process, prodOrderNo, isActive: false
      }
    })
      .then(res => {
        setRowDataDetail(res.data || [])
        setCurrentMaster({
          planDate, factoryCode, workstation, lineCode, process, prodOrderNo
        })
      })
      .catch((error) => {
        console.error(error);
        setCurrentMaster({})
      })
    setColumnsDetail(tableConfigs);
  }

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setChecked(false);
  }

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
          <DthDatePicker
            name="from"
            label="Date From"
            value={searchParams.from}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('from', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="to"
            label="Date To"
            value={searchParams.to}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('to', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <Dropdown
            name="appStatus"
            label='Approval Status'
            value={searchParams.appStatus}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            fullWidth
            size="small"
            groupId='D018000'
          />
          <Dropdown
            name="prodStatus"
            label='Production Status'
            value={searchParams.prodStatus}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            fullWidth
            size="small"
            groupId='D019000'
          />
          <TextField
            fullWidth
            id="planID"
            name="planID"
            label="Plan ID"
            value={searchParams.planID}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="PONo"
            name="PONo"
            label="PO No"
            value={searchParams.PONo}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="modelCode"
            name="modelCode"
            label="Model Code"
            value={searchParams.modelCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            name="POType"
            label='PO Type'
            value={searchParams.POType}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            fullWidth
            size="small"
            groupId='D020000'
          />
          <TextField
            fullWidth
            id="modelName"
            name="modelName"
            label="Model Name"
            value={searchParams.modelName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="topModel"
            name="topModel"
            label="Top Model"
            value={searchParams.topModel}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="processType"
            name="processType"
            label="Process Type"
            value={searchParams.processType}
            onChange={handleChangeSearchConfig}
            groupId='D014000'
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="workStation"
            name="workStation"
            label="Work Station"
            value={searchParams.workStation}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.workStationDropdown.filter(
              (ws) =>
                factories.includes(ws.factory)
            )}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="final"
            name="finalYn"
            label="Final (Y/N)"
            value={searchParams.finalYn}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'Y', label: 'Yes' },
              { value: 'N', label: 'No' },
            ]}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="reflect"
            name="reflect"
            label="Reflect (Y/N)"
            value={searchParams.reflect}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'Y', label: 'Yes' },
              { value: 'N', label: 'No' },
            ]}
            sx={{ my: 1 }}
            size="small"
          />
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

                        {isChangedTableConfig && (
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="outlined"
                            onClick={onSaveTableConfig}
                            size="small"
                            label="Save Config"
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
                  columns={columnsMaster}
                  rowData={rowDataMaster}
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onCellClicked={onCellClicked}
                  // onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title="Production Detail Data"
                maxWidth="lg"
                open={openDetail}
                onClose={handleCloseDetail}
              >
                <Card
                  sx={{
                    p: 1,
                    borderRadius: '0px',
                    // display: 'flex',
                    height: '80vh',
                    minHeight: { xs: '50vh' }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="right" sx={{ my: 0 }}>
                    <Checkbox checked={checked} onChange={handleChange} />
                    <Typography variant="subtitle1">Include cancel</Typography>
                  </Stack>
                  <AgGrid
                    columns={columnsDetail}
                    rowData={rowDataDetail}
                    className={themeAgGridClass}
                    onGridReady={onGridReady}
                    rowSelection="single"
                    width="100%"
                    height="96%"
                  />
                </Card>

              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}