import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

FactorySampleRulesRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function FactorySampleRulesRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const onProcessSuccess = () => {
    resetForm();
    setSubmitting(false);
    onLoadData();
    setIsOpenConfirmModal(false);
    onCancel();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const handleRegister = async () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        const createParams = {
          productGroup: {
            code: values?.productGroup || null
          },
          inspectionType: {
            code: values?.inspectionType || null
          },
          qualityControlSize: {
            code: values?.qualityControlSize || null
          },
          lotQtyMin: values?.lotQtyMin || 0,
          lotQtyMax: values?.lotQtyMax || 0,
          sampleQty: values?.sampleQty || 0,
          state: values?.state || 'RUNNING',
          pk: {
            factoryCode: values?.factory
          }
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'factorySampleRule', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_factory_sample_rule_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          lotQtyMin: values?.lotQtyMin || 0,
          lotQtyMax: values?.lotQtyMax || 0,
          sampleQty: values?.sampleQty || 0,
          state: values?.state || 'RUNNING',
          factoryPk: currentData.factoryPk
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'factorySampleRule', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_factory_sample_rule_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
  }

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  }

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
  }

  const FactorySampleRulesSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    productGroup: Yup.string().required('Product Group is required'),
    inspectionType: Yup.string().required('Inspection Type is required'),
    qualityControlSize: Yup.string().required('Quality Control Size is required'),
    lotQtyMin: Yup.number().required('Lot. Qty Min is required').test('greaterThanZero', 'Lot. Qty Min must be greater than 0', value => value ? value > 0 : ''),
    // .max(values.lotQtyMax, 'Lot. Qty Min must be less than Lot. Qty Max'),
    lotQtyMax: Yup.number().required('Lot. Qty Max is required').test('greaterThanZero', 'Lot. Qty Max must be greater than 0', value => value ? value > 0 : ''),
    // .min(values.lotQtyMin, 'Lot. Qty Max must be greater than Lot. Qty Min'),
    sampleQty: Yup.number().required('Sample Qty is required').test('greaterThanZero', 'Sample Qty must be greater than 0', value => value ? value > 0 : ''),
    state: Yup.string().required('Use (Y/N) is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      productGroup: isEdit && currentData?.productGroup || '',
      inspectionType: isEdit && currentData?.inspectionType || '',
      qualityControlSize: isEdit && currentData?.qualityControlSize || '',
      lotQtyMin: isEdit && currentData?.lotQtyMin || '',
      lotQtyMax: isEdit && currentData?.lotQtyMax || '',
      sampleQty: isEdit && currentData?.sampleQty || '',
      state: isEdit && currentData?.state || 'RUNNING',
    },
    validationSchema: FactorySampleRulesSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, resetForm, setFieldValue, setSubmitting, setErrors } = formik;

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
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    required
                    disabled={isEdit}
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
                  <Dropdown
                    {...getFieldProps('productGroup')}
                    label='Product Group'
                    required
                    disabled={isEdit}
                    onChange={handleChange}
                    groupId='D015000'
                    errorMessage={touched.productGroup && errors.productGroup}
                  />
                  <Dropdown
                    {...getFieldProps('inspectionType')}
                    label='Inspection Type'
                    required
                    disabled={isEdit}
                    onChange={handleChange}
                    groupId='D065000'
                    errorMessage={touched.inspectionType && errors.inspectionType}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('qualityControlSize')}
                    label='Quality Control Size'
                    required
                    disabled={isEdit}
                    onChange={handleChange}
                    groupId='D064000'
                    errorMessage={touched.qualityControlSize && errors.qualityControlSize}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Sample Qty"
                    required
                    type='number'
                    {...getFieldProps('sampleQty')}
                    error={Boolean(touched.sampleQty && errors.sampleQty)}
                    helperText={touched.sampleQty && errors.sampleQty}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Lot. Qty Min"
                    required
                    type='number'
                    {...getFieldProps('lotQtyMin')}
                    error={Boolean(touched.lotQtyMin && errors.lotQtyMin)}
                    helperText={touched.lotQtyMin && errors.lotQtyMin}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Lot. Qty Max"
                    required
                    type='number'
                    {...getFieldProps('lotQtyMax')}
                    error={Boolean(touched.lotQtyMax && errors.lotQtyMax)}
                    helperText={touched.lotQtyMax && errors.lotQtyMax}
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>

        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{isEdit ? translate(`button.modify`) : translate(`button.register`)}</LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?`}</Typography>
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
    </FormikProvider >
  );
}
