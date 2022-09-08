import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
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
import { getLossMasterDropdown } from '../../redux/slices/lossManagement';
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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const { allLossMasterDropdown } = useSelector((state) => state.lossManagement);

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      for (let i = 0; i < allLossMasterDropdown.length; ) {
        if (
          allLossMasterDropdown[i].lossCls.code === values.lossCls &&
          allLossMasterDropdown[i].classification.code === values.classification &&
          allLossMasterDropdown[i].lossType.code === values.lossType &&
          allLossMasterDropdown[i].pk.factoryCode === values.factory &&
          allLossMasterDropdown[i].lossItem === values.lossItem
        ) {
          setIsOpenConfirmModal(false);
          enqueueSnackbar(translate(`message.loss_master_was_registered_unsuccessfully_by_duplicate`), {
            variant: 'warning',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          return;
        }
        i += 1;
      }
      try {
        mutate({
          url: '/v1/loss/master/create',
          data: {
            lossMaster: {
              lossType: {
                code: valuesForm?.lossType
              },

              classification: {
                code: valuesForm?.classification
              },
              lossCls: {
                code: valuesForm?.lossCls
              },

              lossItem: valuesForm?.lossItem,
              state: valuesForm?.state,
              pk: { factoryCode: valuesForm?.factory || '' }
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              if (res.data !== []) {
                dispatch(getLossMasterDropdown());
                formik.resetForm();
                formik.setSubmitting(false);
                onLoadData();
                setIsOpenConfirmModal(false);
                onCancel();
                enqueueSnackbar(translate(`message.loss_master_was_registered_successfully`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
              } else {
                setIsOpenConfirmModal(false);
                enqueueSnackbar(translate(`message.loss_master_was_registered_unsuccessfully`), {
                  variant: 'warning',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
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
          url: '/v1/loss/master/update',
          data: {
            lossMaster: {
              lossType: {
                code: valuesForm?.lossType
              },

              classification: {
                code: valuesForm?.classification
              },
              lossCls: {
                code: valuesForm?.lossCls
              },
              lossItem: valuesForm?.lossItem,
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
              dispatch(getLossMasterDropdown());
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.loss_master_was_updated_successfully`), {
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
    lossItem: Yup.string().required('Loss Item is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      // new 1
      lossType: (isEdit && currentData?.lossType) || '',
      classification: (isEdit && currentData?.classification) || '',
      lossCls: (isEdit && currentData?.lossCls) || '',
      lossItem: (isEdit && currentData?.lossItem) || ''
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
                    groupId="D042000"
                  />
                  <Dropdown
                    fullWidth
                    id="classification"
                    name="classification"
                    label="Classification"
                    required
                    {...getFieldProps('classification')}
                    onChange={handleChange}
                    groupId="D043000"
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
                    groupId="D044000"
                    errorMessage={touched.lossCls && errors.lossCls}
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
                    disabled={!isEdit}
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Loss Item"
                  required
                  {...getFieldProps('lossItem')}
                  error={Boolean(touched.lossItem && errors.lossItem)}
                  helperText={touched.lossItem && errors.lossItem}
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
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
            isEdit ? translate(`typo.modify`) : translate(`typo.register`)
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
