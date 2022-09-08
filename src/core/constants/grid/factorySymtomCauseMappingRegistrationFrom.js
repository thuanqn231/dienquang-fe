import { defaultColDef } from './defaultColDef';
import { defaultFactoryFields } from './defaultFactoryFields';
import { defaultAuditFields } from './defaultAuditFields';

export const factorySymtomCauseMappingRegistrationForm = [
  ...defaultFactoryFields,
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'productGroup',
    // tooltipField: 'equipmentID.equipmentLine.name',
    headerName: 'Product Group',
    width: 120,
    colId: 'productGroup',
    pinned: 'left'
  },

  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'processTypeName',
    // tooltipField: 'equipmentID.equipmentProcess.name.name',
    headerName: 'Process Type Name',
    width: 120,
    colId: 'processTypeName',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'processName',
    // tooltipField: 'equipmentID.equipmentWorkStation.name',
    headerName: 'Process Name',
    width: 120,
    colId: 'processName',
    pinned: 'left'
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'symptClassCode',
    // tooltipField: 'equipmentID.code',
    headerName: 'Symptom Class Code',
    width: 120,
    colId: 'symptClassCode',
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'symptClassName',
    // tooltipField: 'equipmentID.name',
    headerName: 'Symptom Class Name',
    width: 120,
    colId: 'symptClassName',
  },
  {
    ...defaultColDef,
    suppressMovable: true,
    field: 'defectSymptCode',
    // tooltipField: 'code',
    headerName: 'Symptom Code',
    width: 120,
    colId: 'defectSymptCode',
  },
  {
    ...defaultColDef,
    field: 'defectSymptName',
    // tooltipField: 'pmStartDate',
    headerName: 'Symptom Name',
    width: 120,
    colId: 'defectSymptName'
  },
  {
    ...defaultColDef,
    field: 'level',
    // tooltipField: 'pmType.name',
    headerName: 'Defect Level',
    width: 120,
    colId: 'level'
  },
  {
    ...defaultColDef,
    field: 'defectCausesCode',
    // tooltipField: 'pmCycle.name',
    headerName: 'Cause Code',
    width: 120,
    colId: 'defectCausesCode'
  },
  {
    ...defaultColDef,
    field: 'defectCausesName',
    // tooltipField: 'noticeYN',
    headerName: 'Cause Name',
    width: 120,
    colId: 'defectCausesName'
  },
  {
    ...defaultColDef,
    field: 'stateDefectCause',
    // tooltipField: 'noticeYN',
    headerName: 'User (Y/N)',
    width: 120,
    colId: 'stateDefectCause'
  },
];