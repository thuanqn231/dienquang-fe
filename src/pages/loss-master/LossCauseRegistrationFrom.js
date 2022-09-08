import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import { useDispatch, useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

LossRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function LossRegistrationForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  setselectedLossMasterId,
  setcurrentLossMaster
}) {
  const dispatch = useDispatch();
  const { allLossMasterDropdown } = useSelector((state) => state.lossManagement);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/loss/cause/create',
          data: {
            lossCause: {
              lossType: {
                code: valuesForm?.lossType || ''
              },
              productivity: valuesForm?.productivity || '',
              classification: {
                code: valuesForm?.classification || ''
              },
              lossCls: {
                code: valuesForm?.lossCls || ''
              },
              lossMaster: {
                factoryPk: valuesForm?.lossItem || ''
              },
              lossCause: valuesForm?.lossCause || '',
              pk: { factoryCode: valuesForm?.factory || '' }
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
              enqueueSnackbar(translate(`message.loss_cause_was_registered_successfully`), {
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
            console.error(error);
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
          url: '/v1/loss/cause/update',
          data: {
            lossCause: {
              lossType: {
                code: valuesForm?.lossType
              },

              classification: {
                code: valuesForm?.classification
              },
              lossCls: {
                code: valuesForm?.lossCls
              },
              productivity: valuesForm?.productivity,
              lossCause: valuesForm?.lossCause,
              lossMaster: {
                factoryPk: valuesForm?.lossItem
              },
              state: valuesForm?.state,
              pk: {
                factoryCode: currentData?.factory,
                id: currentData?.pkId
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
              enqueueSnackbar(translate(`message.loss_cause_was_updated_successfully`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
              setcurrentLossMaster({});
              setselectedLossMasterId(null);
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
  const LossMasterSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    lossType: Yup.string().required('Loss type is required'),
    classification: Yup.string().required('Classification is required'),
    lossCls: Yup.string().required('Loss Detail Cls is required'),
    lossItem: Yup.string().required('Loss Item is required'),
    lossCause: Yup.string().required('Loss Cause is required'),
    productivity: Yup.string().required('Product Apply is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      lossType: (isEdit && currentData?.lossType) || '',
      classification: (isEdit && currentData?.classification) || '',
      lossCls: (isEdit && currentData?.lossCls) || '',
      lossItem: (isEdit && currentData?.lossItem) || '',
      productivity: (isEdit && currentData?.productivity) || 'RUNNING',
      lossCause: (isEdit && currentData?.lossCause) || ''
    },
    validationSchema: LossMasterSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, resetForm, setFieldValue } = formik;

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
                  />
                  <Dropdown
                    fullWidth
                    id="lossType"
                    name="lossType"
                    label="Loss Type"
                    required
                    {...getFieldProps('lossType')}
                    onChange={handleChange}
                    errorMessage={touched.lossType && errors.lossType}
                    options={allLossMasterDropdown
                      .filter((item) => item.pk.factoryCode === values.factory)
                      .map((item) => ({
                        value: item.lossType.code,
                        label: item.lossType.name
                      }))
                      .reduce(
                        (previous, current) =>
                          [...previous].some((obj) => obj?.value === current.value)
                            ? [...previous]
                            : [...previous].concat(current),
                        []
                      )}
                  />
                  <Dropdown
                    fullWidth
                    id="classification"
                    name="classification"
                    label="Classification"
                    required
                    {...getFieldProps('classification')}
                    onChange={handleChange}
                    options={allLossMasterDropdown
                      .filter(
                        (item) => item.lossType.code === values.lossType && item.pk.factoryCode === values.factory
                      )
                      .map((item) => ({
                        value: item.classification.code,
                        label: item.classification.name
                      }))
                      .reduce(
                        (previous, current) =>
                          [...previous].some((obj) => obj?.value === current.value)
                            ? [...previous]
                            : [...previous].concat(current),
                        []
                      )}
                    errorMessage={touched.classification && errors.classification}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="lossCls"
                    name="lossCls"
                    label="Loss Detail Cls"
                    fullWidth
                    required
                    {...getFieldProps('lossCls')}
                    options={allLossMasterDropdown
                      .filter(
                        (item) =>
                          item.classification.code === values.classification &&
                          item.lossType.code === values.lossType &&
                          item.pk.factoryCode === values.factory
                      )
                      .map((item) => ({
                        value: item.lossCls.code,
                        label: item.lossCls.name
                      }))
                      .reduce(
                        (previous, current) =>
                          [...previous].some((obj) => obj?.value === current.value)
                            ? [...previous]
                            : [...previous].concat(current),
                        []
                      )}
                    errorMessage={touched.lossCls && errors.lossCls}
                  />

                  <Dropdown
                    id="productApply"
                    name="productivity"
                    label="Apply Productivity"
                    {...getFieldProps('productivity')}
                    allowEmptyOption={false}
                    onChange={handleChange}
                    options={[
                      { value: 'Y', label: 'Y' },
                      { value: 'N', label: 'N' }
                    ]}
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
                    fullWidth
                    id="lossItem"
                    name="lossItem"
                    label="Loss Item"
                    onChange={handleChange}
                    options={allLossMasterDropdown
                      .filter(
                        (item) =>
                          item.lossCls.code === values.lossCls &&
                          item.classification.code === values.classification &&
                          item.lossType.code === values.lossType &&
                          item.pk.factoryCode === values.factory
                      )
                      .map((item) => ({
                        value: item.factoryPk,
                        label: item.lossItem
                      }))
                      .reduce(
                        (previous, current) =>
                          [...previous].some((obj) => obj?.value === current.value)
                            ? [...previous]
                            : [...previous].concat(current),
                        []
                      )}
                    errorMessage={touched.lossItem && errors.lossItem}
                    {...getFieldProps('lossItem')}
                  />
                  <TextField
                    autoComplete="off"
                    name="lossCause"
                    fullWidth
                    label="Loss Cause"
                    required
                    {...getFieldProps('lossCause')}
                    error={Boolean(touched.lossCause && errors.lossCause)}
                    helperText={touched.lossCause && errors.lossCause}
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
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
            }?`}</Typography>
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
    </FormikProvider>
  );
}
