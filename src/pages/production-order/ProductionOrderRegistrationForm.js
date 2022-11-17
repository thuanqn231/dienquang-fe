import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography, Autocomplete } from '@material-ui/core';
import { isEmpty } from 'lodash-es';
import { LoadingButton, DateTimePicker } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';

import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
import { fDateTime, fDate, dateStringToLocalDate } from '../../utils/formatTime';

// utils
import { getGridConfig } from '../../utils/pageConfig';
import { isNullPk, getSafeValue } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ProductionOrderRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  onCreatePlanSuccess: PropTypes.func,
  pageCode: PropTypes.string
};

const tableCode = 'productionOrderRegistrationForm';
const curDateTime = new Date();
const defaultPlanStartDate = new Date(
  curDateTime.getFullYear(),
  curDateTime.getMonth(),
  curDateTime.getDate(),
  6,
  0,
  0
);
const defaultPlanEndDate = new Date(
  curDateTime.getFullYear(),
  curDateTime.getMonth(),
  curDateTime.getDate() + 1,
  5,
  59,
  59
);
const defaultMinPlanStartDate = new Date(
  curDateTime.getFullYear(),
  curDateTime.getMonth(),
  curDateTime.getDate(),
  0,
  0,
  0
);
const defaultMinPlanEndDate = new Date(
  curDateTime.getFullYear(),
  curDateTime.getMonth(),
  curDateTime.getDate(),
  0,
  0,
  1
);
const defaultMaxPlanEndDate = new Date(
  curDateTime.getFullYear(),
  curDateTime.getMonth(),
  curDateTime.getDate() + 1,
  5,
  59,
  59
);
export default function ProductionOrderRegistrationForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  pageCode,
  onCreatePlanSuccess
}) {
  const { approvedBOMDropdown } = useSelector((state) => state.materialMaster);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowIndex, setRowIndex] = useState(1);
  const [planStartDate, setPlanStartDate] = useState(defaultPlanStartDate);
  const [planEndDate, setPlanEndDate] = useState(defaultPlanEndDate);
  const [disabledEdit, setDisabledEdit] = useState(true);
  const [minPlanStartDate, setMinPlanStartDate] = useState(defaultMinPlanStartDate);
  const [minPlanEndDate, setMinPlanEndDate] = useState(defaultMinPlanEndDate);
  const [maxPlanEndDate, setMaxPlanEndDate] = useState(defaultMaxPlanEndDate);
  const [modelCode, setModelCode] = useState({
    value: '',
    label: ''
  });
  const [topModel, settopModel] = useState({
    value: '',
    label: ''
  });
  const [header, setHeader] = useState({
    factory: '',
    plant: '',
    operation: '',
    process: ''
  });
  const [timeConfig, setTimeConfig] = useState({
    hour: 6,
    minute: 6,
    second: 0
  });
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(async () => {
    const tableConfigs = getGridConfig([], pageCode, tableCode);
    setColumns(tableConfigs);
    const planStartTimeConfig = await query({
      url: '/v1/factory-configuration/search',
      featureCode: 'user.create',
      params: {
        paramCode: 'ST00000001'
      }
    });
    if (planStartTimeConfig?.data) {
      const { hour, minute, second } = splitTime(planStartTimeConfig?.data[0]?.paramValue);
      console.log('hour, minute, second', hour, minute, second);
      console.log('hour - 1', hour - 1);
      console.log('minute === 0 ? 59 : minute - 1', minute === 0 ? 59 : minute - 1);
      console.log('second === 0 ? 59 : second - 1', second === 0 ? 59 : second - 1);
      setTimeConfig({ hour, minute, second });
      setPlanStartDate(
        new Date(curDateTime.getFullYear(), curDateTime.getMonth(), curDateTime.getDate(), hour, minute, second)
      );
      setMinPlanStartDate(
        new Date(curDateTime.getFullYear(), curDateTime.getMonth(), curDateTime.getDate(), hour, minute, second)
      );
      setPlanEndDate(
        new Date(
          curDateTime.getFullYear(),
          curDateTime.getMonth(),
          curDateTime.getDate() + 1,
          hour - 1,
          minute === '00' ? 59 : minute - 1,
          second === '00' ? 59 : second - 1
        )
      );
      setMinPlanEndDate(
        new Date(curDateTime.getFullYear(), curDateTime.getMonth(), curDateTime.getDate(), hour, minute, second + 1)
      );
      setMaxPlanEndDate(
        new Date(
          curDateTime.getFullYear(),
          curDateTime.getMonth(),
          curDateTime.getDate() + 1,
          hour - 1,
          minute === '00' ? 59 : minute - 1,
          second === '00' ? 59 : second - 1
        )
      );
    } else {
      setPlanStartDate(defaultPlanStartDate);
      setPlanEndDate(defaultPlanEndDate);
      setMinPlanEndDate(defaultMinPlanEndDate);
    }
    if (!isEdit) {
      return clearMatr();
    }
  }, []);

  useEffect(() => {
    if (currentData && isEdit) {
      if (currentData?.planDate) {
        handleChangePlanDate(new Date(currentData?.planDate));
      }
      if (currentData?.startTime) {
        handleChangePlanStartDate(new Date(currentData?.startTime));
      }
      if (currentData?.endTime) {
        handleChangePlanEndDate(new Date(currentData?.endTime));
      }
    }

    console.log('currentData', currentData);
  }, [currentData]);

  const splitTime = (time) => {
    if (time) {
      const split = time.split(':');
      return {
        hour: split[0],
        minute: split[1],
        second: split[2]
      };
    }
    return {
      hour: 6,
      minute: 0,
      second: 0
    };
  };

  const handleOpenConfirmModal = () => {
    if (!isEmpty(rowData) || isEdit) {
      setIsOpenConfirmModal(true);
    } else {
      enqueueSnackbar(translate(`message.please_add_at_least_1_production_order`), {
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

  const handleLoadTactTime = async (factory, planDate, modelCode, line) => {
    if (!isEmpty(factory) && !isEmpty(planDate) && !isEmpty(modelCode) && !isEmpty(line)) {
      const materialCode = approvedBOMDropdown.find((bom) => bom.value === modelCode)?.materialCode;
      const tactTimeResponse = await query({
        url: '/v1/tact-time/tack-time-plan',
        featureCode: 'user.create',
        showErrorMessage: false,
        params: {
          factoryCode: factory,
          applyStartDate: planDate,
          materialCode,
          line
        }
      }).catch((error) => {
        setFieldValue('tactTime', 0);
        console.error(error);
      });
      if (tactTimeResponse?.data) {
        const { data } = tactTimeResponse;
        const tactTime = data?.time || 0;
        setFieldValue('tactTime', tactTime);
      } else {
        setFieldValue('tactTime', 0);
        enqueueSnackbar(`${translate(`message.not_found_tactime_with_material_code`)}: ${materialCode}`, {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      }
    } else {
      setFieldValue('tactTime', (isEdit && currentData?.tactTime) || 0);
    }
  };

  const handleChangePlanDate = (planDate) => {
    setFieldValue('planDate', fDate(planDate));
    setMinPlanStartDate(
      new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        planDate.getDate(),
        timeConfig.hour,
        timeConfig.minute,
        timeConfig.second
      )
    );
    handleChangePlanStartDate(
      new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        planDate.getDate(),
        timeConfig.hour,
        timeConfig.minute,
        timeConfig.second
      )
    );
    handleChangePlanEndDate(
      new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        planDate.getDate() + 1,
        timeConfig.hour - 1,
        timeConfig.minute === '00' ? 59 : timeConfig.minute - 1,
        timeConfig.second === '00' ? 59 : timeConfig.second - 1
      )
    );
    setMinPlanEndDate(
      new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        planDate.getDate(),
        timeConfig.hour,
        timeConfig.minute,
        timeConfig.second + 1
      )
    );
    setMaxPlanEndDate(
      new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        planDate.getDate() + 1,
        timeConfig.hour - 1,
        timeConfig.minute === '00' ? 59 : timeConfig.minute - 1,
        timeConfig.second === '00' ? 59 : timeConfig.second - 1
      )
    );
    handleLoadTactTime(values.factory, planDate, values.modelCode, values.line);
  };

  const handleChangePlanStartDate = (startDate) => {
    const minEndDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
      startDate.getSeconds() + 1
    );
    setMinPlanEndDate(minEndDate);
    setFieldValue('planStartDate', startDate);
    if (planEndDate < startDate) {
      handleChangePlanEndDate(minEndDate);
    }
  };

  const handleChangePlanEndDate = (endDate) => {
    if (endDate < values.planStartDate) {
      setFieldValue('planEndDate', minPlanEndDate);
    } else {
      setFieldValue('planEndDate', endDate);
    }
  };

  const handleChangeModelCode = (modelCode) => {
    const currentModelCode = approvedBOMDropdown.filter((model) => model.value === modelCode);
    setModelCode(currentModelCode[0] || { value: '', label: '' });
    setFieldValue('modelCode', getSafeValue(modelCode));
    setFieldValue('modelDescription', getSafeValue(currentModelCode[0]?.modelDescription));
    setFieldValue('modelId', getSafeValue(currentModelCode[0]?.materialId));
    setFieldValue('modelVersion', getSafeValue(currentModelCode[0]?.version));
    handleLoadTactTime(values.factory, values.planDate, modelCode, values.line);
  };

  const handleChangetopModel = (topModel) => {
    const currenttopModel = approvedBOMDropdown.filter((topModel) => topModel.value === topModel);
    settopModel(currenttopModel[0] || { value: '', label: '' });
    setFieldValue('topModel', getSafeValue(topModel));
  };

  const handleAddProductionOrder = () => {
    console.log('values', values);
    validateForm();
    let isDuplicate = false;
    rowData.forEach((e) => {
      if (e.prodOrderNo === values.prodOrderNo) {
        isDuplicate = true;
      }
    });
    if (isDuplicate) {
      enqueueSnackbar(translate(`message.production_order_no_already_exist`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      return;
    }
    const newRowData = [...rowData];
    const currentFactory = values.factory;
    const currentOperation = values.operation;
    const currentLine = values.line;
    const currentPOType = values.poType;

    const currentLineObj = commonDropdown.lineDropdown.filter((line) => line.value === currentLine);
    const currentPOTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentPOType);
    newRowData.push({
      factoryPk: `tmpId${rowIndex}`,
      planDate: values.planDate,
      prodOrderNo: values.prodOrderNo,
      modelCode: values.modelCode,
      modelId: values.modelId,
      modelDescription: values.modelDescription,
      topModel: values.topModel,
      modelVersion: values.modelVersion,
      poType: {
        code: currentPOType,
        name: currentPOTypeObj[0].name
      },
      prodStatus: {
        code: 'D019001'
      },
      line: {
        factoryPk: currentLine,
        name: currentLineObj[0].label
      },

      operation: values.operation,
      startTime: values.planStartDate,
      endTime: values.planEndDate,
      tactTime: values.tactTime,
      planQty: values.planQty,
      pk: {
        factoryCode: values.factory
      },
      state: 'RUNNING',
      type: 'Add'
    });
    setHeader({
      factory: values.factory,
      operation: values.operation
    });
    updateData(newRowData);
    setRowIndex(rowIndex + 1);
    resetForm();
    setFieldValue('factory', currentFactory);
    setFieldValue('operation', currentOperation);
    clearMatr();
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
      setChildFieldsData(event.api.getSelectedNodes()[0].data);
      setSelectedRowId(selectedId);
      setDisabledEdit(false);
    }
  };

  const setChildFieldsData = (data) => {
    formik.setFieldValue('planDate', getSafeValue(data?.planDate));
    formik.setFieldValue('planStartDate', getSafeValue(data?.startTime));
    formik.setFieldValue('planEndDate', getSafeValue(data?.endTime));
    formik.setFieldValue('tactTime', getSafeValue(data?.tactTime));
    formik.setFieldValue('planQty', getSafeValue(data?.planQty));
    formik.setFieldValue('poType', getSafeValue(data?.poType?.code));
    formik.setFieldValue('line', getSafeValue(data?.line?.factoryPk));
    formik.setFieldValue('modelCode', getSafeValue(data?.modelCode));
    formik.setFieldValue('prodOrderNo', getSafeValue(data?.prodOrderNo));
    formik.setFieldValue('modelId', getSafeValue(data?.modelId));
    setFieldValue('modelCode', getSafeValue(data?.modelCode));
    setFieldValue('prodOrderNo', getSafeValue(data?.prodOrderNo));
    setFieldValue('modelDescription', getSafeValue(data?.modelDescription));
    setFieldValue('modelId', getSafeValue(data?.modelId));
    setFieldValue('modelVersion', getSafeValue(data?.modelVersion));
    setFieldValue('topModel', getSafeValue(data?.topModel));
  };

  const clearOldValue = () => {
    resetForm();
    clearMatr();
    setFieldValue('factory', header.factory);
    setFieldValue('operation', header.operation);
    setSelectedRowId(null);
    setDisabledEdit(true);
  };

  const onClickModify = () => {
    if (selectedRowId) {
      const currentRowData = [...rowData];
      const selectedIdx = currentRowData.findIndex((row) => row.factoryPk === selectedRowId);
      const currentLine = values.line;
      const currentPOType = values.poType;
      const currentLineObj = commonDropdown.lineDropdown.filter((line) => line.value === currentLine);
      const currentPOTypeObj = commonDropdown.commonCodes.filter((commonCode) => commonCode.code === currentPOType);

      let isPOChange = false;
      if (currentRowData[selectedIdx].type !== 'Add') {
        if (currentRowData[selectedIdx].prodOrderNo !== values.prodOrderNo) {
          isPOChange = true;
        }
      }

      if (isPOChange) {
        let isDuplicate = false;
        currentRowData.forEach((e) => {
          if (e.prodOrderNo === values.prodOrderNo) {
            isDuplicate = true;
          }
        });
        if (isDuplicate) {
          enqueueSnackbar(translate(`message.production_order_no_already_exist`), {
            variant: 'warning',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          return;
        }
      }

      currentRowData[selectedIdx] = {
        ...currentRowData[selectedIdx],
        planDate: values?.planDate,
        modelCode: values.modelCode,
        prodOrderNo: values.prodOrderNo,
        modelId: values.modelId,
        modelDescription: values.modelDescription,
        topModel: values.topModel,
        modelVersion: values.modelVersion,
        poType: {
          code: currentPOType,
          name: currentPOTypeObj[0].name
        },
        line: {
          factoryPk: currentLine,
          name: currentLineObj[0].label
        },
        startTime: new Date(values?.planStartDate),
        endTime: new Date(values?.planEndDate),
        tactTime: values.tactTime,
        planQty: values.planQty,
        type: 'Modify'
      };
      // console.log('currentRowData', currentRowData);
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
          factory: '',
          plant: '',
          operation: '',
          process: ''
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

  const clearMatr = () => {
    setModelCode({
      value: '',
      label: ''
    });
    settopModel({
      value: '',
      label: ''
    });
  };

  const onSaveProductOrder = () => {
    setSubmitting(true);
    if (!isEdit) {
      rowData.forEach((row) => {
        delete row.factoryPk;
      });
      console.log('rowData', rowData);
      try {
        mutate({
          url: '/v1/productionOrder/create-v2',
          data: {
            planList: rowData
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              resetForm();
              setSubmitting(false);
              clearMatr();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              onCreatePlanSuccess(res.data[0].planId);
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
        const plan = {
          factoryPk: currentData?.factoryPk,
          planDate: values.planDate,
          modelCode: values.modelCode,
          prodOrderNo: values.prodOrderNo,
          modelId: values.modelId,
          modelDescription: values.modelDescription,
          topModel: values.topModel,
          modelVersion: values.modelVersion,

          poType: {
            code: values.poType
          },
          line: {
            factoryPk: values.line
          },
          operation: values.operation,
          startTime: values.planStartDate,
          endTime: values.planEndDate,
          tactTime: values.tactTime,
          planQty: values.planQty,
          pk: {
            factoryCode: values.factory
          },
          state: 'RUNNING'
        };
        mutate({
          url: '/v1/productionOrder/update',
          data: {
            plan
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              resetForm();
              setSubmitting(false);
              clearMatr();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              enqueueSnackbar(translate(`message.plan_was_modified_successfully`), {
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
  const ProductionOrderSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    operation: Yup.string().required('Operation is required'),
    planDate: Yup.date().required('Plan Date is required'),
    prodOrderNo: Yup.string().required('Production Order No is required'),
    modelCode: Yup.string().required('Model Code is required'),
    modelId: Yup.string().required('Model Id is required'),
    modelDescription: Yup.string(),
    topModel: Yup.string(),
    modelVersion: Yup.string(),
    planStartDate: Yup.date().required('Plan Start Date is required'),
    tactTime: Yup.number().positive('Tact Time is required'),
    line: Yup.string().required('Line is required'),
    planEndDate: Yup.date().required('Plan End Date is required'),
    planQty: Yup.number().required('Plan Qty is required').min(1, 'Plan Qty must greater than 0'),
    poType: Yup.string().required('PO Type is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      operation: (isEdit && currentData?.operation) || '',
      planDate: (isEdit && currentData?.planDate) || fDate(new Date()),
      prodOrderNo: (isEdit && currentData?.prodOrderNo) || '',
      modelCode: (isEdit && currentData?.modelCode) || '',
      modelId: (isEdit && currentData?.modelId) || '',
      modelDescription: (isEdit && currentData?.modelDescription) || '',
      topModel: (isEdit && currentData?.topModel) || '',
      modelVersion: (isEdit && currentData?.modelVersion) || '',
      planStartDate: (isEdit && currentData?.startTime) || planStartDate,
      tactTime: (isEdit && currentData?.tactTime) || 0,
      line: (isEdit && currentData?.line?.factoryPk) || '',
      planEndDate: (isEdit && currentData?.endTime) || planEndDate,
      planQty: (isEdit && currentData?.planQty) || 0,
      poType: (isEdit && currentData?.poType?.code) || ''
    },
    validationSchema: ProductionOrderSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (isEdit) {
          setSubmitting(true);
          handleOpenConfirmModal();
        } else {
          handleAddProductionOrder();
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
      clearMatr();
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
  };

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
      {console.log('currentData', currentData)}
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.plan_header`)}
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

                    <Dropdown
                      {...getFieldProps('operation')}
                      id="operation"
                      name="operation"
                      label="Operation"
                      size="small"
                      required
                      disabled={!isEmpty(rowData) || isEdit}
                      onChange={handleChange}
                      options={[
                        { value: 'Main Plan', label: 'Main Plan' },
                        { value: 'Sub Plan', label: 'Sub Plan' }
                      ]}
                      errorMessage={touched.operation && errors.operation}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.plan_detail`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <DthDatePicker
                      name="planDate"
                      label="Plan Date"
                      value={values.planDate}
                      onChange={(newValue) => {
                        handleChangePlanDate(newValue);
                      }}
                      minDate={new Date()}
                      fullWidth
                      size="small"
                      required
                      errorMessage={touched.planDate && errors.planDate}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="PO No."
                      size="small"
                      required
                      {...getFieldProps('prodOrderNo')}
                      error={Boolean(touched.prodOrderNo && errors.prodOrderNo)}
                      helperText={touched.prodOrderNo && errors.prodOrderNo}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Code"
                      size="small"
                      required
                      {...getFieldProps('modelCode')}
                      error={Boolean(touched.modelCode && errors.modelCode)}
                      helperText={touched.modelCode && errors.modelCode}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model ID"
                      size="small"
                      required
                      {...getFieldProps('modelId')}
                      error={Boolean(touched.modelId && errors.modelId)}
                      helperText={touched.modelId && errors.modelId}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Description"
                      size="small"
                      {...getFieldProps('modelDescription')}
                      error={Boolean(touched.modelDescription && errors.modelDescription)}
                      helperText={touched.modelDescription && errors.modelDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Top Model Code"
                      size="small"
                      {...getFieldProps('topModel')}
                      error={Boolean(touched.topModel && errors.topModel)}
                      helperText={touched.topModel && errors.topModel}
                    />

                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Version"
                      size="small"
                      {...getFieldProps('modelVersion')}
                      error={Boolean(touched.modelVersion && errors.modelVersion)}
                      helperText={touched.modelVersion && errors.modelVersion}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <DateTimePicker
                      name="planStartDate"
                      label="Plan Start Time"
                      value={values.planStartDate}
                      ampm={false}
                      views={['month', 'day', 'hours', 'minutes', 'seconds']}
                      inputFormat="yyyy-MM-dd HH:mm:ss"
                      mask="____-__-__ __:__:__"
                      onChange={(newValue) => {
                        handleChangePlanStartDate(newValue);
                      }}
                      minDateTime={minPlanStartDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          required
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          error={Boolean(touched.planStartDate && errors.planStartDate)}
                          helperText={touched.planStartDate && errors.planStartDate}
                        />
                      )}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Tact Time"
                      size="small"
                      type="number"
                      required
                      {...getFieldProps('tactTime')}
                      error={Boolean(touched.tactTime && errors.tactTime)}
                      helperText={touched.tactTime && errors.tactTime}
                    />
                    <Dropdown
                      {...getFieldProps('line')}
                      id="line"
                      name="line"
                      label="Line Name"
                      size="small"
                      required
                      onChange={(e) => {
                        const line = e.target.value;
                        setFieldValue('line', line);
                      }}
                      options={commonDropdown.lineDropdown.filter((line) => line.factory === values.factory)}
                      errorMessage={touched.line && errors.line}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <DateTimePicker
                      name="planEndDate"
                      label="Plan End Time"
                      value={values.planEndDate}
                      ampm={false}
                      views={['month', 'day', 'hours', 'minutes', 'seconds']}
                      inputFormat="yyyy-MM-dd HH:mm:ss"
                      mask="____-__-__ __:__:__"
                      onChange={(newValue) => {
                        handleChangePlanEndDate(newValue);
                      }}
                      onKeyDown={(e) => {
                        e.preventDefault();
                      }}
                      minDateTime={minPlanEndDate}
                      maxDateTime={maxPlanEndDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          required
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          error={Boolean(touched.planEndDate && errors.planEndDate)}
                          helperText={touched.planEndDate && errors.planEndDate}
                        />
                      )}
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
                    <Dropdown
                      {...getFieldProps('poType')}
                      id="poType"
                      name="poType"
                      label="PO Type"
                      size="small"
                      required
                      onChange={handleChange}
                      groupId="D020000"
                      errorMessage={touched.poType && errors.poType}
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
            <LoadingButton
              type="button"
              variant="contained"
              loading={isSubmitting}
              loadingIndicator="Processing..."
              onClick={handleOpenConfirmModal}
            >
              {translate(`button.register`)}
            </LoadingButton>
          )}
          {isEdit && (
            <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">
              {translate(`button.modify`)}
            </LoadingButton>
          )}
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
            <LoadingButton
              type="button"
              variant="contained"
              loading={isSubmitting}
              loadingIndicator="Processing..."
              onClick={onSaveProductOrder}
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
