import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography, Autocomplete } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

StockRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function StockRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [personInCharge, setPersonInCharge] = useState({
    value: '',
    label: ''
  });
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    if (isEdit) {
      const currentUser = commonDropdown.userDropdown.filter((user) => user.value === currentData?.personInCharge);
      setPersonInCharge({
        value: currentUser[0]?.value || '',
        label: currentUser[0]?.label || ''
      });
    }
  }, [currentData]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/stock-management/stock/create',
          data: {
            stock: {
              code: valuesForm?.stockCode.toUpperCase() || null,
              name: valuesForm?.stockName || null,
              agingDay: valuesForm?.agingDay || null,
              overAgingDay: valuesForm?.overAgingDay || null,
              stockType: {
                code: valuesForm?.stockType || null
              },
              warehouseType: {
                code: valuesForm?.warehouseType || null
              },
              personInCharge: valuesForm?.personInCharge || null,
              remark: valuesForm?.remark || null,
              state: valuesForm?.state || 'RUNNING',
              pk: {
                factoryCode: valuesForm?.factory || null
              }
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              updateCommonDropdown();
              enqueueSnackbar('Storage was registered successfully', {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          })
          .catch((error) => {
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else {
      try {
        mutate({
          url: '/v1/stock-management/stock/update',
          data: {
            stock: {
              factoryPk: currentData.factoryPk,
              code: valuesForm?.stockCode.toUpperCase() || null,
              name: valuesForm?.stockName || null,
              agingDay: valuesForm?.agingDay || null,
              overAgingDay: valuesForm?.overAgingDay || null,
              stockType: {
                code: valuesForm?.stockType || null
              },
              warehouseType: {
                code: valuesForm?.warehouseType || null
              },
              personInCharge: valuesForm?.personInCharge || null,
              remark: valuesForm?.remark || null,
              state: valuesForm?.state || 'RUNNING'
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              updateCommonDropdown();
              enqueueSnackbar(translate(`message.update_stock_successful`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          })
          .catch((error) => {
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  };
  const UOMSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    warehouseType: Yup.string().required('Warehouse Type is required'),
    stockType: Yup.string().required('Storage Type is required'),
    stockCode: Yup.string().required('Storage Code is required').length(4, 'Storage Code must be 4 characters'),
    stockName: Yup.string().required('Storage Name is required'),
    personInCharge: Yup.string().required('Person In Charge is required'),
    agingDay: Yup.number(),
    overAgingDay: Yup.number(),
    remark: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      warehouseType: (isEdit && currentData?.warehouseType) || '',
      stockType: (isEdit && currentData?.stockType) || '',
      stockCode: (isEdit && currentData?.stockCode) || '',
      stockName: (isEdit && currentData?.stockName) || '',
      personInCharge: (isEdit && currentData?.personInCharge) || '',
      agingDay: (isEdit && currentData?.agingDay) || '',
      overAgingDay: (isEdit && currentData?.overAgingDay) || '',
      remark: (isEdit && currentData?.remark) || ''
    },
    validationSchema: UOMSchema,
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

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setPersonInCharge({
        value: '',
        label: ''
      });
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } =
    formik;
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
                    label="Factory"
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('warehouseType')}
                    id="warehouseType"
                    name="warehouseType"
                    label="Warehouse Type"
                    required
                    onChange={handleChange}
                    groupId="D058000"
                    defaultValue=""
                    errorMessage={touched.warehouseType && errors.warehouseType}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Storage Code"
                    required
                    disabled={isEdit}
                    {...getFieldProps('stockCode')}
                    error={Boolean(touched.stockCode && errors.stockCode)}
                    helperText={touched.stockCode && errors.stockCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Storage Name"
                    required
                    {...getFieldProps('stockName')}
                    error={Boolean(touched.stockName && errors.stockName)}
                    helperText={touched.stockName && errors.stockName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('stockType')}
                    id="stockType"
                    name="stockType"
                    label="Material Type"
                    required
                    onChange={handleChange}
                    groupId="D003000"
                    defaultValue=""
                    errorMessage={touched.stockType && errors.stockType}
                  />

                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    required
                    allowEmptyOption={false}
                    onChange={handleChange}
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    defaultValue="RUNNING"
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Autocomplete
                    id="personInCharge"
                    className="personInCharge-select"
                    name="personInCharge"
                    fullWidth
                    options={commonDropdown.userDropdown}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    value={personInCharge}
                    onChange={(e, value) => {
                      setPersonInCharge(value);
                      setFieldValue('personInCharge', value?.value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.personInCharge && errors.personInCharge)}
                        helperText={touched.personInCharge && errors.personInCharge}
                        name="personInCharge"
                        label="Person In Charge"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Aging Day"
                    type="number"
                    {...getFieldProps('agingDay')}
                    error={Boolean(touched.agingDay && errors.agingDay)}
                    helperText={touched.agingDay && errors.agingDay}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Critical Aging Day"
                    type="number"
                    {...getFieldProps('overAgingDay')}
                    error={Boolean(touched.overAgingDay && errors.overAgingDay)}
                    helperText={touched.overAgingDay && errors.overAgingDay}
                  />
                </Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Remark"
                  {...getFieldProps('remark')}
                  error={Boolean(touched.remark && errors.remark)}
                  helperText={touched.remark && errors.remark}
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
            isEdit ? translate(`typo.modify`) : translate(`typo.register`)
          }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
