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
  IconButton,
  Autocomplete
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

import { setSelectedWidget } from '../../redux/slices/page';
import {
  getDSDetailDropdown,
  getDSClassDropdown,
  setSearchParams,
  resetSearchParams
} from '../../redux/slices/factoryDSManagement';

import { getFactoryAndIdByPk } from '../../utils/formatString';

// utils
import { getPageName, getGridConfig, parseOrgSearchAll } from '../../utils/pageConfig';
import FactoryDSRegisterForm from './FactoryDSRegisterForm';

// --------------------------------------------------

const pageCode = 'menu.masterData.production.qualityMasterData.factoryDefectItems.factoryDefectSymptoms';

const tableCode = 'factoryDSList';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function FactoryDSList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams, dsClassCodeDropdown, dsClassNameDropdown, dsDetailNameDropdown, dsDetailCodeDropdown } =
    useSelector((state) => state.factoryDSManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [rowData, setRowData] = useState([]);

  const [columns, setColumns] = useState(null);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [sympClassCode, setSympClassCode] = useState();
  const [sympClassName, setSympClassName] = useState();

  const [isOpenActionModal, setOpenActionModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [isAllowEdit, setIsAllowEdit] = useState(null);
  const [factoryDSId, setFactoryDSId] = useState(null);
  const [factories, setFactories] = useState([]);

  const [currentData, setCurrentData] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
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
    dispatch(getDSClassDropdown());
    dispatch(getDSDetailDropdown());
  }, [dispatch]);

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

  useEffect(() => {
    if (gridApi && gridColumnApi) {
      onLoadData();
    }
  }, [gridApi, gridColumnApi]);

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
  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };
  const getFactoryCode = () => {
    const selectedFactories = parseSelectedTree.factoryIds;
    if (selectedFactories.split(',').length === 0 || selectedFactories.split(',').length > 1) {
      return '';
    }
    const { factoryCode } = getFactoryAndIdByPk(parseSelectedTree.factoryIds);
    return factoryCode;
  };

  const updateData = (data) => {
    setRowData(data);
  };
  const onLoadData = () => {
    const params = {
      sympCode: searchParams.sympCode,
      sympClsCode: searchParams.sympClsCode,
      sympName: searchParams.sympName,
      sympClsName: searchParams.sympClsName,
      level: searchParams.level,
      productGroup: searchParams.productGroup,
      processType: searchParams.processType,
      state: searchParams.state
    };
    parseOrgSearchAll(params, parseSelectedTree);
    query({
      url: '/v1/factory-symptom/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        updateData(
          res.data?.map((row) => ({
            ...row,
            process: {
              name: {
                name: row.process?.name?.name ? row.process.name.name : 'ALL'
              }
            },
            processType: {
              description: row.processType?.description ? row.processType?.description : 'ALL'
            }
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onInquiry = () => {
    onLoadData();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
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
      detail: <OrganizationTree parseSelected={handleParseSelectedTree} renderAll />,
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
            id="sympClsCode"
            name="sympClsCode"
            label="Symp Cls Code"
            value={searchParams.sympClsCode}
            onChange={(e) => {
              handleChangeSearchConfig(e);
              setSympClassCode(e.target?.value);
            }}
            options={dsClassCodeDropdown.filter((dsClass) => {
              const factoryCode = getFactoryCode();
              return factories.includes(dsClass.factory) && dsClass.factory === factoryCode;
            })}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="sympClsName"
            name="sympClsName"
            label="Symp Cls Name"
            value={searchParams.sympClsName}
            onChange={(e) => {
              handleChangeSearchConfig(e);
              setSympClassName(e.target?.value);
            }}
            options={dsClassNameDropdown.filter((dsClass) => {
              const factoryCode = getFactoryCode();
              return factories.includes(dsClass.factory) && dsClass.factory === factoryCode;
            })}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="sympCode"
            name="sympCode"
            label="Symp Code"
            value={searchParams.sympCode}
            onChange={handleChangeSearchConfig}
            options={dsDetailCodeDropdown.filter((dsDetail) => {
              const factoryCode = getFactoryCode();
              return factories.includes(dsDetail.factory) && dsDetail.factory === factoryCode;
            })}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="sympName"
            name="sympName"
            label="Symp Name"
            value={searchParams.sympName}
            onChange={handleChangeSearchConfig}
            options={dsDetailNameDropdown.filter((dsDetail) => {
              const factoryCode = getFactoryCode();
              return factories.includes(dsDetail.factory) && dsDetail.factory === factoryCode;
            })}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="level"
            name="level"
            label="Defect Level"
            value={searchParams.level}
            onChange={handleChangeSearchConfig}
            groupId="D056000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="productGroup"
            name="productGroup"
            label="Product Group"
            value={searchParams.productGroup}
            onChange={handleChangeSearchConfig}
            groupId="D015000"
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            id="processType"
            name="processType"
            label="Process Type"
            value={searchParams.processType}
            onChange={handleChangeSearchConfig}
            groupId="D014000"
            sx={{ my: 1 }}
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

  const actionTooltip = hideFilters ? 'Show' : 'Hide';
  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };
  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
    onLoadData();
  };

  const onClickAdd = () => {
    handleOpenModal();
    setIsEdit(false);
  };

  const onClickModify = () => {
    if (!factoryDSId) {
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
      handleOpenModal();
    }
  };

  const onClickDelete = () => {
    if (!factoryDSId) {
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

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    // setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const updateGridConfig = async (_columns) => {
    const tableCode = '';
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
  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setFactoryDSId(null);
      setCurrentData({});
      setIsAllowEdit(null);
    }
    if (rowCount === 1) {
      const selectedFactoryDSId = event.api.getSelectedNodes()[0].data.factoryPk;
      setFactoryDSId(selectedFactoryDSId);
      if (selectedFactoryDSId) {
        query({
          url: `/v1/factory-symptom/${selectedFactoryDSId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentData({
              ...data
            });
            setIsAllowEdit(true);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/factory-symptom/${factoryDSId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          enqueueSnackbar(translate(`message.factory_ds_deleted_success`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          handleCloseDeleteModal();
          onLoadData();
          setCurrentData({});
          setFactoryDSId(null);
          setIsAllowEdit(false);
        }
      })
      .catch((error) => {
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
                          disabled={!isAllowEdit}
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
                          disabled={!isAllowEdit}
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
                  rowData={rowData}
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`Factory Defect Symptom ${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)}`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <FactoryDSRegisterForm
                  isEdit={isEdit}
                  onCancel={handleCloseModal}
                  onLoadData={onLoadData}
                  currentData={currentData}
                  setFactoryDSId={setFactoryDSId}
                  setCurrentData={setCurrentData}
                />
              </DialogDragable>
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
    </Page>
  );
}
