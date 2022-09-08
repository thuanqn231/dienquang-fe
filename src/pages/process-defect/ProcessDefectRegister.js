import arrowIosDownwardFill from '@iconify/icons-eva/arrow-ios-downward-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import { Link as RouterLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { styled, alpha } from '@material-ui/core/styles';
import axios from 'axios';
import * as Yup from 'yup';
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
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Link,
  Checkbox
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import { Form, FormikProvider, useFormik } from 'formik';
import { LoadingButton } from '@material-ui/lab';
import { isEmpty, isUndefined } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogDragable, DialogAnimate } from '../../components/animate';
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
import { setRegistration, resetRegistration, initialState } from '../../redux/slices/procesDefectRegisterManagetment';
import { setSelectedWidget } from '../../redux/slices/page';

// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk, capitalizeFirstChar, isNullVal } from '../../utils/formatString';
import { getGridConfig, getPageName } from '../../utils/pageConfig';
import { stopPropagation } from '../../utils/pageUtils';
import { UploadSingleFile } from '../../components/upload';

// ----------------------------------------------------------------------

import DetailStock from '../gr-result/DetailStock';

const pageCode = 'menu.production.qualityControl.qualityManagement.inspection.processDefect.processDefectRegister';
const tableStockInfo = 'stockInfo';
const tableStockHistory = 'stockHistory';

const pxToRem = (value) => `${value / 16}rem`;
const Input = styled('input')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end'
});

const validateCase = {
  serial: {
    epassNo: 'Please fill in serial information',
    part: 'Please fill in part information',
    line: 'Please fill in line information',
    process: 'Please fill in process information',
    workStation: 'Please fill in work station information',
    symptClass: 'Please fill in symptom class information',
    symptName: 'Please fill in symptom name information'
  },
  model: {
    part: 'Please fill in part information',
    line: 'Please fill in line information',
    process: 'Please fill in process information',
    workStation: 'Please fill in work station information',
    symptClass: 'Please fill in symptom class information',
    symptName: 'Please fill in symptom name information'
  }
};

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
    },
    customImage: {
      '&:hover': {
        cursor: 'pointer'
      }
    }
  })
);

export default function ProcessDefectRegister() {
  const inputRef = useRef(null);
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { funcPermission, userGridConfig, updateAgGridConfig, commonDropdown, user } = useAuth();
  const classes = useStyles();
  const dispatch = useDispatch();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { registrations } = useSelector((state) => state.processDefectRegisterManagement);
  const { selectedWidget } = useSelector((state) => state.page);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isOpenActionModal, setOpenActionModal] = useState(false);

  const [isOpenDetailModal, setOpenDetailModal] = useState(false);
  const [isOpenAdjustResultModal, setOpenAdjustResultModal] = useState(false);
  const [isOpenGenerateModal, setIsOpenGenerateModal] = useState(false);
  const [isOpenCheckModal, setIsOpenCheckModal] = useState(false);
  const [modalAction, setModalAction] = useState('Generate Label');
  const [modalStockAction, setModalStockAction] = useState('Re-Print');
  const [adjustmentResult, setAdjustmentResult] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState(null);
  const [toUpload, setToUpload] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [hideFilters, setHideFilters] = useState(false);
  const [isAllowRegister, setIsAllowRegister] = useState(false);
  const [isAllowDelete, setIsAllowDelete] = useState(false);
  const [isAllowPrint, setIsAllowPrint] = useState(false);
  const [isRePrint, setIsRePrint] = useState(false);
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [selectedEPass, setSelectedEPass] = useState([]);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const [parseSelectedTree, setParseSelectedTree] = useState({ factoryIds: user.factoryIds });

  const [generatedId, setGeneratedId] = useState(null);
  const [labelId, setLabelId] = useState(null);
  const [file, setFile] = useState(null);
  const [deleteLabels, setDeleteLabels] = useState([]);
  const [generateLabels, setGenerateLabels] = useState([]);
  const [registrationType, setRegistrationType] = useState('D062001');
  const [boxLabelScanner, setBoxLabelScanner] = useState('');
  const [boxLabelScanner2, setBoxLabelScanner2] = useState('');
  const [scanStatus, setScanStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [detailParams, setDetailParams] = useState({});
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [totalStock, setTotalStock] = useState(0);
  const [selectedStockId, setSelectedStockId] = useState([]);
  const [isAllowReprint, setIsAllowReprint] = useState(false);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [isPoScanned, setPoScanned] = useState(false);
  const [factories, setFactories] = useState([]);
  const [lineList, setLineList] = useState([]);
  const [processList, setProcessList] = useState([]);
  const [curDefectDetail, setDefectDetail] = useState('');
  const [factoryId, setFactoryId] = useState([]);
  const [curType, setCurType] = useState('serial');
  const [planQty, setPlanQty] = useState(null);

  const [symptClassList, setSymtClassList] = useState([
    {
      value: '',
      label: ''
    }
  ]);
  const [symptDetailList, setSymptDetailList] = useState([
    {
      value: '',
      label: '',
      code: ''
    }
  ]);

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

  //   useEffect(() => {
  //     if (pageSelectedWidget?.widgetName !== '') {
  //       const tableCode = pageSelectedWidget?.widgetName === 'Stock Adjustment' ? tableStockInfo : tableStockHistory;
  //       const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
  //       tableConfigs.forEach((column) => {
  //         column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
  //       });
  //       setColumns(tableConfigs);
  //     }
  //   }, [userGridConfig, selectedWidget]);

  //   useEffect(() => {
  //     if (columns) {
  //       const tableCode = pageSelectedWidget?.widgetName === 'Stock Adjustment' ? tableStockInfo : tableStockHistory;
  //       const tableConfigs = [...columns];
  //       tableConfigs.forEach((column) => {
  //         column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
  //       });
  //       setColumns(tableConfigs);
  //     }
  //   }, [currentLang]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [registrations]);

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  const handleOpenDetailModal = (action) => {
    setOpenDetailModal(true);
    setModalStockAction(action);
  };

  //   useEffect(() => {
  //     if (gridColumnApi) {
  //       if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
  //         onLoadDataAdjustment();
  //       }
  //     }
  //   }, [gridColumnApi]);

  //   useEffect(() => {
  //     if (generatedId) {
  //       if (pageSelectedWidget?.widgetName === 'Stock Adjustment') {
  //         onLoadDataAdjustment();
  //       }
  //     }
  //   }, [generatedId]);

  useEffect(() => {
    const {
      organizationalChartProduction: { factoryPks }
    } = user;
    const factories = factoryPks.map((factory) => factory.factoryCode);
    const factoryId = factoryPks.map((factory) => `${factory.factoryCode}-${factory.id}`);
    setFactories(factories);
    setFactoryId(factoryId);
  }, [user]);

  useEffect(() => {
    if (factories.length === 1 && registrationType) {
      handleClear();
      if (registrationType === 'D062001') {
        setCurType('serial');
      } else {
        setCurType('model');
      }
    }
  }, [factories, registrationType]);

  useEffect(() => {
    if (registrations?.serial?.process || registrations?.model?.process) {
      query({
        url: `v1/symptom/filter-symptom-detail?processPK=${registrations?.serial?.process}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;

            const unique = [];
            const distinct = [];
            for (let i = 0; i < data.length; i += 1) {
              if (!unique[data[i].defectSymptomClass?.factoryPk]) {
                distinct.push(data[i]);
                unique[data[i].defectSymptomClass?.factoryPk] = 1;
              }
            }

            setSymtClassList(distinct);
            setSymptDetailList(data);
          }
        })
        .catch((error) => {
          setSymtClassList([
            {
              value: '',
              label: ''
            }
          ]);
        });
    }
  }, [registrations?.serial?.process, registrations?.model?.process]);

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
  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );
    }
  }, []);

  const onInquiry = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    disableButton();
    setSelectedPlanId(null);

    // updateData(response);
  };
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const disableButton = () => {
    setIsAllowRegister(false);
    setIsAllowDelete(false);
  };

  const handleHideFilters = () => {
    setHideFilters(!hideFilters);
  };
  const handleRemove = () => {
    setFile(null);
  };
  const handleUploadFile = async () => {
    const formData = new FormData();

    formData.append('files', file);

    const accessToken = window.localStorage.getItem('accessToken');
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    try {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.FeatureCode = `code.create`;
      await axios({
        method: 'post',
        url: '/v1/file-storage/upload-multiple',
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        data: formData
      })
        .then((res) => {
          if (res.data.httpStatusCode === 200) {
            isUploadFileSuccess = true;
            uploadFileMessage = res.statusMessage;
            attachedFileIds = res.data.data.map((file) => file.pk.id);
            attachedFilePks = res.data.data.map((file) => file.factoryPk);
          }
        })
        .catch((error) => {
          uploadFileMessage = error;
          console.error(error);
        });
    } catch (error) {
      uploadFileMessage = error;
      console.error(error);
    }
    return {
      isUploadFileSuccess,
      uploadFileMessage,
      attachedFileIds,
      attachedFilePks
    };
  };
  const onRegister = async () => {
    setIsSubmitting(true);
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    if (file) {
      const uploadFile = await handleUploadFile();
      isUploadFileSuccess = uploadFile.isUploadFileSuccess;
      uploadFileMessage = uploadFile.uploadFileMessage;
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }
    const _model = {
      model: {
        productionOrder: {
          factoryPk: registrations.model.factoryPk
        },
        workStation: {
          factoryPk: registrations.model.workStation
        },
        defectQty: registrations.model.defectQuantity,
        defectSymptomDetail: {
          factoryPk: registrations.model.symptName
        },
        reason: curDefectDetail,
        attachedFilePks,
        pk: {
          factoryCode: registrations.model.factory
        },
        registerType: {
          code: registrationType
        }
      }
    };
    const _serial = {
      serial: {
        label: {
          factoryPk: registrations.serial.factoryPk
        },
        workStation: {
          factoryPk: registrations.serial.workStation
        },

        defectSymptomDetail: {
          factoryPk: registrations.serial.symptName
        },
        reason: curDefectDetail,
        attachedFilePks,
        pk: {
          factoryCode: registrations.serial.factory
        },
        registerType: {
          code: registrationType
        }
      }
    };
    if (registrationType === 'D062001') {
      try {
        mutate({
          url: '/v1/process-defect/serial/create',
          featureCode: 'user.create',
          data: _serial
        })
          .then((res) => {
            setIsSubmitting(false);
            handleCloseModal();
            setOpenAdjustResultModal(true);
          })
          .catch((err) => {
            setIsSubmitting(false);
          });
      } catch (err) {
        setIsSubmitting(false);
        console.error(err);
      }
    } else {
      try {
        mutate({
          url: '/v1/process-defect/model/create',
          featureCode: 'user.create',
          data: _model
        })
          .then((res) => {
            setIsSubmitting(false);
            handleCloseModal();
            setOpenAdjustResultModal(true);
          })
          .catch((err) => {
            setIsSubmitting(false);
          });
      } catch (err) {
        setIsSubmitting(false);
        console.error(err);
      }
    }
  };
  const onClickRegister = () => {
    setOpenActionModal(handleValidate());
  };
  const handleValidate = () => {
    if (registrationType === 'D062001') {
      const arr = Object.keys(validateCase.serial);

      for (let i = 0; i < arr.length; i += 1) {
        if (!registrations.serial[arr[i]]) {
          enqueueSnackbar(`${validateCase.serial[arr[i]]}`, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          return false;
        }
      }
    } else {
      const arr = Object.keys(validateCase.model);

      if (!registrations.model.defectQuantity || registrations.model.defectQuantity > planQty) {
        enqueueSnackbar(`Defect quantity must be equal or less than plan quantity`, {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        return false;
      }
      for (let i = 0; i < arr.length; i += 1) {
        if (!registrations.model[arr[i]]) {
          enqueueSnackbar(`${validateCase.model[arr[i]]}`, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          return false;
        }
      }
    }

    return true;
  };

  const actionTooltip = hideFilters ? 'Show' : 'Hide';

  const setSerialData = (data) => {
    const _serial = {
      ...registrations.serial,
      factoryPk: data?.factoryPk,
      epassNo: data?.epassNo,
      poNo: data?.labelDetail?.orderNo,
      modelPk: data?.labelDetail?.material?.factoryPk,
      modelCode: data?.labelDetail?.material?.code,
      modelName: data?.labelDetail?.material?.name,
      modelId: data?.labelDetail?.material?.materialId,
      modelDesc: data?.labelDetail?.material?.description,
      lotNo: data?.labelDetail?.lotNo,
      part: data?.labelDetail?.line?.part?.factoryPk,
      line: data?.labelDetail?.line?.factoryPk
    };

    dispatch(
      setRegistration({
        model: initialState.registrations.model,
        serial: _serial
      })
    );
  };
  const setPoData = (data) => {
    const _model = {
      ...registrations.model,
      lotNo: data[0].lotNo,
      factoryPk: data[0].factoryPk,
      modelCode: data[0].modelId?.parentCode?.code,
      modelName: data[0].modelId?.parentCode?.name,
      modelId: data[0].modelId?.parentCode?.materialId,
      modelDesc: data[0].modelId?.parentCode?.description,

      part: data[0].line?.part?.factoryPk,
      line: data[0].line?.factoryPk
    };

    dispatch(
      setRegistration({
        model: _model,
        serial: initialState.registrations.serial
      })
    );
  };

  const handleChangeRegistrationType = async (event) => {
    const { name } = event?.target;
    const { value } = event?.target;
    const { parentKey, childKey } = parseKeyOperation(name);
    const parentObj = {
      [parentKey]: {
        ...registrations[parentKey],
        [childKey]: value
      }
    };
    if (childKey === 'part') {
      parentObj[parentKey].line = '';
      parentObj[parentKey].process = '';
      parentObj[parentKey].workStation = '';
    }
    if (childKey === 'line') {
      parentObj[parentKey].process = '';
      parentObj[parentKey].workStation = '';
      parentObj[parentKey].symptClass = '';
      parentObj[parentKey].symptName = '';
      parentObj[parentKey].symptCode = '';
    }
    if (childKey === 'symptClass') {
      parentObj[parentKey].symptName = '';
      parentObj[parentKey].symptCode = '';
    }
    if (childKey === 'symptName') {
      if (!event?.target.value) {
        parentObj[parentKey].symptCode = '';
      } else {
        parentObj[parentKey].symptCode = symptDetailList.find(
          (detail) => detail.factoryPk === event?.target.value
        )?.code;
      }
    }

    const _registrations = {
      ...registrations,
      ...parentObj
    };
    dispatch(setRegistration(_registrations));
  };

  const parseKeyOperation = (keys) => {
    const keySplit = keys.split('.');
    return {
      parentKey: keySplit[0],
      childKey: keySplit[1]
    };
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
    }
  ];

  const handleCloseModal = () => {
    setOpenActionModal(false);
  };

  const handleCloseAdjustResultModel = () => {
    handleClear();
    setOpenAdjustResultModal(false);
  };

  const handleOpenModal = () => {
    setOpenActionModal(true);
  };

  const handleCloseGenerateModal = () => {
    setIsOpenGenerateModal(false);
  };

  const handleOpenGenerateModal = () => {
    setIsOpenGenerateModal(true);
  };

  const handleOpenCheckModal = (action) => {
    setIsOpenCheckModal(true);
    setModalAction(action);
  };

  const handleCloseCheckModal = () => {
    setIsOpenCheckModal(false);
  };

  const handleClear = () => {
    setIsSubmitting(false);
    setPlanQty('');
    setDefectDetail('');
    setFile(null);
    setBoxLabelScanner('');
    setPoScanned(false);
    setScanStatus(false);
    if (factories.length === 1) {
      dispatch(
        setRegistration({
          model: {
            ...initialState.registrations.model,
            factory: factories[0]
          },
          serial: {
            ...initialState.registrations.serial,
            factory: factories[0]
          }
        })
      );
    } else {
      enqueueSnackbar(translate(`Please choose factory before clearing`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const onScanBoxLabel = () => {
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
    }
    if (!registrations.serial.factory) {
      enqueueSnackbar(translate(`Please choose factory before scanning`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      setScanStatus(false);
    } else {
      query({
        url: `v1/process-defect/labelNo?labelNo=${boxLabelScanner}&factoryCode=${registrations.serial.factory}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;

            setScanStatus(true);
            setSerialData(data);
          }
        })
        .catch((error) => {
          enqueueSnackbar(error?.data?.statusMessageDetail, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          setScanStatus(false);

          console.error(error);
        });
    }
  };
  const onScanPO = () => {
    if (!registrations?.model?.poNo) {
      enqueueSnackbar('Please fill in PO No before scan', {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      setPoScanned(false);
    }
    if (!registrations.model.factory) {
      enqueueSnackbar(translate(`Please choose factory before scanning`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      setPoScanned(false);
    } else {
      query({
        url: `v1/productionOrder/filter?poNo=${registrations?.model.poNo}&factoryPks=${factoryId[0]}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;

            setPoScanned(true);
            setPoData(data);
            setPlanQty(data[0].planQty);
          }
        })
        .catch((error) => {
          enqueueSnackbar(error?.data?.statusMessageDetail, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          setPoScanned(false);

          console.error(error);
        });
    }
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
                  height: '100%',
                  minHeight: { xs: `calc((80vh - 100px)/2)` }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack
                    direction="row"
                    justifyContent="left"
                    display="flex"
                    alignItems="center"
                    sx={{ marginTop: `0 !important`, marginBottom: `1 !important`, width: '30%' }}
                  >
                    <Typography variant="h5" noWrap sx={{ width: '60%' }}>
                      Registration Type
                    </Typography>

                    <Dropdown
                      fullWidth
                      id="registrationType"
                      name="registrationType"
                      value={registrationType}
                      onChange={(e) => {
                        setRegistrationType(e.target.value);
                      }}
                      allowEmptyOption={false}
                      groupId="D062000"
                      sx={{ my: 1 }}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" sx={{ width: '100%', height: '100%' }} onClick={handleClear}>
                      Clear
                    </Button>
                    <Button onClick={onClickRegister} variant="contained" sx={{ width: '100%', height: '100%' }}>
                      Register
                    </Button>
                  </Stack>
                </Stack>
                <Card
                  sx={{
                    px: 1,
                    borderRadius: '0px',
                    height: 'calc(100% - 60px)',
                    minHeight: { xs: `calc((80vh - 100px))` }
                  }}
                >
                  <>
                    {registrationType === 'D062001' && (
                      <TextField
                        // autoFocus
                        disabled={scanStatus}
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
                        error={Boolean(errorMessage?.serial?.boxNo)}
                        helperText={errorMessage?.serial?.boxNo}
                      />
                    )}

                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={12}>
                        <Stack spacing={2}>
                          {registrationType === 'D062001' ? (
                            <>
                              <Typography variant="subtitle2">Serial Info</Typography>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                  id="serial.epassNo"
                                  name="serial.epassNo"
                                  autoComplete="off"
                                  fullWidth
                                  label="Serial"
                                  size="small"
                                  required
                                  disabled
                                  value={registrations.serial.epassNo}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="serial.poNo"
                                  name="serial.poNo"
                                  autoComplete="off"
                                  fullWidth
                                  label="PO No"
                                  size="small"
                                  disabled
                                  value={registrations.serial.poNo}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="serial.modelCode"
                                  name="serial.modelCode"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Code"
                                  size="small"
                                  disabled
                                  value={registrations.serial.modelCode}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="serial.modelName"
                                  name="serial.modelName"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Name"
                                  size="small"
                                  disabled
                                  value={registrations.serial.modelName}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="serial.modelId"
                                  name="serial.modelId"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model ID"
                                  size="small"
                                  disabled
                                  value={registrations.serial.modelId}
                                  onChange={handleChangeRegistrationType}
                                />
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                  id="serial.modelDesc"
                                  name="serial.modelDesc"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Desc."
                                  size="small"
                                  disabled
                                  value={registrations.serial.modelDesc}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="serial.lotNo"
                                  name="serial.lotNo"
                                  autoComplete="off"
                                  fullWidth
                                  label="Lot No"
                                  size="small"
                                  disabled
                                  value={registrations.serial.lotNo}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="serial.part"
                                  name="serial.part"
                                  label="Part"
                                  options={
                                    (registrations?.serial?.epassNo &&
                                      commonDropdown.partDropdown.filter((part) => factories[0] === part.factory)) ||
                                    []
                                  }
                                  size="small"
                                  required
                                  allowEmptyOption={false}
                                  value={registrations.serial.part}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.serial?.part}
                                />
                                <Dropdown
                                  id="serial.line"
                                  name="serial.line"
                                  label="Line"
                                  options={
                                    commonDropdown.lineDropdown.filter(
                                      (line) => line.part === registrations.serial.part
                                    ) || []
                                  }
                                  size="small"
                                  required
                                  allowEmptyOption={false}
                                  value={registrations.serial.line}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.serial?.line}
                                />
                                <Dropdown
                                  id="serial.process"
                                  name="serial.process"
                                  label="Process"
                                  options={
                                    commonDropdown.processDropdown.filter(
                                      (process) => process.line === registrations.serial.line
                                    ) || []
                                  }
                                  size="small"
                                  allowEmptyOption={false}
                                  required
                                  value={registrations.serial.process}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.serial?.process}
                                />
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <Dropdown
                                  id="serial.workStation"
                                  name="serial.workStation"
                                  autoComplete="off"
                                  fullWidth
                                  options={
                                    commonDropdown.workStationDropdown.filter(
                                      (ws) => ws.process === registrations.serial.process
                                    ) || []
                                  }
                                  label="Work Station"
                                  allowEmptyOption={false}
                                  size="small"
                                  required
                                  value={registrations.serial.workStation}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="serial.symptClass"
                                  name="serial.symptClass"
                                  autoComplete="off"
                                  fullWidth
                                  label="Symptom Class"
                                  size="small"
                                  required
                                  options={
                                    symptClassList?.map((list) => ({
                                      value: list?.defectSymptomClass?.factoryPk,
                                      label: list?.defectSymptomClass?.name
                                    })) || []
                                  }
                                  value={registrations.serial.symptClass}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="serial.symptName"
                                  name="serial.symptName"
                                  label="Symptom Name"
                                  size="small"
                                  required
                                  options={
                                    symptDetailList
                                      ?.filter(
                                        (detail) =>
                                          detail.defectSymptomClass?.factoryPk === registrations?.serial.symptClass
                                      )
                                      .map((list) => ({
                                        value: list?.factoryPk,
                                        label: list?.name,
                                        code: list?.code
                                      })) || []
                                  }
                                  value={registrations.serial.symptName}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.serial?.symptName}
                                />
                                <TextField
                                  id="serial.symptCode"
                                  name="serial.symptCode"
                                  label="Symptom Code"
                                  disabled
                                  size="small"
                                  fullWidth
                                  value={registrations.serial.symptCode}
                                  errorMessage={errorMessage?.serial?.symptCode}
                                />
                                <Dropdown
                                  id="serial.factory"
                                  name="serial.factory"
                                  label="Factory"
                                  size="small"
                                  disabled
                                  fullWidth
                                  value={registrations.serial.factory}
                                  options={commonDropdown.factoryDropdown}
                                  errorMessage={errorMessage?.serial?.factory}
                                />
                              </Stack>
                            </>
                          ) : (
                            <>
                              <Typography variant="subtitle2">Production Info</Typography>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                  id="model.poNo"
                                  disabled={isPoScanned}
                                  name="model.poNo"
                                  autoComplete="off"
                                  fullWidth
                                  label="PO No"
                                  size="small"
                                  value={registrations.model.poNo}
                                  onChange={handleChangeRegistrationType}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      onScanPO();
                                    }
                                  }}
                                />
                                <TextField
                                  id="model.defectQuantity"
                                  name="model.defectQuantity"
                                  autoComplete="off"
                                  type="number"
                                  fullWidth
                                  required
                                  label="Defect Quantity"
                                  size="small"
                                  value={registrations.model.defectQuantity}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="model.modelCode"
                                  name="model.modelCode"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Code"
                                  size="small"
                                  disabled
                                  value={registrations.model.modelCode}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="model.modelName"
                                  name="model.modelName"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Name"
                                  size="small"
                                  disabled
                                  value={registrations.model.modelName}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="model.modelId"
                                  name="model.modelId"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model ID"
                                  size="small"
                                  disabled
                                  value={registrations.model.modelId}
                                  onChange={handleChangeRegistrationType}
                                />
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                  id="model.modelDesc"
                                  name="model.modelDesc"
                                  autoComplete="off"
                                  fullWidth
                                  label="Model Desc."
                                  size="small"
                                  disabled
                                  value={registrations?.model?.modelDesc}
                                  onChange={handleChangeRegistrationType}
                                />
                                <TextField
                                  id="model.lotNo"
                                  name="model.lotNo"
                                  autoComplete="off"
                                  fullWidth
                                  label="Lot No"
                                  size="small"
                                  disabled
                                  value={registrations.model.lotNo}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="model.part"
                                  name="model.part"
                                  label="Part"
                                  options={
                                    (registrations?.model?.modelCode &&
                                      commonDropdown.partDropdown.filter((part) => factories[0] === part.factory)) ||
                                    []
                                  }
                                  size="small"
                                  allowEmptyOption={false}
                                  required
                                  value={registrations.model.part}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.model?.part}
                                />
                                <Dropdown
                                  id="model.line"
                                  name="model.line"
                                  label="Line"
                                  options={
                                    commonDropdown.lineDropdown.filter(
                                      (line) => line.part === registrations.model.part
                                    ) || []
                                  }
                                  size="small"
                                  allowEmptyOption={false}
                                  required
                                  value={registrations.model.line}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.model?.line}
                                />
                                <Dropdown
                                  id="model.process"
                                  name="model.process"
                                  label="Process"
                                  options={
                                    commonDropdown.processDropdown.filter(
                                      (process) => process.line === registrations.model.line
                                    ) || []
                                  }
                                  size="small"
                                  required
                                  value={registrations.model.process}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.model?.process}
                                />
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <Dropdown
                                  id="model.workStation"
                                  name="model.workStation"
                                  autoComplete="off"
                                  fullWidth
                                  label="Work Station"
                                  size="small"
                                  options={
                                    commonDropdown.workStationDropdown.filter(
                                      (ws) => ws.process === registrations.model.process
                                    ) || []
                                  }
                                  required
                                  value={registrations.model.workStation}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="model.symptClass"
                                  name="model.symptClass"
                                  autoComplete="off"
                                  fullWidth
                                  label="Symptom Class"
                                  size="small"
                                  required
                                  options={
                                    symptClassList?.map((list) => ({
                                      value: list?.defectSymptomClass?.factoryPk,
                                      label: list?.defectSymptomClass?.name
                                    })) || []
                                  }
                                  value={registrations.model.symptClass}
                                  onChange={handleChangeRegistrationType}
                                />
                                <Dropdown
                                  id="model.symptName"
                                  name="model.symptName"
                                  label="Symptom Name"
                                  options={
                                    symptDetailList
                                      ?.filter(
                                        (detail) =>
                                          detail.defectSymptomClass?.factoryPk === registrations?.model.symptClass
                                      )
                                      .map((list) => ({
                                        value: list?.factoryPk,
                                        label: list?.name,
                                        code: list?.code
                                      })) || []
                                  }
                                  size="small"
                                  required
                                  value={registrations.model.symptName}
                                  onChange={handleChangeRegistrationType}
                                  errorMessage={errorMessage?.model?.symptName}
                                />
                                <TextField
                                  id="model.symptCode"
                                  name="model.symptCode"
                                  label="Symptom Code"
                                  disabled
                                  size="small"
                                  fullWidth
                                  value={registrations.model.symptCode}
                                  errorMessage={errorMessage?.model?.symptCode}
                                />
                                <Dropdown
                                  id="model.factory"
                                  name="model.factory"
                                  label="Factory"
                                  size="small"
                                  disabled
                                  fullWidth
                                  value={registrations.model.factory}
                                  options={commonDropdown.factoryDropdown}
                                  errorMessage={errorMessage?.model?.factory}
                                />
                              </Stack>
                            </>
                          )}
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            sx={{ justifyItems: 'space-between' }}
                            alignSelf="center"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={20}
                          >
                            <Stack direction="column" spacing={1} width="30vw" height="20vh">
                              <Typography variant="subtitle2">Defect Detail</Typography>
                              <TextField
                                onChange={(e) => setDefectDetail(e?.target.value)}
                                value={curDefectDetail}
                                rows={4.5}
                                multiline
                                id="pmContent"
                                name="pmContent"
                                fullWidth
                              />
                            </Stack>

                            <Stack spacing={1} width="30vw" height="20vh">
                              <Typography variant="subtitle2">Defect Image</Typography>
                              <UploadSingleFile
                                accept="image/*"
                                file={file}
                                onDrop={handleDropSingleFile}
                                onRemove={handleRemove}
                              />
                              <TextField
                                disabled
                                id="input-with-icon-textfield"
                                variant="outlined"
                                sx={{
                                  '.MuiOutlinedInput-root': {
                                    paddingTop: '1rem',
                                    flexDirection: 'column'
                                  },
                                  img: {
                                    paddingRight: '1rem'
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <img height="auto" src={file?.preview} alt="" />
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </>
                </Card>
              </Card>
              <DialogDragable maxWidth="sm" open={isOpenActionModal} onClose={handleCloseModal}>
                <Typography variant="subtitle1" align="center">
                  {`${translate(`typo.do_you_want_to`)} confirm?`}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseModal}>
                    {translate(`button.cancel`)}
                  </Button>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    loading={isSubmitting}
                    loadingIndicator="Processing..."
                    onClick={onRegister}
                  >
                    Confirm
                  </LoadingButton>
                </DialogActions>
              </DialogDragable>
              <DialogDragable
                title={translate(`typo.information`)}
                maxWidth="sm"
                open={isOpenAdjustResultModal}
                onClose={handleCloseAdjustResultModel}
              >
                <Typography variant="subtitle1" align="center">
                  {registrationType === 'D062001'
                    ? `Defect is registered ${boxLabelScanner}`
                    : `Defect is registered ${registrations.model.modelCode}: ${registrations.model.defectQuantity}`}
                </Typography>
                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button type="button" variant="outlined" onClick={handleCloseAdjustResultModel}>
                    {translate(`button.ok`)}
                  </Button>
                </DialogActions>
              </DialogDragable>
            </>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
