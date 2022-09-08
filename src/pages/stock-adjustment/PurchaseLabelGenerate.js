import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField, Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import useLocales from '../../hooks/useLocales';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';

// ----------------------------------------------------------------------

PurchaseLabelGenerate.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  selectedPlanId: PropTypes.string,
  isOpenGenerateModal: PropTypes.bool,
  balQty: PropTypes.number,
  generateQty: PropTypes.number,
  lotNo: PropTypes.string,
  labelId: PropTypes.string

};

export default function PurchaseLabelGenerate({ onCancel, onLoadData, selectedPlanId, isOpenGenerateModal, balQty, generateQty, lotNo, labelId }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [currentData, setCurrentData] = useState({});
  const [packageQty, setPackageQty] = useState(1);
  const [currentGenerateQty, setCurrentGenerateQty] = useState(balQty);
  const [isValid, setIsValid] = useState(true);
  const [invalidMsg, setInvalidMsg] = useState('');
  const [isValidGenerateQty, setIsValidGenerateQty] = useState(true);
  const [invalidMsgGenerateQty, setInvalidMsgGenerateQty] = useState('');
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate, currentLang } = useLocales();

  useEffect(() => {
    if (!isEmpty(selectedPlanId) && isOpenGenerateModal) {
      query({
        url: `/v1/gr/purchase/${selectedPlanId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          if (data) {
            const materialCode = data?.material?.code;
            setCurrentData({
              factoryPk: data?.factoryPk,
              factoryCode: data?.pk?.factoryCode,
              factoryName: data?.pk?.factoryName,
              grNo: data?.grNo,
              planId: data?.planId,
              purNo: data?.purOrderNo,
              materialCode,
              planDate: moment(data?.planDate).format('YYYY-MM-DD'),
              materialDescription: data?.material?.description,
              materialId: data?.material?.materialId,
              supplier: data?.supplier?.nationalName,
              planQty: data?.planQty,
              remark: data?.remark
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedPlanId]);

  useEffect(() => {
    if (!isValid) {
      setInvalidMsg('Print Qty must be divisible by Package Qty');
    } else {
      setInvalidMsg('');
    }
  }, [isValid]);

  useEffect(() => {
    if (!isValidGenerateQty) {
      setInvalidMsgGenerateQty('Print Qty can not greater than Remain Qty');
    } else {
      setInvalidMsgGenerateQty('');
    }
  }, [isValidGenerateQty]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const handleRegister = () => {
    setSubmitting(true);
    if (generateQty === 0) {
      mutate({
        url: '/v1/box-label/create',
        data: {
          boxLabel: {
            purchasePlan: {
              factoryPk: selectedPlanId
            },
            generateQty: currentGenerateQty,
            packageQty,
            pk: {
              factoryCode: currentData.factoryCode
            },
            state: 'RUNNING'
          }
        },
        method: 'post',
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          resetForm();
          setSubmitting(false);
          onLoadData();
          setIsOpenConfirmModal(false);
          onCancel();
          enqueueSnackbar(translate(`message.label_was_generated_successfully`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
      }).catch((error) => {
        setSubmitting(false);
        setErrors(error);
      });
    } else {
      mutate({
        url: '/v1/box-label/update',
        data: {
          "boxLabel": {
            factoryPk: labelId,
            purchasePlan: {
              factoryPk: selectedPlanId
            },
            generateQty: currentGenerateQty,
            packageQty,
            pk: {
              factoryCode: currentData.factoryCode
            },
            state: 'RUNNING'
          }
        },
        method: 'post',
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          resetForm();
          setSubmitting(false);
          onLoadData();
          setIsOpenConfirmModal(false);
          onCancel();
          enqueueSnackbar(translate(`message.label_was_generated_successfully`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
      }).catch((error) => {
        setSubmitting(false);
        setErrors(error);
      });
    }
  }

  const LablePrintSchema = Yup.object().shape({
    generateQty: Yup.number().integer('Print Qty must be an integer').max(balQty, 'Print Qty can not greater than Remain Qty'),
    isValid: Yup.boolean(),
    packageQty: Yup.number().integer('Print Qty must be an integer')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factoryName: currentData.factoryName || '',
      grNo: currentData.grNo || '',
      planId: currentData.planId || '',
      purNo: currentData.purNo || '',
      materialCode: currentData.materialCode || '',
      planDate: currentData.planDate || '',
      materialDescription: currentData.materialDescription || '',
      materialId: currentData.materialId || '',
      supplier: currentData.supplier || '',
      planQty: currentData.planQty || '',
      remark: currentData.remark || '',
      lotNo,
      balQty,
      isValid,
      generateQty: balQty,
      packageQty: currentData.packageQty || 1
    },
    validationSchema: LablePrintSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (isValid && isValidGenerateQty) {
          setSubmitting(true);
          handleOpenConfirmModal();
        }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, values, isSubmitting, setSubmitting, setErrors, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>{translate(`typo.purchase_G/R_plan_detail`)}</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 2 }}>
                <Stack spacing={3}>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('factoryName')}
                      autoComplete="off"
                      fullWidth
                      id="factoryName"
                      name="factoryName"
                      label="Factory"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('grNo')}
                      autoComplete="off"
                      fullWidth
                      id="grNo"
                      name="grNo"
                      label="G/R No."
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('planId')}
                      autoComplete="off"
                      fullWidth
                      id="planId"
                      name="planId"
                      label="Plan ID"
                      size="small"
                      disabled
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('purNo')}
                      autoComplete="off"
                      fullWidth
                      id="purNo"
                      name="purNo"
                      label="Pur. Order No."
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('materialCode')}
                      autoComplete="off"
                      fullWidth
                      id="materialCode"
                      name="materialCode"
                      label="Material Code"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('planDate')}
                      autoComplete="off"
                      fullWidth
                      id="planDate"
                      name="planDate"
                      label="Plan Date"
                      size="small"
                      disabled
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('materialDescription')}
                      autoComplete="off"
                      fullWidth
                      id="materialDescription"
                      name="materialDescription"
                      label="Material Description"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('materialId')}
                      autoComplete="off"
                      fullWidth
                      id="materialId"
                      name="materialId"
                      label="Material ID"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('supplier')}
                      autoComplete="off"
                      fullWidth
                      id="supplier"
                      name="supplier"
                      label="Supplier"
                      size="small"
                      disabled
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('planQty')}
                      autoComplete="off"
                      fullWidth
                      id="planQty"
                      name="planQty"
                      label="Plan Qty"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('remark')}
                      autoComplete="off"
                      fullWidth
                      id="remark"
                      name="remark"
                      label="Remark"
                      size="small"
                      disabled
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>

          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>{translate(`typo.print_function`)}</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 2 }}>
                <Stack spacing={3}>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('balQty')}
                      autoComplete="off"
                      fullWidth
                      id="balQty"
                      name="balQty"
                      label="Remain Qty"
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('lotNo')}
                      autoComplete="off"
                      fullWidth
                      id="lotNo"
                      name="lotNo"
                      label="Lot No."
                      size="small"
                      disabled
                    />
                    <TextField
                      {...getFieldProps('generateQty')}
                      autoComplete="off"
                      fullWidth
                      type='number'
                      id="generateQty"
                      name="generateQty"
                      label="Print Qty"
                      size="small"
                      value={currentGenerateQty}
                      onChange={(e) => {
                        const _generateQty = e?.target?.value;
                        setFieldValue('generateQty', _generateQty);
                        setCurrentGenerateQty(_generateQty);
                        if (_generateQty > balQty) {
                          setIsValidGenerateQty(false);
                        } else {
                          setIsValidGenerateQty(true);
                        }
                        setIsValid(_generateQty % packageQty === 0);
                      }}
                      error={Boolean(touched.generateQty && errors.generateQty) || !isValidGenerateQty}
                      helperText={touched.generateQty && errors.generateQty || (!isValidGenerateQty && invalidMsgGenerateQty)}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      type='number'
                      id="packageQty"
                      name="packageQty"
                      label="Package Qty"
                      size="small"
                      value={packageQty}
                      onChange={(e) => {
                        const packageQty = e?.target?.value;
                        setFieldValue('packageQty', packageQty);
                        setPackageQty(packageQty);
                        setIsValid(currentGenerateQty % packageQty === 0);
                      }}
                      error={Boolean(touched.packageQty && errors.packageQty) || !isValid}
                      helperText={(touched.packageQty && errors.packageQty) || (!isValid && invalidMsg)}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>

          </Grid>
        </Card>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">
            {translate(`button.generate`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to`)} {translate(`typo.generate_label`)}?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.no`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting} loadingIndicator="Processing...">
              {translate(`button.yes`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
