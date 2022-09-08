import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getFactoryByPk } from '../../utils/formatString';
import { BASE_URL, getProcessTypeByLine } from './helper';

// ----------------------------------------------------------------------

const ProcessForm = forwardRef(({ onReload }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [processTypeCode, setProcessTypeCode] = useState('');
  const [processTypeName, setProcessTypeName] = useState('');
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

  useEffect(() => {
    try {
      if (!isEmpty(processTypeCode) && !isEmpty(processTypeName)) {
        const strCodeLength = processTypeCode.length;
        const strNameLength = processTypeName.length;
        const processCode =
          processTypeCode.substring(strCodeLength - 2, strCodeLength) +
          processTypeName.substring(strNameLength - 2, strNameLength);
        formik.setFieldValue('processCode', processCode);
      } else {
        formik.setFieldValue('processCode', '');
      }
    } catch (error) {
      console.error(error);
    }
  }, [processTypeCode, processTypeName]);


  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const createParams = {
        code: values.processCode.toUpperCase(),
        name: { code: values.processName },
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
        pk: {
          factoryCode: getFactoryByPk(values.line)
        }
      }
      const response = await createUpdateData(`${BASE_URL}/process/create`, 'process', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.process_was_created_successfully`) });
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

  const getProcessType = async (param) => {
    try {
      const response = await getProcessTypeByLine(param)
      if (!isEmpty(response.processType.code)) {
        setProcessTypeCode(response.processType.code);
      } else {
        setProcessTypeCode(null);
      }
    } catch (error) {
      setProcessTypeCode(null);
    }
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
    },
    validationSchema: ProcessSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, touched, handleSubmit, values, isSubmitting, getFieldProps, handleChange, setFieldValue, setSubmitting, setErrors, resetForm } = formik;

  return (
    <DialogDragable title={translate(`typo.add_process`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                      onChange={(e, value) => {
                        getProcessType(value.props?.value);
                        setFieldValue('line', value.props?.value);
                      }}
                      options={commonDropdown.lineDropdown.filter((dd) => dd.part === values.part)}
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
                      onChange={(e, value) => {
                        setProcessTypeName(value.props?.value);
                        setFieldValue('processName', value.props?.value);
                      }}
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
              {translate(`button.add`)}
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
      <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
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
      </DialogAnimate>
    </DialogDragable>
  );
});

ProcessForm.propTypes = {
  onReload: PropTypes.func
};

export default ProcessForm;
