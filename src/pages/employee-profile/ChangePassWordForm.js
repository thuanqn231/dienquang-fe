import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography, InputAdornment, IconButton } from '@material-ui/core';

import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';

import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
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
import { encryptPassword } from '../../utils/encrypt';

// ----------------------------------------------------------------------

ChangePassWordForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  currentUser: PropTypes.object,
};

export default function ChangePassWordForm({
  isEdit,
  currentData,
  onLoadData,
  onCancel,
  currentUser, onClose
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const { allLossMasterDropdown } = useSelector((state) => state.lossManagement);

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleChangePass = () => {
    mutate({
      url: '/v1/user/change',
      data: {
        id: currentUser?.pk?.id,
        factoryCode: currentUser?.pk?.factoryCode,
        oldPassword: encryptPassword(valuesForm?.curPass),
        newPassword: encryptPassword(valuesForm?.newPass),
      },
      method: 'post',
      featureCode: 'user.create'
    }).
      then((res) => {
        handleCloseConfirmModal()
        onClose();
        enqueueSnackbar(translate(`message.change_pass_success`), {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        console.log(res)
      })
  };
  const LossMasterSchema = Yup.object().shape({
    curPass: Yup.string().required('Current Pass is required'),
    newPass: Yup.string().required('New Pass is required'),
    confirmPass: Yup.string().oneOf([Yup.ref('newPass'), null], 'Passwords must match'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      curPass: '',
      newPass: '',
      confirmPass: ''
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
  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Current Password"
                    {...getFieldProps('curPass')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword} edge="end">
                            <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(touched.curPass && errors.curPass)}
                    helperText={touched.curPass && errors.curPass}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    name='newPass'
                    type={showPassword ? 'text' : 'password'}
                    label="New password"
                    {...getFieldProps('newPass')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword} edge="end">
                            <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(touched.newPass && errors.newPass)}
                    helperText={touched.newPass && errors.newPass}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    name='confirmPass'
                    type={showPassword ? 'text' : 'password'}
                    label="Confirm New Pass again"
                    {...getFieldProps('confirmPass')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword} edge="end">
                            <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(touched.confirmPass && errors.confirmPass)}
                    helperText={touched.confirmPass && errors.confirmPass}
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            change password
          </LoadingButton>
        </DialogActions>

        <DialogAnimate title={`${translate(`typo.confirm`)}`} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${translate(`typo.change_password`)}`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleChangePass}>
              {translate(`typo.change_password`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
