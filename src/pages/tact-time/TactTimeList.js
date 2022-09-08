import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { makeStyles } from '@material-ui/styles';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
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
import { LoadingButton } from '@material-ui/lab';
import { useSnackbar } from 'notistack5';
import { useState, useEffect } from 'react';
import { isEmpty, isUndefined } from 'lodash-es';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import { mutate, query } from '../../core/api';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { setSearchParams, resetSearchParams } from '../../redux/slices/tactTimeManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// utils
import { fDate, fDateTime } from '../../utils/formatTime';
import { getPageName, getGridConfig, parseOrgSearchAll } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import TactTimeRegistrationForm from './TactTimeRegistrationForm';
import { isNullVal } from '../../utils/formatString';

const pageCode = 'menu.masterData.production.planningMasterData.timeManagement.tactTimeTaktTime';
const tableCode = 'tactTimeList';
const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function TactTimeList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { searchParams } = useSelector((state) => state.tactTimeManagement);
  const { themeAgGridClass } = useSettings();
  const [startDate, setStartDate] = useState([]);
  const { translate, currentLang } = useLocales();
  const [data, setData] = useState(null);
  const { commonDropdown, userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [columns, setColumns] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [currentTactTime, setCurrentTactTime] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const { selectedWidget } = useSelector((state) => state.page);
  const [selectedTactTimeId, setSelectedTactTimeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];

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
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);

    tableConfigs
      .filter((column) =>
        [
          'validFrom',
          'validTo',
          'startDate',
          'endDate',
          'startTime',
          'endTime',
          'actualStartTime',
          'applyStartDate',
          'applyEndDate',
          'actualEndTime'
        ].includes(column.field)
      )
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => fDate(params.value);
      });
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
    if (gridApi) {
      onLoadData();
    }
  }, [gridApi]);

  useEffect(() => {
    dispatch(getMaterialDropdown());
  }, [dispatch]);

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

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
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
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onLoadData = () => {
    const requestParams = {};
    if (searchParams?.lineCode) {
      requestParams.line = searchParams?.lineCode;
    }
    if (searchParams?.shiftCode) {
      requestParams.shift = searchParams?.shiftCode;
    }
    if (searchParams?.materialCode) {
      requestParams.materialCode = searchParams.materialCode;
    }
    if (!isNullVal(searchParams.applyStartDate)) {
      requestParams.applyStartDate = fDate(searchParams.applyStartDate);
    }
    if (searchParams?.state) {
      requestParams.state = searchParams.state;
    }
    parseOrgSearchAll(requestParams, parseSelectedTree);
    try {
      setGridDataSource(gridApi, '/v1/tact-time/search-v2', requestParams)
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

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;

    if (rowCount === 0) {
      setSelectedTactTimeId(null);
      setIsEdit(false);
    }
    if (rowCount === 1) {
      const tactTimeId = event.api.getSelectedNodes()[0].data.factoryPk;

      setSelectedTactTimeId(tactTimeId);
      setIsEdit(true);
      if (tactTimeId) {
        query({
          url: `/v1/tact-time/${tactTimeId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;

            setCurrentTactTime({
              id: res.data.factoryPk,
              factory: res.data.pk.factoryCode,
              shiftCode: res.data.shift.code,
              tactTime: res.data.time,
              lineCode: res.data.line.factoryPk,
              materialCode: res.data.material.factoryPk,
              applyStartDate: res.data.applyStartDate,
              applyEndDate: res.data.applyEndDate,
              state: res.data.state
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
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedTactTimeId) {
      enqueueSnackbar(translate(`message.please_select_1_tact_time`), {
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
    if (!selectedTactTimeId) {
      enqueueSnackbar(translate(`message.please_select_1_tact_time`), {
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

  const handleDeleteTactTime = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/tact-time/${selectedTactTimeId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        if (res.data?.message) {
          enqueueSnackbar(translate(`message.cannot_delete_start_date_passed`), {
            variant: 'warning',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          handleCloseDeleteModal();
        } else {
          enqueueSnackbar(translate(`message.tact_time_was_deleted_successful`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          onLoadData();
          handleCloseDeleteModal();
        }
      }
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
    });
  };

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const onClickWidget = (widgetCode, widgetName) => {
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
              <ListItem key="tactTime">
                <ListItemButton
                  sx={{
                    px: 1,
                    height: 48,
                    typography: 'body2',
                    textTransform: 'capitalize',
                    ...(isActive && {
                      color: 'text.primary',
                      fontWeight: 'fontWeightMedium',
                      bgcolor: 'action.selected'
                    })
                  }}
                  onClick={() => onClickWidget(element.code, element.name)}
                >
                  <ListItemText primary="Tact Time" />
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
      isClearFilter: true,
      defaultExpanded: true,
      detail: (
        <>
          <Dropdown
            id="lineCode"
            name="lineCode"
            label="Line Name"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.lineDropdown}
            value={searchParams.lineCode}
            size="small"
          />
          <Dropdown
            id="shiftCode"
            name="shiftCode"
            label="Shift"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            groupId="D001000"
            value={searchParams.shiftCode}
            size="small"
          />
          <TextField
            id="materialCode"
            name="materialCode"
            label="Material Code"
            fullWidth
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            value={searchParams.materialCode}
            size="small"
          />
          <DthDatePicker
            name="applyStartDate"
            label="Apply Start Date"
            value={searchParams.applyStartDate}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                applyStartDate: `${newValue}`
              };
              dispatch(setSearchParams(_search));
            }}
            sx={{ my: 1 }}
            fullWidth
            size="small"
          />
          <Dropdown
            id="state"
            name="state"
            label="Use (Y/N)"
            value={searchParams.state}
            onChange={handleChangeSearchConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
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
                          onClick={onClickAdd}
                          size="small"
                          label={translate(`button.register`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="CREATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickModify}
                          size="small"
                          label={translate(`button.modify`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="UPDATE"
                          disabled={!isEdit}
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickDelete}
                          size="small"
                          label={translate(`button.delete`)}
                          pageCode={pageCode}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          funcType="DELETE"
                          disabled={!isEdit}
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
                title={`Tact Time ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <TactTimeRegistrationForm
                  isEdit={isEdit}
                  currentData={currentTactTime}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                />
              </DialogDragable>
              <DialogDragable title={translate(`typo.delete`)} maxWidth="sm" open={isOpenDeleteModal} onClose={handleCloseDeleteModal}>
                <Typography variant="subtitle1" align="center">
                  {translate(`typo.are_you_sure_to_delete`)}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                    {translate(`button.no`)}
                  </Button>
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteTactTime} loading={isSubmitting}>
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
