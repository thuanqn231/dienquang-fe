
import { Link as RouterLink } from 'react-router-dom';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, Link, Typography, FormHelperText
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
import { UploadSingleFile } from '../../components/upload';
// hooks
import useAuth from '../../hooks/useAuth';
import { closeUserInfoActionModal } from '../../redux/slices/userManagement';
// redux
import { useDispatch } from '../../redux/store';

// ----------------------------------------------------------------------

ProductionOrderUpload.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function ProductionOrderUpload({ onCancel, onLoadData }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [file, setFile] = useState(null);
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

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

  const handleSaveProductionOrder = () => {
    formik.setSubmitting(true);
    try {
      mutate({
        url: '/v1/mrp/create',
        data: {
          "mrp": {
            "code": valuesForm?.mrpCode.toUpperCase() || null,
            "name": valuesForm?.mrpName || null,
            "description": valuesForm?.description || null,
            "state": valuesForm?.state || 'RUNNING',
            "pk": {
              factoryCode: valuesForm?.factory
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
          enqueueSnackbar(translate(`message.register_mrp_controller_successful`), {
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

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    plant: Yup.string().required('Plant is required'),
    operation: Yup.string().required('Operation is required'),
    file: Yup.string().nullable().required('File is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: '',
      plant: '',
      operation: ''
    },
    validationSchema: MRPSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange } = formik;
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
                    size="small"
                    required
                    onChange={handleChange}
                    options={commonDropdown.factoryDropdown}
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('plant')}
                    id="plant"
                    name="plant"
                    label='Plant'
                    size="small"
                    required
                    onChange={handleChange}
                    options={commonDropdown.plantDropdown.filter((dd) => dd.factory === values.factory)}
                    errorMessage={touched.plant && errors.plant}
                  />
                  <Dropdown
                    {...getFieldProps('operation')}
                    id="operation"
                    name="operation"
                    label='Operation'
                    size="small"
                    required
                    onChange={handleChange}
                    options={[
                      { value: 'Main Plan', label: 'Main Plan' },
                      { value: 'Sub Plan', label: 'Sub Plan' }
                    ]}
                    errorMessage={touched.operation && errors.operation}
                  />
                </Stack>
                <UploadSingleFile
                  accept='.xlsx'
                  file={file}
                  onDrop={handleDropSingleFile}
                  onRemove={handleRemove} />
                {!file && <FormHelperText error color="error">Please select file to import!</FormHelperText>}
                <Link component={RouterLink} variant="subtitle2" to='/static/excel-template/PP01020101_ProductionOrder.xlsx' target="_blank" download>
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{translate(`button.upload`)}</LoadingButton>
        </DialogActions>

        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to_upload`)}?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleSaveProductionOrder}>
              {translate(`button.confirm`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
