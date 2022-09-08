import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { createUpdateData, loadSelectedData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

const GroupFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [group, setGroup] = useState({
    code: '',
    name: '',
    team: '',
    state: 'Y',
    rank: '',
    factory: '',
    plant: ''
  });
  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));

  const setDialogOpen = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    try {
      const data = await loadSelectedData(`${BASE_URL}/group`, FACTORYID);
      if (data) {
        setGroup((preValue) => ({
          ...preValue,
          code: data.code,
          name: data.name,
          state: data.state,
          rank: data.rank,
          factory: data.pk.factoryCode,
          plant: data.team.plant.factoryPk,
          team: data.team.factoryPk
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setGroup(null);
      console.error(error);
    }
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleUpdate = async () => {
    formik.setSubmitting(true);
    try {
      const updateParams = {
        code: values.code,
        name: values.name,
        state: values.state,
        rank: values.rank,
        team: {
          factoryPk: values.team
        },
        factoryPk: FACTORYID
      }
      const response = await createUpdateData(`${BASE_URL}/group/update`, 'group', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.group_was_updated_successfully`) });
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

  const filterDropDownList = (values, name) => {
    if (values[name] !== '') {
      return values[name].toString();
    }
    return group[name].toString();
  };

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
      code: group.code,
      name: group.name,
      team: group.team,
      state: group.state,
      rank: group.rank,
      factory: group.factory,
      plant: group.plant
    },
    validationSchema: GroupSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_group`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                      disabled
                      onChange={handleChange}
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
                      // disabled
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
                      disabled
                      onChange={handleChange}
                      options={commonDropdown.plantDropdown.filter(
                        (dd) => dd.factory === filterDropDownList(values, 'factory')
                      )}
                      defaultValue=""
                      errorMessage={touched.plant && errors.plant}
                    />
                    <Dropdown
                      {...getFieldProps('team')}
                      id="team"
                      name="team"
                      label="Team"
                      required
                      disabled
                      onChange={handleChange}
                      options={commonDropdown.teamDropdown.filter(
                        (dd) =>
                          dd.factory === filterDropDownList(values, 'factory') &&
                          dd.plant === filterDropDownList(values, 'plant')
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
                      disabled
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
              {translate(`button.modify`)}
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
      <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
        <Typography variant="subtitle1" align="center">
          {translate(`typo.do_you_want_to_modify`)}?
        </Typography>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
            {translate(`button.no`)}
          </Button>
          <LoadingButton type="button" variant="contained" onClick={handleUpdate} loading={isSubmitting}>
            {translate(`button.yes`)}
          </LoadingButton>
        </DialogActions>
      </DialogAnimate>
    </DialogDragable>
  );
});

GroupFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default GroupFormModify;
