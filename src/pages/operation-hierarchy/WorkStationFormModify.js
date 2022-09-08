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

const WorkStationFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [workstation, setWorkStation] = useState({
    wsCode: '',
    wsName: '',
    state: 'RUNNING',
    rank: 1,
    line: '',
    process: '',
    part: '',
    reflect: ''
  });

  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    try {
      const data = await loadSelectedData(`${BASE_URL}/workstation`, FACTORYID);
      if (data) {
        setWorkStation((preValue) => ({
          ...preValue,
          wsCode: data.code,
          wsName: data.name,
          state: data.state,
          rank: data.rank,
          reflect: data.reflect,
          line: data.process.line.factoryPk,
          process: data.process.factoryPk,
          part: data.process.line.part.factoryPk,
          lossCalculation: data.lossCalculation.code
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setWorkStation(null);
      console.error(error);
    }
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const updateParams = {
        id: FACTORYID,
        code: values.wsCode,
        name: values.wsName,
        state: values.state,
        rank: values.rank,
        process: {
          factoryPk: values.process
        },
        factoryPk: FACTORYID,
        reflect: values.reflect,
        lossCalculation: {
          code: values?.lossCalculation || null
        }
      }
      const response = await createUpdateData(`${BASE_URL}/workstation/update`, 'workstation', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.workstation_was_updated_successfully`) });
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

  const filterDropDownList = (values, name) => {
    if (values[name] !== '') {
      return values[name].toString();
    }
    return workstation[name].toString();
  };

  const WsSchema = Yup.object().shape({
    wsCode: Yup.string().required('Work Station Code is required'),
    wsName: Yup.string().required('Work Station Name is required'),
    part: Yup.string().required('Part is required'),
    line: Yup.string().required('Line is required'),
    process: Yup.string().required('Process is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      wsCode: workstation.wsCode,
      wsName: workstation.wsName,
      state: workstation.state,
      rank: workstation.rank,
      line: workstation.line,
      process: workstation.process,
      part: workstation.part,
      reflect: workstation.reflect,
      lossCalculation: workstation.lossCalculation
    },
    validationSchema: WsSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable
      title={translate(`typo.modify_work_station`)}
      maxWidth="lg"
      open={isOpenDialog}
      onClose={closeDialog}
    >
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
                      disabled
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
                      // disabled
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
                      disabled
                      onChange={handleChange}
                      options={commonDropdown.lineDropdown.filter(
                        (dd) => dd.part === filterDropDownList(values, 'part')
                      )}
                      defaultValue=""
                      errorMessage={touched.line && errors.line}
                    />

                    <Dropdown
                      {...getFieldProps('process')}
                      id="process"
                      name="process"
                      label="Process"
                      required
                      disabled
                      onChange={handleChange}
                      options={commonDropdown.processDropdown.filter(
                        (dd) =>
                          dd.part === filterDropDownList(values, 'part') &&
                          dd.line === filterDropDownList(values, 'line')
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
                      disabled
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
              {translate(`button.modify`)}
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
      <DialogAnimate
        title={translate(`typo.confirm`)}
        maxWidth="sm"
        open={isOpenConfirmModal}
        onClose={handleCloseConfirmModal}
      >
        <Typography variant="subtitle1" align="center">
          {translate(`typo.are_you_sure_to_delete`)}
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

WorkStationFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default WorkStationFormModify;
