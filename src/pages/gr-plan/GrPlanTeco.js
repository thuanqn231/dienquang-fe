import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField, Typography
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import useLocales from '../../hooks/useLocales';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
import { generateProductionGrHtml, generatePurchaseGrHtml } from './helper';

// ----------------------------------------------------------------------

GrPlanTeco.propTypes = {
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  selectedGrId: PropTypes.string,
  widgetName: PropTypes.string,
  isOpenActionModal: PropTypes.bool
};

export default function GrPlanTeco({ onCancel, onLoadData, selectedGrId, isOpenActionModal, widgetName }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [currentData, setCurrentData] = useState({});
  const { translate } = useLocales();
  const [htmlContent, setHtmlContent] = useState('');

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  useEffect(() => {
    if (!isEmpty(selectedGrId) && isOpenActionModal) {
      let uri = 'purchase';
      if (widgetName === 'Production G/R Plan') {
        uri = 'production';
      }
      query({
        url: `/v1/gr/${uri}/${selectedGrId}`,
        featureCode: 'user.create'
      })
        .then(async (res) => {
          const { data } = res;
          setCurrentData(data);
          let _htmlContent;
          if (widgetName === 'Purchase G/R Plan') {
            _htmlContent = await generatePurchaseGrHtml([data], 'teco');
          } else {
            _htmlContent = await generateProductionGrHtml([data], 'teco');
          }
          setHtmlContent(_htmlContent);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedGrId]);

  const handleTecoProductionOrder = () => {
    formik.setSubmitting(true);
    try {
      const grStatus = isEmpty(currentData.actualQty) ? 'D019006' : 'D019004';
      let uri = 'purchase';
      let param = 'grUpdateDto';
      if (widgetName === 'Production G/R Plan') {
        uri = 'production';
        param = 'productionGRUpdate'
      }
      mutate({
        url: `/v1/gr/${uri}/update`,
        data: {
          [param]: {
            factoryPk: currentData?.factoryPk,
            teco: {
              code: values.reason
            },
            tecoRemark: values.remark || null,
            grStatus: {
              code: grStatus
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
          enqueueSnackbar(`${widgetName} ${translate(`message.was_TECO_successfully`)}`, {
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
                    groupId='D022000'
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{translate(`button.teco`)}</LoadingButton>
        </DialogActions>

        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to_TECO`)}</Typography>
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
