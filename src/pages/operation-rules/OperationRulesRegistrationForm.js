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
import { useDispatch, useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

OperationRulesRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  setSelectedOperationRulesId: PropTypes.func,
  setCurrentOperationRules: PropTypes.func,
};

export default function OperationRulesRegistrationForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  setSelectedOperationRulesId,
  setCurrentOperationRule
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const { translate } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');
  const [excludeDetailTypes, setExcludeDetailTypes] = useState([]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/operation-rules/create',
          data: {
            operationRules: {
              operationType: {
                code: valuesForm.operationType
              },
              detailOperationType: {
                code: valuesForm.detailOperationType
              },
              materialType: {
                code: valuesForm.materialType
              },
              labelType: {
                code: valuesForm.labelType
              },
              rules: {
                code: valuesForm.rules
              },
              state: valuesForm.state,
              pk: {
                factoryCode: valuesForm.factory
              }
            }
          },
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
              enqueueSnackbar(translate(`message.operation_rule_was_registered_successfully`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          })
          .catch((error) => {
            console.error(error);
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
          url: '/v1/operation-rules/update',
          data: {
            operationRules: {
              factoryPk: currentData.factoryPk,
              operationType: {
                code: valuesForm.operationType
              },
              detailOperationType: {
                code: valuesForm.detailOperationType
              },
              materialType: {
                code: valuesForm.materialType
              },
              labelType: {
                code: valuesForm.labelType
              },
              rules: {
                code: valuesForm.rules
              },
              state: valuesForm.state,
              pk: {
                factoryCode: valuesForm.factory
              }
            }
          },
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
              enqueueSnackbar(translate(`message.operation_rule_was_modified_successfully`), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
              setCurrentOperationRule({});
              setSelectedOperationRulesId(null);
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
  const operationRuleSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    detailOperationType: Yup.string().required('Detail operation type is required'),
    operationType: Yup.string().required('Operation type is required'),
    materialType: Yup.string().required('Material type is required'),
    labelType: Yup.string().required('Label type is required'),
    rules: Yup.string().required('Rules is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      detailOperationType: (isEdit && currentData?.detailOperationType) || '',
      operationType: (isEdit && currentData?.operationType) || '',
      materialType: (isEdit && currentData?.materialType) || '',
      labelType: (isEdit && currentData?.labelType) || '',
      rules: (isEdit && currentData?.rules) || '',
    },
    validationSchema: operationRuleSchema,
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

  const onChangeOperationType = (type) => {
    let excludes = [];
    switch (type) {
      case 'D048001':
        excludes = ['D026002', 'D026007', 'D026011', 'D026003', 'D026004', 'D026005', 'D026006', 'D026009'];
        break;
      case 'D048002':
        excludes = ['D026001', 'D026008', 'D026010', 'D026003', 'D026004', 'D026005', 'D026006', 'D026009'];
        break;
      default:
        excludes = ['D026001', 'D026002', 'D026007', 'D026008', 'D026010', 'D026011'];
        break;
    }
    setExcludeDetailTypes(excludes);
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
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    fullWidth
                    id="operationType"
                    name="operationType"
                    label="Operation Type"
                    required
                    {...getFieldProps('operationType')}
                    onChange={(e) => {
                      setFieldValue("operationType", e.target.value);
                      onChangeOperationType(e.target.value);
                    }}
                    errorMessage={touched.operationType && errors.operationType}
                    groupId='D048000'

                  />
                  <Dropdown
                    fullWidth
                    id="detailOperationType"
                    name="detailOperationType"
                    label="Detail Operation Type"
                    required
                    {...getFieldProps('detailOperationType')}
                    onChange={handleChange}
                    groupId='D026000'
                    excludes={excludeDetailTypes}
                    errorMessage={touched.detailOperationType && errors.detailOperationType}
                  />
                  <Dropdown
                    id="materialType"
                    name="materialType"
                    label="Material Type"
                    fullWidth
                    required
                    {...getFieldProps('materialType')}
                    onChange={handleChange}
                    groupId='D003000'
                    errorMessage={touched.materialType && errors.materialType}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>


                  <Dropdown
                    id="labelType"
                    name="labelType"
                    label="Label Type"
                    fullWidth
                    required
                    {...getFieldProps('labelType')}
                    allowEmptyOption={false}
                    onChange={handleChange}
                    groupId='D020000'
                    errorMessage={touched.labelType && errors.labelType}
                  />

                  <Dropdown
                    id="rules"
                    name="rules"
                    label="Rules"
                    fullWidth
                    required
                    {...getFieldProps('rules')}
                    allowEmptyOption={false}
                    onChange={handleChange}
                    groupId='D049000'
                    errorMessage={touched.rules && errors.rules}
                  />

                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    required
                    allowEmptyOption={false}
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
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
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
