import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography, FormHelperText, FormControlLabel, Switch } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { UploadAvatar } from '../../components/upload';
import { countries } from '../../components/map/assets/countries';
import { mutate } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import { getLossMasterDropdown } from '../../redux/slices/lossManagement';
import { useDispatch, useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// utils
import { countryCallingCode, countryCallingCodePlaceHolder } from '../../utils/countryCallingCode';
import { fData } from '../../utils/formatNumber';
import { fDate } from '../../utils/formatTime';
// components
import ChangePassWordForm from './ChangePassWordForm'
// ----------------------------------------------------------------------

EmployeeProfile.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function EmployeeProfile({
  isEdit,
  currentData,
  currentUser,
  onCancel,
  onLoadData,
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [changePassWord, setChangePassWord] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');
  const [file, setFile] = useState(null);
  const [currFiles, setCurrFiles] = useState(null)

  console.log('commonDropdown', commonDropdown)
  console.log('currentUser', currentUser)

  useEffect(() => {
    if (file) {
      console.log('trigerred', file);
      setFieldValue('avatarUrl', file[0]);
    }
  }, [file])
  useEffect(() => {
    setCurrFiles(currentUser?.attachedFile)
  }, [])
  useEffect(() => {
    if (currentUser?.attachedFiles) {
      setFieldValue('avatarUrl', currentUser?.attachedFiles[0]);
    }
  }, [])

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleModify = async () => {
    const phoneNumber = `${valuesForm?.countryCallingCode}-${valuesForm?.phoneNumber.replace(/[^\d]/g, "")}`
    setSubmitting(true);
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];

    // const sameArray = JSON.stringify(file) === JSON.stringify(currFiles);

    // if (!isEmpty(file) && !sameArray) {
    //   const uploadFile = await handleUploadFiles();
    //   isUploadFileSuccess = uploadFile.isUploadFileSuccess;
    //   uploadFileMessage = uploadFile.uploadFileMessage;
    //   attachedFileIds = uploadFile.attachedFileIds;
    //   attachedFilePks = uploadFile.attachedFilePks;
    // }
    if (isEmpty(file) && (Array.isArray(valuesForm.avatarUrl) ? valuesForm.avatarUrl[0] : valuesForm.avatarUrl)) {

      let _file
      if (Array.isArray(valuesForm.avatarUrl)) {
        [_file] = valuesForm.avatarUrl
      }
      else _file = valuesForm.avatarUrl;

      // const uploadFile = await handleUploadFiles(_file);
      attachedFileIds = [_file.pk.id];
      attachedFilePks = [_file.factoryPk];
    }
    else {
      const uploadFile = await handleUploadFiles(file);
      isUploadFileSuccess = uploadFile.isUploadFileSuccess;
      uploadFileMessage = uploadFile.uploadFileMessage;
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }


    console.log('valuesForm', valuesForm.avatarUrl)

    const valueQuery = {
      ...valuesForm,
      phoneNumber,
      attachedFileIds,
      attachedFilePks,
      dateOfBirth: fDate(valuesForm?.dateOfBirth),
      pk: {
        id: currentUser?.pk?.id,
        factoryCode: currentUser?.pk?.factoryCode
      },
      department: {
        pk: valuesForm.department
      }
    }
    delete valueQuery.countryCallingCode;
    delete valueQuery.avatarUrl;
    delete valueQuery.userID;
    delete valueQuery.employeeID;

    console.log('valueQuery', valueQuery);
    handleCloseConfirmModal();
    mutate({
      url: '/v1/user/update',
      data: {
        user: {
          ...valueQuery
        }
      },
      method: 'post',
      featureCode: 'user.create'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        resetForm();
        setSubmitting(false);
        onLoadData();
        setIsOpenConfirmModal(false);
        enqueueSnackbar(translate(`message.change_info_success`), {
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
      console.error(error);
      enqueueSnackbar(translate(`message.change_info_failed`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    });
  };
  const onChangePass = () => {
    setChangePassWord(true)
  }
  const onCanel = () => {
    setChangePassWord(false)
    setSubmitting(false);
  }
  const parseCountryCallingCode = (phoneNumber) => phoneNumber && phoneNumber.slice(0, phoneNumber.indexOf("-"));

  const parsePhoneNumber = (phoneNumber) => phoneNumber && phoneNumber.slice(phoneNumber.indexOf("-") + 1, phoneNumber.length);

  const handleCloseModalChangePass = () => {
    setChangePassWord(false)
  }
  const handleUploadFiles = async (File) => {
    console.log('file', File);
    const formData = new FormData();
    const listFile = [];

    if (File) {
      listFile.push(File[0]);
      console.log('listFile', listFile);
      listFile.forEach((file) => {
        formData.append('files', file);
      });
    }

    const accessToken = window.localStorage.getItem('accessToken');
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    console.log('formData', formData);
    try {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.FeatureCode = `code.create`;
      await axios({
        method: 'post',
        url: '/v1/file-storage/upload-multiple',
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        data: formData
      })
        .then((res) => {
          console.log('res', res);
          if (res.data.httpStatusCode === 200) {
            isUploadFileSuccess = true;
            uploadFileMessage = res.statusMessage;
            attachedFileIds = res.data.data.map((file) => file.pk.id);
            attachedFilePks = res.data.data.map((file) => file.factoryPk);
          }
        })
        .catch((error) => {
          uploadFileMessage = error;
          console.error(error);
        });
    } catch (error) {
      uploadFileMessage = error;
      console.error(error);
    }
    return {
      isUploadFileSuccess,
      uploadFileMessage,
      attachedFileIds,
      attachedFilePks
    };
  };

  const userProfileSchema = Yup.object().shape({
    // firstName: Yup.string().required('First name is required'),
    // lastName: Yup.string().required('Last name is required'),
    // email: Yup.string().required('Email is required').email(),
    // phoneNumber: Yup.string().required('Phone number is required'),
    // address: Yup.string().required('Address is required'),
    // -------------------------------------------------
    // nation: Yup.string().required('country is required'),
  });
  console.log('sdt', parsePhoneNumber(currentUser?.phoneNumber))

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      gender: currentUser?.gender || '',
      email: currentUser?.email || '',
      address: currentUser?.address || '',
      nation: currentUser?.nation || '',
      avatarUrl: currentUser?.attachedFiles || null,
      userID: currentUser?.userName || '',
      employeeID: currentUser?.code || '',
      dateOfBirth: currentUser?.dateOfBirth || '',
      department: currentUser?.department?.factoryPk || '',
      phoneNumber: parsePhoneNumber(currentUser?.phoneNumber) || '',
      countryCallingCode: parseCountryCallingCode(currentUser?.phoneNumber) || '+84',
    },
    validationSchema: userProfileSchema,
    onSubmit: (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true);
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, setSubmitting } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const _file = { ...acceptedFiles[0] };
      if (_file) {
        setFile(
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            }))
        );

      }
    },
    [setFieldValue]
  );
  console.log('commonDropdown.departmentDropdown', commonDropdown.departmentDropdown)
  const cancelChangePass = () => {
    setChangePassWord(false)
  }

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ py: 10, px: 3 }}>


              <Box sx={{ mb: 5 }}>
                <UploadAvatar
                  accept="image/*"
                  file={values.avatarUrl}
                  maxSize={3145728}
                  onDrop={handleDrop}
                  error={Boolean(touched.avatarUrl && errors.avatarUrl)}
                  caption={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
                <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                  {touched.avatarUrl && errors.avatarUrl}
                </FormHelperText>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...getFieldProps('firstName')}
                    error={Boolean(touched.firstName && errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...getFieldProps('lastName')}
                    error={Boolean(touched.lastName && errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                  />
                  <Dropdown
                    {...getFieldProps('gender')}
                    id="gender"
                    name="gender"
                    label='gender'
                    // required
                    allowEmptyOption={false}
                    onChange={handleChange}
                    options={[
                      { label: 'Male', value: 'MALE' },
                      { label: 'Female', value: 'FEMALE' }
                    ]}
                    defaultValue=''
                  // errorMessage={touched.department && errors.department}
                  />
                  <TextField
                    select
                    fullWidth
                    label="nation"
                    placeholder="nation"
                    {...getFieldProps('nation')}
                    SelectProps={{ native: true }}
                    error={Boolean(touched.nation && errors.nation)}
                    helperText={touched.nation && errors.nation}
                  >
                    <option value="" />
                    {countries.map((option) => (
                      <option key={option.code} value={option.label}>
                        {option.name}
                      </option>
                    ))}
                  </TextField>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    disabled
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <DthDatePicker
                    name="dateOfBirth"
                    label="Date Of Birth"
                    value={values.dateOfBirth}
                    onChange={(newValue) => {
                      setFieldValue('dateOfBirth', fDate(newValue));
                    }}
                    sx={{ my: 1 }}
                    fullWidth
                    errorMessage={touched.dateOfBirth && errors.dateOfBirth}
                  />
                </Stack>
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
                    // errorMessage={touched.department && errors.department}
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="User ID"
                    disabled
                    {...getFieldProps('userID')}
                    error={Boolean(touched.userID && errors.userID)}
                    helperText={touched.userID && errors.userID}
                  />
                  <TextField
                    fullWidth
                    label="Employee ID"
                    disabled
                    {...getFieldProps('employeeID')}
                    error={Boolean(touched.employeeID && errors.employeeID)}
                    helperText={touched.employeeID && errors.employeeID}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    {...getFieldProps('address')}
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />
                  <Dropdown
                    {...getFieldProps('department')}
                    id="department"
                    name="department"
                    label="department"
                    // onChange={handleChange}
                    options={
                      commonDropdown.departmentDropdown
                        .filter((item) => item.factory === currentUser?.pk?.factoryCode)
                        .map((item) => ({
                          value: item.value,
                          label: item.label
                        }))
                    }
                    onChange={
                      (e) => {
                        console.log('e', e);
                        setFieldValue('department', e.target.value);
                      }
                    }
                    errorMessage={touched.department && errors.department}
                  />
                </Stack>


              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onChangePass}>
            change password
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">Save Changes</LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
            }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleModify}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <DialogDragable
          title={translate(`typo.change_password`)}
          maxWidth="lg"
          open={changePassWord}
          onClose={handleCloseModalChangePass}
        >
          <ChangePassWordForm currentUser={currentUser} onCancel={setChangePassWord} onClose={handleCloseModalChangePass} />
        </DialogDragable>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
