import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import FirstPage from '@material-ui/icons/FirstPage';
import { makeStyles } from '@material-ui/styles';
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
import { useState, useEffect, useRef } from 'react';
import { isEmpty, isUndefined } from 'lodash-es';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { Dropdown, DthButtonPermission } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import { mutate, query } from '../../core/api';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { useDispatch, useSelector } from '../../redux/store';
import { setSearchParams, resetSearchParams } from '../../redux/slices/defectSymptomManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// utils
import { getPageName, getGridConfig, parseOrgSearchFactory } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';
import SymptomClassRegisterForm from './SymptomClassRegisterForm';
import DefectSymptomDetailRegisterForm from './DefectSymptomDetailRegisterForm';
// --------------------------------------------------

const pageCode = 'menu.masterData.production.qualityMasterData.defectItem.defectSymptom';
const tableCodeClass = 'defectSymptomClass';
const tableCodeDetail = 'defectSymptomDetail';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function DefectSymptomList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.defectSymptomManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowDataClass, setRowDataClass] = useState(null);
  const [rowDataDetail, setRowDataDetail] = useState([]);
  const [columnsClass, setColumnsClass] = useState(null);
  const [columnsDetail, setColumnsDetail] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [gridApiDetail, setGridApiDetail] = useState(null);
  const [gridColumnApiDetail, setGridColumnApiDetail] = useState(null);
  const [isOpenClassActionModal, setOpenClassActionModal] = useState(false);
  const [isOpenDetailActionModal, setOpenDetailActionModal] = useState(false);
  const [currentSymptomClass, setCurrentSymptomClass] = useState({});
  const [currentSymptomDetail, setCurrentSymptomDetail] = useState({});
  const [selectedSymptomClassId, setSelectedSymptomClassId] = useState(null);
  const [selectedSymptomDetailId, setSelectedSymptomDetailId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenDeleteClassModal, setIsOpenDeleteClassModal] = useState(false);
  const [isOpenDeleteItemModal, setIsOpenDeleteItemModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
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
    if (pageSelectedWidget?.widgetName !== '') {
      const tableConfigsDetail = getGridConfig(userGridConfig, pageCode, tableCodeDetail);
      tableConfigsDetail.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
      });
      const tableConfigsClass = getGridConfig(userGridConfig, pageCode, tableCodeClass);
      tableConfigsClass.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeClass}.${column.field}`);
      });
      setColumnsClass(tableConfigsClass);
      setColumnsDetail(tableConfigsDetail);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columnsClass) {
      const tableConfigsClass = [...columnsClass];
      tableConfigsClass.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeClass}.${column.field}`);
      });
      setColumnsClass(tableConfigsClass);
    }
    if (columnsDetail) {
      const tableConfigsDetail = [...columnsDetail];
      tableConfigsDetail.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCodeDetail}.${column.field}`);
      });
      setColumnsDetail(tableConfigsDetail);
    }
  }, [currentLang]);

  useEffect(() => {
    if (gridApi && gridApiDetail) {
      onLoadData();
    }
  }, [gridApi, gridApiDetail]);

  useEffect(() => {
    if (!isEmpty(currentSymptomClass) && gridApiDetail) {
      onLoadData('defectSymptomDetail')
    }
    else {
      clearDataDetail();
    }
  }, [currentSymptomClass, gridApiDetail])

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

  const handleChangeSearchClassConfig = (event) => {
    const _search = {
      ...searchParams,
      class: {
        ...searchParams.class,
        [event.target.name]: `${event.target.value}`
      }
    }
    dispatch(setSearchParams(_search));
  };

  const handleChangeSearchDetailConfig = (event) => {
    const _search = {
      ...searchParams,
      detail: {
        ...searchParams.detail,
        [event.target.name]: `${event.target.value}`
      }
    }
    dispatch(setSearchParams(_search));
  }

  const updateDataClass = (data) => {
    setRowDataClass(data);
  };

  const updateDataDetail = (data) => {
    setRowDataDetail(data);
  };

  const onLoadData = (table = tableCodeClass) => {
    if (table === "defectSymptomClass") {
      const requestParams = {
        classYn: searchParams.class.stateClass,
        sympClsCode: searchParams.class.sympClsCode,
        sympClsName: searchParams.class.sympClsName
      }
      parseOrgSearchFactory(requestParams, parseSelectedTree);
      try {
        setGridDataSource(gridApi, '/v1/symptom/search-v2', requestParams)
      } catch (error) {
        clearGridData(gridApi);
        console.error(error);
      }
      clearDataDetail();
    }
    else if (table === 'defectSymptomDetail') {
      const _searchParams = {
        ...searchParams,
        detail: {
          ...searchParams.detail,
          sympClsCode: currentSymptomClass.code,
          factory: currentSymptomClass.pk.factoryCode
        }
      }
      dispatch(setSearchParams(_searchParams))
      const requestParams = {
        ..._searchParams.detail,
        detailYn: searchParams.detail.stateDetail,
        sympClsCode: currentSymptomClass.code
      }
      parseOrgSearchFactory(requestParams, parseSelectedTree);
      try {
        setGridDataSource(gridApiDetail, '/v1/symptom/detail/search-v2', requestParams)
      } catch (error) {
        clearGridData(gridApiDetail);
        console.error(error);
      }
    }
  };

  const clearDataDetail = () => {
    if (gridApiDetail) {
      clearGridData(gridApiDetail);
    }
  }

  const onInquiry = () => {
    onLoadData("defectSymptomClass");
    if (!isEmpty(currentSymptomClass)) onLoadData('defectSymptomDetail')
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  // accordion
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

          <TextField
            fullWidth
            id="sympClsCode"
            name="sympClsCode"
            label="Symptom Class Code"
            value={searchParams.class.sympClsCode}
            onChange={handleChangeSearchClassConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="sympClsName"
            name="sympClsName"
            label="Symptom Class Name"
            value={searchParams.class.sympClsName}
            onChange={handleChangeSearchClassConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="sympCode"
            name="sympCode"
            label="Symptom Code"
            value={searchParams.detail.sympCode}
            onChange={handleChangeSearchDetailConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <TextField
            fullWidth
            id="sympName"
            name="sympName"
            label="Symptom Name"
            value={searchParams.detail.sympName}
            onChange={handleChangeSearchDetailConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="stateClass"
            name="stateClass"
            label="Class Use (Y/N)"
            value={searchParams.class.stateClass}
            onChange={handleChangeSearchClassConfig}
            options={[
              { value: 'RUNNING', label: 'Y' },
              { value: 'HIDDEN', label: 'N' }
            ]}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="stateDetail"
            name="stateDetail"
            label="Item Use (Y/N)"
            value={searchParams.detail.stateDetail}
            onChange={handleChangeSearchDetailConfig}
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

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const handleOpenClassModal = () => {
    setOpenClassActionModal(true);
  };

  const handleOpenDetailModal = () => {
    setOpenDetailActionModal(true);
  };

  const onClickAddClass = () => {
    setIsEdit(false);
    handleOpenClassModal();
  };

  const onClickAddDetail = () => {
    setIsEdit(false);
    handleOpenDetailModal();
  };

  const onClickModifyClass = () => {
    if (!selectedSymptomClassId) {
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
      handleOpenClassModal();
    }
  };

  const onClickModifyDetail = () => {
    if (!selectedSymptomDetailId) {
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
      handleOpenDetailModal();
    }
  };

  const onClickDeleteClass = () => {
    if (!selectedSymptomClassId) {
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
      handleOpenDeleteClassModal();
    }
  };

  const onClickDeleteDetail = () => {
    if (!selectedSymptomDetailId) {
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
      handleOpenDeleteDetailModal();
    }
  };

  const handleOpenDeleteClassModal = () => {
    setIsOpenDeleteClassModal(true);
  };

  const handleOpenDeleteDetailModal = () => {
    setIsOpenDeleteItemModal(true)
  }

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onGridReadyDetail = (params) => {
    setGridApiDetail(params.api);
    setGridColumnApiDetail(params.columnApi);
  };

  const onSelectionChangedDetail = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedSymptomDetailId(null);
      setCurrentSymptomDetail({})
    }
    if (rowCount === 1) {
      const selectedSymptomDetailID = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedSymptomDetailId(selectedSymptomDetailID);
      if (selectedSymptomDetailID) {
        query({
          url: `/v1/symptom/detail/${selectedSymptomDetailID}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentSymptomDetail({
              ...data
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }

  const onSelectionChangedClass = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedSymptomClassId(null);
      setCurrentSymptomClass({})
    }
    if (rowCount === 1) {
      const selectedSymptomClassID = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedSymptomClassId(selectedSymptomClassID);
      if (selectedSymptomClassID) {
        query({
          url: `/v1/symptom/${selectedSymptomClassID}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentSymptomClass({
              ...data
            });
          })
          .catch((error) => {
            console.error(error);
          });

      }
    }
  }
  const handleCloseModal = () => {
    setOpenClassActionModal(false);
    setOpenDetailActionModal(false);
  };
  const handleCloseClassModal = () => {
    setOpenClassActionModal(false)
  }
  const handleCloseDetailModal = () => {
    setOpenDetailActionModal(false);
  }

  const handleCloseDeleteClassModal = () => {
    setIsOpenDeleteClassModal(false);
  };
  const handleCloseDeleteDetailModal = () => {
    setIsOpenDeleteItemModal(false);
  };
  const handleCloseDeleteModal = () => {
    handleCloseDeleteClassModal();
    handleCloseDeleteDetailModal();
  }

  const handleDeleteDetail = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/symptom/detail/${selectedSymptomDetailId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        enqueueSnackbar(translate(`message.defect_symptom_detail_was_deleted_successfully`), {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        handleCloseDeleteModal();
        onLoadData('defectSymptomDetail');
        setCurrentSymptomDetail({});
        setSelectedSymptomDetailId(null);
      }
    }).catch((error) => {
      setSubmitting(false);
      console.error(error);
    });
  };
  const handleDeleteClass = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/symptom/${selectedSymptomClassId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        enqueueSnackbar(translate(`message.defect_symptom_was_deleted_successfully`), {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        handleCloseDeleteModal();
        onLoadData();
        setCurrentSymptomClass({});
        setSelectedSymptomClassId(null);
      }
    }).catch((error) => {
      setSubmitting(false);
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
              <Card
                sx={{
                  p: 1,
                  borderRadius: '0px',
                  display: 'row',
                  height: '50%',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h5">{translate(`typo.defect_symptom_class`)}</Typography>
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
                      onClick={onClickAddClass}
                      size="small"
                      label="Register"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="CREATE"
                    />
                    <DthButtonPermission
                      sx={{ marginLeft: 1 }}
                      variant="contained"
                      onClick={onClickModifyClass}
                      size="small"
                      label="Modify"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="UPDATE"
                    // disabled={!selectedId}
                    />
                    <DthButtonPermission
                      sx={{ marginLeft: 1 }}
                      variant="contained"
                      onClick={onClickDeleteClass}
                      size="small"
                      label="Delete"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="DELETE"
                    // disabled={!selectedId}
                    />
                  </Stack>
                </Stack>
                <Card
                  sx={{
                    'height': `calc((100% - 30px))`
                  }}
                >
                  <AgGrid
                    columns={columnsClass}
                    pagination
                    className={themeAgGridClass}
                    onGridReady={onGridReady}
                    onSelectionChanged={onSelectionChangedClass}
                    rowSelection="single"
                    width="100%"
                    height="100%"
                  />
                </Card>
              </Card>

              <Card
                sx={{
                  p: 1,
                  borderRadius: '0px',
                  display: 'row',
                  height: '50%',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h5">{translate(`typo.defect_symptom_detail`)}</Typography>
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
                      onClick={onClickAddDetail}
                      size="small"
                      label="Register"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="CREATE"
                      disabled={!selectedSymptomClassId}
                    />
                    <DthButtonPermission
                      sx={{ marginLeft: 1 }}
                      variant="contained"
                      onClick={onClickModifyDetail}
                      size="small"
                      label="Modify"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="UPDATE"
                      disabled={!selectedSymptomClassId}
                    />
                    <DthButtonPermission
                      sx={{ marginLeft: 1 }}
                      variant="contained"
                      onClick={onClickDeleteDetail}
                      size="small"
                      label="Delete"
                      pageCode={pageCode}
                      widgetCode={pageCode}
                      funcType="DELETE"
                      disabled={!selectedSymptomClassId}
                    />
                  </Stack>
                </Stack>

                <Card
                  sx={{
                    'height': `calc((100% - 30px))`
                  }}
                >
                  <AgGrid
                    columns={columnsDetail}
                    pagination
                    className={themeAgGridClass}
                    onGridReady={onGridReadyDetail}
                    onSelectionChanged={onSelectionChangedDetail}
                    rowSelection="single"
                    width="100%"
                    height="100%"
                  />
                </Card>
              </Card>
            </Card>


            <DialogDragable
              title={`${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} ${translate(`typo.defect_symptom_class`)}`}
              maxWidth="lg"
              open={isOpenClassActionModal}
              onClose={handleCloseClassModal}
            >
              <SymptomClassRegisterForm
                isEdit={isEdit}
                currentData={currentSymptomClass}
                onCancel={handleCloseClassModal}
                onLoadData={onLoadData}
                setCurrentSymptomClass={setCurrentSymptomClass}
                setSelectedSymptomClassId={setSelectedSymptomClassId}
              />
            </DialogDragable>
            <DialogDragable
              title={`${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} ${translate(`typo.defect_symptom_detail`)}`}
              maxWidth="lg"
              open={isOpenDetailActionModal}
              onClose={handleCloseDetailModal}
            >
              <DefectSymptomDetailRegisterForm
                isEdit={isEdit}
                currentData={currentSymptomDetail}
                onCancel={handleCloseDetailModal}
                onLoadData={onLoadData}
                setCurrentSymptomDetail={setCurrentSymptomDetail}
                setSelectedSymptomDetailId={setSelectedSymptomDetailId}
                currentClass={currentSymptomClass}
              />
            </DialogDragable>

            <DialogDragable title={translate(`typo.delete`)} maxWidth="sm" open={isOpenDeleteClassModal} onClose={handleCloseDeleteClassModal}>
              <Typography variant="subtitle1" align="center">
                {translate(`typo.are_you_sure_to_delete`)} class
              </Typography>
              <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                  {translate(`button.no`)}
                </Button>
                <LoadingButton type="button" variant="contained" onClick={handleDeleteClass} loading={isSubmitting}>
                  {translate(`button.delete`)}
                </LoadingButton>
              </DialogActions>
            </DialogDragable>

            <DialogDragable title={translate(`typo.delete`)} maxWidth="sm" open={isOpenDeleteItemModal} onClose={handleCloseDeleteDetailModal}>
              <Typography variant="subtitle1" align="center">
                {translate(`typo.are_you_sure_to_delete`)} Detail
              </Typography>
              <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
                  {translate(`button.no`)}
                </Button>
                <LoadingButton type="button" variant="contained" onClick={handleDeleteDetail} loading={isSubmitting}>
                  {translate(`button.delete`)}
                </LoadingButton>
              </DialogActions>
            </DialogDragable>

          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}