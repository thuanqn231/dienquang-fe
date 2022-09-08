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
import { getSafeValue } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
// utils
import { getGridConfig } from '../../utils/pageConfig';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ProductionGiPlanRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  selectedGiId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  onCreateGiSuccess: PropTypes.func
};

const tableCode = 'productionGiPlanRegistrationForm';
const curDateTime = fDate(new Date());

export default function ProductionGiPlanRegistrationForm({
  isEdit,
  selectedGiId,
  onCancel,
  onLoadData,
  pageCode,
  isOpenActionModal,
  onCreateGiSuccess
}) {
  const { productionOrderDropdown } = useSelector((state) => state.productionOrderManagement);
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [disabledEdit, setDisabledEdit] = useState(true);
  const [rowIndex, setRowIndex] = useState(1);
  const [currentData, setCurrentData] = useState({});
  const [prodOrderNo, setProdOrderNo] = useState({
    value: '',
    label: ''
  });
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
        url: `/v1/gi/production/${selectedGiId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          if (data) {
            const prodOrderNoFactoryPk = data?.plan?.factoryPk;
            const currentProdOrder = productionOrderDropdown.filter(
              (prodOrder) => prodOrder.value === prodOrderNoFactoryPk
            );
            const prodOrder = currentProdOrder[0];

            const materialFactoryPk = data?.material?.factoryPk;
            const currentMaterial = materialDropdown.filter((matr) => matr.value === materialFactoryPk);
            const material = currentMaterial[0];
            setCurrentData({
              factoryPk: data?.factoryPk,
              factory: data?.pk?.factoryCode,
              planId: data?.planId,
              planDate: data?.planDate,
              prodOrderNoFactoryPk,
              materialCode: materialFactoryPk,
              materialDescription: data?.material?.description,
              materialId: data?.material?.materialId,
              planQty: data?.planQty || 0,
              line: data?.line?.factoryPk,
              giType: data?.giType?.code,
              process: data?.line?.processType?.code,
              remark: data?.remark
            });
            if (prodOrder) {
              setProdOrderNo(prodOrder);
              setMaterialCode(material);
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedGiId]);

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

  const handleChangeProdOrderNo = (prodOrder) => {
    const currentProdOrder = productionOrderDropdown.filter((po) => po.value === prodOrder?.value);
    setProdOrderNo(currentProdOrder[0] || { value: '', label: '' });
    setFieldValue('prodOrderNo', getSafeValue(prodOrder?.value));
    setFieldValue('line', getSafeValue(prodOrder?.linePk));
    setFieldValue('process', getSafeValue(prodOrder?.processByLinePk));
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
    const currentLine = values.line;
    const currentGiType = values.giType;
    const currentProdOrderNo = values.prodOrderNo;
    const currentProcessType = values.process;

    const currentProdOrderNoObj = productionOrderDropdown.filter(
      (prodOrder) => prodOrder.value === currentProdOrderNo
    );
    const currentFactoryObj = commonDropdown.factoryDropdown.filter((factory) => factory.value === currentFactory);
    const currentGiTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentGiType);
    const currentMaterialCodeObj = materialDropdown.filter((model) => model.value === currentMaterialCode);
    const currentLineObj = commonDropdown.lineDropdown.filter((line) => line.value === currentLine);
    const currentProcessTypeObj = commonDropdown.commonCodes.filter(
      (commonCode) => commonCode.code === currentProcessType
    );

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
      displayOnly: {
        process: {
          code: values.process,
          name: currentProcessTypeObj[0].name
        }
      },
      productionOrder: {
        factoryPk: currentProdOrderNo,
        prodOrderNo: currentProdOrderNoObj[0].label
      },
      line: {
        factoryPk: currentLine,
        name: currentLineObj[0].label
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
        name: currentGiTypeObj[0].name
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
    clearProdOrderNo();
    clearMaterial();
    setSubmitting(false);
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = () => {
    onLoadProductionOrderData();
  };

  const onLoadProductionOrderData = async () => {
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
    const currentPlanPk = getSafeValue(data?.plan?.factoryPk);
    const currentPlan = productionOrderDropdown.filter((plan) => plan.value === currentPlanPk);
    const currentMaterialPk = getSafeValue(data?.material?.factoryPk);
    const currentMaterial = materialDropdown.filter((matr) => matr.value === currentMaterialPk);
    setFieldValue('factory', getSafeValue(data?.factory));
    setFieldValue('planDate', getSafeValue(data?.planDate));
    setFieldValue('giType', getSafeValue(data?.giType?.code));
    setFieldValue('prodOrderNo', currentPlanPk);
    setFieldValue('planQty', getSafeValue(data?.planQty));
    setFieldValue('remark', getSafeValue(data?.remark));
    setFieldValue('materialCode', currentMaterialPk);
    setFieldValue('materialId', getSafeValue(data?.material?.materialId));
    setFieldValue('materialDescription', getSafeValue(data?.material?.materialDescription));
    setFieldValue('process', getSafeValue(data?.displayOnly?.process?.code));
    setFieldValue('line', getSafeValue(data?.line?.factoryPk));
    setProdOrderNo(currentPlan[0] || { value: '', label: '' });
    setMaterialCode(currentMaterial[0] || { value: '', label: '' });
  };

  const clearOldValue = () => {
    resetForm();
    clearProdOrderNo();
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
      const currentLine = values.line;
      const currentProdOrderNo = values.prodOrderNo;

      const currentFactoryObj = commonDropdown.factoryDropdown.filter((factory) => factory.value === currentFactory);
      const currentMaterialCodeObj = materialDropdown.filter((model) => model.value === currentMaterialCode);
      const currentGiTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentGiType);
      const currentLineObj = commonDropdown.lineDropdown.filter((line) => line.value === currentLine);
      const currentProdOrderNoObj = productionOrderDropdown.filter(
        (prodOrder) => prodOrder.value === currentProdOrderNo
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
        line: {
          factoryPk: currentLine,
          name: currentLineObj[0].label
        },
        plan: {
          factoryPk: currentProdOrderNo,
          prodOrderNo: currentProdOrderNoObj[0].label
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

  const clearProdOrderNo = () => {
    setProdOrderNo({
      value: '',
      label: ''
    });
  };

  const clearMaterial = () => {
    setMaterialCode({
      value: '',
      label: ''
    });
  };

  const onSavePurchaseGiPlan = () => {
    setSubmitting(true);
    if (!isEdit) {
      rowData.forEach((row) => {
        delete row.factoryPk;
        delete row.displayOnly;
      });
      try {
        mutate({
          url: '/v1/gi/production/create-v2',
          data: {
            productionGIList: rowData
          },
          method: 'post',
          featureCode: 'user.create',
          isShowMessage: false
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              resetForm();
              setSubmitting(false);
              clearProdOrderNo();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              onCreateGiSuccess(res.data[0].planId);
              enqueueSnackbar(translate(`message.register_production_G/I_plan_successful`), {
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
    } else {
      try {
        mutate({
          url: '/v1/gi/production/update',
          data: {
            productionGI: {
              factoryPk: currentData?.factoryPk,
              planDate: values.planDate,
              plan: {
                factoryPk: values.prodOrderNo
              },
              line: {
                factoryPk: values.line
              },
              material: {
                factoryPk: values.materialCode
              },
              giType: {
                code: values.giType
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
              clearProdOrderNo();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.update_production_G/I_plan_successful`), {
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
  const ProductionGiPlanSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    planId: Yup.string(),
    materialCode: Yup.string().required('Material Code is required'),
    materialVersion: Yup.string(),
    prodOrderNo: Yup.string().required('Production Order Number is required'),
    materialDescription: Yup.string(),
    materialId: Yup.string(),
    planQty: Yup.number().min(1, 'Plan Qty must greater than 0'),
    line: Yup.string(),
    planDate: Yup.date().required('Plan Date is required'),
    poPlanQty: Yup.number(),
    poActualQty: Yup.number(),
    giQty: Yup.number(),
    giType: Yup.string().required('G/I Type is required'),
    process: Yup.string(),
    remark: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      planId: (isEdit && currentData?.planId) || '',
      materialCode: (isEdit && currentData?.materialCode) || '',
      materialVersion: (isEdit && currentData?.materialVersion) || '',
      prodOrderNo: (isEdit && currentData?.prodOrderNoFactoryPk) || '',
      materialDescription: (isEdit && currentData?.materialDescription) || '',
      materialId: (isEdit && currentData?.materialId) || '',
      planQty: (isEdit && currentData?.planQty) || 0,
      line: (isEdit && currentData?.line) || '',
      planDate: (isEdit && currentData?.planDate) || curDateTime,
      poPlanQty: (isEdit && currentData?.poPlanQty) || 0,
      poActualQty: (isEdit && currentData?.poActualQty) || 0,
      giQty: (isEdit && currentData?.giQty) || 0,
      giType: (isEdit && currentData?.giType) || '',
      process: (isEdit && currentData?.process) || '',
      remark: (isEdit && currentData?.remark) || ''
    },
    validationSchema: ProductionGiPlanSchema,
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
      clearProdOrderNo();
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
            {translate(`typo.production_G/I_plan_detail`)}
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
                      disabled={!isEmpty(rowData) || isEdit}
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
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
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Autocomplete
                      id="prodOrderNo"
                      className="prodOrderNo-select"
                      name="prodOrderNo"
                      fullWidth
                      options={productionOrderDropdown.filter((matr) => matr.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={prodOrderNo}
                      onChange={(e, value) => {
                        handleChangeProdOrderNo(value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.prodOrderNo && errors.prodOrderNo)}
                          helperText={touched.prodOrderNo && errors.prodOrderNo}
                          name="prodOrderNo"
                          label="Prod. Order No"
                          variant="outlined"
                          fullWidth
                          required
                          size="small"
                        />
                      )}
                    />
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
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="G/I Plan Qty"
                      size="small"
                      type="number"
                      required
                      {...getFieldProps('planQty')}
                      error={Boolean(touched.planQty && errors.planQty)}
                      helperText={touched.planQty && errors.planQty}
                    />
                    <Dropdown
                      {...getFieldProps('line')}
                      id="line"
                      name="line"
                      label="Line Info"
                      size="small"
                      required
                      onChange={(e) => {
                        const lineVal = e?.target?.value;
                        const { processType } = commonDropdown.lineDropdown.filter((line) => line.value === lineVal)[0];
                        setFieldValue('line', lineVal);
                        setFieldValue('process', processType);
                      }}
                      options={commonDropdown.lineDropdown.filter((line) => line.factory === values.factory)}
                      errorMessage={touched.line && errors.line}
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
                      {...getFieldProps('process')}
                      id="process"
                      name="process"
                      label="Process Type"
                      size="small"
                      disabled
                      onChange={handleChange}
                      groupId="D014000"
                      errorMessage={touched.process && errors.process}
                    />
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
            <LoadingButton type="button" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." onClick={onSavePurchaseGiPlan}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
