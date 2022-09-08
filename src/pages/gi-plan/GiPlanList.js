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
import { resetSearchParams, setSearchParams } from '../../redux/slices/giPlanManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { getProductionOrderDropdown } from '../../redux/slices/productionOrderManagement';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { fDate } from '../../utils/formatTime';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { getGridConfig, getPageName, parseOrgSearchAll, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';

import { getBizPartnerCodeSingleDropdown } from '../../redux/slices/bizPartnerManagement';
import ApprovalCreate from '../approval/ApprovalCreate';
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import GiPlanTeco from './GiPlanTeco';
import { generateProductionGiHtml, generateShippingGiHtml } from './helper';
import ProductionGiPlanRegistrationForm from './ProductionGiPlanRegistrationForm';
import ShippingGiPlanRegistrationForm from './ShippingGiPlanRegistrationForm';
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const pageCode = 'menu.production.planningManagement.productionPlanning.planning.giPlan';
const tableShippingGiPlan = 'shippingGiPlanList';
const tableProductionGiPlan = 'productionGiPlanList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function GiPlanList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams } = useSelector((state) => state.giPlanManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const [selectedPlanningId, setSelectedPlanningId] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false);
  const [modalAction, setModalAction] = useState('Register');
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [isAllowSubmit, setIsAllowSubmit] = useState(false);
  const [isAllowTeco, setIsAllowTeco] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [openCompose, setOpenCompose] = useState(false);
  const [submissionRows, setSubmissionRows] = useState([]);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [isRenderAllOrg, setRenderAllOrg] = useState(true);
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
    dispatch(getProductionOrderDropdown());
    dispatch(getMaterialDropdown());
    dispatch(getBizPartnerCodeSingleDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCode =
        pageSelectedWidget?.widgetName === 'Production G/I Plan' ? tableProductionGiPlan : tableShippingGiPlan;
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode =
        pageSelectedWidget?.widgetName === 'Production G/I Plan' ? tableProductionGiPlan : tableShippingGiPlan;
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

  const onSubmitGiPlan = async () => {
    if (submissionRows.length === 0) {
      selectGiPlanWarning();
    } else {
      const editorValue =
        pageSelectedWidget?.widgetName === 'Shipping G/I Plan'
          ? await generateShippingGiHtml(submissionRows)
          : await generateProductionGiHtml(submissionRows);

      setApprovalEditor(editorValue);
      const requestParameters = buildRequestParameters(submissionRows);
      setApprovalRequestParameters(requestParameters);
      setOpenCompose(true);
    }
  };

  const buildRequestParameters = (rows) =>
    rows.map((row) => ({
      type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
      value: row.factoryPk
    }));

  const getDocumentRequestTypeEnum = () =>
    pageSelectedWidget?.widgetName === 'Shipping G/I Plan'
      ? DocumentRequestTypeEnum.SHIPPING_GI_PLAN
      : DocumentRequestTypeEnum.PRODUCTION_GI_PLAN;

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

  const onClickWidget = (widgetCode, widgetName) => {
    setRenderAllOrg(widgetName === 'Production G/I Plan');
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
      case 'Shipping G/I Plan':
        uri = 'shipping';
        buildShippingRequestParams(requestParams);
        break;
      case 'Production G/I Plan':
        uri = 'production';
        buildProductionRequestParams(requestParams);
        break;
      default:
        break;
    }
    try {
      setGridDataSource(gridApi, `/v1/gi/${uri}/search-v2`, requestParams)
    } catch (error) {
      console.error(error);
    }
  };

  const buildShippingRequestParams = (requestParams) => {
    requestParams.from = fDate(searchParams.planDateFrom);
    requestParams.to = fDate(searchParams.planDateTo);
    requestParams.appStatus = searchParams.appStatus;
    requestParams.giStatus = searchParams.giStatus;
    requestParams.giType = searchParams.giType;
    requestParams.giNo = searchParams.giNo;
    requestParams.soNo = searchParams.soNo;
    requestParams.materialCode = searchParams.materialCode;
    requestParams.materialName = searchParams.materialName;
    requestParams.supplier = searchParams.supplier;
    parseOrgSearchFactory(requestParams, parseSelectedTree);
  }

  const buildProductionRequestParams = (requestParams) => {
    requestParams.from = fDate(searchParams.planDateFrom);
    requestParams.to = fDate(searchParams.planDateTo);
    requestParams.appStatus = searchParams.appStatus;
    requestParams.giStatus = searchParams.giStatus;
    requestParams.giType = searchParams.giType;
    requestParams.planId = searchParams.planId;
    requestParams.giNo = searchParams.giNo;
    requestParams.poNo = searchParams.poNo;
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
      setIsAllowTeco(false);
      setIsAllowSubmit(false);
      setCurrentPlanId(null);
    }
    if (rowCount === 1) {
      let isAllowEdit = false;
      let isAllowTeco = false;
      let isAllowSubmit = false;
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;

      setSubmissionRows([event.api.getSelectedNodes()[0].data]);
      setSelectedRowId(selectedId);

      setSelectedPlanningId(selectedId);
      const { approvalStatus, giStatus, planId } = event.api.getSelectedNodes()[0].data;

      if ((approvalStatus?.code === 'D018001' || approvalStatus?.code === 'D018004') && giStatus.code === 'D019001') {
        isAllowEdit = true;
        isAllowSubmit = true;
      }
      setIsAllowEdit(isAllowEdit);
      setIsAllowSubmit(isAllowSubmit);
      if (giStatus.code === 'D019001' || giStatus.code === 'D019002') {
        isAllowTeco = true;
      }
      setIsAllowTeco(isAllowTeco);
      setCurrentPlanId(planId);
    } else {
      setIsAllowEdit(false);
      setIsAllowTeco(false);
      setIsAllowEdit(false);
      setIsAllowSubmit(true);
      const _submissionRows = event.api
        .getSelectedNodes()
        .map((row) => row.data)
        .filter((row) => (row.approvalStatus.code === 'D018001' || row.approvalStatus.code === 'D018004') && row.giStatus.code === 'D019001');
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

  const selectGiPlanWarning = () => {
    enqueueSnackbar(translate(`message.please_select_1_G/I_plan`), {
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
      selectGiPlanWarning();
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
      selectGiPlanWarning();
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
      detail: <OrganizationTree renderAll={isRenderAllOrg} parseSelected={handleParseSelectedTree} />,
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
            id="giStatus"
            name="giStatus"
            label="G/I Status"
            value={searchParams.giStatus}
            onChange={handleChangeSearchConfig}
            groupId="D019000"
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            id="planId"
            name="planId"
            label="G/I Plan ID"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.planId}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          {pageSelectedWidget?.widgetName === 'Shipping G/I Plan' ? (
            <TextField
              id="soNo"
              name="soNo"
              label="SO No."
              sx={{ my: 1 }}
              fullWidth
              value={searchParams.soNo}
              onChange={handleChangeSearchConfig}
              size="small"
            />
          ) : (
            <TextField
              id="poNo"
              name="poNo"
              label="PO No."
              sx={{ my: 1 }}
              fullWidth
              value={searchParams.poNo}
              onChange={handleChangeSearchConfig}
              size="small"
            />
          )}

          <TextField
            id="giNo"
            name="giNo"
            label="G/I No"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.giNo}
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

          <Dropdown
            id="giType"
            name="giType"
            label="G/I Type"
            value={searchParams.giType}
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
    const tableCode = pageSelectedWidget?.widgetName === 'Production G/I Plan' ? tableProductionGiPlan : tableShippingGiPlan;
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

  const onCreateGiSuccess = (createdPlanId) => {
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
                          onClick={onSubmitGiPlan}
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
                  pagination
                  columns={columns}
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
                {modalAction === 'TECO' && (
                  <GiPlanTeco
                    widgetName={pageSelectedWidget?.widgetName}
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    selectedGiId={selectedRowId}
                    isOpenActionModal={isOpenActionModal}
                  />
                )}
                {(modalAction === 'Register' || modalAction === 'Modify') &&
                  pageSelectedWidget?.widgetName === 'Production G/I Plan' && (
                    <ProductionGiPlanRegistrationForm
                      isEdit={isEdit}
                      selectedGiId={selectedRowId}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                      pageCode={pageCode}
                      isOpenActionModal={isOpenActionModal}
                      onCreateGiSuccess={onCreateGiSuccess}
                    />
                  )}

                {(modalAction === 'Register' || modalAction === 'Modify') &&
                  pageSelectedWidget?.widgetName === 'Shipping G/I Plan' && (
                    <ShippingGiPlanRegistrationForm
                      isEdit={isEdit}
                      selectedGiId={selectedRowId}
                      onCancel={handleCloseModal}
                      onLoadData={onLoadData}
                      pageCode={pageCode}
                      isOpenActionModal={isOpenActionModal}
                      onCreateGiSuccess={onCreateGiSuccess}
                    />
                  )}
                {modalAction === 'Upload' && (
                  <UploadExcelFile
                    onCancel={handleCloseModal}
                    onLoadData={onLoadData}
                    templateCode={
                      pageSelectedWidget?.widgetName === 'Production G/I Plan'
                        ? 'PRODUCTION_GR_TEMPLATE_1'
                        : 'PURCHASE_GR_TEMPLATE_1'
                    }
                  />
                )}
              </DialogDragable>
              <DialogAnimate title={translate(`typo.information`)} maxWidth="sm" open={isOpenInfoModal} onClose={handleCloseInfoModal}>
                <Typography
                  variant="subtitle1"
                  align="center"
                >{`G/I Plan ID: ${createdPlanId} ${translate(`typo.was_created`)}.`}</Typography>
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
          defaultTitle={`${pageSelectedWidget?.widgetName} Approval for Purchase G/I Plan ${currentPlanId}`}
          defaultEditor={approvalEditor}
        />
      )}
    </Page>
  );
}
