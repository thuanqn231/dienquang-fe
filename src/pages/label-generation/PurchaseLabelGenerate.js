import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField, Typography, Checkbox
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import { Form, FormikProvider, useFormik, FieldArray } from 'formik';
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
  sortedQty: PropTypes.number,
  lotNo: PropTypes.string,
  labelId: PropTypes.string

};
const useStyles = makeStyles(theme => ({
  inputRoot: {
    "& .Mui-disabled": {
      "-webkit-text-fill-color": "red"
    }
  },

}));

export default function PurchaseLabelGenerate({ onCancel, onLoadData, selectedPlanId, isOpenGenerateModal, balQty, generateQty, sortedQty = 0, lotNo, labelId }) {
  const allowedPrintQty = balQty;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [currentData, setCurrentData] = useState({});
  const [packageQty, setPackageQty] = useState(1);
  const [quickPrintPackageQty, setQuickPrintPackageQty] = useState(0);
  const [currentGenerateQty, setCurrentGenerateQty] = useState(allowedPrintQty);
  const [isValid, setIsValid] = useState(true);
  const [invalidMsg, setInvalidMsg] = useState('');
  const [isValidGenerateQty, setIsValidGenerateQty] = useState(true);
  const [invalidMsgGenerateQty, setInvalidMsgGenerateQty] = useState('');
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate, currentLang } = useLocales();
  const [quickPrint, setQuickPrint] = useState(false);
  const classes = useStyles();

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
        url: '/v1/box-label-detail/create',
        data: {
          boxLabelDetails: [
            {
              factoryPk: labelId,
              goodReceiptPlan: {
                factoryPk: selectedPlanId
              },
              generateQty: currentGenerateQty,
              packageQty,
              pk: {
                factoryCode: currentData.factoryCode
              },
              state: 'RUNNING',
              type: 'PURCHASE'
            }
          ]
        },
        timeout: 12000,
        method: 'post',
        featureCode: 'user.create'
      })
        .then((res) => {
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
        })
        .catch((error) => {
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
    generateQty: Yup.number().integer('Print Qty must be an integer').max(allowedPrintQty, 'Print Qty can not greater than Remain Qty'),
    isValid: Yup.boolean(),
    packageQty: Yup.number().integer('Print Qty must be an integer'),
    quickPrintPackageQty: Yup.number().integer('Print Qty must be an integer')
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
      packageQty: currentData.packageQty || 1,
      printableQty: balQty,
      quickPrintPackageQty: 0,
      labels: []
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
  function onCreateLabel() {
    const balQty = Number(values.balQty);
    const packQuick = Number(quickPrintPackageQty);
    let mod = 0
    let label = 0;
    if (balQty % packQuick === 0) {
      label = balQty / packQuick;
    } else {
      label = Math.floor(balQty / packQuick);
      mod = balQty % packQuick;
    }
    const labels = Array(packQuick).fill(label);

    const labelList = labels.map(() => ({
      cur: label,
      true: label,
    }));
    if (mod !== 0) labelList.push({ cur: mod, true: mod });
    setFieldValue('labels', labelList)
    setFieldValue('printableQty', 0);
  }
  function updatePrintable(dif) {
    const newPrintableQty = Number(values.printableQty) + dif;
    setFieldValue('printableQty', newPrintableQty);
    return !(newPrintableQty < 0)
  }
  function onQuickPrint() {
    const labels = values.labels.map(label => label.cur)
    if (values.printableQty < 0) {
      enqueueSnackbar(`Printing qty is more than remain qty, can not print`, {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      const boxLabelPackages = labels.map((label) => ({ generateQty: label, packageQty: 1 }));
      mutate({
        url: '/v1/box-label-detail/create',
        data: {
          boxLabelDetails: [
            {
              factoryPk: labelId,
              goodReceiptPlan: {
                factoryPk: selectedPlanId
              },
              pk: {
                factoryCode: currentData.factoryCode
              },
              type: 'PURCHASE_QUICK_PRINT',
              "boxLabelPackages": boxLabelPackages
            }
          ]
        },
        method: 'post',
        featureCode: 'user.create'
      }).then((res) => {
        if (res.statusCode === 'success') {
          enqueueSnackbar(`success`, {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          resetForm();
          setSubmitting(false);
          onLoadData();
          onCancel();
        }
      });
    }
  }
  function onClear() {
    setFieldValue('labels', []);
    setFieldValue('quickPrintPackageQty', 0);
    setFieldValue('printableQty', balQty);
    setQuickPrintPackageQty(0)
  }

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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} display='flex' justifyContent='space-between'>
                    <Stack direction="row" alignItems="center" justifyContent="right" sx={{ my: 0 }}>
                      <Checkbox checked={quickPrint} onChange={() => setQuickPrint(!quickPrint)} />
                      <Typography variant="subtitle1">Quick Print</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="right" sx={{ my: 0 }} spacing={{ xs: 3, sm: 2 }}>
                      <Button type="button" variant="outlined" color="inherit" onClick={onCancel} disabled={quickPrint}>
                        {translate(`button.cancel`)}
                      </Button>
                      <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." disabled={quickPrint}>{translate(`button.generate`)}</LoadingButton>
                    </Stack>
                  </Stack>

                  {/* quick print */}
                </Stack>
              </Card>
            </Grid>

          </Grid>
        </Card>
        {/* quick print function */}
        {quickPrint && <Card >
          <Typography variant="subtitle1" sx={{ pl: 1 }}>Quick Print</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 2 }}>
                <Stack spacing={3}>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('printableQty')}
                      autoComplete="off"
                      fullWidth
                      id="printableQty"
                      name="printableQty"
                      label="Printable Qty"
                      size="small"
                      InputProps={values.printableQty < 0 && {
                        classes: {
                          root: classes.inputRoot
                        }
                      }}
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
                      autoComplete="off"
                      fullWidth
                      type='number'
                      id="quickPrintPackageQty"
                      name="quickPrintPackageQty"
                      label="Package Qty"
                      size="small"
                      value={quickPrintPackageQty}
                      onChange={(e) => {
                        const packageQty = e?.target?.value;
                        setFieldValue('quickPrintPackageQty', packageQty);
                        setQuickPrintPackageQty(packageQty);
                        // setIsValid(currentGenerateQty % packageQty === 0);
                      }}
                      InputProps={{
                        className: classes.red_text
                      }}
                      error={Boolean(touched.quickPrintPackageQty && errors.quickPrintPackageQty)}
                      helperText={(touched.quickPrintPackageQty && errors.quickPrintPackageQty)}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Button type="button" variant="outlined" color="inherit" onClick={() => onClear()}>
                        {translate(`button.clear`)}
                      </Button>
                      <LoadingButton variant="contained" loading={isSubmitting} onClick={() => onCreateLabel()} loadingIndicator="Processing...">
                        {translate(`button.create`)}
                      </LoadingButton>
                    </Stack>


                  </Stack>

                  <Stack sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', }} >
                    <FieldArray name='inputFields'>
                      <>
                        {values.labels.map((label, index) => (
                          <TextField
                            sx={{ m: 2 }}
                            autoComplete="off"

                            type='number'
                            id={`label ${index}`}
                            name={`label ${index}`}
                            label={`label ${index + 1}`}
                            size="small"
                            value={values.labels[index].cur}
                            onChange={(e) => {
                              const dif = values.labels[index].cur - Number(e?.target?.value);
                              const valid = updatePrintable(dif)
                              setFieldValue(`labels[${index}].cur`, Number(e.target.value));
                              if (valid) setFieldValue(`labels[${index}].true`, Number(e.target.value));
                            }}
                          />
                        ))}

                      </>

                    </FieldArray>

                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} justifyContent="right">
                    <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
                      {translate(`button.cancel`)}
                    </Button>
                    <LoadingButton variant="contained" loading={isSubmitting} onClick={() => onQuickPrint()} loadingIndicator="Processing...">
                      {translate(`button.print`)}
                    </LoadingButton>
                  </Stack>

                </Stack>
              </Card>
            </Grid>

          </Grid>
        </Card>}
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />

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
