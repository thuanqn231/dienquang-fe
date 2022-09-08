import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField, Typography, Autocomplete
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';

// redux
import { useDispatch, useSelector } from '../../redux/store';
import { fDate } from '../../utils/formatTime';
import { getSafeValue } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

CycleTimeRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function CycleTimeRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const dispatch = useDispatch();
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [materialCode, setMaterialCode] = useState({
    value: "",
    label: ""
  });
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() + 1);
  const { translate, currentLang } = useLocales();


  useEffect(() => {
    if (isEdit) {
      const materialValue = currentData?.material || '';
      const currentMaterial = materialDropdown.filter((material) => material.value === materialValue);
      setMaterialCode({
        value: currentMaterial[0]?.value || '',
        label: currentMaterial[0]?.label || ''
      });
    }
  }, [currentData]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }
  const handleRegisterUser = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/cycle-time/create',
          data: {
            cycleTime: {
              state: values.state,
              cycleTimeNum: values.cycleTime,
              applyStartDate: values.applyStartDate,
              process: {
                factoryPk: values.processCode
              },
              materialMaster: {
                factoryPk: values.materialCode,
              },
              pk: {
                factoryCode: values.factory
              }
            }
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            if (res.data.message) {
              formik.setSubmitting(false);
              enqueueSnackbar(res.data.message, {
                variant: 'error',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
            else {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.register_cycle_time_successful`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          }
        }).catch((error) => {
          formik.setSubmitting(false);
          formik.setErrors(error);
        });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else {
      try {

        mutate({
          url: '/v1/cycle-time/update',
          data: {
            "cycleTimeUpdate": {
              "state": valuesForm.state,
              "cycleTimeNum": valuesForm.cycleTime,
              "applyStartDate": valuesForm.applyStartDate,
              "process": {
                factoryPk: valuesForm.processCode
              },
              "materialMaster": {
                factoryPk: valuesForm.materialCode,
              },
              "pk": {
                factoryCode: valuesForm.factory,
                id: valuesForm.id
              }
            }
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            if (res.data.message) {
              enqueueSnackbar(res.data.message, {
                variant: 'error',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            } else {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.update_cycle_time_successful`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          }
        }).catch((error) => {
          formik.setSubmitting(false);
          formik.setErrors(error);
        });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  }
  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    lineCode: Yup.string().required('Line Code is required'),
    processCode: Yup.string().required('Process Code is required'),
    cycleTime: Yup.string().required('Cycle Time is required'),
    materialCode: Yup.string().required('Material Code is required'),
    applyStartDate: Yup.string().required('Apply Start Time is required'),
    state: Yup.string().required('Use (Y/N) is required')
  });


  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      lineCode: isEdit && currentData?.lineCode || '',
      processCode: isEdit && currentData?.processCode || '',
      cycleTime: isEdit && currentData?.cycleTime || '',
      materialCode: isEdit && currentData?.material || '',
      applyStartDate: isEdit && currentData?.applyStartDate || '',
      state: isEdit && currentData?.state || 'RUNNING'
    },

    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setValuesForm({ ...values, id: currentData.id })
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      setMaterialCode({
        value: '',
        label: ''
      });
      resetForm();
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  }

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
  }

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('factory')}
                    id="factory"
                    name="factory"
                    label='Factory'
                    disabled={isEdit}
                    required
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('lineCode')}
                    id="lineCode"
                    name="lineCode"
                    label='Line'
                    disabled={isEdit}
                    required
                    // onChange={handleChange}
                    onChange={handleChange}
                    options={commonDropdown.lineDropdown.filter(dd => dd.factory === values.factory)}
                    defaultValue=''
                    errorMessage={touched.lineCode && errors.lineCode}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="processCode"
                    name="processCode"
                    label='Process Code'
                    required
                    disabled={isEdit}
                    options={commonDropdown.processDropdown.filter((dd) => dd.line === values.lineCode)}
                    defaultValue=''
                    onChange={handleChange}
                    {...getFieldProps('processCode')}
                    errorMessage={touched.processCode && errors.processCode}
                  />
                  <Autocomplete
                    id="materialCode"
                    // className="materialCode-select"
                    name="materialCode"
                    fullWidth
                    options={materialDropdown}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    onChange={(e, value) => {
                      setMaterialCode(value);
                      setFieldValue('materialCode', getSafeValue(value?.value));
                    }}
                    disabled={isEdit}
                    value={materialCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={Boolean(touched.materialCode && errors.materialCode)}
                        helperText={touched.materialCode && errors.materialCode}
                        label="Material Code"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Cycle Time (Min)"
                    type="number"
                    {...getFieldProps('cycleTime')}
                    error={Boolean(touched.cycleTime && errors.cycleTime)}
                    helperText={touched.cycleTime && errors.cycleTime}
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    required
                    allowEmptyOption={false}
                    onChange={handleChange}
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    defaultValue="RUNNING"
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <DthDatePicker
                  name="applyStartDate"
                  label="Apply Start Date"
                  value={values.applyStartDate}
                  onChange={(newValue) => {
                    setFieldValue("applyStartDate", fDate(newValue))
                  }}
                  sx={{ my: 1 }}
                  fullWidth
                  errorMessage={touched.applyStartDate && errors.applyStartDate}
                  minDate={startDay}
                />

              </Stack>
            </Card>
          </Grid>

        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterUser} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider >
  );
}
