import closeFill from '@iconify/icons-eva/close-fill';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { DateTimePicker, LoadingButton, TimePicker } from '@material-ui/lab';
import ReactDOMServer from 'react-dom/server';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { fDate, fDateTime, fDateTimeToTime } from '../../utils/formatTime';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { UploadMultiFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker, DthButtonPermission } from '../../core/wrapper';

// hooks
import useAuth from '../../hooks/useAuth';
import { closeUserInfoActionModal } from '../../redux/slices/userManagement';
import useLocales from '../../hooks/useLocales';
// redux
import { useDispatch } from '../../redux/store';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

ProductionLossTimeRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  isView: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  action: PropTypes.string,
  isOpenActionModal: PropTypes.bool
};

export default function ProductionLossTimeRegistrationForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  action,
  isView,
  isOpenActionModal
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { lossCommon } = useSelector((state) => state.common);
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { lossCategoryDropdown, lossCause, allLossMasterDropdown, allLossCause } = useSelector(
    (state) => state.lossManagement
  );
  const { losPICDropDown, allDataPIC } = useSelector((state) => state.lossPicManagement);
  const { planDropdownWPo } = useSelector((state) => state.productionOrderManagement);
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [timeConfig, setTimeConfig] = useState({});
  const [configStartTime, setConfigStartTime] = useState('');
  const [configEndTime, setConfigEndTime] = useState('');
  const [currDate, setCurrDate] = useState(currentData.lossDate ? new Date(currentData.lossDate) : new Date());
  const [errorTime, setErrorTime] = useState(0);
  const [pkUser, setPkUser] = useState('');
  const [commonLossType, setCommonLossType] = useState('');
  const [valueLossPic, setValueLossPic] = useState({ label: '', value: '' });
  const [valueModelCode, setValueModelCode] = useState({ label: '', value: '' });
  const [currFiles, setCurrFiles] = useState([]);
  const { user } = useAuth();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');
  const { translate } = useLocales();

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setAcceptedFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    [setAcceptedFiles]
  );

  useEffect(() => {
    let _files = [];
    if ((isEdit || isView) && currentData?.attachedFiles && isOpenActionModal) {
      _files = currentData.attachedFiles;
      setCurrFiles(_files);
    }
    setAcceptedFiles(_files);
  }, [isOpenActionModal, currentData]);

  useEffect(() => {
    console.log('currentData', currentData);
    if (isEdit || isView) {
      const pIC = currentData?.lossPIC || '';
      const modelCode = currentData.factoryPkPlan || '';
      caclDiffTimeHours(currentData.lossStartTime, currentData.lossEndTime);
      const currentPIC = losPICDropDown.filter((pic) => pic.value === pIC);
      const currentModel = planDropdownWPo.filter((model) => model.value === modelCode);
      setValueLossPic({
        value: currentPIC[0]?.value || '',
        label: currentPIC[0]?.label || ''
      });
      setValueModelCode({
        value: currentModel[0]?.value || '',
        label: currentModel[0]?.label || ''
      });
    }
  }, [currentData]);
  useEffect(() => {
    setFieldValue('lossType', commonLossType);
  }, [commonLossType]);

  useEffect(() => {
    const difference = acceptedFiles.filter((file) => files.every((curFile) => curFile.name !== file.name));
    setFiles([...files, ...difference]);
  }, [acceptedFiles]);

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleRemove = (file) => {
    const filteredItems = files.filter((_file) => _file !== file);
    setFiles(filteredItems);
  };

  const splitTime = (time) => {
    if (time) {
      const split = time.split(':');
      return {
        hour: split[0],
        minute: split[1],
        second: split[2] || '00'
      };
    }
    return '';
  };

  const generateGmailProduction = (row) => {
    if (!isEmpty(row)) {
      const data = (
        <>
          <p>Dear Loss Pic</p>
          <table key="ecn-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
            <tr>
              <th>Factory</th>
              <td>{row.factory}</td>
              <th>Part</th>
              <td>{row.part}</td>
            </tr>
            <tr>
              <th>Line</th>
              <td>{row.lineCode}</td>
              <th>Process Code</th>
              <td>{row.processCode}</td>
            </tr>
            <tr>
              <th>Loss Date</th>
              <td>{fDate(row.lossDate)}</td>
              <th>Loss Start Time</th>
              <td>{row.lossStartTime}</td>
            </tr>
            <tr>
              <th>Loss End Time</th>
              <td>{row.lossEndTime}</td>
              <th>Loss Type</th>
              <td>{row.lossType}</td>
            </tr>
            <tr>
              <th>Loss PIC</th>
              <td>{row.lossPIC}</td>
              <th>Loss Dept</th>
              <td>{row.lossDept}</td>
            </tr>
            <tr>
              <th>Loss Category</th>
              <td>{row.lossCategory}</td>
              <th>Model Code</th>
              <td>{row.modelCode}</td>
            </tr>
            <tr>
              <th>Shift</th>
              <td>{row.shift}</td>
              <th>Loss Classification</th>
              <td>{row.lossClassification}</td>
            </tr>
            <tr>
              <th>Loss Detail Cls</th>
              <td>{row.lossDetailCls}</td>
              <th>Productivity Apply</th>
              <td>{row.productivityApply}</td>
            </tr>
            <tr>
              <th>Loss Item</th>
              <td>{row.lossItem}</td>
              <th>Loss Cause</th>
              <td>{row.lossCause}</td>
            </tr>
            <tr>
              <th>Loss Detail Reason</th>
              <td>{row.lossDetailReason}</td>
              <th>Countermeasure</th>
              <td>{row.countermeasure}</td>
            </tr>
          </table>
          <p>Thanks!</p>
        </>
      );
      return ReactDOMServer.renderToStaticMarkup(data);
    }
  };

  const handleErrorTime = () => {
    validateForm();
    if (Object.values(errors).length !== 0) {
      setIsOpenConfirmModal(false);
      return true;
    }
    const date = new Date();
    const split = new Date(`${fDate(date)}T${values.lossSplitTime}`);
    const start = new Date(`${fDate(date)}T${values.lossStartTime}`);
    const end = new Date(`${fDate(date)}T${values.lossEndTime}`);
    const diffTimes = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    const { hour } = splitTime(values.lossStartTime);
    const hourEnd = splitTime(values.lossEndTime).hour;
    if (action === 'Add' || action === 'Modify') {
      if (start.getHours() >= +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
        if (start - end > 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start time or loss end time is unreasonable', {
            variant: 'warning',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          return true;
        }
      }
    }

    if (start.getHours() < +timeConfig.hour && end.getHours() < +timeConfig.hour) {
      if (start - end > 0) {
        setIsOpenConfirmModal(false);
        enqueueSnackbar('Loss start time or loss end time is unreasonable', {
          variant: 'warning',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        return true;
      }
    }

    setIsOpenConfirmModal(true);
  };

  useEffect(async () => {
    const planStartTimeConfig = await query({
      url: '/v1/factory-configuration/search',
      featureCode: 'user.create',
      params: {
        paramCode: 'ST00000001'
      }
    });
    if (planStartTimeConfig.data) {
      if (planStartTimeConfig.data.length === 0) {
        const { hour, minute, second } = splitTime('06:00:00');
        setTimeConfig({ hour, minute, second });
        setConfigStartTime(
          new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), hour, minute, second)
        );
        setConfigEndTime(
          new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1, hour, minute, second)
        );
      } else {
        const { hour, minute, second } = splitTime(planStartTimeConfig?.data[0]?.paramValue);
        setTimeConfig({ hour, minute, second });
        setConfigStartTime(
          new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), hour, minute, second)
        );
        setConfigEndTime(
          new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1, hour, minute, second)
        );
      }
    }
  }, [currDate]);

  function diffHours(dt2, dt1) {
    const diff = (dt2.getTime() - dt1.getTime()) / 1000;
    //  diff /= 60;
    return Math.round(diff);
  }

  const getUniqueArray = (array) => {
    const newArray = array
      .map((obj) => ({
        value: obj.code,
        label: obj.label,
        factory: obj.factory
      }))
      .reduce(
        (previous, current) =>
          [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
        []
      );

    return newArray;
  };

  const caclDiffTimeHours = (startt, endd) => {
    const start = new Date(startt);
    const end = new Date(endd);
    if (end.getHours() < +timeConfig.hour) {
      end.setDate(end.getDate() + 1);
    }
    setErrorTime(end.getTime() - start.getTime());
    if (start && end) {
      if (start - end < 0) {
        let time = (end.getTime() - start.getTime()) / 1000;
        if (start.getHours < +timeConfig.hour) {
          start.setDate(start.getDate() + 1);
          const secondsStart = (end.getTime() - start.getTime()) / 1000;
          time = secondsStart;
        } else if (end.getHours < +timeConfig.hour) {
          start.setDate(end.getDate() + 1);
          const secondsStart = (end.getTime() - start.getTime()) / 1000;
          time = secondsStart;
        }

        if (time / 60 >= 5) {
          setCommonLossType('D036001');
        } else if (time / 60 < 1) {
          setCommonLossType('D036003');
        } else {
          setCommonLossType('D036002');
        }
      }
    }
  };

  const getEndTime = (configTime, endTime) => {
    const date = new Date(endTime);
    if (endTime.getHours() <= +timeConfig.hour) {
      date.setDate(date.getDate() + 1);
      return date;
    }
    return endTime;
  };

  const handleUploadFiles = async () => {
    const formData = new FormData();
    files.forEach((file) => {
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

  const handleRegisterUser = async () => {
    formik.setSubmitting(true);
    const lossClassificationDropdown = allLossMasterDropdown
      .filter((obj) => obj.lossType.code === values.lossCategory)
      .map((obj) => ({
        value: obj.classification.code,
        label: obj.classification.name
      }))
      .reduce(
        (previous, current) =>
          [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
        []
      );
    const lossDetailCls = allLossMasterDropdown
      .filter((obj) => obj.classification.code === values.lossClassification)
      .map((obj) => ({
        value: obj.lossCls.code,
        label: obj.lossCls.name
      }))
      .reduce(
        (previous, current) =>
          [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
        []
      );
    const lossItem = allLossMasterDropdown
      .filter((obj) => obj.classification.code === values.lossClassification)
      .map((obj) => ({
        value: obj.classification.code,
        label: obj.lossItem
      }))
      .reduce(
        (previous, current) =>
          [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
        []
      );
    const lossCauseDropdown = allLossCause
      .filter((e) => e.classification.code === values.lossClassification)
      .map((e) => ({ value: e.factoryPk, label: e.lossCause }));

    const dataGenerateGmail = {
      factory: commonDropdown.factoryDropdown.find((e) => e.value === values.factory)?.label,
      part: commonDropdown.partDropdown.find((e) => e.value === values.part)?.label,
      lineCode: commonDropdown.lineDropdown.find((e) => e.value === values.lineCode)?.label,
      processCode: commonDropdown.processDropdown.find((e) => e.value === values.processCode)?.label,
      workStation: commonDropdown.workStationDropdown.find((e) => e.value === values.workStation)?.label,
      lossDate: fDate(values.lossDate),
      lossStartTime: values.lossStartTime,
      lossEndTime: values.lossEndTime,
      lossType: lossCommon.find((dd) => dd.value === values.lossType).label,
      lossPIC: losPICDropDown.find((dd) => dd.value === values.lossPIC).label,
      lossDept: losPICDropDown.find((dd) => dd.value === values.lossPIC).position,
      lossCategory: getUniqueArray(lossCategoryDropdown).find((dd) => dd.value === values.lossCategory).label,
      modelCode: planDropdownWPo.find((dd) => dd.value === values.modelCode).label,
      shift: values.shift,
      lossClassification: lossClassificationDropdown.find((dd) => dd.value === values.lossClassification).label,
      lossDetailCls: lossDetailCls.find((dd) => dd.value === values.lossDetailCls).label,
      productivityApply: values.productivityApply,
      lossItem: lossItem.find((dd) => dd.value === values.lossItem).label,
      lossCause: lossCauseDropdown.find((e) => e.value === values.lossCause)?.label,
      lossDetailReason: values.lossDetailReason,
      countermeasure: values.countermeasure
    };
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    const sameArray = JSON.stringify(files) === JSON.stringify(currFiles);

    if (!isEmpty(files) && !sameArray) {
      const uploadFile = await handleUploadFiles();
      isUploadFileSuccess = uploadFile.isUploadFileSuccess;
      uploadFileMessage = uploadFile.uploadFileMessage;
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }
    if (action === 'Add' && !isEdit) {
      const lossDatePlusOne = new Date(values.lossDate);
      const { hour } = splitTime(values.lossStartTime);
      if (+hour < +timeConfig.hour) {
        lossDatePlusOne.setDate(lossDatePlusOne.getDate() + 1);
      }
      const startTime = new Date(`${fDate(lossDatePlusOne)}, ${values.lossStartTime}`);
      const endTime = new Date(`${fDate(values.lossDate)}, ${values.lossEndTime}`);
      const checkEndTime = diffHours(getEndTime(configEndTime, endTime), startTime);

      try {
        mutate({
          url: '/v1/production/create',
          data: {
            productionLossTime: {
              plan: {
                factoryPk: values.modelCode
              },
              lossDate: fDate(values.lossDate),
              startTime,
              endTime: getEndTime(configEndTime, endTime),
              workStation: {
                factoryPk: values.workStation
              },
              lossType: {
                code: values.lossType
              },
              lossCause: {
                factoryPk: values.lossCause
              },
              shift: { code: values.shift },
              lossTime: checkEndTime,
              reason: values.lossDetailReason,
              countermeasure: values.countermeasure,
              inputTime: new Date(),
              lossPic: {
                factoryPk: values.lossPIC
              },
              user: {
                factoryPk: user.id
              },
              pk: {
                factoryCode: pkUser
              },
              attachedFileIds,
              attachedFilePks,
              htmlContent: generateGmailProduction(dataGenerateGmail)
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar('Loss time is registered successfully', {
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
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else if (action === 'Modify') {
      const startTime = new Date(`${fDate(values.lossDate)}, ${values.lossStartTime}`);
      const endTime = new Date(`${fDate(values.lossDate)}, ${values.lossEndTime}`);
      const checkEndTime = diffHours(getEndTime(configEndTime, endTime), startTime);
      if (startTime.getHours() < +timeConfig.hour && endTime.getHours() < +timeConfig.hour) {
        startTime.setDate(startTime.getDate() + 1);
      }
      const currId = [...files.filter((e) => typeof e.pk !== 'undefined').map((e) => e.pk.id), ...attachedFileIds];
      const currFilePk = [
        ...files.filter((e) => typeof e.factoryPk !== 'undefined').map((e) => e.factoryPk),
        ...attachedFilePks
      ];
      try {
        mutate({
          url: '/v1/production/update',
          data: {
            productionLossTime: {
              lossType: {
                code: values.lossType
              },
              plan: {
                factoryPk: values.modelCode
              },
              lossCause: {
                factoryPk: values.lossCause
              },
              lossDate: fDate(values.lossDate),
              startTime,
              endTime: getEndTime(configEndTime, endTime),
              shift: { code: values.shift },
              reason: values.lossDetailReason,
              countermeasure: values.countermeasure,
              lossTime: Math.floor(checkEndTime),
              state: values.state,
              lossPic: {
                factoryPk: values.lossPIC
              },
              pk: {
                factoryCode: values.pk.factoryCode,
                id: values.pk.id
              },
              attachedFileIds: currId,
              attachedFilePks: currFilePk,
              htmlContent: generateGmailProduction(dataGenerateGmail)
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar('Loss time is updated successfully', {
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
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  };

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    part: Yup.string().required('Part is required'),
    lineCode: Yup.string().required('Line is required'),
    processCode: Yup.string().required('Process Code is required'),
    workStation: Yup.string().required('Work Station is required'),
    lossDate: Yup.string().required('Loss Date is required'),
    lossStartTime: Yup.string().required('Loss Start Time is required'),
    lossEndTime: Yup.string().required('Loss End Time is required'),
    lossPIC: Yup.string().required('Loss PIC is required'),
    modelCode: Yup.string().required('Model Code is required'),
    shift: Yup.string().required('Shift is required'),
    lossClassification: Yup.string().required('Loss Classification is required'),
    lossDetailCls: Yup.string().required('Loss Detail Cls is required'),
    lossItem: Yup.string().required('Loss Item Cls is required'),
    lossCause: Yup.string().required('Loss Cause Cls is required'),
    lossDetailReason: Yup.string().required('Loss Detail Reason Cls is required'),
    countermeasure: Yup.string().required('Countermeasure is required'),
    lossType: Yup.string().required('Loss Type is required'),
    lossCategory: Yup.string().required('Loss Category is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: ((isView || isEdit) && currentData?.factory) || '',
      part: ((isView || isEdit) && currentData?.part) || '',
      lineCode: ((isView || isEdit) && currentData?.line) || '',
      lossStartTime: ((isView || isEdit) && moment(currentData.lossStartTime).format('HH:mm:ss')) || '',
      lossEndTime: ((isView || isEdit) && moment(currentData.lossEndTime).format('HH:mm:ss')) || '',
      lossType: ((isView || isEdit) && currentData?.lossType) || '',
      lossPIC: ((isView || isEdit) && currentData?.lossPIC) || '',
      lossDept: ((isView || isEdit) && currentData?.lossDept) || '',
      lossCategory: ((isView || isEdit) && currentData?.lossCategory) || '',
      modelCode: ((isView || isEdit) && currentData?.modelCode) || '',
      shift: ((isView || isEdit) && currentData?.shift) || '',
      lossClassification: ((isView || isEdit) && currentData?.lossClassification) || '',
      lossDetailCls: ((isView || isEdit) && currentData?.lossDetailCls) || '',
      productivityApply: ((isView || isEdit) && currentData?.productivityApply) || '',
      lossCause: ((isView || isEdit) && currentData?.lossCause) || '',
      lossDetailReason: ((isView || isEdit) && currentData?.reason) || '',
      countermeasure: ((isView || isEdit) && currentData?.countermeasure) || '',
      lossDate: ((isView || isEdit) && currentData?.lossDate) || '',
      lossSplitTime: '',
      lossTime1: null,
      lossTime2: null,
      pk: ((isView || isEdit) && currentData.pk) || '',
      processCode: ((isView || isEdit) && currentData.processCode) || '',
      workStation: ((isView || isEdit) && currentData.workStation) || '',
      equipIdCode: ((isView || isEdit) && currentData.equipmentId) || '',
      equipIdName: ((isView || isEdit) && currentData.equipIdName) || '',
      lossItem: ((isView || isEdit) && currentData.lossItem) || '',
      attachedFiles: ((isView || isEdit) && currentData.attachedFiles) || ''
    },
    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setValuesForm(values);
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFiles([]);
      setValueModelCode({
        value: '',
        label: ''
      });
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
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

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    validateForm,
    resetForm
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            {(action === 'Add' || action === 'Modify' || action === 'View') && (
              <>
                <Card sx={{ px: 1, py: 2 }}>
                  <Typography variant="h5">{translate(`typo.loss_info`)}</Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        {...getFieldProps('factory')}
                        id="factory"
                        name="factory"
                        label="Factory"
                        disabled={isEdit || isView}
                        required
                        onChange={handleChangeFactory}
                        value={values.factory}
                        options={commonDropdown.factoryDropdown}
                        errorMessage={touched.factory && errors.factory}
                      />
                      <Dropdown
                        {...getFieldProps('part')}
                        id="part"
                        name="part"
                        label="Part"
                        disabled={isEdit || isView}
                        required
                        // onChange={handleChange}
                        onChange={handleChange}
                        options={commonDropdown.partDropdown.filter((dd) => dd.factory === values.factory)}
                        defaultValue=""
                        errorMessage={touched.part && errors.part}
                      />
                      <Dropdown
                        {...getFieldProps('lineCode')}
                        id="lineCode"
                        name="lineCode"
                        label="Line"
                        disabled={isEdit || isView}
                        required
                        // onChange={handleChange}
                        onChange={handleChange}
                        options={commonDropdown.lineDropdown.filter((dd) => dd.part === values.part)}
                        defaultValue=""
                        errorMessage={touched.lineCode && errors.lineCode}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        id="processCode"
                        name="processCode"
                        label="Process Code"
                        required
                        disabled={isEdit || isView}
                        options={commonDropdown.processDropdown.filter((dd) => dd.line === values.lineCode)}
                        defaultValue=""
                        onChange={handleChange}
                        {...getFieldProps('processCode')}
                        errorMessage={touched.processCode && errors.processCode}
                      />
                      <Dropdown
                        id="workStation"
                        name="workStation"
                        label="Work Station"
                        required
                        disabled={isEdit || isView}
                        options={commonDropdown.workStationDropdown.filter((dd) => dd.process === values.processCode)}
                        defaultValue=""
                        onChange={handleChange}
                        {...getFieldProps('workStation')}
                        errorMessage={touched.workStation && errors.workStation}
                      />
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label=""
                        disabled
                        error={Boolean(touched.equipIdCode && errors.equipIdCode)}
                        helperText={touched.equipIdCode && errors.equipIdCode}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <DthDatePicker
                        name="lossDate"
                        label="Loss Date"
                        disabled={isView}
                        value={values.lossDate}
                        onChange={(newValue) => {
                          setCurrDate(newValue);
                          setFieldValue('lossDate', newValue);
                        }}
                        fullWidth
                        errorMessage={touched.lossDate && errors.lossDate}
                      />

                      <TextField
                        id="time"
                        label="Loss Start Time"
                        type="time"
                        disabled={isView}
                        value={values.lossStartTime}
                        fullWidth
                        required
                        InputLabelProps={{
                          shrink: true
                        }}
                        inputProps={{
                          step: 1 // 5 min
                        }}
                        onChange={(e) => {
                          setFieldValue('lossStartTime', e.target.value);
                        }}
                        helperText={touched.lossStartTime && errors.lossStartTime}
                        error={Boolean(touched.lossStartTime && errors.lossStartTime)}
                      />

                      <TextField
                        id="time"
                        label="Loss End Time"
                        type="time"
                        value={values.lossEndTime}
                        disabled={isView}
                        fullWidth
                        InputLabelProps={{
                          shrink: true
                        }}
                        inputProps={{
                          step: 1 // 5 min
                        }}
                        onChange={(e) => {
                          setFieldValue('lossEndTime', e.target.value);
                          const start = new Date(`${fDate(new Date())}T${values.lossStartTime}`);
                          const end = new Date(`${fDate(new Date())}T${e.target.value}`);
                          caclDiffTimeHours(start, end);
                        }}
                        helperText={touched.lossEndTime && errors.lossEndTime}
                        error={Boolean(touched.lossEndTime && errors.lossEndTime)}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        // {...getFieldProps('lossType')}
                        id="lossType"
                        name="lossType"
                        value={commonLossType}
                        label="Loss Type"
                        required
                        disabled
                        options={lossCommon}
                        errorMessage={touched.lossType && errors.lossType}
                      />
                      <Autocomplete
                        onChange={(e, value) => {
                          setFieldValue('lossPIC', value?.value);
                          setValueLossPic(value);
                          setPkUser(value?.factoryPk);
                        }}
                        disabled={isView}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        fullWidth
                        required
                        id="lossPIC"
                        name="lossPIC"
                        options={losPICDropDown}
                        value={valueLossPic}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Loss PIC"
                            helperText={touched.lossPIC && errors.lossPIC}
                            error={Boolean(touched.lossPIC && errors.lossPIC)}
                          />
                        )}
                      />
                      <TextField
                        autoComplete="off"
                        name="lossDept"
                        id="lossDept"
                        fullWidth
                        label="Loss Dept"
                        {...getFieldProps('lossDept')}
                        disabled
                        value={
                          values.lossPIC !== 'null-null' && values.lossPIC
                            ? losPICDropDown.find((obj) => obj.value === values.lossPIC).position
                            : ''
                        }
                        error={Boolean(touched.equipIdName && errors.equipIdName)}
                        helperText={touched.equipIdName && errors.equipIdName}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        fullWidth
                        id="lossCategory"
                        name="lossCategory"
                        label="Loss Category"
                        value={values.lossCategory}
                        disabled={isView}
                        required
                        {...getFieldProps('lossCategory')}
                        options={getUniqueArray(lossCategoryDropdown).filter((e) => e.value === 'D042002')}
                        errorMessage={touched.lossCategory && errors.lossCategory}
                      />
                      <Autocomplete
                        onChange={(e, value) => {
                          setFieldValue('modelCode', value?.value);
                          setValueModelCode(value);
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        fullWidth
                        value={valueModelCode}
                        id="modelCode"
                        name="modelCode"
                        disabled={isView}
                        options={planDropdownWPo.filter((dd) => dd.factory === values.factory)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            helperText={touched.modelCode && errors.modelCode}
                            error={Boolean(touched.modelCode && errors.modelCode)}
                            label="Model Code"
                          />
                        )}
                      />

                      <Dropdown
                        {...getFieldProps('shift')}
                        id="shift"
                        name="shift"
                        label="Shift"
                        onChange={handleChange}
                        groupId="D001000"
                        required
                        errorMessage={touched.shift && errors.shift}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        {...getFieldProps('lossclassification')}
                        id="lossClassification"
                        name="lossClassification"
                        label="Loss Classification"
                        disabled={isView}
                        value={values.lossClassification}
                        required
                        onChange={handleChange}
                        options={allLossMasterDropdown
                          .filter((obj) => obj.lossType.code === values.lossCategory)
                          .map((obj) => ({
                            value: obj.classification.code,
                            label: obj.classification.name
                          }))
                          .reduce(
                            (previous, current) =>
                              [...previous].some((obj) => obj?.value === current.value)
                                ? [...previous]
                                : [...previous].concat(current),
                            []
                          )}
                        errorMessage={touched.lossClassification && errors.lossClassification}
                      />
                      <Dropdown
                        {...getFieldProps('lossDetailCls')}
                        id="lossDetailCls"
                        name="lossDetailCls"
                        label="Loss Detail Cls"
                        required
                        disabled={isView}
                        options={allLossMasterDropdown
                          .filter((obj) => obj.classification.code === values.lossClassification)
                          .map((obj) => ({
                            value: obj.lossCls.code,
                            label: obj.lossCls.name
                          }))
                          .reduce(
                            (previous, current) =>
                              [...previous].some((obj) => obj?.value === current.value)
                                ? [...previous]
                                : [...previous].concat(current),
                            []
                          )}
                        value={values.lossDetailCls}
                        errorMessage={touched.lossDetailCls && errors.lossDetailCls}
                      />
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label="Productivity Apply"
                        disabled
                        value={
                          (values.lossCause !== 'null-null' &&
                            values.lossCause &&
                            allLossCause.find((obj) => obj.factoryPk === values.lossCause)?.productivity) ||
                          ''
                        }
                        error={Boolean(touched.productivityApply && errors.productivityApply)}
                        helperText={touched.productivityApply && errors.productivityApply}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Dropdown
                        {...getFieldProps('lossItem')}
                        id="lossItem"
                        name="lossItem"
                        label="Loss Item"
                        required
                        disabled={isView}
                        options={allLossMasterDropdown
                          .filter((obj) => obj.classification.code === values.lossClassification)
                          .map((obj) => ({
                            value: obj.classification.code,
                            label: obj.lossItem
                          }))
                          .reduce(
                            (previous, current) =>
                              [...previous].some((obj) => obj?.value === current.value)
                                ? [...previous]
                                : [...previous].concat(current),
                            []
                          )}
                        values={values.lossItem}
                        errorMessage={touched.lossItem && errors.lossItem}
                      />
                      <Dropdown
                        {...getFieldProps('lossCause')}
                        id="lossCause"
                        label="Loss Cause"
                        required
                        value={values.lossCause}
                        // disabled={isEdit}
                        options={lossCause.filter((e) => e.code === values.lossCategory)}
                        defaultValue=""
                        errorMessage={touched.lossCause && errors.lossCause}
                      />
                    </Stack>
                    <Stack>
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label="Loss Detail Reason"
                        required
                        disabled={isView}
                        {...getFieldProps('lossDetailReason')}
                        error={Boolean(touched.lossDetailReason && errors.lossDetailReason)}
                        helperText={touched.lossDetailReason && errors.lossDetailReason}
                      />
                    </Stack>
                  </Stack>
                </Card>
                <Grid container>
                  <Grid item xs={6}>
                    <Card>
                      <Stack sx={{ px: 1, py: 2 }} spacing={{ xs: 2, sm: 1 }}>
                        <Typography sx={{ mb: 2 }} variant="h6">
                          {translate(`typo.countermeasure`)}
                        </Typography>
                        <TextField
                          autoComplete="off"
                          fullWidth
                          label="Countermeasure"
                          disabled={isView}
                          {...getFieldProps('countermeasure')}
                          error={Boolean(touched.countermeasure && errors.countermeasure)}
                          helperText={touched.countermeasure && errors.countermeasure}
                        />
                      </Stack>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <Stack sx={{ px: 1, py: 2 }} spacing={{ xs: 2, sm: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography sx={{ mb: 2 }} variant="h6">
                            {translate(`typo.file_attachment`)}
                          </Typography>
                        </Stack>
                        <UploadMultiFile
                          sx={{ mb: 2 }}
                          showPreview={false}
                          files={files}
                          disabled={isView}
                          isView={isView}
                          onDrop={handleDropMultiFile}
                          onRemove={handleRemove}
                          onRemoveAll={handleRemoveAll}
                        />
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        {!isView && (
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              loadingIndicator="Loading..."
              onClick={handleErrorTime}
            >
              {' '}
              {(action === 'Add' && translate(`button.register`)) || action}
            </LoadingButton>
          </DialogActions>
        )}

        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
            (action === 'Add' && translate(`typo.register`)) || action
          }`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterUser} loading={isSubmitting}>
              {(action === 'Add' && translate(`button.register`)) || action}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
