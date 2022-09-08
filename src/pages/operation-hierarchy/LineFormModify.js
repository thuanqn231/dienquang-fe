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
import { isNullPk } from '../../utils/formatString';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const LineFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [line, setLine] = useState({
    lineCode: '',
    lineName: '',
    state: 'Y',
    rank: '',
    part: '',
    processType: '',
    productGroup: '',
    description: ''
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
      const data = await loadSelectedData(`${BASE_URL}/line`, FACTORYID);
      if(data) {
        setLine((preValue) => ({
          ...preValue,
          lineCode: data?.code,
          lineName: data?.name,
          state: data?.state,
          rank: data?.rank,
          description: data?.description,
          part: data?.part?.factoryPk,
          processType: data?.processType?.code,
          productGroup: data?.productGroup?.code,
          stock: data?.stock?.factoryPk,
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setLine(null);
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
        code: values.lineCode,
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
        factoryPk: FACTORYID
      };
      if (!isNullPk(values?.stock)) {
        updateParams.stock = {
          factoryPk: values?.stock
        };
      }
      const response = await createUpdateData(`${BASE_URL}/line/update`, 'line', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.line_was_updated_successfully`) });
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
    lineCode: Yup.string().required('Team Code is required'),
    lineName: Yup.string().required('Team Name is required'),
    part: Yup.string().required('Part is required'),
    processType: Yup.string().required('Process Type is required'),
    productGroup: Yup.string().required('Product Group is required'),
    stock: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lineCode: line.lineCode,
      lineName: line.lineName,
      state: line.state,
      rank: line.rank,
      part: line.part,
      description: line.description,
      processType: line.processType,
      productGroup: line.productGroup,
      stock: line.stock
    },
    validationSchema: LineSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_line`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                    <TextField
                      name="lineCode"
                      fullWidth
                      disabled
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

LineFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default LineFormModify;
