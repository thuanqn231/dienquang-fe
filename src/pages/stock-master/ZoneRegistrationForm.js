import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField, Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';

import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ZoneRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function ZoneRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, updateCommonDropdown } = useAuth();
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

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/stock-management/zone/create',
          data: {
            zone: {
              code: valuesForm?.zoneCode.toUpperCase() || null,
              name: valuesForm?.zoneName || null,
              caPaLimit: valuesForm?.capaLimit || null,
              state: valuesForm?.state || 'RUNNING',
              stock: {
                factoryPk: valuesForm?.stock || ''
              },
              pk: {
                factoryCode: valuesForm?.factory || null
              }
            }
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
            updateCommonDropdown();
            enqueueSnackbar(translate(`message.register_zone_successful`), {
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
    } else {
      try {
        mutate({
          url: '/v1/stock-management/zone/update',
          data: {
            zone: {
              factoryPk: currentData.factoryPk,
              code: valuesForm?.zoneCode.toUpperCase() || null,
              name: valuesForm?.zoneName || null,
              caPaLimit: valuesForm?.capaLimit || null,
              state: valuesForm?.state || 'RUNNING',
              stock: {
                factoryPk: valuesForm?.stock || ''
              }
            }
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
            updateCommonDropdown();
            enqueueSnackbar(translate(`message.update_zone_successful`), {
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
  const UOMSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    stock: Yup.string().required('Storage is required'),
    zoneCode: Yup.string().required('Zone Code is required').length(4, 'Zone Code must be 4 characters'),
    zoneName: Yup.string().required('Zone Name is required'),
    capaLimit: Yup.number().min(1, 'Capa Limit must be greater than 0')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      state: isEdit && currentData?.state || 'RUNNING',
      stock: isEdit && currentData?.stock || '',
      zoneCode: isEdit && currentData?.zoneCode || '',
      zoneName: isEdit && currentData?.zoneName || '',
      capaLimit: isEdit && currentData?.capaLimit || ''
    },
    validationSchema: UOMSchema,
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
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('stock')}
                    id="stock"
                    name="stock"
                    label="Storage"
                    required
                    onChange={handleChange}
                    options={commonDropdown.stockDropdown.filter((stock) => stock.factory === values.factory)}
                    defaultValue=""
                    errorMessage={touched.stock && errors.stock}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Zone Code"
                    required
                    disabled={isEdit}
                    {...getFieldProps('zoneCode')}
                    error={Boolean(touched.zoneCode && errors.zoneCode)}
                    helperText={touched.zoneCode && errors.zoneCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Zone Name"
                    required
                    {...getFieldProps('zoneName')}
                    error={Boolean(touched.zoneName && errors.zoneName)}
                    helperText={touched.zoneName && errors.zoneName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Capa Limit"
                    type="number"
                    {...getFieldProps('capaLimit')}
                    error={Boolean(touched.capaLimit && errors.capaLimit)}
                    helperText={touched.capaLimit && errors.capaLimit}
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
              </Stack>
            </Card>
          </Grid>

        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate('button.cancel')}
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
