import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from "react-to-print";
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import { mutate } from '../../core/api';
import { Dropdown, DthRadioButton } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// redux 
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk } from '../../utils/formatString';
import LabelToPrint from './LabelToPrint';

// ----------------------------------------------------------------------

LabelPrint.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  labelToPrint: PropTypes.array,
  widgetName: PropTypes.string,
  isReprint: PropTypes.bool
};

export default function LabelPrint({ onCancel, onLoadData, labelToPrint, widgetName, isReprint }) {
  const dispatch = useDispatch();
  const { commonDropdown } = useAuth();
  const { commonCodes } = commonDropdown;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { translate, currentLang } = useLocales();

  let remarkReprint = '';
  let reasonReprint = '';

  const componentRef = useRef(null);
  const onBeforeGetContentResolve = useRef(null);

  useEffect(() => {
    if (typeof onBeforeGetContentResolve.current === "function") {
      onBeforeGetContentResolve.current();
    }
  }, [onBeforeGetContentResolve.current]);

  const handleUpdatePrintStatus = () => {
    // 
    let uri = 'print-label';
    let param = 'printList';
    if (widgetName === 'Purchase Label') {
      uri = 'print-box-label';
      param = 'printBoxList';
    }
    const printList = labelToPrint.map((label) =>
    ({
      factoryPk: label.factoryPk,
      printNo: label.printNo,
      rePrintReason: parseRePrintReson(label.rePrintReason),
      pk: {
        factoryCode: getFactoryAndIdByPk(label.factoryPk).factoryCode
      }
    })
    );
    try {
      mutate({
        url: `/v1/${uri}/update-all`,
        data: {
          [param]: printList
        },
        method: 'post',
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          formik.resetForm();
          formik.setSubmitting(false);
          onLoadData();
          onCancel();
          enqueueSnackbar(translate(`message.label(s)_were_printed_successfully`), {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
      }).catch((error) => {
        formik.setSubmitting(false);
        formik.setErrors(error);
      });
    } catch (error) {
      formik.setSubmitting(false);
      formik.setErrors(error);
    }
  }

  const handleAfterPrint = useCallback(() => {
    setLoading(false);
    handleUpdatePrintStatus();
  }, [setLoading, handleUpdatePrintStatus]);

  const handleBeforePrint = useCallback(() => {
    console.log("handleBeforePrint");
  }, []);

  const handleOnBeforeGetContent = useCallback(() => {
    setLoading(true);
    return new Promise((resolve) => {
      onBeforeGetContentResolve.current = resolve;
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }, [setLoading]);

  const reactToPrintContent = useCallback(() => componentRef.current, [componentRef.current]);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: `${widgetName} Print`,
    onBeforeGetContent: handleOnBeforeGetContent,
    onBeforePrint: handleBeforePrint,
    onAfterPrint: handleAfterPrint,
    removeAfterPrint: true
  });

  const parseRePrintReson = (oldReason) => {
    const reason = commonCodes.find(commonCode => commonCode.code === reasonReprint)?.name;
    if (reason) {
      let newReason;
      if (reason === 'OTHERS' && remarkReprint) {
        newReason = remarkReprint;
      } else if (remarkReprint) {
        newReason = `${reason} (${remarkReprint})`;
      } else {
        newReason = reason;
      }
      if (oldReason) {
        newReason = `${newReason}/${oldReason}`;
      }
      const newReasonArr = newReason.split('/');
      if (newReasonArr.length <= 3) {
        return newReason;
      }
      return newReasonArr.slice(0, 3).join("/");
    }
    return oldReason;
  }

  const LablePrintSchema = Yup.object().shape({
    labelType: Yup.string(),
    printType: Yup.string(),
    isReprint: Yup.boolean(),
    reason: Yup.string().when('isReprint', {
      is: true,
      then: Yup.string().required('Reason is required'),
      otherwise: Yup.string()
    }),

    remark: Yup.string().when('reason', {
      is: 'D040003',
      then: Yup.string().required('Remark is required'),
      otherwise: Yup.string()
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      isReprint,
      labelType: 'long',
      printType: 'asc',
      reason: '',
      remark: ''
    },
    validationSchema: LablePrintSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        remarkReprint = values.remark;
        reasonReprint = values.reason;
        handlePrint();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  {
                    widgetName === 'Production Label' &&
                    <DthRadioButton
                      {...getFieldProps('labelType')}
                      label="Label Type"
                      options={[
                        { value: 'long', label: 'Long Lable' },
                        { value: 'short', label: 'Short Lable' }
                      ]}
                    />
                  }
                  <DthRadioButton
                    {...getFieldProps('printType')}
                    label="Print Type"
                    options={[
                      { value: 'asc', label: 'Ascending' },
                      { value: 'desc', label: 'Descending' }
                    ]}
                  />
                </Stack>
                {
                  isReprint &&
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Dropdown
                        {...getFieldProps('reason')}
                        id="reason"
                        name="reason"
                        label='Reason'
                        size="small"
                        required
                        onChange={handleChange}
                        groupId='D040000'
                        errorMessage={touched.reason && errors.reason}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label="Remark"
                        size="small"
                        onChange={handleChange}
                        {...getFieldProps('remark')}
                        error={Boolean(touched.remark && errors.remark)}
                        helperText={touched.remark && errors.remark}
                      />
                    </Stack>
                  </>
                }
              </Stack>
            </Card>
          </Grid>

        </Grid>
        <div className='hidden'>
          <LabelToPrint ref={componentRef} labelToPrint={labelToPrint} printType={values.printType} labelType={values.labelType} widgetName={widgetName} />
        </div>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading} loadingIndicator="Loading...">
            {translate(`button.print`)}
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider >
  );
}
