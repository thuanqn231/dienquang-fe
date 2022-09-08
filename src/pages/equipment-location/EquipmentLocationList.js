import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionDetails,
  DialogActions,
  AccordionSummary,
  Box,
  Button,
  Card, Checkbox, Container, FormControlLabel, FormGroup, Grid, IconButton, List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField, Tooltip, Typography
} from '@material-ui/core';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { LoadingButton } from '@material-ui/lab';
import { createStyles, makeStyles } from '@material-ui/styles';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useState, useRef } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable } from '../../components/animate';
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
import { setSearchParams, setOperations, resetSearchParams, resetOperation } from '../../redux/slices/equipmentLocationManagement';
import { setSelectedWidget } from '../../redux/slices/page';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// utils
import { getGridConfig, getPageName, parseOrgSearchFactory } from '../../utils/pageConfig';
import { setGridDataSource, clearGridData } from '../../utils/gridUtils';
import { stopPropagation } from '../../utils/pageUtils';

// ----------------------------------------------------------------------
import {
  handleRequestAdjust,
  handleQueryStockMovement,
  handleValidateBeforeProcess,
  OperationEnum,
  OperationCode,
  ScanLabelEnum
} from './helper';

// *change Equip ID Code Scan and Equip. Location Scan

const pageCode = 'menu.production.resourceManagement.equipmentManagement.equipmentLocation.equipmentLocation';


const useStyles = makeStyles((theme) =>
  createStyles({
    inputScanner: {
      '& .MuiFilledInput-root': {
        background: '#ffff00',
        fontSize: '1.2rem',
        width: '50%',
        alignSelf: 'center'
      },
      '& .MuiFilledInput-input': {
        textAlign: 'center',
        padding: theme.spacing(1)
      },
      '& .MuiFormHelperText-root': {
        width: '50%',
        alignSelf: 'center'
      }
    },
    customAccordionSummary: {
      justifyContent: 'space-between !important',
      alignItems: 'center'
    }
  })
);

export default function EquipmentLocation() {
  const classes = useStyles()
  const dispatch = useDispatch();
  const { translate, currentLang } = useLocales();
  const { selectedWidget } = useSelector((state) => state.page);
  const { userGridConfig, funcPermission, commonDropdown, user } = useAuth();
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [hideFilters, setHideFilters] = useState(false);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [parseSelectedTree, setParseSelectedTree] = useState();
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  // * new 1
  const [isOpenActionModal, setOpenActionModal] = useState(false);
  const [operationType, setOperationType] = useState('D035001');
  const [scanStatus, setScanStatus] = useState(true);
  const [boxLabelScanner, setBoxLabelScanner] = useState('');
  const [boxLabelScanner2, setBoxLabelScanner2] = useState('');
  const { searchParams, operations } = useSelector((state) => state.equipmentLocationManagement);
  const [errorMessage, setErrorMessage] = useState({});
  const [factories, setFactories] = useState([]);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [tableCode, setTableCode] = useState('equipmentLocationListStock');
  const [isOpenAdjustResultModal, setOpenAdjustResultModal] = useState(false);
  const [adjustmentResult, setAdjustmentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    setFactories(factories);
  }, [user]);

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
      const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [userGridConfig, selectedWidget, tableCode]);

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
    setBoxLabelScanner('');
    setBoxLabelScanner2('');
    if (gridApi) {
      onLoadData();
    }
  }, [operationType])

  const handleParseSelectedTree = (selected) => {
    setParseSelectedTree(selected);
  };

  const clear = () => {
    setBoxLabelScanner('')
    setBoxLabelScanner2('')
    dispatch(resetOperation())
  }

  const handleChangeSearchConfig = (event) => {
    const _search = {
      ...searchParams,
      [event.target.name]: `${event.target.value}`
    };
    dispatch(setSearchParams(_search));
  };

  const onInquiry = () => {
    onLoadData();
  };

  const resetSearchParam = () => {
    dispatch(resetSearchParams());
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
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

  const onClickProcess = () => {
    const validateResult = handleValidateBeforeProcess(operationType, operations, boxLabelScanner, boxLabelScanner2);
    const { isValid, error } = validateResult;

    setErrorMessage(error);
    if (isValid) {
      handleOpenModal(true);
    }
  };

  const onGridReady = (params) => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };
  // * fix this later

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const onLoadData = () => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
    const { zone, storage, bin, line, process, workStation, ..._searchPars } = searchParams;
    if (zone) _searchPars.zone = zone;
    if (storage) _searchPars.stock = storage;
    if (bin) _searchPars.bin = bin;
    if (line) _searchPars.line = line;
    if (process) _searchPars.process = process;
    if (workStation) _searchPars.workStation = workStation;
    parseOrgSearchFactory(_searchPars, parseSelectedTree);
    try {
      setGridDataSource(gridApi, '/v1/equipment-location/search-v2', { ..._searchPars, operationType })
    } catch (error) {
      clearGridData(gridApi);
      console.error(error);
    }
  }

  const onScanBoxLabel = (type) => {
    if (!boxLabelScanner) {
      enqueueSnackbar(translate(`message.please_scan_box_label`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      setScanStatus(false);
      return;
    }
    handleQueryLabel(type);
  };

  const handleQueryLabel = async (scanType) => {
    try {
      const _operation = await handleQueryStockMovement(
        scanType,
        scanType === ScanLabelEnum.SCAN_LABEL_2 ? boxLabelScanner2 : boxLabelScanner,
        operationType,
        operations
      );
      dispatch(setOperations(_operation));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeOperations = (event) => {
    const { name } = event.target;
    const { value } = event.target;
    const { parentKey, childKey } = parseKeyOperation(name);
    const parentObj = {
      [parentKey]: {
        ...operations[parentKey],
        [childKey]: value
      }
    };

    const _operations = {
      ...operations,
      ...parentObj
    };
    dispatch(setOperations(_operations));
  };

  const parseKeyOperation = (keys) => {
    const keySplit = keys.split('.');
    const [parentKey, ...childKey] = keySplit;
    return {
      parentKey,
      childKey
    };
  };

  const handleProcessRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await handleRequestAdjust(operationType, operations);
      const { data } = res;
      setIsSubmitting(false);
      handleCloseModal();
      setAdjustmentResult(data?.stockMovementAdjustmentHistory?.operationNo);
      handleOpenAdjustResultModel();
      onLoadData()
    } catch (error) {
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  const handleOpenAdjustResultModel = () => {
    setOpenAdjustResultModal(true);
  };

  const handleCloseAdjustResultModel = () => {
    setOpenAdjustResultModal(false);
  };

  const ACCORDIONS = [
    {
      value: `panel1`,
      heading: `Organization`,
      defaultExpanded: true,
      detail: <OrganizationTree renderAll parseSelected={handleParseSelectedTree} />,
      maxHeight: '30vh'
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
            id='materialType'
            name='materialType'
            label='Material Type'
            value='EQUIPMENT'
            // groupId='D003008'
            disabled
          />
          <TextField
            fullWidth
            id="equipmentCode"
            name="equipmentCode"
            label="Equip. Code"
            value={searchParams.equipmentCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
            autoComplete='off'
          />
          <TextField
            fullWidth
            id="equipmentIDCode"
            name="equipmentIDCode"
            label="Equip. ID Code"
            value={searchParams.equipmentIDCode}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
            autoComplete='off'
          />
          <TextField
            fullWidth
            id="equipmentIDName"
            name="equipmentIDName"
            label="Equip. ID Name"
            value={searchParams.equipmentIDName}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
            autoComplete='off'
          />
          <TextField
            fullWidth
            id="targetEquipId"
            name="targetEquipId"
            label="Target Equip. ID"
            value={searchParams.targetEquipId}
            onChange={handleChangeSearchConfig}
            sx={{ my: 1 }}
            size="small"
            autoComplete='off'
          />
          {(operationType === OperationEnum.STOCK_IN || operationType === OperationEnum.STOCK_OUT) && (<>
            <Dropdown
              id="storage"
              name="storage"
              label="Storage"
              sx={{ my: 1 }}
              defaultValue=""
              value={searchParams.storage}
              onChange={handleChangeSearchConfig}
              options={commonDropdown.stockDropdown.filter((stock) => stock.stockType === 'D003008')}
              size="small"
            />
            <Dropdown
              id="zone"
              name="zone"
              label="Zone"
              sx={{ my: 1 }}
              defaultValue=""
              value={searchParams.zone}
              onChange={handleChangeSearchConfig}
              options={commonDropdown.zoneDropdown}
              size="small"
            />
            <Dropdown
              id="bin"
              name="bin"
              label="Bin"
              sx={{ my: 1 }}
              defaultValue=""
              value={searchParams.bin}
              onChange={handleChangeSearchConfig}
              options={commonDropdown.binDropdown}
              size="small"
            />
          </>)}
          {operationType === OperationEnum.LINE_ASSIGN && (
            <>
              <Dropdown
                id="line"
                name="line"
                label="Line"
                sx={{ my: 1 }}
                defaultValue=""
                value={searchParams.line}
                onChange={handleChangeSearchConfig}
                options={commonDropdown.lineDropdown}
                size="small"
              />
              <Dropdown
                id="process"
                name="process"
                label="Process"
                sx={{ my: 1 }}
                defaultValue=""
                value={searchParams.process}
                onChange={handleChangeSearchConfig}
                options={commonDropdown.processDropdown}
                size="small"
              />
              <Dropdown
                id="workStation"
                name="workStation"
                label="Work Station"
                sx={{ my: 1 }}
                defaultValue=""
                value={searchParams.workStation}
                onChange={handleChangeSearchConfig}
                options={commonDropdown.workStationDropdown}
                size="small"
              />
            </>
          )}
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
                  Inquiry
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
                    px: 1,
                    py: 1,
                    borderRadius: '0px',
                    display: 'row',
                    height: 'calc((100% - 30px)/2)',
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="left"
                      display="flex"
                      alignItems="center"
                      sx={{ marginTop: `0 !important`, marginBottom: `1 !important`, width: '30%' }}
                    >
                      <Typography variant="h5" noWrap sx={{ width: '50%' }}>
                        {translate(`typo.operation_type`)}
                      </Typography>
                      <Dropdown
                        fullWidth
                        id="operationType"
                        name="operationType"
                        value={operationType}
                        onChange={(e) => {
                          setOperationType(e.target.value);
                          if (e.target.value === 'D035004') {
                            setTableCode('equipmentLocationList2')
                          }
                          else if (e.target.value === 'D035003') setTableCode('equipmentLocationListLine')
                          else setTableCode('equipmentLocationListStock')
                          clear()
                        }}
                        allowEmptyOption={false}
                        groupId="D035000"

                        // excludes={['D026001', 'D026002', 'D026010', 'D026011']}
                        sx={{ my: 1 }}
                        size="small"
                      />
                    </Stack>
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
                        onClick={clear}
                        size="small"
                        label="Clear"
                        pageCode={pageCode}
                        widgetCode={pageSelectedWidget?.widgetCode}
                        funcType="EXECUTE"
                      />
                      <DthButtonPermission
                        sx={{ marginLeft: 1 }}
                        variant="contained"
                        onClick={onClickProcess}
                        size="small"
                        label="Process"
                        pageCode={pageCode}
                        widgetCode={pageSelectedWidget?.widgetCode}
                        funcType="EXECUTE"
                      />
                    </Stack>
                  </Stack>
                  <Card
                    sx={{
                      px: 1,
                      py: 1,
                      borderRadius: '0px',
                      height: { md: `calc((80vh - 190px)/2)` },
                      overflow: 'auto'
                    }}
                  >

                    {operationType === OperationEnum.STOCK_IN && (
                      <>
                        <TextField
                          // autoFocus
                          variant="filled"
                          className={classes.inputScanner}
                          fullWidth
                          value={boxLabelScanner}
                          onChange={(e) => setBoxLabelScanner(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onScanBoxLabel();
                            }
                          }}
                          placeholder="Focus here to scan"
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errorMessage?.stockIn?.boxNo)}
                          helperText={errorMessage?.stockIn?.boxNo}
                        />
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Typography variant="subtitle2">{translate(`typo.equip_id_code_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="STOCK_IN.equipID.code"
                              name="STOCK_IN.equipID.code"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID"
                              size="small"
                              disabled
                              value={operations.STOCK_IN.equipIDCode}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="STOCK_IN.equipIDName"
                              name="STOCK_IN.equipIDName"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Name"
                              size="small"
                              disabled
                              value={operations.STOCK_IN.equipIDName}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="STOCK_IN.equipIDSpec"
                              name="STOCK_IN.equipIDSpec"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Spec"
                              size="small"
                              disabled
                              value={operations.STOCK_IN.equipIDSpec}
                              onChange={handleChangeOperations}
                            />

                          </Stack>
                          <Typography variant="subtitle2">{translate(`typo.equip_location_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>

                            <Dropdown
                              id="STOCK_IN.storage"
                              name="STOCK_IN.storage"
                              label="Storage"
                              options={commonDropdown.stockDropdown.filter(
                                (stock) => factories.includes(stock.factory) && stock.stockType === 'D003008'
                              )}
                              size="small"
                              required
                              value={operations.STOCK_IN.storage}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.stockIn?.stock}
                            />
                            <Dropdown
                              id="STOCK_IN.zone"
                              name="STOCK_IN.zone"
                              label="Zone"
                              options={commonDropdown.zoneDropdown.filter(
                                (zone) =>
                                  factories.includes(zone.factory) &&
                                  zone.stock === operations.STOCK_IN.storage
                              )}
                              size="small"
                              required
                              value={operations.STOCK_IN.zone}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.stockIn?.zone}
                            />
                            <Dropdown
                              id="STOCK_IN.bin"
                              name="STOCK_IN.bin"
                              label="Bin"
                              options={commonDropdown.binDropdown.filter(
                                (bin) =>
                                  factories.includes(bin.factory) &&
                                  bin.stock === operations.STOCK_IN.storage &&
                                  bin.zone === operations.STOCK_IN.zone
                              )}
                              size="small"
                              required
                              value={operations.STOCK_IN.bin}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.stockIn?.bin}
                            />
                          </Stack>
                        </Stack>
                      </>
                    )}
                    {operationType === OperationEnum.STOCK_OUT && (
                      <>
                        <TextField
                          // autoFocus
                          variant="filled"
                          className={classes.inputScanner}
                          fullWidth
                          value={boxLabelScanner}
                          onChange={(e) => setBoxLabelScanner(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onScanBoxLabel();
                            }
                          }}
                          placeholder="Focus here to scan"
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errorMessage?.stockOut?.boxNo)}
                          helperText={errorMessage?.stockOut?.boxNo}
                        />
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Typography variant="subtitle2">{translate(`typo.equip_id_code_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="equipID"
                              name="equipID"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID"
                              size="small"
                              disabled
                              value={operations.STOCK_OUT.equipIDCode}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDName"
                              name="equipIDName"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Name"
                              size="small"
                              disabled
                              value={operations.STOCK_OUT.equipIDName}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDSpec"
                              name="equipIDSpec"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Spec"
                              size="small"
                              disabled
                              value={operations.STOCK_OUT.equipIDSpec}
                              onChange={handleChangeOperations}
                            />

                          </Stack>
                          <Typography variant="subtitle2">{translate(`typo.equip_location_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>

                            <Dropdown
                              id="STOCK_OUT.stock"
                              name="STOCK_OUT.stock"
                              label="Storage"
                              options={commonDropdown.stockDropdown.filter(
                                (stock) => factories.includes(stock.factory) && stock.stockType === 'D003008'
                              )}
                              size="small"
                              required
                              disabled
                              value={operations.STOCK_OUT.storage}
                              onChange={handleChangeOperations}
                            // errorMessage={errorMessage?.STOCK_OUT?.stock}
                            />
                            <Dropdown
                              id="STOCK_OUT.zone"
                              name="STOCK_OUT.zone"
                              label="Zone"
                              options={commonDropdown.zoneDropdown.filter(
                                (zone) =>
                                  factories.includes(zone.factory) &&
                                  zone.stock === operations.STOCK_OUT.storage
                              )}
                              size="small"
                              required
                              disabled
                              value={operations.STOCK_OUT.zone}
                              onChange={handleChangeOperations}
                            // errorMessage={errorMessage?.STOCK_OUT?.zone}
                            />
                            <Dropdown
                              id="STOCK_OUT.bin"
                              name="STOCK_OUT.bin"
                              label="Bin"
                              options={commonDropdown.binDropdown.filter(
                                (bin) =>
                                  factories.includes(bin.factory) &&
                                  bin.stock === operations.STOCK_OUT.storage &&
                                  bin.zone === operations.STOCK_OUT.zone
                              )}
                              size="small"
                              required
                              disabled
                              value={operations.STOCK_OUT.bin}
                              onChange={handleChangeOperations}
                            // errorMessage={errorMessage?.STOCK_OUT?.bin}
                            />
                          </Stack>
                        </Stack>
                      </>
                    )}
                    {operationType === OperationEnum.LINE_ASSIGN && (
                      <>
                        <TextField
                          // autoFocus
                          variant="filled"
                          className={classes.inputScanner}
                          fullWidth
                          value={boxLabelScanner}
                          onChange={(e) => setBoxLabelScanner(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onScanBoxLabel();
                            }
                          }}
                          placeholder="Focus here to scan"
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errorMessage?.lineAssign?.boxNo)}
                          helperText={errorMessage?.lineAssign?.boxNo}
                        />
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Typography variant="subtitle2">{translate(`typo.equip_id_code_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="equipID"
                              name="equipID"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID"
                              size="small"
                              disabled
                              value={operations.LINE_ASSIGN.equipIDCode}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDName"
                              name="equipIDName"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Name"
                              size="small"
                              disabled
                              value={operations.LINE_ASSIGN.equipIDName}
                              onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDSpec"
                              name="equipIDSpec"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Spec"
                              size="small"
                              disabled
                              value={operations.LINE_ASSIGN.equipIDSpec}
                              onChange={handleChangeOperations}
                            />

                          </Stack>
                          <Typography variant="subtitle2">{translate(`typo.line_info`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>

                            <Dropdown
                              id="LINE_ASSIGN.line"
                              name="LINE_ASSIGN.line"
                              label="Line"
                              options={commonDropdown.lineDropdown.filter(
                                (line) => factories.includes(line.factory)
                              )}
                              size="small"
                              required
                              value={operations.LINE_ASSIGN.line}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.lineAssign?.line}
                            />
                            <Dropdown
                              id="LINE_ASSIGN.process"
                              name="LINE_ASSIGN.process"
                              label="Process"
                              options={commonDropdown.processDropdown.filter(
                                (process) =>
                                  factories.includes(process.factory) &&
                                  process.line === operations.LINE_ASSIGN.line
                              )}
                              size="small"
                              required
                              value={operations.LINE_ASSIGN.process}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.lineAssign?.process}
                            />
                            <Dropdown
                              id="LINE_ASSIGN.workStation"
                              name="LINE_ASSIGN.workStation"
                              label="Work Station"
                              options={commonDropdown.workStationDropdown.filter(
                                (ws) =>
                                  factories.includes(ws.factory) &&
                                  ws.line === operations.LINE_ASSIGN.line &&
                                  ws.process === operations.LINE_ASSIGN.process
                              )}
                              size="small"
                              required
                              value={operations.LINE_ASSIGN.workStation}
                              onChange={handleChangeOperations}
                              errorMessage={errorMessage?.lineAssign?.workStation}
                            />
                          </Stack>
                        </Stack>
                      </>
                    )}
                    {operationType === OperationEnum.EQUIP_ASSIGN && (
                      <>
                        <TextField
                          // autoFocus
                          variant="filled"
                          className={classes.inputScanner}
                          fullWidth
                          value={boxLabelScanner}
                          onChange={(e) => setBoxLabelScanner(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onScanBoxLabel(ScanLabelEnum.SCAN_LABEL_1);
                            }
                          }}
                          placeholder="Focus here to scan"
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errorMessage?.equipAssign?.boxNo1)}
                          helperText={errorMessage?.equipAssign?.boxNo1}
                        />
                        <Stack spacing={1} sx={{ py: 1 }}>
                          <Typography variant="subtitle2">{translate(`typo.equip_id_code_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              id="equipIDCode1"
                              name="equipIDCode1"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDCode1}
                            // onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDName1"
                              name="equipIDName1"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Name"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDName1}
                            // onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDSpec1"
                              name="equipIDSpec1"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Spec"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDSpec1}
                            // onChange={handleChangeOperations}
                            />

                          </Stack>
                          <TextField
                            // autoFocus
                            variant="filled"
                            className={classes.inputScanner}
                            fullWidth
                            value={boxLabelScanner2}
                            onChange={(e) => setBoxLabelScanner2(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                onScanBoxLabel(ScanLabelEnum.SCAN_LABEL_2);
                              }
                            }}
                            placeholder="Focus here to scan"
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errorMessage?.equipAssign?.boxNo2)}
                            helperText={errorMessage?.equipAssign?.boxNo2}
                          />
                          <Typography variant="subtitle2">{translate(`typo.target_equip_id_code_scan`)}</Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>

                            <TextField
                              id="equipIDCode2"
                              name="equipIDCode2"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDCode2}
                            // onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDName2"
                              name="equipIDName2"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Name"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDName2}
                            // onChange={handleChangeOperations}
                            />
                            <TextField
                              id="equipIDSpec2"
                              name="equipIDSpec2"
                              autoComplete="off"
                              fullWidth
                              label="Equip ID Spec"
                              size="small"
                              disabled
                              value={operations.EQUIP_ASSIGN.equipIDSpec2}
                              onChange={handleChangeOperations}
                              error={Boolean(errorMessage?.split?.stockQty1)}
                              helperText={errorMessage?.split?.stockQty1}
                            />
                          </Stack>
                        </Stack>
                      </>
                    )}
                  </Card>
                </Card>
                <Card
                  sx={{
                    px: 1,
                    py: 0,
                    borderRadius: '0px',
                    display: 'row',
                    height: 'calc((100% - 35px)/2)',
                    minHeight: { xs: `calc((80vh - 100px)/2)` }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h5">{translate(`typo.detail_generation_info`)}</Typography>

                  </Stack>
                  <div
                    className={themeAgGridClass}
                    style={{
                      height: '88%',
                      width: '100%'
                    }}
                  >
                    <AgGrid
                      columns={columns}
                      pagination
                      className={themeAgGridClass}
                      onGridReady={onGridReady}
                      // onSelectionChanged={onSelectionPlanChanged}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </Card>
              </>
              <DialogDragable
                title={`${OperationCode[operationType]}`}
                maxWidth="sm"
                open={isOpenActionModal}
                onClose={handleCloseModal}
              >
                <Typography
                  variant="subtitle1"
                  align="center"
                >{`${translate(`typo.do_you_want_to`)} ${OperationCode[operationType]}?`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseModal}>
                    {translate(`button.cancel`)}
                  </Button>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    onClick={handleProcessRequest}
                    loading={isSubmitting}
                    loadingIndicator="Processing..."
                  >{`${OperationCode[operationType]}`}</LoadingButton>
                </DialogActions>
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.information`)}
                maxWidth="sm"
                open={isOpenAdjustResultModal}
                onClose={handleCloseAdjustResultModel}
              >
                <Typography
                  variant="subtitle1"
                  align="center"
                >{`${OperationCode[operationType]} ${translate(`typo.successfully`)}`}</Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseAdjustResultModel} loading={isSubmitting}>
                    {translate(`button.ok`)}
                  </Button>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>

  )
}
