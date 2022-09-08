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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Tooltip,
  IconButton
} from '@material-ui/core';
import ReactDOMServer from 'react-dom/server';
import { makeStyles } from '@material-ui/styles';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { isEmpty, isUndefined, get } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import ApprovalCreate from '../approval/ApprovalCreate';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSearchParams, resetSearchParams } from '../../redux/slices/planBomMappingManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { isNullVal } from '../../utils/formatString';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import PlanBomMappingRegistration from './PlanBomMappingRegistration';

const pageCode = 'menu.production.productionManagement.foolProofManagement.verfication.planBomMapping';
const tableCode = 'planBomMappingList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function PlanBomMappingList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.planBomMappingManagement);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState([]);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentCycleTime, setCurrentCycleTime] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCycleTimeId, setSelectedCycleTimeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
  const [gridApi, setGridApi] = useState(null);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const { selectedWidget } = useSelector((state) => state.page);
  const [columns, setColumns] = useState(null);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [isAllowSubmit, setIsAllowSubmit] = useState(false);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [openCompose, setOpenCompose] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [submissionRows, setSubmissionRows] = useState([]);
  const [submissionIds, setSubmissionIds] = useState([]);
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [action, setAction] = useState('');
  const [currentPlan, setCurrentPlan] = useState([]);
  const [currentDataSubmit, setCurrentDataSubmit] = useState([]);
  const [planBomRequestParameters, setPlanBomRequestParameters] = useState([]);

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
    // tableConfigs.forEach((column) => {
    //   column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    // });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      // tableConfigs.forEach((column) => {
      //   column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      // });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(() => {
    dispatch(getMaterialDropdown());
    dispatch(getBizPartnerCodeDropdown());
  }, [dispatch]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
      setIsAllowEdit(false);
      setIsAllowSubmit(false);

      setSubmissionRows([]);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data;

      let isAllowSubmit = false;
      setSelectedRowId(selectedId);
      setIsAllowEdit(true);
      setSubmissionRows([event.api.getSelectedNodes()[0].data]);
      if (selectedId.bomStatus === 'SAVED' || selectedId.bomStatus === 'REJECTED') {
        isAllowSubmit = true;
        query({
          url: '/v1/po-bom/search',
          featureCode: 'user.create',
          params: {
            planPks: selectedId.productionOrder.factoryPk,
            bomStatus: selectedId.bomStatus
          }
        })
          .then((res) => {
            const data = res.data.map((e) => ({
              ...e,
              supplier: bizPartnerCodeDropdown.find((el) => el.value === e.supplier)?.label
            }));
            setCurrentDataSubmit(data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      setIsAllowSubmit(isAllowSubmit);
      query({
        url: '/v1/po-bom/search',
        featureCode: 'user.create',
        params: {
          planPks: selectedId.productionOrder.factoryPk
        }
      })
        .then((res) => {
          setCurrentPlan(res.data);
        })
        .catch((error) => {
          console.error(error);
        });

      // const { approvalStatus, grStatus, planId } = event.api.getSelectedNodes()[0].data;
      // let isAllowEdit = false;
      // let isAllowTeco = false;
      // let isAllowSubmit = false;
      // if ((approvalStatus?.code === 'D018001' || approvalStatus?.code === 'D018004' ) && grStatus.code === 'D019001') {
      //   isAllowEdit = true;
      //   isAllowSubmit = true;
      // }
      // setIsAllowSubmit(isAllowSubmit);
      // setIsAllowEdit(isAllowEdit);
      // if (approvalStatus?.code !== 'D018002' && (grStatus.code === 'D019001' || grStatus.code === 'D019002')) {
      //   isAllowTeco = true;
      // }
      // setIsAllowTeco(isAllowTeco);
      // setCurrentPlanId(planId);
    } else {
      // setIsAllowEdit(false);
      // setIsAllowSubmit(true);
      setIsAllowEdit(false);
      const _submissionRows = event.api.getSelectedNodes().map((row) => row.data);
      // .filter((row) => (row.approvalStatus.code === 'D018001' || row.approvalStatus.code === 'D018004') && row.grStatus.code === 'D019001');
      setSubmissionRows(_submissionRows);
    }
  };

  const getDocumentRequestTypeEnum = () => DocumentRequestTypeEnum.PLAN_BOM;

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
  };

  const onLoadData = () => {
    const params = {
      from: fDate(searchParams.from),
      to: fDate(searchParams.to),
      po: searchParams.poNo,
      parentMaterial: searchParams.parentMaterialCode,
      childMaterial: searchParams.childMaterialCode,
      validFrom: fDate(searchParams.validFrom),
      validTo: fDate(searchParams.validTo),
      bomStatus: searchParams.status,
      planId: searchParams.planId,
      state: searchParams.state
    };
    parseOrgSearchAll(params, parseSelectedTree);
    try {
      setGridDataSource(gridApi, '/v1/po-bom/search-v2', params);
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };
  const onClickModify = () => {
    setAction('Edit');
    handleOpenModal();
    // if (!selectedCycleTimeId) {
    //   enqueueSnackbar(translate(`message.please_select_1_cycle_time`), {
    //     variant: 'warning',
    //     action: (key) => (
    //       <MIconButton size="small" onClick={() => closeSnackbar(key)}>
    //         <Icon icon={closeFill} />
    //       </MIconButton>
    //     )
    //   });
    // } else {
    //   setIsEdit(true);
    //   handleOpenModal();
    // }
    // setIsEdit(true);
    // handleOpenModal();
  };

  const onClickSubmit = async () => {
    // setIsAllowSubmit(true)
    // setAction('Submit')
    if (submissionRows.length === 0) {
      // selectGrPlanWarning();
    } else {
      let _submissionIds;
      if (!isEmpty(currentDataSubmit)) {
        _submissionIds = currentDataSubmit?.map((data) => data.factoryPk);
        // setSubmissionIds(_submissionIds);
      }
      const dataGenerated = generatePlanBomHtml(currentDataSubmit);
      const editorValue = ReactDOMServer.renderToStaticMarkup(dataGenerated);

      setApprovalEditor(editorValue);
      const requestParameters = _submissionIds?.map((id) => ({
        value: id,
        type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID
      }));
      setPlanBomRequestParameters(requestParameters);
      setOpenCompose(true);
    }
  };

  // const buildRequestParameters = () =>
  //   submissionIds.map((id) => ({
  //     value: id,
  //     type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
  //   }));

  // const generateHtml = async () => {

  //   if (!isEmpty(currentDataSubmit)) {
  //     const _submissionIds = currentDataSubmit?.map((data) => data.factoryPk);
  //     setSubmissionIds(_submissionIds);
  //   }
  //   const dataGenerated = generatePlanBomHtml(currentDataSubmit);
  //   return ReactDOMServer.renderToStaticMarkup(dataGenerated);
  // };

  const generatePlanBomHtml = (rows) => {
    if (!isEmpty(rows)) {
      return (
        <table key="bom-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>Factory</th>
              <th>PO NO</th>
              <th>Plan ID</th>
              <th>Plan Date</th>
              <th>Status</th>
              <th>Parent Code</th>
              <th>Parent Ver</th>
              <th>Child Code</th>
              <th>Child Ver</th>
              <th>Mat. Description</th>
              <th>Mat. Type</th>
              <th>Cal Type</th>
              <th>Plan Qty</th>
              <th>Stand. Qty</th>
              <th>Loss Qty</th>
              <th>Test Qty</th>
              <th>Valid From</th>
              <th>Mat. Group</th>
              <th>Material Spec.</th>
              <th>Dev. Status</th>
              <th>Supplier</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((data, idx) => (
              <tr key={data?.factoryPk}>
                <td>{data?.pk?.factoryName}</td>
                <td>{data?.productionOrder?.planDate}</td>
                <td>{data?.productionOrder?.prodOrderNo}</td>
                <td>{data?.productionOrder?.planId}</td>
                <td>{data?.bomStatus}</td>
                <td>{data?.parentCode?.code}</td>
                <td>{data?.parentVersion}</td>
                <td>{data?.childCode.code}</td>
                <td>{data?.childCode?.description}</td>
                <td>{data?.childCode?.materialType}</td>
                <td>{data?.calType}</td>
                <td>{data?.productionOrder?.planQty}</td>
                <td>{data?.standQty}</td>
                <td>{data?.poStandQty}</td>
                <td>{data?.poLossQty}</td>
                <td>{data?.testQty}</td>
                <td>{data?.validFrom}</td>
                <td>{data?.childCode?.materialGroup?.code}</td>
                <td>{data?.childCode?.materialGroup?.space}</td>
                <td>{data?.devStatus.name}</td>
                <td>{data?.supplier}</td>
                <td>{data?.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  const onSubmitPlanBomSuccess = async (planBomId) => {
    const submissionDto = submissionIds.map((id) => ({
      factoryPk: id,
      bomStatus: 'APPROVING',
      approval: {
        factoryPk: planBomId
      }
    }));
    await handleUpdateStatus(submissionDto);
  };

  const handleUpdateStatus = async (updateDto) => {
    await mutate({
      url: `/v1/po-bom/update`,
      data: {
        poBoms: updateDto
      },
      method: 'post',
      featureCode: 'user.create'
    }).catch((error) => {
      console.error(error);
    });
    onLoadData();
  };
  // const generatePlanBomHtml = async () =>
  //   ReactDOMServer.renderToStaticMarkup(
  //     <table key="bom-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
  //       <thead>
  //         <tr style={{ backgroundColor: 'yellowgreen' }}>
  //           <th>Factory</th>
  //           <th>PO NO</th>
  //           <th>Plan ID</th>
  //           <th>Plan Date</th>
  //           <th>Status</th>
  //           <th>Parent Code</th>
  //           <th>Parent Ver</th>
  //           <th>Child Code</th>
  //           <th>Child Ver</th>
  //           <th>Mat. Description</th>
  //           <th>Mat. Type</th>
  //           <th>Cal Type</th>
  //           <th>Plan Qty</th>
  //           <th>Stand. Qty</th>
  //           <th>Loss Qty</th>
  //           <th>Test Qty</th>
  //           <th>Valid From</th>
  //           <th>Mat. Group</th>
  //           <th>Material Spec.</th>
  //           <th>Dev. Status</th>
  //           <th>Supplier</th>
  //           <th>Remark</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {submissionRows.map((data) => (
  //           <tr key={data?.factoryPk}>
  //             <td>{data?.pk?.factoryName}</td>
  //             <td>{data?.poNo}</td>
  //             <td>{data?.planDate}</td>
  //             <td>{data?.planId}</td>
  //             <td>{data?.status}</td>
  //             <td>{data?.parentCode}</td>
  //             <td>{data?.parentVer}</td>
  //             <td>{data?.childVer}</td>
  //             <td>{data?.matDescription}</td>
  //             <td>{data?.matType}</td>
  //             <td>{data?.calType}</td>
  //             <td>{data?.planQty}</td>
  //             <td>{data?.standQty}</td>
  //             <td>{data?.planStandQty}</td>
  //             <td>{data?.planLossQty}</td>
  //             <td>{data?.testQty}</td>
  //             <td>{data?.validFrom}</td>
  //             <td>{data?.matGroup}</td>
  //             <td>{data?.materialSpec}</td>
  //             <td>{data?.devStatus}</td>
  //             <td>{data?.supplier}</td>
  //             <td>{data?.remark}</td>
  //             <td>{data?.use}</td>

  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   );

  const handleDeleteCycleTime = async () => {
    await mutate({
      url: `/v1/cycle-time/${selectedCycleTimeId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
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
          enqueueSnackbar(translate(`message.cycle_time_delete_success`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
        handleCloseDeleteModal();
        onLoadData();
      }
    });
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
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />,
      maxHeight: '35vh'
    },
    {
      value: `panel2`,
      heading: `Widget`,
      defaultExpanded: true,
      detail: (
        <List>
          <ListItem key="planBomMapping">
            <ListItemButton
              sx={{
                px: 1,
                height: 48,
                typography: 'body2',
                textTransform: 'capitalize',
                color: 'text.primary',
                fontWeight: 'fontWeightMedium',
                bgcolor: 'action.selected'
              }}
            >
              <ListItemText primary="Plan-BOM Mapping" />
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
          <TextField
            fullWidth
            id="poNo"
            name="poNo"
            label="PO No"
            value={searchParams.poNo}
            onChange={handleChangeSearchConfig}
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
            id="parentMaterialCode"
            name="parentMaterialCode"
            label="Parent Material Code"
            value={searchParams.parentMaterialCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="childMaterialCode"
            name="childMaterialCode"
            label="Child Material Code"
            value={searchParams.childMaterialCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <DthDatePicker
            name="from"
            label="From"
            value={searchParams.from}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                from: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="to"
            label="To"
            value={searchParams.to}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                to: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="validFrom"
            label="Valid From"
            value={searchParams.validFrom}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                validFrom: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            name="validTo"
            id="validTo"
            label="Valid To"
            value={searchParams.validTo}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                validTo: newValue
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <Dropdown
            id="status"
            name="status"
            label="Status"
            value={searchParams.status}
            onChange={handleChangeSearchConfig}
            groupId="D018000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="use"
            name="use"
            label="Use (Y/N)"
            value={searchParams.use}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'DELETED', label: 'N' }
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
                                {translate('button.clearFilter')}
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
                  {translate('button.apply')}
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
                          onClick={onClickModify}
                          size="small"
                          label={translate(`button.modify`)}
                          disabled={!isAllowEdit}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          pageCode={pageCode}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickSubmit}
                          size="small"
                          disabled={submissionRows.length === 0 || !isAllowSubmit}
                          label={translate(`button.submit`)}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          pageCode={pageCode}
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
                  rowData={rowData}
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
                title="Modify Plan-BOM Mapping"
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <PlanBomMappingRegistration
                  isEdit={isAllowEdit}
                  currentData={currentPlan}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                />
              </DialogDragable>
              <DialogDragable title="Delete" maxWidth="sm" open={isOpenDeleteModal} onClose={handleCloseDeleteModal}>
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_delete`)}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteCycleTime}>
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
          documentRequestType={getDocumentRequestTypeEnum()}
          requestParameters={planBomRequestParameters}
          isOpenCompose={openCompose}
          onCloseCompose={() => setOpenCompose(false)}
          defaultTitle="Approval Plan Bom"
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitPlanBomSuccess}
        />
      )}
    </Page>
  );
}
