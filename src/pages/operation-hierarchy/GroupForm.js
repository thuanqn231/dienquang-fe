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

const GroupForm = forwardRef(({ onReload }, ref) => {
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

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const createParams = {
        code: values.code.toUpperCase(),
            name: values.name,
            state: values.state,
            rank: values.rank,
            team: {
              factoryPk: values.team
            },
            pk: {
              factoryCode: getFactoryByPk(values.factory)
            }
      }
      const response = await createUpdateData(`${BASE_URL}/group/create`, 'group', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.group_was_created_successfully`) });
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

  const GroupSchema = Yup.object().shape({
    code: Yup.string().required('Group Code is required'),
    name: Yup.string().required('Group Name is required'),
    plant: Yup.string().required('Plant is required'),
    team: Yup.string().required('Team is required'),
    factory: Yup.string().required('Factory is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: '',
      name: '',
      team: '',
      state: 'RUNNING',
      rank: 1,
      factory: '',
      plant: ''
    },
    validationSchema: GroupSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });
  
  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values, setFieldValue } = formik;

  return (
    <DialogDragable title={translate(`typo.add_group`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
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
                    <Dropdown
                      {...getFieldProps('team')}
                      id="team"
                      name="team"
                      label="Team"
                      required
                      onChange={handleChange}
                      options={commonDropdown.teamDropdown.filter(
                        (dd) => dd.factory === values.factory && dd.plant === values.plant
                      )}
                      defaultValue=""
                      errorMessage={touched.team && errors.team}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      fullWidth
                      name="code"
                      label="Group Code"
                      {...getFieldProps('code')}
                      error={Boolean(touched.code && errors.code)}
                      helperText={touched.code && errors.code}
                    />
                    <TextField
                      fullWidth
                      name="name"
                      label="Group Name"
                      {...getFieldProps('name')}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
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
            <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
          </DialogActions>
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

GroupForm.propTypes = {
  onReload: PropTypes.func
};

export default GroupForm;
