import * as Yup from 'yup';
import { useState } from 'react';
import { useSnackbar } from 'notistack5';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { OutlinedInput, FormHelperText, Stack, Card } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
// routes
import { PATH_AUTH } from '../../../routes/paths';

// utils
import fakeRequest from '../../../utils/fakeRequest';
import CountdownTimer from '../../CountdownTimer';
// hooks
import useLocales from '../../../hooks/useLocales';
import { useDispatch, useSelector } from '../../../redux/store';
import { setInfo } from '../../../redux/slices/resetPassWordManagement';
// ----------------------------------------------------------------------

// eslint-disable-next-line consistent-return
function maxLength(object) {
  if (object.target.value.length > object.target.maxLength) {
    return (object.target.value = object.target.value.slice(0, object.target.maxLength));
  }
}

export default function VerifyCodeForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.resetPasswordManagement);
  const [timeout, setTimeout] = useState(false);

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.number().required('Code is required'),
    code2: Yup.number().required('Code is required'),
    code3: Yup.number().required('Code is required'),
    code4: Yup.number().required('Code is required'),
    code5: Yup.number().required('Code is required'),
    code6: Yup.number().required('Code is required')
  });

  const formik = useFormik({
    initialValues: {
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: ''
    },
    validationSchema: VerifyCodeSchema,
    onSubmit: async () => {
      // await fakeRequest(500);
      // enqueueSnackbar('Verify success', { variant: 'success' });
      dispatch(setInfo({
        ...info,
        code: values.code1.toString() + values.code2 + values.code3 + values.code4 + values.code5 + values.code6
      }))
      navigate(PATH_AUTH.resetPassword);
    }
  });

  const { values, errors, isValid, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Card
        sx={{
          backgroundColor: 'primary.dark',
          textAlign: 'center',
          mb: 3
        }}
      >
        <CountdownTimer seconds={300} timeout={timeout} setTimeout={setTimeout} />
      </Card>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2} justifyContent="center">
          {Object.keys(values).map((item) => (
            <OutlinedInput
              key={item}
              {...getFieldProps(item)}
              type="number"
              placeholder="-"
              onInput={maxLength}
              error={Boolean(touched[item] && errors[item])}
              inputProps={{
                maxLength: 1,
                sx: {
                  p: 0,
                  textAlign: 'center',
                  width: { xs: 36, sm: 56 },
                  height: { xs: 36, sm: 56 }
                }
              }}
            />
          ))}
        </Stack>

        <FormHelperText error={!isValid} style={{ textAlign: 'right' }}>
          {!isValid && 'Code is required'}
        </FormHelperText>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} sx={{ mt: 3 }} disabled={timeout}>
          {translate(`button.next`)}
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}
