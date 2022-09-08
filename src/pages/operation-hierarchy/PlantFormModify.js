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

const PlantFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [plant, setPlant] = useState({
    plantCode: '',
    plantName: '',
    sortOder: '',
    statue: 'RUNNING',
    factory: ''
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
        code: values.plantCode,
        name: values.plantName,
        state: values.state,
        rank: values.rank,
        factoryPk: FACTORYID
      }
      const response = await createUpdateData(`${BASE_URL}/plant/update`, 'plant', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.plant_was_updated_successfully`) });
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
      const data = await loadSelectedData(`${BASE_URL}/plant`, FACTORYID);
      if (data) {
        setPlant((preValue) => ({
          ...preValue,
          rank: data.rank,
          plantCode: data.code,
          plantName: data.name,
          state: data.state,
          factory: data.factory.factoryPk
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setPlant(null);
      console.error(error);
    }
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const PlantSchema = Yup.object().shape({
    plantCode: Yup.string().required('Plant Code is required'),
    plantName: Yup.string().required('Plant Name is required'),
    factory: Yup.string().required('Facory is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      plantCode: plant?.plantCode || '',
      plantName: plant?.plantName || '',
      state: plant?.state || 'RUNNING',
      rank: plant?.rank || '',
      factory: plant?.factory || ''
    },
    validationSchema: PlantSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_plant`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      required
                      disabled
                      onChange={handleChange}
                      options={commonDropdown.factoryDropdownForPlant}
                      defaultValue=""
                      errorMessage={touched.factory && errors.factory}
                    />
                    <TextField
                      name="plantCode"
                      fullWidth
                      label="Plant Code"
                      disabled
                      required
                      {...getFieldProps('plantCode')}
                      error={Boolean(touched.plantCode && errors.plantCode)}
                      helperText={touched.plantCode && errors.plantCode}
                    />
                    <TextField
                      fullWidth
                      name="plantName"
                      label="Plant Name*"
                      {...getFieldProps('plantName')}
                      error={Boolean(touched.plantName && errors.plantName)}
                      helperText={touched.plantName && errors.plantName}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="rank"
                      fullWidth
                      label="Sort Order"
                      type="number"
                      {...getFieldProps('rank')}
                      error={Boolean(touched.rank && errors.rank)}
                      helperText={touched.rank && errors.rank}
                    />
                    <Dropdown
                      {...getFieldProps('state')}
                      id="state"
                      name="state"
                      label="Use(Y/N)"
                      allowEmptyOption={false}
                      required
                      // disabled
                      onChange={handleChange}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.state && errors.state}
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

PlantFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default PlantFormModify;
