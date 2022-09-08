import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';

import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import MuiTableCell from '@material-ui/core/TableCell';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';

import { isEmpty, isUndefined } from 'lodash-es';

import { useEffect, useState } from 'react';

import { query, mutate } from '../../core/api';

// components

import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { Dropdown, DthMonthPicker } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';

// hooks
import useSettings from '../../hooks/useSettings';

import { setSelectedWidget } from '../../redux/slices/page';
import { useDispatch, useSelector } from '../../redux/store';

import { fDateTime, fMonth } from '../../utils/formatTime';
import { getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
// ----------------------------------------------------------------------

const pageCode = 'menu.system.systemConfiguration.systemClosing.systemClosing.periodClosing';

const currentMonth = new Date();
const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, currentMonth.getDate());

export default function PeriodClosing() {
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, funcPermission, user, commonDropdown } = useAuth();
  const { themeAgGridClass } = useSettings();

  const [hideFilters, setHideFilters] = useState(false);
  const [actionTooltip, setActionTooltip] = useState('Hide');
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [operation, setOperation] = useState('D051001');
  const [closingMonth, setClosingMonth] = useState(new Date());

  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [factories, setFactories] = useState([]);
  const [listClosingItem, setListClosingItem] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const { commonCodes } = commonDropdown;
  const [factory, setFactory] = useState({});

  const [curButtonRef, setCurButtonRef] = useState({});
  const [statusRef, setStatusRef] = useState({});
  const [timeRef, setTimeRef] = useState({});
  const TYPE = { D055001: 'Inventory' };

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

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  useEffect(() => {
    setActionTooltip(hideFilters ? 'Show' : 'Hide');
  }, [hideFilters]);

  useEffect(() => {
    const _listClosing = commonCodes
      .filter((item) => item.groupId === 'D055000')
      .map((item) => ({
        code: item.code,
        name: item.name
      }));
    const _curButtonRef = _listClosing
      .map((item) => ({
        [item.code]: 'RUN'
      }))
      .reduce((previous, current) => Object.assign(previous, current), {});
    const _statusRef = _listClosing
      .map((item) => ({
        [item.code]: 'WAIT'
      }))
      .reduce((previous, current) => Object.assign(previous, current), {});
    const _timeRef = _listClosing
      .map((item) => ({
        [item.code]: ''
      }))
      .reduce((previous, current) => Object.assign(previous, current), {});
    setCurButtonRef(_curButtonRef);
    setStatusRef(_statusRef);
    setListClosingItem(_listClosing);
    setTimeRef(_timeRef);
  }, [commonCodes]);

  // const onLoadData = async () => {
  //     const params = {
  //         from: fDate(searchParams.operationFrom),
  //         to: fDate(searchParams.operationTo),

  //         operationType: searchParams.operationType,
  //         objectType: searchParams.objectType,
  //         reason: searchParams.reason,
  //         materialID: searchParams.materialId,
  //         materialName: searchParams.materialName,
  //         materialCode: searchParams.materialCode,
  //         registerID: searchParams.registerId,
  //         lotNo: searchParams.lotNo,
  //         stock: searchParams.storage,
  //     };
  //     parseOrgSearchAll(params, parseSelectedTree);
  //     const data = await loadDataLineStockAdj(params);
  //     setSelectedAdjIds([]);
  //     updateData(data);
  // };

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

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />,
      maxHeight: '60vh'
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
    }
  ];

  const handleProcess = (e) => {
    const curId = e?.target?.getAttribute('id');
    const _curId = curId.split('-');

    if (TYPE[_curId[1]] && factory[`factory-${_curId[1]}`]) {
      setSubmitting(true);
      setStatusRef({
        ...statusRef,
        [_curId[1]]: 'RUNNING'
      });
      const _factoryCode = factory[`factory-${_curId[1]}`].split('-');

      mutate({
        url: '/v1/period-closing/process',
        data: {
          type: TYPE[_curId[1]],
          month: fMonth(closingMonth),
          pk: {
            factoryCode: _factoryCode[0]
          }
        },
        method: 'post',
        featureCode: 'user.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;
            setSubmitting(false);
            setStatusRef({
              ...statusRef,
              [_curId[1]]: data.status
            });
            setCurButtonRef({
              ...curButtonRef,
              [_curId[1]]: data.process
            });
            setTimeRef({
              ...timeRef,
              [_curId[1]]: fDateTime(data.processTime)
            });
          }
        })
        .catch((err) => {
          setSubmitting(false);
          setStatusRef({
            ...statusRef,
            [_curId[1]]: 'ERROR'
          });
          setCurButtonRef({
            ...curButtonRef,
            [_curId[1]]: 'RUN'
          });
          setTimeRef({
            ...timeRef,
            [_curId[1]]: ''
          });
        });
    }
  };

  const handleChangeMonth = (value) => {
    if (fMonth(new Date(value.getFullYear(), value.getMonth() - 1, value.getDate())) === fMonth(previousMonth)) {
      setClosingMonth(value);
    }
  };

  const handleChangeFactory = (e) => {
    setFactory({
      ...factory,
      [e?.target?.name]: e?.target?.value
    });

    const curRow = e?.target?.name.split('-');

    const curFactory = e?.target.value.split('-');

    if (TYPE[curRow[1]]) {
      query({
        url: `/v1/period-closing/get-element?factoryCode=${curFactory[0]}&month=${fMonth(closingMonth)}&type=${
          TYPE[curRow[1]]
        }`,
        featureCode: 'user.create'
      }).then((res) => {
        const { data } = res;
        if (data.numberOfRun > 0) {
          setCurButtonRef({
            ...curButtonRef,
            [curRow[1]]: data.process
          });

          setStatusRef({
            ...statusRef,
            [curRow[1]]: data.status
          });
          setTimeRef({
            ...timeRef,
            [curRow[1]]: fDateTime(data.processTime)
          });
        } else {
          setCurButtonRef({
            ...curButtonRef,
            [curRow[1]]: 'RUN'
          });

          setStatusRef({
            ...statusRef,
            [curRow[1]]: 'WAIT'
          });
        }
      });
    }
  };

  return (
    <Page title={getPageName(pageCode)}>
      <Container sx={{ px: `0px !important` }} maxWidth={false}>
        <Grid container spacing={0} sx={{ px: 0, height: `calc(100vh - 254px)` }}>
          {!hideFilters && (
            <Grid item xs={12} md={2}>
              <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 154px)` }, overflow: 'auto' }}>
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
                      <AccordionSummary expandIcon={<Icon icon={arrowIosDownwardFill} width={20} height={20} />}>
                        <Typography variant="subtitle1">{accordion.heading}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>{accordion.detail}</AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
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
                    height: 'calc(100% - 35px)',
                    minHeight: { xs: `calc(80vh - 100px)` }
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="left"
                    display="flex"
                    alignItems="center"
                    sx={{ marginTop: `0 !important`, marginBottom: `1 !important`, width: '30%' }}
                  >
                    <Typography variant="h5" noWrap sx={{ width: '50%' }}>
                      {translate(`label.closing_month`)}
                    </Typography>

                    <DthMonthPicker
                      name="closingMonth"
                      onChange={(newValue) => {
                        setClosingMonth(newValue);
                      }}
                      value={closingMonth}
                      maxDate={currentMonth}
                      minDate={previousMonth}
                    />
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '75%', width: '100%', overflowY: 'auto' }}>
                    <TableContainer sx={{ height: '100%' }}>
                      <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                          <TableRow key="header-1">
                            <MuiTableCell align="center" key="no" className="header">
                              No.
                            </MuiTableCell>
                            <MuiTableCell align="center" key="factory" className="header">
                              Factory
                            </MuiTableCell>
                            <MuiTableCell align="center" key="item" className="header">
                              Item
                            </MuiTableCell>
                            <MuiTableCell align="center" key="process" className="header">
                              Process
                            </MuiTableCell>
                            <MuiTableCell align="center" key="status" className="header">
                              Status
                            </MuiTableCell>
                            <MuiTableCell align="center" key="time" className="header">
                              Time
                            </MuiTableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {listClosingItem.map((item, index) => {
                            console.log('index', index);
                            return (
                              <TableRow key={`row-${index}`}>
                                <MuiTableCell align="center" key={`no-${index}`} className="header">
                                  {index + 1}
                                </MuiTableCell>
                                <MuiTableCell align="center" key={`factory-${index}`} className="header">
                                  <Dropdown
                                    id={`factory-${item.code}`}
                                    name={`factory-${item.code}`}
                                    required
                                    allowEmptyOption={false}
                                    options={commonDropdown.factoryDropdownForPlant}
                                    size="small"
                                    onChange={handleChangeFactory}
                                    value={factory[`factory-${item.code}`]}
                                  />
                                </MuiTableCell>
                                <MuiTableCell align="center" key={`item-${index}`} className="header">
                                  {item.name}
                                </MuiTableCell>
                                <MuiTableCell align="center" key={`process-${index}`} className="header">
                                  <LoadingButton
                                    type="button"
                                    variant="contained"
                                    id={`button-${item.code}`}
                                    onClick={handleProcess}
                                    loading={isSubmitting}
                                    loadingIndicator={curButtonRef[item.code]}
                                  >
                                    {curButtonRef[item.code]}
                                  </LoadingButton>
                                </MuiTableCell>
                                <MuiTableCell align="center" key={`status-${index}`} className="header">
                                  {statusRef[item.code]}
                                </MuiTableCell>
                                <MuiTableCell align="center" key={`time-${index}`} className="header">
                                  {timeRef[item.code]}
                                </MuiTableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Card>
              </>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
