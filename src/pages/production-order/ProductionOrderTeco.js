import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, Typography, TextField
} from '@material-ui/core';
import { isEmpty } from 'lodash';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import useLocales from '../../hooks/useLocales';

// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
import {generateProductionOrderHtml} from './helper';

// ----------------------------------------------------------------------

ProductionOrderTeco.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function ProductionOrderTeco({ onCancel, onLoadData, currentData, isEdit }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate, currentLang } = useLocales();

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const handleTecoProductionOrder = async () => {
    formik.setSubmitting(true);
    const htmlContent = await generateProductionOrderHtml([currentData], 'teco');
    try {
      const prodStatus = isEmpty(currentData.actualQty) ? 'D019006' : 'D019004';
      mutate({
        url: '/v1/productionOrder/update',
        data: {
          plan: {
            factoryPk: currentData?.factoryPk,
            teco: {
              code: values.reason
            },
            tecoRemark: values.remark || null,
            prodStatus: {
              code: prodStatus
            },
            htmlContent
          }
        },
        method: 'post',
        featureCode: 'user.create'
      }).then((res) => {
        if (res.httpStatusCode === 200) {
          formik.resetForm();
          formik.setSubmitting(false);
          onLoadData();
          setIsOpenConfirmModal(false);
          onCancel();
          enqueueSnackbar(`Plan ${translate(`message.was_TECO_successfully`)}`, {
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

  const TecoSchema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    remark: Yup.string().when('reason', {
      is: 'D021001',
      then: Yup.string().required('Remark is required'),
      otherwise: Yup.string()
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      reason: '',
      remark: ''
    },
    validationSchema: TecoSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('reason')}
                    id="reason"
                    name="reason"
                    label='Reason'
                    size="small"
                    required
                    onChange={handleChange}
                    groupId='D021000'
                    errorMessage={touched.reason && errors.reason}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Remark"
                    size="small"
                    {...getFieldProps('remark')}
                    error={Boolean(touched.remark && errors.remark)}
                    helperText={touched.remark && errors.remark}
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">{translate(`button.teco`)}</LoadingButton>
        </DialogActions>

        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to_TECO`)}?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." onClick={handleTecoProductionOrder}>
              {translate(`button.confirm`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
