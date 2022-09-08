import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import axios from 'axios';
import searchOutLined from '@iconify/icons-ant-design/search-outlined';
import {
  Box,
  Button,
  Card,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Autocomplete
} from '@material-ui/core';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import { isEmpty, isUndefined } from 'lodash-es';
import { LoadingButton, DatePicker } from '@material-ui/lab';

import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker, AgGrid } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
// redux

import { useDispatch, useSelector } from '../../redux/store';
import { fDate, getLocalDateTime, fDateTime } from '../../utils/formatTime';
import { isNullVal, getSafeValue } from '../../utils/formatString';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import { getGridConfig } from '../../utils/pageConfig';

import UploadMultiImage from '../../components/upload/UploadMultiImageFiles';
import { UploadMultiFile } from '../../components/upload';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import ApprovalCreate from '../approval/ApprovalCreate';
import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';

// ----------------------------------------------------------------------

MaintenanceResultForm.propTypes = {
  isView: PropTypes.bool,
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string
};

const equipmentTableCode = 'equipmentList';

const maintenanceContentTableCode = 'maintenanceContentList';

const sparePartCode = 'sparePartList';

export default function MaintenanceResultForm({ isEdit, currentData, onCancel, onLoadData, pageCode, isView }) {
  const startDay = new Date();

  const { equipmentIdDropdown, allEquipmentId } = useSelector((state) => state.equipmentIDManagement);
  const { translate, currentLang } = useLocales();
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { themeAgGridClass } = useSettings();

  const [equipmentRowData, setEquipmentRowData] = useState(currentData.equipmentRowData || []);
  const [maintenanceContentData, setMaintenanceContentData] = useState(
    isEdit || isView ? currentData.maintenanceContentRowData : []
  );
  const [count, setCount] = useState({
    content: 0,
    sparePart: 0,
    file: 0
  });
  const [currentFactoryPk, setCurrentFactoryPk] = useState(null);
  const [sparePartData, setSparePartData] = useState(isEdit || isView ? currentData.sparePartRowData : []);
  const [sparePart, setSparePart] = useState(isEdit || isView ? currentData.sparePartUses : []);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [files, setFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState(isEdit || isView ? currentData.imageFiles : []);
  const [attachedFiles, setAttachedFiles] = useState(isEdit || isView ? currentData.curAttachedFiles : []);
  const [toSaveAttachedFilePks, setToSaveAttachedFilePks] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [acceptedImages, setAcceptedImages] = useState([]);
  const [approvalEditor, setApprovalEditor] = useState('');
  const { commonDropdown } = useAuth();

  const [isChangeFactory, setChangeFactory] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [selectedSparePartRowId, setSelectedSparePartRowId] = useState(null);

  const [gridApi, setGridApi] = useState(null);

  const [equipmentColumns, setEquipmentColumns] = useState(null);
  const [sparePartColumns, setSparePartColumns] = useState(null);
  const [curSparePartType, setCurSparePartType] = useState(null);
  const [maintenanceContentColumns, setMaintenanceContentColumns] = useState(null);
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);

  const [selectedMaintenanceRowId, setSelectedMaintenanceRowId] = useState(null);

  const [curMaintenanceType, setCurMaintenanceType] = useState(null);
  const [maintenanceContent, setMaintenanceContent] = useState(isEdit || isView ? currentData.maintenanceContents : []);
  const [toSubmitFiles, setToSubmitFiles] = useState([]);

  const [isApproved, setIsApproved] = useState(false);

  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedEquipmentRowId, setSelectedEquipmentRowId] = useState(null);
  const [maintenanceEquipments, setMaintenanceEquipments] = useState(
    isEdit || isView ? currentData.maintenanceEquipments : []
  );
  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });

  const [openCompose, setOpenCompose] = useState(false);

  const [currentContent, setCurrentContent] = useState('');

  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  const [oldFiles, setOldFiles] = useState(isEdit || isView ? currentData.attachedFiles : []);

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, equipmentTableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${equipmentTableCode}.${column.field}`);
    });
    setEquipmentColumns(tableConfigs);
    const sparePartTableConfigs = getGridConfig([], pageCode, sparePartCode);
    sparePartTableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${sparePartCode}.${column.field}`);
    });
    setSparePartColumns(sparePartTableConfigs);

    const maintenanceContentTableConfigs = getGridConfig([], pageCode, maintenanceContentTableCode);
    maintenanceContentTableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${maintenanceContentTableCode}.${column.field}`);
    });
    setMaintenanceContentColumns(maintenanceContentTableConfigs);
  }, []);

  // useEffect(() => {
  //   if (isEdit || isView) {
  //     if (!allowChange) {
  //       setEquipmentRowData(currentData.equipmentRowData);
  //       setMaintenanceEquipments(currentData.maintenanceEquipments);
  //     }
  //     if (allowChange) {
  //       setEquipmentRowData(equipmentRowData);
  //       setPicRowData(picRowData);
  //     }
  //   }
  // });

  // useEffect(() => {
  //   if (allowChange) {
  //     setMaintenanceEquipments(maintenanceEquipments);
  //   }
  // }, [maintenanceEquipments]);

  useEffect(() => {
    const difference = acceptedFiles?.filter((file) => attachedFiles.every((curFile) => curFile.name !== file.name));
    setAttachedFiles([...attachedFiles, ...difference]);
    setFiles([...files, ...difference]);
  }, [acceptedFiles]);

  useEffect(() => {
    const difference = acceptedImages?.filter((file) => imageFiles.every((curFile) => curFile.name !== file.name));
    setImageFiles([...imageFiles, ...difference]);
    setFiles([...files, ...difference]);
  }, [acceptedImages]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const getDropdown = (array, option1, option2, values) => {
    const _array = array
      .filter((equipment) => equipment[option1].value === values[option1])
      .map((equipment) => equipment[option2]);
    const newArray = _array.reduce(
      (previous, current) =>
        [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
      []
    );

    return newArray;
  };

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
      setFieldValue('pmType', '');
      setFieldValue('pmActualDate', fDate(startDay));
      setFieldValue('itemCheck', '');
      setFieldValue('startTime', '');
      setFieldValue('endTime', '');
      setFieldValue('detailContent', '');
      setMaterialCode({ value: '', label: '' });
      setFieldValue('materialId', '');
      setFieldValue('materialDescription', '');
      setFieldValue('result', true);
      setFieldValue('issuedQty', '');
      setFieldValue('usedQty', '');
      setFieldValue('scrap', '');
      setFiles([]);
      setCount({});
      setEquipmentRowData([]);
      setMaintenanceEquipments([]);
      setSparePartData([]);
      setSparePart([]);
      setMaintenanceContentData([]);
      setMaintenanceContent([]);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  };

  const MsgPopup = (msg, type) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const handleChangeFactory = (event) => {
    const {
      target: { value }
    } = event;
    setCurrentFactory(value);
    if (currentFactory !== '' && currentFactory !== value) {
      setChangeFactory(true);
    } else {
      setFieldValue('factory', value);
    }
  };
  const handleDropMultiImage = useCallback(
    (acceptedFiles) => {
      setAcceptedImages(
        acceptedFiles
          .filter(
            (file) =>
              (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') &&
              file.size < 1048576
          )
          .map((file, numb) => {
            setCount({
              ...count,
              file: numb + count.file + 1
            });
            return Object.assign(file, {
              preview: URL.createObjectURL(file),
              newId: numb + count.file + 1
            });
          })
      );
    },
    [setAcceptedImages, count]
  );

  const onSubmitApprovalSuccess = (factoryPk) => {
    onCancel();
    onLoadData();
  };

  const isAllowed = () => {
    if (isEmpty(maintenanceEquipments)) {
      setIsOpenConfirmModal(false);

      handlePopup('warning', 'Please add equipment');
    } else {
      handleOpenConfirmModal();
    }
  };

  const onCreateMaintenance = async (toSave = false) => {
    validateForm();
    setSubmitting(true);

    const maintenanceEquipment = {
      pmSchedule: {
        pmType: {
          code: values?.pmType
        },
        pmContent: values?.pmContent || ''
      },
      equipmentID: {
        factoryPk: maintenanceEquipments[0]?.equipmentID?.factoryPk
      }
    };

    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];

    if (!isEmpty(files)) {
      const uploadFile = await handleUploadFiles();
      isUploadFileSuccess = uploadFile.isUploadFileSuccess;
      uploadFileMessage = uploadFile.uploadFileMessage;
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }

    if (!isEdit) {
      mutate({
        url: '/v1/pm-result/create',
        featureCode: 'user.create',
        data: {
          pmResult: {
            maintenanceEquipment,
            actualPMDate: fDate(values.pmActualDate),
            approvalStatus: {
              code: 'D018001'
            },
            attachedFilePks: !isEmpty(oldFiles)
              ? [...oldFiles.map((file) => file.factoryPk), ...attachedFilePks]
              : attachedFilePks,
            maintenanceContents:
              (!isEmpty(maintenanceContent) &&
                maintenanceContent.map((data) => ({
                  itemCheck: data.itemCheck,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  detailContent: data.detailContent,
                  result: data.result
                }))) ||
              [],
            sparePartUses:
              (!isEmpty(sparePart) &&
                sparePart.map((data) => ({
                  material: data.material,
                  issueQty: data.issueQty,
                  returnQty: data.returnQty,
                  scrapLossQty: data.scrapLossQty,
                  usedQty: data.usedQty
                }))) ||
              [],
            state: 'RUNNING',
            pk: {
              factoryCode: values?.factory
            }
          }
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            if (toSave) {
              handlePopup('success', 'Maintenance is saved successfully');
              onLoadData();
              handleCloseConfirmModal();
              onCancel();
            } else if (!toSave) {
              setCurrentFactoryPk(res.data.factoryPk);

              setToSubmitFiles([...attachedFiles, ...imageFiles]);
              setToSaveAttachedFilePks(res.data.attachedFilePks);

              onClickRaiseApproval(res.data.factoryPk, res.data.pk.factoryName, maintenanceContentData, sparePartData);
            }
          }
        })
        .catch((err) => console.error(err));
    }
    if (isEdit) {
      mutate({
        url: '/v1/pm-result/update',
        featureCode: 'user.create',
        data: {
          pmResult: {
            factoryPk: currentData.factoryPk || currentFactoryPk,
            actualPMDate: fDate(values.pmActualDate),
            attachedFilePks: [...oldFiles.map((file) => file.factoryPk), ...attachedFilePks],
            maintenanceContents:
              (!isEmpty(maintenanceContent) &&
                maintenanceContent.map((data) => ({
                  itemCheck: data.itemCheck,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  detailContent: data.detailContent,
                  result: data.result
                }))) ||
              [],
            sparePartUses:
              (!isEmpty(sparePart) &&
                sparePart.map((data) => ({
                  material: data.material,
                  issueQty: data.issueQty,
                  returnQty: data.returnQty,
                  scrapLossQty: data.scrapLossQty,
                  usedQty: data.usedQty
                }))) ||
              [],
            state: 'RUNNING'
          }
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            if (toSave) {
              handlePopup('success', 'Maintenance is saved successfully');
              onLoadData();
              handleCloseConfirmModal();
              onCancel();
            } else if (!toSave) {
              setCurrentFactoryPk(res.data.factoryPk);

              setToSubmitFiles([...attachedFiles, ...imageFiles]);
              setToSaveAttachedFilePks(res.data.attachedFilePks);
              setSubmitting(false);

              onClickRaiseApproval(res.data.factoryPk, res.data.pk.factoryName, maintenanceContentData, sparePartData);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setAcceptedFiles(
        acceptedFiles.map((file, numb) => {
          setCount({
            ...count,
            file: numb + count.file + 1
          });
          return Object.assign(file, {
            preview: URL.createObjectURL(file),
            newId: numb + count.file + 1
          });
        })
      );
    },

    [setAcceptedFiles, count]
  );

  const handleAddEquipment = async () => {
    setSubmitting(true);
    if (
      isEmpty(values.factory) ||
      isEmpty(values.part) ||
      isEmpty(values.lineCode) ||
      isEmpty(values.processCode) ||
      isEmpty(values.workStation) ||
      isEmpty(values.equipIdCode)
    ) {
      setSubmitting(false);
      handlePopup('warning', translate('Please fill in equipment information'));
    } else if (maintenanceEquipments.length > 1) {
      handlePopup('warning', translate('Accept only 1 equipment'));
    } else {
      const currentEquipment = equipmentIdDropdown.filter((equipment) => equipment.value === values.equipIdCode);

      query({
        url: `/v1/equipment-id/search?code=${currentEquipment[0].label}&state=RUNNING`,
        featureCode: 'user.create'
      }).then((res) => {
        const { data } = res;
        if (isEmpty(data)) {
          setSubmitting(false);
          handlePopup('warning', translate(`message.this_equipment_does_not_exist`));
        } else {
          setSubmitting(false);
          let newEquipmentRowData = [];
          const isExisted = equipmentRowData.findIndex((equipment) => equipment.code === data[0].code);
          if (isExisted === -1) {
            newEquipmentRowData.push(data[0]);

            setEquipmentRowData([
              {
                equipmentPart: newEquipmentRowData[0].equipmentPart?.name,
                equipmentLine: newEquipmentRowData[0].equipmentLine?.name,
                equipmentProcess: newEquipmentRowData[0].equipmentProcess?.name.name,
                equipmentWorkStation: newEquipmentRowData[0].equipmentWorkStation?.name,
                code: newEquipmentRowData[0].code,
                name: newEquipmentRowData[0].name,
                equipmentSpec: newEquipmentRowData[0].equipmentSpec,
                factoryPk: newEquipmentRowData[0].factoryPk
              },
              ...equipmentRowData
            ]);
            setMaintenanceEquipments([
              {
                equipmentID: {
                  factoryPk: newEquipmentRowData[0].factoryPk
                }
              }
            ]);
            newEquipmentRowData = [];
            setFieldValue('part', '');
            setFieldValue('lineCode', '');
            setFieldValue('processCode', '');
            setFieldValue('workStation', '');
            setFieldValue('equipIdCode', '');
          }
        }
      });
    }
  };

  const handleAddMaintenanceContent = () => {
    if (!values.factory || !values.itemCheck || !values.startTime || !values.endTime) {
      handlePopup('warning', 'Please fill in content information');
    } else if (new Date(values.endTime) < new Date(values.startTime)) {
      handlePopup('warning', 'End time must be equal or greater than start time');
    } else {
      setFieldValue('itemCheck', '');
      setFieldValue('result', true);
      setFieldValue('endTime', '');
      setFieldValue('startTime', '');
      setFieldValue('detailContent', '');

      setCount({
        ...count,
        content: count.content + 1
      });
      setMaintenanceContent([
        ...maintenanceContent,
        {
          detailContent: values?.detailContent,
          result: values.result,
          endTime: getLocalDateTime(values.endTime),
          startTime: getLocalDateTime(values.startTime),
          itemCheck: values.itemCheck,
          id: count.content + 1
        }
      ]);
      setMaintenanceContentData([
        ...maintenanceContentData,
        {
          itemCheck: values.itemCheck,
          pmTime: `${fDateTime(values.startTime)} ~ ${fDateTime(values.endTime)}`,
          result: values.result ? 'OK' : 'NG',
          detailContent: values?.detailContent,
          id: count.content + 1
        }
      ]);
      setCurMaintenanceType(null);
    }
  };

  const handleAddSparePart = () => {
    if (!materialCode.value || values.issuedQty === '' || values.usedQty === '' || values.scrap === '') {
      handlePopup('warning', 'Please fill in spare part information');
    } else if (
      Number(values.issuedQty) < 0 ||
      Number(values.usedQty) < 0 ||
      Number(values.scrap) < 0 ||
      Number(values.issuedQty) < Number(values.usedQty) + Number(values.scrap)
    ) {
      handlePopup('warning', 'Invalid Quantity');
    } else {
      setFieldValue('issuedQty', '');
      setFieldValue('usedQty', '');
      setFieldValue('scrap', '');
      setFieldValue('materialDescription', '');
      setFieldValue('materialCode', '');
      setFieldValue('materialId', '');
      setMaterialCode({
        label: '',
        value: ''
      });

      setCount({
        ...count,
        sparePart: count.sparePart + 1
      });
      setSparePart([
        ...sparePart,
        {
          material: {
            factoryPk: materialCode.value
          },
          issueQty: Number(values.issuedQty),
          usedQty: Number(values.usedQty),
          scrapLossQty: Number(values.scrap),
          returnQty: Number(values.issuedQty) - (Number(values.usedQty) + Number(values.scrap)),
          id: count.sparePart + 1
        }
      ]);
      setSparePartData([
        ...sparePartData,
        {
          materialCode: materialCode.label,
          materialDescription: values.materialDescription,
          materialId: values.materialId,
          issuedQty: values.issuedQty,
          returnedQty: Number(values.issuedQty) - (Number(values.usedQty) + Number(values.scrap)),
          scrap: values.scrap,
          usedQty: values.usedQty,
          id: count.sparePart + 1
        }
      ]);
    }
  };

  const onClickDeleteMaintenanceContent = () => {
    if (curMaintenanceType === 'new') {
      setMaintenanceContentData(
        maintenanceContentData.filter((data) => data.id && data.id !== selectedMaintenanceRowId)
      );
      setMaintenanceContent(maintenanceContent.filter((data) => data.id && data.id !== selectedMaintenanceRowId));
    }
    if (curMaintenanceType === 'old') {
      setMaintenanceContentData(
        maintenanceContentData.filter((data) => data.factoryPk && data.factoryPk !== selectedMaintenanceRowId)
      );
      setMaintenanceContent(
        maintenanceContent.filter((data) => data.factoryPk && data.factoryPk !== selectedMaintenanceRowId)
      );
    }
  };

  const onClickDeleteSparePart = () => {
    if (curSparePartType === 'new') {
      setSparePartData(sparePartData.filter((data) => data.id && data.id !== selectedSparePartRowId));
      setSparePart(sparePartData.filter((data) => data.id && data.id !== selectedSparePartRowId));
    }
    if (curSparePartType === 'old') {
      setSparePartData(sparePartData.filter((data) => data.factoryPk && data.factoryPk !== selectedSparePartRowId));
      setSparePart(sparePartData.filter((data) => data.factoryPk && data.factoryPk !== selectedSparePartRowId));
    }
  };

  const handleChangeMaterialCode = (materialCode) => {
    const currentMaterialCode = materialDropdown.filter((matr) => matr.value === materialCode);
    setMaterialCode(currentMaterialCode[0] || { value: '', label: '' });
    setFieldValue('materialCode', getSafeValue(materialCode));
    setFieldValue('materialDescription', getSafeValue(currentMaterialCode[0]?.materialDescription));
    setFieldValue('materialId', getSafeValue(currentMaterialCode[0]?.materialId));
  };

  // const handleChangeQty = (issuedQty, usedQty, scrap) => {
  //   if(issuedQty && usedQty && scrap){

  //   }

  // }

  const handleChangeContent = useCallback(
    (e) => {
      setCurrentContent(e?.target?.value);
    },
    [setCurrentContent]
  );

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRemoveAttachedFile = (file) => {
    if (file.newId) {
      setFiles(files.filter((_file) => _file.newId !== file.newId));
      setAttachedFiles(attachedFiles.filter((_file) => _file.newId !== file.newId));
    }
    if (file.factoryPk) {
      setOldFiles(oldFiles.filter((_file) => _file.factoryPk !== file.factoryPk));
      setAttachedFiles(attachedFiles.filter((_file) => _file.factoryPk !== file.factoryPk));
    }
  };
  const handleRemoveImageFile = (file) => {
    if (file.newId) {
      if (!isEmpty(files)) {
        setFiles(files.filter((_file) => _file.newId !== file.newId));
      }

      if (!isEmpty(imageFiles)) {
        setImageFiles(imageFiles.filter((_file) => _file.newId !== file.newId));
      }
    }
    if (file.factoryPk) {
      setOldFiles(oldFiles.filter((_file) => _file.factoryPk !== file.factoryPk));

      setImageFiles(imageFiles.filter((_file) => _file.factoryPk !== file.factoryPk));
    }
  };
  const handleUploadFiles = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      delete file.newId;
      formData.append('files', file);
    });

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

  const handlePopup = (type, msg) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const updateEquipmentData = (data) => {
    setEquipmentRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onEquipmentSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedEquipmentRowId(null);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedEquipmentRowId(selectedId);
    }
  };
  const onMaintenanceSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedMaintenanceRowId(null);
      setCurMaintenanceType(null);
    }
    if (rowCount === 1) {
      if (event.api.getSelectedNodes()[0].data.factoryPk) {
        setSelectedMaintenanceRowId(event.api.getSelectedNodes()[0].data.factoryPk);
        setCurMaintenanceType('old');
      } else {
        setSelectedMaintenanceRowId(event.api.getSelectedNodes()[0].data.id);
        setCurMaintenanceType('new');
      }
    }
  };
  const onSparePartSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedSparePartRowId(null);
      setCurSparePartType(null);
    }
    if (rowCount === 1) {
      if (event.api.getSelectedNodes()[0].data.factoryPk) {
        setSelectedSparePartRowId(event.api.getSelectedNodes()[0].data.factoryPk);
        setCurSparePartType('old');
      } else {
        setSelectedSparePartRowId(event.api.getSelectedNodes()[0].data.id);
        setCurSparePartType('new');
      }
    }
  };

  const handleRemoveAllAttachedFiles = () => {
    const difference1 = files
      .map((_file) => _file.newId && _file)
      .filter((file) => attachedFiles.every((curFile) => curFile.newId !== file.newId));
    const difference2 = oldFiles
      .map((_file) => _file.factoryPk && _file)
      .filter((file) => attachedFiles.every((curFile) => curFile.factoryPk !== file.factoryPk));
    setAttachedFiles([]);
    setFiles(difference1);
    setOldFiles(difference2);
  };

  const handleRemoveAllImageFiles = () => {
    const difference1 = files
      .map((_file) => _file.newId && _file)
      .filter((file) => imageFiles.every((curFile) => curFile.newId !== file.newId));
    const difference2 = oldFiles
      .map((_file) => _file.factoryPk && _file)
      .filter((file) => imageFiles.every((curFile) => curFile.factoryPk !== file.factoryPk));
    setImageFiles([]);
    setFiles(difference1);
    setOldFiles(difference2);
  };

  const onClickRaiseApproval = (pk, factoryName, _maintenance, _sparePart) => {
    const editorValue = generatePmResultHtml(pk, _maintenance, _sparePart, factoryName);

    setApprovalEditor(editorValue);
    setIsApproved(true);
    setApprovalRequestParameters([
      {
        type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
        value: pk
      }
    ]);
    setOpenCompose(true);
  };
  const generatePmResultHtml = (pk, _maintenance, _sparePart, factoryName) =>
    ReactDOMServer.renderToStaticMarkup(
      <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the PM Result with details below:</p>
        <br />
        <br />
        <p>
          <strong>{translate('Maintenance Info')}</strong>
        </p>
        &nbsp;&nbsp;&nbsp;&nbsp;{' '}
        <table key="pm-result-html-generate1" style={{ borderCollapse: 'collapse', width: '80%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>{translate(`label.factory`)}</th>
              <th>{translate(`label.pmType`)}</th>
              <th>{translate(`Actual Date`)}</th>
              <th width="50%">{translate(`PM Content`)}</th>
            </tr>
          </thead>
          <tbody>
            <tr key={`maintenance-info-${pk}`}>
              <td>{factoryName}</td>
              <td>{values?.pmType}</td>
              <td>{fDateTime(values?.pmActualDate)}</td>
              <td>{values?.pmContent}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <br />
        <p>
          <strong>{translate(`Equipment List`)}</strong>
        </p>
        &nbsp;&nbsp;&nbsp;&nbsp;{' '}
        <table key="pm-result-html-generate2" style={{ borderCollapse: 'collapse', width: '80%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>{translate(`label.part`)}</th>
              <th>{translate(`label.line`)}</th>
              <th>{translate(`label.process`)}</th>
              <th>{translate(`label.workStation`)}</th>
              <th>{translate(`label.equipId`)}</th>
              <th>{translate(`label.equipName`)}</th>
              <th>{translate(`label.equipSpec`)}</th>
            </tr>
          </thead>
          <tbody>
            <tr key={currentFactoryPk}>
              <td>{equipmentRowData[0].equipmentPart}</td>
              <td>{equipmentRowData[0].equipmentLine}</td>
              <td>{equipmentRowData[0].equipmentProcess}</td>
              <td>{equipmentRowData[0].equipmentWorkStation}</td>
              <td>{equipmentRowData[0].code}</td>
              <td>{equipmentRowData[0].name}</td>
              <td>{equipmentRowData[0].equipmentSpec}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <br />
        <p>
          <strong>{translate(`Maintenance Content`)}</strong>
        </p>
        &nbsp;&nbsp;&nbsp;&nbsp;{' '}
        <table key="pm-result-html-generate3" style={{ borderCollapse: 'collapse', width: '80%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>{translate(`No`)}</th>
              <th>{translate(`Item Check`)}</th>
              <th>{translate(`PM Time`)}</th>
              <th>{translate(`Result`)}</th>
              <th>{translate(`Detail Content`)}</th>
            </tr>
          </thead>
          <tbody>
            {_maintenance.map((row, n) => (
              <tr key={`maintenance-${n}`}>
                <td key={`maintenance-id-${n}`}>{n + 1}</td>
                <td key={`item-check-${n}`}>{row?.itemCheck}</td>
                <td key={`pm-time-${n}`}>{row?.pmTime}</td>
                <td key={`result-${n}`}>{row?.result}</td>
                <td key={`detail-content-${n}`}>{row?.detailContent}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <br />
        <p>
          <strong>{translate(`Spare Part Uses`)}</strong>
        </p>
        &nbsp;&nbsp;&nbsp;&nbsp;{' '}
        <table key="pm-result-html-generate4" style={{ borderCollapse: 'collapse', width: '80%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>{translate(`No`)}</th>
              <th>{translate(`SP Code`)}</th>
              <th>{translate(`SP Name`)}</th>
              <th>{translate(`SP ID`)}</th>
              <th>{translate(`Issued Qty`)}</th>
              <th>{translate(`Used Qty`)}</th>
              <th>{translate(`Loss/Scrap Qty`)}</th>
              <th>{translate(`Returned Qty`)}</th>
            </tr>
          </thead>
          <tbody>
            {_sparePart.map((row, i) => (
              <tr key={`sparePart-${i}`}>
                <td key={`sparePartId-${i}`}>{i + 1}</td>
                <td key={`material-code-${i}`}>{row?.materialCode}</td>
                <td key={`material-desc-${i}`}>{row?.materialDescription}</td>
                <td key={`material-id-${i}`}>{row?.materialId}</td>
                <td key={`issuedQty-${i}`}>{row?.issuedQty}</td>
                <td key={`usedQty-${i}`}>{row?.usedQty}</td>
                <td key={`scrap-${i}`}>{row?.scrap}</td>
                <td key={`returnQty-${i}`}>{row?.returnedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Thanks and Best Regards.</p>
      </div>
    );

  const onClickSubmit = () => {
    if (!values.factory || !values.pmType || !values.pmActualDate || isEmpty(maintenanceEquipments)) {
      handlePopup('warning', 'Please fill in required information');
    } else {
      handleSubmitPmResult();
    }
  };
  const handleSubmitPmResult = () => {
    onCreateMaintenance();
  };

  const onClickDeleteEquipment = () => {
    if (selectedEquipmentRowId) {
      const currentRowData = equipmentRowData.filter((data) => data.factoryPk !== selectedEquipmentRowId);
      const currentEquipments = currentRowData.map((equip) => ({
        equipmentID: {
          factoryPk: equip.factoryPk
        }
      }));
      setMaintenanceEquipments(currentEquipments);
      updateEquipmentData(currentRowData);

      setSelectedEquipmentRowId(null);
    } else {
      handlePopup('warning', translate(`message.please_select_1_equipment_to_delete`));
    }
  };

  const MaintenancePlanSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    pmType: Yup.string().required('PM Type is required'),
    pmActualDate: Yup.date().required('PM Actual Date is required'),

    pmContent: Yup.string(),
    part: Yup.string(),
    lineCode: Yup.string(),
    processCode: Yup.string(),
    workStation: Yup.string(),
    equipIdCode: Yup.string(),
    notice: Yup.boolean(),
    noticeCycle: Yup.string(),
    noticeBefore: Yup.number(),
    startTime: Yup.string(),
    endTime: Yup.string(),
    materialCode: Yup.string(),
    materialDescription: Yup.string(),
    materialId: Yup.string(),
    issuedQty: Yup.number(),
    usedQty: Yup.number(),
    scrap: Yup.number(),
    returnedQty: Yup.number()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: ((isView || isEdit) && currentData?.pk?.factoryCode) || '',
      pmType: ((isView || isEdit) && currentData?.maintenanceEquipment?.pmSchedule?.pmType.code) || 'D037001',

      pmActualDate: ((isView || isEdit) && currentData?.actualPMDate) || fDate(startDay),
      pmContent: ((isView || isEdit) && currentData?.maintenanceEquipment?.pmSchedule?.pmContent) || '',
      part: '',
      lineCode: '',
      processCode: '',
      workStation: '',
      equipIdCode: '',
      materialCode: '',
      materialDescription: '',
      materialId: '',
      issuedQty: '',
      usedQty: '',
      scrap: '',
      itemCheck: '',
      startTime: '',
      endTime: '',
      detailContent: '',
      result: true
    },
    validationSchema: MaintenancePlanSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (!isView) {
          validateForm();
          isAllowed();
        }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    setSubmitting,
    validateForm,
    resetForm,
    setErrors
  } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Card sx={{ pb: 1 }}>
            <Typography variant="subtitle1" sx={{ pl: 1 }}>
              Maintenance Info
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <Card sx={{ px: 1, py: 1 }}>
                  <Stack spacing={1.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Dropdown
                        {...getFieldProps('factory')}
                        id="factory"
                        name="factory"
                        label={translate(`label.factory`)}
                        size="small"
                        required
                        disabled={isEdit || isView}
                        onChange={handleChangeFactory}
                        options={commonDropdown.factoryDropdown}
                        errorMessage={touched.factory && errors.factory}
                      />
                      <Dropdown
                        {...getFieldProps('pmType')}
                        id="pmType"
                        name="pmType"
                        label={translate(`label.pmType`)}
                        size="small"
                        required
                        allowEmptyOption={false}
                        disabled={isView}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue('pmType', e.target.value);
                        }}
                        groupId="D037000"
                        errorMessage={touched.factory && errors.factory}
                      />

                      <DthDatePicker
                        name="pmActualDate"
                        minDate={startDay}
                        label={translate(`Actual Date`)}
                        disabled={isView}
                        value={values.pmActualDate}
                        size="small"
                        onChange={(newValue) => {
                          setFieldValue('pmActualDate', newValue);
                        }}
                        sx={{ my: 1 }}
                        fullWidth
                        errorMessage={touched.pmActualDate && errors.pmActualDate}
                      />
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 3, sm: 2 }}
                      sx={{ mt: `1 !important` }}
                    >
                      <TextField
                        rows={3}
                        multiline
                        id="pmContent"
                        name="pmContent"
                        disabled={isView}
                        fullWidth
                        label={translate(`label.pmContent`)}
                        {...getFieldProps('pmContent')}
                        onChange={(e) => {
                          handleChangeContent(e);
                          setFieldValue('pmContent', e.target.value);
                        }}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Card>
          <Card sx={{ pb: 1 }}>
            <Typography variant="subtitle1" sx={{ pl: 1 }}>
              {translate(`Equipment List`)}
            </Typography>
            {!isView && !isEdit && (
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('part')}
                      id="part"
                      size="small"
                      name="part"
                      label={translate(`label.part`)}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('lineCode', '');
                        setFieldValue('processCode', '');
                        setFieldValue('workStation', '');
                        setFieldValue('equipIdCode', '');
                      }}
                      options={commonDropdown.partDropdown.filter((part) => part.factory === values.factory)}
                    />
                    <Dropdown
                      {...getFieldProps('lineCode')}
                      id="lineCode"
                      size="small"
                      name="lineCode"
                      label={translate(`label.line`)}
                      disabled={isView}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('processCode', '');
                        setFieldValue('workStation', '');
                        setFieldValue('equipIdCode', '');
                      }}
                      options={() => getDropdown(allEquipmentId, 'part', 'lineCode', values)}
                    />
                    <Dropdown
                      id="processCode"
                      size="small"
                      name="processCode"
                      label={translate(`label.process_code`)}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('workStation', '');
                        setFieldValue('equipIdCode', '');
                      }}
                      disabled={isView}
                      options={() => getDropdown(allEquipmentId, 'lineCode', 'processCode', values)}
                      {...getFieldProps('processCode')}
                    />
                    <Dropdown
                      id="workStation"
                      size="small"
                      name="workStation"
                      label={translate(`label.workStation`)}
                      disabled={isView}
                      options={() => getDropdown(allEquipmentId, 'processCode', 'workStation', values)}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('equipIdCode', '');
                      }}
                      {...getFieldProps('workStation')}
                    />
                    <Dropdown
                      id="equipIdCode"
                      name="equipIdCode"
                      size="small"
                      label={translate(`label.equipIdCode`)}
                      disabled={isView}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('equipIdCode', e?.target.value);
                      }}
                      options={allEquipmentId.filter((equipment) => equipment.workStation.value === values.workStation)}
                      {...getFieldProps('equipIdCode')}
                      errorMessage={touched.equipIdCode && errors.equipIdCode}
                    />
                  </Stack>
                </Stack>
              </Card>
            )}

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'center',
                py: 1,
                pr: 1
              }}
            >
              {!isView && !isEdit && (
                <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
                  <LoadingButton
                    variant="contained"
                    size="small"
                    onClick={handleAddEquipment}
                    loading={isSubmitting}
                    disabled={maintenanceEquipments.length > 0}
                  >
                    {translate(`button.add`)}
                  </LoadingButton>
                  <Button
                    sx={{ marginLeft: 1 }}
                    variant="contained"
                    disabled={!selectedEquipmentRowId}
                    onClick={onClickDeleteEquipment}
                    size="small"
                  >
                    {translate(`button.delete`)}
                  </Button>
                </Stack>
              )}
            </Stack>

            <AgGrid
              columns={equipmentColumns}
              key="equipment"
              rowData={equipmentRowData}
              className={themeAgGridClass}
              onGridReady={onGridReady}
              onSelectionChanged={onEquipmentSelectionChanged}
              rowSelection="single"
              width="100%"
              height="30vh"
            />
          </Card>
          <Card sx={{ pb: 1 }}>
            <Typography variant="subtitle1" sx={{ pl: 1 }}>
              {translate(`Maintenance Content`)}
            </Typography>
            {!isView && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Card sx={{ px: 1, py: 1 }}>
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <TextField
                          {...getFieldProps('itemCheck')}
                          id="itemCheck"
                          name="itemCheck"
                          label={translate(`Item Check`)}
                          size="small"
                          fullWidth
                          disabled={isView}
                          onChange={handleChange}
                        />
                        <TextField
                          id="datetime-local"
                          label={translate(`Start Time`)}
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={values.startTime}
                          InputLabelProps={{
                            shrink: true
                          }}
                          onChange={(e) => {
                            setFieldValue('startTime', e.target.value);
                          }}
                        />

                        <TextField
                          id="datetime-local"
                          label={translate(`End Time`)}
                          type="datetime-local"
                          value={values.endTime}
                          size="small"
                          fullWidth
                          InputLabelProps={{
                            shrink: true
                          }}
                          onChange={(e) => {
                            setFieldValue('endTime', e.target.value);
                          }}
                        />
                      </Stack>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 3, sm: 2 }}
                        sx={{ mt: `1 !important` }}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={8}>
                            <TextField
                              id="detailContent"
                              name="detailContent"
                              size="small"
                              disabled={isView}
                              fullWidth
                              label={translate(`Detail Content`)}
                              {...getFieldProps('detailContent')}
                              onChange={(e) => {
                                handleChangeContent(e);
                                setFieldValue('detailContent', e?.target?.value);
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Dropdown
                              id="result"
                              size="small"
                              name="result"
                              disabled={isView}
                              allowEmptyOption={false}
                              fullWidth
                              label={translate(`Result`)}
                              {...getFieldProps('result')}
                              onChange={(e) => {
                                handleChangeContent(e);
                                setFieldValue('result', e?.target?.value);
                              }}
                              options={[
                                { label: 'OK', value: true },
                                { label: 'NG', value: false }
                              ]}
                            />
                          </Grid>
                        </Grid>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'center',
                py: 1,
                pr: 1
              }}
            >
              {!isView && (
                <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
                  <Button variant="contained" size="small" onClick={handleAddMaintenanceContent}>
                    {translate(`button.add`)}
                  </Button>
                  <Button
                    sx={{ marginLeft: 1 }}
                    variant="contained"
                    disabled={!selectedMaintenanceRowId}
                    onClick={onClickDeleteMaintenanceContent}
                    size="small"
                  >
                    {translate(`button.delete`)}
                  </Button>
                </Stack>
              )}
            </Stack>

            <AgGrid
              columns={maintenanceContentColumns}
              key="maintenance"
              rowData={maintenanceContentData}
              className={themeAgGridClass}
              onGridReady={onGridReady}
              onSelectionChanged={onMaintenanceSelectionChanged}
              rowSelection="single"
              width="100%"
              height="30vh"
            />
          </Card>
          <Grid container>
            <Grid item xs={6}>
              <Card>
                <Stack sx={{ px: 1, py: 2, height: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ mb: 2 }} variant="h6">
                      {translate(`Maintenance Evidence`)}
                    </Typography>
                  </Stack>
                  <UploadMultiImage
                    accept=".jpeg, .jpg, .png"
                    sx={{ mb: 2 }}
                    showPreview
                    isView={isView}
                    disabled={isView}
                    isEdit={isEdit}
                    files={imageFiles}
                    onDrop={handleDropMultiImage}
                    onRemove={handleRemoveImageFile}
                    onRemoveAll={handleRemoveAllImageFiles}
                  />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <Stack sx={{ px: 1, py: 2.9, height: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ mb: 3 }} variant="h6">
                      {translate(`typo.file_attachment`)}
                    </Typography>
                  </Stack>
                  <UploadMultiFile
                    sx={{ mb: 2 }}
                    showPreview={false}
                    files={attachedFiles}
                    disabled={isView}
                    isView={isView}
                    onDrop={handleDropMultiFile}
                    onRemove={handleRemoveAttachedFile}
                    onRemoveAll={handleRemoveAllAttachedFiles}
                  />
                </Stack>
              </Card>
            </Grid>
          </Grid>
          <Card sx={{ pb: 1 }}>
            <Typography variant="subtitle1" sx={{ pl: 1 }}>
              {translate(`Spare Part Uses`)}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                {!isView && (
                  <Card sx={{ px: 1, py: 1 }}>
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                        <Autocomplete
                          id="materialCode"
                          className="materialCode-select"
                          name="materialCode"
                          fullWidth
                          options={materialDropdown.filter(
                            (matr) =>
                              matr.factory === values.factory &&
                              (matr.materialType.code === 'D003005' || matr.materialType.code === 'D003006')
                          )}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) => option.value === value?.value}
                          value={materialCode}
                          onChange={(e, value) => {
                            handleChangeMaterialCode(value?.value);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={Boolean(touched.materialCode && errors.materialCode)}
                              helperText={touched.materialCode && errors.materialCode}
                              name="materialCode"
                              label="SP Code"
                              variant="outlined"
                              fullWidth
                              required
                              size="small"
                            />
                          )}
                        />
                        <TextField
                          {...getFieldProps('materialDescription')}
                          autoComplete="off"
                          fullWidth
                          label="SP Name"
                          size="small"
                          disabled
                          error={Boolean(touched.materialDescription && errors.materialDescription)}
                          helperText={touched.materialDescription && errors.materialDescription}
                        />
                        <TextField
                          {...getFieldProps('materialId')}
                          autoComplete="off"
                          fullWidth
                          label="SP ID"
                          size="small"
                          disabled
                          error={Boolean(touched.materialId && errors.materialId)}
                          helperText={touched.materialId && errors.materialId}
                        />
                      </Stack>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 3, sm: 2 }}
                        sx={{ mt: `1 !important` }}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={3}>
                            <TextField
                              {...getFieldProps('issuedQty')}
                              id="issuedQty"
                              name="issuedQty"
                              size="small"
                              fullWidth
                              label="Issued Qty"
                              onChange={(e) => {
                                handleChangeContent(e);
                                setFieldValue('issuedQty', e?.target?.value);
                              }}
                              error={Boolean(touched.issuedQty && errors.issuedQty)}
                              helperText={touched.issuedQty && errors.issuedQty}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              {...getFieldProps('usedQty')}
                              id="usedQty"
                              name="usedQty"
                              size="small"
                              fullWidth
                              label="Used Qty"
                              onChange={(e) => {
                                handleChangeContent(e);
                                setFieldValue('usedQty', e?.target?.value);
                              }}
                              error={Boolean(touched.usedQty && errors.usedQty)}
                              helperText={touched.usedQty && errors.usedQty}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              {...getFieldProps('scrap')}
                              id="scrap"
                              name="scrap"
                              size="small"
                              fullWidth
                              label="Scrap/Loss Qty"
                              onChange={(e) => {
                                handleChangeContent(e);
                                setFieldValue('scrap', e?.target?.value);
                              }}
                              error={Boolean(touched.scrap && errors.scrap)}
                              helperText={touched.scrap && errors.scrap}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              {...getFieldProps('returnedQty')}
                              id="returnedQty"
                              name="returnedQty"
                              size="small"
                              fullWidth
                              label="Returned Qty"
                              value={values?.issuedQty - values?.usedQty - values?.scrap}
                              disabled
                            />
                          </Grid>
                        </Grid>
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Grid>
            </Grid>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
                alignItems: 'center',
                py: 1,
                pr: 1
              }}
            >
              {!isView && (
                <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
                  <Button type="button" variant="contained" size="small" onClick={handleAddSparePart}>
                    {translate(`button.add`)}
                  </Button>
                  <Button
                    sx={{ marginLeft: 1 }}
                    variant="contained"
                    disabled={!selectedSparePartRowId}
                    onClick={onClickDeleteSparePart}
                    size="small"
                  >
                    {translate(`button.delete`)}
                  </Button>
                </Stack>
              )}
            </Stack>

            <AgGrid
              columns={sparePartColumns}
              key="sparePart"
              rowData={sparePartData}
              className={themeAgGridClass}
              onGridReady={onGridReady}
              onSelectionChanged={onSparePartSelectionChanged}
              rowSelection="single"
              width="100%"
              height="30vh"
            />
          </Card>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            {!isView && (
              <>
                <Button type="submit" variant="contained" loading={isSubmitting}>
                  Save
                </Button>

                <LoadingButton type="button" variant="contained" onClick={onClickSubmit} loading={isSubmitting}>
                  Submit
                </LoadingButton>
              </>
            )}
            <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
              {isView ? `${translate(`button.close`)}` : `${translate(`button.cancel`)}`}
            </Button>
          </DialogActions>

          <DialogAnimate title="Confirm" maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
            <Typography variant="subtitle1" align="center">
              Do you want to save ?
            </Typography>
            <DialogActions>
              <Box sx={{ flexGrow: 1 }} />
              <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
                {translate(`button.cancel`)}
              </Button>
              <LoadingButton
                type="button"
                variant="contained"
                size="small"
                loadingIndicator={translate(`loading.processing`)}
                loading={isSubmitting}
                onClick={() => {
                  onCreateMaintenance(true);
                }}
              >
                Save
              </LoadingButton>
            </DialogActions>
          </DialogAnimate>
          <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
        </Form>
      </FormikProvider>
      {isApproved && (
        <ApprovalCreate
          documentRequestType={DocumentRequestTypeEnum.PM_RESULT}
          isOpenCompose={openCompose}
          onCloseCompose={() => {
            setOpenCompose(false);
            setSubmitting(false);
            onCancel();
          }}
          requestParameters={approvalRequestParameters}
          approvalFiles={toSubmitFiles}
          approvalAttachedPks={toSaveAttachedFilePks}
          isFileAlreadyUploaded
          defaultTitle="Submit Maintenance Result"
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitApprovalSuccess}
        />
      )}
    </>
  );
}
