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
  TextField, Tooltip, Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { makeStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useLayoutEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/no-unresolved
import Timer from 'src/components/Timer';
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
import useSettings from '../../hooks/useSettings';
import { resetSearchParams, setSearchParams } from '../../redux/slices/operationTimeManagement';
import { setSelectedWidget } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';
import { getLastWeekDate } from '../../utils/formatTime';
// utils
import { getGridConfig, getPageName } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import { OperationTimeChart1 } from './OperationTimeMonitorChart';
import { OperationTimeChart2 } from './OperationTimeReportChart';


const pageCode = 'menu.production.resourceManagement.operationEfficiencyLoss.operationTime.operationTime';
const tableCode = 'operationTimeList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function OperationTimeList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.operationTimeManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [dataChart, setDataChart] = useState([]);
  const [intervalTime, setIntervalTime] = useState(0);
  const initialSearchParam = useRef(searchParams);
  const currentIntervalTime = useRef(0);
  const currentIntervalID = useRef(null);
  const [listEquipmentCur, setListEquipmentCur] = useState([]);
  const offsetWidthChart = useRef(0);
  const [correctSearch, setCorrectSearch] = useState(true);
  const [equipmentDropdown, setEquipmentDropdown] = useState([]);
  const [defaultStart, setDefaultStart] = useState('');
  const widgetMonitoring = 'Operation Time Monitoring';
  const widgetReport = 'Operation Time Report';
  const paramCodeConfig = 'ST00000001';
  const pageSelectedWidget = selectedWidget[pageCode];

  useLayoutEffect(() => {
    const getDefault = async () => {
      const planStartTimeConfig = await query({
        url: '/v1/factory-configuration/search',
        featureCode: 'user.create',
        params: {
          paramCode: paramCodeConfig
        }
      });
      if (planStartTimeConfig?.data) {
        if (planStartTimeConfig.data.length > 0) {
          setDefaultStart(planStartTimeConfig.data[0].paramValue);
        }
      }
    };
    getDefault();
  }, []);

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
    async function fetchEquipmentList() {
      const response = await query({
        url: '/v1/equipment-id/search',
        featureCode: 'user.create',
        params: {}
      });
      const equipmentIDDropdown = [];
      response.data.forEach((equipID) => {
        const temp = {
          eqIDcode: equipID.code,
          eqIDname: equipID.name,
          eqCode: equipID.equipmentCode.code,
          eqGroup: equipID.equipmentGroup.factoryPk,
          eqLine: equipID.equipmentLine.factoryPk,
          eqPart: equipID.equipmentPart.factoryPk,
          eqPlant: equipID.equipmentPlant.factoryPk,
          eqProcess: equipID.equipmentProcess.factoryPk,
          eqTeam: equipID.equipmentTeam.factoryPk,
          eqWorkStation: equipID.equipmentWorkStation.factoryPk
        };
        equipmentIDDropdown.push(temp);
      });
      setEquipmentDropdown(equipmentIDDropdown);
    }
    fetchEquipmentList();
  }, []);
  useLayoutEffect(() => {
    onLoadData();
  }, [equipmentDropdown]);

  useLayoutEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useLayoutEffect(() => {
    if (currentIntervalTime.current !== intervalTime) {
      clearInterval(currentIntervalID.current);
      if (intervalTime > 0) {
        currentIntervalID.current = setInterval(() => {
          onLoadData();
        }, intervalTime * 60000);
        currentIntervalTime.current = intervalTime;
      }
    }
    return () => clearInterval(currentIntervalID.current);
  }, [intervalTime]);

  useLayoutEffect(() => {
    dispatch(setSearchParams(initialSearchParam.current));
    onLoadData(initialSearchParam.current);
    clearInterval(currentIntervalID.current);
    currentIntervalTime.current = 0;
    if (pageSelectedWidget?.widgetName === widgetReport) {
      const now = new Date();
      const { today, lastWeekDay } = getLastWeekDate(now);

      const _search = {
        ...initialSearchParam.current,
        from: lastWeekDay,
        to: today
      };
      dispatch(setSearchParams(_search));
      onLoadData(_search);
    } else if (pageSelectedWidget?.widgetName === widgetMonitoring) {
      dispatch(setSearchParams(initialSearchParam.current));
      setListEquipmentCur(equipmentDropdown);
      onLoadData(initialSearchParam.current);
    }
  }, [selectedWidget]);

  useLayoutEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const onInquiry = () => {
    const time = Number(searchParams.refresh);
    setIntervalTime(time);
    onLoadData();
    let equipList = equipmentDropdown;
    if (searchParams.equipmentIDCode) {
      const temp = equipList.filter((eq) => eq.eqIDcode.includes(searchParams.equipmentIDCode));
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.equipmentIDName) {
      const temp = equipList.filter((eq) => eq.eqIDname.includes(searchParams.equipmentIDName));
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.equipmentCode) {
      const temp = equipList.filter((eq) => eq.eqCode.includes(searchParams.equipmentCode));
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.groupPks) {
      let temp = [];
      const group = searchParams.groupPks.split(',');
      group.forEach((g) => {
        temp = equipList.filter((eq) => eq.eqGroup === g);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.linePks) {
      let temp = [];
      const line = searchParams.linePks.split(',');
      line.forEach((l) => {
        temp = equipList.filter((eq) => eq.eqLine === l);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.partPks) {
      let temp = [];
      const part = searchParams.partPks.split(',');
      part.forEach((p) => {
        temp = equipList.filter((eq) => eq.eqPart === p);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.plantPks) {
      let temp = [];
      const plant = searchParams.plantPks.split(',');
      plant.forEach((p) => {
        temp = equipList.filter((eq) => eq.eqPlant === p);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.processPks) {
      let temp = [];
      const process = searchParams.processPks.split(',');
      process.forEach((p) => {
        temp = equipList.filter((eq) => eq.eqProcess === p);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (searchParams.teamPks) {
      let temp = [];
      const team = searchParams.teamPks.split(',');
      team.forEach((t) => {
        temp = equipList.filter((eq) => eq.eqTeam === t);
      });
      equipList = temp;
      if (temp.length === 0) setCorrectSearch(false);
    }
    if (equipList.length !== 0) setCorrectSearch(true);
    setListEquipmentCur(equipList);
  };

  const handleChangeSearchOrg = (value) => {
    const _search = {
      ...searchParams,
      factoryPks: value.factoryIds,
      plantPks: value.plantIds,
      teamPks: value.teamIds,
      groupPks: value.groupIds,
      partPks: value.partIds,
      linePks: value.lineIds,
      processPks: value.processIds
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
  const handleChangeDateSearchConfig = (name, value) => {
    const { today } = getLastWeekDate(value);
    let _search;

    if (pageSelectedWidget?.widgetName === widgetMonitoring) {
      _search = {
        ...searchParams,
        from: `${today}`,
        to: `${today}`
      };
    } else {
      _search = {
        ...searchParams,
        [name]: `${today}`
      };
    }
    dispatch(setSearchParams(_search));
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
    onLoadData(initialSearchParam.current);
  };

  const onLoadData = (_searchParams = searchParams) => {
    query({
      url: '/v1/equipment-id-operation/search',
      featureCode: 'user.create',
      params: {
        from: _searchParams.from,
        to: _searchParams.to,
        equipmentIDCode: _searchParams.equipmentIDCode || '',
        equipmentIDName: _searchParams.equipmentIDName || '',
        equipmentCode: _searchParams.equipmentCode || '',
        factoryPks: '',
        plantPks: _searchParams.plantPks || '',
        teamPks: _searchParams.teamPks || '',
        groupPks: _searchParams.groupPks || '',
        partPks: _searchParams.partPks || '',
        linePks: _searchParams.linePks || '',
        processPks: _searchParams.processPks || '',
        workStationPks: _searchParams.workStationPks || ''
      }
    })
      .then((res) => {
        const operationTimes = [];
        setDataChart(res.data);
        if (res?.data) {
          const { data } = res;

          data.forEach((total) => {
            if (total?.operationHistoryItems) {
              const { operationHistoryItems } = total;
              const historyItems = operationHistoryItems.map((item) => {
                const { equipmentID } = item;
                return {
                  equipmentPart: equipmentID?.equipmentPart?.name || '',
                  equipmentLine: equipmentID?.equipmentLine?.name || '',
                  equipmentProcess: equipmentID?.equipmentProcess?.name?.name || '',
                  equipmentWorkStation: equipmentID?.equipmentWorkStation?.name || '',
                  equipmentID: {
                    code: equipmentID?.code,
                    name: equipmentID?.name
                  },
                  operationDate: item?.operationDate,
                  operationTime: item?.operationTime,
                  lossTime: item?.lossTime,
                  totalTime: item?.totalTime,
                  operationRate: `${Math.round((item?.operationRate * 100 + Number.EPSILON) * 100) / 100}%`
                };
              });
              operationTimes.push(...historyItems);
            }
            operationTimes.push({
              equipmentPart: 'Total',
              equipmentLine: 'Total',
              equipmentProcess: 'Total',
              equipmentWorkStation: 'Total',
              equipmentID: {
                code: 'Total',
                name: 'Total'
              },
              operationDate: '',
              operationTime: total?.operationTime,
              lossTime: total?.lossTime,
              totalTime: total?.totalTime,
              operationRate: `${Math.round((total?.operationRate * 100 + Number.EPSILON) * 100) / 100}%`
            });
          });
        }
        if (!res.data) {
          setDataChart([]);
          enqueueSnackbar(translate(`message.please_check_search_condition_again`), {
            variant: 'warning',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
        updateData(operationTimes);
      })
      .catch((error) => {
        console.error(error);
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
    handleChangeSearchOrg(selected);
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
          {pageSelectedWidget?.widgetName === widgetReport && (
            <DthDatePicker
              name="to"
              label="To"
              value={searchParams.to}
              onChange={(newValue) => {
                handleChangeDateSearchConfig('to', newValue);
              }}
              sx={{ my: 1 }}
              fullWidth
              size="small"
            />
          )}
          <TextField
            fullWidth
            id="equipmentCode"
            name="equipmentCode"
            label="Equip Code"
            value={searchParams.equipmentCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="equipmentIDCode"
            name="equipmentIDCode"
            label="Equip ID Code"
            value={searchParams.equipmentIDCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="equipmentIDName"
            name="equipmentIDName"
            label="Equip ID Name"
            value={searchParams.equipmentIDName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="refresh"
            name="refresh"
            label="Auto Refresh"
            value={searchParams.refresh}
            onChange={handleChangeSearchConfig}
            options={[
              { value: '0', label: 'None' },
              { value: '1', label: '1 Min' },
              { value: '5', label: '5 Mins' },
              { value: '10', label: '10 Mins' },
              { value: '30', label: '30 Mins' }
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
                        {pageSelectedWidget?.widgetName === widgetMonitoring && (
                          <Card
                            sx={{
                              backgroundColor: 'primary.dark',
                              textAlign: 'center',
                              mb: 1
                            }}
                          >
                            <Timer />
                          </Card>
                        )}

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
              {pageSelectedWidget?.widgetName === widgetMonitoring && (
                <Card ref={offsetWidthChart}>
                  <OperationTimeChart1
                    data={dataChart}
                    equipList={listEquipmentCur.length === 0 && correctSearch ? equipmentDropdown : listEquipmentCur}
                    defaultStart={defaultStart}
                    respondWidth={offsetWidthChart.current?.offsetWidth}
                  />
                </Card>
              )}
              {pageSelectedWidget?.widgetName === widgetReport && (
                <Card sx={{ height: 'calc(100% - 60px)' }}>
                  <Card sx={{ height: '50%' }}>
                    <OperationTimeChart2 data={dataChart} />
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      borderRadius: '0px',
                      display: 'row',
                      // height: 'calc(100% - 254px)'
                      height: '50%'
                    }}
                  >
                    <AgGrid
                      columns={columns}
                      rowData={rowData}
                      className={themeAgGridClass}
                      onGridReady={onGridReady}
                      // onSelectionChanged={onSelectionChanged}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </Card>
                </Card>
              )}
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
