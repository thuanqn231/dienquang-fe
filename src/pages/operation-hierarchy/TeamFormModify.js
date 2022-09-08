import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
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

const TeamFormModify = forwardRef(({ onReload, FACTORYID }, ref) => {
  const { commonDropdown, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [team, setTeam] = useState({
    teamCode: '',
    teamName: '',
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
      const data = await loadSelectedData(`${BASE_URL}/team`, FACTORYID);
      if (data) {
        setTeam((preValue) => ({
          ...preValue,
          teamCode: data.code,
          teamName: data.name,
          state: data.state,
          rank: data.rank,
          factory: data.pk.factoryCode,
          plant: data.plant.factoryPk
        }));
        setIsOpenDialog(true);
      }
    } catch (error) {
      setTeam(null);
      console.error(error);
    }
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
      const updateParams = {
        code: values.teamCode,
        name: values.teamName,
        state: values.state,
        rank: values.rank,
        plant: {
          factoryPk: values.plant
        },
        factoryPk: FACTORYID
      }
      const response = await createUpdateData(`${BASE_URL}/team/update`, 'team', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const onProcessSuccess = () => {
    DthMessage({ variant: 'success', message: translate(`message.team_was_updated_successfully`) });
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
    return team[name].toString();
  };

  const TeamSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    plant: Yup.string().required('Plant is required'),
    teamCode: Yup.string().required('Team Code is required'),
    teamName: Yup.string().required('Team Name is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      teamCode: team.teamCode,
      teamName: team.teamName,
      state: team.state,
      rank: team.rank,
      factory: team.factory,
      plant: team.plant
    },
    validationSchema: TeamSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
    }
  });

  const { errors, setErrors, touched, handleSubmit, resetForm, getFieldProps, handleChange, isSubmitting, setSubmitting, values } = formik;

  return (
    <DialogDragable title={translate(`typo.modify_team`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
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
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="teamCode"
                      fullWidth
                      disabled
                      label="Team Code"
                      {...getFieldProps('teamCode')}
                      error={Boolean(touched.teamCode && errors.teamCode)}
                      helperText={touched.teamCode && errors.teamCode}
                    />
                    <TextField
                      fullWidth
                      name="teamName"
                      label="Team Name"
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
          <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
            {translate(`button.yes`)}
          </LoadingButton>
        </DialogActions>
      </DialogAnimate>
    </DialogDragable>
  );
});

TeamFormModify.propTypes = {
  onReload: PropTypes.func,
  FACTORYID: PropTypes.string.isRequired
};

export default TeamFormModify;
