import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getSafeValue } from '../../utils/formatString';
import { fDateTime } from '../../utils/formatTime';

// ----------------------------------------------------------------------

LabelEvaluatedForm.propTypes = {
  isEdit: PropTypes.bool,
  selectedPicId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  currentLossPicData: PropTypes.object,
  notificationGridData: PropTypes.array,
  grEvaluatedData: PropTypes.object,
  inspectionType: PropTypes.string,
  selectedInspectionResult: PropTypes.string,
  isOpenEvaluate: PropTypes.bool,
  modalEvaluation: PropTypes.string
};

const useStyles = makeStyles((theme) =>
  createStyles({
    inputScanner: {
      '& .MuiFilledInput-root': {
        background: '#ffff00',
        fontSize: '1.5rem'
      },
      '& .MuiFilledInput-input': {
        textAlign: 'center',
        padding: theme.spacing(1)
      }
    }
  })
);

export default function LabelEvaluatedForm({ isOpenEvaluate, onCancel, onLoadData, grEvaluatedData, modalEvaluation }) {
  const { user } = useAuth();
  const { translate } = useLocales();
  const classes = useStyles();
  const { commonDropdown } = useAuth();
  const qcResultDropdown = commonDropdown.commonCodes
    .filter((common) => common.groupId === 'D024000')
    .filter((commonCode) => commonCode.code !== 'D024001')
    .map((qcResult) => ({
      value: qcResult.code,
      label: qcResult.name
    }));

  const [boxLabelScanner, setBoxLabelScanner] = useState('');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [factoryPk, setFactoryPk] = useState(null);
  const [inspectionFactoryPk, setInspectionFactoryPk] = useState(null);
  const [materialPk, setMaterialPk] = useState(null);

  const [isDisabledScan, setIsDisabledScan] = useState(false);

  const [isEvaluate, setIsEvaluate] = useState('');

  const today = new Date();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const MsgPopup = (msg, type) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const onScanBoxLabel = () => {
    if (!values.boxLabel) {
      MsgPopup('Please scan Box Label', 'error');
      return;
    }

    query({
      url: `v1//inspection/check-label?labelNo=${values.boxLabel}`,
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          const { data } = res;

          if (data?.factoryPk === null) {
            setIsEvaluate('Evaluate');
          } else {
            setIsEvaluate('');
            setInspectionFactoryPk(data?.factoryPk);
          }

          const boxLabel = data.label.boxNo;
          setFactoryPk(data?.label.factoryPk);

          setIsDisabledScan(true);
          setFieldData(data);
          setBoxLabelScanner(boxLabel);
          validateForm();
        }
      })
      .catch((error) => {
        MsgPopup(error?.data?.statusMessageDetail, 'error');
        setBoxLabelScanner('');
        console.error(error);
      });
  };

  const setFieldData = (data) => {
    setFieldValue('factory', getSafeValue(data?.label?.pk?.factoryCode));
    setFieldValue('materialCode', getSafeValue(data?.label?.labelDetail?.material?.code));
    setFieldValue('materialDescription', getSafeValue(data?.label?.labelDetail?.material?.description));
    setFieldValue('materialId', getSafeValue(data?.label?.labelDetail?.material?.materialId));
    setFieldValue('type', 'Purchase G/R');
    setFieldValue('orderNo', getSafeValue(data?.label?.labelDetail?.orderNo));
    setFieldValue('grNo', getSafeValue(data?.label?.labelDetail?.goodReceiptPlan?.grNo));
    setFieldValue('labelQty', getSafeValue(data?.label?.qty) || 0);
    setFieldValue('planDate', getSafeValue(data?.label?.labelDetail?.goodReceiptPlan?.planDate));
    setFieldValue('ngQty', getSafeValue(data?.ngQty) || 0);
    setFieldValue('sampleQty', getSafeValue(data?.sampleQty) || 0);
    setFieldValue('qcResult', getSafeValue(data?.qcResult?.code || ''));
    setFieldValue('remark', getSafeValue(data?.remark || ''));
  };

  const onValuateLabel = () => {
    if (isEvaluate === 'Evaluate') {
      mutate({
        url: '/v1/inspection/create',
        featureCode: 'user.create',
        data: {
          inspectionGRLabelResult: {
            inspectionType: 'Label',

            qty: values.labelQty,
            ngQty: values.ngQty,
            sampleQty: values.sampleQty,
            remark: values.remark,
            qcResult: {
              code: values?.ngQty > 0 ? 'D024003' : 'D024002'
            },
            pic: {
              factoryPk: user.id
            },
            label: {
              factoryPk
            }
          }
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            handleCloseConfirmModal();

            MsgPopup(`G/R No - ${values.grNo} was evaluated successfully`, 'success');
            formik.resetForm();

            setIsDisabledScan(false);
            onLoadData();
            setBoxLabelScanner('');
          }
        })
        .catch((error) => {
          console.error(error);
          setErrors(error);
        });
    } else {
      mutate({
        url: '/v1/inspection/update',
        featureCode: 'user.create',
        data: {
          inspectionGRLabelResult: {
            inspectionType: 'Label',
            qty: values.labelQty,
            ngQty: values.ngQty,
            sampleQty: values.sampleQty,
            remark: values.remark,
            qcResult: {
              code: values?.ngQty > 0 ? 'D024003' : 'D024002'
            },
            pic: {
              factoryPk: user.id
            },
            label: {
              factoryPk
            },
            factoryPk: inspectionFactoryPk
          }
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            handleCloseConfirmModal();

            MsgPopup(`G/R No - ${values.grNo} was updated successfully`, 'success');
            formik.resetForm();

            setIsDisabledScan(false);

            onLoadData();
            setBoxLabelScanner('');
          }
        })
        .catch((error) => {
          console.error(error);
          setErrors(error);
        });
    }
  };
  const LabelEvaluatedSchema = Yup.object().shape({
    boxLabel: Yup.string().trim().required('Box Label is required'),
    factory: Yup.string(),
    materialCode: Yup.string(),
    type: Yup.string(),
    orderNo: Yup.string(),
    materialDescription: Yup.string(),
    materialId: Yup.string(),
    grNo: Yup.string(),
    processType: Yup.string(),
    lineCode: Yup.string(),
    planDate: Yup.string(),
    labelQty: Yup.number(),
    ngQty: Yup.number()
      .required('NG Quantity is required')
      .test('Is Valid ?', 'NG quantity must be equal to or greater than 0', (value) => value >= 0),
    sampleQty: Yup.number()
      .required('NG Sample is required')
      .test(
        'Is Valid ?',
        'Sample quantity must be greater than NG quantity and less than or equal to label quantity',
        (value) => value > 0 && value >= values.ngQty && value <= values.labelQty
      ),
    qcResult: Yup.string(),
    remark: Yup.string().when('ngQty', (ngQty) => {
      if (ngQty > 0) {
        return Yup.string().required('Remark is required');
      }
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      boxLabel: '',
      factory: '',
      materialCode: '',
      type: '',
      orderNo: '',
      materialDescription: '',
      materialId: '',
      grNo: '',
      processType: '',
      lineCode: '',
      planDate: '',
      labelQty: '',
      ngQty: '',
      sampleQty: '',
      qcResult: '',
      remark: ''
    },
    validationSchema: LabelEvaluatedSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        validateForm();
        setSubmitting(true);
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    validateForm,
    setSubmitting,
    setErrors
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.purchase_G/R_plan_detail`)}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5} sx={{ mt: 2, mb: 6 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} justifyContent="center">
                    <TextField
                      autoFocus
                      sx={{ width: '35%' }}
                      variant="filled"
                      className={classes.inputScanner}
                      onChange={(e) => setBoxLabelScanner(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          onScanBoxLabel();
                        }
                      }}
                      {...getFieldProps('boxLabel')}
                      disabled={isDisabledScan}
                      placeholder="Focus here to scan"
                      required
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(touched.boxLabel && errors.boxLabel)}
                      helperText={touched.boxLabel && errors.boxLabel}
                    />
                  </Stack>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      size="small"
                      options={commonDropdown.factoryDropdown}
                      disabled
                      errorMessage={touched.factory && errors.factory}
                    />
                    <TextField
                      {...getFieldProps('materialCode')}
                      error={Boolean(touched.materialCode && errors.materialCode)}
                      helperText={touched.materialCode && errors.materialCode}
                      label="Material Code"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                    />
                    <TextField
                      {...getFieldProps('type')}
                      error={Boolean(touched.type && errors.type)}
                      helperText={touched.type && errors.type}
                      label="Type"
                      variant="outlined"
                      fullWidth
                      disabled
                      size="small"
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Order No"
                      size="small"
                      disabled
                      {...getFieldProps('orderNo')}
                      error={Boolean(touched.orderNo && errors.orderNo)}
                      helperText={touched.orderNo && errors.orderNo}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Description"
                      size="small"
                      disabled
                      {...getFieldProps('materialDescription')}
                      error={Boolean(touched.materialDescription && errors.materialDescription)}
                      helperText={touched.materialDescription && errors.materialDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material ID"
                      size="small"
                      disabled
                      {...getFieldProps('materialId')}
                      error={Boolean(touched.materialId && errors.materialId)}
                      helperText={touched.materialId && errors.materialId}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('grNo')}
                      label="G/R No"
                      size="small"
                      disabled
                      fullWidth
                      errorMessage={touched.giType && errors.giType}
                    />
                    <TextField
                      {...getFieldProps('processType')}
                      label="Process Type"
                      size="small"
                      fullWidth
                      disabled
                      errorMessage={touched.giType && errors.giType}
                    />
                    <TextField
                      {...getFieldProps('lineCode')}
                      label="Line Code"
                      size="small"
                      fullWidth
                      disabled
                      errorMessage={touched.giType && errors.giType}
                    />
                    <TextField
                      {...getFieldProps('planDate')}
                      name="planDate"
                      label="Plan Date"
                      disabled
                      fullWidth
                      size="small"
                      errorMessage={touched.planDate && errors.planDate}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('labelQty')}
                      label="Label Qty"
                      size="small"
                      fullWidth
                      errorMessage={touched.labelQty && errors.labelQty}
                      disabled
                    />
                    <TextField
                      label="NG Qty"
                      size="small"
                      fullWidth
                      required
                      onChange={handleChange}
                      {...getFieldProps('ngQty')}
                      error={Boolean(touched.ngQty && errors.ngQty)}
                      helperText={touched.ngQty && errors.ngQty}
                    />
                    <TextField
                      label="Sample Qty"
                      autoComplete="off"
                      size="small"
                      fullWidth
                      required
                      onChange={handleChange}
                      {...getFieldProps('sampleQty')}
                      error={Boolean(touched.sampleQty && errors.sampleQty)}
                      helperText={touched.sampleQty && errors.sampleQty}
                    />
                    <Dropdown
                      label="QC Result"
                      size="small"
                      disabled
                      onChange={handleChange}
                      {...getFieldProps('qcResult')}
                      options={qcResultDropdown}
                      value={+values.ngQty === 0 ? 'D024002' : 'D024003'}
                    />
                  </Stack>
                  <Stack>
                    <TextField
                      id="remark"
                      name="remark"
                      label="Remark"
                      size="small"
                      fullWidth
                      {...getFieldProps('remark')}
                      onChange={handleChange}
                      error={Boolean(touched.remark && errors.remark)}
                      helperText={touched.remark && errors.remark}
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
          <Button type="submit" variant="contained" size="small" loading={isSubmitting}>
            {translate(`button.confirm`)}
          </Button>
        </DialogActions>
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">
            {isEvaluate === 'Evaluate'
              ? translate(`typo.do_you_want_to_confirm`)
              : translate(`typo.this_label_is_already_scanned_do_you_want_to_update_result`)}
          </Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <Button type="button" variant="contained" onClick={onValuateLabel}>
              {translate(`button.confirm`)}
            </Button>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider>
  );
}
