import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Divider, Grid,
  Stack, TextField, Typography
} from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import useAuth from '../../hooks/useAuth';
import { Dropdown } from '../../core/wrapper';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

RoleRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function RoleRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const handleRegisterRole = async () => {
    setSubmitting(true);
    const factoryPk = currentData?.factoryPk || null;
    if (isEdit && factoryPk) {
      try {
        await mutate({
          url: '/v1/profile/update',
          data: {
            factoryPk,
            code: currentData?.role_code,
            name: valuesForm.role_name,
            description: valuesForm.description,
            featureGroupPermission: currentData?.featureGroupPermission
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            formik.resetForm();
            formik.setSubmitting(false);
            onLoadData();
            setIsOpenConfirmModal(false);
            onCancel();
            enqueueSnackbar(translate(`message.role_modify_successful`), {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
        }).catch((error) => {
          setSubmitting(false);
          formik.setSubmitting(false);
          formik.setErrors(error);
        });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else {
      const profileTemplate = await query({
        url: `/v1/profile/template`,
        featureCode: 'user.create'
      });
      try {
        await mutate({
          url: '/v1/profile/create',
          data: {
            pk: {
              factoryCode: valuesForm?.factory
            },
            name: valuesForm.role_name,
            description: valuesForm.description,
            featureGroupPermission: profileTemplate.data
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            formik.resetForm();
            formik.setSubmitting(false);
            onLoadData();
            setIsOpenConfirmModal(false);
            onCancel();
            enqueueSnackbar(translate(`message.role_register_successful`), {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
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

  const NewUserSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    role_code: Yup.string(),
    role_name: Yup.string().required('Role Name is required'),
    description: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      role_code: isEdit && currentData?.role_code || '',
      role_name: isEdit && currentData?.role_name || '',
      description: isEdit && currentData?.description || ''
    },
    validationSchema: NewUserSchema,
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

  const { errors, touched, isSubmitting, values, setSubmitting, handleSubmit, getFieldProps, setFieldValue, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
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
                  <TextField
                    fullWidth
                    label={isEdit ? "Role Code" : "Role Code is auto generated"}
                    disabled
                    {...getFieldProps('role_code')}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Role Name"
                    required
                    {...getFieldProps('role_name')}
                    error={Boolean(touched.role_name && errors.role_name)}
                    helperText={touched.role_name && errors.role_name}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    required
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to`)} {isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.no`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterRole} loading={isSubmitting} loadingIndicator="Processing...">
              {translate(`button.yes`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider >
  );
}
