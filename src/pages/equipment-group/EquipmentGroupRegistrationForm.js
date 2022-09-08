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

EquipmentGroupRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function EquipmentGroupRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
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
          code: values?.paramCode || null,
          name: values?.paramName || null,
          remark: values?.remark || null,
          state: values?.state || 'RUNNING',
          pk: {
            factoryCode: values?.factory
          }
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'equipmentGroup', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_equipment_group_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          factoryPk: currentData.factoryPk,
          code: values?.paramCode || null,
          name: values?.paramName || null,
          remark: values?.remark || null,
          state: values?.state || 'RUNNING'
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'equipmentGroup', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_equipment_group_successful`) });
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
  
  const EquipmentGroupSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    paramCode: Yup.string().required('Equipment Group Code is required'),
    paramName: Yup.string().required('Equipment Name is required'),
    remark: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      state: isEdit && currentData?.state || 'RUNNING',
      paramCode: isEdit && currentData?.paramCode || '',
      paramName: isEdit && currentData?.paramName || '',
      remark: isEdit && currentData?.remark || ''
    },
    validationSchema: EquipmentGroupSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, resetForm, setFieldValue, setSubmitting, setErrors } = formik;

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
                    label='Factory'
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    label="Use (Y/N)"
                    required
                    allowEmptyOption={false}
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
                    label="Equip. Grp. Code"
                    required
                    disabled={isEdit}
                    {...getFieldProps('paramCode')}
                    error={Boolean(touched.paramCode && errors.paramCode)}
                    helperText={touched.paramCode && errors.paramCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    required
                    label="Equip. Group Name"
                    {...getFieldProps('paramName')}
                    error={Boolean(touched.paramName && errors.paramName)}
                    helperText={touched.paramName && errors.paramName}
                  />
                </Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Remark"
                  {...getFieldProps('remark')}
                  error={Boolean(touched.paramName && errors.paramName)}
                  helperText={touched.paramName && errors.paramName}
                />

              </Stack>
            </Card>
          </Grid>

        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate('button.cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} ?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate('button.cancel')}
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
