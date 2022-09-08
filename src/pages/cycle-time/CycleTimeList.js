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
import { makeStyles } from '@material-ui/styles';
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
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { setSearchParams, resetSearchParams } from '../../redux/slices/cycleTimeManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { isNullVal } from '../../utils/formatString';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import CycleTimeRegistrationForm from './CycleTimeRegistrationForm';

const pageCode = 'menu.masterData.production.planningMasterData.timeManagement.cycleTime';
const tableCode = 'CycleTimeList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function CycleTimeList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.cycleTimeManagement);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentCycleTime, setCurrentCycleTime] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCycleTimeId, setSelectedCycleTimeId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const { selectedWidget } = useSelector((state) => state.page);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [columns, setColumns] = useState(null);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [isSubmitting, setSubmitting] = useState(false);

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
  };

  const onLoadData = () => {
      setSelectedCycleTimeId(null);
      const requestParams = {}
      if (searchParams.processCode) {
        requestParams.process = searchParams.processCode;
      }
      if (searchParams.lineCode) {
        requestParams.line = searchParams.lineCode;
      }
      if (searchParams.materialCode) {
        requestParams.materialMaster = searchParams.materialCode;
      }
      if (!isNullVal(searchParams.applyStartDate)) {
        requestParams.applyStartDate = fDate(searchParams.applyStartDate);
      }
      if (searchParams.factory) {
        requestParams.factoryPk = searchParams.factory;
      }
      if (searchParams.state) {
        requestParams.state = searchParams.state;
      }
      parseOrgSearchAll(requestParams, parseSelectedTree);
      try {
        setGridDataSource(gridApi, '/v1/cycle-time/search-v2', requestParams)
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
      setSelectedCycleTimeId(null);
    }
    if (rowCount === 1) {
      const cycleTimeId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedCycleTimeId(cycleTimeId);
      if (cycleTimeId) {
        query({
          url: `/v1/cycle-time/${cycleTimeId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;

            setCurrentCycleTime({
              factory: data.pk.factoryCode,
              lineCode: data.process.line.factoryPk,
              processCode: data.process.factoryPk,
              material: data.materialMaster.factoryPk,
              state: data.state,
              cycleTime: data.cycleTimeNum,
              applyStartDate: data.applyStartDate,
              id: data.pk.id
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
    if (!selectedCycleTimeId) {
      enqueueSnackbar(translate(`message.please_select_1_cycle_time`), {
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
      enqueueSnackbar(translate(`message.please_select_1_cycle_time`), {
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

  const handleDeleteCycleTime = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/cycle-time/${selectedCycleTimeId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
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
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
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
      detail: (
        <OrganizationTree
          renderAll
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
          <ListItem key="cycleTime">
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
              <ListItemText primary="Cycle Time" />
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
          <Dropdown
            id="lineCode"
            name="lineCode"
            label="Line Code"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.lineDropdown}
            value={searchParams.lineCode}
            size="small"
          />
          <Dropdown
            id="processCode"
            name="processCode"
            label="Process Code"
            sx={{ my: 1 }}
            onChange={handleChangeSearchConfig}
            options={commonDropdown.processDropdown.filter((dd) => dd.line === searchParams.lineCode)}
            value={searchParams.processCode}
            size="small"
          />

          <TextField
            fullWidth
            id="materialCode"
            name="materialCode"
            label="Material Code"
            value={searchParams.materialCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <DthDatePicker
            name="applyStartDate"
            label="Apply Start Date"
            value={searchParams.applyStartDate}
            onChange={(newValue) => {
              const _search = {
                ...searchParams,
                applyStartDate: newValue
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
                  {translate('button.inquiry')}
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
                          disabled={!selectedCycleTimeId}
                          funcType="UPDATE"
                        />
                        <DthButtonPermission
                          sx={{ marginLeft: 1 }}
                          variant="contained"
                          onClick={onClickDelete}
                          size="small"
                          label={translate(`button.delete`)}
                          widgetCode={pageSelectedWidget?.widgetCode}
                          pageCode={pageCode}
                          disabled={!selectedCycleTimeId}
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
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`Cycle Time ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <CycleTimeRegistrationForm
                  isEdit={isEdit}
                  currentData={currentCycleTime}
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
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteCycleTime} loading={isSubmitting}>
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
