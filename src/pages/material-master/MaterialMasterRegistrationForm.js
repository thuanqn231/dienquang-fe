import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
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
import { useSelector } from '../../redux/store';
import { getSafeValue, isNullPk, isNullVal } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

MaterialMasterRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function MaterialMasterRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { unitIdDropdown } = useSelector((state) => state.unitIDManagement);
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const { commonCodes } = commonDropdown;
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [purchaser, setPurchaser] = useState({
    value: '',
    label: ''
  });
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    const currentUser = commonDropdown.userDropdown.filter((user) => user.value === currentData?.purchaser);
    setPurchaser({
      value: currentUser[0]?.value || '',
      label: currentUser[0]?.label || ''
    });
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
    onCancel();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const handleRegister = async () => {
    setSubmitting(true);
    if (!isEdit) {
      try {
        const matrType = commonCodes.filter((commonCode) => commonCode.groupId === 'D003000' && commonCode.code === values?.materialType);
        const createParams = {
          code: values?.materialCode.toUpperCase() || '',
          name: values?.materialName || '',
          materialId: values?.materialId || '',
          description: values?.materialDescription || '',
          spec: values?.materialSpec || '',
          materialGroup: {
            factoryPk: values?.materialGroup || ''
          },
          dom: {
            code: values?.domExp || ''
          },
          materialType: {
            code: values?.materialType || '',
            name: matrType[0]?.name || ''
          },
          prodType: {
            code: values?.procType || ''
          },
          purchaser: values?.purchaser || '',
          mrpType: {
            code: values?.mrpType || ''
          },
          price: {
            code: values?.priceControl || ''
          },
          status: {
            code: values?.planStatus || ''
          },
          qcStatus: values?.qcYN || '',
          safetyStock: values?.safetyStock || '',
          changeCycle: values?.changeCycle || '',
          transitTime: values?.transitTime || '',
          packingSize: values?.packingSize || '',
          expireDay: values?.expireDay || '',
          mainUnit: {
            factoryPk: values?.mainUnit || ''
          },
          convertRate: values?.convertRate || '',
          state: values?.state || 'RUNNING',
          pk: {
            factoryCode: values?.factory
          }
        };
        if (!isNullPk(values?.convertUnit)) {
          createParams.convertUnit = {
            factoryPk: values?.convertUnit
          };
        }
        if (!isNullPk(values?.defaultStock)) {
          createParams.stock = {
            factoryPk: values?.defaultStock || ''
          };
        }
        if (!isNullVal(values?.detailProc)) {
          createParams.detailProc = {
            code: values?.detailProc
          };
        }
        if (!isNullPk(values?.unitID)) {
          createParams.unitID = {
            factoryPk: values?.unitID
          };
        }
        if (!isNullPk(values?.mrpController)) {
          createParams.mrp = {
            factoryPk: values?.mrpController
          };
        }
        if (!isNullVal(values?.giUnit)) {
          createParams.giUnit = {
            code: values?.giUnit
          };
        }
        const response = await createUpdateData(`${BASE_URL}/create-auto-generate-material-id`, 'material', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_material_master_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          factoryPk: currentData.factoryPk,
          code: values?.materialCode.toUpperCase() || '',
          name: values?.materialName || '',
          materialId: values?.materialId || '',
          description: values?.materialDescription || '',
          spec: values?.materialSpec || '',
          materialGroup: {
            factoryPk: values?.materialGroup || ''
          },
          dom: {
            code: values?.domExp || ''
          },
          materialType: {
            code: values?.materialType || ''
          },
          prodType: {
            code: values?.procType || ''
          },
          purchaser: values?.purchaser || '',
          mrpType: {
            code: values?.mrpType || ''
          },
          price: {
            code: values?.priceControl || ''
          },
          status: {
            code: values?.planStatus || ''
          },
          qcStatus: values?.qcYN || '',
          safetyStock: values?.safetyStock || '',
          changeCycle: values?.changeCycle || '',
          transitTime: values?.transitTime || '',
          packingSize: values?.packingSize || '',
          expireDay: values?.expireDay || '',
          mainUnit: {
            factoryPk: values?.mainUnit || ''
          },
          convertRate: values?.convertRate || '',
          state: values?.state || 'RUNNING'
        };
        if (!isNullPk(values?.convertUnit)) {
          updateParams.convertUnit = {
            factoryPk: values?.convertUnit
          };
        }
        if (!isNullPk(values?.unitID)) {
          updateParams.unitID = {
            factoryPk: values?.unitID
          };
        }
        if (!isNullPk(values?.mrpController)) {
          updateParams.mrp = {
            factoryPk: values?.mrpController
          };
        }
        if (!isNullVal(values?.giUnit)) {
          updateParams.giUnit = {
            code: values?.giUnit
          };
        }
        if (!isNullVal(values?.qualityControlSize)) {
          updateParams.qualityControlSize = {
            code: values?.qualityControlSize
          };
        }
        if (!isNullVal(values?.detailProc)) {
          updateParams.detailProc = {
            code: values?.detailProc
          };
        }
        if (!isNullPk(values?.defaultStock)) {
          updateParams.stock = {
            factoryPk: values?.defaultStock
          };
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'material', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_material_master_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
  }

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      setPurchaser({
        value: "",
        label: ""
      })
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
  };

  const MaterialSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    materialCode: Yup.string().required('Material Code is required'),
    materialName: Yup.string().required('Material Name is required'),
    materialId: Yup.string(),
    materialType: Yup.string().required('Material Type is required'),
    materialDescription: Yup.string().required('Material Description is required'),
    materialSpec: Yup.string(),
    materialGroup: Yup.string().required('Material Group is required'),
    domExp: Yup.string().required('DOM/IMP is required'),
    procType: Yup.string().required('Proc. Type is required'),
    detailProc: Yup.string(),
    purchaser: Yup.string(),
    mrpType: Yup.string().required('MRP Type is required'),
    mrpController: Yup.string().required('MRP Controller is required'),
    priceControl: Yup.string().required('Price Control is required'),
    planStatus: Yup.string().required('Plant Status is required'),
    qcYN: Yup.string(),
    defaultStock: Yup.string(),
    safetyStock: Yup.number(),
    changeCycle: Yup.number(),
    transitTime: Yup.number(),
    packingSize: Yup.number(),
    expireDay: Yup.number(),
    mainUnit: Yup.string().required('Main Unit is required'),
    convertUnit: Yup.string(),
    convertRate: Yup.number(),
    giUnit: Yup.string(),
    qualityControlSize: Yup.string(),
    unitID: Yup.string(),
    state: Yup.string().required('Use (Y/N) is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      materialCode: (isEdit && currentData?.materialCode) || '',
      materialName: (isEdit && currentData?.materialName) || '',
      materialId: (isEdit && currentData?.materialId) || '',
      materialType: (isEdit && currentData?.materialType) || '',
      materialDescription: (isEdit && currentData?.materialDescription) || '',
      materialSpec: (isEdit && currentData?.materialSpec) || '',
      materialGroup: (isEdit && currentData?.materialGroup) || '',
      domExp: (isEdit && currentData?.domExp) || '',
      procType: (isEdit && currentData?.procType) || '',
      detailProc: (isEdit && currentData?.detailProc) || '',
      purchaser: (isEdit && currentData?.purchaser) || '',
      mrpType: (isEdit && currentData?.mrpType) || '',
      mrpController: (isEdit && currentData?.mrpController) || '',
      priceControl: (isEdit && currentData?.priceControl) || '',
      planStatus: (isEdit && currentData?.planStatus) || '',
      qcYN: (isEdit && currentData?.qcYN) || '',
      defaultStock: (isEdit && currentData?.defaultStock) || '',
      safetyStock: (isEdit && currentData?.safetyStock) || '',
      changeCycle: (isEdit && currentData?.changeCycle) || '',
      transitTime: (isEdit && currentData?.transitTime) || '',
      packingSize: (isEdit && currentData?.packingSize) || '',
      expireDay: (isEdit && currentData?.expireDay) || '',
      mainUnit: (isEdit && currentData?.mainUnit) || '',
      convertUnit: (isEdit && currentData?.convertUnit) || '',
      convertRate: (isEdit && currentData?.convertRate) || '',
      unitID: (isEdit && currentData?.unitID) || '',
      giUnit: (isEdit && currentData?.giUnit) || '',
      qualityControlSize: (isEdit && currentData?.qualityControlSize) || '',
      state: (isEdit && currentData?.state) || 'RUNNING'
    },
    validationSchema: MaterialSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, setSubmitting, setErrors } = formik;

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
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  {isEdit && (
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label={isEdit ? 'Material ID' : 'Material ID is auto generated'}
                      disabled
                      {...getFieldProps('materialId')}
                      error={Boolean(touched.materialId && errors.materialId)}
                      helperText={touched.materialId && errors.materialId}
                    />
                  )}
                  <Dropdown
                    {...getFieldProps('materialType')}
                    id="materialType"
                    name="materialType"
                    label="Material Type"
                    required
                    onChange={handleChange}
                    groupId="D003000"
                    excludes={['D003008']}
                    defaultValue=""
                    errorMessage={touched.materialType && errors.materialType}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Material Code"
                    required
                    disabled={isEdit}
                    {...getFieldProps('materialCode')}
                    error={Boolean(touched.materialCode && errors.materialCode)}
                    helperText={touched.materialCode && errors.materialCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Material Name"
                    required
                    {...getFieldProps('materialName')}
                    error={Boolean(touched.materialName && errors.materialName)}
                    helperText={touched.materialName && errors.materialName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Material Description"
                    required
                    {...getFieldProps('materialDescription')}
                    error={Boolean(touched.materialDescription && errors.materialDescription)}
                    helperText={touched.materialDescription && errors.materialDescription}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Material Spec"
                    required
                    {...getFieldProps('materialSpec')}
                    error={Boolean(touched.materialSpec && errors.materialSpec)}
                    helperText={touched.materialSpec && errors.materialSpec}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('materialGroup')}
                    id="materialGroup"
                    name="materialGroup"
                    label="Material Group"
                    required
                    onChange={handleChange}
                    options={commonDropdown.materialGroupDropdown.filter(
                      (matrGroup) => (matrGroup.factory = values.factory)
                    )}
                    defaultValue=""
                    errorMessage={touched.materialGroup && errors.materialGroup}
                  />
                  <Dropdown
                    {...getFieldProps('domExp')}
                    id="domExp"
                    name="domExp"
                    label="DOM/IMP"
                    required
                    onChange={handleChange}
                    groupId="D008000"
                    defaultValue=""
                    errorMessage={touched.domExp && errors.domExp}
                  />
                  <Dropdown
                    {...getFieldProps('procType')}
                    id="procType"
                    name="procType"
                    label="Proc. Type"
                    required
                    onChange={handleChange}
                    groupId="D010000"
                    defaultValue=""
                    errorMessage={touched.procType && errors.procType}
                  />
                  <Dropdown
                    {...getFieldProps('detailProc')}
                    id="detailProc"
                    name="detailProc"
                    label="Detail Proc"
                    onChange={handleChange}
                    groupId="D011000"
                    defaultValue=""
                    errorMessage={touched.detailProc && errors.detailProc}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Autocomplete
                    id="purchaser"
                    className="purchaser-select"
                    name="purchaser"
                    fullWidth
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    options={commonDropdown.userDropdown}
                    getOptionLabel={(option) => option.label}
                    value={purchaser}
                    onChange={(e, value) => {
                      setPurchaser(value);
                      setFieldValue('purchaser', getSafeValue(value?.value));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.purchaser && errors.purchaser)}
                        helperText={touched.purchaser && errors.purchaser}
                        name="purchaser"
                        label="Purchaser"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                  <Dropdown
                    {...getFieldProps('mrpType')}
                    id="mrpType"
                    name="mrpType"
                    label="MRP Type"
                    required
                    onChange={handleChange}
                    groupId="D009000"
                    defaultValue=""
                    errorMessage={touched.mrpType && errors.mrpType}
                  />
                  <Dropdown
                    {...getFieldProps('mrpController')}
                    id="mrpController"
                    name="mrpController"
                    label="MRP Controller"
                    required
                    onChange={handleChange}
                    options={commonDropdown.mrpControllerDropdown.filter((mrp) => (mrp.factory = values.factory))}
                    defaultValue=""
                    errorMessage={touched.mrpController && errors.mrpController}
                  />
                  <Dropdown
                    {...getFieldProps('priceControl')}
                    id="priceControl"
                    name="priceControl"
                    label="Price Control"
                    required
                    onChange={handleChange}
                    groupId="D012000"
                    defaultValue=""
                    errorMessage={touched.priceControl && errors.priceControl}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('planStatus')}
                    id="planStatus"
                    name="planStatus"
                    label="Plan Status"
                    required
                    onChange={handleChange}
                    groupId="D013000"
                    defaultValue=""
                    errorMessage={touched.planStatus && errors.planStatus}
                  />
                  <Dropdown
                    {...getFieldProps('qcYN')}
                    id="qcYN"
                    name="qcYN"
                    label="QC (Y/N)"
                    required
                    onChange={handleChange}
                    options={[
                      { label: 'Y', value: 'Y' },
                      { label: 'N', value: 'N' }
                    ]}
                    defaultValue=""
                    errorMessage={touched.qcYN && errors.qcYN}
                  />
                  <Dropdown
                    {...getFieldProps('defaultStock')}
                    id="defaultStock"
                    name="defaultStock"
                    label="Default Storage"
                    onChange={handleChange}
                    options={commonDropdown.stockDropdown}
                    defaultValue=""
                    errorMessage={touched.defaultStock && errors.defaultStock}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Safety Storage"
                    type="number"
                    {...getFieldProps('safetyStock')}
                    error={Boolean(touched.safetyStock && errors.safetyStock)}
                    helperText={touched.safetyStock && errors.safetyStock}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Change Cycle"
                    type="number"
                    {...getFieldProps('changeCycle')}
                    error={Boolean(touched.changeCycle && errors.changeCycle)}
                    helperText={touched.changeCycle && errors.changeCycle}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Transit Time"
                    type="number"
                    {...getFieldProps('transitTime')}
                    error={Boolean(touched.transitTime && errors.transitTime)}
                    helperText={touched.transitTime && errors.transitTime}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Packing Size"
                    type="number"
                    {...getFieldProps('packingSize')}
                    error={Boolean(touched.packingSize && errors.packingSize)}
                    helperText={touched.packingSize && errors.packingSize}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Expire Day"
                    type="number"
                    {...getFieldProps('expireDay')}
                    error={Boolean(touched.expireDay && errors.expireDay)}
                    helperText={touched.expireDay && errors.expireDay}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('mainUnit')}
                    id="mainUnit"
                    name="mainUnit"
                    label="Main Unit"
                    required
                    onChange={handleChange}
                    options={commonDropdown.uomDropdown.filter((uom) => (uom.factory = values.factory))}
                    defaultValue=""
                    errorMessage={touched.mainUnit && errors.mainUnit}
                  />
                  <Dropdown
                    {...getFieldProps('convertUnit')}
                    id="convertUnit"
                    name="convertUnit"
                    label="Convert Unit"
                    onChange={handleChange}
                    options={commonDropdown.uomDropdown.filter((uom) => (uom.factory = values.factory))}
                    defaultValue=""
                    errorMessage={touched.convertUnit && errors.convertUnit}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Convert Rate"
                    type="number"
                    {...getFieldProps('convertRate')}
                    error={Boolean(touched.convertRate && errors.convertRate)}
                    helperText={touched.convertRate && errors.convertRate}
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

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('giUnit')}
                    id="giUnit"
                    name="giUnit"
                    label="G/I Unit"
                    onChange={handleChange}
                    groupId="D039000"
                    defaultValue=""
                    errorMessage={touched.giUnit && errors.giUnit}
                  />
                  <Dropdown
                    {...getFieldProps('unitID')}
                    id="unitID"
                    name="unitID"
                    label="Unit ID"
                    onChange={handleChange}
                    options={unitIdDropdown.filter((unitId) => unitId.factory === values.factory)}
                    defaultValue=""
                    errorMessage={touched.unitID && errors.unitID}
                  />
                  <Dropdown
                    {...getFieldProps('qualityControlSize')}
                    id="qualityControlSize"
                    name="qualityControlSize"
                    label="QC Size"
                    onChange={handleChange}
                    groupId="D064000"
                    defaultValue=""
                    errorMessage={touched.qualityControlSize && errors.qualityControlSize}
                  />
                </Stack>
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
