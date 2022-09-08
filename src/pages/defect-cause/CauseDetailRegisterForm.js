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

CauseDetailRegisterForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function CauseDetailRegisterForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  setSelectedSymptomDetailId,
  setCurrentSymptomDetail,
  currentClass
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
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
          url: '/v1/cause/detail/create',
          data: {
            name: valuesForm?.name,
            rank: Number(valuesForm?.rank),
            state: valuesForm?.state,
            pk: { factoryCode: valuesForm?.factory || '' },
            defectCauseClass: {
              factoryPk: currentClass?.factoryPk,
              code: currentClass?.code
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              if (res.data !== []) {
                formik.resetForm();
                formik.setSubmitting(false);
                onLoadData('defectCauseDetail');
                setIsOpenConfirmModal(false);
                onCancel();
                enqueueSnackbar(translate(`message.defect_cause_detail_was_registered_successfully`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
              } else {
                setIsOpenConfirmModal(false);
                enqueueSnackbar(translate(`message.defect_cause_detail_was_registered_unsuccessfully`), {
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
          url: '/v1/cause/detail/update',
          data: {
            name: valuesForm?.name,
            rank: Number(valuesForm?.rank),
            state: valuesForm?.state,
            pk: { factoryCode: valuesForm?.factory, id: currentData?.pk?.id }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData('defectCauseDetail');
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.defect_cause_detail_was_updated_successfully`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
              setCurrentSymptomDetail({});
              setSelectedSymptomDetailId(null);
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
  const symptomClassRegSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    rank: Yup.string().matches(/^[0-9]*$/, 'Only number is accepted'),
    name: Yup.string().required('Name is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: currentClass?.pk?.factoryCode,
      state: (isEdit && currentData?.state) || 'RUNNING',
      // new 1
      code: (isEdit && currentData?.code) || 'Auto Generate',
      name: (isEdit && currentData?.name) || '',
      rank: (isEdit && currentData?.rank) || '0',
      className: currentClass?.name,
      classCode: currentClass?.code,
    },
    validationSchema: symptomClassRegSchema,
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
                    label="Factory"
                    required
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                    disabled
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Sort Order"
                    required
                    {...getFieldProps('rank')}
                    error={Boolean(touched.rank && errors.rank)}
                    helperText={touched.rank && errors.rank}
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
                    // disabled={!isEdit}
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Cause Class Code"
                    required
                    {...getFieldProps('classCode')}
                    error={Boolean(touched.code && errors.code)}
                    helperText={touched.code && errors.code}
                    disabled
                  />

                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="cause Class Name"
                    required
                    {...getFieldProps('className')}
                    disabled
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Defect cause Code"
                    disabled
                    required
                    {...getFieldProps('code')}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Defect Cause Name"
                    required
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
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
