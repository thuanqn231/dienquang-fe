import {
  Box, Button, Card, Checkbox, DialogActions, FormControlLabel, FormGroup, Grid,
  Stack, TextField, Typography
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
// material
import { LoadingButton } from '@material-ui/lab';
import { FieldArray, Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
// components
import { DialogAnimate } from '../../components/animate';
import useLocales from '../../hooks/useLocales';
import { camalize } from '../../utils/formatString';

// ----------------------------------------------------------------------

CreateAuthorizeForm.propTypes = {
  selectedAuth: PropTypes.object,
  onCancel: PropTypes.func,
  handleSaveAuths: PropTypes.func,
  gridApiAuths: PropTypes.object
};

const pxToRem = (value) => `${value / 16}rem`;

export default function CreateAuthorizeForm({ onCancel, handleSaveAuths, gridApiAuths, selectedAuth }) {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const { translate } = useLocales();
  const [currentLevel, setCurrentLevel] = useState(2);
  const [isRequiredUrl, setRequiredUrl] = useState(false);

  useEffect(() => {
    const _currentLevel = selectedAuth.pageName.length;
    setCurrentLevel(_currentLevel + 1);
  }, [selectedAuth]);

  useEffect(() => {
    setRequiredUrl(currentLevel > 4)
  }, [currentLevel]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const handleRegisterAuthorize = () => {
    const nodes = [];
    gridApiAuths.forEachNode((node) => {
      nodes.push(node.data);
    });
    let pageCode = selectedAuth.code;
    let currentPageName = selectedAuth.pageName;
    values.inputFields.forEach((value) => {
      const { pageName } = value;
      pageCode = `${pageCode}.${camalize(pageName)}`;
      currentPageName = [...currentPageName, value.pageName];
      nodes.push({
        code: pageCode,
        pageName: currentPageName,
        name: pageName,
        description: value.url,
        read: value.isRead,
        create: value.isCreate,
        update: value.isUpdate,
        delete: value.isDelete,
        execute: value.isExecute
      })
    })
    handleSaveAuths(nodes);
    setIsOpenConfirmModal(false);
    onCancel();
    resetForm();
  }

  const NewUserSchema = Yup.object().shape({
    inputFields: Yup.array().of(Yup.object().shape({
      pageName: Yup.string().required('Page Name is required'),
      url: Yup.string().when('isRequiredUrl', {
        is: true,
        then: Yup.string().required('Url is required'),
        otherwise: Yup.string()
      }),
      isRead: Yup.boolean(),
      isCreate: Yup.boolean(),
      isUpdate: Yup.boolean(),
      isDelete: Yup.boolean(),
      isExecute: Yup.boolean(),
    }
    ))
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      inputFields: [
        { pageName: '', url: '', isRead: true, isCreate: true, isUpdate: true, isDelete: true, isExecute: true, isRequiredUrl }
      ]
    },
    validationSchema: NewUserSchema,
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

  const { errors, touched, isSubmitting, values, setSubmitting, handleSubmit, getFieldProps, setFieldValue, resetForm, handleChange } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>

              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  {
                    selectedAuth.pageName.map((page, idx) => (
                      <>
                        {
                          idx > 0 && <Typography sx={{ mt: '8px !important' }} variant="subtitle1">{'>'}</Typography>
                        }
                        <TextField
                          fullWidth
                          label=''
                          value={page}
                          disabled
                          size='small'
                        />
                      </>
                    ))
                  }
                </Stack>
                <FieldArray name='inputFields'>
                  {({ push, remove }) => (
                    <>
                      {
                        values.inputFields.map((element, index) => {
                          const currentIdx = currentLevel + values.inputFields.length;
                          const isLastLevel = index === values.inputFields.length - 1;
                          return (
                            <Stack spacing={3} key={index}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1">{`Level ${selectedAuth.pageName.length + index + 1}`}</Typography>
                                {
                                  isLastLevel &&
                                  <Stack direction="row" alignItems="right">
                                    {
                                      values.inputFields.length !== 1 && (
                                        <Button onClick={() => {
                                          remove(index);
                                        }}>
                                          <RemoveIcon fontSize="medium" />
                                        </Button>
                                      )
                                    }
                                    {
                                      currentIdx <= 6 && (
                                        <Button onClick={() => {
                                          let isRequiredUrl = false;
                                          if (currentIdx === 5 || currentIdx === 6) {
                                            isRequiredUrl = true;
                                          }
                                          push({ pageName: '', url: '', isRead: true, isCreate: true, isUpdate: true, isDelete: true, isExecute: true, isRequiredUrl })
                                        }}>
                                          <AddIcon fontSize='medium' />
                                        </Button>
                                      )
                                    }
                                  </Stack>
                                }
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                <TextField
                                  fullWidth
                                  label="Page Name"
                                  required
                                  {...getFieldProps(`inputFields[${index}].pageName`)}
                                  error={Boolean(touched?.inputFields?.length && touched?.inputFields[index] && touched?.inputFields[index]?.pageName && errors?.inputFields?.length && errors?.inputFields[index] && errors?.inputFields[index].pageName)}
                                  helperText={touched?.inputFields?.length && touched?.inputFields[index] && touched?.inputFields[index]?.pageName && errors?.inputFields?.length && errors?.inputFields[index] && errors?.inputFields[index].pageName}
                                />
                                {
                                  values?.inputFields[index]?.isRequiredUrl && (
                                    <TextField
                                      fullWidth
                                      label="Url"
                                      required
                                      {...getFieldProps(`inputFields[${index}].url`)}
                                      error={Boolean(touched?.inputFields?.length && touched?.inputFields[index] && touched?.inputFields[index]?.url && errors?.inputFields?.length && errors?.inputFields[index] && errors?.inputFields[index]?.url)}
                                      helperText={touched?.inputFields?.length && touched?.inputFields[index] && touched?.inputFields[index]?.url && errors?.inputFields?.length && errors?.inputFields[index] && errors?.inputFields[index]?.url}
                                    />
                                  )
                                }
                              </Stack>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        name={`inputFields[${index}].isRead`}
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={values?.inputFields[index]?.isRead}
                                        onChange={handleChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                      />
                                    }
                                    label="READ"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        name={`inputFields[${index}].isCreate`}
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={values?.inputFields[index]?.isCreate}
                                        onChange={handleChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                      />
                                    }
                                    label="CREATE"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        name={`inputFields[${index}].isUpdate`}
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={values?.inputFields[index]?.isUpdate}
                                        onChange={handleChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                      />
                                    }
                                    label="UPDATE"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        name={`inputFields[${index}].isDelete`}
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={values?.inputFields[index]?.isDelete}
                                        onChange={handleChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                      />
                                    }
                                    label="DELETE"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        name={`inputFields[${index}].isExecute`}
                                        style={{ color: 'common.black', fontWeight: 'fontWeightMedium', fontSize: pxToRem(16) }}
                                        checked={values?.inputFields[index]?.isExecute}
                                        onChange={handleChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                      />
                                    }
                                    label="EXECUTE"
                                  />
                                </FormGroup>
                              </Stack>
                            </Stack>
                          )
                        })
                      }
                    </>
                  )}
                </FieldArray>

              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">
            {translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{translate(`typo.do_you_want_to`)} {translate(`typo.register`)}?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.no`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterAuthorize} loading={isSubmitting} loadingIndicator="Processing...">
              {translate(`button.yes`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
