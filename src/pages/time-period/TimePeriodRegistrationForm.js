import { Box, Button, Card, DialogActions, Grid, Stack, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthDatePicker, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { fDate } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL, monthArr, weekArr } from './helper';

// ----------------------------------------------------------------------

TimePeriodRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function TimePeriodRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleProcess = async () => {
    setSubmitting(true);
    if (!isEdit) {
      try {
        const createParams = {
          year: {
            code: values?.year || null
          },
          month: values?.month || null,
          week: values?.week || null,
          state: values?.state || 'RUNNING',
          startDate: fDate(values?.startDate) || null,
          endDate: fDate(values?.endDate) || null,
          pk: {
            factoryCode: values?.factory || null
          }
        };
        const response = await createUpdateData(`${BASE_URL}/create`, 'timePeriod', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_time_period_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          factoryPk: currentData.factoryPk,
          year: {
            code: values?.year || null
          },
          month: values?.month || null,
          startDate: fDate(values?.startDate) || null,
          week: values?.week || null,
          state: values?.state || 'RUNNING',
          endDate: fDate(values?.endDate) || null
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'timePeriod', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_time_period_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
  };

  const onProcessSuccess = () => {
    resetForm();
    setSubmitting(false);
    onLoadData();
    setIsOpenConfirmModal(false);
    onCancel();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
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

  const TimePeriodSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    endDate: Yup.string().required('End Date is required'),
    year: Yup.string().required('Year is required'),
    month: Yup.string().required('Month is required'),
    startDate: Yup.string().required('Start Date is required'),
    week: Yup.string().required('Week is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      endDate: (isEdit && currentData?.endDate) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      year: (isEdit && currentData?.year) || '',
      month: (isEdit && currentData?.month) || '',
      startDate: (isEdit && currentData?.startDate) || '',
      week: (isEdit && currentData?.week) || ''
    },
    validationSchema: TimePeriodSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, setSubmitting, setErrors } = formik;

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
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('year')}
                    id="year"
                    name="year"
                    label="Year"
                    required
                    onChange={handleChange}
                    groupId="D006000"
                    defaultValue=""
                    errorMessage={touched.year && errors.year}
                  />
                  <Dropdown
                    {...getFieldProps('month')}
                    id="month"
                    name="month"
                    label="Month"
                    required
                    onChange={handleChange}
                    options={monthArr}
                    defaultValue=""
                    errorMessage={touched.month && errors.month}
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('week')}
                    id="week"
                    name="week"
                    label="Week"
                    required
                    onChange={handleChange}
                    options={weekArr}
                    defaultValue=""
                    errorMessage={touched.week && errors.week}
                  />
                  <DthDatePicker
                    name="startDate"
                    label="Start Date"
                    value={values.startDate}
                    onChange={(newValue) => {
                      setFieldValue('startDate', newValue);
                    }}
                    sx={{ my: 1 }}
                    maxDate={values.endDate !== '' ? values.endDate + 1 : undefined}
                    fullWidth
                    errorMessage={touched.startDate && errors.startDate}
                  />
                  <DthDatePicker
                    name="endDate"
                    label="End Date"
                    value={values.endDate}
                    minDate={values.startDate !== '' ? values.startDate + 1 : undefined}
                    onChange={(newValue) => {
                      setFieldValue('endDate', newValue);
                    }}
                    sx={{ my: 1 }}
                    fullWidth
                    errorMessage={touched.endDate && errors.endDate}
                  />
                </Stack>
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
            <LoadingButton type="button" variant="contained" onClick={handleProcess} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
