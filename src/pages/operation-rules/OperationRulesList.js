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
import { setSearchParams, resetSearchParams } from '../../redux/slices/operationRulesManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// utils
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { getPageName, getGridConfig, parseOrgSearchFactory } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import OperationRulesRegistrationForm from './OperationRulesRegistrationForm';

// --------------------------------------------------

const pageCode = 'menu.masterData.production.storageMasterData.operationMasterData.operationRules';


const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

export default function OperationRulesList() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { searchParams } = useSelector((state) => state.operationRulesManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, updateAgGridConfig, funcPermission } = useAuth();
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [currentOperationRule, setCurrentOperationRule] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedOperationRulesId, setSelectedOperationRulesId] = useState(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [hideFilters, setHideFilters] = useState(false);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [parseSelectedTree, setParseSelectedTree] = useState();
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
    const tableCode = 'operationRulesList';
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    setColumns(tableConfigs);
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (pageSelectedWidget?.widgetName !== '') {
      const tableCode = 'operationRulesList';
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget]);

  useEffect(() => {
    if (columns) {
      const tableCode = 'operationRulesList';
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

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };


  const onLoadData = () => {
    setSelectedOperationRulesId(null);
    const requestParams = {
      rules: searchParams.rules,
      state: searchParams.state
    }
    parseOrgSearchFactory(requestParams, parseSelectedTree);    
    try {
      setGridDataSource(gridApi, '/v1/operation-rules/search-v2', requestParams)
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  };

  const onInquiry = () => {
    onLoadData();
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
          <Dropdown
            id="rules"
            name="rules"
            label="Rule"
            value={searchParams.rules}
            onChange={handleChangeSearchConfig}
            groupId="D049000"
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

  const onClickAdd = () => {
    setIsEdit(false);
    handleOpenModal();
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onClickModify = () => {
    if (!selectedOperationRulesId) {
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
    if (!selectedOperationRulesId) {
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
    setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const updateGridConfig = async (_columns) => {
    // const tableCode = pageSelectedWidget?.widgetName === 'Loss Master' ? tableLossMasterCode : tableLossCauseCode;
    const tableCode = 'operationRulesList';
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
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedOperationRulesId(null);
    }
    if (rowCount === 1) {
      const selectedOperationRulesId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedOperationRulesId(selectedOperationRulesId);
      if (selectedOperationRulesId) {
        query({
          url: `/v1/operation-rules/${selectedOperationRulesId}`,
          featureCode: 'user.create'
        })
          .then((res) => {
            const { data } = res;
            setCurrentOperationRule({
              factory: data.pk.factoryCode,
              factoryPk: selectedOperationRulesId,
              state: data.state,
              detailOperationType: data.detailOperationType.code,
              operationType: data.operationType.code,
              materialType: data.materialType.code,
              labelType: data.labelType.code,
              rules: data.rules.code
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleDeleteLossMaster = async () => {
    setSubmitting(true);
    await mutate({
      url: `/v1/operation-rules/${selectedOperationRulesId}`,
      method: 'delete',
      featureCode: 'user.delete'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        setSubmitting(false);
        enqueueSnackbar(translate(`message.delete_success`), {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        handleCloseDeleteModal();
        onLoadData();
        setCurrentOperationRule({});
        setSelectedOperationRulesId(null);
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
              title={`${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} Operation Rules`}
              maxWidth="lg"
              open={isOpenActionModal}
              onClose={handleCloseModal}
            >
              <OperationRulesRegistrationForm
                isEdit={isEdit}
                currentData={currentOperationRule}
                onCancel={handleCloseModal}
                onLoadData={onLoadData}
                setCurrentOperationRule={setCurrentOperationRule}
                setSelectedOperationRulesId={setSelectedOperationRulesId}
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
                <LoadingButton type="button" variant="contained" onClick={handleDeleteLossMaster} loading={isSubmitting}>
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