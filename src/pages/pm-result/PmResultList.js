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
import { AgGrid, DthButtonPermission, DthDatePicker, Dropdown } from '../../core/wrapper';
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
import { fDate, fDateTime } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { stopPropagation } from '../../utils/pageUtils';

// ----------------------------------------------------------------------
import MaintenanceResultForm from './MaintenanceResultForm';

const pageCode = 'menu.production.resourceManagement.maintenanceManagement.preventiveMaintenance.pmResult';
const tableCode = 'pmResultList';
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
  const [selectedResultId, setSelectedResultId] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [currentData, setCurrentData] = useState({});
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
    dispatch(getMaterialDropdown());
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
    if (gridApi.column.colId === 'pmNo' && gridApi.value) {
      query({
        url: `/v1/pm-result/${gridApi.data.factoryPk}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          if (!isEmpty(res.data)) {
            setCurrentData({
              equipmentRowData: [
                {
                  equipmentPart: res.data.maintenanceEquipment.equipmentID.equipmentPart.name,
                  equipmentLine: res.data.maintenanceEquipment.equipmentID.equipmentLine.name,
                  equipmentProcess: res.data.maintenanceEquipment.equipmentID.equipmentProcess.name.name,
                  equipmentWorkStation: res.data.maintenanceEquipment.equipmentID.equipmentWorkStation.name,
                  code: res.data.maintenanceEquipment.equipmentID.code,
                  name: res.data.maintenanceEquipment.equipmentID.name,
                  equipmentSpec: res.data.maintenanceEquipment.equipmentID.equipmentSpec,
                  factoryPk: res.data.maintenanceEquipment.equipmentID.factoryPk
                }
              ],
              maintenanceEquipments: [
                {
                  equipmentId: {
                    factoryPk: res.data.maintenanceEquipment.equipmentID.factoryPk
                  }
                }
              ],
              imageFiles: [...res.data.attachedFiles?.filter((row) => row.image)],
              curAttachedFiles: [...res.data.attachedFiles?.filter((row) => !row.image)],
              sparePartRowData: res.data.sparePartUses?.map((row) => ({
                materialCode: row.material.code,
                materialDescription: row.material.description,
                materialId: row.material.materialId,
                issuedQty: row.issueQty,
                returnedQty: row.returnQty,
                scrap: row.scrapLossQty,
                usedQty: row.usedQty,
                factoryPk: row.factoryPk
              })),
              maintenanceContentRowData: res.data.maintenanceContents?.map((row) => ({
                itemCheck: row.itemCheck,
                pmTime: `${fDateTime(row.startTime)} ~ ${fDateTime(row.endTime)}`,
                result: row.result ? 'OK' : 'NG',
                detailContent: row?.detailContent,
                factoryPk: row.factoryPk
              })),

              ...res.data
            });

            setView(true);
            setIsEdit(false);
            setOpenActionModal(true);
          }
        })
        .catch((err) => console.error(err));
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
    onLoadData();
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

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };
  const onClickMaintain = async () => {
    if (isEdit) {
      onTransferData();
    }
    if (!isEdit) {
      handleOpenModal();
    }
  };

  const onTransferData = () => {
    if (selectedResultId && selectedResultId !== 'null-null') {
      query({
        url: `/v1/pm-result/${selectedResultId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          if (!isEmpty(res.data)) {
            setCurrentData({
              imageFiles: [...res.data.attachedFiles?.filter((row) => row.image)],
              curAttachedFiles: [...res.data.attachedFiles?.filter((row) => !row.image)],
              sparePartRowData: res.data.sparePartUses?.map((row) => ({
                materialCode: row.material.code,
                materialDescription: row.material.description,
                materialId: row.material.materialId,
                issuedQty: row.issueQty,
                returnedQty: row.returnQty,
                scrap: row.scrapLossQty,
                usedQty: row.usedQty,
                factoryPk: row.factoryPk
              })),
              maintenanceContentRowData: res.data.maintenanceContents?.map((row) => ({
                itemCheck: row.itemCheck,
                pmTime: `${fDateTime(row.startTime)} ~ ${fDateTime(row.endTime)}`,
                result: row.result ? 'OK' : 'NG',
                detailContent: row?.detailContent,
                factoryPk: row.factoryPk
              })),
              ...currentData,
              ...res.data
            });
            handleOpenModal();
          }
        })
        .catch((err) => console.error(err));
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
    setSelectedResultId(null);
    setIsAllowEdit(false);
    setCurrentData([]);
    setIsEdit(false);
    setView(false);
    setSelectedResultId(null);
    const requestParams = {
      from: fDate(searchParams.from),
      to: fDate(searchParams.to),
      equipmentCode: searchParams.equipCode,
      equipmentIDCode: searchParams.equipIdCode,
      equipmentIDName: searchParams.equipIdName,
      planID: searchParams.planId,
      pmType: searchParams.pmType,
      pmCycle: searchParams.pmCycle,
      pmNo: searchParams.pmNo,
      pmStatus: searchParams.pmStatus,
      state: searchParams.state
    };
    parseOrgSearchAll(requestParams, parseSelectedTree);
    try {
      setGridDataSource(gridApi, '/v1/pm-result/search-v2', requestParams);
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const handleDeletePmPlanning = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/pm-schedule/${selectedResultId}`,
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
      setSelectedResultId(null);
      setIsEdit(false);
      setCurrentData([]);
    }
    if (rowCount === 1) {
      const resultId = event.api.getSelectedNodes()[0].data.factoryPk;
      const pmDate = event.api.getSelectedNodes()[0].data.actualPMDate;
      if (pmDate) {
        setIsEdit(true);
      } else {
        setIsEdit(false);
      }

      const curEquipment = event.api.getSelectedNodes()[0].data.maintenanceEquipment;
      setSelectedResultId(resultId);
      setCurrentData({
        equipmentRowData: [
          {
            equipmentPart: curEquipment.equipmentID.equipmentPart.name,
            equipmentLine: curEquipment.equipmentID.equipmentLine.name,
            equipmentProcess: curEquipment.equipmentID.equipmentProcess.name.name,
            equipmentWorkStation: curEquipment.equipmentID.equipmentWorkStation.name,
            code: curEquipment.equipmentID.code,
            name: curEquipment.equipmentID.name,
            equipmentSpec: curEquipment.equipmentID.equipmentSpec,
            factoryPk: curEquipment.equipmentID.factoryPk
          }
        ],
        maintenanceEquipments: [
          {
            equipmentId: {
              factoryPk: curEquipment.equipmentID.factoryPk
            }
          }
        ]
      });
      setSelectedRowId(resultId);

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
          <Dropdown
            id="pmType"
            name="pmType"
            label="PM Type"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            groupId="D037000"
            fullWidth
            value={searchParams.pmType}
            size="small"
          />
          <Dropdown
            id="pmCycle"
            name="pmCycle"
            label="PM Cycle"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            groupId="D038000"
            fullWidth
            value={searchParams.pmCycle}
            size="small"
          />
          <TextField
            id="pmNo"
            name="pmNo"
            label="PM No"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.pmNo}
            onChange={handleChangeSearchConfig}
            size="small"
          />
          <Dropdown
            id="pmStatus"
            name="pmStatus"
            label="PM Status"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            groupId="D018000"
            fullWidth
            value={searchParams.pmStatus}
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
                          onClick={onClickMaintain}
                          label={translate(`button.input_result`)}
                          pageCode={pageCode}
                          widgetCode={selectedWidget.widgetCode}
                          funcType={`${(isEdit && 'UPDATE') || isView ? 'READ' : 'CREATE'}`}
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
                title={(isView && `Maintenance Result View`) || `Input Maintenance Result`}
                maxWidth="xl"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <MaintenanceResultForm
                  isEdit={isEdit}
                  isView={isView}
                  currentData={currentData}
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
