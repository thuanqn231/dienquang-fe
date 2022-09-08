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
  Grid, IconButton, List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField, Tooltip, Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { isEmpty } from 'lodash-es';
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
import { getGroupCommonCode, getShiftCodeDropdown, getTypeCodeDropdown, getWorkingTypeCommonCode } from '../../redux/slices/common';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { resetSearchParams, setParamsWorkCalendar, setParamsWorkForm } from '../../redux/slices/workCalendarManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import WorkCalendarRegistrationForm from './WorkCalendarRegistrationForm';
import WorkFormRegistrationForm from './WorkFormRegistrationForm';
import AssignGroupForm from './AssignGroupForm';

const pageCode = "menu.masterData.production.planningMasterData.timeManagement.workCalendar";
const workFromTableCode = 'WorkFormList';
const workCalendarTableCode = 'workCalendarList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function WorkFormList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParamsWorkForm, searchParamsWorkCalendar } = useSelector((state) => state.workCalendarManagement);
  const { shiftCommon } = useSelector((state) => state.common);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCycleTimeId, setSelectedCycleTimeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState();
  const { commonDropdown, userGridConfig, funcPermission } = useAuth();
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const { selectedWidget } = useSelector((state) => state.page);
  const [columns, setColumns] = useState(null);
  const initialSearchParam = useRef(selectedWidget.widgetName === 'Work Form' ? searchParamsWorkForm : searchParamsWorkCalendar);
  const [genWorkFormNo, setGenWorkFormNo] = useState('')
  const [curerntWorkForm, setCurrentWorkForm] = useState('')
  const [curerntWorkCalendar, setCurrentWorkCalendar] = useState('')
  const [currentField, setCurrentField] = useState({})
  const [gridApi, setGridApi] = useState(null);
  const [shift, setShift] = useState('');
  const [isAssign, setIsAssign] = useState(false)
  const [workFormNameOption, setWorkFormNameOption] = useState([])
  const [line, setLine] = useState()
  const [process, setProcess] = useState()
  const [workDate, setWorkDate] = useState()
  const [workFormNo, setWorkFormNo] = useState('')

  useEffect(() => {
    const currentPage = funcPermission.filter((permission) => permission.code === pageCode);
    if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
      const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
      setListOfWidgets(activeWidgets);
      if (!isEmpty(activeWidgets) && selectedWidget.pageCode !== pageCode) {
        dispatch(
          setSelectedWidget({
            pageCode,
            widgetCode: activeWidgets[0].code,
            widgetName: activeWidgets[0].name
          })
        );
      }
    }
  }, [funcPermission]);


  useEffect(() => {
    if (selectedWidget.widgetName !== '') {
      const tableCode = selectedWidget.widgetName === 'Work Form' ? workFromTableCode : workCalendarTableCode;
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });  
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      const tableCode = selectedWidget.widgetName === 'Work Form' ? workFromTableCode : workCalendarTableCode;
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);


  useEffect(() => {
    if(selectedWidget.widgetName === 'WorkForm') {
      onLoadData(initialSearchParam.current);

      dispatch(setParamsWorkForm(initialSearchParam.current));
    } else {
      loadWorkForm()
      onLoadData(initialSearchParam.current);
      dispatch(setParamsWorkCalendar(initialSearchParam.current));
    }
  }, [selectedWidget]);

  useEffect(() => {
    dispatch(getMaterialDropdown());
    dispatch(getShiftCodeDropdown());
    dispatch(getTypeCodeDropdown());
    dispatch(getGroupCommonCode());
    dispatch(getWorkingTypeCommonCode())
  }, [dispatch]);

  useEffect(() => {
    if (gridApi) {
      onLoadData(initialSearchParam.current);
    }
  }, [gridApi])

  useEffect(() => {
    if (gridApi && selectedWidget.widgetName === 'Work Form') {
      gridApi.forEachNode((node) => {
        if (workFormNo !== '') {
          node.setSelected(node.data.workFormNo === workFormNo)
        } else {
          node.setSelected(false);
        }
      });
    } else if (gridApi && selectedWidget.widgetName === 'Work Calendar') {
      gridApi.forEachNode((node) => {

        if (shift !== '' && workDate !== '' && line !== '' && process !== '') {
          node.setSelected(node.data.shiftName === shift && node.data.line === line && node.data.process === process && node.data.workDate === workDate)
        } else {
          node.setSelected(false);
        }
      });
    }
  }, [shift, workDate, line, process, workFormNo])

  const onGridReady = (params) => {
    setGridApi(params.api);
  };
  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';
  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const onInquiry = () => {
    onLoadData();
  };

  const handleChangeSearchConfig = (event) => {
    if (selectedWidget.widgetName === 'Work Form') {
      const _search = {
        ...searchParamsWorkForm,
        [event.target.name]: `${event.target.value}`
      };
      dispatch(setParamsWorkForm(_search));
    } else {
      const _search = {
        ...searchParamsWorkCalendar,
        [event.target.name]: `${event.target.value}`
      };
      dispatch(setParamsWorkCalendar(_search));
    }
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onClickWidget = (widgetCode, widgetName) => {
    dispatch(
      setSelectedWidget({
        pageCode,
        widgetCode,
        widgetName
      })
    );
  };

  const loadWorkForm = () => {
    query({
      url: '/v1/work-calendar/work-form',
      featureCode: 'user.create',
      method: 'GET',
    })
      .then((res) => {
        setWorkFormNameOption(res.data.map(e => (
          {
            value: e.workFormNo,
            label: e.workFormName,
            factoryPk: e.factoryPk
          }
        )))
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const onLoadDataWorkCalendar = (searchPar) => {

    const params = {
      from: fDate(searchPar.from) || '',
      to: fDate(searchPar.to) || '',
      shift: searchPar.shift || '',
      group: searchPar.group || '',
      finalYn: searchPar.final || ''
    }
    parseOrgSearchFactory(params, parseSelectedTree);
    query({
      url: '/v1/work-calendar/search',
      featureCode: 'user.create',
      method: 'GET',
      params
    })
      .then((res) => {
        const operationTimes = [];

        if (res?.data) {
          const { data } = res
          data.forEach((total) => {
            if (total?.workCalendarSummaryItem) {
              const { workCalendarSummaryItem } = total;
              const summaryDetails = workCalendarSummaryItem.map((e) => (
                {
                  factory: e.pk.factoryName,
                  group: e.group.name,
                  workDate: e.workDate,
                  shiftName: e.shift.name,
                  overTime: e.overTimeType,
                  final: e.process.finalYn,
                  line: e.process.line.code,
                  process: e.process.name.name,
                  shiftStartTime: e.startTime,
                  finishTime: e.endTime,
                  startRestTime: e.startRestTime,
                  endRestTime: e.endRestTime,
                  workingTime: e.workTime,
                  restTime: e.restTime,
                  overTimeM: e.overTime,
                  registerDay: fDate(e.dteLogI),
                  updateDay: fDate(e.dteLogU),
                  registerBy: e.usrLogI,
                  updateBy: e.usrLogU
                }
              ));
              operationTimes.push(...summaryDetails);
            }
            operationTimes.push({
              factory: 'Sum',
              workFormNo: 'Sum',
              workFormName: 'Sum',
              shift: 'Sum',
              workGroup: '',
              overTime: '',
              shiftStartTime: '',
              finishTime: '',
              startRestTime: '',
              endRestTime: '',
              workingTime: total?.workTime,
              overTimeM: total?.overTime,
              restTime: total?.restTime
            });
          });
        }
        updateData(operationTimes)
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const onLoadDataWorkForm = (searchPar) => {
    const params = {
      workFormNo: searchPar.workFormNo || '',
      workFormName: searchPar.workFormName || '',
      shift: searchPar.shift || ''
    };
    parseOrgSearchFactory(params, parseSelectedTree);
    query({
      url: '/v1/work-form/summary/search',
      featureCode: 'user.create',
      method: 'GET',
      params
    })
      .then((res) => {
        const operationTimes = [];

        if (res?.data) {
          const { data } = res

          data.forEach((total) => {
            if (total?.workFormSummarys) {
              const { workFormSummarys } = total;
              const summaryDetails = workFormSummarys.map((e) => (
                {
                  factory: e.pk.factoryName,
                  workFormNo: e.workFormNo,
                  workFormName: e.workFormName,
                  shift: e.shift,
                  overTime: e.overTimeType,
                  shiftStartTime: e.startTime,
                  finishTime: e.finnishTime,
                  startRestTime: e.startRestTime,
                  endRestTime: e.endRestTime,
                  workingTime: e.workingTime,
                  restTime: e.restTime,
                  overTimeM: e.overTime,
                  registerDay: fDate(e.dteLogI),
                  updateDay: fDate(e.dteLogU),
                  registerBy: e.usrLogI,
                  updateBy: e.usrLogU
                }
              ));
              operationTimes.push(...summaryDetails);
            }
            operationTimes.push({
              factory: 'Sum',
              workFormNo: 'Sum',
              workFormName: 'Sum',
              shift: 'Sum',
              overTime: 'Sum',
              shiftStartTime: '',
              finishTime: '',
              startRestTime: '',
              endRestTime: '',
              workingTime: total?.workingTime,
              overTimeM: total?.overTime,
              restTime: total?.restTime
            });
          });
        }
        updateData(operationTimes)
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const onLoadData = (searchPar = selectedWidget.widgetName === 'Work Form' ? searchParamsWorkForm : searchParamsWorkCalendar) => {
    if (selectedWidget.widgetName === 'Work Calendar') {
      onLoadDataWorkCalendar(searchPar);
    }
    if (selectedWidget.widgetName === 'Work Form') {
      onLoadDataWorkForm(searchPar);
    }
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };


  const onSelectionChanged = (event) => {
    let shiftName = ''
    let line = ''
    let workDate = ''
    let process = ''
    let workFormNo = ''

    if (event.api.getSelectedNodes()[0] && selectedWidget.widgetName === 'Work Form') {
      shiftName = event.api.getSelectedNodes()[0].data.shift?.description
      workFormNo = event.api.getSelectedNodes()[0].data.workFormNo

    } else if (event.api.getSelectedNodes()[0] && selectedWidget.widgetName === 'Work Calendar') {
      shiftName = event.api.getSelectedNodes()[0].data.shiftName
      line = event.api.getSelectedNodes()[0].data.line
      process = event.api.getSelectedNodes()[0].data.process
      workDate = event.api.getSelectedNodes()[0].data.workDate
    }
    const rowCount = event.api.getSelectedNodes().length ? event.api.getSelectedNodes().length : 0;
    // const selectedLength = rowData.filter((row) => row.shift.description === shiftName).length;

    if (rowCount === 0) {
      setSelectedCycleTimeId(null);
      setShift('');
      setWorkFormNo('')
      setWorkDate('')
      setProcess('')
      setLine('')
      return;
    }
    if (rowCount === 1) {
      if (selectedWidget.widgetName === 'Work Form') {
        const { workFormNo } = event.api.getSelectedNodes()[0].data;
        setSelectedCycleTimeId(workFormNo)
        if (workFormNo) {
          query({
            url: '/v1/work-form/summary/search',
            featureCode: 'user.create',
            method: 'GET',
            params: {
              workFormNo,
              workFormName: '',
              shift: ''
            }
          })
            .then((res) => {
              setCurrentWorkForm(res.data)

            })
            .catch((err) => {
              console.error(err);
            });


          query({
            url: `/v1/work-form/load?workFormNo=${workFormNo}`,
            featureCode: 'user.create',
          })
            .then((res) => {
              setCurrentField(res.data)
              console.log(res.data)
            })
              .then((res) => {
                setCurrentField(res.data)
              })
              .catch((err) => {
                console.error(err);
              });
        }
      }

      if (selectedWidget.widgetName === 'Work Calendar') {
        const { data } = event.api.getSelectedNodes()[0];
        const shiftCode = shiftCommon.find(e => e.label === data.shiftName).value
        const linePk = commonDropdown.lineDropdown.find(e => e.code === data.line)?.value
        const processPk = commonDropdown.processDropdown.find(e => e.label === data.process && e.line === linePk )?.value
        const date = data.workDate


        mutate({
          url: `/v1/work-calendar/load`,
          method: 'post',
          featureCode: 'user.create',
          data: {
            "workDate": date,
            "shift": {
              "code": shiftCode
            },
            "process": {
              "factoryPk": processPk,
              "line": {
                "factoryPk": linePk
              }
            }
          }
        })
          .then((res) => {
            setCurrentWorkCalendar(res.data)
          });

        query({
          url: '/v1/work-calendar/search',
          featureCode: 'user.create',
          method: 'GET',
          params:{
            from: data.workDate,
            to:data.workDate,
            shift: shiftCommon.find(e => e.label === data.shiftName)?.value
          }
        })
          .then((res) => {
            const list = res.data.filter(e => (e.workCalendarSummaryItem[0].process.factoryPk === processPk && e.workCalendarSummaryItem[0].process.line.factoryPk === linePk))
            setSelectedCycleTimeId(list)
          })
          .catch((err) => {
            console.error(err);
          });
      }
      //
      setShift(shiftName);
      setWorkDate(workDate)
      setProcess(process)
      setLine(line)
      setWorkFormNo(workFormNo)
    }
  };

  const onLoadWorkFormNo = () => {
    query({
      url: '/v1/work-form/generate-work-form-no',
      featureCode: 'user.create',
      method: 'GET',
    })
      .then((res) => {
        if (res?.data) {
          setGenWorkFormNo(res.data)
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onClickAdd = () => {
    onLoadWorkFormNo()
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedCycleTimeId) {
      enqueueSnackbar('Please select 1 Shift', {
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
    if (!selectedCycleTimeId) {
      enqueueSnackbar('Please select 1 Shift', {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      setIsEdit(true);
      handleOpenDeleteModal();
    }
  };

  const onClickAssign = () => {
    setIsAssign(true)
    handleOpenModal();
  };


  const handleDelete = async () => {
    if (selectedWidget.widgetName === 'Work Form') {
      await mutate({
        url: `/v1/work-form/delete?workFormNo=${selectedCycleTimeId}`,
        method: 'delete',
        featureCode: 'user.delete'
      }).then((res) => {
        if(res.statusCode === "success") {
          enqueueSnackbar(translate(`Work form was deleted`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          handleCloseDeleteModal();
          onLoadDataWorkForm(searchParamsWorkForm);
          setSelectedCycleTimeId('')
        }
      });
    }
    if(selectedWidget.widgetName === 'Work Calendar') {
      const params = selectedCycleTimeId[0]?.workCalendarSummaryItem.map(e => ({
        pk:{
          id: e.pk?.id,
          factoryCode: e.pk.factoryCode
        },
        workDate: e.workDate,
        shift: {
          code: e.shift.code
        },
        process: {
          factoryPk: e.process.factoryPk
      }
      
      }))
      await mutate({
        url: `/v1/work-calendar/delete`,
        method: 'post',
        featureCode: 'user.create',
        data: params
      })
        .then((res) => {
          if (res.statusCode === "success") {
            enqueueSnackbar('Work form was deleted', {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
            handleCloseDeleteModal();
            onLoadDataWorkCalendar(searchParamsWorkCalendar);
            setSelectedCycleTimeId('')
          }
        });
    }
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
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
            const isActive = selectedWidget.widgetCode === element.code;
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
          {
            selectedWidget.widgetName === 'Work Form' && (
              <>
                <TextField
                  id="workFormNo"
                  name="workFormNo"
                  label="Work Form No"
                  sx={{ my: 1 }}
                  onChange={handleChangeSearchConfig}
                  value={searchParamsWorkForm.workFormNo}
                  size="small"
                  fullWidth
                />
                <TextField
                  id="workFormName"
                  name="workFormName"
                  label="Work Form Name"
                  sx={{ my: 1 }}
                  onChange={handleChangeSearchConfig}
                  value={searchParamsWorkForm.workFormName}
                  size="small"
                  fullWidth
                />
              </>
            )
          }
          {
            selectedWidget.widgetName === 'Work Calendar' && (
              <>
                <DthDatePicker
                  id="from"
                  name="from"
                  label="From"
                  sx={{ my: 1 }}
                  value={searchParamsWorkCalendar.from}
                  onChange={(newValue) => {
                    const _search = {
                      ...searchParamsWorkCalendar,
                      from: fDate(newValue)
                    };
                    dispatch(setParamsWorkCalendar(_search));
                  }}
                  fullWidth
                  size="small"
                />
                <DthDatePicker
                  id="to"
                  name="to"
                  label="To"
                  value={searchParamsWorkCalendar.to}
                  onChange={(newValue) => {
                    const _search = {
                      ...searchParamsWorkCalendar,
                      to: fDate(newValue)
                    };
                    dispatch(setParamsWorkCalendar(_search));
                  }}
                  sx={{ my: 1 }}
                  fullWidth
                  size="small"
                />
                <Dropdown
                  id="group"
                  name="group"
                  label="Group"
                  groupId='D002000'
                  value={searchParamsWorkCalendar.group}
                  onChange={handleChangeSearchConfig}
                  sx={{ my: 1 }}
                  size="small"
                />
                <Dropdown
                  id="final"
                  name="final"
                  label="Final"
                  value={searchParamsWorkCalendar.final}
                  options={[{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]}
                  onChange={handleChangeSearchConfig}
                  sx={{ my: 1 }}
                  size="small"
                />
              </>
            )
          }
          <Dropdown
            id="shift"
            name="shift"
            label="Shift"
            value={selectedWidget.widgetName === 'Work Form' ? searchParamsWorkForm.shift : searchParamsWorkCalendar.shift}
            onChange={handleChangeSearchConfig}
            groupId='D001000'
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
                                Clear Filter
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
                  Apply
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
                    action={selectedWidget.widgetName === 'Work Form' ?
                      (
                        <>
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickAdd}
                            size="small"
                            label="Register"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            funcType="EXECUTE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickModify}
                            size="small"
                            label="Modify"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedCycleTimeId}
                            funcType="UPDATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickDelete}
                            size="small"
                            label="Delete"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedCycleTimeId}
                            funcType="DELETE"
                          />


                        </>
                      ) : (
                        <>
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickAssign}
                            size="small"
                            label="Assign Group"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            funcType="CREATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickAdd}
                            size="small"
                            label="Register"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            funcType="CREATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickModify}
                            size="small"
                            label="Modify"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedCycleTimeId}
                            funcType="UPDATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickDelete}
                            size="small"
                            label="Delete"
                            widgetCode={selectedWidget.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedCycleTimeId}
                            funcType="DELETE"
                          />


                        </>
                      )}
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
                  currenData={selectedCycleTimeId}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection='multiple'
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={!isAssign && (selectedWidget.widgetName === 'Work Form' ? (`Work Form ${isEdit ? 'Modify' : 'Registration'}`) : (`Work Calendar ${(isEdit ? 'Modify' : 'Registration')}`)) || ('Assign Work Group')}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={() => {
                  handleCloseModal()
                  if (isAssign) {
                    setIsAssign(false)
                  }
                }}
              >
                {
                  selectedWidget.widgetName === 'Work Form' ? (
                    <WorkFormRegistrationForm
                      isEdit={isEdit}
                      isWorkFormNo={selectedCycleTimeId}
                      currentField={currentField}
                      workFormNo={genWorkFormNo}
                      currentData={curerntWorkForm}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                    />
                  ) : (
                    !isAssign && (
                      <WorkCalendarRegistrationForm
                        isEdit={isEdit}
                        workFormNameOption={workFormNameOption}
                        isWorkFormNo={selectedCycleTimeId}
                        currentField={currentField}
                        workFormNo={genWorkFormNo}
                        currentData={curerntWorkCalendar}
                        onCancel={handleCloseModal}
                        onLoadData={onLoadData}
                      />) || (
                      <AssignGroupForm
                        onCancel={handleCloseModal}
                        onLoadData={onLoadDataWorkForm}
                      />
                    )
                  )
                }
              </DialogDragable>
              <DialogDragable title="Delete" maxWidth="sm" open={isOpenDeleteModal} onClose={handleCloseDeleteModal}>
                <Typography variant="subtitle1" align="center">
                  Are you sure to delete?
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                    No
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={handleDelete}>
                    Delete
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
