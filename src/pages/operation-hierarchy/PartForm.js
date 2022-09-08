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

const PartForm = forwardRef(({ onReload }, ref) => {
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
        code: values.partCode.toUpperCase(),
        name: values.partName,
        state: values.state,
        rank: values.rank,
        group: {
          factoryPk: values.group
        },
        pk: {
          factoryCode: getFactoryByPk(values.factory)
        }
      }
      const response = await createUpdateData(`${BASE_URL}/part/create`, 'part', createParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.part_was_created_successfully`) });
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

  const PartSchema = Yup.object().shape({
    partCode: Yup.string().required('Part Code is required'),
    partName: Yup.string().required('Part Name is required'),
    group: Yup.string().required('Group is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      partCode: '',
      partName: '',
      state: 'RUNNING',
      rank: 1,
      factory: '',
      group: ''
    },
    validationSchema: PartSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, touched, handleSubmit, values, isSubmitting, getFieldProps, handleChange, resetForm, setFieldValue, setSubmitting, setErrors } = formik;

  return (
    <DialogDragable title={translate(`typo.add_part`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                      errorMessage={touched.group && errors.group}
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
                    <Dropdown
                      {...getFieldProps('group')}
                      id="group"
                      name="group"
                      label="Group"
                      required
                      onChange={handleChange}
                      options={commonDropdown.groupDropdown.filter(
                        (dd) => dd.factory === values.factory && dd.plant === values.plant && dd.team === values.team
                      )}
                      defaultValue=""
                      errorMessage={touched.group && errors.group}
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
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      fullWidth
                      name="partCode"
                      label="Part Code"
                      {...getFieldProps('partCode')}
                      error={Boolean(touched.partCode && errors.partCode)}
                      helperText={touched.partCode && errors.partCode}
                    />
                    <TextField
                      fullWidth
                      name="partName"
                      label="Part Name"
                      {...getFieldProps('partName')}
                      error={Boolean(touched.partName && errors.partName)}
                      helperText={touched.partName && errors.partName}
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

PartForm.propTypes = {
  onReload: PropTypes.func
};

export default PartForm;
