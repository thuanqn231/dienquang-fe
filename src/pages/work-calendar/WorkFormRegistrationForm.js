import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {
  Box, Button, Card, DialogActions, Grid,
  Stack, Typography, TextField
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Field, FieldArray, Form, FormikProvider, useFormik } from 'formik';
import { AgGridReact } from 'ag-grid-react'
import { useSnackbar } from 'notistack5';
import { isArray, isEmpty } from 'lodash';
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
import { fDate, fTime } from '../../utils/formatTime';
import useSettings from '../../hooks/useSettings';





// ----------------------------------------------------------------------

WorkFormRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  // currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

const pageCode = 'menu.masterData.production.planningMasterData.timeManagement.workCalendar';
const tableCode = 'WorkFormRegistrationForm';

export default function WorkFormRegistrationForm({ isEdit, isWorkFormNo, workFormNo, currentData, onCancel, onLoadData, currentField }) {
  const dispatch = useDispatch();
  const { themeAgGridClass } = useSettings();
  const { translate, currentLang } = useLocales();
  const { materialDropdown } = useSelector((state) => state.materialMaster);
  const { searchParams } = useSelector((state) => state.workCalendarManagement )
  const { typeCommon, shiftCommon } = useSelector((state) => state.common);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { commonDropdown, userGridConfig, funcPermission } = useAuth();
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [getValueLineCode, setValueLineCode] = useState('')
  const [materialCode, setMaterialCode] = useState({
    value: "",
    label: ""
  });
  const [dataAPI, setDataAPI] = useState([]) 
  const [selectedShift, setSelectedShift] = useState('')
  const [indexDetailRemove, setIndexDetailRemove] = useState([])
  const [countType, setCountType] = useState(1)
  const [valueFormik, setValueFormik] = useState({})
  const [detailTime, setDetailTime] = useState('')
  // const [rowDataFields, setRowDataFields] = useState([
  //   {type: '', startTime: '', endTime: '' },
  // ]);
  const [dataRow, setDataRow] = useState([])
  const [listShift, setListShif] = useState(isEdit ? currentData.map(e => ({
    workingTime: e.workingTime,
    restTime: e.restTime,
    overTime: e.overTime,
    sumShift: e.workFormSummarys
    })) : [])
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [shift, setShift] = useState('');
  const [selectedLength, setSelectedLength] = useState(0);
  const [sumObject, setSumObject] = useState({})
  const [action, setAction] = useState('')
  const [listShiftModify, setListShiftModify] = useState(isEdit ? currentData.map(e => ({
    ...e,
    sumShift: e.workFormSummarys
  })) : [])
  const [modifyFormik, setModifyFormik] = useState({})
  const [detailTimeCurrent, setDetailTimeCurrent] = useState([])
  const [errorForm, setErrorForm] = useState([])
  const [detailTimeDeleted, setDetailTimeDeleted] = useState([])
  const [saveForm, setSaveForm] = useState(isEdit ? currentField.map(e => ({
    factory: e?.shiftInfo.pk.factoryCode,
    pk: e?.shiftInfo?.pk,
    workFormCode: e?.workForm.workFormNo,
    workFormName: e?.workForm.workFormName,
    shiftPk: e?.shiftInfo.factoryPk,
    shiftNo: e?.shiftInfo.shift.code,
    startTimeOfShift: e?.shiftInfo.startTime,
    endTimeOfShift: e?.shiftInfo.endTime,
    inputFields: e?.detailTime.map(e => ({
      ...e,
      type: e.type.code
    })),
    state: e.state
  })): [])
 
  useEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);


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
    if(isEdit) {
      const data = []
      currentData.forEach(e => {
        e.workFormSummarys.forEach(el => {
          const tempData = {
              endRestTime: el.endRestTime,
              factory: el.pk.factoryName,
              finishTime: el.finnishTime,
              overTime: el.overTimeType,
              overTimeM: el.overTime,
              restTime: el.restTime,
              shift: {
                name: el.shift.name
              },
              startRestTime: el.startRestTime,
              startTime: el.startTime,
              workFormName: el.workFormName,
              workFormNo: el.workFormNo,
              workingTime: el.workingTime
          }
          data.push(tempData)
        })
      })
      setDataAPI(data)
    }
  }, [isEdit])
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
    if(listShift.length === 0) {
      setAction('Add')
    }
  }, [listShift])

  
  useEffect(() => {

    if (gridApi) {
      gridApi.forEachNode((node) => {
        if (shift !== '') {
          node.setSelected(node.data.shiftName === shift)
        } else {
          node.setSelected(false);
        }
      });
    }
  }, [shift, selectedLength])
  useEffect(() => {
    const data = []
    if(isEdit) {
      currentField.forEach(e => {
        e.detailTime.forEach(el => {
          data.push(el)
        })
      })
      setDetailTimeCurrent(data)
    }
  }, [isEdit, currentField])

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = (event) => {
    let shiftName = ''
    if(event.api.getSelectedNodes()[0]) {
      shiftName = event.api.getSelectedNodes()[0].data.shiftName;
    }
    const rowCount = event.api.getSelectedNodes().length ? event.api.getSelectedNodes().length : 0;
    const selectedLength = dataRow.filter((row) => row.shift === shiftName).length;
    
    if (rowCount === 0 || selectedLength > rowCount) {
      // dispatch(selectApproval(null));
      setAction('Add')
      setShift('');
      setSelectedLength(selectedLength);
      return;
    }
    if (rowCount === 1) {
      const selectShift = event.api.getSelectedNodes()[0].data;
      shiftName = selectShift.shiftName
      const getShift = shiftCommon.find(dd => dd.label === selectShift.shiftName).value
      const dataFormSelected = saveForm.find(dd => dd.shiftNo === getShift)
      const factory = commonDropdown.factoryDropdown.find(dd => dd.label === selectShift.factory).value
      const {workFormName} = selectShift
      setSelectedShift(selectShift)
      
        setModifyFormik({
          startTimeOfShift: dataFormSelected.startTimeOfShift,
          endTimeOfShift: dataFormSelected.endTimeOfShift,
          inputFields: dataFormSelected.inputFields,
          workFormCode: selectShift.workFormNo,
          shiftNo: getShift,
          factory,
          workFormName,
          // inputFields: values.inputFields.map(dd => ({
          //   ...dd,
          //   type: dd.type.code
          // })),
        })
      
      // else {
      //   const currShift = shiftCommon.find(e => e.label === shiftName )
      //   const selectModifyShift = listShiftModify.find(e => e.shiftNo === currShift.value)
      //   setModifyFormik(selectModifyShift)
      // }
      setAction('Modify')
      setShift(shiftName);
    }
  }

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }
  const diffHour = (time1, time2) => {
    const today = new Date()
    const dateTime1 = new Date(`${fDate(today)}T${time1}`)
    const dateTime2 = new Date(`${fDate(today)}T${time2}`)
    if(dateTime2.getTime() < dateTime1.getTime()) {
      dateTime2.setHours(dateTime2.getHours() + 24)
    }
    return Math.abs(dateTime2.getTime() - dateTime1.getTime()) * 60 / 3600000
  }

  const handleAddShift = () => {
    const valuesExist = values.inputFields.map(e => (e.type))
    const multipleExist = values.inputFields.every(value => valuesExist?.includes(value.type))

    let check = true
    listShift.forEach(e => {
      const checkShift = e.sumShift[0].shift.name
      const  compareShift = shiftCommon.find(e => e.label === checkShift).value
      if(compareShift === values.shiftNo && action === 'Add') {
        check = false
      }

    })

    if(!check) {
      enqueueSnackbar('Shift Exist', {
        variant: 'error',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
    } else {
      if(action === 'Modify') {

        const getShift = shiftCommon.find(e => e.label === selectedShift.shiftName)
        const filterDataForm = saveForm.filter(e => e.shiftNo !== getShift.value)
        const selectSaveForm = saveForm.find(e => e.shiftNo === getShift.value)
        setSaveForm([...filterDataForm,{...values, shiftPk: selectSaveForm.shiftPk,  pk: selectSaveForm?.pk }])
      } else {
      
        setSaveForm([...saveForm,{...values, pk: {id: ''} }])
      }
  
      const handleProcess = () => {
        const data = []
        const shiftName = shiftCommon.find((e) => e.value === values.shiftNo)
        const factoryName = commonDropdown.factoryDropdown.find(e => e.value === values.factory) 
        let shift = {
          factory: factoryName.label ,
          workFormNo: values.workFormCode,
          workFormName: values.workFormName,
          shift: {
            name: shiftName && shiftName.label,
          },
          startTime: values.startTimeOfShift,      }
    
        values.inputFields.forEach((detail, index) => {
          if (detail.type === 'D045002' ) {
            shift.finishTime = detail.startTime
            shift.startRestTime = detail.startTime
            shift.endRestTime = detail.startTime
            shift.overTime = 'N'
            shift.workingTime = diffHour(shift.startTime, shift.finishTime);
            shift.restTime = 0;
            shift.overTimeM = 0;
            data.push(shift);
            const shiftOvertime = {
              factory: factoryName.label,
              workFormNo: values.workFormCode,
              shift: {
                name: shiftName && shiftName.label,
              },
              workFormName: values.workFormName,
              overTime: 'Y',
              startTime: detail.startTime,
              finishTime: detail.endTime,
              startRestTime: detail.endTime,
              endRestTime: detail.endTime,
              workingTime: 0,
              restTime: 0,
              overTimeM: diffHour(detail.startTime, detail.endTime)
            }
            data.push(shiftOvertime);
          } 
          else if(detail.type === 'D045001' && (index === values.inputFields.length - 1 )  ) {
            shift.overTime = 'N';
            shift.finishTime = values.endTimeOfShift;
            shift.startRestTime = detail.startTime;
            shift.endRestTime = detail.endTime;
            shift.workingTime = diffHour(shift.startTime, shift.finishTime) - diffHour(shift.startRestTime, shift.endRestTime);
            shift.restTime = diffHour(shift.startRestTime, shift.endRestTime);
            shift.overTimeM = 0;
            data.push(shift);
            shift = {
              factory: factoryName.label,
              workFormNo: values.workFormCode,
              workFormName: values.workFormName,
              shift: {
                name: shiftName && shiftName.label,
              },
              startTime: detail.endTime,
              // endTime: values.endTimeOfShift
            }
          }
          
          else  {
            shift.overTime = 'N';
            shift.finishTime = detail.endTime;
            shift.startRestTime = detail.startTime;
            shift.endRestTime = detail.endTime;
            shift.workingTime = diffHour(shift.startTime, shift.finishTime) - diffHour(shift.startRestTime, shift.endRestTime);
            shift.restTime = diffHour(shift.startRestTime, shift.endRestTime);
            shift.overTimeM = 0;
            data.push(shift);
            shift = {
              factory: factoryName.label,
              workFormNo: values.workFormCode,
              workFormName: values.workFormName,
              shift: {
                name: shiftName && shiftName.label,
              },
              startTime: detail.endTime,
              // endTime: values.endTimeOfShift
            }
          }
        });
        
        let sumRest = 0;
        let sumOver = 0;
        let sumWorkingTime = 0;
    
        data.forEach(e => {
          sumRest += e.restTime
          sumOver += e.overTimeM
          sumWorkingTime += e.workingTime
        });
        
    
    
        // if( isEdit && action === 'Modify') {
        //   const shift = shiftCommon.find(e => e.label === selectedShift.shiftName)
        //   const filterListShift = listShift.filter(e => e.sumShift[0].shift.name !== shift.label)       
        //   setListShif([...filterListShift, {
        //     workingTime: sumWorkingTime,
        //     restTime: sumRest,
        //     overTime: sumOver,
        //     sumShift: data
        //   }])
        //   setAction('Add')
        // }
    
        if( action === 'Modify') {
          const shift = shiftCommon.find(e => e.label === selectedShift.shiftName)
          const filterListShift = listShift.filter(e => e.sumShift[0].shift.name !== shift.label)
          const filterListShiftModify = listShiftModify.filter(e => e.shiftNo !== shift.value)
          const filterDataAPI = dataAPI.filter(e => e.shift.name !== shift.label)
          setDataAPI([...filterDataAPI, ...data])
          setListShif([...filterListShift, {
            workingTime: sumWorkingTime,
            restTime: sumRest,
            overTime: sumOver,
            sumShift: data
          }])
          setListShiftModify([...filterListShiftModify, values])
          setAction('Add')
        }
    
        
    
        if(action !== 'Modify') {
          setListShif([...listShift, {
            workingTime: sumWorkingTime,
            restTime: sumRest,
            overTime: sumOver,
            sumShift: data
          }])
          setListShiftModify([...listShiftModify,values])
          setDataAPI([...dataAPI, ...data])
        }
        
      
        resetForm()
      }
  
      if(isEmpty(errors)){
        if(errorForm.length !== 0) {
          errorForm.map(e => (
            enqueueSnackbar(e, {
              variant: 'error',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            })
          ))
          
        } else if(valuesExist.includes('D045002')) {
          if(values.inputFields[values.inputFields.length - 1].type === 'D045002') {
            handleProcess()
          } else {
            enqueueSnackbar('Overtime must be in last queue in detail time', {
              variant: 'error',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            })
          }
        } else {
          handleProcess()
        }
      } 
    }
    


    
  }

  const handleDelete = () => {
      if(!isEdit && action === 'Modify') {
        const shiftInDelete = shiftCommon.find(e => e.value === modifyFormik.shiftNo)
        const shiftModify = shiftCommon.find(e => e.label === shift )
        const filterListShift = listShift.filter(e => e.sumShift[0].shift.name !== shiftInDelete.label)
        const filterListModifyShift = listShiftModify.filter(e => e.shiftNo !== shiftModify.value)
        setListShif(filterListShift)
        // setListShiftModify(filterListModifyShift)
      } else if(isEdit && action === 'Modify') {
        const getShift = shiftCommon.find(e => e.label === selectedShift.shiftName)
        const filterForm = saveForm.filter(e => e.shiftNo !== getShift.value)
        const shiftInDelete = shiftCommon.find(e => e.value === modifyFormik.shiftNo)
        const shiftModify = shiftCommon.find(e => e.label === shift )
        const filterListShift = listShift.filter(e => e.sumShift[0].shift.name !== getShift.label)
        const filterListModifyShift = listShiftModify.filter(e => e.shiftNo !== shiftModify.value)
        setListShif(filterListShift)
        setSaveForm(filterForm)
        // setListShiftModify(filterListModifyShift)
      }
  }

  useEffect(() => {
    const operationTimes = [];
    listShift.forEach((total) => {
      if (total?.sumShift) {
        const { sumShift } = total;
        const summaryDetails = sumShift.map((e) => (
            {
              factory: e.factory || e.pk.factoryName,
              workFormNo: e.workFormNo,
              workFormName: e.workFormName, 
              shiftName: e?.shift.name,
              overTime: e?.overTimeType || e?.overTime,
              shiftStartTime:  e.startTime ,
              finishTime: e.finishTime || e.finnishTime ,
              startRestTime:  e.startRestTime,
              endRestTime:  e.endRestTime,
              workingTime: e.workingTime,
              restTime: e.restTime,
              overTimeM: (isEdit ) ? e.overTime : e.overTimeM          
            }
        ));
        operationTimes.push(...summaryDetails);
      }
      operationTimes.push({
        factory: 'Sum',
        workFormNo: 'Sum',
        workFormName: 'Sum',
        shiftName: 'Sum',
        overTime: 'Sum',
        shiftStartTime: '',
        finishTime: '',
        startRestTime: '',
        endRestTime: '',
        workingTime: total?.workingTime,
        overTimeM: total?.overTime,
        restTime: total?.restTime
      });
    });
    
    setDataRow(operationTimes)
  },[listShift, isEdit])

  const handleError = () => {
    if(Object.values(errors).length === 0 || listShift.length !== 0) {
      handleOpenConfirmModal()
    } else {
      handleCloseConfirmModal()
    }
    
  }

  const handleRegisterUser = () => {
    formik.setSubmitting(true);
    const dataWorkFormSummary = (dataAPI.length !== 0) && dataAPI.map(ele => {
      const factory = commonDropdown.factoryDropdown.find(e => e.label === ele.factory )
      const shiftCode = shiftCommon.find(e => e.label === ele.shift.name)
      
      return {
        workFormNo: isEdit ? ele.workFormNo : '',
        workFormName: ele.workFormName,
        shift: {
          code: shiftCode.value,
        },
        overTimeType: ele.overTime,
        startTime: `${ele.startTime}`,
        finnishTime: ele.finishTime,
        startRestTime: `${ele.startRestTime}`,
        endRestTime: `${ele.endRestTime}`,
        workingTime: ele.workingTime,
        restTime: ele.restTime,
        overTime: ele.overTimeM
        
      }
    }) 
    if (!isEdit) {
      const data = listShiftModify.map(e => ({
        workForm: {
          pk: {
            factoryCode: e.factory
          },
          workFormNo: '',
          workFormName: e.workFormName
        },
        shiftInfo:{
          shift:{
              code: e.shiftNo
          },
          startTime: `${e.startTimeOfShift}`,
          endTime: `${e.endTimeOfShift}`
      },
      detailTime: e.inputFields.map(e => (
        {
        startTime: `${e.startTime}`,
        endTime: `${e.endTime}`,
        type: {
          code: e.type
        }}
      ))
      }))
      
      try {
        mutate({
          url: '/v1/work-form/create',
          data: {
            workFormRequests: data,
            workFormSummary: dataWorkFormSummary
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
              onLoadData(searchParams)
              onCancel();
              enqueueSnackbar('Work form was registered', {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
          }
        }).catch((error) => {
          formik.setSubmitting(false);
        });
      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    } else {
      try {

        let array = []

        saveForm.forEach(e => {
          if(detailTimeDeleted.length > 0) {
            detailTimeDeleted.forEach(el => {
              if(el.shift === e.shiftNo) {
                e.inputFields.push({
                  pk: el.pk,
                  state: el.state,
                  type: el.type.code,
                  startTime: el.startTime,
                  endTime: el.endTime
                })
                const tempArray = e.inputFields
                array = tempArray.map(ele => ({
                  pk: ele.pk,
                  state: ele.state,
                  type: {
                    code: ele.type
                  },
                  startTime: ele.startTime,
                  endTime: ele.endTime
                }))
              }
            })
          } else {
            array.push(...(e.inputFields.map(el => ({
              pk: el.pk,
              state: 'RUNNING',
              type: {
                code: el.type
              },
              startTime: el.startTime,
              endTime: el.endTime
            }))))
          }
        })
        // const valuesInputFields = [...(values.inputFields.map(e => ({
        //   ...e,
        //   type: {code: e.type.code},
        //   state: 'RUNNING',
        // }))), ...detailTimeDeleted]
        // const valuesInputFields = values.inputFields.map(e => ({
        //   ...e,
        //   type: { code: e.type}
        // }))
        // valuesInputFields.forEach(e => {
        //   if(e.pk.id !== '' ) {
        //     if(detailTimeCurrent.includes(e.pk.id)) {
        //       e.state = 'RUNNING'
        //     } else {
        //       e.state = 'DELETED'
        //     }
        //   } 
        //   e.state = 'RUNNING'
        // })
        mutate({
          url: `/v1/work-form/summary/delete?workFormNo=${values.workFormCode}`,
          method: 'delete',
          featureCode: 'user.delete'
        }).then((res) => {
          
        });
        const formUpdateDate = saveForm.map(e => ({
          workForm:{
            factoryPk: currentField[0].workForm.factoryPk,
            workFormName: e.workFormName,
        },
        shiftInfo:{
            factoryPk: e.shiftPk,
            shift:{
                code: e.shiftNo
            },
            startTime: e.startTimeOfShift,
            endTime: e.endTimeOfShift
        },
        detailTime: array
        
        }))
        mutate({
          url: '/v1/work-form/summary/create',
          data: {
            workFormSummary: dataWorkFormSummary
          },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.statusCode !== 'success') {
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
          } else if((res.statusCode === 'success')) {
            formik.resetForm();
            formik.setSubmitting(false);
            onLoadData(searchParams)
            setIsOpenConfirmModal(false);
            onCancel();
            enqueueSnackbar('Work form was Updated', {
              variant: 'success',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
        })

        mutate({
          url: '/v1/work-form/update',
          data: formUpdateDate,
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          // if (res.statusCode !== 'success') {
          //   if (res.data.message) {
          //     enqueueSnackbar(res.data.message, {
          //       variant: 'error',
          //       action: (key) => (
          //         <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          //           <Icon icon={closeFill} />
          //         </MIconButton>
          //       )
          //     });
          //   } 
          // } else if((res.statusCode === 'success')) {
          //   formik.resetForm();
          //   formik.setSubmitting(false);
          //   onLoadData(searchParams)
          //   setIsOpenConfirmModal(false);
          //   onCancel();
          //   enqueueSnackbar('Work form was Updated', {
          //     variant: 'success',
          //     action: (key) => (
          //       <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          //         <Icon icon={closeFill} />
          //       </MIconButton>
          //     )
          //   });
          // }
        }).catch((error) => {
          formik.setSubmitting(false);
          formik.setErrors(error);
        });

      } catch (error) {
        formik.setSubmitting(false);
        formik.setErrors(error);
      }
    }

  }

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    workFormCode: Yup.string().required('Work Form Code is required'),
    workFormName: Yup.string().required('Work Form Name is required'),
    shiftNo: Yup.string().required('Shift No is required'),
    startTimeOfShift: Yup.string().required('Start Time Of Shift is required'),
    endTimeOfShift: Yup.string().required('End Time Of Shift is required'),
    inputFields: Yup.array().of(
      Yup.object().shape({
          type: Yup.string()
              .required('Type is required'),
          startTime: Yup.string()
              .required('StartTime is required'),
          endTime: Yup.string()
              .required('EndTime is required')
      }))
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: ({
      factory: (isEdit && currentField[0].shiftInfo.pk.factoryCode) || (action === 'Modify' ? modifyFormik.factory : ''),
      workFormCode: (isEdit && isWorkFormNo) || (action === 'Modify' ? modifyFormik.workFormCode : 'AUTO GENERATE'),
      // workFormCode: '',
      workFormName: (isEdit && currentField[0].workForm.workFormName) || ( action === 'Modify' ? modifyFormik.workFormName : ''),
      shiftNo:  ((isEdit && action !== 'Modify') && currentField[0].shiftInfo.shift.code) || ( action === 'Modify' ? modifyFormik.shiftNo : ''),
      startTimeOfShift: ((isEdit && action !== 'Modify') && `${currentField[0].shiftInfo.startTime}` ) || ((action === 'Modify') ? modifyFormik.startTimeOfShift : ''),
      endTimeOfShift: ((isEdit && action !== 'Modify' ) && currentField[0].shiftInfo.endTime ) ||   ((action === 'Modify') ? modifyFormik.endTimeOfShift : ''),
      inputFields: ((isEdit && action !== 'Modify') && currentField[0].detailTime.map(e => ({
        startTime: e.startTime,
        endTime: e.endTime,
        state: e.state,
        pk: {factoryCode: e.pk.factoryCode, id: e.pk.id},
        type: e.type.code
      })) ) || ((action === 'Modify') ? modifyFormik.inputFields : [
          { type: '', startTime: '', endTime: ''  }
      ])
    }),
    validationSchema: MRPSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleAddShift()
        // setValuesForm({ ...values, id: currentData.id })
        // handleOpenConfirmModal();
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
                <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Work Form Info</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('factory')}
                    id="factory"
                    name="factory"
                    label='Factory'
                    disabled={action === 'Modify'}
                    required
                    onChange={(e) => {
                      setFieldValue('factory', e.target.value)
                    }}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=''
                    errorMessage={touched.factory && errors.factory}
                  />
                  <TextField
                    {...getFieldProps('workFormCode')}
                    id="workFormCode"
                    name="workFormCode"
                    label='Work Form Code'
                    // value='AUTO GENERATE'
                    disabled
                    fullWidth
                    required
                    // onChange={handleChange}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Work Form Name"
                    autoComplete="off"
                    fullWidth
                    disabled={action === 'Modify'}
                    {...getFieldProps('workFormName')}
                    error={Boolean(touched.workFormName && errors.workFormName)}
                    helperText={touched.workFormName && errors.workFormName}
                  />
                </Stack>
                <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Shift Info</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="shiftNo"
                    name="shiftNo"
                    label='Shift No'
                    required
                    groupId='D001000'
                    {...getFieldProps('shiftNo')}
                    errorMessage={touched.shiftNo && errors.shiftNo}
                  />
                  <TextField
                    id="startTimeOfShift"
                    type='time'
                    name="startTimeOfShift"
                    label="Start Time Of Shift"
                    autoComplete="off"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    inputProps={{
                      step: 60,
                    }}
                    value={values.startTimeOfShift}
                    onChange = {(e) => {
                      setFieldValue('startTimeOfShift', `${e.target.value}:00`)
                    }}
                    // {...getFieldProps('startTimeOfShift')}
                    
                    error={Boolean(touched.startTimeOfShift && errors.startTimeOfShift)}
                    helperText={touched.startTimeOfShift && errors.startTimeOfShift}
                  />
                  <TextField
                    id="endTimeOfShift"
                    type='time'
                    name="endTimeOfShift"
                    label="End Time Of Shift"
                    autoComplete="off"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    inputProps={{
                      step: 60,
                    }}
                    
                    {...getFieldProps('endTimeOfShift')}
                    onChange = {(e) => {
                      setFieldValue('endTimeOfShift',`${e.target.value}:00`)
                      const today = new Date()
                      const endTime = new Date(`${fDate(today)}T${e.target.value}`)
                      let check = true
                      values.inputFields.forEach(e => {
                        const end = new Date(`${fDate(today)}T${e.endTime}`)
                        if(endTime.getTime() < end.getTime()) {
                          check = false
                        }
                      })
                      if(!check) {
                        setErrorForm([...errorForm,'Input End Time Of Shift Wrong Time'])
                      } else {
                        setErrorForm([])
                      }
                    }}
                    error={Boolean(touched.endTimeOfShift && errors.endTimeOfShift)}
                    helperText={touched.endTimeOfShift && errors.endTimeOfShift}
                  />
                </Stack>
                <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Detail Time</Typography>
                <FieldArray name='inputFields'>
                  {({ push, remove }) => (
                    <>
                      {
                        values.inputFields.map((element, index) => (
                          <Stack key={index}
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 3, sm: 2 }}
                          >
                            <Dropdown
                              id={`inputFields[${index}].type`}
                              name='type'
                              label='Type'
                              groupId='D045000'
                              required
                              onChange={(e) => {                                
                                setFieldValue(`inputFields[${index}].type`, e.target.value)
                              }}
                              value={values.inputFields[`${index}`].type }
                              
                              errorMessage={(touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].type) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].type)}
                            />
                            <TextField
                              id={`inputFields[${index}].startTime`}
                              name={`inputFields[${index}].startTime`}
                              label="Start Time"
                              type="time"
                              value={values.inputFields[`${index}`].startTime}
                              autoComplete="off"
                              fullWidth
                              InputLabelProps={{
                                shrink: true,
                              }}
                              required
                              inputProps={{
                                step: 60,
                              }}
                              onChange = {(e) => {
                                setFieldValue(`inputFields[${index}].startTime`, `${e.target.value}:00`)
                                const start = new Date(`2022-08-15T${e.target.value}`)
                                const end = new Date(`2022-08-15T${values.inputFields[index].endTime}`)
                                const startShift = new Date(`2022-08-15T${values.startTimeOfShift}`)
                                const endShift = new Date(`2022-08-15T${values.endTimeOfShift}`)
                                if((startShift.getTime() < endShift.getTime()) && (start.getTime() >= end.getTime())) {
                                    setErrorForm([...errorForm, 'End time of shift must be greater than start time'])
                                  }
                                else if((index === values.inputFields.length - 1) && end.getTime() > endShift.getTime()) {
                                  setErrorForm([...errorForm, 'You input wrong end time'])
                                }
                                else {
                                  setErrorForm([])
                                  
                                }                                        
                              }}
                              error={Boolean( (touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].startTime) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].startTime))}
                              helperText={(touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].startTime) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].startTime)}
                            />
                            <TextField
                              id={`inputFields[${index}].endTime`}
                              label="End Time"
                              type="time"
                              value={values.inputFields[`${index}`].endTime}
                              fullWidth
                              InputLabelProps={{
                                shrink: true,
                              }}
                              required
                              inputProps={{
                                step: 60,
                              }}
                              onChange = {(e) => {
                                setFieldValue(`inputFields[${index}].endTime`, `${e.target.value}:00`)
                                const end = new Date(`2022-08-15T${e.target.value}`)
                                const start = new Date(`2022-08-15T${values.inputFields[index].startTime}`) 
                                const startShift = new Date(`2022-08-15T${values.startTimeOfShift}`)
                                const endShift = new Date(`2022-08-15T${values.endTimeOfShift}`)
                                // const lastEndDetailTime = new Date(`2022-08-15T${values.endTimeOfShift}`) 
                                // if(end.getTime() <= start.getTime()) {
                                //   setErrorForm([...errorForm, 'Start time must be greater than start time of shift'])
                                // } 
                                // else
                                if((startShift.getTime() < endShift.getTime()) && (start.getTime() >= end.getTime())) {
                                  setErrorForm([...errorForm, 'End time of shift must be greater than start time'])
                                }
                                else if((index === values.inputFields.length - 1) && end.getTime() > endShift.getTime()) {
                                  setErrorForm([...errorForm, 'You input wrong end time'])
                                }
                                else {
                                  setErrorForm([])
                                }
                              }}
                              error={Boolean(((touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].endTime)) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].endTime))}
                              helperText={(touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].endTime) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].endTime)}
                              
                            />
                            <Stack direction='row' justifyContent="flex-start" sx={{ width: '50%' }}>
                              {
                                values.inputFields.length - 1 > 0 && (

                                  <Button onClick={() => {
                                    remove(index)
                                    if(values.inputFields[index].pk.id !== '') {
                                      setIndexDetailRemove([...indexDetailRemove, index])
                                      setDetailTimeDeleted([...detailTimeDeleted, {
                                        type: {code: values.inputFields[index].type}, 
                                        startTime: values.inputFields[index].startTime,
                                        endTime: values.inputFields[index].endTime,
                                        state: 'DELETED',
                                        pk: values.inputFields[index].pk,
                                        shift: values.shiftNo
                                      }])
                                    }
                                  }}>
                                    <RemoveIcon fontSize="medium" />
                                  </Button>
                                )
                              }
                              
                            {
                                (index === values.inputFields.length - 1) && (
                                  <Button onClick={() => push({ type: '', startTime: '', endTime: '', state: 'RUNNING', pk: { id: '', factoryCode: values.factory }  })}>
                                    <AddIcon fontSize='medium' />
                                  </Button>
                                )
                              }                             
                                  
                            </Stack>
                          </Stack>
                        ))
                      }
                    </>
                  )}
                </FieldArray>
              </Stack>
            </Card>
            <Card sx={{ py: 1 }}>
              <Stack justifyContent="flex-end" sx={{mr: action ==='Modify' ? '0' : '10px'} } direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                <Button type="submit" variant='outlined'>{action==='Modify' ? 'Modify' : 'Add'}</Button>
                {
                  action === 'Modify' && <Button variant='outlined'onClick={action==='Modify' && handleDelete} >Delete</Button>
                }
              </Stack>
            </Card>
            <Card sx={{ px: 1, py: 2, height: 400 }}>
              <AgGrid
                columns={columns}
                rowData={dataRow}
                
                className={themeAgGridClass}
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
                rowSelection="multiple"
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
          <LoadingButton variant="contained" loading={isSubmitting} loadingIndicator="Loading..." onClick={handleError}>{isEdit ? 'Modify' : 'Register'}</LoadingButton>
        </DialogActions>
        <DialogAnimate title="Confirm" maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? 'modify' : 'register'}?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              Cancel
            </Button>
            <LoadingButton type="button" variant="contained" onClick={handleRegisterUser} loading={isSubmitting}>
              {isEdit ? 'Modify' : 'Register'}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
      </Form>
    </FormikProvider >
  );
}
