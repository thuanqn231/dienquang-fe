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
import { closeUserInfoActionModal } from '../../redux/slices/userManagement';
import { useDispatch } from '../../redux/store';
import { countryCallingCode, countryCallingCodePlaceHolder } from '../../utils/countryCallingCode';
import { encryptPassword } from '../../utils/encrypt';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

UserRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function UserRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const dispatch = useDispatch();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate } = useLocales();
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
    dispatch(closeUserInfoActionModal());
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const handleRegisterUser = async () => {
    formik.setSubmitting(true);
    const phoneNumber = `${values?.countryCallingCode}-${values?.phoneNumber.replace(/[^\d]/g, "")}`
    if (!isEdit) {
      try {
        const createParams = {
          code: values?.employee_id || null,
          email: values?.email || null,
          userName: values?.user_name || null,
          password: encryptPassword(values?.password) || null,
          firstName: values?.employee_first_name || null,
          lastName: values?.employee_last_name || null,
          phoneNumber: phoneNumber || null,
          mobileNumber: values?.mobileNumber || null,
          address: values?.address || null,
          taxCode: values?.taxCode || null,
          jobCode: values?.jobCode || null,
          hireDate: values?.hireDate || null,
          resignDate: values?.resignDate || null,
          userState: 'VALID',
          department: {
            factoryPk: values?.department || null
          },
          pk: {
            factoryCode: values?.factory || null
          }
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'user', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: 'User was registered successfully' });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          factoryPk: currentData.factoryPk,
          code: values?.employee_id || null,
          email: values?.email || null,
          userName: values?.user_name || null,
          firstName: values?.employee_first_name || null,
          lastName: values?.employee_last_name || null,
          phoneNumber: phoneNumber || null,
          mobileNumber: values?.mobileNumber || null,
          address: values?.address || null,
          taxCode: values?.taxCode || null,
          jobCode: values?.jobCode || null,
          hireDate: values?.hireDate || null,
          resignDate: values?.resignDate || null,
          userState: 'VALID',
          department: {
            factoryPk: values?.department || null
          }
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'user', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_user_successful`) });
        }
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  }

  const parseCountryCallingCode = (phoneNumber) => phoneNumber && phoneNumber.slice(0, phoneNumber.indexOf("-"));

  const parsePhoneNumber = (phoneNumber) => phoneNumber && phoneNumber.slice(phoneNumber.indexOf("-") + 1, phoneNumber.length);
  
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

  const NewUserSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    employee_id: Yup.string().required('Employee ID is required'),
    employee_first_name: Yup.string().required('Employee First Name is required'),
    employee_last_name: Yup.string().required('Employee Last Name is required'),
    department: Yup.string().required('Department is required'),
    email: Yup.string().required('Email is required').email(),
    phoneNumber: Yup.string().required('Phone number is required').min(10, 'Invalid phone format').max(12, 'Invalid phone format'),
    user_name: Yup.string().required('User Name is required')
  });
  const PasswordRequiredSchema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
    confirm_password: Yup.string().required('Confirm Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });

  const PasswordNotRequiredSchema = Yup.object().shape({
    password: Yup.string(),
    confirm_password: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData.pk?.factoryCode || '',
      employee_id: isEdit && currentData?.code || '',
      employee_first_name: isEdit && currentData?.firstName || '',
      employee_last_name: isEdit && currentData?.lastName || '',
      department: isEdit && currentData.department?.factoryPk || '',
      user_name: isEdit && currentData?.userName || '',
      password: isEdit && currentData?.password || '',
      confirm_password: isEdit && currentData?.confirm_password || '',
      email: isEdit && currentData?.email || '',
      phoneNumber: isEdit && parsePhoneNumber(currentData?.phoneNumber) || '',
      countryCallingCode: isEdit && parseCountryCallingCode(currentData?.phoneNumber) || '+84',
    },
    validationSchema: NewUserSchema.concat(isEdit ? PasswordNotRequiredSchema : PasswordRequiredSchema),
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, resetForm, setFieldValue, setErrors, setSubmitting } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ px: 1, pb: 2 }}>
              <Typography variant="subtitle1" sx={{ pt: 1, pb: 2 }}>{translate(`typo.employee_information`)}</Typography>
              <Stack spacing={3}>
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
                  autoComplete="off"
                  label="Employee ID"
                  required
                  disabled={isEdit}
                  {...getFieldProps('employee_id')}
                  error={Boolean(touched.employee_id && errors.employee_id)}
                  helperText={touched.employee_id && errors.employee_id}
                />


                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Employee Fist Name"
                    required
                    {...getFieldProps('employee_first_name')}
                    error={Boolean(touched.employee_first_name && errors.employee_first_name)}
                    helperText={touched.employee_first_name && errors.employee_first_name}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Employee Last Name"
                    required
                    {...getFieldProps('employee_last_name')}
                    error={Boolean(touched.employee_last_name && errors.employee_last_name)}
                    helperText={touched.employee_last_name && errors.employee_last_name}
                  />
                </Stack>

                <Dropdown
                  {...getFieldProps('department')}
                  id="department"
                  name="department"
                  label='Department'
                  required
                  onChange={handleChange}
                  options={commonDropdown.departmentDropdown}
                  defaultValue=''
                  errorMessage={touched.department && errors.department}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ px: 1, pb: 2 }}>
              <Typography variant="subtitle1" sx={{ pt: 1, pb: 2 }}>{translate(`typo.user_information`)}</Typography>
              <Stack spacing={3}>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="User ID"
                  required
                  {...getFieldProps('user_name')}
                  disabled={isEdit}
                  error={Boolean(touched.user_name && errors.user_name)}
                  helperText={touched.user_name && errors.user_name}
                />
                {!isEdit &&
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Password"
                      type="password"
                      {...getFieldProps('password')}
                      disabled={isEdit}
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      {...getFieldProps('confirm_password')}
                      disabled={isEdit}
                      error={Boolean(touched.confirm_password && errors.confirm_password)}
                      helperText={touched.confirm_password && errors.confirm_password}
                    />
                  </Stack>
                }
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Email Address"
                  required
                  disabled={isEdit}
                  {...getFieldProps('email')}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Grid item xs={4} md={4}>
                    <Dropdown
                      {...getFieldProps('countryCallingCode')}
                      id="countryCallingCode"
                      name="countryCallingCode"
                      label='Phone Number'
                      required
                      allowEmptyOption={false}
                      onChange={handleChange}
                      options={countryCallingCode}
                      defaultValue=''
                      errorMessage={touched.department && errors.department}
                    />
                  </Grid>
                  <Grid item xs={8} md={8}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label={`${countryCallingCodePlaceHolder[values.countryCallingCode]}`}
                      required
                      {...getFieldProps('phoneNumber')}
                      error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                  </Grid>
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{isEdit ? translate(`button.modify`) : translate(`button.register`)}</LoadingButton>
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
    </FormikProvider >
  );
}
