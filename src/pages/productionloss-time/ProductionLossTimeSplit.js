import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import { fDate } from '../../utils/formatTime';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';

// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// redux
import { useDispatch } from '../../redux/store';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

ProductionLossTimeSplit.propTypes = {
  isEdit: PropTypes.bool,
  isView: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  action: PropTypes.string,
  isOpenActionModal: PropTypes.bool
};

export default function ProductionLossTimeSplit({
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
  const [isSplit, setIsSplit] = useState(false);

  useEffect(() => {
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

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
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

  const handleErrorTime = () => {
    validateForm();
    if (Object.values(errors).length !== 0) {
      setIsOpenConfirmModal(false);
      return true;
    }

    if (isSplit) {
      setIsOpenConfirmModal(true);
    } else {
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
  };

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

  const handleRegisterUser = async () => {
    formik.setSubmitting(true);
    try {
      mutate({
        url: '/v1/production/split',
        data: {
          productionLossTime: {
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
            enqueueSnackbar('Loss time is splited successfully', {
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
      lossPIC: currentData?.lossPIC || '',
      lossDept: currentData?.lossDept || '',
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

  const handleValidateTime = (e) => {
    setFieldValue('lossSplitTime', e.target.value);
    const date = new Date();
    let split = new Date(`${fDate(date)}T${e.target.value}`);
    const start = new Date(`${fDate(date)}T${values.lossStartTime}`);
    const end = new Date(`${fDate(date)}T${values.lossEndTime}`);
    const timeSplitPlusDay = new Date();
    timeSplitPlusDay.setDate(split.getDate() + 1);

    if (timeSplitPlusDay.getTime() < start.getTime && timeSplitPlusDay.getTime() > end.getTime()) {
      split = timeSplitPlusDay;
    }
    console.log('time', start.getTime(), '------', split.getTime(), '----', end.getTime());
    if (start.getTime() < split.getTime() && end.getTime() > split.getTime()) {
      const secondsStart = (split.getTime() - start.getTime()) / 1000;
      const formattedStart = moment.utc(secondsStart * 1000).format('HH:mm:ss');
      setFieldValue('lossTime1', formattedStart);
      const secondsEnd = (end.getTime() - split.getTime()) / 1000;
      const formattedEnd = moment.utc(secondsEnd * 1000).format('HH:mm:ss');
      setFieldValue('lossTime2', formattedEnd);
      setIsSplit(true);
    } else {
      setFieldValue('lossTime1', '--:--:--');
      setFieldValue('lossTime2', '--:--:--');
      setIsSplit(false);
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
                  <TextField id="" name="" label="" fullWidth disabled />
                  <TextField id="" name="" fullWidth label="" disabled />
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
                    fullWidth
                    errorMessage={touched.lossDate && errors.lossDate}
                  />
                  <TextField
                    id="time"
                    label="Loss Start Time"
                    type="time"
                    value={values.lossStartTime}
                    fullWidth
                    disabled
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
                    disabled
                    value={values.lossEndTime}
                    fullWidth
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
                    onChange={handleValidateTime}
                  />
                  <TextField
                    // id="time"
                    label="Loss Time 1"
                    // type="time"
                    defaultValue="--:--:--"
                    value={values.lossTime1}
                    disabled
                    fullWidth
                    // InputLabelProps={{
                    //   shrink: true,
                    // }}
                    // inputProps={{
                    //   step: 1, // 5 min
                    // }}
                    onChange={(e) => {
                      setFieldValue('lossTime1', e.target.value);
                    }}
                  />

                  <TextField
                    // id="time"
                    label="Loss Time 2"
                    defaultValue="--:--:--"
                    // type="time"
                    disabled
                    value={values.lossTime2}
                    fullWidth
                    // InputLabelProps={{
                    //   shrink: true,
                    // }}
                    // inputProps={{
                    //   step: 1, // 5 min
                    // }}
                    onChange={(e) => {
                      setFieldValue('lossTime2', e.target.value);
                    }}
                  />
                </Stack>
              </Stack>
            </Card>
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
