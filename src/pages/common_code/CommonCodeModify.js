import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Divider, Grid, Stack, TextField, Typography } from '@material-ui/core';
// material
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown } from '../../core/wrapper';

// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';

const ModifyForm = forwardRef(({ onReload, SELECTEDID }, ref) => {
  const { updateCommonDropdown } = useAuth();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [groupCode, setGroupCode] = useState({
    code: '',
    name: '',
    state: 'Y',
    rank: '',
    description: '',
    remark: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  useImperativeHandle(ref, () => ({
    async openDialogReference() {
      await setDialogOpen();
    }
  }));
  const { translate } = useLocales();

  const setDialogOpen = () => {
    onLoadData();
  };

  const onLoadData = async () => {
    await query({
      url: `/v1/common_code/${SELECTEDID}`,
      featureCode: 'code.create'
    })
      .then((res) => {
        setGroupCode((preValue) => ({
          ...preValue,
          code: res.data.code,
          name: res.data.name,
          groupId: res.data.groupId,
          groupName: res.data.groupName,
          state: res.data.state,
          rank: res.data.rank,
          description: res.data.description,
          remark: res.data.remark
        }));
        setIsOpenDialog(true);
      })
      .catch((error) => {
        setGroupCode(null);
        console.error(error);
      });
  };

  const closeDialog = () => {
    setIsOpenDialog(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const NewUserSchema = Yup.object().shape({
    code: Yup.string().required('Group Code is required'),
    name: Yup.string().required('Group Name is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: groupCode.code,
      name: groupCode.name,
      groupId: groupCode.groupId,
      groupName: groupCode.groupName,
      state: groupCode.state,
      rank: groupCode.rank,
      description: groupCode.description,
      remark: groupCode.remark
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values) => {
      setIsOpenConfirmModal(true);
      setStateValue(values);
    }
  });

  const handleRegister = async () => {
    formik.setSubmitting(true);
    try {
      await mutate({
        url: '/v1/common_code/update',
        data: {
          commonCode: {
            code: SELECTEDID,
            name: stateValue.name,
            groupId: stateValue.groupId,
            groupName: stateValue.groupName,
            state: stateValue.state,
            rank: stateValue.rank,
            description: stateValue.description,
            remark: stateValue.remark
          }
        },
        method: 'post',
        featureCode: 'code.create'
      })
        .then(() => {
          formik.resetForm();
          formik.setSubmitting(false);
          setIsOpenConfirmModal(false);
          enqueueSnackbar('Update success', { variant: 'success' });
          closeDialog();
          updateCommonDropdown();
          onReload();
        })
        .catch((error) => {
          formik.setSubmitting(false);
          formik.setErrors(error);
        });
    } catch (error) {
      formik.setSubmitting(false);
      formik.setErrors(error);
    }
  };

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, handleChange } = formik;
  return (
    <DialogDragable title={translate(`typo.modify_common_code`)} maxWidth="lg" open={isOpenDialog} onClose={closeDialog}>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="groupId"
                      fullWidth
                      label="Group Code*"
                      disabled
                      {...getFieldProps('groupId')}
                      error={Boolean(touched.groupId && errors.groupId)}
                      helperText={touched.groupId && errors.groupId}
                    />
                    <TextField
                      name="groupName"
                      fullWidth
                      label="Group Name*"
                      disabled
                      {...getFieldProps('groupName')}
                      error={Boolean(touched.groupName && errors.groupName)}
                      helperText={touched.groupName && errors.groupName}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      name="code"
                      fullWidth
                      label="Common Code*"
                      {...getFieldProps('code')}
                      disabled
                      error={Boolean(touched.code && errors.code)}
                      helperText={touched.code && errors.code}
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
                      name="name"
                      label="Common Name*"
                      {...getFieldProps('name')}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                    <TextField
                      fullWidth
                      name="description"
                      label="Description"
                      {...getFieldProps('description')}
                      error={Boolean(touched.description && errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      fullWidth
                      name="remark"
                      label="Remark"
                      {...getFieldProps('remark')}
                      error={Boolean(touched.remark && errors.remark)}
                      helperText={touched.remark && errors.remark}
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
          {translate(`typo.do_you_want_to_modify`)}
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
ModifyForm.propTypes = {
  onReload: PropTypes.func,
  SELECTEDID: PropTypes.string.isRequired
};
export default ModifyForm;
