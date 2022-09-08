import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getFactoryByPk, isNullPk } from '../../utils/formatString';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const LineForm = forwardRef(({ onReload }, ref) => {
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
    setSubmitting(true);
    try {
      const createParams = {
        code: values.lineCode.toUpperCase(),
        name: values.lineName,
        state: values.state,
        rank: values.rank,
        description: values.description,
        part: {
          factoryPk: values.part
        },
        processType: {
          code: values.processType
        },
        productGroup: {
          code: values.productGroup
        },
        pk: {
          factoryCode: getFactoryByPk(values.part)
        }
      };
      if (!isNullPk(values?.stock)) {
        createParams.stock = {
          factoryPk: values?.stock
        };
      }
      const response = await createUpdateData(`${BASE_URL}/line/create`, 'line', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.line_was_created_successfully`) });
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

  const LineSchema = Yup.object().shape({
    lineCode: Yup.string()
      .required('Line Code is required')
      .test('Is Valid', 'Please fill in only 4 characters', (value) => {
        if (value) {
          return value.length === 4;
        }
        return Yup.string();
      }),
    lineName: Yup.string().required('Line Name is required'),
    part: Yup.string().required('Part is required'),
    processType: Yup.string().required('Process Type is required'),
    productGroup: Yup.string().required('Product Group is required'),
    stock: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lineCode: '',
      lineName: '',
      state: 'RUNNING',
      rank: 1,
      part: '',
      processType: '',
      productGroup: '',
      description: '',
      stock: ''
    },
    validationSchema: LineSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });
  
  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values, setFieldValue } = formik;

  return (
    <DialogDragable title={translate(`typo.add_line`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                    <TextField
                      name="lineCode"
                      fullWidth
                      label="Line Code*"
                      {...getFieldProps('lineCode')}
                      error={Boolean(touched.lineCode && errors.lineCode)}
                      helperText={touched.lineCode && errors.lineCode}
                    />
                    <TextField
                      fullWidth
                      name="lineName"
                      label="Line Name*"
                      {...getFieldProps('lineName')}
                      error={Boolean(touched.lineName && errors.lineName)}
                      helperText={touched.lineName && errors.lineName}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('processType')}
                      id="processType"
                      name="processType"
                      label="Process Type"
                      required
                      onChange={handleChange}
                      groupId="D014000"
                      defaultValue=""
                      errorMessage={touched.processType && errors.processType}
                    />
                    <Dropdown
                      {...getFieldProps('productGroup')}
                      id="productGroup"
                      name="productGroup"
                      label="Product Group"
                      required
                      onChange={handleChange}
                      groupId="D015000"
                      defaultValue=""
                      errorMessage={touched.productGroup && errors.productGroup}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('stock')}
                      id="stock"
                      name="stock"
                      label="WIP Storage"
                      onChange={handleChange}
                      options={commonDropdown.stockDropdown}
                      errorMessage={touched.stock && errors.stock}
                    />
                    <TextField
                      name="description"
                      fullWidth
                      label="Line Info"
                      {...getFieldProps('description')}
                      error={Boolean(touched.description && errors.description)}
                      helperText={touched.description && errors.description}
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
      <DialogAnimate
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
      </DialogAnimate>
    </DialogDragable>
  );
});

LineForm.propTypes = {
  onReload: PropTypes.func
};

export default LineForm;
