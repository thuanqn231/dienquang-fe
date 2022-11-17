import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { LoadingButton } from '@material-ui/lab';
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
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
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
import { getApprovedBOMDropdown, getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { resetSearchParams, setSearchParams } from '../../redux/slices/productionOrderManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { fDate } from '../../utils/formatTime';
// utils
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import ApprovalCreate from '../approval/ApprovalCreate';
// ----------------------------------------------------------------------
import { generateProductionOrderHtml } from './helper';
import ProductionOrderDetail from './ProductionOrderDetail';
import ProductionOrderRegistrationForm from './ProductionOrderRegistrationForm';
import ProductionOrderTeco from './ProductionOrderTeco';

import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import ProductionOrderInputActualForm from './ProductionOrderInputActualForm';
import ProductionOrderInputDefectForm from './ProductionOrderInputDefectForm';

const pageCode = 'menu.production.planningManagement.productionPlanning.planning.productionOrder';
const tableCode = 'productionOrderList';
const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function ProductionOrderList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.productionOrderManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
  const [tilte, setTilte] = useState('');
  const [modalAction, setModalAction] = useState('Register');
  const [currentProductionOrder, setCurrentProductionOrder] = useState({});
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [isAllowSubmit, setIsAllowSubmit] = useState(false);
  const [isAllowTeco, setIsAllowTeco] = useState(false);
  const [selectedProductionOrderId, setSelectedProductionOrderId] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [openCompose, setOpenCompose] = useState(false);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [submissionRows, setSubmissionRows] = useState([]);
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);
  const [detailData, setDetailData] = useState({});
  const pageSelectedWidget = selectedWidget[pageCode];
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  useEffect(() => {
    dispatch(getMaterialDropdown());
    dispatch(getApprovedBOMDropdown());
  }, [dispatch]);

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

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
    onLoadData();
  };

  const onLoadData = () => {
    const params = {
      from: fDate(searchParams.fromDate),
      to: fDate(searchParams.toDate),
      prodStatus: searchParams.prodStatus,
      planId: searchParams.planId,
      poNo: searchParams.poNo,
      poType: searchParams.poType,
      modelCode: searchParams.modelCode,
      modelName: searchParams.modelName,
      factoryPks: parseSelectedTree.factoryIds
    };
    parseOrgSearchAll(params, parseSelectedTree);
    query({
      url: '/v1/productionOrder/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        setSelectedProductionOrderId(null);
        setCurrentProductionOrder(null);
        updateData(res.data);
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
    setModalAction(action);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedProductionOrderId(null);
      setCurrentProductionOrder(null);
      setIsAllowEdit(false);
      setIsAllowSubmit(false);
      setIsAllowTeco(false);
      setSubmissionRows([]);
    }
    if (rowCount === 1) {
      let isAllowEdit = false;
      let isAllowSubmit = false;
      const productionOrderId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSubmissionRows([event.api.getSelectedNodes()[0].data]);
      setSelectedProductionOrderId(productionOrderId);
      const { aprStatus, prodStatus } = event.api.getSelectedNodes()[0].data;
      if (prodStatus.code === 'D019001') {
        isAllowEdit = true;
        isAllowSubmit = true;
      }
      setIsAllowEdit(isAllowEdit);
      setIsAllowSubmit(isAllowSubmit);

      if (productionOrderId) {
        query({
          url: `/v1/productionOrder/${productionOrderId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentProductionOrder({
              factoryPk: data.factoryPk,
              factory: data.pk.factoryCode,
              planDate: data.planDate,
              // process: {
              //   code: data.process.code,
              //   name: data.process.name
              // },
              modelId: data.modelId,
              modelCode: data.modelCode,
              prodOrderNo: data.prodOrderNo,
              modelDescription: data.modelDescription,
              topModel: data.topModel,
              modelVersion: data.modelVersion,
              pk: data.pk,
              poType: {
                code: data.poType.code,
                name: data.poType.name
              },
              line: {
                factoryPk: data.line.factoryPk,
                code: data.line.code,
                name: data.line.name
              },
              operation: data.operation,
              startTime: data.startTime,
              endTime: data.endTime,
              tactTime: data.tactTime,
              planQty: data.planQty,
              actualQty: data.actualQty,
              planId: data.planId,
              state: data.state
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
      //
    } else {
      setIsAllowEdit(false);
      setIsAllowTeco(false);
      setIsAllowSubmit(true);
      const _submissionRows = event.api
        .getSelectedNodes()
        .map((row) => row.data)
        .filter(
          (row) =>
            (row.aprStatus.code === 'D018001' || row.aprStatus.code === 'D018004') && row.prodStatus.code === 'D019001'
        );
      setSubmissionRows(_submissionRows);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal('Register');
    setTilte('Plan ID');
  };

  const onClickInputActual = () => {
    setTilte('Actual Production Order');
    setIsEdit(false);
    handleOpenModal('InputActual');
  };

  const onCellClicked = async (gridApi) => {
    const productionOrderId = gridApi.data.factoryPk;
    if (gridApi.colDef.field === 'actualQty' && gridApi.value > 0) {
      setDetailData(gridApi.data);
      handleOpenModal('Detail Data');
      // await loadDetailData(productionOrderId);
    }
  };

  // const loadDetailData = async (productionOrderId) => {
  //   await query({
  //     url: `/v1/productionOrder/${productionOrderId}`,
  //     featureCode: 'user.create'
  //   })
  //     .then((res) => {
  //       const { data } = res;
  //       if (data?.actualQty !== 0) {
  //         setDetailData(data);

  //         handleOpenModal('Detail Data');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };

  const onSubmitApprovalSuccess = async (approvalId) => {
    onLoadData();
  };

  const onClickInputDefect = async () => {
    setTilte('Defect Production Order');
    setIsEdit(false);
    handleOpenModal('InputDefect');
  };

  const buildRequestParameters = (rows) =>
    rows.map((row) => ({
      type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
      value: row.factoryPk
    }));

  const selectProductionOrderWarning = () => {
    enqueueSnackbar(translate(`message.please_select_1_production_order`), {
      variant: 'warning',
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const onClickModify = () => {
    if (!selectedProductionOrderId) {
      selectProductionOrderWarning();
    } else {
      setIsEdit(true);
      handleOpenModal('Modify');
    }
  };

  const onClickTeco = () => {
    if (!selectedProductionOrderId) {
      selectProductionOrderWarning();
    } else {
      setIsEdit(true);
      handleOpenModal('TECO');
    }
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

  const handleDelete = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/productionOrder/${selectedProductionOrderId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          enqueueSnackbar(translate(`message.production_order_was_delected_successfully`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          handleCloseDeleteModal();
          onLoadData();
        }
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error);
      });
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
            name="fromDate"
            label="Plan Date From"
            value={searchParams.fromDate}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('fromDate', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="toDate"
            label="Plan Date To"
            value={searchParams.toDate}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('toDate', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />

          <Dropdown
            id="prodStatus"
            name="prodStatus"
            label="Production Status"
            value={searchParams.prodStatus}
            onChange={handleChangeSearchConfig}
            groupId="D019000"
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="planId"
            name="planId"
            label="Plan ID"
            value={searchParams.planId}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="poNo"
            name="poNo"
            label="PO No."
            value={searchParams.poNo}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="poType"
            name="poType"
            label="PO Type"
            value={searchParams.poType}
            onChange={handleChangeSearchConfig}
            groupId="D020000"
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
          <TextField
            fullWidth
            id="modelName"
            name="modelName"
            label="Model Description"
            value={searchParams.modelName}
            onChange={handleChangeSearchConfig}
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

  const onCreatePlanSuccess = (createdPlanId) => {
    setCreatedPlanId(createdPlanId);
    handleOpenInfoModal(true);
  };

  const handleOpenInfoModal = () => {
    setIsOpenInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setIsOpenInfoModal(false);
  };

  const onClickDelete = () => {
    if (!selectedProductionOrderId) {
      enqueueSnackbar(translate(`message.please_select_1_row`), {
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

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
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
                          onClick={onClickInputActual}
                          size="small"
                          label="Input Actual"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickInputDefect}
                          size="small"
                          label="Input Defect"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="EXECUTE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickAdd}
                          size="small"
                          label="Register"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickModify}
                          size="small"
                          label="Modify"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="UPDATE"
                          disabled={!selectedProductionOrderId || !isAllowEdit}
                        />

                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickDelete}
                          size="small"
                          label="Delete"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                          disabled={!selectedProductionOrderId || !isAllowEdit}
                        />
                        {/* <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickTeco}
                          size="small"
                          label="Delete"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                          disabled={!selectedProductionOrderId || !isAllowTeco}
                        /> */}

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
                  rowSelection="multiple"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`Production Order ${modalAction}`}
                maxWidth={['TECO'].includes(modalAction) ? 'sm' : 'lg'}
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                {(modalAction === 'Register' || modalAction === 'Modify') && (
                  <ProductionOrderRegistrationForm
                    isEdit={isEdit}
                    currentData={currentProductionOrder}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    pageCode={pageCode}
                    onCreatePlanSuccess={onCreatePlanSuccess}
                  />
                )}
                {modalAction === 'InputActual' && (
                  <ProductionOrderInputActualForm
                    isEdit={isEdit}
                    currentData={currentProductionOrder}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    pageCode={pageCode}
                    onCreatePlanSuccess={onCreatePlanSuccess}
                  />
                )}
                {modalAction === 'InputDefect' && (
                  <ProductionOrderInputDefectForm
                    isEdit={isEdit}
                    currentData={currentProductionOrder}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    pageCode={pageCode}
                    onCreatePlanSuccess={onCreatePlanSuccess}
                  />
                )}
                {modalAction === 'TECO' && (
                  <ProductionOrderTeco
                    isEdit={isEdit}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    currentData={currentProductionOrder}
                  />
                )}
                {modalAction === 'Detail Data' && (
                  <ProductionOrderDetail
                    pageCode={pageCode}
                    isEdit={isEdit}
                    onLoadData={onLoadData}
                    detailData={detailData}
                  />
                )}
              </DialogDragable>
              <DialogAnimate
                title={translate(`typo.information`)}
                maxWidth="sm"
                open={isOpenInfoModal}
                onClose={handleCloseInfoModal}
              >
                <Typography variant="subtitle1" align="center">{`${tilte}: ${createdPlanId} ${translate(
                  `typo.was_created`
                )}  ${translate(`typo.successfully`)}.`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="contained" onClick={handleCloseInfoModal}>
                    {translate(`button.ok`)}
                  </Button>
                </DialogActions>
              </DialogAnimate>
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
                  <LoadingButton type="button" variant="contained" onClick={handleDelete} loading={isSubmitting}>
                    {translate(`button.delete`)}
                  </LoadingButton>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
      {submissionRows.length > 0 && (
        <ApprovalCreate
          documentRequestType={DocumentRequestTypeEnum.PRODUCTION_ORDER}
          requestParameters={approvalRequestParameters}
          isOpenCompose={openCompose}
          onCloseCompose={() => setOpenCompose(false)}
          defaultTitle={`${moment().format('YYYY-MM-DD')} Approval for Production Order`}
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitApprovalSuccess}
        />
      )}
    </Page>
  );
}
