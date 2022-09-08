import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogDragable } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getFactoryByPk } from '../../utils/formatString';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const WorkStationForm = forwardRef(({ onReload }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate } = useLocales();

  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    setIsOpenDialog(true);
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = async () => {
    formik.setSubmitting(true);
    try {
      const createParams = {
        code: values.wsCode.toUpperCase(),
        name: values.wsName,
        state: values.state,
        rank: values.rank,
        process: {
          factoryPk: values.process
        },
        pk: {
          factoryCode: getFactoryByPk(values.process)
        },
        reflect: values.reflect,
        lossCalculation: {
          code: values?.lossCalculation || null
        }
      }
      const response = await createUpdateData(`${BASE_URL}/workstation/create`, 'workstation', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.workstation_was_created_successfully`) });
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

  const WorkStationSchema = Yup.object().shape({
    wsCode: Yup.string().required('Work Station Code is required'),
    wsName: Yup.string().required('Work Station is required'),
    part: Yup.string().required('Part is required'),
    line: Yup.string().required('Line is required'),
    process: Yup.string().required('Process is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      wsCode: '',
      wsName: '',
      state: 'RUNNING',
      rank: 1,
      line: '',
      process: '',
      part: '',
      reflect: 'Y',
      lossCalculation: 'D059001'
    },
    validationSchema: WorkStationSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, values, getFieldProps, handleChange, resetForm, setSubmitting, setErrors } = formik;

  return (
    <DialogDragable title={translate(`typo.add_work_station`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('part')}
                      id="part"
                      name="part"
                      label="Part"
                      required
                      onChange={handleChange}
                      options={commonDropdown.partDropdown}
                      defaultValue=""
                      errorMessage={touched.part && errors.part}
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
                    <Dropdown
                      {...getFieldProps('state')}
                      id="state"
                      name="state"
                      label="Use(Y/N)"
                      allowEmptyOption={false}
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.state && errors.state}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('line')}
                      id="line"
                      name="line"
                      label="Line"
                      required
                      onChange={handleChange}
                      options={commonDropdown.lineDropdown.filter((dd) => dd.part === values.part)}
                      defaultValue=""
                      errorMessage={touched.line && errors.line}
                    />

                    <Dropdown
                      {...getFieldProps('process')}
                      id="process"
                      name="process"
                      label="Process"
                      required
                      onChange={handleChange}
                      options={commonDropdown.processDropdown.filter(
                        (dd) => dd.part === values.part && dd.line === values.line
                      )}
                      defaultValue=""
                      errorMessage={touched.process && errors.process}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="wsCode"
                      fullWidth
                      label="WS Code"
                      {...getFieldProps('wsCode')}
                      error={Boolean(touched.wsCode && errors.wsCode)}
                      helperText={touched.wsCode && errors.wsCode}
                    />
                    <TextField
                      fullWidth
                      name="wsName"
                      label="WS Name"
                      {...getFieldProps('wsName')}
                      error={Boolean(touched.wsName && errors.wsName)}
                      helperText={touched.wsName && errors.wsName}
                    />
                    <Dropdown
                      {...getFieldProps('reflect')}
                      id="reflect"
                      name="reflect"
                      label="Reflect(Y/N)"
                      allowEmptyOption={false}
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.reflect && errors.reflect}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('lossCalculation')}
                      id="lossCalculation"
                      name="lossCalculation"
                      label="Loss Calculation                       "
                      allowEmptyOption={false}
                      onChange={handleChange}
                      groupId="D059000"
                      defaultValue=""
                      errorMessage={touched.lossCalculation && errors.lossCalculation}
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
              {translate(`button.add`)}
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
      <DialogDragable
        title={translate(`typo.confirm`)}
        maxWidth="sm"
        open={isOpenConfirmModal}
        onClose={handleCloseConfirmModal}
      >
        <Typography variant="subtitle1" align="center">
          {translate(`typo.do_you_want_to_register`)}?
        </Typography>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
            {translate(`button.no`)}
          </Button>
          <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
            {translate(`button.yes`)}
          </LoadingButton>
        </DialogActions>
      </DialogDragable>
    </DialogDragable>
  );
});

WorkStationForm.propTypes = {
  onReload: PropTypes.func
};

export default WorkStationForm;
