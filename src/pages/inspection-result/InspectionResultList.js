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
import { makeStyles } from '@material-ui/styles';
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
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { resetSearchParams, setSearchParams } from '../../redux/slices/inspectionResultManagement';
import { setSelectedWidget } from '../../redux/slices/page';
import { getUserDropdown } from '../../redux/slices/userManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getLocalDateTime, fDate } from '../../utils/formatTime';
// utils
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import GrEvaluatedForm from './GrEvaluatedForm';
// ----------------------------------------------------------------------
import InspectionHistory from './InspectionHistory';
import LabelEvaluatedForm from './LabelEvaluatedForm';
import { QcResultRenderer } from './CellRenderer';

const pageCode = 'menu.production.qualityControl.qualityManagement.inspection.inspectionResult';
const tableCode = 'inspectionResultList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function InspectionResultList() {
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { userDropdown } = useSelector((state) => state.userManagement);
  const { searchParams } = useSelector((state) => state.inspectionResultManagement);
  const classes = useStyles();
  const { user } = useAuth();
  const activeUser = userDropdown.filter((curUser) => curUser.id === user.id);
  const [isUpdate, setIsUpdate] = useState(false);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission } = useAuth();
  const { themeAgGridClass } = useSettings();
  const [currentUser, setCurrentUser] = useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [inspectionType, setInspectionType] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenInspectionHistory, setIsOpenInspectionHistory] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
  const [selectedInspectionResult, setSelectedInspectionResult] = useState(null);
  const [grEvaluatedData, setGrEvaluatedData] = useState(null);
  const [isAllowEvaluate, setIsAllowEvaluate] = useState(false);
  const [currentGrNo, setCurrentGrNo] = useState(null);
  const [currentPoNo, setCurrentPoNo] = useState(null);
  const [modalEvaluation, setModalEvaluation] = useState(null);
  const [currentProductionOrder, setCurrentProductionOrder] = useState({});

  const [inspectionHistoryData, setInspectionHistoryData] = useState([]);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [factories, setFactories] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });

  const [isOpenEvaluate, setIsOpenEvaluate] = useState(false);
  const [isOpenGrEvaluate, setIsOpenGrEvaluate] = useState(false);
  const [isOpenLabelEvaluate, setIsOpenLabelEvaluate] = useState(false);

  const [submissionRows, setSubmissionRows] = useState([]);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [goodReceiptPlan, setGoodReceiptPlan] = useState(null);
  const [goodReceptData, setGoodReceiptData] = useState([]);
  const [currentType, setCurrentType] = useState(null);

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
    if (!currentUser) {
      setCurrentUser(user.id);
      getEmployeeList(currentUser);
    }
    getEmployeeList(currentUser);
    onLoadData();
  }, [currentUser]);

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
    if (gridApi && gridColumnApi) {
      onLoadData();
    }
  }, [gridApi, gridColumnApi]);
  // useEffect(() => {
  //   const {
  //     organizationalChartProduction: { factoryPks }
  //   } = user;
  //   const factories = factoryPks.map((factory) => factory.factoryCode);
  //   setFactories(factories);
  // }, [user]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const onInquiry = () => {
    onLoadData();
  };

  const onCellClicked = async (gridApi) => {
    if (gridApi.column.colId === 'calculatedQcResult.description') {
      if (gridApi?.data?.pk?.factoryCode) {
        await onCheckInspectionHistory(gridApi.data);
        setIsOpenInspectionHistory(true);
      }
    }
  };
  const getEmployeeList = (id) => {
    dispatch(getUserDropdown(id));
  };

  const onCheckInspectionHistory = (data) => {
    query({
      url: `/v1/inspection/detail?goodReceiptPlanPk=${data?.goodReceiptPlan?.factoryPk}`,
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          const { data } = res;

          setInspectionHistoryData(data);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleChangeDateSearchConfig = (name, value) => {
    const _search = {
      ...searchParams,
      [name]: `${value}`
    };

    dispatch(setSearchParams(_search));
  };

  const handleCloseInspectionHistory = () => {
    setIsOpenInspectionHistory(false);
  };

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
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

  const onLoadData = () => {
    const params = {
      from: fDate(searchParams.from),
      to: fDate(searchParams.to),
      type: searchParams.type === 'All' ? '' : searchParams.type,
      grNo: searchParams.grNo,
      qcResult: searchParams.qcResult,
      materialCode: searchParams.materialCode,
      materialName: searchParams.materialName,
      grType: searchParams.grType,
      poNo: searchParams.order,
      approvalStatus: searchParams.approvalStatus
    };
    parseOrgSearchAll(params, parseSelectedTree);
    query({
      url: '/v1/inspection/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        const { data } = res;
        const newData = data.map((row) => ({
          ...row,
          status: row.teco ? 'Deleted' : 'Planned',
          ballanceQty: row.goodReceiptPlan.planQty - row.qty
        }));
        updateData(newData);
        setModalEvaluation('');
        setGrEvaluatedData([]);
        setIsAllowEvaluate(false);
        setCurrentGrNo(null);
        setCurrentPoNo(null);
        setCurrentType(null);
        setInspectionHistoryData([]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);

    onLoadData();
  };

  const handleOpenModal = (action) => {
    setOpenActionModal(true);
    setModalEvaluation(action);
  };

  const onSelectionChanged = async (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedInspectionResult(null);
      setIsOpenInspectionHistory(false);
      setInspectionType(null);

      setIsAllowEvaluate(false);
      setCurrentGrNo(null);
      setCurrentPoNo(null);
    } else if (rowCount === 1) {
      const selectedRowData = event.api.getSelectedNodes()[0]?.data;

      if (
        selectedRowData?.qcResult?.code === 'D024002' ||
        (selectedRowData?.action?.code === 'D047001' && selectedRowData?.approvalStatus?.code !== 'D018004') ||
        selectedRowData.action?.code === 'D047002'
      ) {
        setIsAllowEvaluate(false);
        return;
      }

      const status = selectedRowData?.status;
      const curFactory = selectedRowData?.goodReceiptPlan?.pk.factoryCode;
      const curPk = selectedRowData?.goodReceiptPlan?.pk.id;

      setGoodReceiptPlan(`${curFactory}-${curPk}`);
      const inspectionType = event.api.getSelectedNodes()[0].data.type;
      setInspectionType(inspectionType);

      setIsOpenInspectionHistory(false);
      setCurrentGrNo(event.api.getSelectedNodes()[0].data.grNo);
      setCurrentPoNo(event.api.getSelectedNodes()[0].data.po);

      await query({
        url: `/v1/inspection/detail?goodReceiptPlanPk=${curFactory}-${curPk}`,
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          const { data } = res;

          setIsAllowEvaluate(true);

          setGoodReceiptData(data);
        }
      });
    }
  };
  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };
  const onClickOpenGrEvaluation = async () => {
    await transferGrEvaluationData();
    setIsOpenEvaluate(true);
    setIsOpenGrEvaluate(true);
    setIsOpenLabelEvaluate(false);

    handleOpenModal('G/R No');
  };

  const transferGrEvaluationData = async () => {
    let _data = null;

    query({
      url: `/v1/inspection/check-goodReceiptPlan?goodReceiptPlanPk=${goodReceiptPlan}`,
      featureCode: 'user.create'
    })
      .then((res) => {
        _data = res.data;

        setGrEvaluatedData(_data);
        if (_data?.factoryPk != null) {
          setCurrentType('update');
        } else {
          setCurrentType('create');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onClickOpenLabelEvaluation = () => {
    handleOpenModal('Label');
    setIsOpenGrEvaluate(false);
    setIsOpenLabelEvaluate(true);
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

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `${translate(`heading.organization`)}`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />
    },
    {
      value: `panel2`,
      heading: `${translate(`heading.widget`)}`,
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
                  onClick={() => {
                    onClickWidget(element.code, element.name);
                  }}
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
      heading: `${translate(`heading.search`)}`,
      defaultExpanded: true,
      isClearFilter: true,
      detail: (
        <>
          <Dropdown
            id="type"
            name="type"
            label="Type"
            value={searchParams.type}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'All', label: `${translate(`label.all`)}` },
              { value: 'Purchase G/R', label: `${translate(`label.purchaseGr`)}` },
              { value: 'Production G/R', label: `${translate(`label.productionGr`)}` }
            ]}
            sx={{ my: 1 }}
            size="small"
          />
          <DthDatePicker
            name="from"
            label={translate(`label.plan_date_from`)}
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
            label={translate(`label.plan_date_to`)}
            value={searchParams.to}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('to', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <TextField
            fullWidth
            id="grNo"
            name="grNo"
            label={translate(`label.grNo`)}
            value={searchParams.grNo}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="order"
            name="order"
            label={translate(`label.poNo`)}
            value={searchParams.order}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="qcResult"
            name="qcResult"
            label={translate(`label.qcResult`)}
            value={searchParams.qcResult}
            onChange={handleChangeSearchConfig}
            groupId="D024000"
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="materialCode"
            name="materialCode"
            label={translate(`label.materialCode`)}
            value={searchParams.materialCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="materialName"
            name="materialName"
            label={translate(`label.materialName`)}
            value={searchParams.materialName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="approvalStatus"
            name="approvalStatus"
            label={translate(`label.approvalStatus`)}
            value={searchParams.approvalStatus}
            onChange={handleChangeSearchConfig}
            groupId="D018000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="grType"
            name="grType"
            label={translate(`label.grType`)}
            value={searchParams.grType}
            onChange={handleChangeSearchConfig}
            groupId="D020000"
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
                          onClick={() => {
                            onClickOpenGrEvaluation();
                          }}
                          size="small"
                          label={translate(`typo.evaluation_by_gr_no`)}
                          disabled={!isAllowEvaluate}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickOpenLabelEvaluation}
                          size="small"
                          label={translate(`typo.evaluation_by_label`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
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
                  display: 'row',
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: `calc((80vh - 100px))` }
                }}
              >
                <AgGrid
                  columns={columns}
                  rowData={rowData}
                  className={themeAgGridClass}
                  onCellClicked={onCellClicked}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${translate(`typo.evaluation_by`)}  ${modalEvaluation}`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                {modalEvaluation === 'G/R No' ? (
                  <GrEvaluatedForm
                    currentData={currentProductionOrder}
                    isOpenEvaluate={isOpenEvaluate}
                    modalEvaluation={modalEvaluation}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    pageCode={pageCode}
                    currentType={currentType}
                    grEvaluatedData={grEvaluatedData}
                    inspectionType={inspectionType}
                    selectedInspectionResult={selectedInspectionResult}
                    isOpenActionModal={isOpenActionModal}
                  />
                ) : (
                  <LabelEvaluatedForm
                    currentData={currentProductionOrder}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    pageCode={pageCode}
                    isOpenActionModal={isOpenLabelEvaluate}
                  />
                )}
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.inspection_history`)}
                maxWidth="xl"
                open={isOpenInspectionHistory}
                onClose={handleCloseInspectionHistory}
              >
                <InspectionHistory
                  pageCode={pageCode}
                  isOpenActionModal={isOpenInspectionHistory}
                  onCancel={handleCloseInspectionHistory}
                  inspectionHistoryData={inspectionHistoryData}
                />
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
