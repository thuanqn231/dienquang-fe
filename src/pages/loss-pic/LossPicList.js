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
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import { Dropdown, DthButtonPermission } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import { getLossMasterDropdown } from '../../redux/slices/lossManagement';
import { resetSearchParams, setSearchParams } from '../../redux/slices/lossPicManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import LossPicRegistrationForm from './LossPicRegistrationForm';

const pageCode = 'menu.masterData.production.resourceMasterData.lossInfo.lossPIC';
const tableCode = 'lossPicList';
const detailTableCode = 'notificationPicList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function LabelGenerationList() {
  const classes = useStyles();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { searchParams } = useSelector((state) => state.lossPicManagement);
  const { selectedWidget } = useSelector((state) => state.page);

  const [selectedPicId, setSelectedPicId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isOpenCheckModal, setIsOpenCheckModal] = useState(false);
  const [currentData, setCurrentData] = useState({});
  const [columnsPlan, setColumnsPlan] = useState(null);
  const [columnsDetail, setColumnsDetail] = useState(null);
  const [gridApiDetail, setGridApiDetail] = useState(null);
  const [gridColumnApiDetail, setGridColumnApiDetail] = useState(null);
  const [notificationGridData, setNotificationGridData] = useState(null);
  const [gridApiPlan, setGridApiPlan] = useState(null);
  const [gridColumnApiPlan, setGridColumnApiPlan] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowRegister, setIsAllowRegister] = useState(false);
  const [isAllowDelete, setIsAllowDelete] = useState(false);

  const [listOfWidgets, setListOfWidgets] = useState([]);

  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [isSubmitting, setSubmitting] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];

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
    if (gridApiPlan && gridApiDetail) {
      onLoadData();
    }
  }, [selectedWidget, gridApiPlan, gridApiDetail]);

  useEffect(() => {
    const tableCodePlan = tableCode;
    const tableCodeDetail = detailTableCode;

    const tableConfigsPlan = getGridConfig(userGridConfig, pageCode, tableCodePlan);
    const tableConfigsDetail = getGridConfig(userGridConfig, pageCode, tableCodeDetail);
    tableConfigsPlan.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCodePlan}.${column.field}`);
    });
    tableConfigsDetail.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
    });
    setColumnsPlan(tableConfigsPlan);
    setColumnsDetail(tableConfigsDetail);
  }, [userGridConfig]);

  useEffect(() => {
    if (columnsPlan) {
      const tableCodePlan = tableCode;
      const tableConfigsPlan = [...columnsPlan];
      tableConfigsPlan.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodePlan}.${column.field}`);
      });
      setColumnsPlan(tableConfigsPlan);
    }
    if (columnsDetail) {
      const tableCodeDetail = detailTableCode;

      const tableConfigsDetail = [...columnsDetail];
      tableConfigsDetail.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
      });
      setColumnsDetail(tableConfigsDetail);
    }
  }, [currentLang]);

  useEffect(() => {
    if (selectedPicId && gridApiDetail) {
      onLoadDataNotificationPic();
    } else {
      clearDataDetail();
    }
  }, [selectedPicId, gridApiDetail]);

  useEffect(() => {
    dispatch(getLossMasterDropdown());
  }, [dispatch]);

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
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

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const onClickRegister = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedPicId) {
      enqueueSnackbar(translate(`message.please_select_1_item`), {
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
    if (!selectedPicId) {
      enqueueSnackbar(translate(`message.please_select_1_item`), {
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

  const onInquiry = () => {
    onLoadData();
  };

  const onLoadData = () => {
    setSelectedPicId(null);
    const requestParams = {
      lossType: searchParams.lossType,
      classification: searchParams.classification,
      lossCls: searchParams.lossDetailCls,
      lossItem: searchParams.lossItem,
      user: searchParams.user,
      state: searchParams.state
    };
    parseOrgSearchFactory(requestParams, parseSelectedTree);
    try {
      setGridDataSource(gridApiPlan, '/v1/loss-pic/search-v2', requestParams);
    } catch (error) {
      clearGridData(gridApiPlan);
      console.error(error);
    }
    clearDataDetail();
  };

  const clearDataDetail = () => {
    if (gridApiDetail) {
      clearGridData(gridApiDetail);
    }
  };

  const onLoadDataNotificationPic = async () => {
    const requestParams = {
      state: 'RUNNING',
      picPks: selectedPicId
    };
    try {
      const response = setGridDataSource(gridApiDetail, '/v1/loss-pic/notification/search-v2', requestParams);

      query({
        url: '/v1/loss-pic/notification/search',
        featureCode: 'user.create',
        params: requestParams
      }).then((res) => {
        const _response = res.data;
        const currentNotificationData = _response.map((receiver) => ({
          fullName: receiver.user.fullName,
          employeeId: receiver.user.userName,
          employeeNo: receiver.user.code,
          departmentName: receiver.user.department.name,
          email: receiver.user.email,
          mobileNo: receiver.user.phoneNumber,
          id: receiver.factoryPk
        }));
        setNotificationGridData(currentNotificationData);
        setCurrentData({
          factoryPk: _response[0]?.factoryPk || 'null-null',
          factory: _response[0]?.pk?.factoryCode || '',
          classification: _response[0]?.lossPic?.classification?.code || '',
          lossCls: _response[0]?.lossPic?.lossCls?.code || '',
          lossType: _response[0]?.lossPic?.lossType?.code || '',
          user: _response[0]?.lossPic?.user || '',
          state: _response[0]?.lossPic?.state || '',
          pk: _response[0]?.lossPic?.pk || ''
        });
      });
    } catch (error) {
      clearGridData(gridApiDetail);
      console.error(error);
    }
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

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleDeleteLossPic = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/loss-pic/${selectedPicId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          reloadAfterDelete();
          handleCloseCheckModal();
          clearDataDetail();
          setIsOpenDeleteModal(false);
          enqueueSnackbar(translate(`message.delete_loss_pic_successful`), {
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
        setSubmitting(false);
        console.error(error);
      });
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree parseSelected={handleParseSelectedTree} />,
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
          <Dropdown
            id="lossType"
            name="lossType"
            label="Loss Type"
            value={searchParams.lossType}
            onChange={handleChangeSearchConfig}
            groupId="D042000"
            sx={{ my: 1 }}
            size="small"
          />

          <Dropdown
            id="classification"
            name="classification"
            label="Classification"
            value={searchParams.classification}
            onChange={handleChangeSearchConfig}
            groupId="D043000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="lossDetailCls"
            name="lossDetailCls"
            label="Loss Detail Cls"
            value={searchParams.lossDetailCls}
            onChange={handleChangeSearchConfig}
            groupId="D044000"
            sx={{ my: 1 }}
            size="small"
          />

          <TextField
            id="lossItem"
            name="lossItem"
            label="Loss Item"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.lossItem}
            onChange={handleChangeSearchConfig}
            size="small"
          />

          <TextField
            id="user"
            name="user"
            label="Person in Charge"
            sx={{ my: 1 }}
            fullWidth
            value={searchParams.user}
            onChange={handleChangeSearchConfig}
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

  const onGridReadyPlan = (params) => {
    setGridApiPlan(params.api);
    setGridColumnApiPlan(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onGridReadyDetail = (params) => {
    setGridApiDetail(params.api);
    setGridColumnApiDetail(params.columnApi);
    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible', 'columnResized'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onSelectionPlanChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedPicId(null);
      setIsAllowRegister(false);
      setIsAllowDelete(false);
      setIsEdit(false);
    }
    if (rowCount === 1) {
      const { factoryPk } = event.api.getSelectedNodes()[0]?.data;

      const selectedId = factoryPk;

      setIsEdit(true);
      setIsAllowRegister(isAllowRegister);
      setIsAllowDelete(true);
      setSelectedPicId(selectedId);
    }
  };

  const onSaveTableConfig = () => {
    const _columns = gridApiPlan.getColumnDefs();
    updateGridConfig(_columns);
    setColumnsPlan(_columns);
    setIsChangedTableConfig(false);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const handleCloseCheckModal = () => {
    setIsOpenCheckModal(false);
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

  const reloadAfterDelete = () => {
    onLoadData();
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
              <Card sx={{ pr: 1, borderRadius: '0px', height: '35px' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 0 }}>
                  <Tooltip title={`${actionTooltip} Filters`}>
                    <IconButton onClick={handleHideFilters}>{hideFilters ? <LastPage /> : <FirstPage />}</IconButton>
                  </Tooltip>

                  <HeaderBreadcrumbs activeLast pageCode={pageCode} />
                </Stack>
              </Card>
              <>
                <Card
                  sx={{
                    p: 1,
                    borderRadius: '0px',
                    display: 'row',
                    height: 'calc((100% - 35px)/2)',
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5"> {translate(`typo.loss_PIC`)}</Typography>
                    <Stack
                      direction="row"
                      justifyContent="right"
                      display="flex"
                      alignItems="center"
                      sx={{ marginTop: `0 !important`, marginBottom: `1 !important` }}
                    >
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickRegister}
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
                        funcType="CREATE"
                        disabled={!isEdit}
                      />

                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickDelete}
                        size="small"
                        label={translate('button.delete')}
                        pageCode={pageCode}
                        widgetCode={pageSelectedWidget?.widgetCode}
                        funcType="DELETE"
                        disabled={!isAllowDelete}
                      />
                    </Stack>
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '85%', width: '100%', overflowY: 'auto' }}>
                    <AgGrid
                      columns={columnsPlan}
                      pagination
                      className={themeAgGridClass}
                      onGridReady={onGridReadyPlan}
                      onSelectionChanged={onSelectionPlanChanged}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
                <Card
                  sx={{
                    p: 1,
                    borderRadius: '0px',
                    display: 'row',
                    height: 'calc((100% - 35px)/2)',
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5">{translate(`typo.notification_PIC`)}</Typography>
                  </Stack>
                  <div className={themeAgGridClass} style={{ height: '88%', width: '100%' }}>
                    <AgGrid
                      columns={columnsDetail}
                      pagination
                      className={themeAgGridClass}
                      onGridReady={onGridReadyDetail}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
              </>

              <DialogDragable
                title={`${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} Loss PIC`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <LossPicRegistrationForm
                  pageCode={pageCode}
                  isEdit={isEdit}
                  currentLossPicData={currentData}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                  notificationGridData={notificationGridData}
                  selectedPicId={selectedPicId}
                />
              </DialogDragable>
              <DialogAnimate
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
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteLossPic} loading={isSubmitting}>
                    {translate(`button.delete`)}
                  </LoadingButton>
                </DialogActions>
              </DialogAnimate>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
