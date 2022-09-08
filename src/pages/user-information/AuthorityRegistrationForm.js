import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { closeUserInfoActionModal } from '../../redux/slices/userManagement';
import { useDispatch } from '../../redux/store';
import { getFactoryAndIdByPk, isNullPk } from '../../utils/formatString';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

AuthorityRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function AuthorityRegistrationForm({ currentData, onCancel, onLoadData }) {
  const dispatch = useDispatch();
  const { commonDropdown, user, updateCommonDropdown } = useAuth();
  const { translate } = useLocales();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isExistedOrg, setExistedOrg] = useState(false);

  useEffect(() => {
    if (isNullPk(currentData?.organizationalChartProduction?.factoryPk)) {
      setExistedOrg(false);
    } else {
      setExistedOrg(true);
    }
  }, [currentData]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const onProcessSuccess = () => {
    resetForm();
    setSubmitting(false);
    onLoadData();
    setIsOpenConfirmModal(false);
    dispatch(closeUserInfoActionModal());
    updateCommonDropdown();
    DthMessage({ variant: 'success', message: translate(`message.update_user_successful`) });
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const updateAuth = async () => {
    try {
      const { factoryCode } = getFactoryAndIdByPk(currentData.factoryPk);
      const updateParams = {
        factoryPk: currentData.factoryPk,
        profile: {
          factoryPk: values?.role || null
        },
        organizationalChartProduction: {
          pk: {
            factoryCode
          },
          factoryPks: values?.factory || null,
          plantPks: values?.plant || null,
          teamPks: values?.team || null,
          groupPks: values?.group || null,
          partPks: values?.part || null
        }
      }
      const response = await createUpdateData(`${BASE_URL}/update`, 'user', updateParams);
      if (response.httpStatusCode === 200) {
        onProcessSuccess();
      }
    } catch (error) {
      onProcessError(error);
    }
  };

  const handleGrantAuthority = async () => {
    formik.setSubmitting(true);
    if (isExistedOrg) {
      const updateParams = {
        factoryPk: currentData.factoryPk,
        organizationalChartProduction: null
      }
      await createUpdateData(`${BASE_URL}/update`, 'user', updateParams);
    }
    updateAuth();
  };

  const handleChangeDropdownMulti = (field, event, options) => {
    const {
      target: { value }
    } = event;

    if (value[value.length - 1] === 'all') {
      setFieldValue(field, value.length === options.length + 1 ? [] : options.map((a) => a.value));

      return;
    }

    setFieldValue(field, typeof value === 'string' ? value.split(',') : value);
  };

  const getAllPlantDropDown = () => {
    const dropdown = commonDropdown.plantDropdownAll.filter((dd) => values.factory.includes(dd.factoryPk));
    return dropdown;
  };

  const getAllTeamDropDown = () => {
    const dropdown = commonDropdown.teamDropdownAll.filter(
      (dd) => values.factory.includes(dd.factoryPk) && values.plant.includes(dd.plant)
    );

    return dropdown;
  };

  const getAllGroupDropDown = () => {
    const dropdown = commonDropdown.groupDropdownAll.filter(
      (dd) => values.factory.includes(dd.factoryPk) && values.plant.includes(dd.plant) && values.team.includes(dd.team)
    );

    return dropdown;
  };

  const getAllPartDropDown = () => {
    const dropdown = commonDropdown.partDropdownAll.filter(
      (dd) =>
        values.factory.includes(dd.factoryPk) &&
        values.plant.includes(dd.plant) &&
        values.team.includes(dd.team) &&
        values.group.includes(dd.group)
    );
    return dropdown;
  };

  const NewUserSchema = Yup.object().shape({
    factory: Yup.array().required('Factory is required'),
    employee_id: Yup.string().required('Employee ID is required'),
    employee_name: Yup.string().required('Employee Name is required'),
    department: Yup.string().required('Department is required'),
    user_name: Yup.string().required('User Name is required'),
    role: Yup.string().required('Role is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: currentData?.factoryPks || [user.factory.factoryPk],
      employee_id: currentData?.code || '',
      employee_name: currentData?.fullName || '',
      department: currentData?.department?.name || '',
      user_name: currentData?.userName || '',
      role: currentData?.profile?.factoryPk || '',
      plant: currentData?.plantPks || [],
      team: currentData?.teamPks || [],
      group: currentData?.groupPks || [],
      part: currentData?.partPks || []
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, setSubmitting, setErrors, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ px: 1, pb: 2 }}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="User Name"
                  required
                  disabled
                  {...getFieldProps('user_name')}
                  error={Boolean(touched.user_name && errors.user_name)}
                  helperText={touched.user_name && errors.user_name}
                />
                <TextField
                  fullWidth
                  autoComplete="off"
                  label="Employee ID"
                  required
                  disabled
                  {...getFieldProps('employee_id')}
                  error={Boolean(touched.employee_id && errors.employee_id)}
                  helperText={touched.employee_id && errors.employee_id}
                />
                <TextField
                  fullWidth
                  label="Employee Name"
                  required
                  disabled
                  {...getFieldProps('employee_name')}
                  error={Boolean(touched.employee_name && errors.employee_name)}
                  helperText={touched.employee_name && errors.employee_name}
                />
                <TextField
                  fullWidth
                  autoComplete="off"
                  label="Department"
                  required
                  disabled
                  {...getFieldProps('department')}
                  error={Boolean(touched.department && errors.department)}
                  helperText={touched.department && errors.department}
                />
                <Dropdown
                  {...getFieldProps('role')}
                  id="role"
                  name="role"
                  label="Role"
                  required
                  onChange={handleChange}
                  options={commonDropdown.profileDropdown}
                  defaultValue=""
                  errorMessage={touched.role && errors.role}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ px: 1, pb: 2 }}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Dropdown
                  {...getFieldProps('factory')}
                  label="Factory"
                  isMulti
                  onChange={(event) => {
                    handleChangeDropdownMulti('factory', event, commonDropdown.factoryDropdownAll);
                    setFieldValue('plant', []);
                    setFieldValue('team', []);
                    setFieldValue('group', []);
                    setFieldValue('part', []);
                  }}
                  allowEmptyOption={false}
                  options={commonDropdown.factoryDropdownAll}
                  errorMessage={touched.factory && errors.factory}
                />
                <Dropdown
                  {...getFieldProps('plant')}
                  id="plant"
                  name="plant"
                  label="Plant"
                  isMulti
                  onChange={(event) => {
                    handleChangeDropdownMulti('plant', event, getAllPlantDropDown());
                    setFieldValue('team', []);
                    setFieldValue('group', []);
                    setFieldValue('part', []);
                  }}
                  allowEmptyOption={false}
                  options={getAllPlantDropDown}
                  errorMessage={touched.plant && errors.plant}
                />
                <Dropdown
                  {...getFieldProps('team')}
                  id="team"
                  name="team"
                  label="Team"
                  isMulti
                  onChange={(event) => {
                    handleChangeDropdownMulti('team', event, getAllTeamDropDown());
                    setFieldValue('group', []);
                    setFieldValue('part', []);
                  }}
                  allowEmptyOption={false}
                  options={getAllTeamDropDown}
                  errorMessage={touched.team && errors.team}
                />
                <Dropdown
                  {...getFieldProps('group')}
                  id="group"
                  name="group"
                  label="Group"
                  isMulti
                  onChange={(event) => {
                    handleChangeDropdownMulti('group', event, getAllGroupDropDown());
                    setFieldValue('part', []);
                  }}
                  allowEmptyOption={false}
                  options={getAllGroupDropDown}
                  errorMessage={touched.group && errors.group}
                />
                <Dropdown
                  {...getFieldProps('part')}
                  id="part"
                  name="part"
                  label="Part"
                  isMulti
                  onChange={(event) => {
                    handleChangeDropdownMulti('part', event, getAllPartDropDown());
                  }}
                  allowEmptyOption={false}
                  options={getAllPartDropDown}
                  errorMessage={touched.part && errors.part}
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            {translate(`button.modify`)}
          </LoadingButton>
        </DialogActions>

        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">
            {translate(`typo.do_you_want_to_confirm`)}?
          </Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleGrantAuthority} loading={isSubmitting}>
              {translate(`button.confirm`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider>
  );
}
