import {
  Box, Button, Card, DialogActions, Grid,
  Stack, TextField
} from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import useLocales from '../../../hooks/useLocales';
// routes
import { PATH_PAGES } from '../../../routes/paths';
import fakeRequest from '../../../utils/fakeRequest';

// ----------------------------------------------------------------------

UserCreate.propTypes = {
  isEdit: PropTypes.bool,
  currentDept: PropTypes.object,
  onCancel: PropTypes.func
};

export default function UserCreate({ isEdit, currentDept, onCancel }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();

  const NewUserSchema = Yup.object().shape({
    DEPT_NM: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email(),
    phoneNumber: Yup.string().required('Phone number is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      DEPT_NM: currentDept?.DEPT_NM || '',
      DEPT_CD: currentDept?.DEPT_CD || '',
      DEPT_LEADER: currentDept?.DEPT_LEADER || ''
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        await fakeRequest(500);
        resetForm();
        setSubmitting(false);
        enqueueSnackbar(!isEdit ? 'Create success' : 'Update success', { variant: 'success' });
        navigate(PATH_PAGES.user.list);
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Department Name"
                    {...getFieldProps('DEPT_NM')}
                    error={Boolean(touched.DEPT_NM && errors.DEPT_NM)}
                    helperText={touched.DEPT_NM && errors.DEPT_NM}
                  />
                  <TextField
                    fullWidth
                    label="Department Code"
                    {...getFieldProps('DEPT_CD')}
                    error={Boolean(touched.DEPT_CD && errors.DEPT_CD)}
                    helperText={touched.DEPT_CD && errors.DEPT_CD}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Leader"
                    {...getFieldProps('DEPT_LEADER')}
                    error={Boolean(touched.DEPT_LEADER && errors.DEPT_LEADER)}
                    helperText={touched.DEPT_LEADER && errors.DEPT_LEADER}
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled loadingIndicator="Loading...">
            {translate(`button.add`)}
          </LoadingButton>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
