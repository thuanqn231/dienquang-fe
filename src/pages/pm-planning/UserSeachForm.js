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
import useLocales from '../../hooks/useLocales';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';

// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
// redux
import { useSelector } from '../../redux/store';
// utils
import { getGridConfig } from '../../utils/pageConfig';
// ----------------------------------------------------------------------

UserSearchForm.propTypes = {
  isSearch: PropTypes.bool,
  selectedGrId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  onCreateGrSuccess: PropTypes.func,
  factory: PropTypes.string,
  onSelectedEmployee: PropTypes.func
};

const tableCode = 'userSearchForm';
const curDateTime = new Date();

export default function UserSearchForm({
  factory,
  isSearch,
  selectedGrId,
  onCancel,
  onLoadData,
  pageCode,
  isOpenActionModal,
  onSelectedEmployee,
  onCreateGrSuccess
}) {
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { bizPartnerCodeSingleDropdown } = useSelector((state) => state.bizPartnerManagement);
  const { themeAgGridClass } = useSettings();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, updateAgGridConfig } = useAuth();
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isChangedTableConfig, setIsChangedTableConfig] = useState(false);
  const { userDropdown } = useSelector((state) => state.userManagement);
  
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState(null);
  const [isSearchEmployee, setIsSearchEmployee] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  const [disabledSearch, setDisabledSearch] = useState(false);
  const { translate, currentLang } = useLocales();
  const [currentData, setCurrentData] = useState({});
  const [materialCode, setMaterialCode] = useState({
    value: '',
    label: ''
  });
  const [header, setHeader] = useState({
    factory: ''
  });

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, tableCode);
    setColumns(tableConfigs);
    updateData(userDropdown);
  }, [userDropdown]);

  useEffect(() => {
    if (!isEmpty(selectedGrId) && isSearch && isOpenActionModal) {
      query({
        url: `/v1/gr/purchase/${selectedGrId}`,
        featureCode: 'user.create'
      })
        .then((res) => {
          const { data } = res;
          if (data) {
            const materialFactoryPk = data?.material?.factoryPk;
            const materialCode = data?.material?.code;
            const currentMaterialCode = materialDropdown.filter((matr) => matr.value === materialFactoryPk);
            setCurrentData({
              factoryPk: data?.factoryPk,
              factory: data?.pk?.factoryCode,
              planId: data?.planId,
              materialCode,
              materialFactoryPk,
              planDate: data?.planDate,
              grType: data?.grType?.code,
              materialId: data?.material?.materialId,
              materialDescription: data?.material?.description,
              purNo: data?.purOrderNo,
              supplier: data?.supplier?.factoryPk,
              planQty: data?.planQty,
              remark: data?.remark
            });
            if (currentMaterialCode[0]) {
              setMaterialCode(currentMaterialCode[0]);
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedGrId]);

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    params.api.addGlobalListener((type, event) => {
      if (['columnPinned', 'columnMoved', 'columnVisible'].indexOf(type) >= 0) {
        setIsChangedTableConfig(true);
      }
    });
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      clearOldValue();
      setSelectedRowId(null);
      setDisabledSearch(false);
    }
    if (rowCount === 1) {
      const currentDepartmentPk = userDropdown.filter(
        (user) => user.department === event.api.getSelectedNodes()[0].data.department
      );

      const selectedId = event.api.getSelectedNodes()[0].data;
      setSelectedRowId(selectedId);
      setDisabledSearch(true);

      //
    }
  };

  const clearOldValue = () => {
    resetForm();

    setFieldValue('factory', header.factory);
    setSelectedRowId(null);
  };

  const onSaveTableConfig = () => {
    const _columns = gridApi.getColumnDefs();
    updateGridConfig(_columns);
    setColumns(_columns);
    setIsChangedTableConfig(false);
  };

  const getEmployees = (values = []) => {
    setIsSearchEmployee(true);
    try {
      query({
        url: '/v1/user/search',
        featureCode: 'user.create',
        params: {
          factoryCode: values?.factory,
          code: values?.employeeNo,
          fullName: values?.employeeName,
          email: values.email,
          userName: values.employeeId,
          departmentPks: values.department
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;
            updateData(
              data.map((row) => ({
                fullName: row.fullName,
                employeeId: row.userName,
                employeeNo: row.code,
                departmentName: row.department.name,
                email: row.email,
                mobileNo: row.mobileNumber
              }))
            );
            resetForm();
            setIsSearchEmployee(false);

            setIsOpenConfirmModal(false);
          }
        })
        .catch((error) => {
          setIsSearchEmployee(false);
          setErrors(error);
        });
    } catch (error) {
      setIsSearchEmployee(false);
      setErrors(error);
    }
  };

  const onEmployeeSelection = () => {
    if (!selectedRowId) {
      enqueueSnackbar(translate(`message.please_select_1_employee`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
     
      onSelectedEmployee(selectedRowId);
      onCancel();
    }
  };
  const EmployeeSearchSchema = Yup.object().shape({
    factory: Yup.string(),
    employeeNo: Yup.number(),
    employeeId: Yup.string(),
    employeeName: Yup.string(),
    department: Yup.string(),
    email: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isSearch && factory) || '',
      employeeNo: '',
      employeeId: '',
      employeeName: '',
      department: '',
      email: ''
    },
    validationSchema: EmployeeSearchSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true);
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });
  const updateGridConfig = async (_columns) => {
    mutate({
      url: '/v1/user/ag-grid-configuration/update',
      data: [
        {
          agGridId: tableCode,
          featureCode: pageCode,
          agGridConfig: JSON.stringify(_columns)
        }
      ],
      method: 'post',
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          updateAgGridConfig();
          enqueueSnackbar(translate(`message.update_grid_successful`), {
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
      });
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

    setErrors
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            Filter
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
                      label={translate(`label.factory`)}
                      size="small"
                      required
                      disabled
                      value={factory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />

                    <TextField
                      {...getFieldProps('employeeNo')}
                      id="employeeNo"
                      name="employeeNo"
                      autoComplete="off"
                      fullWidth
                      label={translate(`label.employeeNo`)}
                      size="small"
                      onChange={handleChange}
                      error={Boolean(touched.planQty && errors.planQty)}
                      helperText={touched.planQty && errors.planQty}
                    />

                    <TextField
                      {...getFieldProps('employeeId')}
                      id="employeeId"
                      name="employeeId"
                      autoComplete="off"
                      fullWidth
                      label={translate(`label.employeeId`)}
                      size="small"
                      onChange={handleChange}
                      error={Boolean(touched.planQty && errors.planQty)}
                      helperText={touched.planQty && errors.planQty}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      {...getFieldProps('employeeName')}
                      id="employeeName"
                      name="employeeName"
                      autoComplete="off"
                      fullWidth
                      label={translate(`label.employeeName`)}
                      size="small"
                      required
                      onChange={handleChange}
                      error={Boolean(touched.planQty && errors.planQty)}
                      helperText={touched.planQty && errors.planQty}
                    />
                    <Dropdown
                      autoComplete="off"
                      fullWidth
                      id="department"
                      name="department"
                      label={translate(`label.department`)}
                      size="small"
                      onChange={handleChange}
                      options={commonDropdown.departmentDropdown.filter(
                        (department) => department.factory === values.factory
                      )}
                      {...getFieldProps('department')}
                      error={Boolean(touched.materialId && errors.materialId)}
                      helperText={touched.materialId && errors.materialId}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="email"
                      name="email"
                      label={translate(`label.email`)}
                      size="small"
                      onChange={handleChange}
                      {...getFieldProps('email')}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ pb: 1, height: '30vh', minHeight: { xs: '30vh' } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            display="flex"
            alignItems="center"
            sx={{ py: 0.5, my: 1 }}
          >
            <Typography justifySelf="left" variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.result`)}
            </Typography>
            <Stack direction="row" pr={1}>
              {' '}
              <LoadingButton
                variant="contained"
                size="small"
                loading={isSubmitting}
                loadingIndicator={translate(`loading.loading`)}
                disabled={disabledSearch}
                onClick={() => {
                  getEmployees(values);
                }}
              >
                {translate(`button.search`)}
              </LoadingButton>
            </Stack>
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

        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />

          <LoadingButton
            type="submit"
            variant="contained"
            size="small"
            loading={isSubmitting}
            onClick={onEmployeeSelection}
            loadingIndicator={translate(`loading.loading`)}
          >
            {translate(`button.select`)}
          </LoadingButton>
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
          {translate(`button.cancel`)}
          </Button>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}
