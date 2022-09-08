import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// redux
import { useSelector } from '../../redux/store';

// utils
import { getGridConfig } from '../../utils/pageConfig';
import { getSafeValue } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ShippingGiPlanRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  selectedGiId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  onCreateGiSuccess: PropTypes.func
};

const tableCode = 'shippingGiPlanRegistrationForm';
const curDateTime = fDate(new Date());

export default function ShippingGiPlanRegistrationForm({
  isEdit,
  selectedGiId,
  onCancel,
  onLoadData,
  pageCode,
  isOpenActionModal,
  onCreateGiSuccess
}) {
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { bizPartnerCodeSingleDropdown } = useSelector((state) => state.bizPartnerManagement);

  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const [columns, setColumns] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [disabledEdit, setDisabledEdit] = useState(true);
  const [rowData, setRowData] = useState(null);
  const [rowIndex, setRowIndex] = useState(1);
  const [currentData, setCurrentData] = useState({});
  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [header, setHeader] = useState({
    factory: ''
  });
  const { translate, currentLang } = useLocales();

  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, tableCode);
    setColumns(tableConfigs);
  }, []);

  useEffect(() => {
    if (!isEmpty(selectedGiId) && isEdit && isOpenActionModal) {
      query({
        url: `/v1/gi/shipping/${selectedGiId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;

          if (data) {
            const materialFactoryPk = data?.material?.factoryPk;
            const currentMaterial = materialDropdown.filter((matr) => matr.value === materialFactoryPk);

            setCurrentData({
              factoryPk: data?.factoryPk,
              factory: data?.pk?.factoryCode,
              planId: data?.planId,
              planDate: data?.planDate,
              soNo: data?.soNo,
              materialCode: materialFactoryPk,
              supplier: data?.supplier?.factoryPk,
              materialDescription: data?.material?.description,
              materialId: data?.material?.materialId,
              planQty: data?.planQty || 0,
              giType: data?.giType?.code,
              remark: data?.remark
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedGiId]);

  useEffect(() => {
    if (isEdit) {
      const materialValue = currentData?.materialCode || '';
      const currentMaterial = materialDropdown.filter((material) => material.value === materialValue);

      setMaterialCode({
        value: currentMaterial[0]?.value || '',
        label: currentMaterial[0]?.label || ''
      });
    }
  }, [currentData]);
  const handleOpenConfirmModal = () => {
    if (!isEmpty(rowData) || isEdit) {
      setIsOpenConfirmModal(true);
    } else {
      enqueueSnackbar(translate(`message.please_add_at_least_1_purchase_G/I_plan`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleChangeMaterialCode = (materialCode) => {
    const currentMaterialCode = materialDropdown.filter((matr) => matr.value === materialCode);
    setMaterialCode(currentMaterialCode[0] || { value: '', label: '' });
    setFieldValue('materialCode', getSafeValue(materialCode));
    setFieldValue('materialDescription', getSafeValue(currentMaterialCode[0]?.materialDescription));
    setFieldValue('materialId', getSafeValue(currentMaterialCode[0]?.materialId));
  };

  const handleAddGiPlan = () => {
    setSubmitting(true);
    validateForm();
    const newRowData = [...rowData];

    const currentFactory = values.factory;
    const currentMaterialCode = values.materialCode;
    const currentSupplier = values.supplier;
    const currentGiType = values.giType;

    const currentFactoryObj = commonDropdown.factoryDropdown.filter((factory) => factory.value === currentFactory);
    const currentGiTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentGiType);

    const currentSupplierObj = bizPartnerCodeSingleDropdown.filter((supplier) => supplier.value === currentSupplier);

    const currentMaterialCodeObj = materialDropdown.filter((model) => model.value === currentMaterialCode);

    newRowData.push({
      factoryPk: `tmpId${rowIndex}`,
      planDate: values.planDate,
      factory: currentFactory,
      approvalStatus: {
        code: 'D018001'
      },
      giStatus: {
        code: 'D019001'
      },
      soNo: values.soNo,
      supplier: {
        factoryPk: currentSupplier,
        name: currentSupplierObj[0].label
      },
      material: {
        factoryPk: currentMaterialCode,
        code: currentMaterialCodeObj[0]?.materialCode,
        materialId: values.materialId,
        materialDescription: values.materialDescription
      },
      planQty: values.planQty,
      giType: {
        code: currentGiType,
        name: currentGiTypeObj[0]?.name
      },
      remark: values.remark,
      pk: {
        factoryCode: currentFactory,
        factoryName: currentFactoryObj[0].label
      },
      state: 'RUNNING'
    });
    setHeader({
      factory: currentFactory
    });
    updateData(newRowData);
    setRowIndex(rowIndex + 1);
    resetForm();
    setFieldValue('factory', currentFactory);

    clearMaterial();
    setSubmitting(false);
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = () => {
    onLoadShippingOrderData();
  };

  const onLoadShippingOrderData = async () => {
    setSelectedRowId(null);
    const response = [];
    updateData(response);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      clearOldValue();
      setSelectedRowId(null);
      setDisabledEdit(true);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;

      setFieldsData(event.api.getSelectedNodes()[0].data);

      setSelectedRowId(selectedId);
      setDisabledEdit(false);
      //
    }
  };

  const setFieldsData = (data) => {
    const currentMaterialPk = getSafeValue(data?.material?.factoryPk);
    const currentMaterial = materialDropdown.filter((matr) => matr.value === currentMaterialPk);
    const currentSupplierPk = getSafeValue(data?.supplier?.factoryPk);
    setFieldValue('factory', getSafeValue(data?.factory));
    setFieldValue('planDate', getSafeValue(data?.planDate));
    setFieldValue('supplier', currentSupplierPk);
    setFieldValue('giType', getSafeValue(data?.giType?.code));
    setFieldValue('soNo', getSafeValue(data?.soNo));
    setFieldValue('planQty', getSafeValue(data?.planQty));
    setFieldValue('remark', getSafeValue(data?.remark));
    setFieldValue('materialCode', currentMaterialPk);
    setFieldValue('materialId', getSafeValue(data?.material?.materialId));
    setFieldValue('materialDescription', getSafeValue(data?.material?.materialDescription));
    setMaterialCode(currentMaterial[0] || { value: '', label: '' });
  };

  const clearOldValue = () => {
    resetForm();

    clearMaterial();
    setFieldValue('factory', header.factory);
    setSelectedRowId(null);
    setDisabledEdit(true);
  };

  const onClickModify = () => {
    if (selectedRowId) {
      const currentRowData = [...rowData];
      const selectedIdx = currentRowData.findIndex((row) => row.factoryPk === selectedRowId);

      const currentFactory = values.factory;
      const currentMaterialCode = values.materialCode;
      const currentGiType = values.giType;
      const currentSupplier = values.supplier;

      const currentFactoryObj = commonDropdown.factoryDropdown.filter((factory) => factory.value === currentFactory);
      const currentMaterialCodeObj = materialDropdown.filter((model) => model.value === currentMaterialCode);
      const currentGiTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentGiType);
      const currentSupplierCodeObj = bizPartnerCodeSingleDropdown.filter(
        (supplier) => supplier.value === currentSupplier
      );

      currentRowData[selectedIdx] = {
        ...currentRowData[selectedIdx],
        planDate: values.planDate,
        factory: values.factory,
        material: {
          factoryPk: currentMaterialCode,
          code: currentMaterialCodeObj[0]?.materialCode,
          materialId: values.materialId,
          materialDescription: values.materialDescription
        },
        giType: {
          code: currentGiType,
          name: currentGiTypeObj[0].name
        },
        soNo: values.soNo,
        supplier: {
          factoryPk: currentSupplier,
          name: currentSupplierCodeObj[0].label
        },
        planQty: values.planQty,
        remark: values.remark,
        pk: {
          factoryCode: currentFactory,
          factoryName: currentFactoryObj[0].label
        }
      };

      updateData(currentRowData);
      clearOldValue();
    } else {
      enqueueSnackbar(translate(`message.please_select_at_least_1_row`), {
        variant: 'success',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const onClickDelete = () => {
    if (selectedRowId) {
      const currentRowData = rowData.filter((data) => data.factoryPk !== selectedRowId);
      updateData(currentRowData);
      if (isEmpty(currentRowData)) {
        setHeader({
          factory: ''
        });
      }
      clearOldValue();
    } else {
      enqueueSnackbar(translate(`message.please_select_at_least_1_row`), {
        variant: 'success',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const clearMaterial = () => {
    setMaterialCode({
      value: '',
      label: ''
    });
  };

  const onSaveShippingGiPlan = () => {
    setSubmitting(true);
    if (!isEdit) {
      rowData.forEach((row) => {
        delete row.factoryPk;
        delete row.displayOnly;
      });
      try {
        mutate({
          url: '/v1/gi/shipping/create-v2',
          data: {
            shippingGIList: rowData
          },
          method: 'post',
          featureCode: 'user.create',
          isShowMessage: false
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              resetForm();
              setSubmitting(false);

              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              onCreateGiSuccess(res.data[0].planId);
            }
          })
          .catch((error) => {
            setSubmitting(false);
            setErrors(error);
          });
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    } else {
      try {
        mutate({
          url: '/v1/gi/shipping/update',
          data: {
            shippingGI: {
              factoryPk: currentData?.factoryPk,
              planDate: values.planDate,

              material: {
                factoryPk: values.materialCode
              },
              soNo: values.soNo,
              giType: {
                code: values.giType
              },
              supplier: {
                factoryPk: values.supplier
              },
              planQty: values.planQty,
              remark: values.remark,
              pk: {
                factoryCode: values.factory
              },
              state: 'RUNNING'
            }
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              resetForm();
              setSubmitting(false);

              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.update_shipping_G/I_plan_successful`), {
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
            setSubmitting(false);
            setErrors(error);
          });
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    }
  };
  const ShippingGiPlanSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    materialCode: Yup.string().required('Material Code is required'),
    planId: Yup.string(),
    materialDescription: Yup.string(),
    materialId: Yup.string(),
    planQty: Yup.number().min(1, 'Plan Qty must greater than 0'),
    planDate: Yup.date().required('Plan Date is required'),
    soNo: Yup.string(),
    supplier: Yup.string().required('Customer is required'),
    giType: Yup.string().required('G/I Type is required'),
    remark: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      planId: (isEdit && currentData?.planId) || '',
      materialCode: (isEdit && currentData?.materialCode) || '',
      materialDescription: (isEdit && currentData?.materialDescription) || '',
      materialId: (isEdit && currentData?.materialId) || '',
      planQty: (isEdit && currentData?.planQty) || 0,
      planDate: (isEdit && currentData?.planDate) || curDateTime,
      supplier: (isEdit && currentData?.supplier) || '',
      giType: (isEdit && currentData?.giType) || '',
      soNo: (isEdit && currentData?.soNo) || '',
      remark: (isEdit && currentData?.remark) || ''
    },
    validationSchema: ShippingGiPlanSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (isEdit) {
          setSubmitting(true);
          handleOpenConfirmModal();
        } else {
          handleAddGiPlan();
        }
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
      clearMaterial();
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

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    resetForm,
    validateForm,
    setSubmitting,
    setErrors
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.shipping_G/I_plan_detail`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      size="small"
                      required
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                      disabled={!isEmpty(rowData) || isEdit}
                    />
                    {isEdit && (
                      <TextField
                        autoComplete="off"
                        fullWidth
                        id="planId"
                        name="planId"
                        label="Plan ID"
                        size="small"
                        disabled
                        {...getFieldProps('planId')}
                      />
                    )}
                    <Autocomplete
                      id="materialCode"
                      className="materialCode-select"
                      name="materialCode"
                      fullWidth
                      options={materialDropdown.filter((matr) => matr.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={materialCode}
                      onChange={(e, value) => {
                        handleChangeMaterialCode(value?.value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.materialCode && errors.materialCode)}
                          helperText={touched.materialCode && errors.materialCode}
                          name="materialCode"
                          label="Material Code"
                          variant="outlined"
                          fullWidth
                          required
                          size="small"
                        />
                      )}
                    />
                    <DthDatePicker
                      name="planDate"
                      label="Plan Date"
                      value={values.planDate}
                      onChange={(newValue) => {
                        setFieldValue('planDate', fDate(newValue));
                      }}
                      minDate={curDateTime}
                      fullWidth
                      size="small"
                      required
                      errorMessage={touched.planDate && errors.planDate}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Description"
                      size="small"
                      disabled
                      {...getFieldProps('materialDescription')}
                      error={Boolean(touched.materialDescription && errors.materialDescription)}
                      helperText={touched.materialDescription && errors.materialDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material ID"
                      size="small"
                      disabled
                      {...getFieldProps('materialId')}
                      error={Boolean(touched.materialId && errors.materialId)}
                      helperText={touched.materialId && errors.materialId}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Qty"
                      size="small"
                      type="number"
                      required
                      {...getFieldProps('planQty')}
                      error={Boolean(touched.planQty && errors.planQty)}
                      helperText={touched.planQty && errors.planQty}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('giType')}
                      id="giType"
                      name="giType"
                      label="G/I Type"
                      size="small"
                      required
                      onChange={handleChange}
                      groupId="D020000"
                      errorMessage={touched.giType && errors.giType}
                    />
                    <Dropdown
                      id="supplier"
                      name="supplier"
                      label="Customer"
                      size="small"
                      required
                      onChange={handleChange}
                      allowEmptyOption={false}
                      options={bizPartnerCodeSingleDropdown.filter((biz) => biz.factory === values.factory)}
                      errorMessage={touched.supplier && errors.supplier}
                      {...getFieldProps('supplier')}
                    />
                    <TextField autoComplete="off" fullWidth label="SO No" size="small" {...getFieldProps('soNo')} />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Remark"
                      size="small"
                      {...getFieldProps('remark')}
                      error={Boolean(touched.remark && errors.remark)}
                      helperText={touched.remark && errors.remark}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        {!isEdit && (
          <Card sx={{ pb: 1, height: '30vh', minHeight: { xs: '30vh' } }}>
            <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                loading={isSubmitting}
                loadingIndicator="Loading..."
                disabled={!disabledEdit}
              >
                {translate(`button.add`)}
              </LoadingButton>
              <Button
                sx={{ marginLeft: 1 }}
                variant="contained"
                onClick={onClickModify}
                size="small"
                label="Modify"
                disabled={disabledEdit}
              >
                {translate(`button.modify`)}
              </Button>
              <Button
                sx={{ marginLeft: 1 }}
                variant="contained"
                onClick={onClickDelete}
                size="small"
                label="Delete"
                disabled={disabledEdit}
              >
                {translate(`button.delete`)}
              </Button>
            </Stack>
            <AgGrid
              columns={columns}
              rowData={rowData}
              className={themeAgGridClass}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              rowSelection="single"
              width="100%"
              height="85%"
            />
          </Card>
        )}
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          {!isEdit && (
            <Button type="button" variant="contained" onClick={handleOpenConfirmModal}>
              {translate(`button.register`)}
            </Button>
          )}
          {isEdit && (
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={isSubmitting}
              loadingIndicator="Processing..."
            >
              {translate(`button.modify`)}
            </LoadingButton>
          )}
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
            }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="button"
              variant="contained"
              loading={isSubmitting}
              loadingIndicator="Processing..."
              onClick={onSaveShippingGiPlan}
            >
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
