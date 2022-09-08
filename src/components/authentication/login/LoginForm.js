import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import { Form, FormikProvider, useFormik } from 'formik';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
// material
import {
  Alert,
  Checkbox, FormControlLabel, IconButton,
  InputAdornment, Link,
  Stack, TextField
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// hooks
import { DthMessage } from '../../../core/wrapper';
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useLocales from '../../../hooks/useLocales';
//

// ----------------------------------------------------------------------

export default function LoginForm() {
  const { login } = useAuth();
  const isMountedRef = useIsMountedRef();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { translate } = useLocales();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(translate(`login.email_valid`)).required(translate(`login.email_required`)),
    password: Yup.string().required(translate(`login.password_required`))
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
      try {
        const { isSuccess, msg } = await login(values.email, values.password);
        if (isSuccess) {
          DthMessage({ variant: 'success', message: translate(`login.login_success`) });
        } else {
          setErrors({ afterSubmit: msg });
        }
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      } catch (error) {
        console.error(error);
        resetForm();
        if (isMountedRef.current) {
          setSubmitting(false);
          setErrors({ afterSubmit: error.message });
        }
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {errors.afterSubmit && <Alert severity="error">{errors.afterSubmit}</Alert>}

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label={translate(`login.email_address`)}
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label={translate(`login.password`)}
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <FormControlLabel
            control={<Checkbox {...getFieldProps('remember')} checked={values.remember} />}
            label={translate(`login.remember_me`)}
          />

          <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.forgotPassword}>
            {translate(`login.forgot_password`)}
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <LoadingButton sx={{ mr: 1 }} fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            {translate(`login.login`)}
          </LoadingButton>
          <LoadingButton sx={{ ml: 1 }} fullWidth size="large" type="button" variant="outlined" onClick={() => navigate(PATH_AUTH.register)}>
            {translate(`signup.signup`)}
          </LoadingButton>
        </Stack>

      </Form>
    </FormikProvider>
  );
}
