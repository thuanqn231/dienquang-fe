import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { TextField, Alert, Stack } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useLocales from '../../../hooks/useLocales';
import { useDispatch, useSelector } from '../../../redux/store';
import { setInfo } from '../../../redux/slices/resetPassWordManagement';
import { mutate } from '../../../core/api';
// ----------------------------------------------------------------------

ForgotPasswordForm.propTypes = {
  onSent: PropTypes.func,
  onGetEmail: PropTypes.func
};

export default function ForgotPasswordForm({ onSent, onGetEmail }) {
  const { resetPassword } = useAuth();
  const isMountedRef = useIsMountedRef();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.resetPasswordManagement);

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required')
  });

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        dispatch(setInfo({
          ...info,
          email: values.email
        }))
        mutate({
          url: '/v1/user/forgot-password',
          data: {
            email: values.email
          },
          method: 'post',
          featureCode: 'user.create',

        })
          .then(({ data }) => {
            console.log('data', data)
            dispatch(setInfo({
              ...info,
              email: values.email,
              factoryCode: data.userPk.factoryCode,
              id: data.userPk.id
            }))
          })
        await resetPassword(values.email);
        if (isMountedRef.current) {
          onSent();
          onGetEmail(formik.values.email);
          setSubmitting(false);
        }
      } catch (error) {
        console.error(error);
        if (isMountedRef.current) {
          setErrors({ afterSubmit: error.message });
          setSubmitting(false);
        }
      }
    }
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.afterSubmit && <Alert severity="error">{errors.afterSubmit}</Alert>}

          <TextField
            fullWidth
            {...getFieldProps('email')}
            type="email"
            label="Email address"
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            {translate(`button.reset_password`)}
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
