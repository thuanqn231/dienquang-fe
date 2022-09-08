import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
    Box, Button, Card, DialogActions, Grid,
    Stack, TextField, Typography, Autocomplete
} from '@material-ui/core';
import { isEmpty } from 'lodash-es';
import { LoadingButton } from '@material-ui/lab';
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

// utils
import { getGridConfig } from '../../utils/pageConfig';
import { getSafeValue } from '../../utils/formatString';
import { fDate } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
// ----------------------------------------------------------------------

ProductionGRPlanRegistrationForm.propTypes = {
    isEdit: PropTypes.bool,
    selectedGrId: PropTypes.string,
    onCancel: PropTypes.func,
    onLoadData: PropTypes.func,
    pageCode: PropTypes.string,
    isOpenActionModal: PropTypes.bool,
    onCreateGrSuccess: PropTypes.func
};

const tableCode = 'productionGrPlanRegistrationForm';
const curDateTime = fDate(new Date());

export default function ProductionGRPlanRegistrationForm({ isEdit, selectedGrId, onCancel, onLoadData, pageCode, isOpenActionModal, onCreateGrSuccess }) {
    const { productionOrderDropdown } = useSelector((state) => state.productionOrderManagement);
    const { bizPartnerCodeSingleDropdown } = useSelector((state) => state.bizPartnerManagement);
    const { themeAgGridClass } = useSettings();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { commonDropdown } = useAuth();
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [disabledEdit, setDisabledEdit] = useState(true);
    const [rowIndex, setRowIndex] = useState(1);
    const [poPlanQty, setPoPlanQty] = useState(0);
    const [currentData, setCurrentData] = useState({});
    const [prodOrderNo, setProdOrderNo] = useState({
        value: "",
        label: ""
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
        if (!isEmpty(selectedGrId) && isEdit && isOpenActionModal) {
            query({
                url: `/v1/gr/production/${selectedGrId}`,
                featureCode: 'user.create'
            })
                .then((res) => {
                    const { data } = res;
                    if (data) {
                        const prodOrderNoFactoryPk = data?.productionOrder?.factoryPk;

                        const currentProdOrder = productionOrderDropdown.filter(prodOrder => prodOrder.value === prodOrderNoFactoryPk);
                        const prodOrder = currentProdOrder[0];
                        setCurrentData({
                            factoryPk: data?.factoryPk,
                            factory: data?.pk?.factoryCode,
                            planId: data?.planId,
                            planDate: data?.planDate,
                            prodOrderNoFactoryPk,
                            materialCode: prodOrder.materialCode,
                            materialVersion: prodOrder.bomVersionParent,
                            materialDescription: prodOrder.materialDescription,
                            materialId: prodOrder.materialId,
                            planQty: data?.planQty || 0,
                            line: prodOrder.line,
                            poPlanQty: prodOrder.poPlanQty,
                            poActualQty: prodOrder.poActualQty || 0,
                            grQty: data?.actualQty || 0,
                            grType: data?.grType?.code,
                            process: prodOrder.process,
                            remark: data?.remark
                        });
                        setPoPlanQty(data?.planQty || 0);
                        if (prodOrder) {
                            setProdOrderNo(prodOrder)
                        } else {
                            setProdOrderNo({ value: "", label: "" })
                        }
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [selectedGrId]);

    const handleOpenConfirmModal = () => {
        if (!isEmpty(rowData) || isEdit) {
            setIsOpenConfirmModal(true);
        } else {
            enqueueSnackbar(translate(`message.please_add_at_least_1_purchase_G/R_plan`), {
                variant: 'warning',
                action: (key) => (
                    <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                        <Icon icon={closeFill} />
                    </MIconButton>
                )
            });
        }
    }

    const handleCloseConfirmModal = () => {
        setIsOpenConfirmModal(false);
    }

    const handleChangeProdOrderNo = (prodOrder) => {
        if (prodOrder) {
            const currentProdOrder = productionOrderDropdown.filter(po => po.value === prodOrder?.value);
            setProdOrderNo(currentProdOrder[0] || { value: "", label: "" });
            setFieldValue("prodOrderNo", getSafeValue(prodOrder?.value));
            setFieldValue("materialCode", getSafeValue(prodOrder?.materialCode));
            setFieldValue("materialVersion", getSafeValue(prodOrder?.bomVersionParent));
            setFieldValue("materialDescription", getSafeValue(prodOrder?.materialDescription));
            setFieldValue("materialId", getSafeValue(prodOrder?.materialId));
            setFieldValue("line", getSafeValue(prodOrder?.line));
            setFieldValue("poPlanQty", getSafeValue(prodOrder?.poPlanQty) || 0);
            setFieldValue("poActualQty", getSafeValue(prodOrder?.poActualQty) || 0);
            setFieldValue("process", getSafeValue(prodOrder?.process));
            setPoPlanQty(prodOrder?.poPlanQty || 0);
        } else {
            clearProdOrderNo();
            setFieldValue("prodOrderNo", '');
            setFieldValue("materialCode", '');
            setFieldValue("materialVersion", '');
            setFieldValue("materialDescription", '');
            setFieldValue("materialId", '');
            setFieldValue("line", '');
            setFieldValue("poPlanQty", 0);
            setFieldValue("poActualQty", 0);
            setFieldValue("process", '');
            setPoPlanQty(0);
        }
    }

    const handleAddGrPlan = () => {
        setSubmitting(true);
        validateForm();
        const newRowData = [...rowData];
        const currentFactory = values.factory;
        const currentGrType = values.grType;
        const currentProdOrderNo = values.prodOrderNo;

        const currentProdOrderNoObj = productionOrderDropdown.filter(prodOrder => prodOrder.value === currentProdOrderNo);
        const currentFactoryObj = commonDropdown.factoryDropdown.filter(factory => factory.value === currentFactory);
        const currentGrTypeObj = commonDropdown.commonCodes.filter(commonCode => commonCode.code === currentGrType);

        newRowData.push({
            factoryPk: `tmpId${rowIndex}`,
            planDate: values.planDate,
            factory: currentFactory,
            approvalStatus: {
                code: "D018001"
            },
            grStatus: {
                code: "D019001"
            },
            displayOnly: {
                materialCode: values.materialCode,
                materialVersion: values.materialVersion,
                materialDescription: values.materialDescription,
                materialId: values.materialId,
                line: values.line,
                process: values.process,
            },
            plan: {
                factoryPk: currentProdOrderNo,
                prodOrderNo: currentProdOrderNoObj[0].label,
            },
            planQty: values.planQty,
            grType: {
                code: currentGrType,
                name: currentGrTypeObj[0].name
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
        setFieldValue("factory", currentFactory);
        clearProdOrderNo();
        setSubmitting(false);
    }

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
    }

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
            setDisabledEdit(false)
            // 
        }
    };

    const setFieldsData = (data) => {
        const currentMatrPk = getSafeValue(data?.material?.factoryPk);
        const currentMatr = productionOrderDropdown.filter(matr => matr.value === currentMatrPk);
        setFieldValue("factory", getSafeValue(data?.factory));
        setFieldValue("planDate", getSafeValue(data?.planDate));
        setFieldValue("grType", getSafeValue(data?.grType?.code));
        setFieldValue("purNo", getSafeValue(data?.purOrderNo));
        setFieldValue("planQty", getSafeValue(data?.planQty));
        setFieldValue("remark", getSafeValue(data?.remark));
        setFieldValue("supplier", getSafeValue(data?.supplier?.factoryPk));
        setFieldValue("materialCode", currentMatrPk);
        setFieldValue("materialId", getSafeValue(currentMatr[0]?.materialId));
        setFieldValue("materialDescription", getSafeValue(currentMatr[0]?.materialDescription));
        setProdOrderNo(currentMatr[0] || { value: "", label: "" });
    }

    const clearOldValue = () => {
        resetForm();
        clearProdOrderNo();
        setFieldValue("factory", header.factory);
        setSelectedRowId(null);
        setDisabledEdit(true);
    }

    const onClickModify = () => {
        if (selectedRowId) {
            const currentRowData = [...rowData];
            const selectedIdx = currentRowData.findIndex(row => row.factoryPk === selectedRowId);

            const currentFactory = values.factory;
            const currentMaterialCode = values.materialCode;
            const currentSupplier = values.supplier;
            const currentGrType = values.grType;

            const currentFactoryObj = commonDropdown.factoryDropdown.filter(factory => factory.value === currentFactory);
            const currentMaterialCodeObj = productionOrderDropdown.filter(model => model.value === currentMaterialCode);
            const currentSupplierObj = bizPartnerCodeSingleDropdown.filter(supplier => supplier.value === currentSupplier);
            const currentGrTypeObj = commonDropdown.commonCodes.filter(commonCode => commonCode.code === currentGrType);
            currentRowData[selectedIdx] = {
                ...currentRowData[selectedIdx],
                planDate: values.planDate,
                factory: currentFactory,
                material: {
                    factoryPk: currentMaterialCode,
                    code: currentMaterialCodeObj[0]?.materialCode,
                    materialId: values.materialId,
                    materialDescription: values.materialDescription
                },
                supplier: {
                    factoryPk: currentSupplier,
                    name: currentSupplierObj[0].label
                },
                grType: {
                    code: currentGrType,
                    name: currentGrTypeObj[0].name
                },
                purOrderNo: values.purNo,
                planQty: values.planQty,
                remark: values.remark,
                pk: {
                    factoryCode: currentFactory,
                    factoryName: currentFactoryObj[0].label
                }
            }
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
    }

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
    }

    const clearProdOrderNo = () => {
        setProdOrderNo({
            value: "",
            label: ""
        });
    }

    const onSavePurchaseGrPlan = () => {
        setSubmitting(true);
        if (!isEdit) {
            rowData.forEach((row) => {
                delete row.factoryPk;
                delete row.displayOnly;
            });
            try {
                mutate({
                    url: '/v1/gr/production/create-v2',
                    data: {
                        productionGrList: rowData
                    },
                    method: 'post',
                    featureCode: 'user.create'
                }).then((res) => {
                    if (res.httpStatusCode === 200) {
                        resetForm();
                        setSubmitting(false);
                        clearProdOrderNo();
                        onLoadData();
                        setIsOpenConfirmModal(false);
                        onCancel();
                        onCreateGrSuccess(res.data[0].planId);
                    }
                }).catch((error) => {
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
                    url: '/v1/gr/production/update',
                    data: {
                        productionGRUpdate: {
                            factoryPk: currentData?.factoryPk,
                            planDate: values.planDate,
                            plan: {
                                factoryPk: values.prodOrderNo,
                            },
                            grType: {
                                code: values.grType
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
                }).then((res) => {
                    if (res.httpStatusCode === 200) {
                        resetForm();
                        setSubmitting(false);
                        clearProdOrderNo();
                        onLoadData();
                        setIsOpenConfirmModal(false);
                        onCancel();
                        enqueueSnackbar(translate(`message.production_G/R_plan_was_modified_successfully`), {
                            variant: 'success',
                            action: (key) => (
                                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                                    <Icon icon={closeFill} />
                                </MIconButton>
                            )
                        });
                    }
                }).catch((error) => {
                    setSubmitting(false);
                    setErrors(error);
                });
            } catch (error) {
                setSubmitting(false);
                setErrors(error);
            }
        }
    }
    const ProductionOrderSchema = Yup.object().shape({
        factory: Yup.string().required('Factory is required'),
        planId: Yup.string(),
        materialCode: Yup.string(),
        materialVersion: Yup.string(),
        prodOrderNo: Yup.string().required('Production Order Number is required'),
        materialDescription: Yup.string(),
        materialId: Yup.string(),
        planQty: Yup.number().min(1, 'Plan Qty must greater than 0').max(poPlanQty, 'Plan Qty can not greater than Prod. Plan Qty'),
        line: Yup.string(),
        planDate: Yup.date().required('Plan Date is required'),
        poPlanQty: Yup.number(),
        poActualQty: Yup.number(),
        grQty: Yup.number(),
        grType: Yup.string().required('G/R Type is required'),
        process: Yup.string(),
        remark: Yup.string()
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            factory: isEdit && currentData?.factory || '',
            planId: isEdit && currentData?.planId || '',
            materialCode: isEdit && currentData?.materialCode || '',
            materialVersion: isEdit && currentData?.materialVersion || '',
            prodOrderNo: isEdit && currentData?.prodOrderNoFactoryPk || '',
            materialDescription: isEdit && currentData?.materialDescription || '',
            materialId: isEdit && currentData?.materialId || '',
            planQty: isEdit && currentData?.planQty || 0,
            line: isEdit && currentData?.line || '',
            planDate: isEdit && currentData?.planDate || curDateTime,
            poPlanQty: isEdit && currentData?.poPlanQty || 0,
            poActualQty: isEdit && currentData?.poActualQty || 0,
            grQty: isEdit && currentData?.grQty || 0,
            grType: isEdit && currentData?.grType || '',
            process: isEdit && currentData?.process || '',
            remark: isEdit && currentData?.remark || ''
        },
        validationSchema: ProductionOrderSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                if (isEdit) {
                    setSubmitting(true);
                    handleOpenConfirmModal();
                } else {
                    handleAddGrPlan();
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
            clearProdOrderNo();
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

    const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, validateForm, setSubmitting, setErrors } = formik;

    return (
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Card sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" sx={{ pl: 1 }}>{translate(`typo.production_G/R_plan_detail`)}</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ px: 1, py: 1 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                        <Dropdown
                                            {...getFieldProps('factory')}
                                            id="factory"
                                            name="factory"
                                            label='Factory'
                                            size="small"
                                            required
                                            disabled={!isEmpty(rowData) || isEdit}
                                            onChange={handleChangeFactory}
                                            options={commonDropdown.factoryDropdown}
                                            errorMessage={touched.factory && errors.factory}
                                        />
                                        {isEdit &&
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
                                        }
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="Material Code"
                                            size="small"
                                            disabled
                                            {...getFieldProps('materialCode')}
                                            error={Boolean(touched.materialCode && errors.materialCode)}
                                            helperText={touched.materialCode && errors.materialCode}
                                        />
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="Material Version"
                                            size="small"
                                            disabled
                                            {...getFieldProps('materialVersion')}
                                            error={Boolean(touched.materialVersion && errors.materialVersion)}
                                            helperText={touched.materialVersion && errors.materialVersion}
                                        />
                                    </Stack>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                        <Autocomplete
                                            id="prodOrderNo"
                                            className="prodOrderNo-select"
                                            name="prodOrderNo"
                                            fullWidth
                                            options={productionOrderDropdown.filter((matr) => matr.factory === values.factory)}
                                            getOptionLabel={option => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                                            value={prodOrderNo}
                                            onChange={(e, value) => {
                                                handleChangeProdOrderNo(value);
                                            }}
                                            renderInput={params => (
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
                                            label="G/R Plan Qty"
                                            size="small"
                                            type="number"
                                            required
                                            {...getFieldProps('planQty')}
                                            error={Boolean(touched.planQty && errors.planQty)}
                                            helperText={touched.planQty && errors.planQty}
                                        />
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="Line Info"
                                            size="small"
                                            disabled
                                            {...getFieldProps('line')}
                                            error={Boolean(touched.line && errors.line)}
                                            helperText={touched.line && errors.line}
                                        />
                                        <DthDatePicker
                                            name="planDate"
                                            label="Plan Date"
                                            value={values.planDate}
                                            onChange={(newValue) => {
                                                setFieldValue("planDate", fDate(newValue));
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
                                            label="Prod. Plan Qty"
                                            size="small"
                                            type="number"
                                            disabled
                                            {...getFieldProps('poPlanQty')}
                                            error={Boolean(touched.poPlanQty && errors.poPlanQty)}
                                            helperText={touched.poPlanQty && errors.poPlanQty}
                                        />
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="Prod. Qty"
                                            size="small"
                                            type="number"
                                            disabled
                                            {...getFieldProps('poActualQty')}
                                            error={Boolean(touched.poActualQty && errors.poActualQty)}
                                            helperText={touched.poActualQty && errors.poActualQty}
                                        />
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="G/R Qty"
                                            size="small"
                                            type="number"
                                            disabled
                                            {...getFieldProps('grQty')}
                                            error={Boolean(touched.grQty && errors.grQty)}
                                            helperText={touched.grQty && errors.grQty}
                                        />
                                    </Stack>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                                        <Dropdown
                                            {...getFieldProps('grType')}
                                            id="grType"
                                            name="grType"
                                            label='G/R Type'
                                            size="small"
                                            required
                                            onChange={handleChange}
                                            groupId='D020000'
                                            errorMessage={touched.grType && errors.grType}
                                        />
                                        <TextField
                                            autoComplete="off"
                                            fullWidth
                                            label="Process Type"
                                            size="small"
                                            disabled
                                            {...getFieldProps('process')}
                                            error={Boolean(touched.process && errors.process)}
                                            helperText={touched.process && errors.process}
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
                {!isEdit &&
                    <Card sx={{ pb: 1, height: '30vh', minHeight: { xs: '30vh' } }}>
                        <Stack
                            direction="row"
                            justifyContent="right"
                            display="flex"
                            alignItems="center"
                            sx={{ py: 0.5 }}
                        >
                            <LoadingButton type="submit" variant="contained" size="small" loading={isSubmitting} loadingIndicator="Loading..." disabled={!disabledEdit}>{translate(`button.add`)}</LoadingButton>
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
                            width='100%'
                            height='85%'
                        />
                    </Card>
                }
                <DialogActions>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
                        {translate(`button.cancel`)}
                    </Button>
                    {
                        !isEdit &&
                        <Button type="button" variant="contained" onClick={handleOpenConfirmModal}>
                            {translate(`button.register`)}
                        </Button>
                    }
                    {
                        isEdit &&
                        <LoadingButton type="submit" variant="contained" size="small" loading={isSubmitting} loadingIndicator="Loading...">{translate(`button.modify`)}</LoadingButton>
                    }
                </DialogActions>
                <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
                    <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)}?`}</Typography>
                    <DialogActions>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
                            {translate(`button.cancel`)}
                        </Button>
                        <LoadingButton type="button" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." onClick={onSavePurchaseGrPlan}>
                            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
                        </LoadingButton>
                    </DialogActions>
                </DialogAnimate>
                <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
            </Form>
        </FormikProvider >
    );
}
