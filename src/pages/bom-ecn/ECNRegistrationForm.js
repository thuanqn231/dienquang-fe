import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography, Autocomplete } from '@material-ui/core';
import { isEmpty, get } from 'lodash-es';
import { LoadingButton } from '@material-ui/lab';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
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
// redux
import { useSelector } from '../../redux/store';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import { getSafeValue, isNullVal } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ECNRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

const defaultValidFrom = fDate(new Date());

export default function ECNRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { materialDropdown, approvedBOMDropdown } = useSelector((state) => state.materialMaster);
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, updateCommonDropdown } = useAuth();
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
  const [isExistedECN, setIsExistedECN] = useState(false);
  const [existedEcNo, setExistedEcNo] = useState(null);
  const [existedEcFactoryCode, setExistedEcFactoryCode] = useState(null);

  const [parentMaterialCodeValue, setParentMaterialCodeValue] = useState('');
  const [childMaterialCodeValue, setChildMaterialCodeValue] = useState('');
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    if (!isEmpty(currentData)) {
      const parentMaterialValue = currentData?.parentMaterialValue || '';
      setParentMaterialCodeValue(parentMaterialValue);
      setFieldValue('parentMaterialCode', currentData?.bomId)
      setParentMaterialCode({
        value: currentData?.bomId || '',
        label: `${currentData?.parentMaterialValue} (Version: ${currentData?.parentVersion})`,
        factory: currentData?.factory || '',
        version: isNullVal(currentData?.parentVersion) ? '' : currentData?.parentVersion,
        materialDescription: currentData?.parentMaterialDescription || '',
        materialSpec: currentData?.parentMaterialSpec || '',
        materialMainUnit: currentData?.parentUnit || '',
        materialId: currentData?.parentMaterialId || '',
        materialCode: currentData?.parentMaterialValue || '',
        validFrom: currentData?.validFrom || '',
        testQty: isNullVal(currentData?.parentTestQty) ? 0 : currentData?.parentTestQty
      });
      if (isEdit) {
        const childMaterialValue = currentData?.childMaterialValue || '';
        setFieldValue('childMaterialCode', currentData?.childMaterialCode)
        setChildMaterialCodeValue(childMaterialValue);
        setChildMaterialCode({
          value: currentData?.childMaterialCode,
          label: `${currentData?.childMaterialValue} (${currentData?.childMaterialId})`,
          materialDescription: currentData?.childMaterialDescription,
          materialSpec: currentData?.childMaterialSpec,
          materialMainUnit: currentData?.childUnit,
          materialId: currentData?.childMaterialId,
          materialCode: currentData?.childMaterialValue
        });
        loadListMaterial();
      } else {
        clearMatr();
      }
    }
  }, [currentData]);

  const loadListMaterial = async () => {
    const allChildCodesECN = await query({
      url: '/v1/bom/ecr/search',
      featureCode: 'user.create',
      params: {
        factoryCode: currentData?.factory,
        ecNo: currentData?.ecNo,
        materialCode: currentData?.parentMaterialValue,
        status: 'SAVED',
        ecVersionParent: currentData?.parentVersion,
        ecType: currentData?.ecType
      }
    });

    const newRowData = [];
    if (!isEmpty(allChildCodesECN.data)) {
      allChildCodesECN.data
        .filter((data) => data.action !== 'NEW' || (data.action === 'NEW' && data.state === 'RUNNING'))
        .forEach((data, idx) => {
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
            ecNo: data.ecNo,
            ecType: data.ecType,
            ecVersion: isNullVal(data?.ecVersion) ? '' : data?.ecVersion,
            ecVersionParent: isNullVal(data?.ecVersionParent) ? '' : data?.ecVersionParent,
            bomStatus: data?.bomStatus,
            parentCode: {
              factoryPk: data.parentCode.factoryPk,
              code: data.parentCode.code
            },
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
            validTo: data.validTo,
            pk: {
              factoryCode: data.pk.factoryCode
            },
            state: data.state,
            action: data.action
          });
        });
    }
    updateData(newRowData);
    setRowIndex(rowIndex + allChildCodesECN.data.length);
  };

  const handleOpenConfirmModal = () => {
    if (!isEmpty(rowData) || isEdit) {
      setIsOpenConfirmModal(true);
    } else {
      enqueueSnackbar(translate(`message.please_add_at_least_1_ECN`), {
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
    setSubmitting(false);
    setIsOpenConfirmModal(false);
    formik.resetForm();
    setSubmitting(false);
    clearMatr();
  };

  const handleChangeParentMatrCode = (parentMaterialCode) => {
    setParentMaterialCode(parentMaterialCode);
    setParentMaterialCodeValue(getSafeValue(parentMaterialCode?.materialCode));
    setFieldValue('parentMaterialCode', getSafeValue(parentMaterialCode?.value));
    setFieldValue('parentVersion', isNullVal(parentMaterialCode?.version) ? '' : parentMaterialCode?.version);
    setFieldValue('parentMaterialDescription', getSafeValue(parentMaterialCode?.materialDescription));
    setFieldValue('parentMaterialId', getSafeValue(parentMaterialCode?.materialId));
    setFieldValue('parentMaterialSpec', getSafeValue(parentMaterialCode?.materialSpec));
    setFieldValue('parentUnit', getSafeValue(parentMaterialCode?.materialMainUnit));
    setFieldValue('parentTestQty', isNullVal(parentMaterialCode?.testQty) ? 0 : parentMaterialCode?.testQty);
    loadListChildMatr(parentMaterialCode);
  };

  const handleChangeChildMatrCode = (childMaterialCode) => {
    setFieldValue('childMaterialCode', getSafeValue(childMaterialCode?.value));
    setFieldValue('childMaterialDescription', getSafeValue(childMaterialCode?.materialDescription));
    setFieldValue('childMaterialId', getSafeValue(childMaterialCode?.materialId));
    setFieldValue('childMaterialSpec', getSafeValue(childMaterialCode?.materialSpec));
    setFieldValue('childUnit', getSafeValue(childMaterialCode?.materialMainUnit));
    setChildMaterialCodeValue(getSafeValue(childMaterialCode?.materialCode));
    setChildMaterialCode(childMaterialCode);
  };

  const loadListChildMatr = async (parentCode) => {
    const validDate = new Date(parentCode?.validFrom);
    let response = [];
    const allChildCodesECN = await query({
      url: '/v1/bom/ecr/search',
      featureCode: 'user.create',
      params: {
        factoryCode: parentCode?.factory,
        materialCode: parentCode.materialCode,
        status: 'SAVED',
        ecVersionParent: parentCode?.version,
        ecType: values?.ecType
      }
    });
    let isExistedECN = false;
    if (isEmpty(allChildCodesECN?.data)) {
      response = await loadListChildMatrFromBOM(parentCode);
    } else {
      response = allChildCodesECN?.data;
      isExistedECN = true;
    }

    const newRowData = [];
    let _existedEcNo = null;
    let _existedEcFactoryCode = null;
    if (!isEmpty(response)) {
      response.forEach((data, idx) => {
        let ecVersion;
        let ecVersionParent;
        if (isExistedECN) {
          _existedEcNo = data.ecNo;
          _existedEcFactoryCode = data.pk.factoryCode;
          ecVersion = isNullVal(data?.ecVersion) ? '' : data?.ecVersion;
          ecVersionParent = isNullVal(data?.ecVersionParent) ? '' : data?.ecVersionParent;
        } else {
          ecVersion = isNullVal(data?.bomVersion) ? '' : data?.bomVersion;
          ecVersionParent = isNullVal(data?.bomVersionParent) ? '' : data?.bomVersionParent;
        }
        newRowData.push({
          factoryPk: data.factoryPk,
          ecNo: data.ecNo,
          ecType: values.ecType,
          level: data.level,
          ecVersion,
          ecVersionParent,
          bomStatus: 'SAVED',
          parentCode: {
            factoryPk: data.parentCode.factoryPk,
            code: data.parentCode.code
          },
          bomId: {
            factoryPk: data.bomId || data.factoryPk
          },
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
          testQty: data?.testQty || 0,
          revisionDrawing: data.revisionDrawing,
          supplier: data.supplier,
          remark: data.remark,
          calType: data.calType,
          validFrom: values.validFrom,
          validTo: values.validTo,
          pk: {
            factoryCode: data.pk.factoryCode
          },
          state: data.state,
          action: data?.action || 'KEEP'
        });
      });
    }
    setIsExistedECN(isExistedECN);
    setExistedEcNo(_existedEcNo);
    setExistedEcFactoryCode(_existedEcFactoryCode);
    updateData(newRowData);
    setRowIndex(rowIndex + response.length);
  };

  const loadListChildMatrFromBOM = async (parentCode) => {
    const validDate = new Date(parentCode?.validFrom);
    const allChildCodes = await query({
      url: '/v1/bom/bom/search',
      featureCode: 'user.create',
      params: {
        factoryCode: parentCode?.factory,
        searchBy: 'parent',
        materialCode: parentCode.materialCode,
        bomStatus: 'APPROVED',
        bomVersionParent: parentCode?.version,
        state: 'RUNNING'
      }
    });
    return allChildCodes?.data || [];
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

    const dbCheckECN = await query({
      url: `/v1/bom/ecr/check-recursive`,
      featureCode: 'user.create',
      params: {
        parentCode: parentMatr,
        childCode: childMatr,
        bomVersion: values.childVersion,
        bomVersionParent: values.parentVersion,
        state: values.childState,
        featureCode: 'modify'
      }
    });
    if (!isEmpty(dbCheckECN?.data)) {
      isValid.status = false;
      isValid.msg = dbCheckECN?.data?.message;
    }

    const dbCheckBOM = await query({
      url: `/v1/bom/bom/check-recursive`,
      featureCode: 'user.create',
      params: {
        parentCode: parentMatr,
        childCode: childMatr,
        bomVersion: values.childVersion,
        bomVersionParent: values.parentVersion,
        state: values.childState,
        featureCode: 'modify'
      }
    });
    if (!isEmpty(dbCheckBOM?.data)) {
      isValid.status = false;
      isValid.msg = dbCheckBOM?.data?.message;
    }
    return isValid;
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

  const handleAddECN = async () => {
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
      const currentParentMatr = approvedBOMDropdown.filter((matr) => matr.value === values.parentMaterialCode);
      const currentFactory = values.factory;
      const currentECType = values.ecType;
      const currentValidFrom = values.validFrom;
      const currentValidTo = values.validTo;
      const currentParentMaterialCode = values.parentMaterialCode;
      const currentParentVersion = isNullVal(values.parentVersion) ? '' : values.parentVersion;
      const currentParentMaterialPk = currentParentMatr[0].materialPk;
      const currentParentMaterialDesc = currentParentMatr[0].materialDescription;
      const currentParentMaterialId = currentParentMatr[0].materialId;
      const currentParentTestQty = isNullVal(values.parentTestQty) ? 0 : values.parentTestQty;
      const currentParentMaterialSpec = currentParentMatr[0].materialSpec;
      const currentParentState = values.parentState;
      const currentDevStatus = commonDropdown.commonCodes.filter(
        (commonCode) => commonCode.code === values.childDevStatus
      );
      const insertData = {
        factoryPk: `tmpId${rowIndex}`,
        ecVersion: isNullVal(values.childVersion) ? '' : values.childVersion,
        ecType: currentECType,
        bomStatus: 'SAVED',
        parentCode: {
          factoryPk: currentParentMaterialPk,
          code: parentMaterialCodeValue
        },
        bomId: {
          factoryPk: currentParentMaterialCode
        },
        ecVersionParent: currentParentVersion,
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
        standQty: parseFloat(values.childStandQty || 0),
        loss: parseFloat(values.childLoss || 0),
        testQty: isNullVal(values.childTestQty) ? 0 : values.childTestQty,
        revisionDrawing: values.childRevisionDrawing,
        supplier,
        supplierDisplay,
        remark: values.childRemark,
        calType: values.childCalType,
        validFrom: currentValidFrom,
        validTo: currentValidTo,
        pk: {
          factoryCode: values.factory
        },
        state: values.childState,
        action: 'NEW'
      };
      if (isEdit) {
        insertData.ecNo = currentData.ecNo;
      }
      newRowData.push(insertData);
      updateData(newRowData);
      setRowIndex(rowIndex + 1);
      resetForm(
        currentFactory,
        currentParentMaterialCode,
        currentParentVersion,
        currentParentMaterialDesc,
        currentParentMaterialId,
        currentParentTestQty,
        currentParentMaterialSpec,
        currentParentState,
        currentECType,
        currentValidFrom,
        currentValidTo
      );
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
      const currentChildMatr = materialDropdown.filter((matr) => matr.value === values.childMaterialCode);
      const currentParentMatr = approvedBOMDropdown.filter((matr) => matr.value === values.parentMaterialCode);
      const currentDevStatus = commonDropdown.commonCodes.filter(
        (commonCode) => commonCode.code === values.childDevStatus
      );
      let action = 'KEEP';
      if (currentRowData[selectedIdx].factoryPk.includes('tmpId') || currentRowData[selectedIdx].action === 'NEW') {
        action = 'NEW';
      } else {
        action = values.childState === 'HIDDEN' ? 'DELETE' : 'CHANGE';
      }

      const currentFactory = values.factory;
      const currentECType = values.ecType;
      const currentValidFrom = values.validFrom;
      const currentValidTo = values.validTo;
      const currentParentMaterialCode = values.parentMaterialCode;
      const currentParentVersion = isNullVal(values.parentVersion) ? '' : values.parentVersion;
      const currentParentMaterialDesc = currentParentMatr[0].materialDescription;
      const currentParentMaterialId = currentParentMatr[0].materialId;
      const currentParentTestQty = isNullVal(values.parentTestQty) ? 0 : values.parentTestQty;
      const currentParentMaterialSpec = currentParentMatr[0].materialSpec;
      const currentParentState = values.parentState;

      currentRowData[selectedIdx] = {
        ...currentRowData[selectedIdx],
        ecVersion: isNullVal(values.childVersion) ? '' : values.childVersion,
        childCode: {
          factoryPk: values.childMaterialCode,
          code: currentChildMatr[0].materialCode
        },
        devStatus: {
          code: values.childDevStatus,
          name: currentDevStatus[0].name
        },
        standQty: parseFloat(values.childStandQty || 0),
        loss: parseFloat(values.childLoss || 0),
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
      updateData(currentRowData);
      setSelectedRowId(null);
      resetForm(
        currentFactory,
        currentParentMaterialCode,
        currentParentVersion,
        currentParentMaterialDesc,
        currentParentMaterialId,
        currentParentTestQty,
        currentParentMaterialSpec,
        currentParentState,
        currentECType,
        currentValidFrom,
        currentValidTo
      );
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

  const resetForm = (
    factory,
    parentMaterialCode,
    parentVersion,
    parentMaterialDesc,
    parentMaterialId,
    parentTestQty,
    parentMaterialSpec,
    parentState,
    ecType,
    validFrom,
    validTo
  ) => {
    formik.resetForm();
    setFieldValue('factory', factory);
    setFieldValue('parentMaterialCode', parentMaterialCode);
    setFieldValue('parentVersion', parentVersion);
    setFieldValue('parentMaterialDescription', parentMaterialDesc);
    setFieldValue('parentMaterialId', parentMaterialId);
    setFieldValue('parentTestQty', parentTestQty);
    setFieldValue('parentMaterialSpec', parentMaterialSpec);
    setFieldValue('parentState', parentState);
    setFieldValue('ecType', ecType);
    setFieldValue('validFrom', validFrom);
    setFieldValue('validTo', validTo);
    setParentMaterialCode({
      value: parentMaterialCode,
      label: `${parentMaterialCodeValue} (Version: ${parentVersion})`
    });
    setChildMaterialCode({
      value: '',
      label: ''
    });
  };

  const getAllBizPartnerDropdown = () => {
    const dropdown = bizPartnerCodeDropdown.filter((biz) => biz.factory === values.factory);
    return dropdown;
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

  const setChildFieldsData = (data) => {
    const currentChildCode = getSafeValue(data?.childCode?.factoryPk);
    const currentChildMatr = materialDropdown.filter((matr) => matr.value === currentChildCode);
    setFieldValue('childMaterialCode', currentChildCode);
    setFieldValue('childStandQty', data?.standQty || 0);
    setFieldValue('childVersion', isNullVal(data?.ecVersion) ? '' : data?.ecVersion);
    setFieldValue('childUnit', getSafeValue(currentChildMatr[0]?.materialMainUnit));
    setFieldValue('childMaterialDescription', getSafeValue(currentChildMatr[0]?.materialDescription));
    setFieldValue('childMaterialId', getSafeValue(currentChildMatr[0]?.materialId));
    setFieldValue('childMaterialSpec', getSafeValue(currentChildMatr[0]?.materialSpec));
    setFieldValue('childDevStatus', getSafeValue(data?.devStatus?.code));
    setFieldValue('childRevisionDrawing', getSafeValue(data?.revisionDrawing));
    setFieldValue('childSupplier', getSafeValue(data?.supplier).split(', '));
    setFieldValue('childLoss', isNullVal(data?.loss) ? 0 : data?.loss);
    setFieldValue('childCalType', getSafeValue(data?.calType));
    setFieldValue('childTestQty', isNullVal(data?.testQty) ? 0 : data?.testQty);
    setFieldValue('childRemark', getSafeValue(data?.remark));
    setFieldValue('childState', getSafeValue(data?.state));
    setChildMaterialCode({
      value: currentChildCode,
      label: `${data.childCode.code} (${currentChildMatr[0].materialId})`
    });
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
    if (!isEdit) {
      try {
        const insertData = [];
        rowData.forEach((row) => {
          delete row.factoryPk;
          delete row.ecNo;
          if (values.ecType === 'ECR') {
            delete row.validTo;
          }
          if (row.action !== 'NEW' || (row.action === 'NEW' && row.state === 'RUNNING')) {
            insertData.push(row);
          }
        });
        if (isExistedECN && existedEcFactoryCode && existedEcNo) {
          await mutate({
            url: `/v1/bom/delete-ecr-by-ecno?ecNo=${existedEcNo}&factoryCode=${existedEcFactoryCode}`,
            method: 'delete',
            featureCode: 'user.create'
          });
        }
        mutate({
          url: '/v1/bom/ecr/create',
          data: {
            ecrList: insertData
          },
          method: 'post',
          featureCode: 'user.create'
        })
          .then((res) => {
            if (res.httpStatusCode === 200) {
              formik.resetForm();
              setSubmitting(false);
              clearMatr();
              onLoadData();
              setIsOpenConfirmModal(false);
              onCancel();
              updateCommonDropdown();
              enqueueSnackbar(translate(`message.register_ECN_successful`), {
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
            setSubmitting(false);
            setErrors(error);
          });
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    } else {
      try {
        const newData = rowData.filter((row) => row.action === 'NEW' && row.factoryPk.includes('tmpId'));
        const changeData = rowData.filter(
          (row) => row.action === 'CHANGE' || (row.action === 'NEW' && !row.factoryPk.includes('tmpId'))
        );
        const deleteData = rowData.filter((row) => row.action === 'DELETE');
        let registerStatus = false;
        let modifyStatus = false;
        if (isEmpty(changeData) && isEmpty(deleteData)) {
          modifyStatus = true;
        }
        if (!isEmpty(changeData) || !isEmpty(deleteData)) {
          try {
            await mutate({
              url: '/v1/bom/ecr/update-v2',
              data: {
                ecrList: [...changeData, ...deleteData]
              },
              method: 'post',
              featureCode: 'user.create'
            })
              .then((res) => {
                if (res.httpStatusCode === 200) {
                  modifyStatus = true;
                  enqueueSnackbar(translate(`message.update_ECN_successful`), {
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
            delete row.factoryPk;
            if (values.ecType === 'ECR') {
              delete row.validTo;
            }
          });
          try {
            await mutate({
              url: '/v1/bom/ecr/create',
              data: {
                ecrList: newData
              },
              method: 'post',
              featureCode: 'user.create'
            })
              .then((res) => {
                if (res.httpStatusCode === 200) {
                  registerStatus = true;
                  enqueueSnackbar(translate(`message.register_ECN_successful`), {
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
          formik.resetForm();
          setSubmitting(false);
          clearMatr();
          onLoadData();
          setIsOpenConfirmModal(false);
          onCancel();
        }
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    }
  };

  const BOMSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    ecType: Yup.string().required('EC Type is required'),
    validFrom: Yup.date().required('Valid From is required'),
    validTo: Yup.date().when('ecType', {
      is: 'Temp EC', // just an e.g. you can return a function
      then: Yup.date().required('Valid To is required'),
      otherwise: Yup.date()
    }),
    parentMaterialCode: Yup.string().required('Parent Material Code is required'),
    parentVersion: Yup.string(),
    parentTestQty: Yup.number(),
    parentState: Yup.string().required('Use (Y/N) is required'),
    childMaterialCode: Yup.string().required('Child Material Code is required'),
    childStandQty: Yup.number()
      .required('Stand Qty is required')
      .test('greaterThanZero', 'Stand Qty must be greater than 0', (value) => (value ? value > 0 : '')),
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
      ecType: currentData?.ecType || '',
      validFrom: currentData?.validFrom || defaultValidFrom,
      validTo: currentData?.validTo || '',
      parentMaterialCode: currentData?.parentMaterialCode || '',
      parentMaterialId: currentData?.parentMaterialId || '',
      parentVersion: currentData?.parentVersion || '',
      parentMaterialDescription: currentData?.parentMaterialDescription || '',
      parentMaterialSpec: currentData?.parentMaterialSpec || '',
      parentTestQty: currentData?.parentTestQty || 0,
      parentState: currentData?.parentState || 'RUNNING',
      childMaterialCode: '',
      childStandQty: 0,
      childVersion: '',
      childUnit: '',
      childMaterialDescription: '',
      childMaterialId: '',
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
        handleAddECN();
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
      updateData([]);
      formik.resetForm();
      clearMatr();
      setFieldValue('factory', currentFactory);
      setFieldValue('validFrom', defaultValidFrom);
      setFieldValue('validTo', '');
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

  const handleChangeSpecialFields = (field, value) => {
    const _rowData = [...rowData];
    const newRow = _rowData.map((row) => ({
      ...row,
      [field]: value,
      action: 'CHANGE'
    }));
    updateData(newRow);
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
    setErrors,
    setSubmitting,
    validateForm
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.EC_header`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('ecType')}
                      id="ecType"
                      name="ecType"
                      label="EC Type"
                      size="small"
                      required
                      onChange={handleChange}
                      options={[
                        { value: 'ECR', label: 'ECR' },
                        { value: 'Temp EC', label: 'Temp EC' }
                      ]}
                      disabled={!isEmpty(rowData)}
                      errorMessage={touched.ecType && errors.ecType}
                    />
                    <DthDatePicker
                      name="validFrom"
                      label="Valid From"
                      value={values.validFrom}
                      onChange={(newValue) => {
                        setFieldValue('validFrom', fDate(newValue));
                        handleChangeSpecialFields('validFrom', fDate(newValue));
                      }}
                      sx={{ my: 1 }}
                      fullWidth
                      size="small"
                      required
                      disabled={!isEdit && !isEmpty(rowData)}
                      errorMessage={touched.validFrom && errors.validFrom}
                    />
                    <DthDatePicker
                      name="validTo"
                      label="Valid To"
                      value={values.validTo}
                      onChange={(newValue) => {
                        setFieldValue('validTo', fDate(newValue));
                      }}
                      sx={{ my: 1 }}
                      fullWidth
                      size="small"
                      required={values.ecType === 'Temp EC'}
                      disabled={values.ecType === 'ECR'}
                      errorMessage={touched.validTo && errors.validTo}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      size="small"
                      required
                      disabled={values.validFrom === '' || isEdit || !isEmpty(rowData)}
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />
                    <Autocomplete
                      id="parentMaterialCode"
                      className="parentMaterialCode-select"
                      name="parentMaterialCode"
                      fullWidth
                      disabled={values.factory === '' || values.ecType === '' || isEdit}
                      options={approvedBOMDropdown.filter((bom) => bom.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={parentMaterialCode}
                      onChange={(e, value) => {
                        handleChangeParentMatrCode(value);
                      }}
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
                          disabled={values.factory === '' || values.ecType === '' || isEdit}
                        />
                      )}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Version"
                      {...getFieldProps('parentVersion')}
                      size="small"
                      disabled
                      error={Boolean(touched.parentVersion && errors.parentVersion)}
                      helperText={touched.parentVersion && errors.parentVersion}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} sx={{ mt: `1 !important` }}>
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
                      label="Test Qty"
                      size="small"
                      type="number"
                      disabled={!isEdit && !isEmpty(rowData)}
                      {...getFieldProps('parentTestQty')}
                      onChange={(e, value) => {
                        setFieldValue('parentTestQty', e.target.value);
                        handleChangeCalType(values.childCalType, e.target.value, values.childStandQty);
                        handleChangeSpecialFields('testQtyParent', e.target.value);
                      }}
                      error={Boolean(touched.parentTestQty && errors.parentTestQty)}
                      helperText={touched.parentTestQty && errors.parentTestQty}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
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
                    <Dropdown
                      {...getFieldProps('parentState')}
                      id="parentState"
                      name="parentState"
                      label="Use (Y/N)"
                      size="small"
                      required
                      disabled={!isEdit && !isEmpty(rowData)}
                      allowEmptyOption={false}
                      onChange={handleChange}
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
            {translate(`typo.EC_detail`)}
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
                      options={materialDropdown.filter((material) => material.factory === values.factory)}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={childMaterialCode}
                      onChange={(e, value) => {
                        handleChangeChildMatrCode(value);
                      }}
                      disabled={isEdit && selectedRowId}
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
                          disabled={isEdit && selectedRowId}
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
                      label="Material Spec"
                      size="small"
                      disabled
                      {...getFieldProps('childMaterialSpec')}
                      error={Boolean(touched.childMaterialSpec && errors.childMaterialSpec)}
                      helperText={touched.childMaterialSpec && errors.childMaterialSpec}
                    />
                    <Dropdown
                      {...getFieldProps('childDevStatus')}
                      id="childDevStatus"
                      name="childDevStatus"
                      label="Development Status"
                      size="small"
                      onChange={handleChange}
                      groupId="D017000"
                      required
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
              onClick={onClickModify}
              size="small"
              label="Modify"
              disabled={isNullVal(selectedRowId)}
            >
              {translate(`button.modify`)}
            </Button>
          </Stack>
          <div className={themeAgGridClass} style={{ height: '85%', width: '100%' }}>
            <AgGridReact
              defaultColDef={{
                filter: true,
                flex: 1,
                sortable: true,
                minWidth: 60,
                resizable: true
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
              <AgGridColumn field="ecVersion" headerName="Version" cellClass="vertical-middle" />
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
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={() => {
              clearMatr();
              onCancel();
            }}
          >
            {translate(`button.cancel`)}
          </Button>
          <Button type="button" variant="contained" onClick={handleOpenConfirmModal}>
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
              onClick={onSaveBOM}
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
