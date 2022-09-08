import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, Typography, TextField, Checkbox, FormControlLabel
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Field, FieldArray, Form, FormikProvider, useFormik } from 'formik';
import { AgGridReact } from 'ag-grid-react'
import { useSnackbar } from 'notistack5';
import { isEmpty, stubTrue } from 'lodash';
import PropTypes, { array, string } from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { styled } from '@material-ui/styles';
import useLocales from '../../hooks/useLocales';
import { MIconButton } from '../../components/@material-extend';
import { getGridConfig, getPageName, parseOrgSearchAll } from '../../utils/pageConfig';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
import { workFormGridConfig } from './GridWorkFormRegistration'
// hooks
import useAuth from '../../hooks/useAuth';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { fDate } from '../../utils/formatTime';
import useSettings from '../../hooks/useSettings';
import { AssignFormGrid } from './AssignFormGrid';
import { getShiftCodeDropdown, getGroupCommonCode  } from '../../redux/slices/common'



// ----------------------------------------------------------------------

AssignGroupForm.propTypes = {
  isEdit: PropTypes.bool,
  // currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function AssignGroupForm({ isEdit, onCancel }) {
  const dispatch = useDispatch();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { searchParams } = useSelector((state) => state.workCalendarManagement )
   const { typeCommon, shiftCommon, groupCommon, workingTypeCommon } = useSelector((state) => state.common);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, userGridConfig, funcPermission } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [dataRow, setDataRow] = useState([])
  const [shift, setShift] = useState('');
  const [selectedLength, setSelectedLength] = useState(0);
  const [action, setAction] = useState('')
  const [listAssign, setListAssign] = useState([])
  const [checkTypeDay, setCheckTypeDay] = useState(false)
  const [gridApi, setGridApi] = useState('')
  const [selectAssign, setselectAssign] = useState({})


  useEffect(() => {
    updateData(listAssign)
  }, [listAssign])

  const onSelectionChanged = (event) => {
    const rowCount = event.api.getSelectedNodes().length;
    if (rowCount === 0) {
      console.log('error')
    }
    if (rowCount === 1) {
      const assignData = event.api.getSelectedNodes()[0].data;
      setselectAssign(assignData)         
      }
      //
    }

  const disableMaxDate = (maxDate) => {
    const currDate = new Date()
    currDate.setDate(currDate.getDate() + maxDate)
    return fDate(currDate)
  }

  const handleSearch = () => {
    const params = {
      from: fDate(values.fromDate),
      to: fDate(values.toDate),
      line: values.line ? commonDropdown.lineDropdown.find(e => e.value === values.line).code : '',
      group: values.workGroup,
      shift: values.shift,
      factoryCode: values.factory ,
      workType: checkTypeDay ? 'D046002' : ''
    }
    query({
      url: '/v1/work-calendar/assign-group/search',
      featureCode: 'user.create',
      method: 'GET',
      params
    }).then((res) => {
      setListAssign(res.data.map(e => ({
        factory: e.pk.factoryCode,
        pk: e.pk,
        nameFactory: e.pk.factoryName,
        nameShift: e.shift.name,
        workDate: e.workDate,
        line: e.line.factoryPk,
        nameLine: e.line.code,
        shift: e.shift.code,
        workGroup: e.group.code,
        nameGroup: e.group.name,
        workType: e.workType.code,
        nameWorkType: e.workType.name
      })))

    }).catch((err) => {
      console.error(err);
    });
    // resetForm()
    setAction('Search')
  }

  const handleValidate = () => {
    if(action === 'Add' && listAssign.length !== 0) {
      handleOpenConfirmModal()
    } else {
      enqueueSnackbar('List Assign Is Empty', {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      handleCloseConfirmModal()
    }
  }

  const handleRegisterAssign = () => {
    formik.setSubmitting(true);
    const params = listAssign.map(e => (
      {
        pk: {
          id: e.pk?.id,
          factoryCode: e.factory
        },
        workDate: e.workDate,
        line: {
          factoryPk: e.line
        },
        shift: {
          code: e.shift
        },
        group: {
          code: e.workGroup
        },
        workType: {
          code: e.workType
        }
      }
    ))
  
    mutate({
      url: '/v1/work-calendar/assign-group/create',
      data: {
        assignGroup: params
      },
      method: 'post',
      featureCode: 'user.create'
    }).then((res) => {
      if (res.httpStatusCode === 200) {
        if (res.data.message) {
          enqueueSnackbar(res.data.message, {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
        else {
          formik.resetForm();
          formik.setSubmitting(false);
          setIsOpenConfirmModal(false);
          onCancel();
          enqueueSnackbar('Assign Group was registered', {
            variant: 'success',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
          setAction('')
        }
      }
    }).catch((err) => {
      formik.setSubmitting(false);
      console.error(err);
    });  
  }

  const handleAdd = () => {
    const dateTo = new Date(fDate(values.toDate));
    const dateFrom = new Date(fDate(values.fromDate));

    const difference = dateTo?.getTime() - dateFrom?.getTime();
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    if(days >= 0) {
      const listAdd = Array(days + 1).fill().map((e,index) => {
        const newDate = new Date(fDate(dateFrom))
        newDate.setDate(newDate.getDate() + index)
        return {
          workDate: fDate(newDate), 
          factory: values.factory,
          nameFactory: commonDropdown.factoryDropdown.find(e => e.value === values.factory).label,
          line: values.line,
          nameLine: commonDropdown.lineDropdown.find(e => e.value === values.line).label,
          shift: values.shift,
          nameShift: shiftCommon.find(e => e.value === values.shift)?.label,
          workGroup: values.workGroup,
          nameGroup: groupCommon.find(e => e.value === values.workGroup).label,
          workType: checkTypeDay ? workingTypeCommon.find(e => e.value === 'D046002').value : workingTypeCommon.find(e => e.value === 'D046001').value ,
          nameWorkType: checkTypeDay ? workingTypeCommon.find(e => e.value === 'D046002').label : workingTypeCommon.find(e => e.value === 'D046001').label
        }
      })
      setAction('Add')
      let check = true
      listAssign.forEach(e => {
        listAdd.forEach(el => {
          if(e.workDate === el.workDate && e.line === el.line && e.shift === el.shift && e.workGroup === el.workGroup) {
            check = false
            return true
          }
        })
      })
      if(check) {
        setListAssign([...listAssign, ...listAdd])
      } else {
        enqueueSnackbar('Group exist', {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      }
    }
  }

  const handleDelete = () => {
    const newList = listAssign.filter((e) => (
       e.workDate !== selectAssign.workDate || e.shift !== selectAssign.shift || e.line !== selectAssign.line
    ))
    setListAssign(newList)
  }
  

  const handleChangeCheckBox = () => {
    setCheckTypeDay(!checkTypeDay)
  }

  const updateData = (data) => {
    setDataRow(data);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };




  
  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const diffHour = (time1, time2) => {
    const [hour1, minute1] = time1.split(':');
    const [hour2, minute2] = time2.split(':');
    return (hour2 - hour1) * 60 + (minute2 - minute1)
  }
  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    fromDate: Yup.string().required('From Date Code is required'),
    toDate: Yup.string().required('To Date is required'),
    shift: Yup.string().required('Shift No is required'),
    workGroup: Yup.string().required('workGroup is required'),
    line: Yup.string().required('Line is required'),
    
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: ({
    factory: '',
    fromDate: '',
    toDate: '',
    shift: '',
    workGroup: '',
    line: '',
    }),
    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // handleAddShift()
        // setValuesForm({ ...values, id: currentData.id })
        
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });
  
  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, validateForm } = formik

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack>
                <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Calendar Info</Typography>
                <Stack >
                    <Stack sx={{mb: 2}} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} >
                        <Dropdown
                            {...getFieldProps('factory')}
                            id="factory"
                            name="factory"
                            label='Factory'
                            disabled={isEdit}
                            required
                            onChange={(e) => {
                            setFieldValue('factory', e.target.value)
                            }}
                            options={commonDropdown.factoryDropdown}
                            defaultValue=''
                            errorMessage={touched.factory && errors.factory}
                        />
                        <Dropdown
                            {...getFieldProps('line')}
                            id="line"
                            name="line"
                            label='Line'
                            disabled={isEdit}
                            required
                            onChange={(e) => {
                            setFieldValue('line', e.target.value)
                            }}
                            options={commonDropdown.lineDropdown.filter(dd => dd.factory === values.factory)}
                            defaultValue=''
                            errorMessage={touched.line && errors.line}
                        />
                        <Dropdown
                            {...getFieldProps('workGroup')}
                            id="workGroup"
                            name="workGroup"
                            label='Work Group'
                            // disabled={action === 'Modify'}
                            required
                            groupId='D002000'
                            onChange={(e) => {
                            setFieldValue('workGroup', e.target.value)
                            }}
                            options={commonDropdown.factoryDropdown}
                            defaultValue=''
                            errorMessage={touched.workGroup && errors.workGroup}
                        />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                            <DthDatePicker
                            id='fromDate'
                            name="fromDate"
                            label="From Date"
                            required
                            onChange={(value) => setFieldValue('fromDate',value)}
                            maxDate={disableMaxDate(31)}
                            disabled={isEdit}
                            fullWidth                    
                            />
                            <DthDatePicker
                            id='toDate'
                            name="toDate"
                            label="To Date"
                            required
                            // {...getFieldProps('toDate')}
                            onChange={(value) => setFieldValue('toDate',value)}
                            disabled={isEdit}
                            sx={{ my: 1 }}
                            fullWidth
                            />
                        <Dropdown
                            {...getFieldProps('shift')}
                            id="shift"
                            name="shift"
                            label='Shift'
                            groupId='D001000'
                            fullWidth
                            required
                            onChange={handleChange}
                            errorMessage={touched.shift && errors.shift}
                        />
                        </Stack>
                    </Stack>
              </Stack>
            </Card>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='flex-end'>
                <FormControlLabel 
                    label='National Holiday'
                    control={<Checkbox checked={checkTypeDay} onChange={handleChangeCheckBox}  />}
                />
            </Stack>
            <Card sx={{ py: 1 }}>
              <Stack justifyContent="flex-end" sx={{mr: action ==='Modify' ? '0' : '10px'} } direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <Button variant='outlined' onClick={handleSearch}>Search</Button>
                <Button type="submit" variant='outlined' onClick={handleAdd}>Add</Button>
                <Button variant='outlined' onClick={handleDelete}>Delete</Button>
              </Stack>
            </Card>
            <Card sx={{ px: 1, py: 2, height: 400 }}>
              <AgGridReact
                columnDefs={AssignFormGrid}
                rowData={dataRow}
                className={themeAgGridClass}
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
                rowSelection="single"
                width="100%"
                height="100%"

              />
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          <LoadingButton variant="contained" loading={isSubmitting} loadingIndicator="Loading..." onClick={handleValidate}>Register</LoadingButton>
        </DialogActions>
        <DialogAnimate title="Confirm" maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">Do you want to register?</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              Cancel
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterAssign} loading={isSubmitting}>Register</LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
