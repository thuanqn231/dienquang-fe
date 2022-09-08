import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getFactoryByPk } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const TeamForm = forwardRef(({ onReload }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState('');
  const { translate } = useLocales();

  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    setIsOpenDialog(true);
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const TeamSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    teamCode: Yup.string().required('Team Code is required'),
    teamName: Yup.string().required('Team Name is required'),
    plant: Yup.string().required('Plant is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      teamCode: '',
      teamName: '',
      state: 'RUNNING',
      rank: 1,
      factory: '',
      plant: ''
    },
    validationSchema: TeamSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const createParams = {
        code: values.teamCode.toUpperCase(),
        name: values.teamName,
        state: values.state,
        rank: values.rank,
        plant: {
          factoryPk: values.plant
        },
        pk: {
          factoryCode: getFactoryByPk(values.factory)
        }
      }
      const response = await createUpdateData(`${BASE_URL}/team/create`, 'team', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.team_was_created_successfully`) });
    resetForm();
    setSubmitting(false);
    setIsOpenConfirmModal(false);
    closeDialog();
    onReload();
    updateCommonDropdown();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  }

  const handleChangeFactory = (event) => {
    const {
      target: { value }
    } = event;
    setCurrentFactory(value);
    if (currentFactory !== '' && currentFactory !== value) {
      setChangeFactory(true);
    } else {
      setFieldValue('factory', value);
    }
  }

  const { errors, touched, values, handleSubmit, isSubmitting, getFieldProps, handleChange, setFieldValue, resetForm, setSubmitting, setErrors } = formik;

  return (
    <DialogDragable title={translate(`typo.add_team`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      required
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      defaultValue=""
                      errorMessage={touched.factory && errors.factory}
                    />
                    <Dropdown
                      {...getFieldProps('plant')}
                      id="plant"
                      name="plant"
                      label="Plant"
                      required
                      onChange={handleChange}
                      options={commonDropdown.plantDropdown.filter((dd) => dd.factory === values.factory)}
                      defaultValue=""
                      errorMessage={touched.plant && errors.plant}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="teamCode"
                      fullWidth
                      label="Team Code*"
                      {...getFieldProps('teamCode')}
                      error={Boolean(touched.teamCode && errors.teamCode)}
                      helperText={touched.teamCode && errors.teamCode}
                    />
                    <TextField
                      fullWidth
                      name="teamName"
                      label="Team Name*"
                      {...getFieldProps('teamName')}
                      error={Boolean(touched.teamName && errors.teamName)}
                      helperText={touched.teamName && errors.teamName}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="rank"
                      fullWidth
                      label="Sort Order"
                      type="number"
                      {...getFieldProps('rank')}
                      error={Boolean(touched.rank && errors.rank)}
                      helperText={touched.rank && errors.rank}
                    />
                    <Dropdown
                      {...getFieldProps('state')}
                      id="state"
                      name="state"
                      label="Use(Y/N)"
                      allowEmptyOption={false}
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      defaultValue=""
                      errorMessage={touched.state && errors.state}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={closeDialog}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              // disabled
              loadingIndicator="Loading..."
            >
              {translate(`button.add`)}
            </LoadingButton>
          </DialogActions>
          <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
        </Form>
      </FormikProvider>
      <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
        <Typography variant="subtitle1" align="center">
          {translate(`typo.do_you_want_to_register`)}?
        </Typography>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
            {translate(`button.no`)}
          </Button>
          <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
            {translate(`button.yes`)}
          </LoadingButton>
        </DialogActions>
      </DialogAnimate>
    </DialogDragable>
  );
});

TeamForm.propTypes = {
  onReload: PropTypes.func
};

export default TeamForm;
