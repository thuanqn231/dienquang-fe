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
import { getFactoryDefectCause } from '../../redux/slices/factoryDefectCausesManagement';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import OrganizationTree from '../../components/OrganizationTree';
import Page from '../../components/Page';
import { mutate, query } from '../../core/api';
import ApprovalCreate from '../approval/ApprovalCreate';
import { AgGrid, Dropdown, DthButtonPermission, DthDatePicker } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// hooks
import useSettings from '../../hooks/useSettings';
import {getDSClassDropdown, getDSDetailDropdown, getFactoryDefectSymptoms} from '../../redux/slices/factoryDSManagement'
import { setSearchParams, resetSearchParams, } from '../../redux/slices/factorySymtomCauseMappingManagement';
import { getMaterialDropdown } from '../../redux/slices/materialMaster';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { isNullVal } from '../../utils/formatString';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
// import {
//     getDCClassDropdown,
//   } from '../../redux/slices/defectCauseManagement';
// utils
import { fDate } from '../../utils/formatTime';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
// ----------------------------------------------------------------------
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';
import FactoryDefectItemsRegistration from './FactorySymtomCauseMappingRegistration';


const pageCode = 'menu.masterData.production.qualityMasterData.defectItem.symptomCauseMapping';
const tableCode = 'factoryDefectItemsList';

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
  const { searchParams } = useSelector((state) => state.factorySymtomCauseMappingManagement);
  const { defectCausesNameDropdown } = useSelector((state) => state.factoryDefectCausesManagement);
  const { dsClassNameDropdown, dsDetailNameDropdown, dsDetailCodeDropdown, dsClassCodeDropdown, } = useSelector(
    (state) => state.factoryDSManagement
  );
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [rowData, setRowData] = useState([]);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const { selectedWidget } = useSelector((state) => state.page);
  const [columns, setColumns] = useState(null);
  const pageSelectedWidget = selectedWidget[pageCode];
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [action, setAction] = useState('')
  const [causes, setCauses] = useState('')
  const [currentCauses, setCurrentCauses] = useState([])


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
    dispatch(getFactoryDefectCause());
    dispatch(getDSClassDropdown())
    dispatch(getDSDetailDropdown())
  }, [dispatch]);;

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };


  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setCauses(null)
    }
    if (rowCount === 1) {
      const selectedCauses = event.api.getSelectedNodes()[0].data;
      console.log(selectedCauses)
      const loadData = {}
      setCauses(selectedCauses)
      query({
        url: `/v1/symptom-cause-mapping/${selectedCauses.factoryPk}`,
        featureCode: 'user.create',
      })
        .then((res) => {
          loadData.causeForm = res.data
        })
        .catch((error) => {
          console.error(error);
        });
        query({
          url: `/v1/symptom-cause-mapping/load`,
          featureCode: 'user.create',
          params: {
            productGroup: selectedCauses.productGroup.code,
            SympCode: selectedCauses.defectSymptomDetail.code,
            processType: selectedCauses.processType.code,
            process: selectedCauses.process.factoryPk,
            factoryCode: selectedCauses.pk.factoryCode
          }
        })
          .then((res) => {
            loadData.causeList = res.data
          })
          .catch((error) => {
            console.error(error);
          });
      setCurrentCauses(loadData)
    }
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

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    onLoadData();
  };

  const onLoadData = () => {
    const params = {};
    if (searchParams.sympClsCode) {
      params.sympClsCode = searchParams.sympClsCode;
    }
    if (searchParams.sympClsName) {
      params.sympClsName = searchParams.sympClsName;
    }
    if (searchParams.sympCode) {
      params.SympCode = searchParams.sympCode;
    }
    if (searchParams.sympName) {
      params.SympName = searchParams.sympName;
    }
    if (searchParams.causeCode) {
      params.causeCode = searchParams.causeCode;
    }
    if (searchParams.causeName) {
      params.causeName = searchParams.causeName;
    }
    if (searchParams.productGroup) {
      params.productGroup = searchParams.productGroup;
    }
    if (searchParams.processType) {
      params.processType = searchParams.processType;
    }
    if (searchParams.state) {
      params.finalYn = searchParams.state;
    }
    parseOrgSearchAll(params, parseSelectedTree);

    query({
      url: '/v1/symptom-cause-mapping/search',
      featureCode: 'user.create',
      params
    })
      .then((res) => {
        updateData(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };
  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal()
  }

  const onClickModify = () => {
    setIsEdit(true)
    handleOpenModal()
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

  const onClickDelete = () => {
    handleOpenDeleteModal()
  }

  

  

  const handleDeleteSympCauseMapping = async () => {
    await mutate({
      url: `v1/symptom-cause-mapping/${causes?.factoryPk}`,
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
          <ListItem key="factoryDefectItems">
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
              <ListItemText primary="Factory Symptom-Cause Mapping" />
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
            id="sympClsCode"
            name="sympClsCode"
            label="Symp Cls Code"
            value={searchParams.sympClsCode}
            onChange={handleChangeSearchConfig}
            options={dsClassCodeDropdown}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="sympClsName"
            name="sympClsName"
            label="Symp Cls Name"
            value={searchParams.sympClsName}
            options={dsClassNameDropdown}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="sympCode"
            name="sympCode"
            label="Symp Code"
            value={searchParams.sympCode}
            options={dsDetailCodeDropdown}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="sympName"
            name="sympName"
            label="Symp Name"
            value={searchParams.sympName}
            onChange={handleChangeSearchConfig}
            options={dsDetailNameDropdown}
            sx={{ my: 1 }}
            size="small"
          />
          <Dropdown
            fullWidth
            id="causeCode"
            name="causeCode"
            label="Cause Code"
            value={searchParams.causeCode}
            options={defectCausesNameDropdown}
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
            options={defectCausesNameDropdown}
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
            groupId="D015000"
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
        />
            <Dropdown
            fullWidth
            id="processType"
            name="processType"
            label="Process Type"
            groupId="D014000"
            value={searchParams.processType}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
        />
            <Dropdown
            fullWidth
            id="state"
            name="state"
            label="Use (Y/N)"
            value={searchParams.state}
            onChange={handleChangeSearchConfig}
            options={[
              {label: 'Y', value: 'RUNNING'},
              {label: 'N', value: 'HIDDEN'}
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
                            disabled={!causes}
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
                            disabled={!causes}
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
                  className={themeAgGridClass}
                  onGridReady={onGridReady}
                  onSelectionChanged={onSelectionChanged}
                  rowSelection="single"
                  width="100%"
                  height="100%"
                />
              </Card>
              <DialogDragable
                title={`${isEdit ? 'Register' : 'Modify'} Factory SympTom-Cause Mapping`}
                maxWidth="lg"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <FactoryDefectItemsRegistration
                  isEdit={isEdit}
                  currentData={currentCauses}
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
                  <LoadingButton type="button" variant="contained" onClick={handleDeleteSympCauseMapping}>
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
