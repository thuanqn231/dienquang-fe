import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { isEmpty, isUndefined } from 'lodash';
import { useDispatch } from 'react-redux';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate } from '../../core/api';
import { AgGrid, Dropdown } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import { setSelectedWidget } from '../../redux/slices/page';
import { useSelector } from '../../redux/store';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { getFactoryAndIdByPk } from '../../utils/formatString';


// ----------------------------------------------------------------------

const pageCode = 'menu.masterData.production.qualityMasterData.defectItem.symptomCauseMapping';
const tableCode = 'factoryDefectItemsRegistration';


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
const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { causesClNameDropdown, defectCausesNameDropdown } = useSelector((state) => state.factoryDefectCausesManagement);
  const { translate, currentLang } = useLocales();
  const { themeAgGridClass } = useSettings();
  const { commonDropdown, userGridConfig, funcPermission, user } = useAuth();
  const [listOfWidgets, setListOfWidgets] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [columns, setColumns] = useState(null);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');
  const [processDropdown, setProcessDropdown] = useState(commonDropdown.processDropdown);
  const { dsClassNameDropdown, dsDetailNameDropdown } = useSelector(
    (state) => state.factoryDSManagement
  );
  const [actionType, setActionType] = useState('')
  const [checkModify, setCheckModify] = useState(false)
  const [causes, setCauses] = useState({})
  const { selectedWidget } = useSelector((state) => state.page);
  const pageSelectedWidget = selectedWidget[pageCode];
  const [action, setAction] = useState('')
  const [listCause, setListCause] = useState([])
  const [currentProcess, setCurrentProcess] = useState({
    code: '',
    value: ''
  });
  const [defectSymptoms, setDefectSymptoms] = useState({})
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  useEffect(() => {
    if(isEdit) {
      const value = currentData.causeList.map(e => ({
        pk: {id: e.pk.id, factoryName: e.pk.factoryName, factoryCode: e.pk.factoryCode},
        productGroup: e.productGroup.name,
        processTypeName: e.processType.name,
        symptClassName: e.defectSymptomDetail.defectSymptomClass.name,
        symptClassCode: e.defectSymptomDetail.defectSymptomClass.code,
        defectSymptName: e.defectSymptomDetail.name,
        defectSymptCode: e.defectSymptomDetail.code,
        sortOrder: e.sortOrder,
        level: e.defectLevel.name,
        processName: e.process.name.name,
        causesClassName: e.defectCauseDetail.defectCauseClass.factoryPk,
        causesClassCode: e.defectCauseDetail.defectCauseClass.code,
        defectCausesName: e.defectCauseDetail.factoryPk,
        defectCausesCode: e.defectCauseDetail.code,
        stateDefectCause: e.state === 'RUNNING' ? 'Y' : 'N'
      }))
      setListCause(value)
    }
  }, [isEdit])
  useEffect(() => {
    const currentPage = funcPermission.filter((permission) => permission.code === pageCode);
    if (!isEmpty(currentPage) && !isEmpty(currentPage[0].widgets)) {
      const activeWidgets = currentPage[0].widgets.filter((widget) => widget.permissions.includes('READ'));
      setListOfWidgets(activeWidgets);
      if (!isEmpty(activeWidgets) && isUndefined(pageSelectedWidget)) {
        dispatch(
          setSelectedWidget(
            {
              ...selectedWidget,
              [pageCode]:
              {
                widgetCode: activeWidgets[0].code,
                widgetName: activeWidgets[0].name
              }
            }
          )
        );
      }
    }
  }, [funcPermission]);

  useEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    // tableConfigs.forEach((column) => {
    //   column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    // });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      // tableConfigs.forEach((column) => {
      //   column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      // });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setCauses('')
      setAction('')
    }
    if (rowCount === 1) {
      setAction('Edit')
      const selectedCauses = event.api.getSelectedNodes()[0].data;
      if (selectedCauses) {
        setCauses(selectedCauses)

      }
    }
  };

  const handleAdd = () => {
    
    if(listCause.length === 0) {
      setDefectSymptoms(values)
      setActionType('Check')
    }
    let check = true
    listCause.forEach(e => {
      if(e.defectCausesCode === values.defectCausesCode) {
        check = false
      }
    })
    const value = {
      pk: {factoryName: commonDropdown.factoryDropdown.find(e => e.value === values.factory)?.label,factoryCode: values.factory},
      productGroup: commonDropdown.commonCodes.find(e => e.code === values.productGroup)?.name,
      processTypeName: commonDropdown.commonCodes.find(e => e.code === values.processTypeName)?.name,
      symptClassName: values.symptClassName,
      symptClassCode: values.symptClassCode,
      defectSymptName: values.defectSymptName,
      defectSymptCode: values.defectSymptCode,
      sortOrder: values.sortOrder,
      level: commonDropdown.commonCodes.find(e => e.code === values.level)?.name,
      processName: processDropdown.find(e => e.value === values.processName)?.label,
      causesClassName: values.causesClassName,
      causesClassCode: values.causesClassCode,
      defectCausesName: defectCausesNameDropdown.find(e => e.value === values.defectCausesName)?.label,
      defectCausesCode: values.defectCausesCode,
      stateDefectCause: values.stateDefectCause === 'RUNNING' ? 'Y' : 'N'
    }
    if(check) {
      setListCause([...listCause, value])
    } else {
      enqueueSnackbar(translate(`message.cause.exist`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  }
  const handleModify = () => {
    if(errors.length === 0) {
      const value = {
        pk: {factoryName: commonDropdown.factoryDropdown.find(e => e.value === values.factory).label, factoryCode: values.factory},
        productGroup: commonDropdown.commonCodes.find(e => e.code === values.productGroup)?.name,
        processTypeName: commonDropdown.commonCodes.find(e => e.code === values.processTypeName)?.name,
        symptClassName: values.symptClassName,
        symptClassCode: values.symptClassCode,
        defectSymptName: values.defectSymptName,
        defectSymptCode: values.defectSymptCode,
        sortOrder: values.sortOrder,
        level: commonDropdown.commonCodes.find(e => e.code === values.level)?.name,
        processName: processDropdown.find(e => e.value === values.processName)?.label,
        defectCausesName: defectCausesNameDropdown.find(e => e.value === values.defectCausesName).label,
        defectCausesCode: values.defectCausesCode,
        causesClassName: values.causesClassName,
        causesClassCode: values.causesClassCode,
        stateDefectCause: values.stateDefectCause === 'RUNNING' ? 'Y' : 'N'
      }
      if (causes) {
        const currentRowData = [...listCause];
        const selectedIdx = currentRowData.findIndex((row) => row.defectCausesCode === causes.defectCausesCode);
        currentRowData[selectedIdx] = {
          ...currentRowData[selectedIdx],
          ...value
        };
        setCauses(null);
        setListCause(currentRowData);
    }
    } else {
      enqueueSnackbar(translate(`message.please.input.all.field`), {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
    
}

  const handleDelete = () => {
    if(causes) {
      if(listCause.length === 1) {
        setActionType('')
      }
      const filterCurrentRow = listCause.filter(e => e.defectCausesCode !== causes)
      setListCause(filterCurrentRow) 
      setCauses(null)
    }
  }
  const handleRegister = () => {
    formik.setSubmitting(true);
    if (!isEdit) {
      const _data = listCause.map(e => ({
      pk:{
          factoryCode: values.factory
      },
      productGroup:{
          code: values.productGroup
      },
      processType:{
          code: values.processTypeName
      },
      process:{
          factoryPk: values.processName
      },
      defectCauseDetail:{
          factoryPk: defectCausesNameDropdown.find(el => el.code === e.defectCausesCode).value,
          code: e.defectCausesCode
      },
       defectSymptomDetail:{
          factoryPk: dsDetailNameDropdown.find(el => el.value === e.defectSymptName).factoryPk,
          code: values.defectSymptCode
      },
      defectLevel:{
          code: values.level
      },
      causeState: values.stateDefectCause,
      symptomState: values.state
      }))

      try {
        mutate({
          url: '/v1/symptom-cause-mapping/create',
          data: {
            symptomCauseMappingDtoList: _data
          },
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
      
      try {
        const _data = listCause.map(e => ({
        pk: {
            id: e?.pk?.id,
            factoryCode: values.factory
        },
        productGroup:{
            code: values.productGroup
        },
        defectCauseDetail:{
            factoryPk: defectCausesNameDropdown.find(el => el.code === e.defectCausesCode).value,
            code: e.defectCausesCode
        },
        defectSymptomDetail:{
            factoryPk: dsDetailNameDropdown.find(el => el.value === e.defectSymptName).factoryPk,
            code: values.defectSymptCode
        },
        defectLevel:{
            code: values.level
        },
        }))
        mutate({
          url: '/v1/symptom-cause-mapping/update',
          data: {
            symptomCauseMappingUpdateDtoList: _data
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
    productGroup: Yup.string().required('Product Group is required'),
    processTypeName: Yup.string().required('Process Type Name is required'),
    symptClassName: Yup.string().required('Sympt Class Name is required'),
    symptClassCode: Yup.string().required('Sympt Class Code is required'),
    level: Yup.string().required('Defect Level is required'),
    defectSymptName: Yup.string().required('Defect Sympt Name is required'),
    defectSymptCode: Yup.string().required('Defect symptom Code is required'),
    causesClassName: Yup.string().required('Causes Class Name is required'),
    defectCausesName: Yup.string().required('Defect Causes Name is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit ? currentData.causeForm.pk.factoryCode : '',
      productGroup:  isEdit ? currentData.causeForm.productGroup.code : '',
      processTypeName: isEdit ? currentData.causeForm.processType.code : '',
      symptClassName:  isEdit ? currentData.causeForm.defectSymptomDetail.defectSymptomClass.name : '',
      symptClassCode:  isEdit ? currentData.causeForm.defectSymptomDetail.defectSymptomClass.code : '',
      level: isEdit ? currentData.causeForm.defectLevel.code : '',
      defectSymptName: isEdit ? currentData.causeForm.defectSymptomDetail.name : '',
      defectSymptCode: isEdit ? currentData.causeForm.defectSymptomDetail.code : '',
      sortOrder: isEdit ? '2' : '',
      processName: isEdit ? currentData.causeForm.factoryPk : '',
      processCode: isEdit ? currentData.causeForm.process.code : '',
      state: isEdit ? currentData.causeForm.symptomState : 'RUNNING',
      stateDefectCause: (action === 'Edit' && (causes?.stateDefectCause === 'Y' ? 'RUNNING'  : 'HIDDEN')) || 'RUNNING',
      causesClassName: action === 'Edit' ? causes?.causesClassName : '',
      causesClassCode: action === 'Edit' ? causes?.causesClassCode : '',
      defectCausesName: action === 'Edit' ? defectCausesNameDropdown.find(e => e.label === causes?.defectCausesName)?.value  : '',
      defectCausesCode: action === 'Edit' ? causes?.defectCausesCode : '',

    },
    validationSchema: symptomClassRegSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleAdd()
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
  };

  const handleChangeProcessTypeName = (e) => {
    if (!e.target?.value) {
      setProcessDropdown(commonDropdown.processDropdown);
    } else {
      const lines = commonDropdown.lineDropdown
        .filter((line) => line.processType === e.target.value)
        .map((current) => current.value);

      const process = commonDropdown.processDropdown.filter((process) => lines.includes(process.line));
      setProcessDropdown(process);
    }
  };

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, validateForm } = formik;
  console.log(defectCausesNameDropdown)
  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Typography sx={{textDecoration: 'underline'}}>Defect Symptoms</Typography>
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
                    disabled={actionType === 'Check' || isEdit}
                  />
                  <Dropdown
                    {...getFieldProps('productGroup')}
                    id="productGroup"
                    name="productGroup"
                    label="Product Group"
                    onChange={handleChange}
                    groupId="D015000"
                    errorMessage={touched.productGroup && errors.productGroup}
                    disabled={actionType === 'Check' || isEdit}
                  />
                  <Dropdown
                    {...getFieldProps('processTypeName')}
                    id="processTypeName"
                    name="processTypeName"
                    label="Process Type Name"
                    onChange={(e) => {
                      handleChange(e);
                      handleChangeProcessTypeName(e);
                      setFieldValue('processName', '');
                      setFieldValue('processCode', '');
                    }}
                    groupId="D014000"
                    disabled={actionType === 'Check' || isEdit}
                    errorMessage={touched.processTypeName && errors.processTypeName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('symptClassName')}
                    id="symptClassName"
                    name="symptClassName"
                    label="Sympt Class Name"
                    onChange={(e) => {
                      setFieldValue('symptClassName', e.target.value)
                      setFieldValue('symptClassCode', dsClassNameDropdown.find(el => el.value === e.target.value)?.code)
                    }}
                    options={dsClassNameDropdown}
                    defaultValue=""
                    errorMessage={touched.symptClassName && errors.symptClassName}
                    disabled={actionType === 'Check' || isEdit}
                    required
                  />
                  <TextField
                    {...getFieldProps('symptClassCode')}
                    id="symptClassCode"
                    fullWidth
                    name="symptClassCode"
                    label="Sympt Class Code"
                    value={values.symptClassCode}
                    errorMessage={touched.symptClassCode && errors.symptClassCode}
                    disabled
                  />
                  <Dropdown
                    {...getFieldProps('level')}
                    id="level"
                    name="level"
                    label="Defect Level"
                    onChange={handleChange}
                    groupId="D056000"
                    disabled={actionType === 'Check' || isEdit}
                    errorMessage={touched.level && errors.level}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('defectSymptName')}
                    id="defectSymptName"
                    name="defectSymptName"
                    label="Defect Sympt Name"
                    onChange={(e) => {
                      setFieldValue('defectSymptName', e.target.value)
                      setFieldValue('defectSymptCode', dsDetailNameDropdown.find(el => el.value === e.target.value)?.code)
                    }}
                    required
                    options={dsDetailNameDropdown}
                    errorMessage={touched.defectSymptName && errors.defectSymptName}
                    disabled={actionType === 'Check' || isEdit}
                  />
                  <TextField
                    {...getFieldProps('defectSymptCode')}
                    id="defectSymptCode"
                    fullWidth
                    name="defectSymptCode"
                    label="Defect Sympt Code"
                    value={values.defectSymptCode}
                    errorMessage={touched.defectSymptCode && errors.defectSymptCode}
                    disabled={actionType === 'Check' || isEdit}
                  />
                  <TextField
                    {...getFieldProps('sortOrder')}
                    id="sortOrder"
                    fullWidth
                    name="sortOrder"
                    label="Sort Order"
                    error={Boolean(touched.sortOrder && errors.sortOrder)}
                    helperText={touched.sortOrder && errors.sortOrder}
                    onChange={handleChange}
                    disabled={actionType === 'Check'}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('processName')}
                    id="processName"
                    name="processName"
                    label="Process Name"
                    onChange={(e) => {
                      setFieldValue('processName', e.target.value)
                      setFieldValue('processCode', commonDropdown.processDropdown.find(el => el.value === e.target.value)?.code)
                    }}
                    options={processDropdown}
                    errorMessage={touched.processName && errors.processName}
                    disabled={actionType === 'Check' || isEdit}
                  />
                  <TextField
                    {...getFieldProps('processCode')}
                    id="processCode"
                    fullWidth
                    name="processCode"
                    label="Process Code"
                    value={values.processCode}
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
                    disabled={actionType === 'Check' || isEdit}
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <Typography sx={{textDecoration: 'underline'}}>Defect Cause</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('causesClassName')}
                    id="causesClassName"
                    name="causesClassName"
                    label="Causes Class Name"
                    onChange={(e) => {
                      setFieldValue('causesClassCode', causesClNameDropdown.find(dd => dd.value === e.target.value)?.code)
                      setFieldValue('causesClassName', e.target.value)
                    }}
                    required
                    options={causesClNameDropdown}
                    defaultValue=""
                    errorMessage={touched.causesClassName && errors.causesClassName}
                  />
                  <TextField
                    {...getFieldProps('causesClassCode')}
                    id="causesClassCode"
                    name="causesClassCode"
                    label="Causes Class Code"
                    fullWidth
                    value={values.causesClassCode}
                    disabled
                    errorMessage={touched.causesClassCode && errors.causesClassCode}
                  />
                  <Dropdown
                    {...getFieldProps('stateDefectCause')}
                    id="stateDefectCause"
                    name="stateDefectCause"
                    label="User (Y/N)"
                    onChange={handleChange}
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    errorMessage={touched.stateDefectCause && errors.stateDefectCause}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('defectCausesName')}
                    id="defectCausesName"
                    name="defectCausesName"
                    label="Defect Causes Name"
                    onChange={(e) => {
                      setFieldValue('defectCausesCode', defectCausesNameDropdown.find(dd => dd.value === e.target.value)?.code)
                      setFieldValue('defectCausesName', e.target.value)
                    }}
                    options={causesClNameDropdown.filter(e => e.defectCause === values.causesClassCode)}
                    defaultValue=""
                    errorMessage={touched.defectCausesName && errors.defectCausesName}
                    required
                  />
                  <TextField
                    {...getFieldProps('defectCausesCode')}
                    id="defectCausesCode"
                    name="defectCausesCode"
                    label="Defect Causes Code"
                    fullWidth
                    value={values.defectCausesCode}
                    disabled
                    errorMessage={touched.defectCausesCode && errors.defectCausesCode}
                  />
                  <TextField
                    id=''
                    fullWidth
                    disabled
                  />
                </Stack>
                <Stack direction='row' justifyContent='flex-end' spacing={{ xs: 3, sm: 2 }}>
                    <Button type='submit' variant='outlined'>Add</Button>
                    <Button variant='outlined' onClick={handleModify}>Modify</Button>
                    <Button variant='outlined' onClick={handleDelete}>Delete</Button>
                </Stack>
              </Stack>
              <Card sx={{ px: 1, py: 2, height: 400, mt: 2 }}>
                    <AgGrid
                        columns={columns}
                        rowData={listCause}
                        className={themeAgGridClass}
                        // onGridReady={onGridReady}
                        onSelectionChanged={onSelectionChanged}
                        rowSelection="single"
                        width="100%"
                        height="100%"
                    />
                    </Card>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate('button.cancel')}
          </Button>
          <LoadingButton variant="contained" loading={isSubmitting} loadingIndicator="Loading..." onClick={() => {handleOpenConfirmModal();}}>
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          onClose={handleCloseConfirmModal}
          open={isOpenConfirmModal}
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
