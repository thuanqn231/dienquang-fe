import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

UOMRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function UOMRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

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

  const handleRegister = async () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        const createParams = {
          code: values?.unitCode || null,
          name: values?.unitName || null,
          description: values?.description || null,
          state: values?.state || 'RUNNING',
          pk: {
            factoryCode: values?.factory
          }
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'uom', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_uom_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          code: values?.unitCode || null,
          name: values?.unitName || null,
          description: values?.description || null,
          state: values?.state || 'RUNNING',
          factoryPk: currentData.factoryPk
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'uom', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_uom_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
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

  const UOMSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    unitCode: Yup.string().required('Unit Code is required'),
    unitName: Yup.string().required('Unit Name is required'),
    description: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      state: isEdit && currentData?.state || 'RUNNING',
      unitCode: isEdit && currentData?.unitCode || '',
      unitName: isEdit && currentData?.unitName || '',
      description: isEdit && currentData?.description || ''
    },
    validationSchema: UOMSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, resetForm, setFieldValue,setSubmitting, setErrors} = formik;

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
                    required
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
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
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Unit Code"
                    required
                    {...getFieldProps('unitCode')}
                    error={Boolean(touched.unitCode && errors.unitCode)}
                    helperText={touched.unitCode && errors.unitCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Unit Name"
                    required
                    {...getFieldProps('unitName')}
                    error={Boolean(touched.unitName && errors.unitName)}
                    helperText={touched.unitName && errors.unitName}
                  />
                </Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Description"
                  {...getFieldProps('description')}
                  error={Boolean(touched.description && errors.description)}
                  helperText={touched.description && errors.description}
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{isEdit ? translate(`button.modify`) : translate(`button.register`)}</LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider >
  );
}
