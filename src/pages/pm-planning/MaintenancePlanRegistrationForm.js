import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import searchOutLined from '@iconify/icons-ant-design/search-outlined';
import {
  Box,
  Button,
  Card,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import { isEmpty, isUndefined } from 'lodash-es';
import { LoadingButton, DatePicker } from '@material-ui/lab';

import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate, DialogDragable } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import useLocales from '../../hooks/useLocales';
// redux

import { useDispatch, useSelector } from '../../redux/store';
import {fDate } from '../../utils/formatTime';
import { isNullVal } from '../../utils/formatString';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import { getGridConfig } from '../../utils/pageConfig';
import { getUserDropdown } from '../../redux/slices/userManagement';
import UserSearchForm from './UserSeachForm';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';


// ----------------------------------------------------------------------

MaintenancePlanRegistrationForm.propTypes = {
  isView: PropTypes.bool,
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string
};

const equipmentTableCode = 'maintenanceEquipment';

const picTableCode = 'maintenancePic';

export default function MaintenancePlanRegistrationForm({ isEdit, currentData, onCancel, onLoadData, pageCode, isView }) {
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() + 1);
  const dispatch = useDispatch();
  const { equipmentIdDropdown, allEquipmentId } = useSelector((state) => state.equipmentIDManagement);
  const { translate, currentLang } = useLocales();
  

  const { themeAgGridClass } = useSettings();
  const [noticeDays, setNoticeDays] = useState('');
  const [equipmentRowData, setEquipmentRowData] = useState((isEdit || isView )? currentData.equipmentRowData : [] );
  
  const [picRowData, setPicRowData] = useState( (isEdit || isView )? currentData.picRowData : []  );
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  const { commonDropdown } = useAuth();
  const allLineDropdown = allEquipmentId.map((equipment) => equipment.lineCode);
  

  const [isChangeFactory, setChangeFactory] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [pmContent, setPmContent] = useState('');
  const [equipmentColumns, setEquipmentColumns] = useState(null);
  const [picColumns, setPicColumns] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedEquipmentRowId, setSelectedEquipmentRowId] = useState(null);
  const [maintenanceEquipments, setMaintenanceEquipments] = useState((isEdit || isView )? currentData.maintenanceEquipments : []  );
  const [receiverData, setReceiverData] = useState([]);
  const [selectedPicRowId, setSelectedPicRowId] = useState(null);
  const [newReceiverRowData, setNewReceiverRowData] = useState();
  const [currentContent, setCurrentContent] = useState('');
  const [isOpenSearchForm, setIsOpenSearchForm] = useState(false);
  const [maintenancePICs, setMaintenancePICs] = useState((isEdit || isView )? currentData.maintenancePICs : [])
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');
 
  const [allowChange, setAllowChange] = useState(false);
  
  

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, equipmentTableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${equipmentTableCode}.${column.field}`);
    });
    setEquipmentColumns(tableConfigs);
    const picTableConfigs = getGridConfig([], pageCode, picTableCode);
    picTableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${picTableCode}.${column.field}`);
    });
    setPicColumns(picTableConfigs);
    
  }, []);



  useEffect(() => {
    if((isEdit || isView)){
      if(!allowChange){
        setEquipmentRowData(currentData.equipmentRowData);
        setMaintenanceEquipments(currentData.maintenanceEquipments);
        setPicRowData(currentData.picRowData);
        setMaintenancePICs(currentData.maintenancePICs);
      }
      if(allowChange){
        setEquipmentRowData(equipmentRowData)
        setPicRowData(picRowData)
      }
      }
  })

  useEffect(() => {
    if(allowChange){
      setMaintenanceEquipments(maintenanceEquipments)
      setMaintenancePICs(maintenancePICs)
    }
  }, [maintenanceEquipments, maintenancePICs])


  const handleOpenConfirmModal = () => {
    
    setIsOpenConfirmModal(true)
  };

  const handleChangeNotificationDays = (e) => {
    setNoticeDays(e.target.value);
  };

  const getDropdown = (array, option1, option2, values) => {
    const _array = array
      .filter((equipment) => equipment[option1].value === values[option1])
      .map((equipment) => equipment[option2]);
    const newArray = _array.reduce(
      (previous, current) =>
        [...previous].some((obj) => obj?.value === current.value) ? [...previous] : [...previous].concat(current),
      []
    );

    return newArray;
  };

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
      setEquipmentRowData([]);
      setPicRowData([]);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  };

  const MsgPopup = (msg, type) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
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

  const handleAddEquipment = async () => {
    if (
      isEmpty(values.factory) ||
      isEmpty(values.part) ||
      isEmpty(values.lineCode) ||
      isEmpty(values.processCode) ||
      isEmpty(values.workStation) ||
      isEmpty(values.equipIdCode)
    ) {
      handlePopup('warning', translate(`message.please_fill_in_equipment_information`));
    } else {
      setAllowChange(true);
      const currentEquipment = equipmentIdDropdown.filter((equipment) => equipment.value === values.equipIdCode);
      
       query({
        url: `/v1/equipment-id/search?code=${currentEquipment[0].label}&state=RUNNING`,
        featureCode: 'user.create'
      }).then((res) => {
       
        const { data } = res;
        if (isEmpty(data)) {
          handlePopup('warning', translate(`message.this_equipment_does_not_exist`));
        } else {
     
          
          let newEquipmentRowData = [];
          const isExisted = equipmentRowData.findIndex((equipment) => equipment.code === data[0].code);
          if (isExisted === -1) {
            newEquipmentRowData.push(data[0]);
           
            const _equipmentsPk = newEquipmentRowData.map(equipment => ({
              equipmentID: {
                factoryPk: equipment.factoryPk
              }
            }))
            
            setEquipmentRowData([{
              equipmentPart: newEquipmentRowData[0].equipmentPart?.name,
              equipmentLine: newEquipmentRowData[0].equipmentLine?.name,
              equipmentProcess: newEquipmentRowData[0].equipmentProcess?.name.name,
              equipmentWorkStation: newEquipmentRowData[0].equipmentWorkStation?.name,
              code: newEquipmentRowData[0].code,
              name: newEquipmentRowData[0].name,
              equipmentSpec: newEquipmentRowData[0].equipmentSpec,
              factoryPk: newEquipmentRowData[0].factoryPk
            }, ...equipmentRowData]);
            setMaintenanceEquipments([{
              equipmentID: {
                factoryPk: newEquipmentRowData[0].factoryPk
              }
            }, ...maintenanceEquipments])
            newEquipmentRowData = [];
            setFieldValue('part', '');
            setFieldValue('lineCode', '');
            setFieldValue('processCode', '');
            setFieldValue('workStation', '');
            setFieldValue('equipIdCode', '');
          } else {
            handlePopup('warning', translate(`message.this_equipment_id_was_already_added`));
            
          }
        }
      });
    }
  };

  const handleChangeContent = useCallback( (e) => {
    setCurrentContent(e?.target?.value)
  }, [setCurrentContent])

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleCloseSearchForm = () => {
    setIsOpenSearchForm(false);
  };

  const getEmployeeList = (id) => {
    dispatch(getUserDropdown(id));
  };

 

  const handleOpenUserSearchForm = () => {
    setIsOpenSearchForm(true);
  };

  const onSelectedEmployee = (employee) => {
    setSelectedPicRowId(null);
    setAllowChange(true);
    
      if (picRowData.some((user) => user.id === employee.id)) {
        handlePopup('warning', translate(`message.user_already_existed`));
      } else {
        let newPicRowData = []
        newPicRowData.push(employee);
        setPicRowData([...newPicRowData, ...picRowData]);
        
        const _maintenancePic = newPicRowData.map(pic => ({
          user:{
            factoryPk: pic.id
          }
        }))
        setMaintenancePICs([_maintenancePic[0],...maintenancePICs])
        newPicRowData = []
      }
    
  };

  const handlePopup = (type, msg) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };

  const updatePicData = (data) => {
    setPicRowData(data);
  };

  const updateEquipmentData = (data) => {
    setEquipmentRowData(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onPicSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedPicRowId(null);
    }
    if (rowCount === 1) {
      const selectedId = event.api.getSelectedNodes()[0].data.id;
      
      setSelectedPicRowId(selectedId);
    }
  };

  const onEquipmentSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      setSelectedEquipmentRowId(null);
    }
    if (rowCount === 1) {
      
      const selectedId = event.api.getSelectedNodes()[0].data.factoryPk;
      setSelectedEquipmentRowId(selectedId);
    }
  };

  const onClickDeletePic = () => {
    setAllowChange(true);
    if (selectedPicRowId) {
      const currentRowData = picRowData.filter((data) => data.id !== selectedPicRowId);
      const currentPics = currentRowData.map(pic => ({
        user: {
          factoryPk: pic.id
        }
      }))
      setMaintenancePICs(currentPics)
      
      updatePicData(currentRowData);
      setSelectedPicRowId(null);
    } else {
      handlePopup('warning', translate(`message.please_select_1_user_to_delete`));
    }
  };

  const onClickDeleteEquipment = () => {
    setAllowChange(true);
    if (selectedEquipmentRowId) {
      const currentRowData = equipmentRowData.filter((data) => data.factoryPk !== selectedEquipmentRowId);
      const currentEquipments= currentRowData.map(equip => ({
        equipmentID: {
          factoryPk: equip.factoryPk
        }
      }))
      setMaintenanceEquipments(currentEquipments)
      updateEquipmentData(currentRowData);

      setSelectedEquipmentRowId(null);
    } else {
      handlePopup('warning', translate(`message.please_select_1_equipment_to_delete`));
    }
  };

  const handleRegisterSchedule = () => {
    validateForm();
    setSubmitting(true);
    const pmSchedule = {
      pk: {
        factoryCode: values.factory
      },
      pmType: {
        code: values.pmType
      },
      pmCycle: {
        code: values.pmCycle
      },
      pmStartDate: fDate(values.pmStartDate),
      maintenanceEquipments,
      maintenancePICs,
      state: 'RUNNING',
      notice: values?.notice,
      noticeBefore: values?.noticeBefore,
      pmContent: values?.pmContent
    }
    if(!isNullVal(values.noticeCycle)){
      pmSchedule.noticeCycle = {
        code: values.noticeCycle
      }
    }
    
    if (!isEdit && !isView) {
      try {
        mutate({
          url: '/v1/pm-schedule/create',
          data: {
            pmSchedule
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
         
              handleCloseConfirmModal();
              onCancel();
              MsgPopup(translate(`message.maintenance_was_register_successfully`), 'success');
              onLoadData();
            
          }
        }).catch((error) => {
          console.error(error);
          setErrors(error);
          handleCloseConfirmModal();
        });
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    } if(isEdit && !isView) {
      try {

        mutate({
          url: '/v1/pm-schedule/update',
          data: {
            pmSchedule: {
              factoryPk: currentData?.factoryPk,
              ...pmSchedule
            }
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
              handleCloseConfirmModal();
              onCancel();
              MsgPopup(translate(`message.maintenance_was_update_successfully`), 'success');
              onLoadData();
            
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

  const MaintenancePlanSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    pmType: Yup.string().required('PM Type is required'),
    pmCycle: Yup.string().required('PM Cycle is required'),
    pmStartDate: Yup.date().required('PM Start Date is required').min(fDate(startDay), 'Please fill in correct start day'),
    pmContent: Yup.string(),
    part: Yup.string(),
    lineCode: Yup.string(),
    processCode: Yup.string(),
    workStation: Yup.string(),
    equipIdCode: Yup.string(),
    notice: Yup.boolean(),
    noticeCycle: Yup.string(),
    noticeBefore: Yup.number()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isView || isEdit) && currentData?.factory || '',
      pmType: (isView || isEdit) && currentData?.pmType || '',
      pmCycle: (isView || isEdit) && currentData?.pmCycle || '',
      pmStartDate: (isView || isEdit) && currentData?.pmStartDate || fDate(startDay),
      pmContent: (isView || isEdit) && currentData?.pmContent || '',
      part:  '',
      lineCode: '',
      processCode: '',
      workStation: '',
      equipIdCode:  '',
      notice: (isView || isEdit) && currentData?.notice || '',
      noticeCycle: (isView || isEdit) && currentData?.noticeCycle || '',
      noticeBefore: (isView || isEdit) && currentData?.noticeBefore || ''
    },
    validationSchema: MaintenancePlanSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (!isView){
          await validateForm()
          setSubmitting(true)
          handleOpenConfirmModal()
        }
      } catch (error) {
        console.error(error);
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
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    setSubmitting,
    validateForm,
    resetForm,
    setErrors
  } = formik;
  

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            Maintenance Header
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
                      disabled={isEdit || isView}
                      onChange={handleChangeFactory}
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />
                    <Dropdown
                      {...getFieldProps('pmType')}
                      id="pmType"
                      name="pmType"
                      label={translate(`label.pmType`)}
                      size="small"
                      required
                      disabled={isView}
                      onChange={(e) => {
                        handleChange(e)
                        setFieldValue('pmType', e.target.value)
                      }}
                      groupId="D037000"
                      errorMessage={touched.factory && errors.factory}
                    />
                    <Dropdown
                      {...getFieldProps('pmCycle')}
                      id="pmCycle"
                      name="pmCycle"
                      label={translate(`label.pmCycle`)}
                      size="small"
                      required
                      disabled={isView}
                      onChange={(e) => {
                        handleChange(e)
                        setFieldValue('pmCycle', e.target.value)
                      }}
                      groupId="D038000"
                      errorMessage={touched.factory && errors.factory}
                    />
                    <DthDatePicker
                      name="pmStartDate"
                      minDate={startDay}
                      label={translate(`label.pmStartDate`)}
                      disabled={isView}
                      required
                      value={values.pmStartDate}
                      size="small"
                      onChange={(newValue) => {
                        setFieldValue('pmStartDate', newValue);
                      }}
                      sx={{ my: 1 }}
                      fullWidth
                      errorMessage={touched.pmStartDate && errors.pmStartDate}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} sx={{ mt: `1 !important` }}>
                    <TextField
                      rows={3}
                      multiline
                      id="pmContent"
                      name="pmContent"
                      disabled={isView}
                      fullWidth
                      label={translate(`label.pmContent`)}
                      {...getFieldProps('pmContent')}
                      onChange={(e) => {
                        handleChangeContent(e)
                        setFieldValue('pmContent', e.target.value)
                    
                      }}
                      
              
                      error={Boolean(touched.pmContent && errors.pmContent)}
                      helperText={touched.pmContent && errors.pmContent}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.maintenance_equipment`)}
          </Typography>
          {!isView && (
            <Card sx={{ px: 1, py: 1 }}>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <Dropdown
                  {...getFieldProps('part')}
                  id="part"
                  name="part"
                  label={translate(`label.part`)}
                  disabled={isView}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue('lineCode', '');
                    setFieldValue('processCode', '');
                    setFieldValue('workStation', '');
                    setFieldValue('equipIdCode', '');
                  }}
                  options={commonDropdown.partDropdown.filter((part) => part.factory === values.factory)}
                />
                <Dropdown
                  {...getFieldProps('lineCode')}
                  id="lineCode"
                  name="lineCode"
                  label={translate(`label.line`)}
                  disabled={isView}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue('processCode', '');
                    setFieldValue('workStation', '');
                    setFieldValue('equipIdCode', '');
                  }}
                  options={() => getDropdown(allEquipmentId, 'part', 'lineCode', values)}
                />
                <Dropdown
                  id="processCode"
                  name="processCode"
                  label={translate(`label.process_code`)}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue('workStation', '');
                    setFieldValue('equipIdCode', '');
                  }}
                  disabled={isView}
                  options={() => getDropdown(allEquipmentId, 'lineCode', 'processCode', values)}
                  {...getFieldProps('processCode')}
                />
                <Dropdown
                  id="workStation"
                  name="workStation"
                  label={translate(`label.workStation`)}
                  disabled={isView}
                  options={() => getDropdown(allEquipmentId, 'processCode', 'workStation', values)}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue('equipIdCode', '');
                  }}
                  {...getFieldProps('workStation')}
                />
                <Dropdown
                  id="equipIdCode"
                  name="equipIdCode"
                  label={translate(`label.equipIdCode`)}
                  disabled={isView}
                  onChange= {(e) => {
                    handleChange(e);
                    setFieldValue('equipIdCode', e?.target.value)
                  }}
                  options={allEquipmentId.filter((equipment) => equipment.workStation.value === values.workStation)}
                  {...getFieldProps('equipIdCode')}
                  errorMessage={touched.equipIdCode && errors.equipIdCode}
                />
              </Stack>
            </Stack>
          </Card>
          )}
          

          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'end',
              alignItems: 'center',
              py: 1,
              pr: 1
            }}
          >
            {!isView && ( 
            <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 0.5 }}>
              <Button variant="contained" size="small" onClick={handleAddEquipment}>
                {translate(`button.add`)}
              </Button>
              <Button
                sx={{ marginLeft: 1 }}
                variant="contained"
                disabled={!selectedEquipmentRowId}
                onClick={onClickDeleteEquipment}
                size="small"
              >
                {translate(`button.delete`)}
              </Button>
            </Stack>
            )}
           
          </Stack>

          <AgGrid
            columns={equipmentColumns}
            rowData={equipmentRowData}
            className={themeAgGridClass}
            onGridReady={onGridReady}
            onSelectionChanged={onEquipmentSelectionChanged}
            rowSelection="single"
            width="100%"
            height="30vh"
          />
        </Card>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.maintenance_remind`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('notice')}
                      id="notice"
                      name="notice"
                      label={translate(`label.notice`)}
                      size="small"
                      disabled={isView}
                      allowEmptyOption={false}
                      onChange={(e) => {
                        const newValue = e?.target?.value;
                        setFieldValue('notice', newValue);
                      }}
                      options={[
                        { value: true, label: 'Y' },
                        { value: false, label: 'N' }
                      ]}
                      errorMessage={touched.notice && errors.notice}
                    />
                    <Dropdown
                      {...getFieldProps('noticeCycle')}
                      id="noticeCycle"
                      name="noticeCycle"
                      label={translate(`label.noticeCycle`)}
                      size="small"
                      disabled={isView}
                      onChange={handleChange}
                      groupId="D038000"
                      errorMessage={touched.noticeCycle && errors.noticeCycle}
                    />
                    <TextField
                      id="noticeBefore"
                      name="noticeBefore"
                      fullWidth
                      size="small"
                      label={translate(`label.noticeBefore`)}
                      {...getFieldProps('noticeBefore')}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('noticeBefore', e?.target?.value)
                      }}
                      disabled={isView}

                      error={Boolean(touched.noticeBefore && errors.noticeBefore)}
                      helperText={touched.noticeBefore && errors.noticeBefore}
                    />
                    <TextField fullWidth label={translate(`label.unit`)} disabled value="Day(s)" size="small" />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <Card sx={{ pb: 1 }}>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
              pr: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ pl: 1 }}>
              {translate(`typo.maintenance_pic`)}
            </Typography>
            {!isView && ( 
            <Stack direction="row" pr={1}>
              <TextField
                {...getFieldProps('receiverId')}
                id="receiverId"
                name="receiverId"
                label={translate(`label.userId`)}
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
                          handleOpenUserSearchForm();
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
                sx={{ marginLeft: 1 }}
                variant="contained"
                disabled={!selectedPicRowId}
                onClick={onClickDeletePic}
                size="small"
              >
                {translate(`button.delete`)}
              </Button>
            </Stack>
            )}
           
          </Stack>

          <AgGrid
            columns={picColumns}
            rowData={picRowData}
            className={themeAgGridClass}
            onGridReady={onGridReady}
            onSelectionChanged={onPicSelectionChanged}
            rowSelection="single"
            width="100%"
            height="30vh"
          />
        </Card>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {isView ? `${translate(`button.close`)}` : `${translate(`button.cancel`)}`}
          </Button>
          {!isView && (
             <Button type="submit" variant="contained" loading={isSubmitting}>
             {isEdit ? translate(`button.modify`) : translate(`button.register`)}
           </Button>
          )}
        </DialogActions>
        <DialogDragable title="User Search" maxWidth="lg" open={isOpenSearchForm} onClose={handleCloseSearchForm}>
          <UserSearchForm
            factory={values.factory}
            pageCode={pageCode}
            isSearch={isOpenSearchForm}
            onCancel={handleCloseSearchForm}
            onLoadData={onLoadData}
            onSelectedEmployee={onSelectedEmployee}
          />
        </DialogDragable>
        <DialogAnimate title="Confirm" maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{isEdit ? `${translate(`typo.do_you_want_to_modify`)}` : `${translate(`typo.do_you_want_to_register`)}` }</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" size="small" loadingIndicator={translate(`loading.processing`)} loading={isSubmitting} onClick={handleRegisterSchedule}>
              {isEdit ? `${translate(`button.modify`)}` : `${translate(`button.register`)}`}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
