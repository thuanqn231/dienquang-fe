import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import { getLossMasterDropdown } from '../../redux/slices/lossManagement';
import { getDefectCause, getDefectCauseDetail } from '../../redux/slices/defectCauseManagement';
import { useDispatch, useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

FactoryDefectCausesRegisterForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function FactoryDefectCausesRegisterForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  setSelectedDefectCauseId,
  setIsEdit
  // setSelectedSymptomClassId,
  // setCurrentSymptomClass
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { defectCauseDropdown, defectCauseDetailDropdown } = useSelector((state) => state.defectCausesManagement);
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');
  const [processDropDown,setProcessDropDown] = useState([])


  useEffect(() => {
    dispatch(getDefectCause())
    dispatch(getDefectCauseDetail())
  }, [dispatch])
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const handleRegister = () => {
    const params = {
      pk:{
          factoryCode: values.factory
      },
      defectCauseDetail:{
          factoryPk: defectCauseDetailDropdown.find(e => e.value === values.defectCauseName).factoryPk
      },
      rank: values.sortOrder,
      state: 'RUNNING'
    }
    if(values.processTypeName) {
      params.processTypeCode = {
        code: values.processTypeName
      }
    }
    if(values.processName){
      params.process = {
        factoryPk: values.processName
      }
    }
    if(values.productGroup){
      params.productGroup = {
        code: values.productGroup
      }   
    }
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: 'v1/factory-defect-cause/create',
          data: params,
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              if (res.data !== []) {
                formik.resetForm();
                formik.setSubmitting(false);
                onLoadData();
                setIsOpenConfirmModal(false);
                onCancel();
                enqueueSnackbar(translate(`message.factory_defect_causes_was_registered_successfully`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
              } else {
                setIsOpenConfirmModal(false);
                enqueueSnackbar(translate(`message.factory_defect_causes__was_registered_unsuccessfully`), {
                  variant: 'warning',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
              }
            }
          })
          .catch((error) => {
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else {
      try {
        mutate({
          url: '/v1/factory-defect-cause/update',
          data: {
            pk:{
                id: currentData.pk.id,
                factoryCode: currentData.pk.factoryCode
            },
            rank: values.sortOrder,
            state: values.state
        },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setSelectedDefectCauseId('')
              setIsEdit(false)
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.factory_defect_causes_was_updated_successfully`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
              // setCurrentSymptomClass({});
              // setSelectedSymptomClassId(null);
            }
          })
          .catch((error) => {
            formik.setSubmitting(false);
            formik.setErrors(error);
          });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }
  };
  const factoryDefectCausesSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    // processTypeName: Yup.string().required('Product Type Name is required'),
    causeClassName: Yup.string().required('Cause Class Name is required'),
    // sortOrder: Yup.string().required('Sort Order is required'),
    defectCauseName: Yup.string().required('Defect Cause Name is required'),
    // processName: Yup.string().required('Process Name is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory:  isEdit && currentData?.pk?.factoryCode || '',
      state: isEdit && currentData?.state || 'RUNNING',
      sortOrder: isEdit && currentData?.rank || '',
      productGroup: isEdit && currentData?.productGroup?.code || '',
      processTypeName: isEdit && currentData?.processTypeCode?.code || '',
      causeClassName: isEdit && currentData?.defectCauseDetail?.defectCauseClass?.code || '',
      causeClassCode: isEdit && currentData?.defectCauseDetail?.defectCauseClass?.code || '',
      defectCauseName: isEdit && currentData?.defectCauseDetail?.code || '',
      defectCauseCode: isEdit && currentData?.defectCauseDetail?.code || '',
      processName: isEdit && currentData?.process?.factoryPk || '',
      processCode: isEdit && currentData?.process?.name?.code || '',
    },
    validationSchema: factoryDefectCausesSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setValuesForm(values);
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  };
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
    setProcessDropDown(commonDropdown.processDropdown.filter((process) => process.factory === event?.target?.value));
  };

  const handleChangeProcessTypeName = (e,factory) => {
    if (!factory) {
      setProcessDropDown([]);
    } else {
      if (!e?.target?.value) {
        setProcessDropDown(commonDropdown.processDropdown.filter((process) => process.factory === factory));
      }
      if (e?.target.value) {
        const lines = commonDropdown.lineDropdown
          .filter((line) => line.processType === e.target.value && line.factory === factory)
          .map((current) => current.value);

        const process = commonDropdown.processDropdown.filter((process) => lines.includes(process.line));
        setProcessDropDown(process);
      }
    }
  }
  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('factory')}
                    id="factory"
                    name="factory"
                    label="Factory"
                    disabled={isEdit}
                    required
                    fullWidth
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('productGroup')}
                    id="productGroup"
                    name="productGroup"
                    label="Product Group"
                    onChange={handleChange}
                    disabled={isEdit}
                    groupId="D015000"
                    fullWidth
                    defaultValue=""
                    errorMessage={touched.productGroup && errors.productGroup}
                  />
                  <Dropdown
                    {...getFieldProps('processTypeName')}
                    id="processTypeName"
                    name="processTypeName"
                    label="Process Type Name"
                    // onChange={handleChange}
                    onChange = {(e) =>{
                      handleChange(e);
                      handleChangeProcessTypeName(e, values.factory);
                      setFieldValue('processName', '');
                      setFieldValue('processCode', '');
                    }}
                    disabled={isEdit}
                    fullWidth
                    groupId="D014000"
                    errorMessage={touched.processTypeName && errors.processTypeName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    // {...getFieldProps('causeClassName')}
                    id="causeClassName"
                    name="causeClassName"
                    label="Cause Class Name"
                    required
                    value={values.causeClassName}
                    fullWidth
                    onChange={(e) => {
                      setFieldValue('causeClassName', e.target.value)
                      setFieldValue('causeClassCode', defectCauseDropdown.find(el => el.code === e.target.value)?.code)
                    }}
                    disabled={isEdit}
                    options={defectCauseDropdown.filter((dc) => dc.pk?.factoryCode === values?.factory).map(e => ({
                      value: e.code, label: e.label
                    }))}
                    defaultValue=""
                    errorMessage={touched.causeClassName && errors.causeClassName}
                  />
                  <TextField
                    {...getFieldProps('causeClassCode')}
                    id="causeClassCode"
                    fullWidth
                    name="causeClassCode"
                    label="Cause Class Code"
                    errorMessage={touched.causeClassCode && errors.causeClassCode}
                    disabled
                  />
                  <TextField
                    // {...getFieldProps('sortOrder')}
                    id="sortOrder"
                    name="sortOrder"
                    label="Sort Order"
                    value={values.sortOrder}
                    fullWidth
                    onChange={handleChange}
                    errorMessage={touched.sortOrder && errors.sortOrder}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    // {...getFieldProps('defectCauseName')}
                    id="defectCauseName"
                    name="defectCauseName"
                    label="Defect Cause Name"
                    required
                    fullWidth
                    value={values.defectCauseName}
                    onChange={(e) => {
                      setFieldValue('defectCauseName', e.target.value)
                      setFieldValue('defectCauseCode', defectCauseDetailDropdown.find(el => el.code === e.target.value)?.code)
                    }}
                    disabled={isEdit}
                    options={defectCauseDetailDropdown.filter(e => e.codeDefectCause.code === values.causeClassName)}
                    defaultValue=""
                    errorMessage={touched.defectCauseName && errors.defectCauseName}
                  />
                  <TextField
                    {...getFieldProps('defectCauseCode')}
                    id="defectCauseCode"
                    name="defectCauseCode"
                    fullWidth
                    value={values.defectCauseCode}
                    label="Defect Cause Code"
                    // options={}
                    errorMessage={touched.defectCauseCode && errors.defectCauseCode}
                    disabled
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    fullWidth
                    name="state"
                    label="User (Y/N)"
                    value={values.state}
                    options={[
                      {value: 'RUNNING', label: 'Y'},
                      {value: 'HIDDEN', label: 'N'}
                    ]}
                    disabled={!isEdit}
                    onChange={handleChange}
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    // {...getFieldProps('processName')}
                    id="processName"
                    name="processName"
                    label="Process Name"
                    value={values.processName}
                    onChange={(e) => {
                      setFieldValue('processName', e.target.value)
                      setFieldValue('processCode', commonDropdown.processDropdown.find(el => el.value === e.target.value)?.code)
                    }}
                    disabled={isEdit}
                    values={values.processName}
                    fullWidth
                    options={processDropDown}
                    errorMessage={touched.processName && errors.processName}
                  />
                  <TextField
                    // {...getFieldProps('processCode')}
                    id="processCode"
                    name="processCode"
                    label="Process Code"
                    fullWidth
                    value={values.processCode}
                    errorMessage={touched.processCode && errors.processCode}
                    disabled
                  />
                  <TextField
                    fullWidth
                    disabled
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate('button.cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
            isEdit ? translate(`typo.modify`) : translate(`typo.register`)
          }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}