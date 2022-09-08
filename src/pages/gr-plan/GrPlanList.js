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
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { UploadExcelFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { getBizPartnerCodeSingleDropdown } from '../../redux/slices/bizPartnerManagement';
import { resetSearchParams, setSearchParams } from '../../redux/slices/grPlanManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { getProductionOrderDropdown } from '../../redux/slices/productionOrderManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll, parseOrgSearchFactory } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// import ECNRegistrationForm from './ECNRegistrationForm';
import ApprovalCreate from '../approval/ApprovalCreate';
import GrPlanTeco from './GrPlanTeco';
import { generateProductionGrHtml, generatePurchaseGrHtml } from './helper';
import ProductionGRPlanRegistrationForm from './ProductionGRPlanRegistrationForm';
// ----------------------------------------------------------------------
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import PurchaseGRPlanRegistrationForm from './PurchaseGRPlanRegistrationForm';

// ----------------------------------------------------------------------

const pageCode = 'menu.production.planningManagement.productionPlanning.planning.grPlan';
const tablePurchaseGrPlan = 'purchaseGrPlanList';
const tableProductionGrPlan = 'productionGrPlanList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function GrPlanList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams } = useSelector((state) => state.grPlanManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
  const [modalAction, setModalAction] = useState('Register');
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [isAllowTeco, setIsAllowTeco] = useState(false);
  const [isAllowSubmit, setIsAllowSubmit] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [openCompose, setOpenCompose] = useState(false);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [submissionRows, setSubmissionRows] = useState([]);
  const [isRenderAllOrg, setRenderAllOrg] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);

  useEffect(() => {
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

  useEffect(() => {
    dispatch(getMaterialDropdown());
    dispatch(getBizPartnerCodeSingleDropdown());
    dispatch(getProductionOrderDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCode = pageSelectedWidget?.widgetName === 'Purchase G/R Plan' ? tablePurchaseGrPlan : tableProductionGrPlan;
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, pageSelectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode = pageSelectedWidget?.widgetName === 'Purchase G/R Plan' ? tablePurchaseGrPlan : tableProductionGrPlan;
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
  }, [pageSelectedWidget, gridApi]);

  const onSubmitApprovalSuccess = async (approvalId) => {
    onLoadData();
  };

  const getDocumentRequestTypeEnum = () =>
    pageSelectedWidget?.widgetName === 'Purchase G/R Plan'
      ? DocumentRequestTypeEnum.PURCHASE_GR_PLAN
      : DocumentRequestTypeEnum.PRODUCTION_GR_PLAN;

  const onSubmitGrPlan = async () => {
    if (submissionRows.length === 0) {
      selectGrPlanWarning();
    } else {
      const editorValue =
        pageSelectedWidget?.widgetName === 'Purchase G/R Plan'
          ? await generatePurchaseGrHtml(submissionRows)
          : await generateProductionGrHtml(submissionRows);
      setApprovalEditor(editorValue);
      const requestParameters = buildRequestParameters(submissionRows);
      setApprovalRequestParameters(requestParameters);
      setOpenCompose(true);
    }
  }

  const buildRequestParameters = (rows) =>
    rows.map((row) => ({
      type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
      value: row.factoryPk
    }));

  const onClickWidget = (widgetCode, widgetName) => {
    setRenderAllOrg(widgetName === 'Production G/R Plan');
    dispatch(
      setSelectedWidget(
        {
          ...selectedWidget,
          [pageCode]:
          {
            widgetCode,
            widgetName
          }
        }));
  };

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const handleChangeDateSearchConfig = (name, value) => {
    const _search = {
      ...searchParams,
      [name]: `${value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onInquiry = () => {
    onLoadData();
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

  const onLoadData = async () => {
    setSelectedRowId(null);
    let uri = '';
    const requestParams = {};
    switch (pageSelectedWidget?.widgetName) {
      case 'Purchase G/R Plan':
        uri = 'purchase';
        buildPurchaseRequestParams(requestParams);
        break;
      case 'Production G/R Plan':
        uri = 'production';
        buildProductionRequestParams(requestParams);
        break;
      default:
        break;
    }
    try {
      setGridDataSource(gridApi, `/v1/gr/${uri}/search-v2`, requestParams)
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  }

  const buildPurchaseRequestParams = (requestParams) => {
    requestParams.from = fDate(searchParams.planDateFrom);
    requestParams.to = fDate(searchParams.planDateTo);
    requestParams.appStatus = searchParams.appStatus;
    requestParams.grStatus = searchParams.grStatus;
    requestParams.grType = searchParams.grType;
    requestParams.planId = searchParams.planId;
    requestParams.grNo = searchParams.grNo;
    requestParams.materialCode = searchParams.materialCode;
    requestParams.materialName = searchParams.materialName;
    requestParams.supplier = searchParams.supplier;
    parseOrgSearchFactory(requestParams, parseSelectedTree);
  }

  const buildProductionRequestParams = (requestParams) => {
    requestParams.from = fDate(searchParams.planDateFrom);
    requestParams.to = fDate(searchParams.planDateTo);
    requestParams.appStatus = searchParams.appStatus;
    requestParams.grStatus = searchParams.grStatus;
    requestParams.grType = searchParams.grType;
    requestParams.planId = searchParams.planId;
    requestParams.grNo = searchParams.grNo;
    requestParams.materialCode = searchParams.materialCode;
    requestParams.materialName = searchParams.materialName;
    parseOrgSearchAll(requestParams, parseSelectedTree);
  }

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = (action) => {
    setOpenActionModal(true);
    setModalAction(action);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
      setIsAllowEdit(false);
      setIsAllowSubmit(false);
      setIsAllowTeco(false);
      setSubmissionRows([]);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedRowId(selectedId);
      setSubmissionRows([event.api.getSelectedNodes()[0].data]);
      const { approvalStatus, grStatus, planId } = event.api.getSelectedNodes()[0].data;
      let isAllowEdit = false;
      let isAllowTeco = false;
      let isAllowSubmit = false;
      if ((approvalStatus?.code === 'D018001' || approvalStatus?.code === 'D018004') && grStatus.code === 'D019001') {
        isAllowEdit = true;
        isAllowSubmit = true;
      }
      setIsAllowSubmit(isAllowSubmit);
      setIsAllowEdit(isAllowEdit);
      if (approvalStatus?.code !== 'D018002' && (grStatus.code === 'D019001' || grStatus.code === 'D019002')) {
        isAllowTeco = true;
      }
      setIsAllowTeco(isAllowTeco);
    } else {
      setIsAllowEdit(false);
      setIsAllowTeco(false);
      setIsAllowSubmit(true);
      const _submissionRows = event.api
        .getSelectedNodes()
        .map((row) => row.data)
        .filter((row) => (row.approvalStatus.code === 'D018001' || row.approvalStatus.code === 'D018004') && row.grStatus.code === 'D019001');
      setSubmissionRows(_submissionRows);
    }
  };

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal('Register');
  };

  const onClickUpload = () => {
    setIsEdit(false);
    handleOpenModal('Upload');
  };

  const selectGrPlanWarning = () => {
    enqueueSnackbar(translate(`message.please_select_1_G/R_plan`), {
      variant: 'warning',
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const onClickModify = () => {
    if (!selectedRowId) {
      selectGrPlanWarning();
    } else if (isAllowEdit) {
      setIsEdit(true);
      handleOpenModal('Modify');
    } else {
      enqueueSnackbar(`This ${pageSelectedWidget?.widgetName} is in Approving, can't modify`, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const onClickTeco = () => {
    if (!selectedRowId) {
      selectGrPlanWarning();
    } else {
      setIsEdit(true);
      handleOpenModal('TECO');
    }
  };

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const handleOpenInfoModal = () => {
    setIsOpenInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setIsOpenInfoModal(false);
  };
  
  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail:
        <OrganizationTree
          renderAll={isRenderAllOrg}
          parseSelected={handleParseSelectedTree}
        />,
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
            name="planDateFrom"
            label="Plan Date From"
            value={searchParams.planDateFrom}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('planDateFrom', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="planDateTo"
            label="Plan Date To"
            value={searchParams.planDateTo}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('planDateTo', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <Dropdown
            id="appStatus"
            name="appStatus"
            label="Appr. Status"
            value={searchParams.appStatus}
            onChange={handleChangeSearchConfig}
            groupId="D018000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="grStatus"
            name="grStatus"
            label="G/R Status"
            value={searchParams.grStatus}
            onChange={handleChangeSearchConfig}
            groupId="D019000"
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            id="planId"
            name="planId"
            label="G/R Plan ID"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.planId}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <TextField
            id="grNo"
            name="grNo"
            label="G/R No"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.grNo}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <TextField
            id="materialCode"
            name="materialCode"
            label="Material Code"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.materialCode}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <TextField
            id="materialName"
            name="materialName"
            label="Material ID"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.materialName}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          {pageSelectedWidget?.widgetName === 'Purchase G/R Plan' && (
            <TextField
              id="supplier"
              name="supplier"
              label="Supplier"
              sx={{ my: 1 }}
              fullWidth
              value={searchParams.supplier}
              onChange={handleChangeSearchConfig}
              size="small"
            />
          )}
          {pageSelectedWidget?.widgetName === 'Production G/R Plan' && (
            <Dropdown
              id="grType"
              name="grType"
              label="G/R Type"
              value={searchParams.grType}
              onChange={handleChangeSearchConfig}
              groupId="D020000"
              sx={{ my: 1 }}
              size="small"
            />
          )}
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
    const tableCode = pageSelectedWidget?.widgetName === 'Purchase G/R Plan' ? tablePurchaseGrPlan : tableProductionGrPlan;
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

  const onCreateGrSuccess = (createdPlanId) => {
    setCreatedPlanId(createdPlanId);
    handleOpenInfoModal(true);
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
                          onClick={onClickUpload}
                          size="small"
                          label="Upload"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onSubmitGrPlan}
                          size="small"
                          disabled={submissionRows.length === 0 || !isAllowSubmit}
                          label="Submit"
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
                          disabled={!selectedRowId || !isAllowEdit}
                          label="Modify"
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickTeco}
                          size="small"
                          disabled={!selectedRowId || !isAllowTeco}
                          label="TECO"
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
                  columns={columns}
                  pagination
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="multiple"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${pageSelectedWidget?.widgetName} ${modalAction}`}
                maxWidth={['TECO', 'Upload'].includes(modalAction) ? 'sm' : 'lg'}
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                {(modalAction === 'Register' || modalAction === 'Modify') &&
                  pageSelectedWidget?.widgetName === 'Purchase G/R Plan' && (
                    <PurchaseGRPlanRegistrationForm
                      isEdit={isEdit}
                      selectedGrId={selectedRowId}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                      pageCode={pageCode}
                      isOpenActionModal={isOpenActionModal}
                      onCreateGrSuccess={onCreateGrSuccess}
                    />
                  )}
                {modalAction === 'TECO' && (
                  <GrPlanTeco
                    widgetName={pageSelectedWidget?.widgetName}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    selectedGrId={selectedRowId}
                    isOpenActionModal={isOpenActionModal}
                  />
                )}
                {(modalAction === 'Register' || modalAction === 'Modify') &&
                  pageSelectedWidget?.widgetName === 'Production G/R Plan' && (
                    <ProductionGRPlanRegistrationForm
                      isEdit={isEdit}
                      selectedGrId={selectedRowId}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                      pageCode={pageCode}
                      isOpenActionModal={isOpenActionModal}
                      onCreateGrSuccess={onCreateGrSuccess}
                    />
                  )}
                {modalAction === 'Upload' && (
                  <UploadExcelFile
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    templateCode={
                      pageSelectedWidget?.widgetName === 'Production G/R Plan'
                        ? 'PRODUCTION_GR_TEMPLATE_1'
                        : 'PURCHASE_GR_TEMPLATE_1'
                    }
                  />
                )}
                {/* {
                                    selectedWidget.widgetName === 'Purchase G/R Plan' && <PurchaseGRPlanRegistrationForm isEdit={isEdit} selectedGrId={selectedRowId} onCancel={handleCloseModal} onLoadData={onLoadData} pageCode={pageCode} />
                                } */}
                {/* {
                                    selectedWidget.widgetName === 'Production G/R Plan' && <ECNRegistrationForm isEdit={isEdit} currentData={currentData} onCancel={handleCloseModal} onLoadData={onLoadData} />
                                } */}
              </DialogDragable>
              <DialogAnimate title={translate(`typo.information`)} maxWidth="sm" open={isOpenInfoModal} onClose={handleCloseInfoModal}>
                <Typography
                  variant="subtitle1"
                  align="center"
                >{`G/R Plan ID: ${createdPlanId} ${translate(`typo.was_created`)}.`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="contained" onClick={handleCloseInfoModal}>
                    {translate(`button.ok`)}
                  </Button>
                </DialogActions>
              </DialogAnimate>
            </>
          </Grid>
        </Grid>
      </Container>
      {submissionRows.length > 0 && (
        <ApprovalCreate
          documentRequestType={getDocumentRequestTypeEnum()}
          requestParameters={approvalRequestParameters}
          isOpenCompose={openCompose}
          onCloseCompose={() => setOpenCompose(false)}
          defaultTitle={`${moment().format('YYYY-MM-DD')} ${pageSelectedWidget?.widgetName} Approval`}
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitApprovalSuccess}
        />
      )}
    </Page>
  );
}
