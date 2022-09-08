import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import axios from 'axios';
import { Form, FormikProvider, useFormik } from 'formik';
import ReactDOMServer from 'react-dom/server';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { UploadMultiFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// redux
import { useDispatch } from '../../redux/store';
import { fDate } from '../../utils/formatTime';

// ----------------------------------------------------------------------

MachineLossTimeSplit.propTypes = {
  isEdit: PropTypes.bool,
  isView: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  action: PropTypes.string,
  isOpenActionModal: PropTypes.bool
};

export default function MachineLossTimeSplit({
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
  const { lossCategoryDropdown, allLossMasterDropdown, allLossCause } = useSelector((state) => state.lossManagement);
  const { losPICDropDown, allDataPIC } = useSelector((state) => state.lossPicManagement);

  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { equipmentIdDropdown } = useSelector((state) => state.equipmentIDManagement);
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
  const { translate, locales } = useLocales();
  const [saveForm, setSaveForm] = useState();

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  useEffect(() => {
    console.log('currentData', currentData);
    // if (isEdit || isView) {
    const pIC = currentData?.lossPIC || '';
    const modelCode = currentData.modelCode || '';
    caclDiffTimeHours(currentData.lossStartTime, currentData.lossEndTime);
    const currentPIC = losPICDropDown.filter((pic) => pic.value === pIC);
    const currentModel = materialDropdown.filter((model) => model.materialCode === modelCode);
    setValueLossPic({
      value: currentPIC[0]?.value || '',
      label: currentPIC[0]?.label || ''
    });
    setValueModelCode({
      value: currentModel[0]?.value || '',
      label: currentModel[0]?.label || ''
    });
    // }
  }, [currentData]);

  useEffect(() => {
    setFieldValue('lossType', commonLossType);
  }, [commonLossType]);

  useEffect(() => {
    const difference = acceptedFiles.filter((file) => files.every((curFile) => curFile.name !== file.name));
    setFiles([...files, ...difference]);
  }, [acceptedFiles]);

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
    if (action === 'Split') {
      if (start.getHours() < +timeConfig.hour) {
        if (split.getHours() < +timeConfig.hour) {
          if (split - start < 0) {
            setIsOpenConfirmModal(false);
            enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() >= +timeConfig.hour && start.getHours() >= +timeConfig.hour) {
        if (split - start < 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (end.getHours() < +timeConfig.hour) {
        if (split.getHours() < +timeConfig.hour) {
          if (split - end > 0) {
            setIsOpenConfirmModal(false);
            enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() >= +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
        if (split - end > 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() < +timeConfig.hour && start.getHours() >= +timeConfig.hour) {
        split.setDate(split.getDate() + 1);
        if (split - start < 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() < +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
        split.setDate(split.getDate() + 1);
        if (split - end > 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() >= +timeConfig.hour && end.getHours() < +timeConfig.hour) {
        end.setDate(end.getDate() + 1);
        if (end - split > 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
      if (split.getHours() >= +timeConfig.hour && start.getHours() < +timeConfig.hour) {
        start.setDate(start.getDate() + 1);
        if (start - split > 0) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
    } else if (action === 'Add' || action === 'Modify') {
      if (start.getHours() < +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
        setIsOpenConfirmModal(false);
        enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
    if (start.getHours() >= +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
      if (start - end > 0) {
        setIsOpenConfirmModal(false);
        enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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
    if (start.getHours() < +timeConfig.hour && end.getHours() < +timeConfig.hour) {
      if (start - end > 0) {
        setIsOpenConfirmModal(false);
        enqueueSnackbar('Loss start sime or loss end time is unreasonable', {
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

  const handleRegisterUser = async () => {
    formik.setSubmitting(true);
    try {
      mutate({
        url: '/v1/loss-time/split',
        data: {
          machineLossTime: {
            time: values.lossSplitTime,
            pk: {
              factoryCode: values.pk.factoryCode,
              id: values.pk.id
            }
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
            enqueueSnackbar('Loss Time was splited successful', {
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
  };

  const MRPSchema = Yup.object().shape({
    lossDate: Yup.string().required('Loss Date is required'),
    lossSplitTime: Yup.string().required('Loss Start Time is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: currentData?.factory || '',
      part: currentData?.part || '',
      lineCode: currentData?.line || '',
      lossStartTime: moment(currentData.lossStartTime).format('HH:mm:ss') || '',
      lossEndTime: moment(currentData.lossEndTime).format('HH:mm:ss') || '',
      lossType: currentData?.lossType || '',
      lossCategory: currentData?.lossCategory || '',
      modelCode: currentData?.modelCode || '',
      shift: currentData?.shift || '',
      lossClassification: currentData?.lossClassification || '',
      lossDetailCls: currentData?.lossDetailCls || '',
      productivityApply: currentData?.productivityApply || '',
      lossCause: currentData?.lossCause || '',
      lossDetailReason: currentData?.reason || '',
      countermeasure: currentData?.countermeasure || '',
      lossDate: currentData?.lossDate || '',
      lossSplitTime: '',
      lossTime1: null,
      lossTime2: null,
      pk: currentData.pk || '',
      processCode: currentData.processCode || '',
      workStation: currentData.workStation || '',
      equipIdCode: currentData.equipmentId || '',
      equipIdName: currentData.equipIdName || '',
      lossItem: currentData.lossItem || '',
      attachedFiles: currentData.attachedFiles || ''
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
  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    validateForm
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            {action === 'Split' && (
              <>
                <Card sx={{ px: 1, py: 2 }}>
                  <Stack spacing={3}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Dropdown
                        {...getFieldProps('part')}
                        id="part"
                        name="part"
                        label="Part"
                        disabled
                        required
                        // onChange={handleChange}
                        onChange={handleChange}
                        options={commonDropdown.partDropdown}
                        defaultValue=""
                        errorMessage={touched.part && errors.part}
                      />
                      <Dropdown
                        {...getFieldProps('lineCode')}
                        id="lineCode"
                        name="lineCode"
                        label="Line"
                        disabled
                        required
                        // onChange={handleChange}
                        onChange={handleChange}
                        options={commonDropdown.lineDropdown.filter((dd) => dd.part === values.part)}
                        defaultValue=""
                        errorMessage={touched.lineCode && errors.lineCode}
                      />
                      <Dropdown
                        id="processCode"
                        name="processCode"
                        label="Process Code"
                        required
                        disabled
                        options={commonDropdown.processDropdown.filter((dd) => dd.line === values.lineCode)}
                        defaultValue=""
                        onChange={handleChange}
                        {...getFieldProps('processCode')}
                        errorMessage={touched.processCode && errors.processCode}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Dropdown
                        id="workStation"
                        name="workStation"
                        label="Work Station"
                        required
                        disabled
                        options={commonDropdown.workStationDropdown.filter((dd) => dd.process === values.processCode)}
                        defaultValue=""
                        onChange={handleChange}
                        {...getFieldProps('workStation')}
                        errorMessage={touched.workStation && errors.workStation}
                      />
                      <Dropdown
                        id="equipIdCode"
                        name="equipIdCode"
                        label="Equip ID Code"
                        disabled
                        value={values.equipIdCode}
                        options={equipmentIdDropdown}
                        {...getFieldProps('equipIdCode')}
                        errorMessage={touched.equipIdCode && errors.equipIdCode}
                      />
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label="Equip ID Name"
                        onChange={handleChange}
                        disabled
                        value={
                          (values.equipIdCode &&
                            equipmentIdDropdown.find((equip) => equip.value === values.equipIdCode).name) ||
                          ''
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <DthDatePicker
                        name="lossDate"
                        label="Loss Date"
                        value={values.lossDate}
                        onChange={(newValue) => {
                          setCurrDate(newValue);
                          setFieldValue('lossDate', newValue);
                        }}
                        disabled={isView}
                        fullWidth
                        errorMessage={touched.lossDate && errors.lossDate}
                      />
                      <TextField
                        id="time"
                        label="Loss Start Time"
                        type="time"
                        value={values.lossStartTime}
                        fullWidth
                        disabled={isView || action === 'Split'}
                        InputLabelProps={{
                          shrink: true
                        }}
                        inputProps={{
                          step: 1 // 5 min
                        }}
                        onChange={(e) => {
                          setFieldValue('lossStartTime', e.target.value);
                        }}
                      />
                      <TextField
                        id="time"
                        label="Loss End Time"
                        type="time"
                        disabled={isView || action === 'Split'}
                        value={values.lossEndTime}
                        fullWidth
                        InputLabelProps={{
                          shrink: true
                        }}
                        inputProps={{
                          step: 1 // 5 min
                        }}
                        onChange={(e) => {
                          setFieldValue('lossEndTime', e.target.value);
                        }}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <TextField
                        id="time"
                        label="Loss Split Time"
                        type="time"
                        value={values.lossSplitTime}
                        fullWidth
                        InputLabelProps={{
                          shrink: true
                        }}
                        inputProps={{
                          step: 1 // 5 min
                        }}
                        onChange={(e) => {
                          const date = new Date();
                          const split = new Date(`${fDate(date)}T${e.target.value}`);
                          const start = new Date(`${fDate(date)}T${values.lossStartTime}`);
                          const end = new Date(`${fDate(date)}T${values.lossEndTime}`);
                          const diffTimes = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
                          const { hour } = splitTime(values.lossStartTime);
                          const hourEnd = splitTime(values.lossEndTime);
                          setFieldValue('lossSplitTime', e.target.value);

                          if (split.getHours() >= +timeConfig.hour && start.getHours() >= +timeConfig.hour) {
                            if (split - start < 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (end.getHours() < +timeConfig.hour && split.getHours() < +timeConfig.hour) {
                            if (split - end > 0 && split - start < 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (split.getHours() >= +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
                            if (split - end > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (split.getHours() < +timeConfig.hour && start.getHours() >= +timeConfig.hour) {
                            split.setDate(split.getDate() + 1);
                            if (split - start < 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              split.setDate(split.getDate() + 1);
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }

                          if (split.getHours() < +timeConfig.hour && end.getHours() >= +timeConfig.hour) {
                            split.setDate(split.getDate() + 1);
                            if (split - end > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              split.setDate(split.getDate() + 1);
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (split.getHours() >= +timeConfig.hour && end.getHours() < +timeConfig.hour) {
                            end.setDate(end.getDate() + 1);
                            if (end - split > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              end.setDate(end.getDate() + 1);
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (split.getHours() >= +timeConfig.hour && start.getHours() < +timeConfig.hour) {
                            start.setDate(start.getDate() + 1);
                            if (start - split > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              start.setDate(start.getDate() + 1);
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (start.getHours() < +timeConfig.hour && split.getHours() < +timeConfig.hour) {
                            if (split - start < 0 && split - end > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (
                            split.getHours() < +timeConfig.hour &&
                            start.getHours() < +timeConfig.hour &&
                            end.getHours() < +timeConfig.hour
                          ) {
                            if (start - split > 0 || split - end > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                          if (
                            split.getHours() >= +timeConfig.hour &&
                            start.getHours() >= +timeConfig.hour &&
                            end.getHours() >= +timeConfig.hour
                          ) {
                            if (start - split > 0 || split - end > 0) {
                              setFieldValue('lossTime1', '--:--:--');
                              setFieldValue('lossTime2', '--:--:--');
                            } else {
                              // split.setDate(split.getDate() + 1)
                              const secondsStart = (split.getTime() - start.getTime()) / 1000;
                              const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime1', formattedStart);

                              const secondsEnd = (end.getTime() - split.getTime()) / 1000;
                              const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
                              setFieldValue('lossTime2', formattedEnd);
                            }
                          }
                        }}
                      />
                      <TextField
                        label="Loss Time 1"
                        defaultValue="--:--:--"
                        value={values.lossTime1}
                        disabled
                        fullWidth
                        onChange={(e) => {
                          setFieldValue('lossTime1', e.target.value);
                        }}
                      />

                      <TextField
                        label="Loss Time 2"
                        defaultValue="--:--:--"
                        disabled
                        value={values.lossTime2}
                        fullWidth
                        onChange={(e) => {
                          setFieldValue('lossTime2', e.target.value);
                        }}
                      />
                    </Stack>
                  </Stack>
                </Card>
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
      </Form>
    </FormikProvider>
  );
}
