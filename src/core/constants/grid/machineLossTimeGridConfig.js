import { fDate } from '../../../utils/formatTime';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultColDef } from './defaultColDef';
import { defaultAuditFields } from './defaultAuditFields';

export const machineLossTimeGridConfig = [
  {
    ...defaultColDef,
    filter: false,
    suppressColumnsToolPanel: true,
    suppressMovable: true,
    sortable: false,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    maxWidth: 21,
    colId: '0',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.equipmentWorkStation.process.line.part.name',
    headerName: 'Part',
    colId: 'equipmentID.equipmentWorkStation.process.line.part.name',
    width: 150,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.equipmentWorkStation.process.line.name',
    headerName: 'Line',
    colId: 'equipmentID.equipmentWorkStation.process.line.name',
    width: 100,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.equipmentWorkStation.process.code',
    headerName: 'Process',
    colId: 'equipmentID.equipmentWorkStation.process.code',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'equipmentID.equipmentWorkStation.name',
    headerName: 'Work Station',
    colId: 'equipmentID.equipmentWorkStation.name',
    width: 120,
    pinned: 'left'
  },
  {
    ...defaultColDef,
    field: 'equipmentID.code',
    headerName: 'Equip ID Code',
    colId: 'equipmentID.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'equipmentID.name',
    headerName: 'Equip ID Name',
    colId: 'equipmentID.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossDate',
    headerName: 'Loss Date',
    colId: 'lossDate',
    width: 140
  },
  {
    ...defaultColDef,
    field: 'startTime',
    headerName: 'Loss Start Time',
    colId: 'startTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'endTime',
    headerName: 'Loss End Time',
    colId: 'endTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossTime',
    headerName: 'Loss Time (Min)',
    colId: 'lossTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossType.name',
    headerName: 'Loss Type',
    colId: 'lossType.name',
    width: 100
  },
  {
    ...defaultColDef,
    field: 'material.code',
    headerName: 'Model Code',
    colId: 'material.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'material.name',
    headerName: 'Model Name',
    colId: 'material.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'shift.name',
    headerName: 'Shift',
    colId: 'shift.name',
    width: 70
  },
  {
    ...defaultColDef,
    field: 'lossCause.lossMaster.classification.name',
    headerName: 'Loss Classification',
    colId: 'lossCause.lossMaster.classification.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossCause.lossMaster.lossCls.name',
    headerName: 'Loss Detail Cls',
    colId: 'lossCause.lossMaster.lossCls.name',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'lossCause.lossMaster.lossItem',
    headerName: 'Loss Item',
    colId: 'lossCause.lossMaster.lossItem',
    width: 160
  },
  {
    ...defaultColDef,
    field: 'lossCause.lossCause',
    headerName: 'Loss Cause',
    colId: 'lossCause.lossCause',
    width: 160
  },
  {
    ...defaultColDef,
    field: 'reason',
    headerName: 'Loss Detail Reason',
    colId: 'reason',
    width: 150
  },
  {
    ...defaultColDef,
    field: 'lossPic.user.fullName',
    headerName: 'Loss PIC',
    colId: 'lossPic.user.fullName',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossPic.user.department.name',
    headerName: 'Loss Dept',
    colId: 'lossPic.user.department.name',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'countermeasure',
    headerName: 'Countermeasure',
    colId: 'countermeasure',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'inputTime',
    headerName: 'CM Input Time',
    colId: 'inputTime',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'user.fullName',
    headerName: 'CM Input PIC',
    colId: 'user.fullName',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'user.code',
    headerName: 'CM Input PIC Code',
    colId: 'user.code',
    width: 120
  },
  {
    ...defaultColDef,
    field: 'lossCause.productivity',
    tooltipField: 'lossCause.productivity',
    headerName: 'Productivity Apply (Y/N)',
    cellClass: 'vertical-middle',
    colId: 'lossCause.productivity',
    width: 150
  },

  ...defaultAuditFields
];
