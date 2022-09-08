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
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { isEmpty } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
import { getAllEquipmentId, getEquipmentIdDropdown } from '../../redux/slices/equipmentIDManagement';
import { setSelectedWidget } from '../../redux/slices/page';
import { resetSearchParams, setSearchParams } from '../../redux/slices/pmPlanningManagement';

// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';

// ----------------------------------------------------------------------
import MaintenanceRegistrationForm from './MaintenancePlanRegistrationForm';

const pageCode = 'menu.production.resourceManagement.maintenanceManagement.preventiveMaintenance.pmPlanning';
const tableCode = 'pmPlanningList';
const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function PmPlanningList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const [isView, setView] = useState(false);
  const { funcPermission, userGridConfig, updateAgGridConfig } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams } = useSelector((state) => state.pmPlanningManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);

  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [selectedPLanningId, setSelectedPlanningId] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [currentPmPlanning, setCurrentPmPlanning] = useState({});
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState();
  const [isSubmitting, setSubmitting] = useState(false);

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
    dispatch(getAllEquipmentId());
    dispatch(getEquipmentIdDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (gridApi) {
      onLoadData();
    }
  }, [gridApi]);

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const onCellClicked = (gridApi) => {
    if (gridApi.column.colId === 'planId') {
      setView(true);
      setIsEdit(false);
      setOpenActionModal(true);
    }
  };

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
          enqueueSnackbar(translate(`message.update_grid_successful`), {
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
  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

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
  const handleCloseModal = () => {
    setOpenActionModal(false);
  };
  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };
  const onClickAdd = () => {
    dispatch(getEquipmentIdDropdown());
    setIsEdit(false);
    setView(false);
    handleOpenModal();
  };
  const onClickModify = () => {
    if (!selectedPLanningId) {
      enqueueSnackbar(translate(`message.please_select_1_plan`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      query({
        url: `/v1/pm-schedule/${selectedPLanningId}`,
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          dispatch(getEquipmentIdDropdown());
          const equipmentRowData = res?.data?.maintenanceEquipments?.map((row) => ({
            equipmentPart: row.equipmentID?.equipmentPart?.name,
            equipmentLine: row.equipmentID?.equipmentLine?.name,
            equipmentProcess: row.equipmentID?.equipmentProcess?.name?.name,
            equipmentWorkStation: row.equipmentID?.equipmentWorkStation?.name,
            code: row.equipmentID?.code,
            name: row.equipmentID?.name,
            equipmentSpec: row.equipmentID?.equipmentSpec || '',
            factoryPk: row.equipmentID.factoryPk
          }));
          const picRowData = res?.data?.maintenancePICs?.map((row) => ({
            departmentName: row.user.department.name,
            employeeId: row.user.userName,
            fullName: row.user.fullName,
            email: row.user.email,
            id: row.user.factoryPk
          }));
          const maintenanceEquipments = res.data?.maintenanceEquipments?.map((row) => ({
            equipmentID: {
              factoryPk: row.equipmentID.factoryPk
            }
          }));
          const maintenancePICs = res.data?.maintenancePICs?.map((row) => ({
            user: {
              factoryPk: row.user.factoryPk
            }
          }));
          setCurrentPmPlanning({
            factoryPk: selectedPLanningId,
            factory: res.data?.pk?.factoryCode,
            pmType: res.data?.pmType?.code,
            pmCycle: res.data?.pmCycle?.code,
            pmContent: res.data?.pmContent,
            pmStartDate: res.data?.pmStartDate,
            noticeBefore: res.data?.noticeBefore,
            noticeCycle: res.data?.noticeCycle.code,
            notice: res.data?.notice,
            equipmentRowData,
            picRowData,
            maintenanceEquipments,
            maintenancePICs
          });
        }
      });
      setView(false);
      setIsEdit(true);
      handleOpenModal();
    }
  };
  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };
  const onClickDelete = () => {
    if (!selectedPLanningId) {
      enqueueSnackbar(translate(`message.please_select_1_plan`), {
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

  const onClickWidget = (widgetCode, widgetName) => {
    dispatch(
      setSelectedWidget({
        pageCode,
        widgetCode,
        widgetName
      })
    );
  };
  const onInquiry = () => {
    onLoadData();
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
    setSelectedPlanningId(null);
    setIsAllowEdit(false);
    setSelectedPlanningId(null);
    const requestParams = {
      from: fDate(searchParams.from),
      to: fDate(searchParams.to),
      equipmentCode: searchParams.equipCode,
      equipmentIDCode: searchParams.equipIdCode,
      equipmentIDName: searchParams.equipIdName,
      planID: searchParams.planId,
      state: searchParams.state
    };
    parseOrgSearchAll(requestParams, parseSelectedTree);
    try {
      setGridDataSource(gridApi, '/v1/pm-schedule/search-v2', requestParams);
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const handleDeletePmPlanning = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/pm-schedule/${selectedPLanningId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          enqueueSnackbar(translate(`message.pmPlanning_delete_successful`), {
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

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedPlanningId(null);
      setIsAllowEdit(false);
    }
    if (rowCount === 1) {
      const planningId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedPlanningId(planningId);
      setIsAllowEdit(true);
      setSelectedRowId(planningId);

      //
    }
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
      heading: `${translate(`heading.search`)}`,
      defaultExpanded: true,
      isClearFilter: true,
      detail: (
        <>
          <DthDatePicker
            id="from"
            name="from"
            label={translate(`label.start_date`)}
            value={searchParams.from}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('from', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <DthDatePicker
            id="to"
            name="to"
            label={translate(`label.end_date`)}
            value={searchParams.to}
            onChange={(newValue) => {
              handleChangeDateSearchConfig('to', newValue);
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <TextField
            id="equipCode"
            name="equipCode"
            label={translate(`label.equip_code`)}
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.equipCode}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <TextField
            id="equipIdCode"
            name="equipIdCode"
            label={translate(`label.equip_id_code`)}
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.equipIdCode}
            onChange={handleChangeSearchConfig}
            size="small"
          />

          <TextField
            id="equipIdName"
            name="equipIdName"
            label={translate(`label.equip_id_name`)}
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.equipIdName}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <TextField
            id="planId"
            name="planId"
            label={translate(`label.plan_id`)}
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.planId}
            onChange={handleChangeSearchConfig}
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
                          size="small"
                          label={translate(`button.register`)}
                          pageCode={pageCode}
                          onClick={onClickAdd}
                          widgetCode={selectedWidget.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          size="small"
                          disabled={!selectedRowId || !isAllowEdit}
                          label={translate(`button.modify`)}
                          pageCode={pageCode}
                          onClick={onClickModify}
                          widgetCode={selectedWidget.widgetCode}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          size="small"
                          onClick={onClickDelete}
                          disabled={!selectedRowId || !isAllowEdit}
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={selectedWidget.widgetCode}
                          funcType="DELETE"
                        />
                        {isChangedTableConfig && (
                          <DthButtonPermission
                            sx={{ marginLeft: 1 }}
                            variant="outlined"
                            onClick={onSaveTableConfig}
                            size="small"
                            label={translate(`button.saveConfig`)}
                            pageCode={pageCode}
                            widgetCode={selectedWidget?.widgetCode}
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
                  pagination
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
                title={
                  (isView && `${translate(`title.maintenance_plan_view`)}`) ||
                  (isEdit
                    ? `${translate(`title.maintenance_plan_modify`)}`
                    : `${translate(`title.maintenance_plan_register`)}`)
                }
                maxWidth="xl"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <MaintenanceRegistrationForm
                  isEdit={isEdit}
                  isView={isView}
                  currentData={currentPmPlanning}
                  pageCode={pageCode}
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
                  <LoadingButton
                    type="button"
                    variant="contained"
                    onClick={handleDeletePmPlanning}
                    loading={isSubmitting}
                  >
                    {translate(`button.delete`)}
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
