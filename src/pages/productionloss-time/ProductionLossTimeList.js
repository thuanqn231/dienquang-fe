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
  Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
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
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
// import CycleTimeRegistrationForm from './CycleTimeRegistrationForm';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { getLossCommonCode } from '../../redux/slices/common';
import { getEquipmentIdDropdown } from '../../redux/slices/equipmentIDManagement';
import { getLossCauseDropdown, getLossMasterDropdown } from '../../redux/slices/lossManagement';
import { getLossPICDropdown } from '../../redux/slices/lossPicManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { setSearchParams, resetSearchParams } from '../../redux/slices/productionLossTimemanagement';
import { getPlanDropDownWithDiffPO } from '../../redux/slices/productionOrderManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import LossTimeReportChart from './LossTimeReportChart';
import ProductionLossTimeRegistrationForm from './ProductionLossTimeRegistrationForm';
import ProductionLossTimeSplit from './ProductionLossTimeSplit';

const pageCode = 'menu.production.resourceManagement.operationEfficiencyLoss.machineLossTime.machineLossTime';
const tableCode = 'productionLossTimeList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function MaChineLossTimeList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.productionLossTimeManagement);
  const { lossCommon } = useSelector((state) => state.common);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentLossTime, setCurrentLossTime] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [selectedLossTimeId, setSelectedLossTime] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [isOpenSplitModal, setIsOpenSplitModal] = useState(false);
  const { selectedWidget } = useSelector((state) => state.page);
  const [columns, setColumns] = useState(null);
  const [action, setAction] = useState('');
  const [currentLossType, setCurrenLossType] = useState({});
  const [widgetLossTime, setWigetLossTime] = useState(true);
  const [gridApi, setGridApi] = useState(null);
  const [dataChart, setDataChart] = useState({});
  const [checkConditionChange, setCheckConditionChange] = useState(true);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [timeConfigChange, setTimeConfigChange] = useState({
    startTimeChange: '',
    endTimeChange: ''
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const handleOpenSplitModal = () => {
    setIsOpenSplitModal(true);
  };

  const handleCloseSplitModal = () => {
    setIsOpenSplitModal(false);
  };
  const proApply = [
    { value: '', label: 'All' },
    { value: 'RUNNING', label: 'Y' },
    { value: 'HIDDEN', label: 'N' }
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
      if (column.field === 'lossTime') {
        column.valueFormatter = (params) => Math.round(params.value / 60);
      }
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (gridApi) {
      onLoadDataLossTime();
    }
  }, [widgetLossTime, gridApi]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(async () => {
    const planChangeTimeConfig = await query({
      url: '/v1/factory-configuration/search',
      featureCode: 'user.create',
      params: {
        paramCode: 'LS00000001'
      }
    });
    if (planChangeTimeConfig?.data) {
      if (planChangeTimeConfig.data.length === 0) {
        splitTimeChange('D-1 10:00 ~ D+3 10:00');
      } else {
        splitTimeChange(planChangeTimeConfig?.data[0].paramValue);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(getLossMasterDropdown());
    dispatch(getLossCommonCode());
    dispatch(getEquipmentIdDropdown());
    dispatch(getMaterialDropdown());
    dispatch(getLossCauseDropdown());
    dispatch(getLossPICDropdown());
    dispatch(getPlanDropDownWithDiffPO());
  }, [dispatch]);

  useEffect(() => {
    setCurrenLossType({ ...lossCommon[0] });
  }, [lossCommon]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const handleTimeChange = (planTime) => {
    if (planTime.includes('-')) {
      const timeSplit = planTime.split('-');
      const split = timeSplit[1].split(' ');
      const curr = new Date();
      curr.setDate(curr.getDate() - +split[0]);
      return new Date(`${fDate(curr)}T${split[1]}:00`);
    }
    if (planTime.includes('+')) {
      const timeSplit = planTime.split('+');
      const split = timeSplit[1].split(' ');
      const curr = new Date();
      curr.setDate(curr.getDate() + +split[0]);
      return new Date(`${fDate(curr)}T${split[1]}:00`);
    }
  };

  const splitTimeChange = (time) => {
    const splitString = time.split('~');
    const planStart = splitString[0].trim();
    const endStart = splitString[1].trim();
    setTimeConfigChange({
      planStart: handleTimeChange(planStart),
      endPlan: handleTimeChange(endStart)
    });
  };

  const splitTime = (time) => {
    if (time) {
      const split = time.split(':');
      return {
        hour: split[0],
        minute: split[1],
        second: split[2] || '00'
      };
    }
    return '';
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';
  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const onInquiry = () => {
    onLoadDataLossTime();
  };

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onLoadDataLossTime = () => {
    const params = {
      from: fDate(searchParams.from),
      to: fDate(searchParams.to),
      equipCode: searchParams.equipIdCode,
      // equipCode: searchParams.equipCode,
      equipName: searchParams.equipIdName,
      type: searchParams.lossType,
      classification: searchParams.lossCls,
      lossCls: searchParams.lossDetailCls,
      materialCode: searchParams.model,
      lossPic: searchParams.lossPIC,
      state: searchParams.state
    };
    parseOrgSearchAll(params, parseSelectedTree);
    if (widgetLossTime) {
      loadGridData(params);
    } else {
      loadChartData(params);
    }
  };

  const loadGridData = (requestParams) => {
    try {
      setGridDataSource(gridApi, '/v1/production/search-v2', requestParams);
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const loadChartData = (requestParams) => {
    query({
      url: '/v1/production/chart',
      featureCode: 'user.create',
      method: 'GET',
      params: requestParams
    })
      .then((res) => {
        const optionsStock = {
          chart: {
            height: '25%'
          },
          title: {
            text: 'LOSS TIME BY DAY'
            // style: {
            //     color: '#FF00FF',
            //     fontWeight: 'bold'
            // }
          },
          credits: {
            enabled: false
          },
          series: res.data.line.series,
          xAxis: {
            categories: res.data.line.categories
          },

          yAxis: {
            floor: 0,
            ceiling: 1000,
            title: {
              enabled: false
            }
          }
        };
        const optionsPieType = {
          title: {
            text: 'LOSS BY TYPE (min)'
          },
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: '65%'
          },
          credits: {
            enabled: false
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          accessibility: {
            point: {
              valueSuffix: ''
            }
          },
          plotOptions: {
            pie: {
              center: ['50%', '65%'],
              allowPointSelect: true,
              size: '65%',
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  fontSize: '18px'
                }
              },
              showInLegend: true
            }
          },
          legend: {
            itemStyle: {
              fontSize: '15px'
            },
            labelFormatter: () => ''
          },
          series: [
            {
              // center: ['10%', '50%'],
              name: 'LOSS BY TYPE (min)',
              data: res.data.type
            }
          ]
        };
        const optionsPieClass = {
          title: {
            text: 'LOSS BY CLASSIFICATION (min)'
          },
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: '65%'
          },
          credits: {
            enabled: false
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          accessibility: {
            point: {
              valueSuffix: '$'
            }
          },
          plotOptions: {
            pie: {
              center: ['50%', '65%'],
              allowPointSelect: true,
              size: '65%',
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  fontSize: '18px'
                }
              },
              showInLegend: true
            }
          },
          legend: {
            itemStyle: {
              fontSize: '15px'
            },
            labelFormatter: () => ''
          },
          series: [
            {
              // center: ['10%', '50%'],
              name: 'LOSS BY CLASSIFICATION (min)',
              data: res.data.classification
            }
          ]
        };
        const optionsPieDetail = {
          title: {
            text: 'LOSS BY DETAIL (min)'
          },
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: '65%'
          },
          credits: {
            enabled: false
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          accessibility: {
            point: {
              valueSuffix: '$'
            }
          },
          plotOptions: {
            pie: {
              center: ['50%', '65%'],
              allowPointSelect: true,
              size: '65%',
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  fontSize: '18px'
                }
              },
              showInLegend: true
            }
          },
          legend: {
            itemStyle: {
              fontSize: '15px'
            },
            y: 10,
            labelFormatter: () => ''
          },
          series: [
            {
              // center: ['10%', '50%'],
              name: 'LOSS BY DETAIL (min)',
              data: res.data.detail
            }
          ]
        };
        setDataChart({ optionsStock, optionsPieType, optionsPieDetail, optionsPieClass });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedLossTime(null);
    }
    if (rowCount === 1) {
      const lostTimeId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedLossTime(lostTimeId);
      if (lostTimeId) {
        query({
          url: `/v1/production/${lostTimeId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            const startDate = new Date(timeConfigChange.planStart);
            const endDate = new Date(timeConfigChange.endPlan);
            const registerDate = new Date(data.dteLogI);

            if (registerDate.getTime() > startDate.getTime() || endDate.getTime() > registerDate.getTime()) {
              setCheckConditionChange(true);
            } else {
              setCheckConditionChange(false);
            }

            setCurrentLossTime({
              factory: data.pk.factoryCode,
              part: data.workStation.process.line.part.factoryPk,
              line: data.workStation.process.line.factoryPk,
              processCode: data.workStation.process.factoryPk,
              workStation: data.workStation.factoryPk,
              lossStartTime: data.startTime,
              lossEndTime: data.endTime,
              lossDate: data.lossDate,
              factoryPk: data.factoryPk,
              factoryPkPlan: data.plan.factoryPk,
              lossType: data.lossType.code,
              shift: data.shift.code,
              countermeasure: data.countermeasure,
              lossCause: data.lossCause.factoryPk,
              state: data.state,
              attachedFilePks: data.attachedFilePks.map((att) => ({
                attach: `${att.factoryCode}-${att.id}`
              })),
              attachedFiles: data.attachedFiles.map((att) => ({
                ...att,
                name: att.fileName
              })),
              pk: data.pk,
              reason: data.reason,
              lossPIC: data.lossPic.factoryPk === 'null-null' ? null : data.lossPic.factoryPk,
              lossCategory: data.lossCause.lossMaster.lossType.code,
              modelCode: data.plan.factoryPk,
              lossClassification: data.lossCause.lossMaster.classification.code,
              lossDetailCls: data.lossCause.lossMaster.lossCls.code,
              lossItem: data.lossCause.lossMaster.classification.code,
              productivityApply: data.lossCause.productivity
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
      //
    }
  };

  const onClickAdd = () => {
    setAction('Add');
    setIsEdit(false);
    setIsView(false);
    handleOpenModal();
  };
  const onClickSplit = () => {
    setAction('Split');
    handleOpenSplitModal();
  };

  const onClickModify = () => {
    if (!selectedLossTimeId) {
      enqueueSnackbar(`${translate(`message.please_select_1_loss`)} Time`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (selectedLossTimeId && !checkConditionChange) {
      enqueueSnackbar('Not allow to update', {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      setAction('Modify');
      setIsEdit(true);
      setIsView(false);
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!selectedLossTimeId) {
      enqueueSnackbar(`${translate(`message.please_select_1_loss`)} Time`, {
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

  const handleDeleteLossTime = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/production/${selectedLossTimeId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          if (res.data) {
            enqueueSnackbar(translate(`message.you_are_unable_to_delete_anything_prior_to_today`), {
              variant: 'warning',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          } else {
            enqueueSnackbar('Loss time is deleted successfully', {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
          handleCloseDeleteModal();
          onLoadDataLossTime();
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
  const handleRowDoubleClick = async (row) => {
    try {
      const response = await query({
        url: `/v1/production/${row.data.factoryPk}`,
        featureCode: 'user.create'
      });
      setAction('View');
      setIsEdit(false);
      setIsView(true);
      handleOpenModal();
      const { data } = response;

      setCurrentLossTime({
        factory: data.pk.factoryCode,
        part: data.workStation.process.line.part.factoryPk,
        line: data.workStation.process.line.factoryPk,
        processCode: data.workStation.process.factoryPk,
        workStation: data.workStation.factoryPk,
        lossStartTime: data.startTime,
        lossEndTime: data.endTime,
        lossDate: data.lossDate,
        factoryPk: data.factoryPk,
        lossType: data.lossType.code,
        shift: data.shift.code,
        countermeasure: data.countermeasure,
        lossCause: data.lossCause.lossMaster.factoryPk,
        state: data.state,
        attachedFilePks: data.attachedFilePks.map((att) => ({
          attach: `${att.factoryCode}-${att.id}`
        })),
        attachedFiles: data.attachedFiles.map((att) => ({
          ...att,
          name: att.fileName
        })),
        pk: data.pk,
        reason: data.reason,
        lossPIC: data.lossPic.factoryPk,
        lossCategory: data.lossCause.lossMaster.lossType.code,
        lossClassification: data.lossCause.lossMaster.classification.code,
        lossDetailCls: data.lossCause.lossMaster.lossCls.code,
        lossItem: data.lossCause.lossMaster.classification.code,
        modelCode: data.plan.factoryPk
      });
    } catch (error) {
      console.error(error);
    }
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />
    },
    {
      value: `panel2`,
      heading: `Widget`,
      defaultExpanded: true,
      detail: (
        <List>
          <ListItem key="machineLossTime1" onClick={() => setWigetLossTime(true)}>
            <ListItemButton
              sx={{
                px: 1,
                height: 48,
                typography: 'body2',
                textTransform: 'capitalize',
                ...(widgetLossTime && {
                  color: 'text.primary',
                  fontWeight: 'fontWeightMedium',
                  bgcolor: 'action.selected'
                })
              }}
            >
              <ListItemText primary="Loss Time Record" />
            </ListItemButton>
          </ListItem>
          <ListItem key="machineLossTime2" onClick={() => setWigetLossTime(false)}>
            <ListItemButton
              sx={{
                px: 1,
                height: 48,
                typography: 'body2',
                textTransform: 'capitalize',
                ...(!widgetLossTime && {
                  color: 'text.primary',
                  fontWeight: 'fontWeightMedium',
                  bgcolor: 'action.selected'
                })
              }}
            >
              <ListItemText primary="Loss Time Report" />
            </ListItemButton>
          </ListItem>
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
              const _search = {
                ...searchParams,
                from: `${newValue}`
              };
              dispatch(setSearchParams(_search));
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
              const _search = {
                ...searchParams,
                to: `${newValue}`
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />

          <Dropdown
            id="lossType"
            name="lossType"
            label="Loss Type"
            sx={{ my: 1 }}
            defaultValue=""
            value={searchParams.lossType}
            onChange={handleChangeSearchConfig}
            options={[{ value: '', label: 'All' }, ...lossCommon]}
            size="small"
          />
          <Dropdown
            id="lossCls"
            name="lossCls"
            label="Loss Cls"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.processDropdown.filter((dd) => dd.line === searchParams.lineCode)}
            value={searchParams.lossCls}
            size="small"
          />

          <Dropdown
            id="lossDetailCls"
            name="lossDetailCls"
            label="Loss Detail Cls"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.processDropdown.filter((dd) => dd.line === searchParams.lineCode)}
            value={searchParams.lossDetailCls}
            size="small"
          />
          <TextField
            fullWidth
            id="model"
            name="model"
            label="Model"
            value={searchParams.model}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="lossPIC"
            name="lossPIC"
            label="Loss PIC"
            value={searchParams.lossPIC}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="prodApply"
            name="state"
            label="Prod .Apply"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={proApply}
            value={searchParams.state}
            size="small"
          />
        </>
      )
    }
  ];
  return (
    <Page title={getPageName(pageCode)}>
      <Container sx={{ px: `0px !important` }} maxWidth={false}>
        <Grid container spacing={0} sx={{ px: 0, minHeight: `calc(100vh - 254px)` }}>
          {!hideFilters && (
            <Grid item xs={12} md={2}>
              <Card sx={{ py: 1, px: 1, borderRadius: '0px', height: { md: `calc(100vh - 190px)` }, overflow: 'auto' }}>
                <Box sx={{ mb: 5 }}>
                  {ACCORDIONS.map((accordion, index) => (
                    <Accordion
                      key={accordion.value}
                      defaultExpanded={accordion.defaultExpanded}
                      sx={{ minHeight: `${3} !important` }}
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
                  {translate(`button.apply`)}
                </Button>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={hideFilters ? 12 : 10}>
            {widgetLossTime ? (
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
                            widgetCode={pageSelectedWidget?.widgetCode}
                            pageCode={pageCode}
                            funcType="CREATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickModify}
                            size="small"
                            label={translate(`button.modify`)}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedLossTimeId}
                            funcType="UPDATE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickSplit}
                            size="small"
                            label={translate(`button.split`)}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedLossTimeId}
                            funcType="EXECUTE"
                          />
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="contained"
                            onClick={onClickDelete}
                            size="small"
                            label={translate(`button.delete`)}
                            widgetCode={pageSelectedWidget?.widgetCode}
                            pageCode={pageCode}
                            disabled={!selectedLossTimeId}
                            funcType="DELETE"
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
                    pagination
                    className={themeAgGridClass}
                    onGridReady={onGridReady}
                    onRowDoubleClicked={handleRowDoubleClick}
                    onSelectionChanged={onSelectionChanged}
                    rowSelection="single"
                    width="100%"
                    height="100%"
                  />
                </Card>
                <DialogDragable
                  title={`${
                    (action === 'View' && translate(`typo.view`)) ||
                    (action === 'Add' && translate(`typo.register`)) ||
                    action
                  } Loss`}
                  maxWidth="lg"
                  open={isOpenActionModal}
                  onClose={handleCloseModal}
                >
                  <ProductionLossTimeRegistrationForm
                    currentData={currentLossTime}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadDataLossTime}
                    isOpenActionModal={isOpenActionModal}
                    action={action}
                    isEdit={isEdit}
                    isView={isView}
                  />
                </DialogDragable>
                <DialogDragable
                  title={`${action} Loss`}
                  maxWidth="lg"
                  open={isOpenSplitModal}
                  onClose={handleCloseSplitModal}
                >
                  <ProductionLossTimeSplit
                    currentData={currentLossTime}
                    onCancel={handleCloseSplitModal}
                    onLoadData={onLoadDataLossTime}
                    action={action}
                    isOpenActionModal={isOpenSplitModal}
                  />
                </DialogDragable>
                <DialogDragable
                  title={translate(`typo.delete`)}
                  maxWidth="sm"
                  open={isOpenDeleteModal}
                  onClose={handleCloseDeleteModal}
                >
                  <Typography variant="subtitle1" align="center">
                    {translate(`typo.are_you_sure_to_delete`)}
                  </Typography>
                  <DialogActions>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                      {translate(`button.no`)}
                    </Button>
                    <LoadingButton
                      type="button"
                      variant="contained"
                      onClick={handleDeleteLossTime}
                      loading={isSubmitting}
                    >
                      {translate(`button.delete`)}
                    </LoadingButton>
                  </DialogActions>
                </DialogDragable>
              </>
            ) : (
              <LossTimeReportChart pageCode={pageCode} data={dataChart} activeLast />
            )}
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
