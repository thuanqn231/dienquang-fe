import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
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
import { useSelector } from '../../redux/store';
// getDate
import { getLocalDateTime, fDate } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

TactTimeRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function TactTimeRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() + 1);
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  

  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});

  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });
  const { translate, currentLang } = useLocales();

  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    if (isEdit) {
      const materialValue = currentData?.materialCode || '';
      const currentMaterial = materialDropdown.filter((material) => material.value === materialValue);

      setMaterialCode({
        value: currentMaterial[0]?.value || '',
        label: currentMaterial[0]?.label || ''
      });
    }
  }, [currentData]);
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegisterUser = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/tact-time/create',
          data: {
            tactTime: {
              shift: {
                code: valuesForm?.shiftCode || null
              },
              material: {
                factoryPk: valuesForm?.materialCode || null
              },
              applyStartDate: valuesForm?.applyStartDate || null,
              state: valuesForm?.state || 'RUNNING',
              line: {
                factoryPk: valuesForm?.lineCode || null
              },
              time: valuesForm?.tactTime || null,
              pk: {
                factoryCode: valuesForm?.factory || null
              }
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.setSubmitting(false);
              if (res.data?.message) {
                enqueueSnackbar(translate(`message.invalid_material_code_and_start_date`), {
                  variant: 'warning',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
                setIsOpenConfirmModal(false);
              } else {
                enqueueSnackbar(translate(`message.tact_time_was_registered_successfully`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
                setIsOpenConfirmModal(false);
                onCancel();
                onLoadData();
              }
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
    } else {
      try {
        mutate({
          url: '/v1/tact-time/update',
          data: {
            tactTime: {
              shift: {
                code: valuesForm?.shiftCode
              },
              material: {
                factoryPk: valuesForm?.materialCode
              },
              applyStartDate: valuesForm?.applyStartDate,
              state: valuesForm?.state || 'RUNNING',
              line: {
                factoryPk: valuesForm?.lineCode
              },
              time: valuesForm?.tactTime,
              factoryPk: currentData?.id
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              if (res.data?.message) {
                enqueueSnackbar(translate(`message.please_check_the_tact_time_and_start_date`), {
                  variant: 'warning',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
                setIsOpenConfirmModal(false);
                onCancel();
              } else {
                enqueueSnackbar(translate(`message.tact_time_was_modified_successfully`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
                setIsOpenConfirmModal(false);
                onCancel();
                onLoadData();
              }
            }
          })
          .catch((error) => {
            formik.setSubmitting(false);
            formik.setErrors(error);

            setIsOpenConfirmModal(false);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  };

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    lineCode: Yup.string().required('Line Code is required'),
    shiftCode: Yup.string().required('Shift Code is required'),
    tactTime: Yup.number()
      .required('Tact Time is required')
      .test('Is positive?', 'The number must be greater than 0!', (value) => value > 0),
    materialCode: Yup.string().required('Material Code is required'),
    applyStartDate: Yup.date().required('Start Date is required').min(fDate(startDay), 'Please fill in correct start day'),
    state: Yup.string().required('Use (Y/N) is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      lineCode: (isEdit && currentData?.lineCode) || '',
      shiftCode: (isEdit && currentData?.shiftCode) || '',
      tactTime: (isEdit && currentData?.tactTime) || '',
      materialCode: (isEdit && currentData?.materialCode) || '',
      applyStartDate:
        (isEdit && currentData?.applyStartDate) || fDate(startDay),
      state: (isEdit && currentData?.state) || 'RUNNING'
    },
    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setValuesForm(values);

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
      resetForm();
      setMaterialCode({
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } =
    formik;

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
                    label="Factory"
                    required
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                    disabled={isEdit}
                  />
                  <Dropdown
                    {...getFieldProps('lineCode')}
                    id="line.code"
                    name="line.code"
                    label="Line"
                    required
                    onChange={handleChange}
                    options={commonDropdown.lineDropdown.filter((line) => line.factory === values.factory)}
                    {...getFieldProps('lineCode')}
                    defaultValue=""
                    errorMessage={touched.lineCode && errors.lineCode}
                    disabled={isEdit}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="shiftCode"
                    name="shiftName"
                    label="Shift"
                    required
                    onChange={handleChange}
                    groupId="D001000"
                    {...getFieldProps('shiftCode')}
                    defaultValue=""
                    errorMessage={touched.shiftCode && errors.shiftCode}
                    disabled={isEdit}
                  />
                  <Autocomplete
                    id="materialCode"
                    className="materialCode-select"
                    name="materialCode"
                    fullWidth
                    options={materialDropdown}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    onChange={(e, value) => {
                      setMaterialCode(value);
                      setFieldValue('materialCode', value?.value);
                    }}
                    value={materialCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.materialCode && errors.materialCode)}
                        helperText={touched.materialCode && errors.materialCode}
                        name="materialCode"
                        label="Material Code"
                        variant="outlined"
                        fullWidth
                        required
                      />
                    )}
                    disabled={isEdit}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Tact Time(s)"
                    type="number"
                    {...getFieldProps('tactTime')}
                    error={Boolean(touched.tactTime && errors.tactTime)}
                    helperText={touched.tactTime && errors.tactTime}
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
                  minDate={startDay}
                  name="applyStartDate"
                  label="Apply Start Date"
                  value={values.applyStartDate}
                  onChange={(newValue) => {
                    setFieldValue('applyStartDate', fDate(newValue));
                  }}
                  sx={{ my: 1 }}
                  fullWidth
                  errorMessage={touched.applyStartDate && errors.applyStartDate}
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
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?`}</Typography>
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
    </FormikProvider>
  );
}
