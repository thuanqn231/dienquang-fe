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

const ProcessFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [process, setProcess] = useState({
    processCode: '',
    processName: '',
    state: 'RUNNING',
    rank: 1,
    part: '',
    line: '',
    finalYn: 'N',
    inputYn: 'N',
    prodPlan: 'N',
    barcodeYn: 'Y',
    tackTimeYn: 'Y'
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
      const data = await loadSelectedData(`${BASE_URL}/process`, FACTORYID);
      if (data) {
        setProcess((preValue) => ({
          ...preValue,
          processCode: data.code,
          processName: data.name.code,
          state: data.state,
          rank: data.rank,
          finalYn: data.finalYn,
          inputYn: data.inputYn,
          prodPlan: data.prodPlan,
          barcodeYn: data.barcodeYn,
          tackTimeYn: data.tackTimeYn,
          part: data.line.part.factoryPk,
          line: data.line.factoryPk
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setProcess(null);
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
        code: values.processCode,
        name: {
          code: values.processName
        },
        state: values.state,
        rank: values.rank,
        finalYn: values.finalYn,
        inputYn: values.inputYn,
        prodPlan: values.prodPlan,
        barcodeYn: values.barcodeYn,
        tackTimeYn: values.tackTimeYn,
        line: {
          factoryPk: values.line
        },
        factoryPk: FACTORYID
      }
      const response = await createUpdateData(`${BASE_URL}/process/update`, 'process', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.process_was_updated_successfully`) });
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
    return process[name].toString();
  };

  const ProcessSchema = Yup.object().shape({
    processCode: Yup.string().required('Process Code is required'),
    processName: Yup.string().required('Process Name is required'),
    line: Yup.string().required('Line is required'),
    part: Yup.string().required('Part is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      processCode: process.processCode,
      processName: process.processName,
      state: process.state,
      rank: process.rank,
      part: process.part,
      line: process.line,
      finalYn: process.finalYn,
      inputYn: process.inputYn,
      prodPlan: process.prodPlan,
      barcodeYn: process.barcodeYn,
      tackTimeYn: process.tackTimeYn
    },
    validationSchema: ProcessSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_process`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                      disabled
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('line')}
                      id="line"
                      name="line"
                      label="Line"
                      disabled
                      required
                      onChange={handleChange}
                      options={commonDropdown.lineDropdown.filter(
                        (dd) => dd.part === filterDropDownList(values, 'part')
                      )}
                      defaultValue=""
                      errorMessage={touched.line && errors.line}
                    />
                    <Dropdown
                      {...getFieldProps('finalYn')}
                      id="finalYn"
                      name="finalYn"
                      label="Final(Y/N)"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.finalYn && errors.finalYn}
                    />
                    <Dropdown
                      {...getFieldProps('inputYn')}
                      id="inputYn"
                      name="inputYn"
                      label="Input(Y/N)"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.inputYn && errors.inputYn}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="processCode"
                      fullWidth
                      disabled
                      label="Process Code"
                      {...getFieldProps('processCode')}
                      error={Boolean(touched.processCode && errors.processCode)}
                      helperText={touched.processCode && errors.processCode}
                    />
                    <Dropdown
                      {...getFieldProps('processName')}
                      id="processName"
                      name="processName"
                      label="Process Name"
                      required
                      disabled
                      groupId="D016000"
                      defaultValue=""
                      errorMessage={touched.processName && errors.processName}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('prodPlan')}
                      id="prodPlan"
                      name="prodPlan"
                      label="Prod Plan"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.prodPlan && errors.prodPlan}
                    />
                    <Dropdown
                      {...getFieldProps('barcodeYn')}
                      id="barcodeYn"
                      name="barcodeYn"
                      label="Barcode(Y/N)"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.barcodeYn && errors.barcodeYn}
                    />
                    <Dropdown
                      {...getFieldProps('tackTimeYn')}
                      id="tackTimeYn"
                      name="tackTimeYn"
                      label="T/Time(Y/N)"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'Y', label: 'Y' },
                        { value: 'N', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.tackTimeYn && errors.tackTimeYn}
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
          {translate(`typo.do_you_want_to_modify`)}?
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

ProcessFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default ProcessFormModify;
