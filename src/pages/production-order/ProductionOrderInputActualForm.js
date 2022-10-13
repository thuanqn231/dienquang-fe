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

ProductionOrderInputActualForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  onCreatePlanSuccess: PropTypes.func,
  pageCode: PropTypes.string
};

const tableCode = 'productionOrderInputActualForm';
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
export default function ProductionOrderInputActualForm({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  pageCode,
  onCreatePlanSuccess
}) {
  const { approvedBOMDropdown } = useSelector((state) => state.materialMaster);
  const { themeAgGridClass } = useSettings();
  const { user } = useAuth();
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
  const [productionOrderDropDown, setProductionOrderDropDown] = useState([]);
  const [productionOrder, setProductionOrder] = useState();
  const [linePk, setLinePk] = useState();
  const [modelCode, setModelCode] = useState({
    value: '',
    label: ''
  });
  const [topModel, settopModel] = useState({
    value: '',
    label: ''
  });
  const [header, setHeader] = useState({
    prodOrderNo: '',
    modelCode: '',
    modelId: '',
    modelDescription: '',
    line: ''
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

  useEffect(() => {
    handleChangePlanDate(fDate(new Date()));
  }, []);

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

  const handleLoadProductionOrder = async (factory, planDate) => {
    console.log('user', !isEmpty(factory), !isEmpty(planDate));
    if (!isEmpty(factory) && !isEmpty(planDate)) {
      const tactTimeResponse = await query({
        url: '/v1/productionOrder/search',
        featureCode: 'user.create',
        showErrorMessage: false,
        params: {
          factoryCode: factory,
          from: planDate,
          to: planDate,
          state: 'RUNNING'
        }
      }).catch((error) => {
        console.error(error);
      });
      if (tactTimeResponse?.data) {
        const { data } = tactTimeResponse;
        const productionOrderDropdown = data.map((prodOrder) => ({
          factory: prodOrder.pk.factoryCode,
          value: prodOrder.factoryPk,
          label: prodOrder.prodOrderNo,
          line: prodOrder.line.factoryPk
        }));
        setProductionOrderDropDown(productionOrderDropdown);
      }
    }
  };
  const handleLoadDataProductionOrder = async (productionOrderId) => {
    if (!isEmpty(productionOrderId)) {
      query({
        url: `/v1/productionOrder/${productionOrderId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          setFieldValue('modelCode', data.modelCode);
          setFieldValue('modelId', data.modelId);
          setFieldValue('modelDescription', data.modelDescription);
          setFieldValue('line', data.line.name);
          setLinePk(data.line.factoryPk);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleChangePlanDate = (planDate) => {
    setFieldValue('planDate', fDate(planDate));
    handleLoadProductionOrder(user.factory.factoryCode, fDate(planDate));
  };
  const handleChangeProductionOrder = (prodOrder) => {
    handleLoadDataProductionOrder(prodOrder);
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
    handleLoadProductionOrder(user.factory.factoryCode, values.planDate);
  };

  const handleChangetopModel = (topModel) => {
    const currenttopModel = approvedBOMDropdown.filter((topModel) => topModel.value === topModel);
    settopModel(currenttopModel[0] || { value: '', label: '' });
    setFieldValue('topModel', getSafeValue(topModel));
  };

  const handleAddProductionOrder = () => {
    validateForm();
    const newRowData = [...rowData];
    const currentWorkStation = values.workStation;
    const currentWorkStationObj = commonDropdown.workStationDropdown.filter(
      (workStation) => workStation.value === currentWorkStation
    );
    newRowData.push({
      factoryPk: `tmpId${rowIndex}`,

      workStation: {
        factoryPk: currentWorkStation,
        name: currentWorkStationObj[0].label
      },
      productionOrder: {
        factoryPk: productionOrder
      },
      // inputTime: fDateTime(new Date()),
      inputTime: new Date(),
      prodQty: values.prodQty,
      inputDate: values.planDate,
      modelCode: values.modelCode,
      modelId: values.modelId,
      modelDescription: values.modelDescription,
      line: values.line,
      finalYn: '',
      reflect: '',
      pk: {
        factoryCode: user.factory.factoryCode
      },
      state: 'RUNNING'
    });
    setHeader({
      prodOrderNo: currentWorkStation,
      modelCode: values.modelCode,
      modelId: values.modelId,
      modelDescription: values.modelDescription,
      line: values.line
    });
    console.log('newRowData', newRowData);
    updateData(newRowData);
    setRowIndex(rowIndex + 1);
    resetForm();
    setFieldValue('prodOrderNo', productionOrder);
    setFieldValue('line', values.line);
    setFieldValue('modelCode', values.modelCode);
    setFieldValue('modelId', values.modelId);
    setFieldValue('modelDescription', values.modelDescription);
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
    formik.setFieldValue('prodOrderNo', getSafeValue(data?.productionOrder.factoryPk));
    formik.setFieldValue('modelCode', getSafeValue(data?.modelCode));
    formik.setFieldValue('modelId', getSafeValue(data?.modelId));
    formik.setFieldValue('modelDescription', getSafeValue(data?.modelDescription));
    formik.setFieldValue('line', getSafeValue(data?.line));
    formik.setFieldValue('workStation', getSafeValue(data?.poType?.workStation.factoryPk));
    formik.setFieldValue('prodQty', getSafeValue(data?.prodQty));
    setFieldValue('prodOrderNo', getSafeValue(data?.productionOrder.factoryPk));
    setFieldValue('modelCode', getSafeValue(data?.modelCode));
    setFieldValue('modelId', getSafeValue(data?.modelId));
    setFieldValue('modelDescription', getSafeValue(data?.modelDescription));
    setFieldValue('line', getSafeValue(data?.line));
    setFieldValue('workStation', getSafeValue(data?.poType?.workStation.factoryPk));
    setFieldValue('prodQty', getSafeValue(data?.prodQty));
  };

  const clearOldValue = () => {
    resetForm();
    clearMatr();
    setFieldValue('prodOrderNo', header.prodOrderNo);
    setFieldValue('line', header.line);
    setFieldValue('modelCode', header.modelCode);
    setFieldValue('modelId', header.modelId);
    setFieldValue('modelDescription', header.modelDescription);
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

      currentRowData[selectedIdx] = {
        ...currentRowData[selectedIdx],
        planDate: values?.planDate,
        modelCode: values.modelCode,
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
        startTime: values?.planStartDate,
        endTime: values?.planEndDate,
        tactTime: values.tactTime,
        planQty: values.planQty
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
          prodOrderNo: '',
          modelCode: '',
          modelId: '',
          modelDescription: '',
          line: ''
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
      try {
        mutate({
          url: '/v1/productionOrder/actual/create',
          data: {
            actual: rowData
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              console.log('res', res);
              resetForm();
              setSubmitting(false);
              clearMatr();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              onCreatePlanSuccess(res.data[0].productionOrder.prodOrderNo);
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
    planDate: Yup.date().required('Plan Date is required'),
    prodOrderNo: Yup.string().required('Production Order is required'),
    modelCode: Yup.string().required('Model Code is required'),
    modelId: Yup.string().required('Model Id is required'),
    modelDescription: Yup.string(),
    line: Yup.string().required('Line is required'),
    workStation: Yup.string().required('Production Order is required'),
    prodQty: Yup.number().required('Plan Qty is required').min(1, 'Plan Qty must greater than 0')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      prodOrderNo: (isEdit && currentData?.prodOrderNo) || '',
      planDate: (isEdit && currentData?.planDate) || fDate(new Date()),
      modelCode: (isEdit && currentData?.modelCode) || '',
      modelId: (isEdit && currentData?.modelId) || '',
      modelDescription: (isEdit && currentData?.modelDescription) || '',
      line: (isEdit && currentData?.line?.factoryPk) || '',
      workStation: (isEdit && currentData?.line?.factoryPk) || '',
      prodQty: (isEdit && currentData?.planQty) || 0
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
      {console.log('currentData', commonDropdown.workStationDropdown)}
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
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
                      // minDate={new Date()}
                      fullWidth
                      size="small"
                      required
                      disabled={!isEmpty(rowData)}
                      errorMessage={touched.planDate && errors.planDate}
                    />
                    <Dropdown
                      {...getFieldProps('prodOrderNo')}
                      id="prodOrderNo"
                      name="prodOrderNo"
                      label="PO No"
                      size="small"
                      required
                      onChange={(e) => {
                        const prodOrderNo = e.target.value;
                        setFieldValue('prodOrderNo', prodOrderNo);
                        setProductionOrder(prodOrderNo);
                        handleChangeProductionOrder(prodOrderNo);
                      }}
                      options={productionOrderDropDown}
                      disabled={!isEmpty(rowData)}
                      errorMessage={touched.prodOrderNo && errors.prodOrderNo}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Code"
                      size="small"
                      required
                      disabled
                      {...getFieldProps('modelCode')}
                      error={Boolean(touched.modelCode && errors.modelCode)}
                      helperText={touched.modelCode && errors.modelCode}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model ID"
                      size="small"
                      disabled
                      required
                      {...getFieldProps('modelId')}
                      error={Boolean(touched.modelId && errors.modelId)}
                      helperText={touched.modelId && errors.modelId}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      disabled
                      label="Model Description"
                      size="small"
                      {...getFieldProps('modelDescription')}
                      error={Boolean(touched.modelDescription && errors.modelDescription)}
                      helperText={touched.modelDescription && errors.modelDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Line Name"
                      size="small"
                      disabled
                      required
                      {...getFieldProps('line')}
                      error={Boolean(touched.line && errors.line)}
                      helperText={touched.line && errors.line}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {/* {translate(`typo.plan_header`)} */}
            Production Qty
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('workStation')}
                      id="workStation"
                      name="workStation"
                      label="Work Station"
                      size="small"
                      required
                      // onChange={handleChangeFactory}
                      options={commonDropdown.workStationDropdown.filter((workStation) => workStation.line === linePk)}
                      errorMessage={touched.workStation && errors.workStation}
                    />

                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Prod. Qty"
                      size="small"
                      type="number"
                      required
                      {...getFieldProps('prodQty')}
                      error={Boolean(touched.prodQty && errors.prodQty)}
                      helperText={touched.prodQty && errors.prodQty}
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
              {/* <Button
                sx={{ marginLeft: 1 }}
                variant="contained"
                onClick={onClickModify}
                size="small"
                label="Modify"
                disabled={disabledEdit}
              >
                {translate(`button.modify`)}
              </Button> */}
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
