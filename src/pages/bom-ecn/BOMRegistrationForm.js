import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty, isUndefined, get } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// redux
import { setSearchParams } from '../../redux/slices/bomEcnManagement';
import { useDispatch, useSelector } from '../../redux/store';
import { getSafeValue, isNullVal } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

BOMRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function BOMRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const dispatch = useDispatch();
  const { searchParams } = useSelector((state) => state.bomEcnManagement);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowIndex, setRowIndex] = useState(1);
  const [parentMaterialCode, setParentMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [childMaterialCode, setChildMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [parentMaterialCodeValue, setParentMaterialCodeValue] = useState('');
  const [childMaterialCodeValue, setChildMaterialCodeValue] = useState('');
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    const parentMaterialValue = currentData?.parentMaterialValue || '';
    setParentMaterialCodeValue(parentMaterialValue);
    const currentParentMaterial = materialDropdown.filter(
      (material) => material.value === currentData?.parentMaterialCode
    );
    setParentMaterialCode({
      value: currentParentMaterial[0]?.value || '',
      label: currentParentMaterial[0]?.label || ''
    });
    if (isEdit) {
      const childMaterialValue = currentData?.childMaterialValue || '';
      setChildMaterialCodeValue(childMaterialValue);
      const currentChildMaterial = materialDropdown.filter(
        (material) => material.value === currentData?.childMaterialCode && isEdit
      );
      setChildMaterialCode({
        value: currentChildMaterial[0]?.value || '',
        label: currentChildMaterial[0]?.label || ''
      });
      loadListMaterial();
    }
  }, [currentData]);

  const loadListMaterial = async () => {
    if (!isUndefined(currentData?.parentMaterialValue)) {
      const allChildCodes = await query({
        url: '/v1/bom/bom/search',
        featureCode: 'user.create',
        params: {
          factoryCode: currentData?.factory,
          searchBy: 'parent',
          materialCode: currentData?.parentMaterialValue,
          bomStatus: 'SAVED',
          state: 'RUNNING',
          bomVersionParent: currentData?.parentVersion
        }
      });
      if (allChildCodes.data) {
        const newRowData = [];
        allChildCodes.data.forEach((data, idx) => {
          const { supplier } = data;
          const supplierDisplay = data.supplier
            .split(' | ')
            .filter((v) => v !== '')
            .map((v) =>
              get(
                bizPartnerCodeDropdown.find((o = {}) => o.value === v),
                'label'
              )
            )
            .join(' | ');
          newRowData.push({
            factoryPk: data.factoryPk,
            level: data.level,
            bomVersion: data.bomVersion,
            bomStatus: data.bomStatus,
            parentCode: {
              factoryPk: data.parentCode.factoryPk,
              code: data.parentCode.code
            },
            bomVersionParent: data.bomVersionParent,
            testQtyParent: data.testQtyParent,
            stateParent: data.stateParent,
            childCode: {
              factoryPk: data.childCode.factoryPk,
              code: data.childCode.code
            },
            devStatus: {
              code: data.devStatus.code,
              name: data.devStatus.name
            },
            standQty: data.standQty,
            loss: data.loss,
            testQty: data.testQty,
            revisionDrawing: data.revisionDrawing,
            supplier,
            supplierDisplay,
            remark: data.remark,
            calType: data.calType,
            validFrom: data.validFrom,
            pk: {
              factoryCode: data.pk.factoryCode
            },
            state: data.state,
            action: 'KEEP'
          });
        });
        updateData(newRowData);
        setRowIndex(rowIndex + allChildCodes.data.length);
      }
    }
  };

  const handleOpenConfirmModal = () => {
    if (!isEmpty(rowData) || isEdit) {
      setIsOpenConfirmModal(true);
    } else {
      enqueueSnackbar(translate(`message.please_add_at_least_1_BOM`), {
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

  const handleChangeParentMatrCode = (parentMaterialCode) => {
    const currentMatr = materialDropdown.filter((matr) => matr.value === parentMaterialCode);
    setFieldValue('parentMaterialDescription', getSafeValue(currentMatr[0]?.materialDescription));
    setFieldValue('parentMaterialId', getSafeValue(currentMatr[0]?.materialId));
    setFieldValue('parentMaterialName', getSafeValue(currentMatr[0]?.materialName));
    setFieldValue('parentMaterialSpec', getSafeValue(currentMatr[0]?.materialSpec));
    setParentMaterialCodeValue(getSafeValue(currentMatr[0]?.materialCode));
  };

  const handleChangeChildMatrCode = (childMaterialCode) => {
    const currentMatr = materialDropdown.filter((matr) => matr.value === childMaterialCode);
    setFieldValue('childMaterialDescription', getSafeValue(currentMatr[0]?.materialDescription));
    setFieldValue('childMaterialId', getSafeValue(currentMatr[0]?.materialId));
    setFieldValue('childMaterialName', getSafeValue(currentMatr[0]?.materialName));
    setFieldValue('childMaterialSpec', getSafeValue(currentMatr[0]?.materialSpec));
    setFieldValue('childUnit', getSafeValue(currentMatr[0]?.materialMainUnit));
    setChildMaterialCodeValue(getSafeValue(currentMatr[0]?.materialCode));
  };

  const handleChangeCalType = (calType, parentTestQty, childStandQty) => {
    switch (calType) {
      case 'BOM Rate':
        setFieldValue('childTestQty', (isNullVal(parentTestQty) || isNullVal(childStandQty)) ? 0 : parentTestQty * childStandQty);
        break;
      case 'Fixed Value':
      case 'No Test':
      default:
        setFieldValue('childTestQty', 0);
        break;
    }
  };

  const checkValidMatr = async (parentMatr, childMatr) => {
    const isValid = {
      status: true,
      msg: null
    };
    if (parentMatr === childMatr) {
      isValid.status = false;
      isValid.msg = `Parent Code and Child Code must be different`;
      return isValid;
    }
    const uiCheckDuplicate = rowData.filter(
      (row) => row.parentCode.code === parentMatr && row.childCode.code === childMatr
    );
    if (!isEmpty(uiCheckDuplicate)) {
      isValid.status = false;
      isValid.msg = `Invalid Material Relation. Parent Code: ${parentMatr}, Children Code: ${childMatr} already existed.`;
      return isValid;
    }
    const uiCheckSwap = rowData.filter((row) => row.parentCode.code === childMatr && row.childCode.code === parentMatr);
    if (!isEmpty(uiCheckSwap)) {
      isValid.status = false;
      isValid.msg = `Invalid Material Relation. Parent Code: ${parentMatr}, Children Code: ${childMatr}. Already existed BOM with Parent Code: ${childMatr}, Children Code: ${parentMatr}`;
      return isValid;
    }
    const dbCheck = await query({
      url: '/v1/bom/bom/check-recursive',
      featureCode: 'user.create',
      params: {
        parentCode: parentMatr,
        childCode: childMatr,
        bomVersion: values.childVersion,
        bomVersionParent: values.parentVersion,
        state: values.childState,
        featureCode: isEdit ? 'modify' : 'create'
      }
    });
    if (!isEmpty(dbCheck?.data)) {
      isValid.status = false;
      isValid.msg = dbCheck?.data?.message;
    }
    return isValid;
  };

  const handleAddBOM = async () => {
    let supplierDisplay = '';
    let supplier = '';
    if (values?.childSupplier) {
      supplierDisplay = values.childSupplier
        .filter((v) => v !== '')
        .map((v) =>
          get(
            bizPartnerCodeDropdown.find((o = {}) => o.value === v),
            'label'
          )
        )
        .join(' | ');
      supplier = values.childSupplier.filter((v) => v !== '').join(' | ');
    }
    const isValidMatr = await checkValidMatr(parentMaterialCodeValue, childMaterialCodeValue);
    if (isValidMatr.status) {
      validateForm();
      const newRowData = [...rowData];
      const currentFactory = values.factory;
      const currentParentMaterialCode = values.parentMaterialCode;
      const currentParentVersion = values.parentVersion;
      const currentParentMaterialDesc = values.parentMaterialDescription;
      const currentParentMaterialId = values.parentMaterialId;
      const currentParentTestQty = isNullVal(values.parentTestQty) ? 0 : values.parentTestQty;
      const currentParentMaterialSpec = values.parentMaterialSpec;
      const currentParentEffectiveDate = values.parentEffectiveDate;
      const currentParentState = values.parentState;
      const currentParentMatr = materialDropdown.filter((matr) => matr.value === currentParentMaterialCode);
      const currentDevStatus = commonDropdown.commonCodes.filter(
        (commonCode) => commonCode.code === values.childDevStatus
      );
      const newData = {
        factoryPk: `tmpId${rowIndex}`,
        level: rowIndex,
        bomVersion: values.childVersion,
        bomStatus: 'SAVED',
        parentCode: {
          factoryPk: currentParentMaterialCode,
          code: parentMaterialCodeValue
        },
        bomVersionParent: currentParentVersion,
        testQtyParent: currentParentTestQty,
        stateParent: currentParentState,
        childCode: {
          factoryPk: values.childMaterialCode,
          code: childMaterialCodeValue
        },
        devStatus: {
          code: values.childDevStatus,
          name: currentDevStatus[0].name
        },
        standQty: parseFloat(values.childStandQty),
        loss: parseFloat(values.childLoss),
        testQty: isNullVal(values.childTestQty) ? 0 : values.childTestQty,
        revisionDrawing: values.childRevisionDrawing,
        supplier,
        supplierDisplay,
        remark: values.childRemark,
        calType: values.childCalType,
        validFrom: currentParentEffectiveDate,
        pk: {
          factoryCode: values.factory
        },
        state: values.childState,
        action: 'NEW'
      };
      newRowData.push(newData);
      updateData(newRowData);
      setRowIndex(rowIndex + 1);
      resetForm();
      setFieldValue('factory', currentFactory);
      setFieldValue('parentMaterialCode', currentParentMaterialCode);
      setFieldValue('parentVersion', currentParentVersion);
      setFieldValue('parentMaterialDescription', currentParentMaterialDesc);
      setFieldValue('parentMaterialId', currentParentMaterialId);
      setFieldValue('parentTestQty', currentParentTestQty);
      setFieldValue('parentMaterialSpec', currentParentMaterialSpec);
      setFieldValue('parentEffectiveDate', currentParentEffectiveDate);
      setFieldValue('parentState', currentParentState);
      setParentMaterialCode({
        value: currentParentMaterialCode,
        label: `${currentParentMatr[0].materialCode} (${currentParentMaterialId})`
      });
      setChildMaterialCode({
        value: '',
        label: ''
      });
    } else {
      enqueueSnackbar(isValidMatr.msg, {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onFirstDataRendered = () => {
    if (isEdit) {
      const selectedIdx = rowData.findIndex((row) => row.factoryPk === currentData?.factoryPk);
      gridApi.getDisplayedRowAtIndex(selectedIdx).setSelected(true);
    }
  };

  const setChildFieldsData = (data) => {
    let suppliers = [];
    if (data?.supplier) {
      suppliers = data?.supplier.split(' | ').filter((v) => v !== '') || [];
    }
    const currentChildCode = getSafeValue(data.childCode.factoryPk);
    const currentChildMatr = materialDropdown.filter((matr) => matr.value === currentChildCode);
    setFieldValue('childMaterialCode', currentChildCode);
    setFieldValue('childStandQty', data?.standQty || 0);
    setFieldValue('childVersion', getSafeValue(data.bomVersion));
    setFieldValue('childUnit', getSafeValue(currentChildMatr[0]?.materialMainUnit));
    setFieldValue('childMaterialDescription', getSafeValue(currentChildMatr[0]?.materialDescription));
    setFieldValue('childMaterialId', getSafeValue(currentChildMatr[0]?.materialId));
    setFieldValue('childMaterialSpec', getSafeValue(currentChildMatr[0]?.materialSpec));
    setFieldValue('childDevStatus', getSafeValue(data?.devStatus?.code));
    setFieldValue('childRevisionDrawing', getSafeValue(data?.revisionDrawing));
    setFieldValue('childSupplier', suppliers);
    setFieldValue('childLoss', data?.loss || 0);
    setFieldValue('childCalType', getSafeValue(data?.calType));
    setFieldValue('childTestQty', data?.testQty || 0);
    setFieldValue('childRemark', getSafeValue(data?.remark));
    setFieldValue('childState', getSafeValue(data?.state));
    setChildMaterialCode({
      value: currentChildCode,
      label: `${currentChildMatr[0].materialCode} (${currentChildMatr[0].materialId})`
    });
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setChildFieldsData(event.api.getSelectedNodes()[0].data);
      setSelectedRowId(selectedId);
    }
  };

  const onClickDelete = () => {
    if (selectedRowId) {
      const currentRowData = rowData.filter((data) => data.factoryPk !== selectedRowId);
      updateData(currentRowData);
      resetForm();
      setChildMaterialCode({
        value: '',
        label: ''
      });
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
  const handleChangeDropdownMulti = (field, event, options) => {
    const {
      target: { value }
    } = event;

    if (value[value.length - 1] === 'all') {
      setFieldValue(field, value.length === options.length + 1 ? [] : options.map((a) => a.value));

      return;
    }

    setFieldValue(field, typeof value === 'string' ? value.split(',') : value);
  };

  const getAllBizPartnerDropdown = () => {
    const dropdown = bizPartnerCodeDropdown.filter((biz) => biz.factory === values.factory && biz.type === 'D028002');
    return dropdown;
  };

  const onClickModify = () => {
    let supplierDisplay = '';
    let supplier = '';
    if (values?.childSupplier) {
      supplierDisplay = values.childSupplier
        .filter((v) => v !== '')
        .map((v) =>
          get(
            bizPartnerCodeDropdown.find((o = {}) => o.value === v),
            'label'
          )
        )
        .join(' | ');
      supplier = values.childSupplier
        .filter((v) => v !== '')
        .filter((v) => v !== '')
        .join(' | ');
    }
    if (selectedRowId) {
      const currentRowData = [...rowData];
      const selectedIdx = currentRowData.findIndex((row) => row.factoryPk === selectedRowId);
      const currentDevStatus = commonDropdown.commonCodes.filter(
        (commonCode) => commonCode.code === values.childDevStatus
      );
      let action = 'KEEP';
      if (currentRowData[selectedIdx].factoryPk.includes('tmpId')) {
        action = 'NEW';
      } else {
        action = values.childState === 'HIDDEN' ? 'DELETE' : 'CHANGE';
      }
      currentRowData[selectedIdx] = {
        ...currentRowData[selectedIdx],
        bomVersion: values.childVersion,
        childCode: {
          factoryPk: values.childMaterialCode,
          code: childMaterialCodeValue
        },
        devStatus: {
          code: values.childDevStatus,
          name: currentDevStatus[0].name
        },
        standQty: parseFloat(values.childStandQty),
        loss: parseFloat(values.childLoss),
        testQty: isNullVal(values.childTestQty) ? 0 : values.childTestQty,
        revisionDrawing: values.childRevisionDrawing,
        supplier,
        supplierDisplay,
        remark: values.childRemark,
        calType: values.childCalType,
        pk: {
          factoryCode: values.factory
        },
        state: values.childState,
        action
      };
      setSelectedRowId(null);
      updateData(currentRowData);
      resetForm();
      setChildMaterialCode({
        value: '',
        label: ''
      });
    } else {
      enqueueSnackbar(translate(`message.please_select_at_least_1_material`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const clearMatr = () => {
    setParentMaterialCode({
      value: '',
      label: ''
    });
    setChildMaterialCode({
      value: '',
      label: ''
    });
  };

  const onSaveBOM = async () => {
    setSubmitting(true);
    const newData = rowData.filter((row) => row.action === 'NEW');
    const changeData = rowData.filter((row) => row.action === 'CHANGE');
    const deleteData = rowData.filter((row) => row.action === 'DELETE');
    let registerStatus = false;
    let modifyStatus = false;
    if (isEmpty(changeData) && isEmpty(deleteData)) {
      modifyStatus = true;
    }
    if (!isEmpty(changeData) || !isEmpty(deleteData)) {
      const deletedDto = deleteData.map((row) => ({
        factoryPk: row.factoryPk,
        state: 'HIDDEN'
      }));
      try {
        await mutate({
          url: '/v1/bom/bom/update-v2',
          data: {
            bomList: [...changeData, ...deletedDto]
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              modifyStatus = true;
              enqueueSnackbar(translate(`message.update_BOM_successful`), {
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

    if (!isEmpty(newData)) {
      newData.forEach((row) => {
        delete row.action;
        delete row.factoryPk;
      });
      try {
        await mutate({
          url: '/v1/bom/bom/create',
          data: {
            bomList: newData
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              registerStatus = true;
              enqueueSnackbar(translate(`message.register_BOM_successful`), {
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
      registerStatus = true;
    }
    if (registerStatus && modifyStatus) {
      resetForm();
      setSubmitting(false);
      clearMatr();
      onLoadData();
      setIsOpenConfirmModal(false);
      onCancel();
    }
  };
  
  const BOMSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    parentMaterialCode: Yup.string().required('Parent Material Code is required'),
    parentVersion: Yup.string(),
    parentTestQty: Yup.number(),
    parentEffectiveDate: Yup.date().required('Effective Date is required'),
    parentState: Yup.string().required('Use (Y/N) is required'),
    childMaterialCode: Yup.string().required('Child Material Code is required'),
    childStandQty: Yup.number().required('Stand Qty is required').test('greaterThanZero', 'Stand Qty must be greater than 0', value => value ? value > 0 : ''),
    childVersion: Yup.string(),
    childDevStatus: Yup.string().required('Development Status is required'),
    childRevisionDrawing: Yup.string(),
    childSupplier: Yup.array(),
    childState: Yup.string().required('Use (Y/N) is required'),
    childLoss: Yup.number(),
    childCalType: Yup.string(),
    childTestQty: Yup.number()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: currentData?.factory || '',
      parentMaterialCode: currentData?.parentMaterialCode || '',
      parentMaterialId: currentData?.parentMaterialId || '',
      parentMaterialName: currentData?.parentMaterialName || '',
      parentVersion: currentData?.parentVersion || '',
      parentMaterialDescription: currentData?.parentMaterialDescription || '',
      parentMaterialSpec: currentData?.parentMaterialSpec || '',
      parentTestQty: currentData?.parentTestQty || 0,
      parentEffectiveDate: currentData?.parentEffectiveDate || '',
      parentState: currentData?.parentState || 'RUNNING',
      childMaterialCode: '',
      childStandQty: 0,
      childVersion: '',
      childUnit: '',
      childMaterialDescription: '',
      childMaterialId: '',
      childMaterialName: '',
      childDevStatus: '',
      childRevisionDrawing: '',
      childMaterialSpec: '',
      childSupplier: [],
      childLoss: 0,
      childCalType: 'BOM Rate',
      childTestQty: 0,
      childRemark: '',
      childState: 'RUNNING'
    },
    validationSchema: BOMSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleAddBOM();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const formatState = ({ value }) => {
    if (value === 'RUNNING') {
      return 'Y';
    }
    return 'N';
  };

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      clearMatr();
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
    setSubmitting,
    setErrors,
    resetForm,
    validateForm
  } = formik;

  const handleChangeSpecialFields = (field, value) => {
    const _rowData = [...rowData];
    const newRow = _rowData.map((row) => ({
      ...row,
      [field]: value,
      action: 'CHANGE'
    }));
    updateData(newRow);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.BOM_header`)}
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
                      disabled={isEdit || !isEmpty(rowData)}
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />
                    <Autocomplete
                      id="parentMaterialCode"
                      className="parentMaterialCode-select"
                      name="parentMaterialCode"
                      fullWidth
                      options={materialDropdown.filter((matr) => matr.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={parentMaterialCode}
                      onChange={(e, value) => {
                        setParentMaterialCode(value);
                        handleChangeParentMatrCode(value?.value);
                        setFieldValue('parentMaterialCode', getSafeValue(value?.value));
                      }}
                      disabled={isEdit || !isEmpty(rowData)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.parentMaterialCode && errors.parentMaterialCode)}
                          helperText={touched.parentMaterialCode && errors.parentMaterialCode}
                          name="parentMaterialCode"
                          label="Parent Material Code"
                          variant="outlined"
                          fullWidth
                          required
                          size="small"
                          disabled={isEdit || !isEmpty(rowData)}
                        />
                      )}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} sx={{ mt: `1 !important` }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Name"
                      disabled
                      {...getFieldProps('parentMaterialName')}
                      size="small"
                      error={Boolean(touched.parentMaterialName && errors.parentMaterialName)}
                      helperText={touched.parentMaterialName && errors.parentMaterialName}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material ID"
                      disabled
                      {...getFieldProps('parentMaterialId')}
                      size="small"
                      error={Boolean(touched.parentMaterialId && errors.parentMaterialId)}
                      helperText={touched.parentMaterialId && errors.parentMaterialId}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Description"
                      disabled
                      {...getFieldProps('parentMaterialDescription')}
                      size="small"
                      error={Boolean(touched.parentMaterialDescription && errors.parentMaterialDescription)}
                      helperText={touched.parentMaterialDescription && errors.parentMaterialDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Spec"
                      size="small"
                      disabled
                      {...getFieldProps('parentMaterialSpec')}
                      error={Boolean(touched.parentMaterialSpec && errors.parentMaterialSpec)}
                      helperText={touched.parentMaterialSpec && errors.parentMaterialSpec}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Version"
                      {...getFieldProps('parentVersion')}
                      size="small"
                      disabled={isEdit || !isEmpty(rowData)}
                      error={Boolean(touched.parentVersion && errors.parentVersion)}
                      helperText={touched.parentVersion && errors.parentVersion}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Test Qty"
                      size="small"
                      type="number"
                      disabled={!isEdit && !isEmpty(rowData)}
                      {...getFieldProps('parentTestQty')}
                      onChange={(e) => {
                        const {
                          target: { value }
                        } = e;
                        setFieldValue('parentTestQty', value);
                        handleChangeCalType(values.childCalType, value, values.childStandQty);
                        handleChangeSpecialFields('testQtyParent', value);
                      }}
                      error={Boolean(touched.parentTestQty && errors.parentTestQty)}
                      helperText={touched.parentTestQty && errors.parentTestQty}
                    />
                    <DthDatePicker
                      name="parentEffectiveDate"
                      label="Effective Date"
                      value={values.parentEffectiveDate}
                      onChange={(newValue) => {
                        setFieldValue('parentEffectiveDate', fDate(newValue));
                        handleChangeSpecialFields('validFrom', fDate(newValue));
                      }}
                      sx={{ my: 1 }}
                      fullWidth
                      size="small"
                      required
                      disabled={!isEdit && !isEmpty(rowData)}
                      errorMessage={touched.parentEffectiveDate && errors.parentEffectiveDate}
                    />
                    <Dropdown
                      {...getFieldProps('parentState')}
                      id="parentState"
                      name="parentState"
                      label="Use (Y/N)"
                      size="small"
                      required
                      disabled={!isEdit && !isEmpty(rowData)}
                      allowEmptyOption={false}
                      onChange={(e) => {
                        const {
                          target: { value }
                        } = e;
                        setFieldValue('parentState', value);
                        handleChangeSpecialFields('stateParent', value);
                      }}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      errorMessage={touched.parentState && errors.parentState}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.BOM_detail`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Autocomplete
                      id="childMaterialCode"
                      className="childMaterialCode-select"
                      name="childMaterialCode"
                      fullWidth
                      options={materialDropdown.filter((matr) => matr.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={childMaterialCode}
                      onChange={(e, value) => {
                        setChildMaterialCode(value);
                        handleChangeChildMatrCode(getSafeValue(value?.value));
                        setFieldValue('childMaterialCode', getSafeValue(value?.value));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.childMaterialCode && errors.childMaterialCode)}
                          helperText={touched.childMaterialCode && errors.childMaterialCode}
                          name="childMaterialCode"
                          label="Child Material Code"
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
                      label="Stand Qty"
                      size="small"
                      type="number"
                      required
                      {...getFieldProps('childStandQty')}
                      onChange={(e) => {
                        setFieldValue('childStandQty', e.target.value);
                        handleChangeCalType(values.childCalType, values.parentTestQty, e.target.value);
                      }}
                      error={Boolean(touched.childStandQty && errors.childStandQty)}
                      helperText={touched.childStandQty && errors.childStandQty}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Version"
                      {...getFieldProps('childVersion')}
                      size="small"
                      error={Boolean(touched.childVersion && errors.childVersion)}
                      helperText={touched.childVersion && errors.childVersion}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Description"
                      size="small"
                      disabled
                      {...getFieldProps('childMaterialDescription')}
                      error={Boolean(touched.childMaterialDescription && errors.childMaterialDescription)}
                      helperText={touched.childMaterialDescription && errors.childMaterialDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Spec"
                      size="small"
                      disabled
                      {...getFieldProps('childMaterialSpec')}
                      error={Boolean(touched.childMaterialSpec && errors.childMaterialSpec)}
                      helperText={touched.childMaterialSpec && errors.childMaterialSpec}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material ID"
                      disabled
                      {...getFieldProps('childMaterialId')}
                      size="small"
                      error={Boolean(touched.childMaterialId && errors.childMaterialId)}
                      helperText={touched.childMaterialId && errors.childMaterialId}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Material Name"
                      disabled
                      {...getFieldProps('childMaterialName')}
                      size="small"
                      error={Boolean(touched.childMaterialName && errors.childMaterialName)}
                      helperText={touched.childMaterialName && errors.childMaterialName}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Unit"
                      size="small"
                      disabled
                      {...getFieldProps('childUnit')}
                      error={Boolean(touched.childUnit && errors.childUnit)}
                      helperText={touched.childUnit && errors.childUnit}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Remark"
                      size="small"
                      {...getFieldProps('childRemark')}
                      error={Boolean(touched.childRemark && errors.childRemark)}
                      helperText={touched.childRemark && errors.childRemark}
                    />
                    <Dropdown
                      {...getFieldProps('childSupplier')}
                      id="childSupplier"
                      name="childSupplier"
                      label="Supplier"
                      size="small"
                      isMulti
                      onChange={(event) =>
                        handleChangeDropdownMulti('childSupplier', event, getAllBizPartnerDropdown())
                      }
                      allowEmptyOption={false}
                      options={getAllBizPartnerDropdown}
                      errorMessage={touched.childSupplier && errors.childSupplier}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('childDevStatus')}
                      id="childDevStatus"
                      name="childDevStatus"
                      label="Development Status"
                      size="small"
                      required
                      onChange={handleChange}
                      groupId="D017000"
                      errorMessage={touched.childDevStatus && errors.childDevStatus}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Revision Drawing"
                      size="small"
                      {...getFieldProps('childRevisionDrawing')}
                      error={Boolean(touched.childRevisionDrawing && errors.childRevisionDrawing)}
                      helperText={touched.childRevisionDrawing && errors.childRevisionDrawing}
                    />
                    <Dropdown
                      {...getFieldProps('childState')}
                      id="childState"
                      name="childState"
                      label="Use (Y/N)"
                      size="small"
                      required
                      allowEmptyOption={false}
                      onChange={handleChange}
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      errorMessage={touched.childState && errors.childState}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.production_loss_&_test`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Loss (%)"
                      size="small"
                      type="number"
                      {...getFieldProps('childLoss')}
                      error={Boolean(touched.childLoss && errors.childLoss)}
                      helperText={touched.childLoss && errors.childLoss}
                    />
                    <Dropdown
                      {...getFieldProps('childCalType')}
                      id="childCalType"
                      name="childCalType"
                      label="Cal Type"
                      size="small"
                      allowEmptyOption={false}
                      onChange={(e) => {
                        const newValue = e?.target?.value;
                        setFieldValue('childCalType', newValue);
                        handleChangeCalType(newValue, values.parentTestQty, values.childStandQty);
                      }}
                      options={[
                        { value: 'BOM Rate', label: 'BOM Rate' },
                        { value: 'Fixed Value', label: 'Fixed Value' },
                        { value: 'No Test', label: 'No Test' }
                      ]}
                      errorMessage={touched.childCalType && errors.childCalType}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Test Qty"
                      size="small"
                      disabled={['BOM Rate', 'No Test'].includes(values.childCalType)}
                      type="number"
                      {...getFieldProps('childTestQty')}
                      error={Boolean(touched.childTestQty && errors.childTestQty)}
                      helperText={touched.childTestQty && errors.childTestQty}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1, height: '40vh', minHeight: { xs: '40vh' } }}>
          <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={isSubmitting}
              loadingIndicator="Loading..."
              disabled={!isNullVal(selectedRowId)}
            >
              {translate(`button.add`)}
            </LoadingButton>
            <Button
              sx={{ marginLeft: 1 }}
              variant="contained"
              disabled={isNullVal(selectedRowId)}
              onClick={onClickModify}
              size="small"
            >
              {translate(`button.modify`)}
            </Button>
          </Stack>
          <div className={themeAgGridClass} style={{ height: '90%', width: '100%' }}>
            <AgGridReact
              defaultColDef={{
                filter: true,
                sortable: true,
                minWidth: 60,
                resizable: true,
                flex: 1
              }}
              rowData={rowData}
              onGridReady={onGridReady}
              rowSelection="single"
              onSelectionChanged={onSelectionChanged}
              onFirstDataRendered={onFirstDataRendered}
            >
              <AgGridColumn
                filter={false}
                sortable={false}
                checkboxSelection
                flex
                maxWidth="40"
                cellClass="vertical-middle"
              />
              <AgGridColumn
                field="level"
                headerName="No."
                valueGetter="node.rowIndex + 1"
                flex
                maxWidth="60"
                cellClass="vertical-middle"
                sortable={false}
                filter={false}
              />
              <AgGridColumn field="childCode.code" headerName="Child Code" cellClass="vertical-middle" />
              <AgGridColumn field="bomVersion" headerName="Version" cellClass="vertical-middle" />
              <AgGridColumn field="standQty" headerName="Stand Qty" cellClass="vertical-middle" />
              <AgGridColumn field="devStatus.name" headerName="Dev Status" cellClass="vertical-middle" />
              <AgGridColumn field="revisionDrawing" headerName="Revision Drawing" cellClass="vertical-middle" />
              <AgGridColumn field="supplierDisplay" headerName="Supplier" cellClass="vertical-middle" />
              <AgGridColumn field="loss" headerName="Loss (%)" cellClass="vertical-middle" />
              <AgGridColumn field="testQty" headerName="Test Qty" cellClass="vertical-middle" />
              <AgGridColumn field="remark" headerName="Remark" cellClass="vertical-middle" />
              <AgGridColumn
                field="state"
                headerName="Use (Y/N)"
                cellClass="vertical-middle"
                valueFormatter={formatState}
              />
              <AgGridColumn field="action" headerName="Action" cellClass="vertical-middle" />
            </AgGridReact>
          </div>
        </Card>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <Button type="button" variant="contained" onClick={handleOpenConfirmModal} disabled={isEmpty(rowData)}>
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </Button>
          {/* <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">{isEdit ? 'Modify' : 'Register'}</LoadingButton> */}
        </DialogActions>
        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`Do you want to ${
            isEdit ? translate(`typo.modify`) : translate(`typo.register`)
          }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." onClick={onSaveBOM}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
