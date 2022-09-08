import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { createUpdateData, loadSelectedData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const FactoryFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [factory, setFactory] = useState({
    factoryCode: '',
    factoryName: '',
    sortOder: '',
    statue: 'RUNNING'
  });

  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    onLoadData();
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const updateParams = {
        name: values.factoryName,
        state: values.state,
        rank: values.rank,
        factoryPk: FACTORYID
      }
      const response = await createUpdateData(`${BASE_URL}/factory/update`, 'factory', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.factory_was_updated_successfully`) });
    resetForm();
    setSubmitting(false);
    setIsOpenConfirmModal(false);
    closeDialog();
    onReload();
    updateCommonDropdown();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const onLoadData = async () => {
    try {
      const data = await loadSelectedData(`${BASE_URL}/factory`, FACTORYID);
      if (data) {
        setFactory((preValue) => ({
          ...preValue,
          rank: data.rank,
          factoryCode: data?.pk?.factoryCode,
          factoryName: data.name,
          state: data.state
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setFactory(null);
      console.error(error);
    }
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const FactorySchema = Yup.object().shape({
    factoryCode: Yup.string().required('Factory Code is required'),
    factoryName: Yup.string().required('Factory Name is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factoryCode: factory?.factoryCode || '',
      factoryName: factory?.factoryName || '',
      state: factory?.state || 'RUNNING',
      rank: factory?.rank || ''
    },
    validationSchema: FactorySchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_factory`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="factoryCode"
                      fullWidth
                      label="Factory Code*"
                      disabled
                      {...getFieldProps('factoryCode')}
                      error={Boolean(touched.factoryCode && errors.factoryCode)}
                      helperText={touched.factoryCode && errors.factoryCode}
                    />
                    <Dropdown
                      {...getFieldProps('state')}
                      id="state"
                      name="state"
                      label="Use(Y/N)"
                      allowEmptyOption={false}
                      disabled
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.state && errors.state}
                    />
                    <TextField
                      name="rank"
                      fullWidth
                      label="Sort Order"
                      type="number"
                      {...getFieldProps('rank')}
                      error={Boolean(touched.rank && errors.rank)}
                      helperText={touched.rank && errors.rank}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      fullWidth
                      name="factoryName"
                      label="Factory Name*"
                      {...getFieldProps('factoryName')}
                      error={Boolean(touched.factoryName && errors.factoryName)}
                      helperText={touched.factoryName && errors.factoryName}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={closeDialog}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              // disabled
              loadingIndicator="Loading..."
            >
              {translate(`button.modify`)}
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
      <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
        <Typography variant="subtitle1" align="center">
          {translate(`typo.do_you_want_to_modify`)} ?
        </Typography>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
            {translate(`button.no`)}
          </Button>
          <LoadingButton type="button" variant="contained" onClick={handleUpdate} loading={isSubmitting}>
            {translate(`button.yes`)}
          </LoadingButton>
        </DialogActions>
      </DialogAnimate>
    </DialogDragable>
  );
});

FactoryFormModify.propTypes = {
  FACTORYID: PropTypes.string.isRequired,
  onReload: PropTypes.func
};

export default FactoryFormModify;
