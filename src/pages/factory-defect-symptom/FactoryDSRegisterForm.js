import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';

import { useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { getFactoryAndIdByPk } from '../../utils/formatString';

// ----------------------------------------------------------------------

FactoryDSRegisterForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function FactoryDSRegisterForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  setFactoryDSId,
  setCurrentData
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');
  const [processDropdown, setProcessDropdown] = useState([]);
  const { registerDSClassNameDropdown, registerDSDetailNameDropdown } = useSelector(
    (state) => state.factoryDSManagement
  );
  const [currentClass, setCurrentClass] = useState(null);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [currentProcess, setCurrentProcess] = useState({
    code: '',
    value: ''
  });
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      let _data = {
        pk: {
          factoryCode: valuesForm?.factory
        },
        defectSymptomDetail: {
          factoryPk: valuesForm?.sympName
        },
        state: valuesForm?.state
      };
      if (valuesForm?.processName) {
        _data = {
          process: {
            factoryPk: valuesForm.processName
          },
          ..._data
        };
      }
      if (valuesForm?.processTypeName) {
        _data = {
          processType: {
            code: valuesForm.processTypeName
          },
          ..._data
        };
      }
      if (valuesForm?.productGroup) {
        _data = {
          productGroup: {
            code: valuesForm.productGroup
          },
          ..._data
        };
      }
      if (valuesForm?.level) {
        _data = {
          level: {
            code: valuesForm.level
          },
          ..._data
        };
      }
      if (valuesForm?.rank) {
        _data = {
          rank: Number(valuesForm.rank),
          ..._data
        };
      }
      try {
        mutate({
          url: '/v1/factory-symptom/create',
          data: _data,
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
                enqueueSnackbar(translate(`message.factory_ds_registered_success`), {
                  variant: 'success',
                  action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  )
                });
              } else {
                setIsOpenConfirmModal(false);
                enqueueSnackbar(translate(`message.factory_ds_registered_unsuccess`), {
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
      const { factoryCode, id } = getFactoryAndIdByPk(currentData.factoryPk);
      let _data = {
        rank: valuesForm?.rank || null,
        pk: {
          factoryCode,
          id: +id
        },
        state: valuesForm.state
      };
      if (valuesForm.level) {
        _data = {
          level: {
            code: valuesForm.level
          },
          ..._data
        };
      }
      try {
        mutate({
          url: '/v1/factory-symptom/update',
          data: _data,
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              formik.setSubmitting(false);
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.factory_ds_updated_success`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
              setCurrentData({});
              setFactoryDSId(null);
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
  const symptomClassRegSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),

    rank: Yup.string().matches(/^[0-9]*$/, 'Only number is accepted'),
    sympClsName: Yup.string().required('Symptom class name is required'),
    sympName: Yup.string().required('Defect symptom name is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.pk?.factoryCode) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      productGroup: (isEdit && currentData.productGroup?.code) || '',
      processTypeName: (isEdit && currentData.processType.code) || '',
      sympClsName: (isEdit && currentData.defectSymptomDetail?.defectSymptomClass.factoryPk) || '',

      sympName: (isEdit && currentData.defectSymptomDetail.factoryPk) || '',

      level: (isEdit && currentData.level?.code) || '',
      rank: (isEdit && currentData.rank) || '',
      processName: (isEdit && currentData.process?.factoryPk) || ''
    },
    validationSchema: symptomClassRegSchema,
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
    setProcessDropdown(commonDropdown.processDropdown.filter((process) => process.factory === event?.target?.value));
  };

  const handleChangeProcessTypeName = (e, factory) => {
    if (!factory) {
      setProcessDropdown([]);
    } else {
      if (!e?.target?.value) {
        setProcessDropdown(commonDropdown.processDropdown.filter((process) => process.factory === factory));
      }
      if (e?.target.value) {
        const lines = commonDropdown.lineDropdown
          .filter((line) => line.processType === e.target.value && line.factory === factory)
          .map((current) => current.value);

        const process = commonDropdown.processDropdown.filter((process) => lines.includes(process.line));
        setProcessDropdown(process);
      }
    }
  };

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm } =
    formik;
  console.log(commonDropdown.processDropdown);
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
                    required
                    onChange={(e) => {
                      handleChangeFactory(e);
                      setFieldValue('sympClsName', '');
                    }}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                    disabled={isEdit}
                  />
                  <Dropdown
                    {...getFieldProps('productGroup')}
                    id="productGroup"
                    name="productGroup"
                    label="Product Group"
                    onChange={handleChange}
                    groupId="D015000"
                    errorMessage={touched.productGroup && errors.productGroup}
                    disabled={isEdit}
                  />
                  <Dropdown
                    {...getFieldProps('processTypeName')}
                    id="processTypeName"
                    name="processTypeName"
                    label="Process Type Name"
                    onChange={(e) => {
                      handleChange(e);
                      handleChangeProcessTypeName(e, values.factory);
                      setFieldValue('processName', '');
                      setFieldValue('processCode', '');
                    }}
                    groupId="D014000"
                    disabled={isEdit}
                    errorMessage={touched.processTypeName && errors.processTypeName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('sympClsName')}
                    id="sympClsName"
                    name="sympClsName"
                    label="Sympt Class Name"
                    onChange={(e) => {
                      handleChange(e);
                      setCurrentClass(registerDSClassNameDropdown.find((dsClass) => dsClass.value === e?.target.value));
                      setFieldValue('sympName', '');
                    }}
                    options={registerDSClassNameDropdown.filter((dsClass) => values.factory === dsClass.factory)}
                    defaultValue=""
                    errorMessage={touched.sympClsName && errors.sympClsName}
                    disabled={isEdit}
                    required
                  />
                  <TextField
                    {...getFieldProps('sympClsCode')}
                    id="sympClsCode"
                    fullWidth
                    name="sympClsCode"
                    value={
                      !isEdit
                        ? values.sympClsName && currentClass?.code
                        : currentData?.defectSymptomDetail.defectSymptomClass.code
                    }
                    label="Sympt Class Code"
                    errorMessage={touched.sympClsCode && errors.sympClsCode}
                    disabled
                  />
                  <Dropdown
                    {...getFieldProps('level')}
                    id="level"
                    name="level"
                    label="Defect Level"
                    onChange={handleChange}
                    groupId="D056000"
                    errorMessage={touched.processTypeName && errors.processTypeName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('sympName')}
                    id="sympName"
                    name="sympName"
                    label="Defect Sympt Name"
                    onChange={(e) => {
                      handleChange(e);
                      setCurrentDetail(
                        registerDSDetailNameDropdown.find((dsDetail) => dsDetail.value === e?.target.value)
                      );
                    }}
                    required
                    options={registerDSDetailNameDropdown.filter((dsDetail) => values.sympClsName === dsDetail.class)}
                    errorMessage={touched.sympName && errors.sympName}
                    disabled={isEdit}
                  />
                  <TextField
                    {...getFieldProps('sympCode')}
                    id="sympCode"
                    fullWidth
                    name="sympCode"
                    label="Defect Sympt Code"
                    value={!isEdit ? values.sympName && currentDetail?.code : currentData?.defectSymptomDetail.code}
                    errorMessage={touched.sympCode && errors.sympCode}
                    disabled
                  />
                  <TextField
                    {...getFieldProps('rank')}
                    id="rank"
                    fullWidth
                    name="rank"
                    label="Sort Order"
                    error={Boolean(touched.rank && errors.rank)}
                    helperText={touched.rank && errors.rank}
                    onChange={handleChange}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('processName')}
                    id="processName"
                    name="processName"
                    label="Process Name"
                    onChange={(e) => {
                      handleChange(e);
                      setCurrentProcess(
                        commonDropdown.processDropdown.find((process) => process.value === e?.target?.value)
                      );
                    }}
                    options={processDropdown}
                    errorMessage={touched.processName && errors.processName}
                    disabled={isEdit}
                  />
                  <TextField
                    {...getFieldProps('processCode')}
                    id="processCode"
                    fullWidth
                    name="processCode"
                    label="Process Code"
                    value={
                      !isEdit ? (values?.processName && currentProcess?.code) || '' : currentData?.process.name.code
                    }
                    errorMessage={touched.processCode && errors.processCode}
                    disabled
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    required
                    onChange={handleChange}
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    defaultValue="RUNNING"
                    errorMessage={touched.state && errors.state}
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
