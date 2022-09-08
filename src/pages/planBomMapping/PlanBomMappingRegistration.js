import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { AgGridReact } from 'ag-grid-react';
import { LoadingButton } from '@material-ui/lab';
import axios from 'axios';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { UploadMultiFile } from '../../components/upload';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// redux
import { useDispatch } from '../../redux/store';
import { fDate } from '../../utils/formatTime';
import useSettings from '../../hooks/useSettings';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
import { setSelectedWidget } from '../../redux/slices/page';
import { getBizPartnerCodeDropdown } from '../../redux/slices/bizPartnerManagement';
import { getDevStatusCommon } from '../../redux/slices/common';
import { isNullVal, getSafeValue } from '../../utils/formatString';

const pageCode = 'menu.production.productionManagement.foolProofManagement.verfication.planBomMapping';
const tableCode = 'modifyPlanBomMapping';

const useStyles = makeStyles({
  customAccordionSummary: {
    justifyContent: 'space-between !important',
    alignItems: 'center'
  }
});

// ----------------------------------------------------------------------

PlanBomMappingRegistration.propTypes = {
  isEdit: PropTypes.bool,
  isView: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  action: PropTypes.string,
  isOpenActionModal: PropTypes.bool
};

export default function PlanBomMappingRegistration({
  isEdit,
  currentData,
  onCancel,
  onLoadData,
  action,
  isView,
  isOpenActionModal
}) {
  const dispatch = useDispatch();
  const { themeAgGridClass } = useSettings();
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { devStatusCommon } = useSelector((state) => state.common);
  const { translate, currentLang } = useLocales();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, userGridConfig, funcPermission } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [shift, setShift] = useState('');
  const [selectedLength, setSelectedLength] = useState(0);
  const [selectedData, setselectedData] = useState({});
  const [actionBom, setActionBom] = useState('Add');
  const [curDevStatus, setCurDevStatus] = useState({
    value: '',
    label: ''
  });
  const [valuesForm, setValuesForm] = useState({});
  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [curSupplier, setCurSupplier] = useState({
    value: '',
    label: ''
  });

  const [calTypeAction, setCalTypeAction] = useState('BOM Rate');
  const [listDeletedBom, setListDeletedBom] = useState([]);
  const [listChild, setListChild] = useState(
    currentData.map((e) => ({
      childMatCode: e?.childCode?.code,
      calType: e.calType,
      poPlanQty: e.planQty,
      bomStatus: e.bomStatus,
      parentCode: e.parentCode?.factoryPk,
      factoryPk: e.productionOrder?.factoryPk,
      versionBom: e.childCode?.version,
      standQty: e.standQty,
      planStandQty: e.poStandQty,
      devStatusName: e.devStatus?.name,
      devStatusCode: e.devStatus?.code,
      revisionDrawing: e.revisionDrawing,
      spec: e.childCode?.spec,
      supplierName: bizPartnerCodeDropdown.find((el) => el.value === e.supplier)?.label,
      supplier: e.supplier,
      planLossQty: e.poLossQty,
      testQty: e.testQtyParent,
      testQtyBom: e.testQty,
      remark: e.remark,
      use: 'Y',
      useValue: e.stateChild,
      mathDescriptionBom: e.childCode?.description,
      materialIdBom: e.childCode?.materialId,
      stateChild: 'RUNNING',
      state: 'RUNNING',
      childCodeFactoryPk: e.childCode?.factoryPk,
      pk: e.pk,
      parentVersion: e.parentVersion,
      validFrom: e.validFrom,
      validTo: e.validTo,
      lossQty: e.lossQty

      // factory: e.plan.pk.factoryCode,
      // poNo: e.plan.prodOrderNo,
      // planId: e.plan.planId,
      // planDate: e.plan.planDate,
      // planQty: e.poPlanQty,
      // parentMaterialCode: e.parentCode.code,
      // version: e.plan.version,
      // materialId: e.childCode.materialId,
      // textQty:
    }))
  );

  useEffect(() => {
    dispatch(getBizPartnerCodeDropdown());
    dispatch(getDevStatusCommon());
  }, [dispatch]);

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

  useEffect(() => {
    if (gridApi) {
      gridApi.forEachNode((node) => {
        if (shift !== '') {
          node.setSelected(node.data.shiftName === shift);
        } else {
          node.setSelected(false);
        }
      });
    }
  }, [shift, selectedLength]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setActionBom('');
    } else if (rowCount === 1) {
      const selectRowData = event.api.getSelectedNodes()[0].data;
      setActionBom('Edit');

      setMaterialCode({
        value: selectRowData?.childCodeFactoryPk,
        label: selectRowData?.childMatCode,
        materialDescription: selectRowData?.mathDescriptionBom,
        materialId: selectRowData?.materialIdBom
      });
      setCurDevStatus({
        value: selectRowData.devStatusCode,
        label: selectRowData.devStatusName
      });
      setCurSupplier({
        value: selectRowData?.supplier || '',
        label: selectRowData?.supplierName || ''
      });
      setselectedData(selectRowData);
    }
  };

  const handleChangeTestQty = (testQty) => {
    setFieldValue('testQty', testQty);
    if (values.calType === 'BOM Rate') {
      setFieldValue('testQtyBom', values?.standardQty * testQty);
    } else if (values.calType === 'No Test') {
      setFieldValue('testQtyBom', 0);
    }
  };

  // const handleChangeStandardQty = (standardQty) => {
  //   setCurStandardQty()
  // }
  const handleChangeMaterialCode = (materialCode) => {
    const currentMaterialCode = listChild
      .map((matr) => ({
        value: matr.childCodeFactoryPk,
        label: matr.childMatCode,
        materialDescription: matr.mathDescriptionBom,
        materialId: matr.materialIdBom
      }))
      .filter((material) => material.value === materialCode);
    setMaterialCode(currentMaterialCode[0] || { value: '', label: '' });
    setFieldValue('materialCode', getSafeValue(materialCode));
    setFieldValue('mathDescriptionBom', getSafeValue(currentMaterialCode[0]?.materialDescription));
    setFieldValue('materialIdBom', getSafeValue(currentMaterialCode[0]?.materialId));
  };

  const handleChangeDevelopmentStatus = (devStatus) => {
    const currentDevStatus = devStatusCommon.find((status) => status.value === devStatus);
    setCurDevStatus(currentDevStatus || { value: '', label: '' });
  };
  const handleChangeSupplier = (supplier) => {
    const currentSupplier = bizPartnerCodeDropdown.find((partner) => partner.value === supplier);
    setFieldValue('supplier', supplier);
    setCurSupplier(currentSupplier || { value: '', label: '' });
  };
  const handleChangeStandardQty = (standardQty) => {
    const childPlanQty = values?.planQty * standardQty;
    const loss = values?.lossQty;
    setFieldValue('standardQty', standardQty);
    setFieldValue('planStandQty', childPlanQty);
    setFieldValue('testQtyBom', values?.testQty * standardQty);
    setFieldValue('planLossQty', (childPlanQty * loss) / 100);
  };

  const handleAddBom = () => {
    if (!values.childMatCode || !values.standardQty) {
      enqueueSnackbar(translate(`Please fill in Child Material Code and Standard Qty`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (values.standardQty <= 0) {
      enqueueSnackbar(translate(`Standard quantity must be greater than 0`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      const testQty = values.testQty * values.standQty;

      const isExisted = listChild.some((data) => data.childCodeFactoryPk === materialCode?.value);

      if (isExisted) {
        enqueueSnackbar(translate(`Child material code exist`), {
          variant: 'warning',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      } else {
        setListChild([
          ...listChild,
          {
            childMatCode: materialCode.label,
            poPlanQty: values.planQty,
            calType: values?.calType,
            parentCode: selectedData?.parentCode,
            versionBom: values.versionBom,
            factoryPk: selectedData?.factoryPk,
            standQty: values.standardQty,
            planQty: values.planQty,
            planStandQty: values.planStandQty,
            devStatusName: curDevStatus.label,
            devStatusCode: curDevStatus.value,
            revisionDrawing: values.revisionDrawing,
            supplier: curSupplier.value,
            supplierName: curSupplier.label,
            planLossQty: values.planLossQty,
            testQtyParent: values.testQty,
            testQty: values.testQtyBom,
            remark: values.remark,
            use: values.use === 'RUNNING' ? 'Y' : 'N',
            childCodeFactoryPk: selectedData?.childCodeFactoryPk,
            pk: {
              factoryCode: selectedData?.pk?.factoryCode
            },
            bomStatus: selectedData?.bomStatus,
            parentVersion: values.version,
            state: 'RUNNING',
            validTo: selectedData?.validTo,
            validFrom: values.validFrom,
            lossQty: values.lossQty
          }
        ]);
      }
    }
  };

  const handleModifyBom = () => {
    if (!values.childMatCode || !values.standardQty) {
      enqueueSnackbar(translate(`Please fill in Child Material Code and Standard Qty`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (values.standardQty <= 0) {
      enqueueSnackbar(translate(`Standard quantity must be greater than 0`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      const testQty = values.testQty * values.standQty;

      if (materialCode.value) {
        const filterListChild = listChild.filter((e) => e.childCodeFactoryPk !== materialCode.value);
        setListChild([
          ...filterListChild,
          {
            childMatCode: materialCode.label,
            poPlanQty: values.planQty,
            calType: values.calType,
            parentCode: selectedData.parentCode,
            parentVersion: values.version,
            versionBom: values.versionBom,
            standQty: values.standardQty,
            factoryPk: selectedData.factoryPk,
            planQty: values.planQty,
            planStandQty: values.planStandQty,
            devStatusName: curDevStatus.label,
            devStatusCode: curDevStatus.value,
            revisionDrawing: values.revisionDrawing,
            supplier: curSupplier.value,
            supplierName: curSupplier.label,
            planLossQty: values.planLossQty,
            testQtyParent: values.testQty,
            testQty: values.testQtyBom,
            remark: values.remark,
            use: values.use === 'RUNNING' ? 'Y' : 'N',
            childCodeFactoryPk: selectedData.childCodeFactoryPk,
            pk: selectedData.pk,
            bomStatus: selectedData.bomStatus,
            state: 'RUNNING',
            validFrom: values.validFrom,
            validTo: selectedData.validTo,
            lossQty: values.lossQty
          }
        ]);
      }
    }
  };

  const handleDeleteBom = () => {
    const deletedBom = listChild
      .filter((e) => e.childCodeFactoryPk === values.childMatCode)
      .map((el) => ({
        state: 'DELETED',
        pk: el.pk
      }));
    setListDeletedBom([...listDeletedBom, ...deletedBom]);
    const filterListChild = listChild.filter((e) => e.childCodeFactoryPk !== materialCode.value);

    setListChild(filterListChild);
  };
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const handleRegisterUser = async () => {
    setSubmitting(true);
    const data = [...listChild, ...listDeletedBom].map((e) => ({
      plan: {
        factoryPk: e?.factoryPk
      },
      poPlanQty: e?.poPlanQty,
      poStandQty: e?.planStandQty,
      poLossQty: e?.planLossQty,
      parentVersion: e?.parentVersion,
      stateParent: 'RUNNING',
      testQtyParent: Number(e?.testQtyParent),
      childCode: {
        factoryPk: e?.childCodeFactoryPk
      },
      childVersion: e?.versionBom,
      standQty: Number(e?.standQty),
      lossQty: e?.lossQty,
      testQty: Number(e?.testQty),
      calType: e?.calType,
      remark: e?.remark,
      devStatus: {
        code: e?.devStatusCode
      },
      revisionDrawing: e?.revisionDrawing,
      supplier: e?.supplier,

      validFrom: e?.validFrom,
      validTo: e?.validTo,
      bomStatus: e?.bomStatus,
      stateChild: e?.state,
      pk: {
        factoryCode: e?.pk?.factoryCode,
        id: e?.pk?.id
      },
      parentCode: {
        factoryPk: e?.parentCode
      }
    }));

    try {
      mutate({
        url: '/v1/po-bom/update',
        data: {
          poBoms: data
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
            enqueueSnackbar('Plan-BOM Mapping was updated successfully', {
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
          formik.setSubmitting(false);
          formik.setErrors(error);
          setSubmitting(false);
        });
    } catch (error) {
      formik.setSubmitting(false);
      formik.setErrors(error);
      setSubmitting(false);
    }
  };

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('factory is required'),

    childMatCode: Yup.string().required('Child Material Code is required'),
    standardQty: Yup.number().required('Standard Qty is required'),
    versionBom: Yup.string(),
    testQty: Yup.number(),
    testQtyBom: Yup.number(),
    use: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: currentData[0].pk.factoryName,
      poNo: currentData[0].productionOrder?.prodOrderNo,
      planID: currentData[0].productionOrder?.planId,
      planDate: currentData[0].productionOrder?.planDate,
      planQty: currentData[0].productionOrder?.planQty,
      testQty: actionBom === 'Edit' ? selectedData.testQty : 0,
      parentMaterialCode: currentData[0].parentCode.code,
      version: currentData[0].parentVersion,
      materialID: currentData[0].parentCode.materialId,
      mathDescription: currentData[0].parentCode.description,
      matSpec: currentData[0].parentCode.spec,
      validFrom: currentData[0].validFrom,
      childMatCode: actionBom === 'Edit' ? selectedData.childMatCode : '',
      standardQty: actionBom === 'Edit' ? selectedData.standQty : '',
      planStandQty: actionBom === 'Edit' ? selectedData.planStandQty : '',
      planLossQty: actionBom === 'Edit' ? selectedData.planLossQty : '',
      mathDescriptionBom: actionBom === 'Edit' ? selectedData.mathDescriptionBom : '',
      materialIdBom: actionBom === 'Edit' ? selectedData.materialIdBom : '',

      versionBom: actionBom === 'Edit' ? selectedData.versionBom : '',
      developmentStatus: actionBom === 'Edit' ? selectedData.devStatusCode : '',
      revisionDrawing: actionBom === 'Edit' ? selectedData.revisionDrawing : '',
      remark: actionBom === 'Edit' ? selectedData.remark : '',
      supplier: actionBom === 'Edit' ? selectedData.supplier : '',
      use: actionBom === 'Edit' ? selectedData.useValue : 'RUNNING',
      testQtyBom: actionBom === 'Edit' ? selectedData.testQtyBom : 0,
      matSpecBom: actionBom === 'Edit' ? selectedData.spec : '',
      calType: actionBom === 'Edit' ? selectedData.calType : '',
      lossQty: actionBom === 'Edit' ? selectedData.lossQty : ''
    },
    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleOpenConfirmModal();
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    }
  });
  const {
    errors,
    touched,
    values,
    isSubmitting,
    setSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <>
              <Card sx={{ px: 1, py: 1 }}>
                <Typography sx={{ mb: 2, textDecoration: 'underline' }} variant="h5">
                  Plan Detail
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Factory"
                      id="factory"
                      name="factory"
                      disabled
                      onChange={handleChange}
                      required
                      value={values.factory}
                      error={Boolean(touched.factory && errors.factory)}
                      errorMessage={touched.factory && errors.factory}
                      helperText={touched.factory && errors.factory}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="poNo"
                      name="poNo"
                      label="PO No"
                      disabled
                      onChange={handleChange}
                      value={values.poNo}
                      // error={Boolean(touched.poNo && errors.poNo)}
                      errorMessage={touched.poNo && errors.poNo}
                      helperText={touched.poNo && errors.poNo}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan ID"
                      disabled
                      id="planID"
                      name="planID"
                      onChange={handleChange}
                      value={values.planID}
                      // error={Boolean(touched.planID && errors.planID)}
                      errorMessage={touched.planID && errors.planID}
                      helperText={touched.planID && errors.planID}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Date"
                      disabled
                      name="planDate"
                      id="planDate"
                      value={values.planDate}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.planDate && errors.planDate}
                      helperText={touched.planDate && errors.planDate}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Qty"
                      name="planQty"
                      id="planQty"
                      disabled
                      value={values.planQty}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.planQty && errors.planQty}
                      helperText={touched.planQty && errors.planQty}
                    />

                    <TextField
                      name="parentMaterialCode"
                      id="parentMaterialCode"
                      autoComplete="off"
                      fullWidth
                      value={values.parentMaterialCode}
                      label="Parent Material Code"
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.parentMaterialCode && errors.parentMaterialCode}
                      helperText={touched.parentMaterialCode && errors.parentMaterialCode}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      name="version"
                      id="version"
                      autoComplete="off"
                      fullWidth
                      label="Version"
                      value={values.version}
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.version && errors.version}
                      helperText={touched.version && errors.version}
                    />

                    <TextField
                      name="materialID"
                      id="materialID"
                      autoComplete="off"
                      fullWidth
                      label="Material ID"
                      value={values.materialID}
                      disabled
                      onChange={handleChange}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.materialID && errors.materialID}
                      helperText={touched.materialID && errors.materialID}
                    />

                    <TextField
                      autoComplete="off"
                      fullWidth
                      type="number"
                      label="Test Qty"
                      name="testQty"
                      id="testQty"
                      value={values.testQty}
                      onChange={(e) => {
                        handleChangeTestQty(e?.target.value);
                      }}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.testQty && errors.testQty}
                      helperText={touched.testQty && errors.testQty}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      name="mathDescription"
                      id="mathDescription"
                      label="Math. Description"
                      disabled
                      value={values.mathDescription}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.mathDescription && errors.mathDescription}
                      helperText={touched.mathDescription && errors.mathDescription}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      name="matSpec"
                      id="matSpec"
                      label="Mat. Spec"
                      value={values.matSpec}
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.matSpec && errors.matSpec}
                      helperText={touched.matSpec && errors.matSpec}
                    />
                    <TextField
                      autoComplete="off"
                      name="validFrom"
                      id="validFrom"
                      value={values.validFrom}
                      fullWidth
                      label="Valid From"
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.validFrom && errors.validFrom}
                      helperText={touched.validFrom && errors.validFrom}
                    />
                  </Stack>
                  <Typography sx={{ mb: 2, textDecoration: 'underline' }} variant="h5">
                    BOM Detail
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Autocomplete
                      id="childMatCode"
                      className="childMatCode-select"
                      name="childMatCode"
                      fullWidth
                      options={listChild.map((matr) => ({
                        value: matr.childCodeFactoryPk,
                        label: matr.childMatCode
                      }))}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={materialCode}
                      onChange={(e, value) => {
                        handleChangeMaterialCode(value?.value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(touched.childMatCode && errors.childMatCode)}
                          helperText={touched.childMatCode && errors.childMatCode}
                          name="childMatCode"
                          label="Child Material Code"
                          variant="outlined"
                          fullWidth
                          required
                        />
                      )}
                    />
                    <TextField
                      autoComplete="off"
                      name="standardQty"
                      id="standardQty"
                      type="number"
                      fullWidth
                      label="Standard Qty"
                      value={values.standardQty}
                      required
                      onChange={(e) => {
                        handleChangeStandardQty(e?.target?.value);
                      }}
                      error={Boolean(touched.standardQty && errors.standardQty)}
                      errorMessage={touched.standardQty && errors.standardQty}
                      helperText={touched.standardQty && errors.standardQty}
                    />
                    <TextField
                      autoComplete="off"
                      name="planStandQty"
                      id="planStandQty"
                      fullWidth
                      label="Child Plan Qty"
                      disabled
                      value={values.planStandQty}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.planStandQty && errors.planStandQty}
                      helperText={touched.planStandQty && errors.planStandQty}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      name="mathDescriptionBom"
                      id="mathDescriptionBom"
                      label="Mat. Description"
                      value={values.mathDescriptionBom}
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.mathDescriptionBom && errors.mathDescriptionBom}
                      helperText={touched.mathDescriptionBom && errors.mathDescriptionBom}
                    />
                    <TextField
                      autoComplete="off"
                      name="materialIdBom"
                      id="materialIdBom"
                      fullWidth
                      label="Material ID"
                      value={values.materialIdBom}
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.materialIdBom && errors.materialIdBom}
                      helperText={touched.materialIdBom && errors.materialIdBom}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="versionBom"
                      name="versionBom"
                      label="Version"
                      value={values.versionBom}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.versionBom && errors.versionBom}
                      helperText={touched.versionBom && errors.versionBom}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="matSpecBom"
                      name="matSpecBom"
                      label="Mat. Spec"
                      value={values.matSpecBom}
                      disabled
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.matSpecBom && errors.matSpecBom}
                      helperText={touched.matSpecBom && errors.matSpecBom}
                    />
                    <Dropdown
                      autoComplete="off"
                      fullWidth
                      name="developmentStatus"
                      id="developmentStatus"
                      label="Development Status"
                      value={curDevStatus.value}
                      // options={[
                      //   {label: 'NE', value: 'NE'}
                      // ]}

                      options={devStatusCommon}
                      onChange={(e) => {
                        handleChangeDevelopmentStatus(e?.target?.value);
                      }}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.developmentStatus && errors.developmentStatus}
                      helperText={touched.developmentStatus && errors.developmentStatus}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      name="revisionDrawing"
                      id="revisionDrawing"
                      label="Revision Drawing"
                      value={values.revisionDrawing}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.revisionDrawing && errors.revisionDrawing}
                      helperText={touched.revisionDrawing && errors.revisionDrawing}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      name="remark"
                      id="remark"
                      label="Remark"
                      value={values.remark}
                      onChange={handleChange}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.remark && errors.remark}
                      helperText={touched.remark && errors.remark}
                    />
                    <Dropdown
                      autoComplete="off"
                      fullWidth
                      name="supplier"
                      id="supplier"
                      label="Supplier"
                      value={values.supplier}
                      options={bizPartnerCodeDropdown}
                      // {[
                      //   {label: 'DJV', value: 'DJV'}
                      // ]}
                      onChange={(e) => {
                        handleChangeSupplier(e?.target.value);
                      }}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.supplier && errors.supplier}
                      helperText={touched.supplier && errors.supplier}
                    />
                    <Dropdown
                      autoComplete="off"
                      fullWidth
                      name="use"
                      id="use"
                      label="Use (Y/N)"
                      onChange={handleChange}
                      allowEmptyOption={false}
                      value={values.use}
                      options={[
                        { label: 'Y', value: 'RUNNING' },
                        { label: 'N', value: 'DELETED' }
                      ]}
                      //   value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.use && errors.use}
                      helperText={touched.use && errors.use}
                    />
                  </Stack>
                  <Typography sx={{ mb: 1 }} variant="h6">
                    Production Loss & Test
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      autoComplete="off"
                      id="lossQty"
                      name="lossQty"
                      type="number"
                      value={values.lossQty}
                      fullWidth
                      label="Loss (%)"
                      onChange={(e) => {
                        const calPlanLossQty = (values.planStandQty * e.target.value) / 100;
                        setFieldValue('planLossQty', calPlanLossQty);
                        setFieldValue('lossQty', e.target.value);
                      }}
                      // value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.lossQty && errors.lossQty}
                      helperText={touched.lossQty && errors.lossQty}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="planLossQty"
                      name="planLossQty"
                      label="Plan Loss Qty"
                      value={values.planLossQty}
                      disabled
                      onChange={handleChange}
                      // value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.planLossQty && errors.planLossQty}
                      helperText={touched.planLossQty && errors.planLossQty}
                    />
                    <Dropdown
                      autoComplete="off"
                      fullWidth
                      id="calType"
                      name="calType"
                      label="Cal Type"
                      value={values.calType}
                      options={[
                        { label: 'BOM Rate', value: 'BOM Rate' },
                        { label: 'Fixed Value', value: 'Fixed Value' },
                        { label: 'No Test', value: 'No Test' }
                      ]}
                      onChange={(e) => {
                        setFieldValue('calType', e?.target?.value);
                        let calTestQty;
                        if (e?.target?.value === 'BOM Rate') {
                          calTestQty = values.standardQty * values.testQty;
                        } else if (actionBom === 'Edit' && e?.target?.value === 'No Test') {
                          calTestQty = 0;
                          setCalTypeAction('No Test');
                        } else if (e?.target?.value === 'Fixed Value') {
                          calTestQty = selectedData.testQty;
                          setCalTypeAction('Fixed Value');
                        }
                        setFieldValue('testQtyBom', calTestQty);
                      }}
                      // value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.calType && errors.calType}
                      helperText={touched.calType && errors.calType}
                    />
                    <TextField
                      autoComplete="off"
                      id="testQtyBom"
                      name="testQtyBom"
                      type="number"
                      fullWidth
                      disabled={values?.calType === 'BOM Rate' || values?.calType === 'No Test'}
                      label="Test Qty"
                      value={values.testQtyBom}
                      onChange={handleChange}
                      // value={values.equipIdCode && equipmentIdDropdown.find(equip => equip.value === values.equipIdCode).name || ''}
                      // error={Boolean(touched.equipIdName && errors.equipIdName)}
                      errorMessage={touched.testQtyBom && errors.testQtyBom}
                      helperText={touched.testQtyBom && errors.testQtyBom}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} justifyContent="end">
                    <Button onClick={handleAddBom} variant="outlined">
                      {translate(`button.add`)}
                    </Button>
                    <Button variant="outlined" onClick={handleModifyBom}>
                      {translate(`button.modify`)}
                    </Button>
                    <Button variant="outlined" onClick={handleDeleteBom}>
                      {translate(`button.delete`)}
                    </Button>
                  </Stack>
                  <Card sx={{ px: 1, py: 2, height: 400 }}>
                    <AgGrid
                      columns={columns}
                      rowData={listChild}
                      className={themeAgGridClass}
                      onGridReady={onGridReady}
                      onSelectionChanged={onSelectionChanged}
                      rowSelection="single"
                      width="100%"
                      height="100%"
                    />
                  </Card>
                </Stack>
              </Card>
            </>
          </Grid>
        </Grid>

        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <Button type="submit" variant="contained">
            {translate(`button.modify`)}
          </Button>
        </DialogActions>

        <DialogAnimate
          title={translate(`typo.confirm`)}
          maxWidth="sm"
          open={isOpenConfirmModal}
          onClose={handleCloseConfirmModal}
        >
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${
            (action === 'Add' && translate(`typo.add`)) || action
          }`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="button"
              variant="contained"
              onClick={handleRegisterUser}
              loading={isSubmitting}
              loadingIndicator="Loading..."
            >
              {translate(`button.modify`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider>
  );
}
