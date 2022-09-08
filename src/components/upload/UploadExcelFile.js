import { Link as RouterLink } from 'react-router-dom';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, Link, Typography, FormHelperText } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash-es';
import * as Yup from 'yup';
import { MIconButton } from '../@material-extend';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// components
import { DialogAnimate } from '../animate';
import { mutate, query } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
import UploadSingleFile from './UploadSingleFile';
import ChangeFactoryWarning from '../../pages/common/ChangeFactoryWarning';

// ----------------------------------------------------------------------
// Flow import excel file
// 1. Download template: handleDowloadTemplate()
// 2. Fill data in template file
// 3. Upload excel file: handleUploadFile()
// 4. Get recordId and start interval to check Poll: checkPollRequest()
// 5. If response excel data, clear interval and submit to database: submitToDatabase()
// 6. Delete from Redis: deleteFromRedis()
// ----------------------------------------------------------------------

UploadExcelFile.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  templateCode: PropTypes.string.isRequired
};

export default function UploadExcelFile({ templateCode, onCancel, onLoadData, isProductionOrder = false }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isConfirmUpload, setIsConfirmUpload] = useState(false);
  const [startCheckPoll, setStartCheckPoll] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const intervalRef = useRef(null);
  const { commonDropdown } = useAuth();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState('');
  const { translate } = useLocales();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (startCheckPoll) {
        checkPollRequest();
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [startCheckPoll]);

  const checkPollRequest = async () => {
    await query({
      url: `/v1/import/excel/${recordId}`,
      featureCode: 'user.create'
    })
      .then((pollRequest) => {
        // TODO: change logic when get ERROR: just show error message
        if (pollRequest?.data?.importState === 'PROCESSED' || pollRequest?.data?.importState === 'ERROR') {
          clearInterval(intervalRef.current);
          submitToDatabase();
        }
      })
      .catch((error) => {
        handleCloseConfirmModal();
        setIsConfirmUpload(false);
        console.error(error);
      });
  };

  const submitToDatabase = async () => {
    const patchRecord = await mutate({
      url: `/v1/import/excel/${recordId}`,
      method: 'patch',
      isShowMessage: false,
      featureCode: 'code.create'
    }).catch((error) => {
      enqueueSnackbar(translate(`message.check_file_again`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      handleCloseConfirmModal();
      setIsConfirmUpload(false);
      console.error(error);
    });

    // TODO: this one use for delete record not delete from redis :D
    if (patchRecord) {
      // deleteFromRedis();
      onLoadData();
      handleCloseConfirmModal();
      onCancel();
      setIsConfirmUpload(false);
      enqueueSnackbar(translate(`message.upload_data_success`), {
        variant: 'success',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const deleteFromRedis = async () => {
    const deleteRedis = await mutate({
      url: `/v1/import/excel/${recordId}`,
      method: 'delete',
      featureCode: 'code.create'
    }).catch((error) => {
      console.error(error);
    });
    if (deleteRedis) {
      onLoadData();
      handleCloseConfirmModal();
      onCancel();
      setIsConfirmUpload(false);
      enqueueSnackbar(translate(`message.upload_data_success`), {
        variant: 'success',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );
    }
  }, []);

  const handleRemove = () => {
    setFile(null);
  };

  const handleUploadFile = async () => {
    setIsConfirmUpload(true);
    const formData = new FormData();
    formData.append('file', file);
    const accessToken = window.localStorage.getItem('accessToken');
    let appendUrl = '';
    if (isProductionOrder) {
      appendUrl = `&operation=${values.operation}`;
    }
    try {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.FeatureCode = `code.create`;
      await axios({
        method: 'post',
        url: `/v1/import/excel?configurationCode=${templateCode}&factoryCode=${values.factory}${appendUrl}`,
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        data: formData
      })
        .then(async (res) => {
          if (res?.data) {
            const { data } = res.data;
            const recordId = `${data.pk.factoryCode}-${data.pk.id}`;
            setRecordId(recordId);
            setStartCheckPoll(true);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDowloadTemplate = async (e) => {
    e.preventDefault();
    const formErrors = await validateForm();
    if (!isEmpty(formErrors?.factory)) {
      enqueueSnackbar(translate(`message.please_select_1_factory`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      const response = await query({
        url: `/v1/import/excel/template/${templateCode}?factoryCode=${values.factory}`,
        featureCode: 'user.create'
      });
      const { data } = response;
      if (data) {
        saveAs(
          `${window.__RUNTIME_CONFIG__.REACT_APP_REST_API_URL}/v1/file-storage/static/download?filePath=${
            data.downloadUrl.split('filePath=')[1]
          }`,
          `${values.factory}_${templateCode}_${data.fileName}.${data.contentType}`
        );
      }
    }
  };

  const ExcelUploadSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    operation: Yup.string().when('isProductionOrder', {
      is: true,
      then: Yup.string().required('Operation is required'),
      otherwise: Yup.string()
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      isProductionOrder,
      factory: '',
      operation: ''
    },
    validationSchema: ExcelUploadSchema,
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

  const {
    values,
    errors,
    touched,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    resetForm,
    validateForm,
    setFieldError
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Dropdown
                    {...getFieldProps('factory')}
                    id="factory"
                    name="factory"
                    label="Factory"
                    size="small"
                    required
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    errorMessage={touched.factory && errors.factory}
                  />
                  {isProductionOrder && (
                    <Dropdown
                      {...getFieldProps('operation')}
                      id="operation"
                      name="operation"
                      label="Operation"
                      size="small"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Main Plan', label: 'Main Plan' },
                        { value: 'Sub Plan', label: 'Sub Plan' }
                      ]}
                      errorMessage={touched.operation && errors.operation}
                    />
                  )}
                </Stack>
                <UploadSingleFile accept=".xlsx" file={file} onDrop={handleDropSingleFile} onRemove={handleRemove} />
                <Link
                  component={RouterLink}
                  variant="subtitle2"
                  to="#"
                  onClick={handleDowloadTemplate}
                  target="_blank"
                  download
                >
                  Download Template
                </Link>
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isConfirmUpload}
            loadingIndicator="Loading..."
            disabled={!file}
          >
            {translate(`button.upload`)}
          </LoadingButton>
        </DialogActions>

        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">
            {translate(`typo.do_you_want_to_upload`)}
          </Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="button"
              variant="contained"
              loading={isConfirmUpload}
              loadingIndicator="Uploading..."
              onClick={handleUploadFile}
            >
              {translate(`button.confirm`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
