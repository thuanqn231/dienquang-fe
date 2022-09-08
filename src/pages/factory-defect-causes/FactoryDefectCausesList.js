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
import { Dropdown, DthButtonPermission, AgGrid } from '../../core/wrapper';
import { mutate, query } from '../../core/api';
// hooks
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { useDispatch, useSelector } from '../../redux/store';
import { setSearchParams, resetSearchParams } from '../../redux/slices/factoryDefectCausesManagement';
import { getDefectCause, getDefectCauseDetail } from '../../redux/slices/defectCauseManagement';
import { setSelectedWidget } from '../../redux/slices/page';

// utils
import { getPageName, getGridConfig, parseOrgSearchAll } from '../../utils/pageConfig';
import FactoryDefectCausesRegisterForm from './FactoryDefectCausesRegisterForm';

// --------------------------------------------------

const pageCode = 'menu.masterData.production.qualityMasterData.factoryDefectItems.factoryDefectCauses'; 
const tableCode = 'factoryDefectCause';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function FactoryDefectCauses() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.factoryDefectCausesManagement);
  const { defectCauseDropdown, defectCauseDetailDropdown } = useSelector((state) => state.defectCausesManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [rowData, setRowData] = useState([]);

  const [columns, setColumns] = useState(null);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const [isOpenActionModal, setOpenActionModal] = useState(false);

  const [currentFactoryDefectCauses, setCurrentFactoryDefectCauses] = useState({});
  const [selectedSymptomClassId, setSelectedSymptomClassId] = useState(null);
  const [selectedDefectCauseId, setSelectedDefectCauseId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenDeleteClassModal, setIsOpenDeleteClassModal] = useState(false);
  const [isOpenDeleteItemModal, setIsOpenDeleteItemModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const initialSearchParam = useRef(searchParams);
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
    dispatch(getDefectCause())
    dispatch(getDefectCauseDetail())
  }, [dispatch])
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

  const updateData = (data) => {
    setRowData(data);
  };
  const onLoadData = () => {
    setSelectedDefectCauseId('')
    const params = {
      sympClsCode: searchParams.causeClsCode,
      sympClsName: searchParams.causeClsName,
      sympCode: searchParams.causeCode,
      sympName: searchParams.causeName,
      productGroup: searchParams.productGroup,
      processType: searchParams.processType,   
      state: searchParams.state,
    };
    parseOrgSearchAll(params, parseSelectedTree);
    query({
      url: '/v1/factory-defect-cause/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        const data = res.data.map(e => ({
          ...e,
          processTypeCode: e.processTypeCode.name && e.processTypeCode || {
            name: 'ALL'
          },
          process: e.process.name.name && e.process || {
            name: {
              name: 'ALL'
            }
          },
          productGroup: e.productGroup.name && e.productGroup || {
              name: 'ALL'
          }
        }))
        updateData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onInquiry = () => {
    onLoadData()
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
          <ListItem key="factoryDefectCauses">
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
              <ListItemText primary="Factory Defect Causes" />
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
            fullWidth
            id="causeClsCode"
            name="causeClsCode"
            label="Cause Cls Code"
            value={searchParams.causeClsCode}
            options={defectCauseDropdown.map(e => ({
              value: e.code, label: e.code
            }))}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="causeClsName"
            name="causeClsName"
            label="Cause Cls Name"
            options={defectCauseDropdown.map(e => ({
              value: e.label, label: e.label
            }))}
            value={searchParams.causeClsName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="causeCode"
            name="causeCode"
            label="Cause Code"
            options={defectCauseDetailDropdown.map(e => ({
              value: e.code, label: e.code
            }))}
            value={searchParams.causeCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="causeName"
            name="causeName"
            label="Cause Name"
            value={searchParams.causeName}
            options={defectCauseDetailDropdown.map(e => ({
              value: e.label, label: e.label
            }))}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="productGroup"
            name="productGroup"
            label="Product Group"
            value={searchParams.productGroup}
            groupId='D015000'
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="processType"
            name="processType"
            label="Process Type"
            value={searchParams.processType}
            groupId='D014000'
            onChange={handleChangeSearchConfig}
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
    setCurrentFactoryDefectCauses([])
    setIsEdit(false)
    
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };
  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };
  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const onClickAdd = () => {
    handleOpenModal();
  };

  const onClickModify = () => {
    if (!selectedDefectCauseId) {
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
    if (!selectedDefectCauseId) {
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
      handleOpenDeleteModal()
    }
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
      setSelectedDefectCauseId(null);
      setCurrentFactoryDefectCauses({});
    }
    if (rowCount === 1) {
      console.log(event.api.getSelectedNodes()[0].data)
      const selectedDefectCause = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedDefectCauseId(selectedDefectCause);
      if (selectedDefectCause) {
        query({
          url: `/v1/factory-defect-cause/${selectedDefectCause}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentFactoryDefectCauses({
              ...data
            });
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
      url: `/v1/factory-defect-cause/${selectedDefectCauseId}`,
      method: 'delete',
      featureCode: 'user.delete'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          setSubmitting(false);
          enqueueSnackbar(translate(`message.factory_defect_causes_was_deleted_successfully`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          handleCloseDeleteModal();
          onLoadData();
          setCurrentFactoryDefectCauses({});
          setSelectedDefectCauseId(null);
          setIsEdit(false)
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
                          disabled={!selectedDefectCauseId}
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
                          disabled={!selectedDefectCauseId}
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
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${isEdit ? translate(`typo.modify`) : translate(`typo.registration`)} Factory Defect Cause`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <FactoryDefectCausesRegisterForm 
                isEdit={isEdit} 
                onCancel={handleCloseModal} 
                currentData={currentFactoryDefectCauses}
                onLoadData={onLoadData} 
                setSelectedDefectCauseId={setSelectedDefectCauseId}
                setIsEdit={setIsEdit} />
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