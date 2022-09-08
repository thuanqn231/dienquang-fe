import closeFill from '@iconify/icons-eva/close-fill';
import searchOutLined from '@iconify/icons-ant-design/search-outlined';
import { Icon } from '@iconify/react';

import {
  Box,
  Button,
  Card,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';

import { mutate, query } from '../../core/api';
import { Dropdown } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
// redux
import { useSelector, useDispatch } from '../../redux/store';
// utils
import { getGridConfig } from '../../utils/pageConfig';
import EmployeeSearchForm from './EmployeeSearchForm';
import { getUserDropdown } from '../../redux/slices/userManagement';
import { getSafeValue } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

LossPicRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  selectedPicId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  currentLossPicData: PropTypes.object,
  notificationGridData: PropTypes.array
};

const tableCode = 'lossPicRegistrationForm';

export default function LossPicRegistrationForm({
  isEdit,
  selectedPicId,
  onCancel,
  onLoadData,
  pageCode,
  currentLossPicData,
  notificationGridData
}) {
  const { lossCategoryDropdown } = useSelector((state) => state.lossManagement);

  const { allLossMasterDropdown } = useSelector((state) => state.lossManagement);

  const { themeAgGridClass } = useSettings();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown } = useAuth();
  const [oldRowData, setOldRowData] = useState([]);

  const [newRowData, setNewRowData] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenPicSearchForm, setIsOpenPicSearchForm] = useState(false);
  const [isOpenReceiverSearchForm, setIsOpenReceiverSearchForm] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [allowAdd, setAllowAdd] = useState(false);
  const [isOpenSearchForm, setIsOpenSearchForm] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [disabledEdit, setDisabledEdit] = useState(true);
  const [receiverData, setReceiverData] = useState([]);
  const [currentPicId, setCurrentPicId] = useState(null);
  const { translate, currentLang } = useLocales();
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentLossPicData?.factory || '');

  const [header, setHeader] = useState({
    factory: ''
  });

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, []);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  useEffect(() => {
    if (!isEmpty(selectedPicId) && isEdit) {
      setFieldValue('factory', getSafeValue(currentLossPicData?.factory));
      setFieldValue('lossCategory', getSafeValue(currentLossPicData?.lossType));
      setFieldValue('classification', getSafeValue(currentLossPicData?.classification));
      setFieldValue('lossDetailCls', getSafeValue(currentLossPicData?.lossCls));
      setFieldValue('state', getSafeValue(currentLossPicData?.state));

      setFieldValue('department', getSafeValue(currentLossPicData?.user?.department?.name));
      if (!selectedRowId && !allowAdd) {
        updateData(notificationGridData);
        setOldRowData(notificationGridData);
      }
    }
  }, [selectedPicId, rowData]);

  useEffect(() => {
    const _categories = getUniqueArray(lossCategoryDropdown);

    setCategories(_categories);
  }, []);

  const getUniqueArray = (array) => {
    const newArray = array
      .map((obj) => ({
        value: obj.code,
        label: obj.label,
        factory: obj.factory
      }))
      .reduce(
        (previous, current) =>
          [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
        []
      );

    return newArray;
  };
  const handleOpenConfirmModal = () => {
    if (!isEmpty(rowData) || isEdit) {
      setIsOpenConfirmModal(true);
    } else {
      enqueueSnackbar(translate(`message.please_add_at_least_1_receiver`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };
  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };
  const handleOpenPicSearchForm = () => {
    setIsOpenSearchForm(true);
    setIsOpenPicSearchForm(true);
    setIsOpenReceiverSearchForm(false);
  };
  const handleOpenReceiverSearchForm = () => {
    setIsOpenSearchForm(true);
    setIsOpenReceiverSearchForm(true);
    setIsOpenPicSearchForm(false);
  };

  const getEmployeeList = (id) => {
    dispatch(getUserDropdown(id));
  };

  const handleCloseSearchForm = () => {
    setIsOpenSearchForm(false);
  };

  const handleDeleteReceiverPic = () => {
    if (selectedRowId) {
      if (!isEdit) {
        const currentRowData = rowData.filter((data) => data.id !== selectedRowId);

        updateData(currentRowData);
        if (isEmpty(currentRowData)) {
          setHeader({
            factory: ''
          });
        }
        setIsOpenDeleteModal(false);
      } else {
        const newRow = oldRowData.findIndex((row) => row.id === selectedRowId);

        if (newRow !== -1) {
          mutate({
            url: `/v1/loss-pic/notification/${selectedRowId}`,
            method: 'delete',
            featureCode: 'user.delete'
          })
            .then((res) => {
              if (res.httpStatusCode === 200) {
                setIsOpenDeleteModal(false);
                setOldRowData(oldRowData.filter((data) => data.id !== selectedRowId));
                const currentRowData = rowData.filter((data) => data.id !== selectedRowId);
                updateData(currentRowData);
                if (isEmpty(currentRowData)) {
                  setHeader({
                    factory: ''
                  });
                }
              }
            })
            .catch((err) => {
              setErrors(err);
            });
        } else {
          setIsOpenDeleteModal(false);
          const _newRowData = newRowData.filter((data) => data.id !== selectedRowId);
          const currentRowData = rowData.filter((data) => data.id !== selectedRowId);
          setNewRowData(_newRowData);
          updateData(currentRowData);
          if (isEmpty(currentRowData)) {
            setHeader({
              factory: ''
            });
          }
        }
      }
    } else {
      enqueueSnackbar(translate(`message.please_select_at_least_1_row`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    }
  };

  const handleAddReceiverPic = (values) => {
    if (!values.receiverId) {
      enqueueSnackbar(translate(`message.must_have_1_receiver`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else if (!isEdit) {
      if (rowData.some((row) => row.fullName === receiverData.fullName)) {
        enqueueSnackbar('Receiver already existed', {
          variant: 'warning',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      } else {
        const _newRowData = [...newRowData];
        _newRowData.push(receiverData);
        setNewRowData(_newRowData);

        const newSearchRowData = [...rowData];

        newSearchRowData.push(receiverData);
        updateData(newSearchRowData);
        setAllowAdd(true);

        setFieldValue('receiverId', '');
      }
    } else if (isEdit) {
      if (rowData.some((row) => row.fullName === receiverData.fullName)) {
        enqueueSnackbar(translate(`message.receiver_already_existed`), {
          variant: 'warning',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      } else {
        const _newRowData = [...newRowData];
        _newRowData.push(receiverData);
        setNewRowData(_newRowData);

        const newSearchRowData = [...rowData];

        newSearchRowData.push(receiverData);
        updateData(newSearchRowData);
        setAllowAdd(true);

        setFieldValue('receiverId', '');
      }
    } else {
      setAllowAdd(true);

      const newRowData = [...rowData];
      newRowData.push(receiverData);
      updateData(newRowData);
      setFieldValue('receiverId', '');
    }
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = () => {
    onLoadProductionOrderData();
  };

  const areEqual = (array1, array2) => {
    if (array1.length === array2.length) {
      return array1.every((element, index) => {
        if (element === array2[index]) {
          return true;
        }

        return false;
      });
    }

    return false;
  };

  const onLoadProductionOrderData = async () => {
    setSelectedRowId(null);
    const response = [];
    updateData(response);
  };
  const handleCloseModel = () => {
    onCancel();
  };

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedRowId(null);
      setDisabledEdit(true);
    }
    if (rowCount === 1) {
      setSelectedRowId(event.api.getSelectedNodes()[0].data.id);
      setDisabledEdit(false);
      //
    }
  };

  const onClickDelete = () => {
    if (!selectedRowId) {
      enqueueSnackbar(translate(`message.please_select_1_item`), {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      handleOpenDeleteModal();
    }
  };

  const onSaveLossPic = () => {
    validateForm();
    setSubmitting(true);

    if (!isEdit) {
      const lossNotifications = rowData.map((row) => ({
        user: {
          factoryPk: row.id
        },
        status: 'SAVE'
      }));

      try {
        query({
          url: 'v1/loss-pic/search',
          featureCode: 'user.create',
          params: {
            lossType: values?.lossCategory,
            classification: values?.classification,
            lossCls: values?.lossDetailCls,
            user: values?.picId,
            state: values?.state
          }
        }).then((res) => {
          if (!isEmpty(res.data)) {
            enqueueSnackbar(translate(`message.this_loss_pic_was_already_created`), {
              variant: 'warning',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
            setIsOpenConfirmModal(false);
          } else {
            mutate({
              url: '/v1/loss-pic/create',
              data: {
                lossPic: {
                  lossType: {
                    code: values?.lossCategory
                  },
                  classification: {
                    code: values?.classification
                  },
                  lossCls: {
                    code: values?.lossDetailCls
                  },
                  user: {
                    factoryPk: currentPicId
                  },
                  lossNotifications
                }
              },
              method: 'post',
              featureCode: 'user.create'
            })
              .then((res) => {
                if (res.httpStatusCode === 200) {
                  enqueueSnackbar(translate(`message.loss_pic_was_registered_successfully`), {
                    variant: 'success',
                    action: (key) => (
                      <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                        <Icon icon={closeFill} />
                      </MIconButton>
                    )
                  });
                  resetForm();
                  onLoadData();
                  setIsOpenConfirmModal(false);
                  handleCloseModel();
                  setSubmitting(false);
                }
              })
              .catch((error) => {
                setSubmitting(false);
                setErrors(error);
              });
          }
        });
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
      setSubmitting(false);
    } else {
      const lossNotifications = newRowData?.map((row) => ({
        user: {
          factoryPk: row.id
        },
        status: 'SAVE'
      }));

      try {
        query({
          url: 'v1/loss-pic/search',
          featureCode: 'user.create',
          params: {
            lossType: values?.lossCategory,
            classification: values?.classification,
            lossCls: values?.lossDetailCls,
            user: values?.picId,
            state: values?.state
          }
        }).then((res) => {
          if (isEmpty(newRowData) && !isEmpty(res.data)) {
            enqueueSnackbar(translate(`message.this_loss_pic_was_already_created`), {
              variant: 'warning',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
            setIsOpenConfirmModal(false);
          } else {
            mutate({
              url: '/v1/loss-pic/update',
              data: {
                lossPic: {
                  lossType: {
                    code: values?.lossCategory
                  },
                  classification: {
                    code: values?.classification
                  },
                  lossCls: {
                    code: values?.lossDetailCls
                  },
                  state: values?.state,

                  pk: currentLossPicData.pk,
                  lossNotifications
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
                  enqueueSnackbar(translate(`message.loss_pic_was_modified_successfully`), {
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
          }
        });
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    }
  };

  const onSelectedEmployee = (employee) => {
    if (isOpenPicSearchForm) {
      setFieldValue('picId', getSafeValue(employee?.employeeId));
      setFieldValue('picName', getSafeValue(employee?.fullName));
      setFieldValue('department', getSafeValue(employee?.departmentName));
      setCurrentPicId(getSafeValue(employee?.id));
    }
    if (isOpenReceiverSearchForm) {
      setReceiverData(employee);

      setFieldValue('receiverId', getSafeValue(employee?.employeeId));
    }
  };

  const LossPicSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    lossCategory: Yup.string().required('Loss Category is required'),
    classification: Yup.string().required('Classification is required'),
    lossDetailCls: Yup.string().required('Loss Detail Cls is required'),
    picId: Yup.string().required('PIC ID is required'),
    picName: Yup.string().required('PIC Name is required'),
    department: Yup.string(),
    state: Yup.string().required('Use (Y/N) is required'),
    receiverId: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentLossPicData?.factory) || '',
      lossCategory: (isEdit && currentLossPicData?.lossCls) || '',
      classification: (isEdit && currentLossPicData?.classification) || '',
      lossDetailCls: (isEdit && currentLossPicData?.lossCls) || '',
      picId: (isEdit && currentLossPicData?.user.userName) || '',
      picName: (isEdit && currentLossPicData?.user.fullName) || '',
      department: (isEdit && currentLossPicData?.user.department) || '',
      state: (isEdit && currentLossPicData?.state) || 'RUNNING',
      receiverId: ''
    },
    validationSchema: LossPicSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (isEdit) {
          validateForm();
          setSubmitting(true);
          handleOpenConfirmModal();
        } else {
          handleOpenConfirmModal();
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
      updateData([])
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
            {translate(`typo.purchase_G/R_plan_detail`)}
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
                      disabled={isEdit}
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />

                    <Dropdown
                      {...getFieldProps('lossCategory')}
                      fullWidth
                      id="lossCategory"
                      name="lossCategory"
                      label="Loss Category"
                      allowEmptyOption={false}
                      size="small"
                      required
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('classification', '');
                        setFieldValue('lossDetailCls', '');
                      }}
                      options={categories.filter((obj) => obj.factory === values.factory)}
                      errorMessage={touched.lossCategory && errors.lossCategory}
                    />

                    <Dropdown
                      {...getFieldProps('classification')}
                      id="classification"
                      name="classification"
                      label="Classification"
                      allowEmptyOption={false}
                      size="small"
                      required
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('lossDetailCls', '');
                      }}
                      options={allLossMasterDropdown
                        .filter((obj) => obj.lossType.code === values.lossCategory)
                        .map((obj) => ({
                          value: obj.classification.code,
                          label: obj.classification.name
                        }))
                        .reduce(
                          (previous, current) =>
                            [...previous].some((obj) => obj?.value === current.value)
                              ? [...previous]
                              : [...previous].concat(current),
                          []
                        )}
                      errorMessage={touched.classification && errors.classification}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} alignItems="center">
                    <Dropdown
                      {...getFieldProps('lossDetailCls')}
                      id="lossDetailCls"
                      name="lossDetailCls"
                      allowEmptyOption={false}
                      label="Loss Detail Cls"
                      size="small"
                      required
                      onChange={handleChange}
                      options={allLossMasterDropdown
                        .filter((obj) => obj.classification.code === values.classification)
                        .map((obj) => ({
                          value: obj.lossCls.code,
                          label: obj.lossCls.name
                        }))
                        .reduce(
                          (previous, current) =>
                            [...previous].some((obj) => obj?.value === current.value)
                              ? [...previous]
                              : [...previous].concat(current),
                          []
                        )}
                      errorMessage={touched.lossDetailCls && errors.lossDetailCls}
                    />
                    <TextField
                      {...getFieldProps('picId')}
                      id="picId"
                      name="picId"
                      label="PIC ID"
                      required
                      fullWidth
                      disabled
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              disabled={!values.factory}
                              onClick={() => {
                                handleOpenPicSearchForm();
                                getEmployeeList(values.factory);
                              }}
                            >
                              <Icon icon={searchOutLined} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                    />

                    <TextField
                      autoComplete="off"
                      fullWidth
                      size="small"
                      label="PIC Name"
                      required
                      disabled
                      {...getFieldProps('picName')}
                      error={Boolean(touched.picName && errors.picName)}
                      helperText={touched.picName && errors.picName}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Department"
                      size="small"
                      disabled
                      {...getFieldProps('department')}
                      error={Boolean(touched.department && errors.department)}
                      helperText={touched.department && errors.department}
                    />
                    <Dropdown
                      {...getFieldProps('state')}
                      id="state"
                      fullWidth
                      name="state"
                      label="Use (Y/N)"
                      allowEmptyOption={false}
                      onChange={handleChange}
                      size="small"
                      required
                      options={[
                        { value: 'RUNNING', label: 'Y' },
                        { value: 'HIDDEN', label: 'N' }
                      ]}
                      defaultValue="RUNNING"
                      errorMessage={touched.state && errors.state}
                      disabled={!isEdit}
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
              {translate(`typo.notification_to`)}:
            </Typography>
            <Stack direction="row" pr={1}>
              {' '}
              <TextField
                {...getFieldProps('receiverId')}
                id="receiverId"
                name="receiverId"
                label="Receiver Id"
                fullWidth
                disabled
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        disabled={!values.factory}
                        onClick={() => {
                          handleOpenReceiverSearchForm();
                          getEmployeeList(values.factory);
                        }}
                      >
                        <Icon icon={searchOutLined} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
              />
              <Button
                type="button"
                variant="contained"
                size="small"
                loading={isSubmitting}
                onClick={() => {
                  handleAddReceiverPic(values);
                }}
              >
                {translate(`button.add`)}
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
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <Button type="submit" variant="contained" size="small" loading={isSubmitting}>
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </Button>
        </DialogActions>
        <DialogDragable title={translate(`typo.employee_search`)} maxWidth="lg" open={isOpenSearchForm} onClose={handleCloseSearchForm}>
          <EmployeeSearchForm
            factory={values.factory}
            pageCode={pageCode}
            isSearch={isOpenSearchForm}
            onCancel={handleCloseSearchForm}
            onLoadData={onLoadData}
            onSelectedEmployee={onSelectedEmployee}
          />
        </DialogDragable>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`${translate(`typo.do_you_want_to`)} ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
            }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <Button type="button" onClick={onSaveLossPic} variant="contained" loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </Button>
          </DialogActions>
        </DialogAnimate>
        <DialogAnimate title={translate(`typo.delete`)} maxWidth="sm" open={isOpenDeleteModal} onClose={handleCloseDeleteModal}>
          <Typography variant="subtitle1" align="center">
            {translate(`typo.are_you_sure_to_delete`)}
          </Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseDeleteModal}>
              {translate(`button.no`)}
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleDeleteReceiverPic} loading={isSubmitting}>
              {translate(`button.delete`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
