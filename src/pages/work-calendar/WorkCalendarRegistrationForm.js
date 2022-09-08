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
import { endsWith, isArray, isEmpty } from 'lodash';
import PropTypes, { array, string } from 'prop-types';
import { useEffect, useRef, useState } from 'react';
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
// hooks
import useAuth from '../../hooks/useAuth';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { fDate, fTime } from '../../utils/formatTime';
import useSettings from '../../hooks/useSettings';





// ----------------------------------------------------------------------

WorkCalendarRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  // currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

const pageCode = 'menu.masterData.production.planningMasterData.timeManagement.workCalendar';
const tableCode = 'workCalendarFormGrid';

export default function WorkCalendarRegistrationForm({ isEdit, workFormNameOption, isWorkFormNo, workFormNo, currentData, onCancel, onLoadData, currentField }) {
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
  const [dataAPI, setDataAPI] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [valueFormik, setValueFormik] = useState({})
  const [detailTime, setDetailTime] = useState('')
  const [dataRow, setDataRow] = useState([])
  const [listShift, setListShif] = useState([])
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [shift, setShift] = useState('');
  const [selectedLength, setSelectedLength] = useState(0);
  const [sumObject, setSumObject] = useState({})
  const [action, setAction] = useState('')
  const [listShiftModify, setListShiftModify] = useState([])
  const [modifyFormik, setModifyFormik] = useState({})
  const [detailTimeCurrent, setDetailTimeCurrent] = useState(currentData[0]?.detailTime ? currentData[0]?.detailTime : '')
  const [errorForm, setErrorForm] = useState([])
  const [rowSelectShift, setRowSelectShift] = useState('')
  const [saveDataApply, setSaveDataApply] = useState({})
  const [listWorkDate, setListWorkDate] = useState([])
  const [listWorkCalendar, setListWorkCalendar] = useState([])
  const [listWorkCalendarItem, setListWorkCalendarItem] = useState([])
  const [listWorkForm, setListWorkForm] = useState([])
  const [listForm, setListForm] = useState([])
  const [indexDetailRemove, setIndexDetailRemove] = useState([])
  const [process, setProcess] = useState('')
  const [line, setLine] = useState('')
  const [saveForm, setSaveForm] = useState(isEdit ? [{
    factory: currentData[0]?.shiftInfo.pk.factoryCode,
    line: currentData[0]?.shiftInfo.workCalendar.process.line.factoryPk,
    workFormNo: currentData[0]?.workCalendar.workForm.workFormNo,
    workFormName: currentData[0]?.workCalendar.workForm.workFormNo,
    shiftInfo: currentData[0]?.shiftInfo.shift.code,
    fromDate: currentData[0]?.workCalendar.workDate,
    toDate: currentData[0]?.workCalendar.workDate,
    startTimeOfShift: fTime(currentData[0]?.shiftInfo.startTime),
    endTimeOfShift: fTime(currentData[0]?.shiftInfo.endTime),
    inputFields: currentData[0]?.detailTime
  }] : [])

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
    if(listShift.length === 0) {
      setAction('Add')
    }
  }, [listShift])
  
  useEffect(() => {

    if (gridApi) {
      gridApi.forEachNode((node) => {
        if (shift !== '' && process !== '' && line !== '') {
          node.setSelected(node.data.shiftName === shift && node.data.process === process && node.data.line === line )
        } else {
          node.setSelected(false);
        }
      });
    }
  }, [shift, selectedLength, process, line])

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = (event) => {
    let shiftName = ''
    let processName = ''
    let lineName = ''
    if(event.api.getSelectedNodes()[0]) {
      shiftName = event.api.getSelectedNodes()[0].data.shiftName;
      processName = event.api.getSelectedNodes()[0].data.process;
      lineName = event.api.getSelectedNodes()[0].data.line;
    }
    const rowCount = event.api.getSelectedNodes().length ? event.api.getSelectedNodes().length : 0;
    const selectedLength = dataRow.filter((row) => row.shift === shiftName).length;
    
    if (rowCount === 0 || selectedLength > rowCount) {
      // dispatch(selectApproval(null));
      setAction('Add')
      setShift('');
      setProcess('')
      setLine('')
      return;
    }
    if (rowCount === 1) {
      const selectShift = event.api.getSelectedNodes()[0].data;
      setRowSelectShift(selectShift)
      // const shiftCode = shiftCommon.find(e => e.label === selectShift.shiftName).value
      //   const processPk = commonDropdown.processDropdown.find(e => e.label === selectShift.process).factoryPk
      //   const linePk = commonDropdown.lineDropdown.find(e => e.label === selectShift.line)?.factoryPk
           
      if(isEdit) {
        const getShift = shiftCommon.find(e => e.label === selectShift.shiftName)?.value
        const list = listShiftModify.find(e => (new Date(e.fromDate)).getTime() <= (new Date(selectShift.workDate)).getTime() && (e.shiftNo === getShift) && (new Date(e.toDate)).getTime() >= (new Date(selectShift.workDate)).getTime())
  
        setModifyFormik({
          factory: list?.factory,
          line: list?.line,
          startTimeOfShift: list?.startTimeOfShift,
          endTimeOfShift: list?.endTimeOfShift,
          inputFields: list?.inputFields,
          // list.detailTime.map(e => ({
          //   ...e,
          //   type: e.type.code
          // })),
          shiftNo: list?.shiftNo,
          fromDate: selectShift?.workDate,
          toDate: selectShift?.workDate,
          workFormName: list?.workFormNo
        })
      } else {
        // const today = new Date()
        // const dateFrom = new Date (`${fDate(today)}`)
        // const dateTo = new Date (`${fDate(today)}`)
        // const dateFrom = new Date (`${fDate(today)}`)
        const getShift = shiftCommon.find(e => e.label === selectShift.shiftName)?.value
        const list = listShiftModify.find(e => (new Date(e.fromDate)).getTime() <= (new Date(selectShift.workDate)).getTime() && (e.shiftNo === getShift) && (new Date(e.toDate)).getTime() >= (new Date(selectShift.workDate)).getTime())

        setModifyFormik({
          factory: list?.factory,
          line: list?.line,
          startTimeOfShift: list?.startTimeOfShift,
          endTimeOfShift: list?.endTimeOfShift,
          inputFields: list?.inputFields,
          // list.detailTime.map(e => ({
          //   ...e,
          //   type: e.type.code
          // })),
          shiftNo: list?.shiftNo,
          fromDate: selectShift?.workDate,
          toDate: selectShift?.workDate,
          workFormName: list?.workFormNo
        })
        // const currShift = shiftCommon.find(e => e.label === shiftName )
        // const selectModifyShift = listShiftModify.find(e => e.shiftNo === currShift.value)
        // setModifyFormik(selectModifyShift)
      }
      setAction('Modify')
      setShift(shiftName);
      setProcess(processName)
      setLine(lineName)

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
    let check = true
    listShift.forEach(e => {
      const from = new Date(e.sumShift[0].fromDate)
      const to = new Date(e.sumShift[0].toDate)
      const fromDate = new Date(values.fromDate)
      const toDate = new Date(values.toDate)
      const shifOfSumshift = e.sumShift[0].shiftName
      const shift = shiftCommon.find(e => e.label === shifOfSumshift).value
      if(shift === values.shiftNo && (from.getTime() >= fromDate.getTime() && fromDate.getTime() <= toDate.getTime() || to.getTime() >= fromDate.getTime() && to.getTime() <= toDate.getTime()) && action === 'Add') {
        check = false
          enqueueSnackbar('Shift exist', {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
      }
    })
    values.inputFields.forEach((e, index) => {
      const today = new Date()
      const start = new Date(`${fDate(today)}T${e.startTime}`)
      const end = new Date(`${fDate(today)}T${e.endTime}`)
      const startShift = new Date(`${fDate(today)}T${values.startTimeOfShift}`)
      const endShift = new Date(`${fDate(today)}T${values.endTimeOfShift}`)

      if(values.startTimeOfShift < values.endTimeOfShift) {
        if(start.getTime() <= startShift.getTime() || end.getTime() > endShift.getTime()) {
          check = false
          enqueueSnackbar('You input wrong detail time', {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
        if(index > 0) {
          const preStart = new Date(`${fDate(today)}T${values.inputFields[index-1].startTime}`)
          const preEnd = new Date(`${fDate(today)}T${values.inputFields[index-1].endTime}`)
          if(preStart.getTime() > start.getTime() || preEnd.getTime() > end.getTime()) {
            check = false
            enqueueSnackbar('You input wrong detail time', {
              variant: 'error',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
        }
      } else if(values.startTimeOfShift > values.endTimeOfShift) {
        endShift.setDate(endShift.getDate() + 1)
        if(start.getTime() < startShift.getTime() && start.getTime() > endShift.getTime()) {
          check = false
          enqueueSnackbar('You input wrong detail time', {
            variant: 'error',
            action: (key) => (
              <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                <Icon icon={closeFill} />
              </MIconButton>
            )
          });
        }
        if(start.getTime() < startShift.getTime()) {
          start.setDate(start.getDate() + 1)
          if(start.getTime() > endShift.getTime()) {
            check = false
            enqueueSnackbar('You input wrong detail time', {
              variant: 'error',
              action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                  <Icon icon={closeFill} />
                </MIconButton>
              )
            });
          }
          if(end.getTime() > endShift.getTime()) {
            end.setDate(end.getDate() + 1)
            if(end.getTime() < startShift.getTime()) {
              check = false
              enqueueSnackbar('You input wrong detail time', {
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
      }
    })
    
    if(check) {
    if(action !== 'Modify') {
      setListShiftModify([values])
      setListForm([...listForm, {
        factory: values.factory,
        line: values.line,
        workFormName: values.workFormName,
        fromDate: values.fromDate,
        toDate: values.toDate,
        workFormNo: values.workFormNo,
        shiftNo: values.shiftNo,
        startTime: values.startTimeOfShift,
        endTime: values.endTimeOfShift,
        detailTime: values.inputFields
      }])
    } 
    else {
      const shiftCode = shiftCommon.find(e => e.label === rowSelectShift.shiftName).value
      const processPk = commonDropdown.processDropdown.find(e => e.label === rowSelectShift.process)?.value
      const linePk = commonDropdown.lineDropdown.find(e => e.code === rowSelectShift.line)?.value
      const date = rowSelectShift.workDate
      const list = listForm.filter(e => e.shiftNo !== shiftCode && e.line !== linePk)
      setListForm([...list, {
        factory: values.factory,
        line: values.line,
        workFormName: values.workFormName,
        fromDate: values.fromDate,
        toDate: values.toDate,
        workFormNo: values.workFormNo,
        shiftNo: values.shiftNo,
        startTime: values.startTimeOfShift,
        endTime: values.endTimeOfShift,
        detailTime: values.inputFields
      }])
    }

    const valuesExist = values.inputFields.map(e => (e.type))
    const multipleExist = values.inputFields.every(value => valuesExist?.includes(value.type))
    
    const handleProcess = () => {
      const data = []
      const shiftName = shiftCommon.find((e) => e.value === values.shiftNo)
      const factoryName = commonDropdown.factoryDropdown.find(e => e.value === values.factory) 
      let shift = {
        factory: factoryName.label,
        fromDate: values.fromDate,
        toDate: values.toDate,
        line: commonDropdown.lineDropdown.find(e => e.value === values.line).label,
        workFormNo: values.workFormCode,
        workFormName: values.workFormName,
        shiftName: shiftName && shiftName.label,
        startTime: values.startTimeOfShift,
      }
  
      values.inputFields.forEach((detail, index) => {
        if (detail.type === 'D045002') {
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
            line: commonDropdown.lineDropdown.find(e => e.value === values.line).label,
            workFormNo: values.workFormCode,
            shiftName: shiftName && shiftName.label,
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
        else if(detail.type === 'D045001' && index === values.inputFields.length - 1) {
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
            line: commonDropdown.lineDropdown.find(e => e.value === values.line).label,
            workFormNo: values.workFormCode,
            workFormName: values.workFormName,
            shiftName: shiftName && shiftName.label,
            startTime: detail.endTime
            // endTime: values.endTimeOfShift
          }
        } 
        else if(detail.type === 'D045001' && (index !== values.inputFields.length - 1 )) {
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
            line: commonDropdown.lineDropdown.find(e => e.value === values.line).label,
            workFormNo: values.workFormCode,
            workFormName: values.workFormName,
            shiftName: shiftName && shiftName.label,
            startTime: detail.endTime
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
  
  
      if( isEdit && action === 'Modify') {
        const shift = shiftCommon.find(e => e.value === modifyFormik.shiftNo)
        const filterListModifyShift = listShiftModify.filter(e => (new Date(e.fromDate)).getTime() > (new Date(rowSelectShift.workDate)).getTime() && (e.shiftNo !== shift.value) && (new Date(e.toDate)).getTime() < (new Date(rowSelectShift.workDate)).getTime())

        setListShiftModify([...filterListModifyShift, values])
        listShift.forEach(e => {
          if(e => e.sumShift[0].shiftName !== shift.label) {
            e.workingTime = sumWorkingTime
            e.overTime = sumOver
            e.restTime = sumRest
            e.sumShift = data
          }
        })

        setListShif([...listShift])
        setAction('Add')
      }
      
      if( !isEdit && action === 'Modify') {
        const shift = shiftCommon.find(e => e.label === rowSelectShift.shiftName)
        const filterListShift = listShift.filter(e => e.sumShift[0].shiftName !== shift.label)
        const filterListModifyShift = listShiftModify.filter(e => (new Date(e.fromDate)).getTime() > (new Date(rowSelectShift.workDate)).getTime() && (e.shiftNo !== shift.value) && (new Date(e.toDate)).getTime() < (new Date(rowSelectShift.workDate)).getTime())
        setListShiftModify([...filterListModifyShift, values])
        setListShif([...filterListShift, {
          workingTime: sumWorkingTime,
          restTime: sumRest,
          overTime: sumOver,
          sumShift: data
        }])
        setAction('Add')
      }
  
      setDataAPI([...data])
  
      if(action !== 'Modify') {
        setListShif([...listShift, {
          workingTime: sumWorkingTime,
          restTime: sumRest,
          overTime: sumOver,
          sumShift: data
        }])
      }
      // setListShiftModify([...listShiftModify,values])
    
      // resetForm()
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
        
      } else if(valuesExist?.includes('D045002')) {
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
      const shiftCode = shiftCommon.find(e => e.label === rowSelectShift.shiftName).value
      const processPk = commonDropdown.processDropdown.find(e => e.label === rowSelectShift.process)?.value
      const linePk = commonDropdown.lineDropdown.find(e => e.code === rowSelectShift.line)?.value
      const date = rowSelectShift.workDate


      if(!isEdit && action === 'Modify') {
        const shiftInDelete = shiftCommon.find(e => e.value === modifyFormik.shiftNo)
        const shiftModify = shiftCommon.find(e => e.label === shift )
        const filterListShift = listShift.filter(e => e.sumShift[0].shiftName !== shiftInDelete.label)
        const filterListModifyShift = listShiftModify.filter(e => e.shiftNo !== shiftModify.value)
        setListShif(filterListShift)
        // setListShiftModify(filterListModifyShift)
      } else if(isEdit && action === 'Modify') {
        const filterListShift = listShift.filter(e => e.sumShift[0].shiftName !== rowSelectShift.shiftName)
        setListShif(filterListShift)
        // setListShiftModify(filterListModifyShift)
      }
  }

  useEffect(() => {    
    const operationTimes = [];
    const listWorkCalendarTemp = []
    const listWorkCalendarItemTemp = []
    const finalYProcess = commonDropdown.processDropdown.filter(e => e.line === values.line).filter(el => el.finalYn !== null)
    listShift.forEach((total) => {
      const listDays = []
      const dateTo = new Date(total.sumShift[0].toDate);
      const dateFrom = new Date(total.sumShift[0].fromDate);

      const difference = dateTo.getTime() - dateFrom.getTime();

      const days = Math.ceil(difference / (1000 * 3600 * 24));
      if(days >= 0) {
        Array(days + 1).fill().forEach((e,index) => {
          const newDate = new Date(fDate(dateFrom))
          newDate.setDate(newDate.getDate() + index)
          listDays.push(fDate(newDate))
        })
        
      }
      listDays.forEach(el => {
        if(finalYProcess.length !== 0) {
          finalYProcess.forEach(ele => {
            if (total?.sumShift) {
                    const { sumShift } = total;
                    const summaryDetails = sumShift.map((e) => {
                        const workCalendar = {
                          workCalendar: {
                            pk: {
                              factoryCode: values.factory
                            },
                              workDate: el,
                              process: {
                                factoryPk: ele.value,
                              },
                              workForm: {
                                factoryPk: workFormNameOption.find(e => e.value === values.workFormName)?.factoryPk
                              }
                          },
                          endWorkTime: values.toDate,
                          shiftInfo: {
                            shift: {
                              code: values.shiftNo,
                            },
                            startTime: e.startTime,
                            endTime: e.finishTime
                          },
                          overTimeType: e.overTime,
                          workTime: e.workingTime,
                          restTime: e.restTime,
                          overTime: e.overTimeM,
                          startRestTime: e.startRestTime,
                          endRestTime: e.endRestTime,
                          detailTime: values.inputFields.map(e => ({
                            startTime: e.startTime,
                            endTime: e.endTime,
                            type: {
                              code: e.type
                            },
                          }))
                        }
                        const workCalendarItem = {
                          workDate: el,
                          overTimeType: e.overTime,
                          startTime: e.startTime,
                          endTime: e.finishTime,
                          startRestTime: e.startRestTime,
                          endRestTime: e.endRestTime,
                          workTime: e.workingTime,
                          restTime: e.restTime,
                          overTime: e.overTimeM,
                          shift: {
                            code: shiftCommon.find(el => el.label === e.shiftName).value
                          },
                          process: {
                            factoryPk: ele.value,
                            line: {
                              factoryPk: commonDropdown.lineDropdown.find(element => element.label === e.line)?.value
                            }
                          }
                        }                   
                        listWorkCalendarTemp.push(workCalendar)
                        listWorkCalendarItemTemp.push(workCalendarItem)
                       return {
                        factory: e.factory || e.pk.factoryName,
                        line: e.line,
                        final: 'Y',
                        process: ele.label,
                        workDate: el,
                        shiftName: e.shiftName || e.shift.name,
                        overTime: e.overTime,
                        shiftStartTime: e.startTime,
                        finishTime: e.finishTime,
                        startRestTime: e.startRestTime,
                        endRestTime: e.endRestTime,
                        workingTime: e.workingTime,
                        restTime: e.restTime,
                        overTimeM: e.overTimeM 
                      }
                    });
                    operationTimes.push(...summaryDetails);
                    setListWorkCalendar(listWorkCalendarTemp)
                    setListWorkCalendarItem(listWorkCalendarItemTemp)
                    
                  }

                  operationTimes.push({
                    factory: 'Sum',
                    shiftName: '',
                    workDate: 'Sum',
                    line: 'Sum',
                    overTime: '',
                    process: 'Sum',
                    final: 'Sum',
                    shiftStartTime: '',
                    finishTime: '',
                    startRestTime: '',
                    endRestTime: '',
                    workingTime: total?.workingTime,
                    overTimeM: total?.overTime,
                    restTime: total?.restTime
                  });
          })
        }
      })

    });

    setDataRow(operationTimes)
  },[listShift, isEdit])


  const handleError = () => {
    if(Object.values(errors).length === 0 || listShift.lengpth !== 0) {
      handleOpenConfirmModal()
    } else {
      handleCloseConfirmModal()
    }
    
  }

  const handleApply = () => {
    query({
      url: '/v1/work-calendar/load-work-form',
      featureCode: 'user.create',
      method: 'GET',
      params: {
        workFormNo: values.workFormName,
        pk: {
          factoryCode: values.factory
        }
      }
    })
      .then((res) => {
        setListWorkForm(res.data)
        // setModifyFormik({
        //   shiftNo: (res.data)[0].shiftInfo.shift.code,
        //   startTimeOfShift: (res.data)[0].shiftInfo.startTime,
        //   endTimeOfShift: (res.data)[0].shiftInfo.endTime,
        //   inputFields: (res.data)[0].detailTime.map(e => ({
        //     ...e,
        //     type: e.type.code
        //   }))
        // })
        // setAction('Apply')
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const handleRegisterUser = () => {
    
    const processPk = commonDropdown.processDropdown.filter(e => e.line === values.line)
    let workCalendarAPI = []
    let startDayTime
    let endDayTime
    let detailTimeDate
    listForm.forEach(e => {

      const from = new Date(`2022-08-15T${e.startTime}`)
      const to = new Date(`2022-08-15T${e.endTime}`)
      
      detailTimeDate = e.detailTime.map(ele => {
        const startTimeShift = new Date(`2022-08-15T${e.startTime}`)
        const start = new Date(`2022-08-15T${ele.startTime}`)
        const end = new Date(`2022-08-15T${ele.endTime}`)
        let startDetail 
        let endDetail
        if(start.getTime() <= startTimeShift.getTime()) {
          const dayTime = new Date(e.fromDate)
          dayTime.setDate(dayTime.getDay() + 1)
          startDetail = new Date(`${fDate(dayTime)}T${ele.startTime}`)
        } else {
          startDetail = new Date(`${e.fromDate}T${ele.startTime}`)
        }
        if(end.getTime() <= startTimeShift.getTime()) {
          const dayTime = new Date(e.fromDate)
          dayTime.setDate(dayTime.getDay() + 1)
          startDetail = new Date(`${fDate(dayTime)}T${ele.startTime}`)
        } else {
          endDetail = new Date(`${e.fromDate}T${ele.endTime}`)
        }

        return {
          pk: ele.pk,
          startTime: startDetail,
          type: {
            code: ele.type
          },
          endTime: endDetail,
          state: 'RUNNING'
        }
      }
      )
  
      if(to.getTime() <= from.getTime()) {
        startDayTime = new Date(`${e.fromDate}T${e.startTime}`)
        const endDay = new Date(e.fromDate) 
        endDay.setDate(endDay.getDate() + 1)
        endDayTime = new Date(`${fDate(endDay)}T${e.endTime}`)        
      } else {
        startDayTime = new Date(`${e.fromDate}T${e.startTime}`)
        endDayTime = new Date(`${e.fromDate}T${e.endTime}`)
      }
      
      const process = commonDropdown.processDropdown.filter(el => el.line === e.line)
      workCalendarAPI = process.map(el => ({
        workCalendar: {
          pk: {
            factoryCode: e.factory
          },
          process: {
            factoryPk: el.value
          },
          workDate: e.fromDate,
          workForm: {
            factoryPk: workFormNameOption.find(ele => ele.value === e.workFormName).factoryPk
          }          
        },
        endWorkTime: e.toDate,
            shiftInfo:{
                shift: { code: e.shiftNo },
                startTime: startDayTime,
                endTime: endDayTime
            },
            detailTime: detailTimeDate
      })
       )
    })
    if (!isEdit) {
      try {
        mutate({
          url: '/v1/work-calendar/create',
          data: 
          {
            workCalendarRequests: workCalendarAPI,
            workCalendarItem: listWorkCalendarItem
        },
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            if (res.statusCode === 'success') {
              formik.resetForm();
              formik.setSubmitting(false);
              setIsOpenConfirmModal(false);
              onLoadData(searchParams)
              setListForm([])
              onCancel();
              enqueueSnackbar(translate('Work Calendar Was Registered'), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
            else {
              enqueueSnackbar(res.data.message, {
                variant: 'error',
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
    } 
    else {
      const filterDelDetail = []
      if(isArray(indexDetailRemove)) {
        detailTimeCurrent.forEach((e,index)=> {
          indexDetailRemove.forEach(el => {
            if(el === index) {
              e.state = 'DELETED'
              filterDelDetail.push(e)
            } 
            
          })
        })
      }
      
      const detailTimeList = [...detailTimeDate, ...filterDelDetail]
      // values.inputFields.forEach(e => {
      //   if(e.pk.id === '') {
          
      //     detailTimeList.push({
      //       ...e,
      //       type: {
      //         code: e.type
      //       }
      //     })
      //   }
      // })
      const currentWorkFormPk = workFormNameOption.find(e => e.value === currentData[0].shiftInfo.workCalendar.workForm.workFormNo).value
      const indexState = []
      currentData[0].detailTime.forEach((e, index) => {
        if(e.state === 'RUNNING') {
          indexState.push(index)
        }
      })
      const dataWorkCalendar = listShift.map(e => ({
        workCalendar:{
          pk:{
              id: currentData[0].workCalendar.pk.id,
              factoryCode: currentData[0].workCalendar.pk.factoryCode
          },
          workDate: currentData[0].workCalendar.workDate,
          process:{
              factoryPk: currentData[0].shiftInfo.workCalendar.process.factoryPk
          },
          workForm:{
              factoryPk: workFormNameOption.find(e => e.value === values.workFormName).factoryPk
          },
          state: 'RUNNING'
      },
      endWorkTime: values.toDate,
      shiftInfo:{
          pk:{
            id: currentData[0].shiftInfo.pk.id,
            factoryCode: currentData[0].shiftInfo.pk.factoryCode
          },
          shift:{
              code: values.shiftNo
          },
          startTime: startDayTime,
          endTime: endDayTime,
          state: 'RUNNING'
      },
      detailTime: detailTimeList
      }))
      const dataSumary = listWorkCalendar.map(e => ({
        workDate: values.fromDate,
        shift:{
            code: values.shiftNo
        },
        process:{
            factoryPk: e.workCalendar.process.factoryPk,
            line:{
                factoryPk: values.line
            }
        },
            overTimeType: e.overTimeType,
            startTime: e.shiftInfo.startTime,
            endTime: e.shiftInfo.endTime,
            startRestTime: e.startRestTime,
            endRestTime: e.endRestTime,
            workTime: e.workTime,
            restTime: e.restTime,
            overTime: e.overTime
      }))

      try {
        mutate({
          url: '/v1/work-calendar/update',
          data: dataWorkCalendar,
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          
        })
        mutate({
          url: '/v1/work-calendar/summary/update',
          data: dataSumary,
          method: 'post',
          featureCode: 'user.create'
        }).then((res) => {
          if (res.httpStatusCode === 200) {
            if (res.statusCode === 'success') {
              formik.resetForm();
              formik.setSubmitting(false);
              setIsOpenConfirmModal(false);
              onLoadData(searchParams)
              onCancel();
              enqueueSnackbar(translate('Work Calendar Was Registered'), {
                variant: 'success',
                action: (key) => (
                  <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                  </MIconButton>
                )
              });
            }
            else {
              enqueueSnackbar(res.data.message, {
                variant: 'error',
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
      }
  }

  const MRPSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    // workFormNo: Yup.string().required('Work Form Code is required'),
    // workFormName: Yup.string().required('Work Form Name is required'),
    shiftNo: Yup.string().required('Shift No is required'),
    startTimeOfShift: Yup.string().required('Start Time Of Shift is required'),
    endTimeOfShift: Yup.string().required('End Time Of Shift is required'),
    line: Yup.string().required('Line is required'),
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
  const today = new Date()
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: ({
      factory: ((isEdit) && currentData[0]?.shiftInfo.pk.factoryCode ) || ((action === 'Modify') && modifyFormik.factory ||''),
      line: (isEdit && currentData[0]?.workCalendar.process.line.factoryPk ) || (action === 'Modify' && modifyFormik.line ||''),
      fromDate: (isEdit && currentData[0]?.workCalendar.workDate ) || (action === 'Modify' && modifyFormik.fromDate || fDate(today)),
      toDate: (isEdit && currentData[0]?.workCalendar.workDate ) || (action === 'Modify' && modifyFormik.toDate || fDate(today)),
      workFormNo: (isEdit && currentData[0]?.workCalendar.workForm.workFormNo ) ||  (action === 'Modify' && modifyFormik.workFormName),
      workFormName: (isEdit && currentData[0]?.workCalendar.workForm.workFormNo ) ||  (action === 'Modify' && modifyFormik.workFormName),
      shiftNo:  (isEdit && currentData[0]?.shiftInfo.shift.code ) || ((action === 'Modify') ? modifyFormik.shiftNo : ''),
      startTimeOfShift: ((isEdit && action !== 'Modify') && fTime(currentData[0]?.shiftInfo.startTime) ) || (action === 'Modify' ? modifyFormik.startTimeOfShift : ''),
      endTimeOfShift: (isEdit && fTime(currentData[0]?.shiftInfo.endTime) ) || ((action === 'Modify') ? modifyFormik.endTimeOfShift : ''),
      inputFields: (isEdit && currentData[0]?.detailTime.map(e => ({
        ...e,
        startTime: fTime(e.startTime),
        endTime: fTime(e.endTime),
        type: e.type.code
      })) ) || ((action === 'Modify' ? modifyFormik.inputFields : [
          { type: '', startTime: '', endTime: '', state:'RUNNING',  }
      ]))
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
                <Stack direction='row' justifyContent='space-between'e spacing={{ xs: 3, sm: 2 }} >
                 <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Calendar Info</Typography>
                 <Button variant='outlined' onClick={handleApply}>Apply</Button>
                </Stack>
                <Stack spacing={{ xs: 3, sm: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }} >
                        <Dropdown
                            {...getFieldProps('factory')}
                            id="factory"
                            name="factory"
                            label='Factory'
                            disabled={isEdit}
                            required
                            onChange={(e) => {
                            setSaveDataApply({...saveDataApply, factory: e.target.value})
                            setFieldValue('factory', e.target.value)
                            setFieldValue(`inputFields[0].pk.factoryCode`, e.target.value)
                            }}
                            // value={action === 'Apply' && saveDataApply.factory }
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
                            setSaveDataApply({...saveDataApply, line:e.target.value})
                            setFieldValue('line', e.target.value)
                            }}
                            options={commonDropdown.lineDropdown.filter(dd => dd.factory === values.factory)}
                            defaultValue=''
                            errorMessage={touched.line && errors.line}
                        />
                        <Dropdown
                            {...getFieldProps('workFormName')}
                            id="workFormName"
                            name="workFormName"
                            label='Work Form Name'
                            // disabled={action === 'Modify'}
                            value={values.workFormName}
                            required
                            onChange={(e) => {
                            setSaveDataApply({...saveDataApply, workFormName:e.target.value})
                            setFieldValue('workFormName', e.target.value)
                            setFieldValue('workFormNo', e.target.value)
                            }}
                            options={workFormNameOption}
                            errorMessage={touched.workFormName && errors.workFormName}
                        />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                            <DthDatePicker
                            id='fromDate'
                            name="fromDate"
                            label="From Date"
                            defaultValue=''
                            value={values.fromDate}
                            onChange={(value) => {
                              setFieldValue('fromDate', fDate(value))
                              setSaveDataApply({...saveDataApply, fromDate: fDate(value)})
                            }}
                            disabled={isEdit}
                            fullWidth                    
                            />
                            <DthDatePicker
                            id='toDate'
                            name="toDate"
                            label="To Date"
                            value={values.toDate}
                            onChange={(value) =>{
                              setFieldValue('toDate', fDate(value))
                              setSaveDataApply({...saveDataApply, toDate: fDate(value)})
                            }}
                            // {...getFieldProps('toDate')}
                            disabled={isEdit}
                            sx={{ my: 1 }}
                            fullWidth
                            />
                        <TextField
                            {...getFieldProps('workFormNo')}
                            id="workFormNo"
                            name="workFormNo"
                            label='Work Form No'
                            value={values.workFormNo ? values.workFormNo : ''}
                            disabled
                            fullWidth
                            required
                            // onChange={handleChange}
                        />
                        </Stack>
                    </Stack>
                <Typography sx={{ textDecoration: 'underline', mb: 1 }}>Shift Info</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="shiftNo"
                    name="shiftNo"
                    label='Shift No'
                    required
                    // disabled={isEdit}
                    groupId='D001000'
                    value={values.shiftNo}
                    options={isEdit && shiftCommon || (values.workFormName ? listWorkForm.map(e => ({
                      value: e?.shiftInfo.shift.code, label: e?.shiftInfo.shift.name
                    })) : shiftCommon) }
                    // {...getFieldProps('shiftNo')}
                    onChange={e=> {
                      setFieldValue('shiftNo', e.target.value)
                      const filterListInShift = listWorkForm.find(el => el.shiftInfo.shift.code === e.target.value)
                      if(filterListInShift) {
                        if(action !== 'Modify') {
                          setFieldValue('startTimeOfShift', filterListInShift.shiftInfo.startTime)
                          setFieldValue('endTimeOfShift', filterListInShift.shiftInfo.endTime)
                          setFieldValue('inputFields', filterListInShift.detailTime.map(e => ({
                            ...e,
                            type: e.type.code
                          })))
                          }
                      }
                    }}
                    errorMessage={touched.shiftNo && errors.shiftNo}
                  />
                  <TextField
                    id="startTimeOfShift"
                    type='time'
                    name="startTimeOfShift"
                    label="Start Time Of Shift"
                    autoComplete="off"
                    fullWidth
                    value={values.startTimeOfShift}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    inputProps={{
                      step: 60,
                    }}
                    onChange={e => setFieldValue('startTimeOfShift', `${e.target.value}:00`)}
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
                      setFieldValue('endTimeOfShift', `${e.target.value}:00`)
                      // if(e.target.value <= values.startTimeOfShift) {
                      //   setErrorForm([...errorForm, 'Start time of shift must be greater than end time of shift'])
                      // } else {
                      //   setErrorForm([])
                      // }
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
                            sx={{mb: 2}}
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
                              
                              errorMessage={touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].type && errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].type}
                            />
                            <TextField
                              id={`inputFields[${index}].startTime`}
                              label="Start Time"
                              type="time"
                              value={values.inputFields[`${index}`].startTime}
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
                                // const start = new Date(`2022-08-15T${e.target.value}`)
                                // const end = new Date(`2022-08-15T${values.inputFields[index].endTime}`)
                                // const startShift = new Date(`2022-08-15T${values.startTimeOfShift}`)
                                // const endShift = new Date(`2022-08-15T${values.endTimeOfShift}`)
                                // if(index > 0 && e.target.value <= values.inputFields[index - 1].startTime) {
                                //   setErrorForm([...errorForm, 'You input wrong start'])
                                // }
                                // else if(e.target.value <= values.startTimeOfShift) {
                                //   setErrorForm([...errorForm, 'Start time must be greater than start time of shift'])
                                // } else 
                                // if((startShift.getTime() < endShift.getTime()) && (start.getTime() >= end.getTime())) {
                                //   setErrorForm([...errorForm, 'End time of shift must be greater than start time'])
                                // }
                                // else if((index === values.inputFields.length - 1) && end.getTime() > endShift.getTime()) {
                                //   setErrorForm([...errorForm, 'You input wrong end time'])
                                // }
                                // else {
                                //   setErrorForm([])
                                  
                                // }                                
                              }}
                              // {...getFieldProps(`inputFields[${index}].startTime`)}
                              // error={Boolean((touched.inputFields?.length && touched.inputFields[index] && errors.inputFields[index].startTime) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].startTime))}
                              helperText={errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].startTime}
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
                                // const end = new Date(`2022-08-15T${e.target.value}`)
                                // const start = new Date(`2022-08-15T${values.inputFields[index].startTime}`) 
                                // const startShift = new Date(`2022-08-15T${values.startTimeOfShift}`)
                                // const endShift = new Date(`2022-08-15T${values.endTimeOfShift}`)
                                // // const lastEndDetailTime = new Date(`2022-08-15T${values.endTimeOfShift}`) 
                                
                                // if((startShift.getTime() < endShift.getTime()) && (start.getTime() >= end.getTime())) {
                                //   setErrorForm([...errorForm, 'End time of shift must be greater than start time'])
                                // }
                                // else if((index === values.inputFields.length - 1) && end.getTime() > endShift.getTime()) {
                                //   setErrorForm([...errorForm, 'You input wrong end time'])
                                // }
                                // else {
                                //   setErrorForm([])
                                  
                                // }     
                              }}
                              error={Boolean((touched.inputFields?.length && touched.inputFields[index] && touched.inputFields[index].endTime) && (errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].endTime))}
                              helperText={errors.inputFields?.length && errors.inputFields[index] && errors.inputFields[index].endTime}
                              
                            />
                            <Stack direction='row' justifyContent="flex-start" sx={{ width: '50%' }}>                             
                              {
                                values.inputFields.length - 1 > 0 && (
                                  <Button onClick={() => {
                                    remove(index)
                                    if(values.inputFields[index].pk.id !== '') {
                                      setIndexDetailRemove([...indexDetailRemove, index])
                                    }
                                    }}>
                                    <RemoveIcon fontSize="medium" />
                                  </Button>
                                )
                              }
                              {
                                index === values.inputFields.length - 1 && (
                                  <Button onClick={() => push({ type: '', startTime: '', endTime: '', state: 'RUNNING', pk: { factoryCode: values.factory }  })}>
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
                  action === 'Modify' && <Button variant='outlined' onClick={action==='Modify' && handleDelete} >Delete</Button>
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
          {/* onClick={handleError} */}
          <LoadingButton variant="contained" loading={isSubmitting} loadingIndicator="Loading..." onClick={() =>handleOpenConfirmModal()}>{isEdit ? 'Modify' : 'Register'}</LoadingButton>
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
